import uuid

from fastapi import APIRouter, HTTPException

from ..database import supabase

router = APIRouter(
    prefix="/api/rooms",
    tags=["rooms"],
)


@router.get("/{room_id}")
async def get_room(room_id: uuid.UUID):
    response = (
        supabase
        .table("study_rooms")
        .select("id, title")
        .eq("id", str(room_id))
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Room not found",
        )

    return response.data