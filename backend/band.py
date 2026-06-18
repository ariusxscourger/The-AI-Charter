import json
import os
import uuid
import asyncio
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

from thenvoi_rest import RestClient, ChatMessageRequest
from thenvoi_rest.human_api_chats.types.create_my_chat_room_request_chat import (
    CreateMyChatRoomRequestChat,
)


class BandMessage:
    def __init__(self, role: str, type: str, content: Any, timestamp: Optional[str] = None):
        self.role = role
        self.type = type
        self.content = content
        self.timestamp = timestamp or datetime.utcnow().isoformat()

    @classmethod
    def from_sdk(cls, chat_message):
        timestamp = chat_message.inserted_at.isoformat() if chat_message.inserted_at else None
        content_str = chat_message.content or ""

        start_idx = content_str.find("{")
        end_idx = content_str.rfind("}")

        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            try:
                parsed = json.loads(content_str[start_idx : end_idx + 1])
                if isinstance(parsed, dict) and "type" in parsed:
                    return cls(
                        role=parsed.get("role"),
                        type=parsed.get("type"),
                        content=parsed.get("content"),
                        timestamp=timestamp,
                    )
            except Exception:
                pass

        return cls(
            role=chat_message.sender_name or chat_message.sender_id,
            type="text",
            content=chat_message.content,
            timestamp=timestamp,
        )


_MOCK_MESSAGES: Dict[str, List[BandMessage]] = {}
_ROOM_MESSAGE_CACHE: Dict[str, List[BandMessage]] = {}


def _configured_env(name: str) -> Optional[str]:
    value = os.environ.get(name)
    if value and not value.startswith("your_"):
        return value
    return None


def _api_key_for_role(role: str) -> Optional[str]:
    prefix = role.upper()
    candidates = [
        f"{prefix}_BAND_API_KEY",
        f"{prefix}_AGENT_API_KEY",
    ]

    if role == "orchestrator":
        candidates.extend(
            [
                "ORCHESTRATOR_AGENT_API_KEY",
                "SECURITY_BAND_API_KEY",
                "SECURITY_AGENT_API_KEY",
                "BAND_API_KEY",
            ]
        )

    for candidate in candidates:
        value = _configured_env(candidate)
        if value:
            return value

    return None


