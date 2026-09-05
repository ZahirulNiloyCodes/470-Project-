from fastapi import APIRouter, Depends, HTTPException
from controllers import user_controller
from schemas.user_schema import (
    UpdateProfileRequest, RatePeerRequest, CreateRoomRequest, JoinRoomResponse, UserOut
)
from dependencies.auth_dependency import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password_hash"}


@router.put("/me", response_model=UserOut)
def update_me(payload: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    return user_controller.update_profile(current_user["id"], payload.name, payload.password)


@router.post("/{peer_id}/rate")
def rate_peer(peer_id: str, payload: RatePeerRequest, current_user: dict = Depends(get_current_user)):
    user_controller.rate_peer(current_user["id"], peer_id, payload.score)
    return {"success": True}