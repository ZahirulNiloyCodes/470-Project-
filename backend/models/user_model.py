from typing import Any, Dict, Optional
from config.supabase import supabase

TABLE = "users"


def create_user(name: str, email: str, password_hash: str) -> Dict[str, Any]:
    payload = {"name": name, "email": email, "password_hash": password_hash}
    response = supabase.table(TABLE).insert(payload).execute()
    return response.data[0]


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    response = supabase.table(TABLE).select("*").eq("email", email).execute()
    rows = response.data or []
    return rows[0] if rows else None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    response = supabase.table(TABLE).select("*").eq("id", user_id).execute()
    rows = response.data or []
    return rows[0] if rows else None


def update_user(user_id: str, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    response = supabase.table(TABLE).update(fields).eq("id", user_id).execute()
    rows = response.data or []
    return rows[0] if rows else None


def update_reputation_score(user_id: str, new_avg: float) -> None:
    supabase.table(TABLE).update({"peer_reputation_score": new_avg}).eq("id", user_id).execute()