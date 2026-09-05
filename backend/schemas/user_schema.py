import re
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(..., min_length=8, max_length=100)


class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    peer_reputation_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class RatePeerRequest(BaseModel):
    score: int = Field(..., ge=1, le=5)


class CreateRoomRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class JoinRoomResponse(BaseModel):
    joined: bool
    room_id: str