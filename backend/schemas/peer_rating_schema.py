from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class PeerRatingItem(BaseModel):
    ratee_id: str = Field(..., min_length=1, description="ID of the participant being rated")
    rating: int = Field(..., ge=1, le=5, description="Helpfulness rating from 1 (lowest) to 5 (highest)")
    feedback: Optional[str] = Field(None, max_length=1000, description="Optional qualitative feedback")


class PeerRatingCreate(PeerRatingItem):
    room_id: str = Field(..., min_length=1, description="Study room / session ID")


class PeerRatingBatchCreate(BaseModel):
    room_id: str = Field(..., min_length=1, description="Study room / session ID")
    ratings: List[PeerRatingItem] = Field(..., min_length=1, description="List of peer ratings for session members")


class PeerRatingOut(BaseModel):
    id: str
    room_id: str
    rater_id: str
    ratee_id: str
    rating: int
    feedback: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class PeerRatingSummaryOut(BaseModel):
    user_id: str
    average_rating: float
    total_ratings: int
    rating_distribution: Dict[int, int]
    recent_feedback: List[str]


class SessionPeerOut(BaseModel):
    user_id: str
    username: str
    has_rated: bool = False
    current_rating: Optional[int] = None
    current_feedback: Optional[str] = None
