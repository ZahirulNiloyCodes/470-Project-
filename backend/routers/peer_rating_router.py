from fastapi import APIRouter, Depends, Header, status
from typing import List, Optional
from config.supabase import supabase
from controllers.peer_rating_controller import PeerRatingController
from schemas.peer_rating_schema import (
    PeerRatingCreate,
    PeerRatingBatchCreate,
    PeerRatingOut,
    PeerRatingSummaryOut,
    SessionPeerOut,
)

router = APIRouter(prefix="/api/ratings", tags=["Peer Ratings (FR13)"])

DEFAULT_USER_ID = "11111111-1111-4111-a111-111111111111"


async def resolve_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
) -> str:
    if x_user_id:
        return x_user_id
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            if supabase:
                user = supabase.auth.get_user(token)
                if user and user.user:
                    return user.user.id
        except Exception:
            pass
    return DEFAULT_USER_ID


@router.post("/", response_model=PeerRatingOut, status_code=status.HTTP_201_CREATED)
def submit_rating(
    request: PeerRatingCreate,
    user_id: str = Depends(resolve_user_id),
):
    """Submit or update a helpfulness rating for a study session peer."""
    return PeerRatingController.submit_rating(request, rater_id=user_id)


@router.post("/batch", response_model=List[PeerRatingOut], status_code=status.HTTP_201_CREATED)
def submit_batch_ratings(
    request: PeerRatingBatchCreate,
    user_id: str = Depends(resolve_user_id),
):
    """Submit ratings for multiple peers after completing a study session."""
    return PeerRatingController.submit_batch_ratings(request, rater_id=user_id)


@router.get("/user/{user_id}/summary", response_model=PeerRatingSummaryOut)
def get_user_rating_summary(user_id: str):
    """Get aggregate helpfulness score and breakdown for a user."""
    return PeerRatingController.get_user_summary(user_id)


@router.get("/user/{user_id}", response_model=List[PeerRatingOut])
def get_user_ratings(user_id: str):
    """List all helpfulness ratings received by a user."""
    return PeerRatingController.list_user_ratings(user_id)


@router.get("/room/{room_id}", response_model=List[PeerRatingOut])
def get_room_ratings(room_id: str):
    """List all peer ratings submitted for a given study room session."""
    return PeerRatingController.list_room_ratings(room_id)


@router.get("/room/{room_id}/eligible", response_model=List[SessionPeerOut])
def get_eligible_session_peers(
    room_id: str,
    user_id: str = Depends(resolve_user_id),
):
    """Get participants from this study session eligible to be rated by current user."""
    return PeerRatingController.get_eligible_session_peers(room_id, current_user_id=user_id)


@router.get("/room/{room_id}/mine", response_model=List[PeerRatingOut])
def get_my_ratings_in_room(
    room_id: str,
    user_id: str = Depends(resolve_user_id),
):
    """Get peer ratings submitted by the current user in this study session."""
    return PeerRatingController.get_user_ratings_in_room(room_id, rater_id=user_id)
