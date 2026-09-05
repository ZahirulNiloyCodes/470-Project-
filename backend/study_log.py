from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StudyLogModel(BaseModel):
    id: Optional[str] = None
    user_id: str
    room_id: str
    duration_minutes: int
    session_date: Optional[datetime] = None