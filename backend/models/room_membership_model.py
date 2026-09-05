from typing import Any, Dict, Optional
from config.supabase import supabase

ROOMS_TABLE = "study_rooms"
PARTICIPANTS_TABLE = "room_participants"


def create_room(title: str, host_id: str) -> Dict[str, Any]:
    # ⚠️ column নাম (title/host_id) তোমার actual study_rooms schema অনুযায়ী মিলিয়ে নাও
    payload = {"title": title, "host_id": host_id}
    response = supabase.table(ROOMS_TABLE).insert(payload).execute()
    return response.data[0]


def get_room_by_id(room_id: str) -> Optional[Dict[str, Any]]:
    response = supabase.table(ROOMS_TABLE).select("*").eq("id", room_id).execute()
    rows = response.data or []
    return rows[0] if rows else None


def get_membership(room_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    response = (
        supabase.table(PARTICIPANTS_TABLE)
        .select("*")
        .eq("room_id", room_id)
        .eq("user_id", user_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def add_participant(room_id: str, user_id: str) -> Dict[str, Any]:
    payload = {"room_id": room_id, "user_id": user_id}
    response = supabase.table(PARTICIPANTS_TABLE).insert(payload).execute()
    return response.data[0]