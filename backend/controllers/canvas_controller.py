from typing import Any, Dict, List
from models import canvas_model


def get_canvas_snapshot(room_id: str) -> List[Dict[str, Any]]:
    rows = canvas_model.get_records_by_room(room_id)
    return [row["record"] for row in rows]


def save_records(room_id: str, records: List[Dict[str, Any]]) -> None:
    for record in records:
        record_id = record.get("id")
        if record_id:
            canvas_model.upsert_record(room_id, record_id, record)


def remove_records(room_id: str, record_ids: List[str]) -> None:
    if record_ids:
        canvas_model.delete_records(room_id, record_ids)