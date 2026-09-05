from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RoomSearchQueryModel(BaseModel):
    q: Optional[str] = None
    tag: Optional[str] = None

class RoomModel(BaseModel):
    id: Optional[str] = None
    title: str
    is_public: bool = True
    tags: List[str] = []
    created_at: Optional[datetime] = None