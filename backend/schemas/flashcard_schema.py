from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class FlashcardItem(BaseModel):
    question: str
    answer: str

class FlashcardGenerateRequest(BaseModel):
    room_id: Optional[UUID] = None
    title: str = Field(..., min_length=3, max_length=255)
    study_notes: str = Field(..., min_length=20, description="Raw study notes")
    num_cards: int = Field(default=5, ge=1, le=20)

class FlashcardDeckResponse(BaseModel):
    id: UUID
    user_id: UUID
    room_id: Optional[UUID]
    title: str
    cards: List[FlashcardItem]
    created_at: datetime
