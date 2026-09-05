from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from config.supabase import supabase  # actual import path বসাও

TABLE = "screenshare_sessions"


def create_session(room_id: str, participant_id: Optional[str], livekit_room_name: str) -> Dict[str, Any]:
    payload = {
        "room_id": room_id,
        "participant_id": participant_id,
        "livekit_room_name": livekit_room_name,
    }
    response = supabase.table(TABLE).insert(payload).execute()
    return response.data[0]


def end_session(session_id: str) -> Optional[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    response = (
        supabase.table(TABLE)
        .update({"ended_at": now})
        .eq("id", session_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def get_active_sessions(room_id: str) -> List[Dict[str, Any]]:
    response = (
        supabase.table(TABLE)
        .select("*")
        .eq("room_id", room_id)
        .execute()
    )
    rows = response.data or []
    return [r for r in rows if r.get("ended_at") is None]


def get_session_by_id(session_id: str) -> Optional[Dict[str, Any]]:
    response = supabase.table(TABLE).select("*").eq("id", session_id).execute()
    rows = response.data or []
    return rows[0] if rows else None

def get_active_sessions_for_participant(room_id: str, participant_id: str) -> List[Dict[str, Any]]:
    response = (
        supabase.table(TABLE)
        .select("*")
        .eq("room_id", room_id)
        .eq("participant_id", participant_id)
        .execute()
    )
    rows = response.data or []
    return [r for r in rows if r.get("ended_at") is None]