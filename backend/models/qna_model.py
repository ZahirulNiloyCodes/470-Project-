from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from config.supabase import supabase  # actual import path বসাও

TABLE = "anonymous_questions"


def create_question(room_id: str, participant_id: Optional[str], question: str) -> Dict[str, Any]:
    payload = {"room_id": room_id, "participant_id": participant_id, "question": question}
    response = supabase.table(TABLE).insert(payload).execute()
    return response.data[0]


def get_questions_by_room(room_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    query = supabase.table(TABLE).select("*").eq("room_id", room_id)
    if status:
        query = query.eq("status", status)
    response = query.order("created_at").execute()
    return response.data or []


def get_question_by_id(question_id: str) -> Optional[Dict[str, Any]]:
    response = supabase.table(TABLE).select("*").eq("id", question_id).execute()
    rows = response.data or []
    return rows[0] if rows else None


def answer_question(question_id: str, answer: str) -> Optional[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    response = (
        supabase.table(TABLE)
        .update({"status": "answered", "answer": answer, "answered_at": now})
        .eq("id", question_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None


def dismiss_question(question_id: str) -> Optional[Dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    response = (
        supabase.table(TABLE)
        .update({"status": "dismissed", "dismissed_at": now})
        .eq("id", question_id)
        .execute()
    )
    rows = response.data or []
    return rows[0] if rows else None

def get_queue_position(question_id: str) -> int:
    response = supabase.rpc(
        "get_question_queue_position", {"p_question_id": question_id}
    ).execute()
    return response.data