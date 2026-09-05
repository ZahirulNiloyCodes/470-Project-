from typing import Any, Dict, List
from config.supabase import supabase 

TABLE = "canvas_records"


def get_records_by_room(room_id: str) -> List[Dict[str, Any]]:
    response = (
        supabase.table(TABLE)
        .select("*")
        .eq("room_id", room_id)
        .execute()
    )
    return response.data or []


def upsert_record(room_id: str, record_id: str, record: Dict[str, Any]) -> None:
    payload = {"room_id": room_id, "record_id": record_id, "record": record}
    supabase.table(TABLE).upsert(payload, on_conflict="room_id,record_id").execute()


def delete_records(room_id: str, record_ids: List[str]) -> None:
    supabase.table(TABLE).delete().eq("room_id", room_id).in_("record_id", record_ids).execute()