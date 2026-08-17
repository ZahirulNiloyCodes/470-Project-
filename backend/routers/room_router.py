from fastapi import APIRouter, Depends, Header, Query
from typing import List, Optional
from schemas.room_schema import RoomCreateRequest, RoomResponse
from controllers.room_controller import RoomController
from config.supabase import supabase

router = APIRouter(prefix="/api/rooms", tags=["Study Rooms"])

DEFAULT_USER_ID = "11111111-1111-4111-a111-111111111111"

async def resolve_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
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

@router.post("/", response_model=RoomResponse, status_code=201)
def create_room(request: RoomCreateRequest, user_id: str = Depends(resolve_user_id)):
    return RoomController.create_room(request, user_id)

@router.get("/", response_model=List[RoomResponse])
def get_rooms(tag: Optional[str] = Query(None)):
    return RoomController.list_rooms(tag)
