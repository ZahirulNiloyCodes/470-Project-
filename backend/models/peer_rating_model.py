from typing import Dict, Any, List, Optional
from config.supabase import supabase

TABLE = "peer_ratings"


class PeerRatingModel:
    @staticmethod
    def create_or_update_rating(payload: Dict[str, Any]) -> Dict[str, Any]:
        if not supabase:
            raise Exception("Supabase credentials not configured.")
        
        # Check if rating already exists for this (room_id, rater_id, ratee_id)
        existing = (
            supabase.table(TABLE)
            .select("*")
            .eq("room_id", str(payload["room_id"]))
            .eq("rater_id", str(payload["rater_id"]))
            .eq("ratee_id", str(payload["ratee_id"]))
            .execute()
        )
        
        if existing and existing.data:
            rating_id = existing.data[0]["id"]
            update_data = {
                "rating": payload["rating"],
                "feedback": payload.get("feedback"),
            }
            res = (
                supabase.table(TABLE)
                .update(update_data)
                .eq("id", rating_id)
                .execute()
            )
            return res.data[0]
        else:
            res = supabase.table(TABLE).insert(payload).execute()
            return res.data[0]

    @staticmethod
    def get_ratings_for_user(user_id: str) -> List[Dict[str, Any]]:
        if not supabase:
            return []
        res = (
            supabase.table(TABLE)
            .select("*")
            .eq("ratee_id", str(user_id))
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []

    @staticmethod
    def get_ratings_by_room(room_id: str) -> List[Dict[str, Any]]:
        if not supabase:
            return []
        res = (
            supabase.table(TABLE)
            .select("*")
            .eq("room_id", str(room_id))
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []

    @staticmethod
    def get_ratings_by_rater_in_room(room_id: str, rater_id: str) -> List[Dict[str, Any]]:
        if not supabase:
            return []
        res = (
            supabase.table(TABLE)
            .select("*")
            .eq("room_id", str(room_id))
            .eq("rater_id", str(rater_id))
            .execute()
        )
        return res.data or []

    @staticmethod
    def get_rating(room_id: str, rater_id: str, ratee_id: str) -> Optional[Dict[str, Any]]:
        if not supabase:
            return None
        res = (
            supabase.table(TABLE)
            .select("*")
            .eq("room_id", str(room_id))
            .eq("rater_id", str(rater_id))
            .eq("ratee_id", str(ratee_id))
            .execute()
        )
        return res.data[0] if res.data else None


# Module instance alias
peer_rating_model = PeerRatingModel()
