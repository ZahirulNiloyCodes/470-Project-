import pytest
from fastapi.testclient import TestClient
from main import app
from controllers import chat_controller

@pytest.fixture
def client():
    return TestClient(app)


def test_get_messages_endpoint(client, monkeypatch):
    monkeypatch.setattr(
        chat_controller,
        "list_messages",
        lambda room_id: [{"id": "m1", "content": "hi"}],
    )
    response = client.get("/chat/room-1/messages")
    assert response.status_code == 200
    assert response.json() == {"messages": [{"id": "m1", "content": "hi"}]}


def test_websocket_new_message_broadcasts_to_all_including_sender(client, monkeypatch):
    fake_msg = {
        "id": "m1", "room_id": "room-1", "user_id": "u1", "username": "Alice",
        "content": "Hello", "is_edited": False, "is_deleted": False,
        "created_at": "2024-01-01T00:00:00Z", "updated_at": "2024-01-01T00:00:00Z",
    }
    monkeypatch.setattr(chat_controller, "send_message", lambda *a, **kw: fake_msg)

    with client.websocket_connect("/chat/ws/room-1") as ws1:
        ws1.send_json({
            "type": "new",
            "payload": {"room_id": "room-1", "user_id": "u1", "username": "Alice", "content": "Hello"},
        })
        received = ws1.receive_json()
        assert received["type"] == "new"
        assert received["message"]["content"] == "Hello"


def test_websocket_edit_message_broadcasts(client, monkeypatch):
    edited_msg = {"id": "m1", "content": "edited", "is_edited": True}
    monkeypatch.setattr(chat_controller, "edit_message", lambda *a, **kw: edited_msg)

    with client.websocket_connect("/chat/ws/room-1") as ws:
        ws.send_json({"type": "edit", "message_id": "m1", "user_id": "u1", "content": "edited"})
        received = ws.receive_json()
        assert received["type"] == "edit"
        assert received["message"]["content"] == "edited"


def test_websocket_delete_message_broadcasts(client, monkeypatch):
    deleted_msg = {"id": "m1", "is_deleted": True, "content": ""}
    monkeypatch.setattr(chat_controller, "delete_message", lambda *a, **kw: deleted_msg)

    with client.websocket_connect("/chat/ws/room-1") as ws:
        ws.send_json({"type": "delete", "message_id": "m1", "user_id": "u1"})
        received = ws.receive_json()
        assert received["type"] == "delete"
        assert received["message_id"] == "m1"


def test_websocket_sends_error_on_forbidden_edit(client, monkeypatch):
    from fastapi import HTTPException

    def raise_forbidden(*a, **kw):
        raise HTTPException(status_code=403, detail="You can only edit your own messages")

    monkeypatch.setattr(chat_controller, "edit_message", raise_forbidden)

    with client.websocket_connect("/chat/ws/room-1") as ws:
        ws.send_json({"type": "edit", "message_id": "m1", "user_id": "u2", "content": "hack"})
        received = ws.receive_json()
        assert received["type"] == "error"
        assert "own messages" in received["detail"]