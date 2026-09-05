from pydantic import BaseModel
from typing import Optional

class TaskCreateModel(BaseModel):
    room_id: str
    title: str
    assigned_to: Optional[str] = None

class TaskUpdateStatusModel(BaseModel):
    status: str