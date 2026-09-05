from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ResourceModel(BaseModel):
    id: Optional[str] = None
    room_id: str
    user_id: str
    title: str
    resource_type: str  # 'link' or 'file'
    url: str
    created_at: Optional[datetime] = None