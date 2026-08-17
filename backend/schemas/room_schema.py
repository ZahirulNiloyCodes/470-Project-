from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class RoomCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    is_private: bool = False
    access_code: Optional[str] = Field(None, max_length=32)
    tags: List[str] = Field(default_factory=list)
    max_participants: int = Field(default=10, ge=2, le=50)

class RoomResponse(RoomCreateRequest):
    id: UUID
    host_id: UUID
    created_at: datetime
