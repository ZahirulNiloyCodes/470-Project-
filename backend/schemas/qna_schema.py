from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

QuestionStatus = Literal["pending", "answered", "dismissed"]


class QuestionCreate(BaseModel):
    room_id: str
    participant_id: Optional[str] = None
    question: str = Field(..., min_length=3, max_length=2000)


class QuestionAnswer(BaseModel):
    answer: str = Field(..., min_length=1, max_length=5000)


class QuestionOut(BaseModel):
    id: str
    room_id: str
    participant_id: Optional[str] = None
    question: str
    status: QuestionStatus
    answer: Optional[str] = None
    answered_at: Optional[datetime] = None
    dismissed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    queue_position: Optional[int] = None

    class Config:
        from_attributes = True


class QnAWSMessage(BaseModel):
    type: str  # "new" | "answered" | "dismissed"
    question: Optional[QuestionOut] = None
    question_id: Optional[str] = None