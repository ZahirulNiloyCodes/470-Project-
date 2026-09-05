import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from config.supabase import supabase

logger = logging.getLogger(__name__)

TABLE = "peer_ratings"

# In-memory store pre-seeded with realistic peer ratings for demo
_in_memory_ratings: List[Dict[str, Any]] = [
    {
        "id": "rating-1",
        "room_id": "room-test-1",
        "rater_id": "22222222-2222-4222-a222-222222222222",
        "ratee_id": "11111111-1111-4111-a111-111111111111",
        "rating": 5,
        "feedback": "Extremely helpful explaining virtual memory and page tables!",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "rating-2",
        "room_id": "room-test-1",
        "rater_id": "33333333-3333-4333-a333-333333333333",
        "ratee_id": "11111111-1111-4111-a111-111111111111",
        "rating": 5,
        "feedback": "Great focus host during the Pomodoro study sprint.",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "rating-3",
        "room_id": "room-test-1",
        "rater_id": "44444444-4444-4444-a444-444444444444",
        "ratee_id": "11111111-1111-4111-a111-111111111111",
        "rating": 4,
        "feedback": "Very collaborative and shared helpful flashcard summaries.",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
]


class PeerRatingModel:
    @staticmethod
    def create_or_update_rating(payload: Dict[str, Any]) -> Dict[str, Any]:
        if supabase:
            try:
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
                    if res.data:
                        return res.data[0]
                else:
                    res = supabase.table(TABLE).insert(payload).execute()
                    if res.data:
                        return res.data[0]
            except Exception as exc:
                logger.warning(f"Supabase peer_rating save failed ({exc}); falling back to in-memory store.")

        # In-memory fallback
        now_iso = datetime.now(timezone.utc).isoformat()
        r_id = str(payload["room_id"])
        rater = str(payload["rater_id"])
        ratee = str(payload["ratee_id"])

        for r in _in_memory_ratings:
            if r["room_id"] == r_id and r["rater_id"] == rater and r["ratee_id"] == ratee:
                r["rating"] = int(payload["rating"])
                r["feedback"] = payload.get("feedback")
                r["updated_at"] = now_iso
                return r

        new_record = {
            "id": str(uuid.uuid4()),
            "room_id": r_id,
            "rater_id": rater,
            "ratee_id": ratee,
            "rating": int(payload["rating"]),
            "feedback": payload.get("feedback"),
            "created_at": now_iso,
            "updated_at": now_iso,
        }
        _in_memory_ratings.append(new_record)
        return new_record

    @staticmethod
    def get_ratings_for_user(user_id: str) -> List[Dict[str, Any]]:
        if supabase:
            try:
                res = (
                    supabase.table(TABLE)
                    .select("*")
                    .eq("ratee_id", str(user_id))
                    .order("created_at", desc=True)
                    .execute()
                )
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as exc:
                logger.warning(f"Supabase get_ratings_for_user failed ({exc}); falling back to in-memory store.")

        # Fallback
        return [r for r in _in_memory_ratings if str(r.get("ratee_id")) == str(user_id)]

    @staticmethod
    def get_ratings_by_room(room_id: str) -> List[Dict[str, Any]]:
        if supabase:
            try:
                res = (
                    supabase.table(TABLE)
                    .select("*")
                    .eq("room_id", str(room_id))
                    .order("created_at", desc=True)
                    .execute()
                )
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as exc:
                logger.warning(f"Supabase get_ratings_by_room failed ({exc}); falling back to in-memory store.")

        # Fallback
        return [r for r in _in_memory_ratings if str(r.get("room_id")) == str(room_id)]

    @staticmethod
    def get_ratings_by_rater_in_room(room_id: str, rater_id: str) -> List[Dict[str, Any]]:
        if supabase:
            try:
                res = (
                    supabase.table(TABLE)
                    .select("*")
                    .eq("room_id", str(room_id))
                    .eq("rater_id", str(rater_id))
                    .execute()
                )
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as exc:
                logger.warning(f"Supabase get_ratings_by_rater_in_room failed ({exc}); falling back to in-memory store.")

        # Fallback
        return [
            r for r in _in_memory_ratings
            if str(r.get("room_id")) == str(room_id) and str(r.get("rater_id")) == str(rater_id)
        ]

    @staticmethod
    def get_rating(room_id: str, rater_id: str, ratee_id: str) -> Optional[Dict[str, Any]]:
        if supabase:
            try:
                res = (
                    supabase.table(TABLE)
                    .select("*")
                    .eq("room_id", str(room_id))
                    .eq("rater_id", str(rater_id))
                    .eq("ratee_id", str(ratee_id))
                    .execute()
                )
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as exc:
                logger.warning(f"Supabase get_rating failed ({exc}); falling back to in-memory store.")

        # Fallback
        for r in _in_memory_ratings:
            if (
                str(r.get("room_id")) == str(room_id)
                and str(r.get("rater_id")) == str(rater_id)
                and str(r.get("ratee_id")) == str(ratee_id)
            ):
                return r
        return None


# Module instance alias
peer_rating_model = PeerRatingModel()


# Compatibility helpers for Member 2
def upsert_rating(rater_id: str, ratee_id: str, score: int) -> Dict[str, Any]:
    return PeerRatingModel.create_or_update_rating({
        "room_id": "general",
        "rater_id": rater_id,
        "ratee_id": ratee_id,
        "rating": score,
    })


def get_average_score(ratee_id: str) -> float:
    ratings = PeerRatingModel.get_ratings_for_user(ratee_id)
    if not ratings:
        return 0.0
    return sum(int(r.get("rating", r.get("score", 0))) for r in ratings) / len(ratings)
