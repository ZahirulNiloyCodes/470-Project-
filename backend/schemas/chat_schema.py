from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    room_id: str
    user_id: str
    username: str
    content: str = Field(..., min_length=1, max_length=5000)


class MessageUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class MessageOut(BaseModel):
    id: str
    room_id: str
    user_id: str
    username: str
    content: str
    is_edited: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatWSMessage(BaseModel):
    type: str  # "new" | "edit" | "delete"
    message: Optional[MessageOut] = None
    message_id: Optional[str] = None