import uuid
from typing import Literal, Optional
from pydantic import BaseModel, Field


class CreateMessage(BaseModel):
    room_id: uuid.UUID
    user_id: uuid.UUID
    username: str
    content: str = Field(min_length=1, max_length=10000)


class UpdateMessage(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class WebSocketMessage(BaseModel):
    type: Literal["message", "edit", "delete"]
    message_id: Optional[uuid.UUID] = None
    room_id: uuid.UUID
    user_id: uuid.UUID
    username: str
    content: Optional[str] = None