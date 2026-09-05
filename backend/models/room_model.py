import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from config.supabase import supabase

logger = logging.getLogger(__name__)

# Resilient in-memory store pre-populated with initial demo rooms
_in_memory_rooms: List[Dict[str, Any]] = [
    {
        "id": "11111111-2222-3333-4444-555555555555",
        "host_id": "11111111-1111-4111-a111-111111111111",
        "title": "Operating Systems Final Prep",
        "description": "Collaborative review of Process Scheduling, Deadlocks, and Virtual Memory.",
        "is_private": False,
        "access_code": None,
        "tags": ["Operating Systems", "Computer Science", "Finals"],
        "max_participants": 10,
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "22222222-3333-4444-5555-666666666666",
        "host_id": "22222222-2222-4222-a222-222222222222",
        "title": "Algorithms & Problem Solving",
        "description": "Practicing graph algorithms (Dijkstra, BFS/DFS) and dynamic programming.",
        "is_private": False,
        "access_code": None,
        "tags": ["Algorithms", "Data Structures", "LeetCode"],
        "max_participants": 8,
        "created_at": datetime.now(timezone.utc).isoformat(),
    },
]


class RoomModel:
    @staticmethod
    def create_room(payload: Dict[str, Any]) -> Dict[str, Any]:
        if supabase:
            try:
                res = supabase.table("study_rooms").insert(payload).execute()
                if res.data:
                    return res.data[0]
            except Exception as exc:
                logger.warning(f"Supabase room insert failed ({exc}); falling back to in-memory store.")

        # In-memory fallback
        new_room = dict(payload)
        new_room.setdefault("id", str(uuid.uuid4()))
        new_room.setdefault("created_at", datetime.now(timezone.utc).isoformat())
        new_room.setdefault("description", payload.get("description") or "")
        new_room.setdefault("is_private", payload.get("is_private", False))
        new_room.setdefault("access_code", payload.get("access_code"))
        new_room.setdefault("tags", payload.get("tags", []))
        new_room.setdefault("max_participants", payload.get("max_participants", 10))
        _in_memory_rooms.insert(0, new_room)
        return new_room

    @staticmethod
    def get_public_rooms(tag: Optional[str] = None) -> List[Dict[str, Any]]:
        if supabase:
            try:
                query = supabase.table("study_rooms").select("*").eq("is_private", False)
                if tag:
                    query = query.contains("tags", [tag])
                res = query.order("created_at", desc=True).execute()
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as exc:
                logger.warning(f"Supabase get_public_rooms failed ({exc}); falling back to in-memory store.")

        # In-memory fallback
        results = [r for r in _in_memory_rooms if not r.get("is_private", False)]
        if tag:
            tag_clean = tag.strip().lower()
            results = [
                r for r in results
                if any(tag_clean in str(t).lower() for t in r.get("tags", []))
            ]
        return results
