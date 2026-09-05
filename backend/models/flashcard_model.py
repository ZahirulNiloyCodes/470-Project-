import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from config.supabase import supabase

logger = logging.getLogger(__name__)

_in_memory_decks: List[Dict[str, Any]] = [
    {
        "id": "11111111-aaaa-bbbb-cccc-111111111111",
        "user_id": "11111111-1111-4111-a111-111111111111",
        "room_id": None,
        "title": "Operating Systems Core Concepts",
        "cards": [
            {
                "question": "What is the primary role of an Operating System?",
                "answer": "To manage computer hardware, execute software programs, and provide common services.",
            },
            {
                "question": "What is Deadlock and what are the 4 Coffman conditions?",
                "answer": "A state where processes are blocked waiting for resources. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.",
            },
            {
                "question": "Explain Virtual Memory and Paging.",
                "answer": "Virtual Memory allows execution of processes larger than physical RAM by mapping virtual addresses to page frames in physical memory.",
            },
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
]


class FlashcardModel:
    @staticmethod
    def save_deck(payload: Dict[str, Any]) -> Dict[str, Any]:
        if supabase:
            try:
                res = supabase.table("flashcard_decks").insert(payload).execute()
                if res.data:
                    return res.data[0]
            except Exception as exc:
                logger.warning(f"Supabase flashcard insert failed ({exc}); falling back to in-memory store.")

        # In-memory fallback
        new_deck = dict(payload)
        new_deck.setdefault("id", str(uuid.uuid4()))
        new_deck.setdefault("created_at", datetime.now(timezone.utc).isoformat())
        _in_memory_decks.insert(0, new_deck)
        return new_deck

    @staticmethod
    def get_user_decks(user_id: str) -> List[Dict[str, Any]]:
        if supabase:
            try:
                res = supabase.table("flashcard_decks").select("*").eq("user_id", str(user_id)).execute()
                if res.data is not None and len(res.data) > 0:
                    return res.data
            except Exception as exc:
                logger.warning(f"Supabase get_user_decks failed ({exc}); falling back to in-memory store.")

        # In-memory fallback
        return [d for d in _in_memory_decks if str(d.get("user_id")) == str(user_id)]

