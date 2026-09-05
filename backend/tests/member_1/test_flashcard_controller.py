import json
from unittest.mock import MagicMock
import pytest
from controllers.flashcard_controller import FlashcardController
from models.flashcard_model import FlashcardModel
from schemas.flashcard_schema import FlashcardGenerateRequest
import controllers.flashcard_controller as fc_module


def test_flashcard_generate_and_save_with_mocked_openai(monkeypatch):
    mock_ai = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps({
        "cards": [
            {"question": "What is Deadlock?", "answer": "A permanent blocking condition."},
            {"question": "What is Starvation?", "answer": "Indefinite delay of resource access."},
        ]
    })
    mock_ai.chat.completions.create.return_value = MagicMock(choices=[mock_choice])
    monkeypatch.setattr(fc_module, "openai_client", mock_ai)

    user_id = "11111111-1111-4111-a111-111111111111"
    deck_id = "22222222-2222-4222-a222-222222222222"

    saved_deck = {
        "id": deck_id,
        "room_id": None,
        "user_id": user_id,
        "title": "OS Unit 3",
        "cards": [
            {"question": "What is Deadlock?", "answer": "A permanent blocking condition."},
            {"question": "What is Starvation?", "answer": "Indefinite delay of resource access."},
        ],
        "created_at": "2024-01-01T00:00:00Z",
    }
    monkeypatch.setattr(FlashcardModel, "save_deck", lambda payload: saved_deck)

    req = FlashcardGenerateRequest(
        title="OS Unit 3",
        study_notes="Deadlock occurs when processes are waiting on resources held by each other.",
        num_cards=2,
    )
    result = FlashcardController.generate_and_save(req, user_id=user_id)
    assert result.title == "OS Unit 3"
    assert len(result.cards) == 2
    assert result.cards[0].question == "What is Deadlock?"


def test_flashcard_generate_fallback_when_openai_errors(monkeypatch):
    mock_ai = MagicMock()
    mock_ai.chat.completions.create.side_effect = Exception("API connection timeout")
    monkeypatch.setattr(fc_module, "openai_client", mock_ai)

    user_id = "11111111-1111-4111-a111-111111111111"
    deck_id = "33333333-3333-4333-a333-333333333333"

    def mock_save(payload):
        return {
            "id": deck_id,
            "room_id": payload.get("room_id"),
            "user_id": payload["user_id"],
            "title": payload["title"],
            "cards": payload["cards"],
            "created_at": "2024-01-01T00:00:00Z",
        }
    monkeypatch.setattr(FlashcardModel, "save_deck", mock_save)

    req = FlashcardGenerateRequest(
        title="Computer Networks",
        study_notes="TCP provides reliable, ordered stream delivery.",
        num_cards=2,
    )
    result = FlashcardController.generate_and_save(req, user_id=user_id)
    assert result.title == "Computer Networks"
    assert len(result.cards) >= 1
    assert "Computer Networks" in result.cards[0].answer or "TCP" in result.cards[1].answer