class BandRooms:
    def __init__(self, client: RestClient, api_key: str):
        self.client = client
        self.api_key = api_key

    def _is_agent_key(self) -> bool:
        return self.api_key.startswith("band_a_") or self.api_key.startswith("thnv_a_")

    def _participant_id_for_agent(self, agent_id: str) -> Optional[str]:
        env_prefix = agent_id.upper()

        for key in (
            f"{env_prefix}_AGENT_ID",
            f"{env_prefix}_AGENT_PARTICIPANT_ID",
            f"BAND_{env_prefix}_AGENT_ID",
            f"BAND_{env_prefix}_PARTICIPANT_ID",
        ):
            value = os.environ.get(key)
            if value and not value.startswith("your_"):
                return value

        return None

    @staticmethod
    def _status_code_from_error(error: Exception) -> Optional[int]:
        status_code = getattr(error, "status_code", None)
        if isinstance(status_code, int):
            return status_code

        match = re.search(r"status_code:\s*(\d{3})", str(error))
        if match:
            return int(match.group(1))

        return None

    def _log_participant_add_failure(self, agent_id: str, room_id: str, error: Exception):
        status_code = self._status_code_from_error(error)

        if status_code == 409:
            print(
                f"[INFO] Agent '{agent_id}' is already a participant in Band room {room_id}.",
                flush=True,
            )
            return

        if status_code == 404:
            print(
                f"[WARN] Could not add agent '{agent_id}' to Band room {room_id}: "
                f"Band returned 404. Check that {agent_id.upper()}_AGENT_ID is valid "
                "and that this API key owns/can access the room.",
                flush=True,
            )
            return

        print(f"[WARN] Failed to add agent '{agent_id}' to room {room_id}: {error}", flush=True)

    def _add_participant(self, room_id: str, participant):
        if self._is_agent_key():
            return self.client.agent_api_participants.add_agent_chat_participant(
                chat_id=room_id,
                participant=participant,
            )

        return self.client.human_api_participants.add_my_chat_participant(
            chat_id=room_id,
            participant=participant,
        )

    def _read_all_room_messages(self, room_id: str):
        if self._is_agent_key():
            return self.client.agent_api_context.get_agent_chat_context(
                chat_id=room_id,
                page_size=100,
            )

        return self.client.human_api_messages.list_my_chat_messages(
            chat_id=room_id,
            page_size=100,
        )

    async def create(self, name: str):
        try:
            loop = asyncio.get_running_loop()

            if self._is_agent_key():
                from thenvoi_rest import ChatRoomRequest, ParticipantRequest

                chat_req = ChatRoomRequest()

                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.agent_api_chats.create_agent_chat(chat=chat_req),
                )

                user_id = os.environ.get("BAND_USER_ID")
                if user_id:
                    try:
                        participant = ParticipantRequest(
                            participant_id=user_id,
                            role="owner",
                        )
                        await loop.run_in_executor(
                            None,
                            lambda: self.client.agent_api_participants.add_agent_chat_participant(
                                chat_id=response.data.id,
                                participant=participant,
                            ),
                        )
                    except Exception as add_err:
                        print(f"[WARN] Failed to add human owner to room: {add_err}", flush=True)

                return response.data

            chat_req = CreateMyChatRoomRequestChat(title=name)
            response = await loop.run_in_executor(
                None,
                lambda: self.client.human_api_chats.create_my_chat_room(chat=chat_req),
            )
            return response.data

        except Exception as e:
            room_id = f"mock-room-{str(uuid.uuid4())[:8]}"
            _MOCK_MESSAGES[room_id] = []

            print(
                f"[WARN] Band.ai API create failed ({e}). "
                f"Falling back to local Mock Room: {room_id}",
                flush=True,
            )

            class MockChatRoom:
                def __init__(self, rid):
                    self.id = rid

            return MockChatRoom(room_id)

    async def join(self, room_id: str, agent_id: str):
        if room_id in _MOCK_MESSAGES:
            return

        participant_id = self._participant_id_for_agent(agent_id)

        if not participant_id:
            print(
                f"[WARN] No Band participant ID configured for agent '{agent_id}'. "
                f"Set {agent_id.upper()}_AGENT_ID or {agent_id.upper()}_AGENT_PARTICIPANT_ID.",
                flush=True,
            )
            return

        try:
            from thenvoi_rest import ParticipantRequest

            participant = ParticipantRequest(
                participant_id=participant_id,
                role="member",
            )

            loop = asyncio.get_running_loop()
            await loop.run_in_executor(
                None,
                lambda: self._add_participant(room_id, participant),
            )

            print(f"[INFO] Added agent '{agent_id}' to Band room {room_id}.", flush=True)

        except Exception as add_err:
            self._log_participant_add_failure(agent_id, room_id, add_err)

    async def post_message(self, room_id: str, role: str, type: str, content: Any):
        local_message = BandMessage(role, type, content)
        if room_id in _MOCK_MESSAGES:
            _MOCK_MESSAGES[room_id].append(local_message)
            return

        serialized_payload = json.dumps(
            {
                "role": role,
                "type": type,
                "content": content,
            }
        )

        try:
            loop = asyncio.get_running_loop()

            if self._is_agent_key():
                from thenvoi_rest import ChatMessageRequestMentionsItem

                user_id = os.environ.get("BAND_USER_ID")

                mentions = []
                if user_id:
                    mentions = [
                        ChatMessageRequestMentionsItem(
                            id=user_id,
                            name="User",
                        )
                    ]

                msg_req = ChatMessageRequest(
                    content=serialized_payload,
                    mentions=mentions,
                )

                await loop.run_in_executor(
                    None,
                    lambda: self.client.agent_api_messages.create_agent_chat_message(
                        chat_id=room_id,
                        message=msg_req,
                    ),
                )
                _ROOM_MESSAGE_CACHE.setdefault(room_id, []).append(local_message)
                return

            msg_req = ChatMessageRequest(content=serialized_payload, mentions=[])

            await loop.run_in_executor(
                None,
                lambda: self.client.human_api_messages.send_my_chat_message(
                    chat_id=room_id,
                    message=msg_req,
                ),
            )
            _ROOM_MESSAGE_CACHE.setdefault(room_id, []).append(local_message)

        except Exception as e:
            print(
                f"[ERROR] Failed to post to real Band room {room_id} as role '{role}': {e}",
                flush=True,
            )
            raise

    async def get_messages(self, room_id: str, type_filter: Optional[str] = None) -> List[BandMessage]:
        if room_id in _MOCK_MESSAGES:
            messages = _MOCK_MESSAGES[room_id]
            if type_filter:
                messages = [m for m in messages if m.type == type_filter]
            return messages

        if room_id in _ROOM_MESSAGE_CACHE:
            messages = _ROOM_MESSAGE_CACHE[room_id]
            if type_filter:
                messages = [m for m in messages if m.type == type_filter]
            return messages

        try:
            loop = asyncio.get_running_loop()

            response = await loop.run_in_executor(
                None,
                lambda: self._read_all_room_messages(room_id),
            )

            messages = [BandMessage.from_sdk(m) for m in response.data or []]
            if messages:
                _ROOM_MESSAGE_CACHE[room_id] = messages

            if type_filter:
                messages = [m for m in messages if m.type == type_filter]

            return messages

        except Exception as e:
            print(f"[WARN] Failed to get real Band messages: {e}. Reading from local cache.", flush=True)

            messages = _ROOM_MESSAGE_CACHE.get(room_id) or _MOCK_MESSAGES.get(room_id, [])
            if type_filter:
                messages = [m for m in messages if m.type == type_filter]
            return messages

    async def close(self, room_id: str):
        pass


class BandClient:
    def __init__(self, api_key: Optional[str] = None):
        api_key = api_key or _api_key_for_role("orchestrator") or "dummy"
        base_url = (
            os.environ.get("BAND_BASE_URL")
            or os.environ.get("THENVOI_BASE_URL")
            or "https://app.band.ai"
        )

        self.api_key = api_key
        self._role_clients: Dict[str, "BandClient"] = {}
        self.client = RestClient(api_key=api_key, base_url=base_url)
        self.rooms = BandRooms(self.client, api_key=api_key)

    def for_role(self, role: str) -> "BandClient":
        api_key = _api_key_for_role(role)
        if not api_key or api_key == self.api_key:
            return self

        if role not in self._role_clients:
            self._role_clients[role] = BandClient(api_key)

        return self._role_clients[role]
