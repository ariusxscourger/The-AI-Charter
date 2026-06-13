import json
import os
import uuid
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from thenvoi_rest import RestClient, ChatMessageRequest
from thenvoi_rest.human_api_chats.types.create_my_chat_room_request_chat import CreateMyChatRoomRequestChat

class BandMessage:
    def __init__(self, role: str, type: str, content: Any, timestamp: Optional[str] = None):
        self.role = role
        self.type = type
        self.content = content
        self.timestamp = timestamp or datetime.utcnow().isoformat()

    @classmethod
    def from_sdk(cls, chat_message):
        timestamp = chat_message.inserted_at.isoformat() if chat_message.inserted_at else None
        try:
            parsed = json.loads(chat_message.content)
            if isinstance(parsed, dict) and "type" in parsed:
                return cls(
                    role=parsed.get("role"),
                    type=parsed.get("type"),
                    content=parsed.get("content"),
                    timestamp=timestamp
                )
        except Exception:
            pass
        
        # Fallback to plain text mapping
        return cls(
            role=chat_message.sender_name or chat_message.sender_id,
            type="text",
            content=chat_message.content,
            timestamp=timestamp
        )

# Global in-memory storage for mock fallback
_MOCK_ROOMS: Dict[str, str] = {}
_MOCK_MESSAGES: Dict[str, List[BandMessage]] = {}

class BandRooms:
    def __init__(self, client: RestClient, api_key: str):
        self.client = client
        self.api_key = api_key

    async def create(self, name: str):
        try:
            loop = asyncio.get_running_loop()
            
            if self.api_key.startswith("band_a_") or self.api_key.startswith("thnv_a_"):
                from thenvoi_rest import ChatRoomRequest, ParticipantRequest
                chat_req = ChatRoomRequest()
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.agent_api_chats.create_agent_chat(chat=chat_req)
                )
                
                # Add the human owner to the room immediately so they can see the messages and be mentioned
                user_id = os.environ.get("BAND_USER_ID")
                if user_id:
                    try:
                        participant = ParticipantRequest(participant_id=user_id, role="owner")
                        await loop.run_in_executor(
                            None,
                            lambda: self.client.agent_api_participants.add_agent_chat_participant(
                                chat_id=response.data.id, participant=participant
                            )
                        )
                    except Exception as add_err:
                        print(f"[WARN] Failed to add owner to room: {add_err}")
            else:
                chat_req = CreateMyChatRoomRequestChat(title=name)
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.human_api_chats.create_my_chat_room(chat=chat_req)
                )
            return response.data
        except Exception as e:
            # Fallback to Mock Room
            room_id = f"mock-room-{str(uuid.uuid4())[:8]}"
            _MOCK_ROOMS[room_id] = name
            _MOCK_MESSAGES[room_id] = []
            print(f"\n{os.environ.get('YELLOW', '')}[WARN] Band.ai API create failed ({e}). Falling back to local Mock Room: {room_id}{os.environ.get('RESET', '')}\n")
            
            # Struct mirroring SDK return
            class MockChatRoom:
                def __init__(self, rid):
                    self.id = rid
            return MockChatRoom(room_id)

    async def join(self, room_id: str, agent_id: str):
        pass

    async def post_message(self, room_id: str, role: str, type: str, content: Any):
        if room_id in _MOCK_MESSAGES:
            _MOCK_MESSAGES[room_id].append(BandMessage(role, type, content))
            return

        # Try real API
        try:
            serialized_payload = json.dumps({
                "role": role,
                "type": type,
                "content": content
            })
            loop = asyncio.get_running_loop()
            if self.api_key.startswith("band_a_") or self.api_key.startswith("thnv_a_"):
                from thenvoi_rest import ChatMessageRequestMentionsItem
                user_id = os.environ.get("BAND_USER_ID") or "5b242026-cab0-43b5-a519-542a72deed6e"
                msg_req = ChatMessageRequest(
                    content=serialized_payload,
                    mentions=[ChatMessageRequestMentionsItem(id=user_id, name="User")]
                )
                await loop.run_in_executor(
                    None,
                    lambda: self.client.agent_api_messages.create_agent_chat_message(chat_id=room_id, message=msg_req)
                )
            else:
                msg_req = ChatMessageRequest(content=serialized_payload, mentions=[])
                await loop.run_in_executor(
                    None,
                    lambda: self.client.human_api_messages.send_my_chat_message(chat_id=room_id, message=msg_req)
                )
        except Exception as e:
            print(f"[WARN] Failed to post to real Band room: {e}. Appending to mock instead.")
            if room_id not in _MOCK_MESSAGES:
                _MOCK_MESSAGES[room_id] = []
            _MOCK_MESSAGES[room_id].append(BandMessage(role, type, content))

    async def get_messages(self, room_id: str, type_filter: Optional[str] = None) -> List[BandMessage]:
        if room_id in _MOCK_MESSAGES:
            messages = _MOCK_MESSAGES[room_id]
            if type_filter:
                messages = [m for m in messages if m.type == type_filter]
            return messages

        try:
            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.agent_api_context.get_agent_chat_context(chat_id=room_id, page_size=100)
            )
            print(f"\nDEBUG get_messages: API returned {len(response.data) if response.data else 0} messages\n", flush=True)
            if response.data:
                for idx, m in enumerate(response.data):
                    print(f"DEBUG msg {idx}: sender_name={getattr(m, 'sender_name', None)}, content={m.content}", flush=True)
            messages = [BandMessage.from_sdk(m) for m in response.data]
            if type_filter:
                messages = [m for m in messages if m.type == type_filter]
            return messages
        except Exception as e:
            print(f"[WARN] Failed to get real Band messages: {e}. Reading from mock.")
            messages = _MOCK_MESSAGES.get(room_id, [])
            if type_filter:
                messages = [m for m in messages if m.type == type_filter]
            return messages

    async def close(self, room_id: str):
        pass

class BandClient:
    def __init__(self, api_key: str):
        base_url = os.environ.get("BAND_BASE_URL") or os.environ.get("THENVOI_BASE_URL") or "https://app.band.ai"
        self.client = RestClient(api_key=api_key, base_url=base_url)
        self.rooms = BandRooms(self.client, api_key=api_key)
