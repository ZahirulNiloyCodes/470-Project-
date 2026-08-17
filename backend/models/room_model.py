from typing import List, Optional, Dict, Any
from config.supabase import supabase

class RoomModel:
    @staticmethod
    def create_room(payload: Dict[str, Any]) -> Dict[str, Any]:
        if not supabase:
            raise Exception("Supabase credentials not configured.")
        res = supabase.table("study_rooms").insert(payload).execute()
        return res.data[0]

    @staticmethod
    def get_public_rooms(tag: Optional[str] = None) -> List[Dict[str, Any]]:
        if not supabase:
            return []
        query = supabase.table("study_rooms").select("*").eq("is_private", False)
        if tag:
            query = query.contains("tags", [tag])
        return query.order("created_at", desc=True).execute().data or []
