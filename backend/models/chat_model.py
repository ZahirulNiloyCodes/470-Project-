from typing import Any, Dict, List, Optional
from config.supabase import supabase  # তোমার actual import path বসাও

TABLE = "messages"


def create_message(room_id: str, user_id: str, username: str, content: str) -> Dict[str, Any]:
    payload = {
        "room_id": room_id,
        "user_id": user_id,
        "username": username,
        "content": content,
    }
    response = supabase.table(TABLE).insert(payload).execute()
    return response.data[0]


def get_messages_by_room(room_id: str) -> List[Dict[str, Any]]:
    response = (
        supabase.table(TABLE)
        .select("*")
        .eq("room_id", room_id)
        .order("created_at")
        .execute()
    )
    return response.data or []


def get_message_by_id(message_id: str) -> Optional[Dict[str, Any]]:
    response = supabase.table(TABLE).select("*").eq("id", message_id).execute()
    rows = response.data or []
    return rows[0] if rows else None


def update_message(message_id: str, content: str) -> Optional[Dict[str, Any]]:
    response = (
        supabase.table(TABLE)
        .update({"content": content, "is_edited": True})
        .eq("id", message_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def soft_delete_message(message_id: str) -> Optional[Dict[str, Any]]:
    response = (
        supabase.table(TABLE)
        .update({"is_deleted": True, "content": ""})
        .eq("id", message_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None