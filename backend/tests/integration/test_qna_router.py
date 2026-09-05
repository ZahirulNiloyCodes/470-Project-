import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from main import app
from controllers import qna_controller


@pytest.fixture
def client():
    return TestClient(app)


def test_get_questions_host_view(client, monkeypatch):
    monkeypatch.setattr(
        qna_controller,
        "list_questions_for_host",
        lambda room_id: [{"id": "q1", "participant_id": "p1", "question": "Q1"}],
    )
    response = client.get("/qna/room-1/questions?view=host")
    assert response.status_code == 200
    assert response.json()["questions"][0]["participant_id"] == "p1"


def test_get_questions_participant_view_default(client, monkeypatch):
    monkeypatch.setattr(
        qna_controller,
        "list_questions_for_participants",
        lambda room_id: [{"id": "q1", "question": "Q1"}],
    )
    response = client.get("/qna/room-1/questions")
    assert response.status_code == 200
    assert "participant_id" not in response.json()["questions"][0]


def test_get_queue_position_endpoint(client, monkeypatch):
    monkeypatch.setattr(qna_controller, "get_queue_position", lambda qid: 3)
    response = client.get("/qna/questions/q1/position")
    assert response.status_code == 200
    assert response.json() == {"position": 3}


def test_participant_submits_question_broadcast_to_host_and_participants(client, monkeypatch):
    fake_question = {
        "id": "q1", "room_id": "room-1", "participant_id": "p1",
        "question": "What is FastAPI?", "status": "pending", "answer": None,
    }
    monkeypatch.setattr(qna_controller, "submit_question", lambda *a, **kw: fake_question)

    with client.websocket_connect("/qna/ws/room-1/host") as host_ws:
        with client.websocket_connect("/qna/ws/room-1/participant") as participant_ws:
            participant_ws.send_json({
                "type": "submit",
                "payload": {"room_id": "room-1", "participant_id": "p1", "question": "What is FastAPI?"},
            })

            host_received = host_ws.receive_json()
            participant_received = participant_ws.receive_json()

            assert host_received["type"] == "new"
            assert host_received["question"]["participant_id"] == "p1"

            assert participant_received["type"] == "new"
            assert "participant_id" not in participant_received["question"]


def test_participant_submit_error_only_sent_to_sender(client, monkeypatch):
    def raise_error(*a, **kw):
        raise HTTPException(status_code=400, detail="Question is too long")

    monkeypatch.setattr(qna_controller, "submit_question", raise_error)

    with client.websocket_connect("/qna/ws/room-1/participant") as ws:
        ws.send_json({
            "type": "submit",
            "payload": {"room_id": "room-1", "participant_id": "p1", "question": "x" * 2001},
        })
        received = ws.receive_json()
        assert received["type"] == "error"
        assert "too long" in received["detail"]


def test_host_answers_question_broadcast_strips_id_for_participants(client, monkeypatch):
    answered_question = {
        "id": "q1", "room_id": "room-1", "participant_id": "p1",
        "question": "Q1", "status": "answered", "answer": "The answer",
    }
    monkeypatch.setattr(qna_controller, "answer_question", lambda *a, **kw: answered_question)

    with client.websocket_connect("/qna/ws/room-1/host") as host_ws:
        with client.websocket_connect("/qna/ws/room-1/participant") as participant_ws:
            host_ws.send_json({"type": "answer", "question_id": "q1", "answer": "The answer"})

            host_received = host_ws.receive_json()
            participant_received = participant_ws.receive_json()

            assert host_received["question"]["participant_id"] == "p1"
            assert "participant_id" not in participant_received["question"]
            assert participant_received["question"]["answer"] == "The answer"


def test_host_dismisses_question_broadcasts_to_both(client, monkeypatch):
    dismissed_question = {
        "id": "q1", "room_id": "room-1", "participant_id": "p1",
        "question": "Q1", "status": "dismissed",
    }
    monkeypatch.setattr(qna_controller, "dismiss_question", lambda *a, **kw: dismissed_question)

    with client.websocket_connect("/qna/ws/room-1/host") as host_ws:
        with client.websocket_connect("/qna/ws/room-1/participant") as participant_ws:
            host_ws.send_json({"type": "dismiss", "question_id": "q1"})

            host_received = host_ws.receive_json()
            participant_received = participant_ws.receive_json()

            assert host_received["type"] == "dismissed"
            assert participant_received["type"] == "dismissed"


def test_host_answer_error_sent_only_to_host(client, monkeypatch):
    def raise_error(*a, **kw):
        raise HTTPException(status_code=404, detail="Question not found")

    monkeypatch.setattr(qna_controller, "answer_question", raise_error)

    with client.websocket_connect("/qna/ws/room-1/host") as ws:
        ws.send_json({"type": "answer", "question_id": "nonexistent", "answer": "hi"})
        received = ws.receive_json()
        assert received["type"] == "error"
        assert received["detail"] == "Question not found"