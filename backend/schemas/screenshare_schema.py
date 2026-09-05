from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TokenRequest(BaseModel):
    room_id: str
    participant_id: str
    participant_name: str = Field(..., min_length=1, max_length=100)


class TokenResponse(BaseModel):
    token: str
    livekit_url: str
    room_name: str


class ScreenShareSessionOut(BaseModel):
    id: str
    room_id: str
    participant_id: Optional[str] = None
    livekit_room_name: str
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ScreenShareWSMessage(BaseModel):
    type: str  # "started" | "stopped"
    session: Optional[ScreenShareSessionOut] = None
    participant_id: Optional[str] = None