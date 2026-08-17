from typing import Dict, Any, List
from config.supabase import supabase

class FlashcardModel:
    @staticmethod
    def save_deck(payload: Dict[str, Any]) -> Dict[str, Any]:
        if not supabase:
            raise Exception("Supabase credentials not configured.")
        res = supabase.table("flashcard_decks").insert(payload).execute()
        return res.data[0]

    @staticmethod
    def get_user_decks(user_id: str) -> List[Dict[str, Any]]:
        if not supabase:
            return []
        return supabase.table("flashcard_decks").select("*").eq("user_id", user_id).execute().data or []
