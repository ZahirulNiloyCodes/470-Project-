from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime


class CanvasRecordOut(BaseModel):
    room_id: str
    record_id: str
    record: Dict[str, Any]
    updated_at: datetime

    class Config:
        from_attributes = True


class CanvasWSMessage(BaseModel):
    type: str  # "update" | "delete"
    records: Optional[List[Dict[str, Any]]] = None
    ids: Optional[List[str]] = None