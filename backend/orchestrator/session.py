from band import BandClient
from shared.schemas import SubmissionPayload

class GovernanceSession:
    def __init__(self, band_client: BandClient, submission: SubmissionPayload):
        self.band = band_client
        self.submission = submission
        self.room_id: str | None = None

    async def open(self) -> str:
        """
        1. Create a Band room named after the feature
        2. Post submission payload as the first room message (type: submission_context)
        3. Return room_id — this becomes the sessionId throughout the system
        """
        room = await self.band.rooms.create(
            name=f"Review: {self.submission.feature_name}"
        )
        self.room_id = room.id

        await self.band.rooms.post_message(
            room_id=self.room_id,
            role="orchestrator",
            type="submission_context",
            content=self.submission.model_dump()
        )
        return self.room_id

    async def close(self):
        if self.room_id:
            await self.band.rooms.close(self.room_id)
