from typing import Any, Dict
from config.supabase import supabase

TABLE = "peer_ratings"


def upsert_rating(rater_id: str, ratee_id: str, score: int) -> Dict[str, Any]:
    payload = {"rater_id": rater_id, "ratee_id": ratee_id, "score": score}
    response = supabase.table(TABLE).upsert(payload, on_conflict="rater_id,ratee_id").execute()
    return response.data[0]


def get_average_score(ratee_id: str) -> float:
    response = supabase.table(TABLE).select("score").eq("ratee_id", ratee_id).execute()
    rows = response.data or []
    if not rows:
        return 0.0
    return sum(r["score"] for r in rows) / len(rows)