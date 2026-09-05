import pytest
from models.flashcard_model import FlashcardModel
from models import flashcard_model as flashcard_model_module


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(flashcard_model_module, "supabase", fake_supabase)
    return fake_supabase


def test_save_deck_inserts_row(patch_supabase):
    payload = {
        "user_id": "11111111-1111-4111-a111-111111111111",
        "room_id": "room-1",
        "title": "Data Structures",
        "cards": [
            {"question": "What is a queue?", "answer": "FIFO data structure"},
            {"question": "What is a stack?", "answer": "LIFO data structure"},
        ],
    }
    saved = FlashcardModel.save_deck(payload)
    assert saved["title"] == "Data Structures"
    assert len(saved["cards"]) == 2
    assert "id" in saved


def test_get_user_decks(patch_supabase):
    FlashcardModel.save_deck({
        "user_id": "user-fc-1",
        "title": "Algorithms",
        "cards": [{"question": "Q1", "answer": "A1"}],
    })
    FlashcardModel.save_deck({
        "user_id": "user-fc-2",
        "title": "Databases",
        "cards": [{"question": "Q2", "answer": "A2"}],
    })

    decks = FlashcardModel.get_user_decks("user-fc-1")
    assert len(decks) == 1
    assert decks[0]["title"] == "Algorithms"
