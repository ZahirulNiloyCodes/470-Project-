import pytest
from fastapi import HTTPException
from controllers import qna_controller


class FakeQnAModel:
    def __init__(self):
        self.questions = {}
        self._counter = 0

    def create_question(self, room_id, participant_id, question):
        self._counter += 1
        qid = f"q-{self._counter}"
        q = {
            "id": qid,
            "room_id": room_id,
            "participant_id": participant_id,
            "question": question,
            "status": "pending",
            "answer": None,
        }
        self.questions[qid] = q
        return q

    def get_questions_by_room(self, room_id, status=None):
        result = [q for q in self.questions.values() if q["room_id"] == room_id]
        if status:
            result = [q for q in result if q["status"] == status]
        return result

    def get_question_by_id(self, question_id):
        return self.questions.get(question_id)

    def answer_question(self, question_id, answer):
        q = self.questions[question_id]
        q["status"] = "answered"
        q["answer"] = answer
        return q

    def dismiss_question(self, question_id):
        q = self.questions[question_id]
        q["status"] = "dismissed"
        return q

    def get_queue_position(self, question_id):
        return 1


@pytest.fixture
def fake_model(monkeypatch):
    fake = FakeQnAModel()
    monkeypatch.setattr(qna_controller, "qna_model", fake)
    return fake


def test_submit_question_success(fake_model):
    q = qna_controller.submit_question("room-1", "p1", "What is REST?")
    assert q["question"] == "What is REST?"
    assert q["status"] == "pending"


def test_submit_question_strips_whitespace(fake_model):
    q = qna_controller.submit_question("room-1", "p1", "  Trimmed question  ")
    assert q["question"] == "Trimmed question"


def test_submit_question_rejects_too_short(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.submit_question("room-1", "p1", "hi")
    assert exc_info.value.status_code == 400


def test_submit_question_rejects_too_long(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.submit_question("room-1", "p1", "x" * 2001)
    assert exc_info.value.status_code == 400


def test_submit_question_allows_null_participant(fake_model):
    q = qna_controller.submit_question("room-1", None, "Anonymous question")
    assert q["participant_id"] is None


def test_list_questions_for_host_includes_participant_id(fake_model):
    fake_model.create_question("room-1", "p1", "Q1")
    result = qna_controller.list_questions_for_host("room-1")
    assert result[0]["participant_id"] == "p1"


def test_list_questions_for_participants_strips_participant_id(fake_model):
    fake_model.create_question("room-1", "p1", "Q1")
    result = qna_controller.list_questions_for_participants("room-1")
    assert "participant_id" not in result[0]


def test_list_questions_for_participants_hides_dismissed(fake_model):
    q1 = fake_model.create_question("room-1", "p1", "Pending Q")
    q2 = fake_model.create_question("room-1", "p2", "Dismissed Q")
    fake_model.dismiss_question(q2["id"])

    result = qna_controller.list_questions_for_participants("room-1")

    ids = [q["id"] for q in result]
    assert q1["id"] in ids
    assert q2["id"] not in ids


def test_answer_question_success(fake_model):
    q = fake_model.create_question("room-1", "p1", "Q1")
    answered = qna_controller.answer_question(q["id"], "The answer")
    assert answered["status"] == "answered"
    assert answered["answer"] == "The answer"


def test_answer_question_rejects_empty_answer(fake_model):
    q = fake_model.create_question("room-1", "p1", "Q1")
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.answer_question(q["id"], "   ")
    assert exc_info.value.status_code == 400


def test_answer_question_not_found(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.answer_question("nonexistent", "answer")
    assert exc_info.value.status_code == 404


def test_answer_question_rejects_non_pending(fake_model):
    q = fake_model.create_question("room-1", "p1", "Q1")
    fake_model.dismiss_question(q["id"])
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.answer_question(q["id"], "answer")
    assert exc_info.value.status_code == 400


def test_dismiss_question_success(fake_model):
    q = fake_model.create_question("room-1", "p1", "Q1")
    dismissed = qna_controller.dismiss_question(q["id"])
    assert dismissed["status"] == "dismissed"


def test_dismiss_question_not_found(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.dismiss_question("nonexistent")
    assert exc_info.value.status_code == 404


def test_dismiss_question_rejects_non_pending(fake_model):
    q = fake_model.create_question("room-1", "p1", "Q1")
    fake_model.answer_question(q["id"], "already answered")
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.dismiss_question(q["id"])
    assert exc_info.value.status_code == 400


def test_get_queue_position_not_found(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        qna_controller.get_queue_position("nonexistent")
    assert exc_info.value.status_code == 404


def test_get_queue_position_success(fake_model):
    q = fake_model.create_question("room-1", "p1", "Q1")
    position = qna_controller.get_queue_position(q["id"])
    assert position == 1