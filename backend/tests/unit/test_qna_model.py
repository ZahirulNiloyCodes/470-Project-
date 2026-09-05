import pytest
from models import qna_model


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(qna_model, "supabase", fake_supabase)
    return fake_supabase


def test_create_question_inserts_with_pending_status(patch_supabase):
    q = qna_model.create_question("room-1", "part-1", "What is FastAPI?")

    assert q["room_id"] == "room-1"
    assert q["participant_id"] == "part-1"
    assert q["status"] == "pending"
    assert "id" in q


def test_create_question_allows_null_participant_id(patch_supabase):
    q = qna_model.create_question("room-1", None, "Anonymous question here")
    assert q["participant_id"] is None


def test_get_questions_by_room_filters_by_room(patch_supabase):
    qna_model.create_question("room-1", "p1", "Q1 in room 1")
    qna_model.create_question("room-2", "p2", "Q2 in room 2")

    result = qna_model.get_questions_by_room("room-1")

    assert len(result) == 1
    assert result[0]["question"] == "Q1 in room 1"


def test_get_questions_by_room_filters_by_status(patch_supabase):
    q1 = qna_model.create_question("room-1", "p1", "Pending question")
    q2 = qna_model.create_question("room-1", "p2", "Will be answered")
    qna_model.answer_question(q2["id"], "Here's the answer")

    pending_only = qna_model.get_questions_by_room("room-1", status="pending")
    answered_only = qna_model.get_questions_by_room("room-1", status="answered")

    assert len(pending_only) == 1
    assert pending_only[0]["id"] == q1["id"]
    assert len(answered_only) == 1
    assert answered_only[0]["id"] == q2["id"]


def test_get_question_by_id_returns_none_when_missing(patch_supabase):
    assert qna_model.get_question_by_id("nonexistent") is None


def test_answer_question_sets_status_and_answer(patch_supabase):
    q = qna_model.create_question("room-1", "p1", "Question text")
    answered = qna_model.answer_question(q["id"], "This is the answer")

    assert answered["status"] == "answered"
    assert answered["answer"] == "This is the answer"
    assert answered["answered_at"] is not None


def test_dismiss_question_sets_status_dismissed(patch_supabase):
    q = qna_model.create_question("room-1", "p1", "Question text")
    dismissed = qna_model.dismiss_question(q["id"])

    assert dismissed["status"] == "dismissed"
    assert dismissed["dismissed_at"] is not None


def test_get_queue_position_first_question_is_position_1(patch_supabase):
    q = qna_model.create_question("room-1", "p1", "First question")
    position = qna_model.get_queue_position(q["id"])
    assert position == 1


def test_get_queue_position_accounts_for_earlier_pending_questions(patch_supabase):
    q1 = qna_model.create_question("room-1", "p1", "First")
    q2 = qna_model.create_question("room-1", "p2", "Second")

    position_of_q2 = qna_model.get_queue_position(q2["id"])
    assert position_of_q2 == 2


def test_get_queue_position_ignores_answered_questions(patch_supabase):
    q1 = qna_model.create_question("room-1", "p1", "First")
    qna_model.answer_question(q1["id"], "answered already")

    q2 = qna_model.create_question("room-1", "p2", "Second")

    position_of_q2 = qna_model.get_queue_position(q2["id"])
    assert position_of_q2 == 1