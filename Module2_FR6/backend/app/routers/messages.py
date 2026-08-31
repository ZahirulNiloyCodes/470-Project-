import uuid
from fastapi import APIRouter, HTTPException

from ..database import supabase
from ..schemas import CreateMessage, UpdateMessage

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/{room_id}")
async def get_messages(room_id: uuid.UUID):
    response = (
        supabase.table("messages")
        .select("*")
        .eq("room_id", str(room_id))
        .order("created_at", desc=False)
        .execute()
    )
    return response.data


@router.post("")
async def create_message(payload: CreateMessage):
    response = (
        supabase.table("messages")
        .insert({
            "room_id": str(payload.room_id),
            "user_id": str(payload.user_id),
            "username": payload.username,
            "content": payload.content,
        })
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create message")
    return response.data[0]


@router.put("/{message_id}")
async def update_message(message_id: uuid.UUID, payload: UpdateMessage):
    response = (
        supabase.table("messages")
        .update({"content": payload.content, "is_edited": True})
        .eq("id", str(message_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Message not found")
    return response.data[0]


@router.delete("/{message_id}")
async def delete_message(message_id: uuid.UUID):
    response = (
        supabase.table("messages")
        .update({"is_deleted": True, "content": ""})
        .eq("id", str(message_id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Message not found")
    return response.data[0]