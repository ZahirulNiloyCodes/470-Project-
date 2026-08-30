import uuid
from datetime import datetime
from pydantic import BaseModel


class Message(BaseModel):
    id: uuid.UUID
    room_id: uuid.UUID
    user_id: uuid.UUID
    username: str
    content: str
    created_at: datetime
    updated_at: datetime
    is_edited: bool = False
    is_deleted: bool = False