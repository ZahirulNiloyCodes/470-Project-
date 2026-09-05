import pytest
from fastapi import HTTPException
from controllers import chat_controller


class FakeChatModel:
    def __init__(self):
        self.messages = {}
        self._counter = 0

    def create_message(self, room_id, user_id, username, content):
        self._counter += 1
        msg_id = f"msg-{self._counter}"
        msg = {
            "id": msg_id,
            "room_id": room_id,
            "user_id": user_id,
            "username": username,
            "content": content,
            "is_edited": False,
            "is_deleted": False,
        }
        self.messages[msg_id] = msg
        return msg

    def get_messages_by_room(self, room_id):
        return [m for m in self.messages.values() if m["room_id"] == room_id]

    def get_message_by_id(self, message_id):
        return self.messages.get(message_id)

    def update_message(self, message_id, content):
        msg = self.messages[message_id]
        msg["content"] = content
        msg["is_edited"] = True
        return msg

    def soft_delete_message(self, message_id):
        msg = self.messages[message_id]
        msg["is_deleted"] = True
        msg["content"] = ""
        return msg


@pytest.fixture
def fake_model(monkeypatch):
    fake = FakeChatModel()
    monkeypatch.setattr(chat_controller, "chat_model", fake)
    return fake


def test_send_message_success(fake_model):
    msg = chat_controller.send_message("room-1", "user-1", "Alice", "Hello")
    assert msg["content"] == "Hello"


def test_send_message_strips_whitespace(fake_model):
    msg = chat_controller.send_message("room-1", "user-1", "Alice", "  Hello  ")
    assert msg["content"] == "Hello"


def test_send_message_rejects_empty_content(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        chat_controller.send_message("room-1", "user-1", "Alice", "   ")
    assert exc_info.value.status_code == 400


def test_edit_message_success(fake_model):
    msg = fake_model.create_message("room-1", "user-1", "Alice", "Hi")
    updated = chat_controller.edit_message(msg["id"], "user-1", "Hi there")
    assert updated["content"] == "Hi there"
    assert updated["is_edited"] is True


def test_edit_message_not_found(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        chat_controller.edit_message("nonexistent", "user-1", "content")
    assert exc_info.value.status_code == 404


def test_edit_message_forbidden_for_other_user(fake_model):
    msg = fake_model.create_message("room-1", "user-1", "Alice", "Hi")
    with pytest.raises(HTTPException) as exc_info:
        chat_controller.edit_message(msg["id"], "user-2", "hacked")
    assert exc_info.value.status_code == 403


def test_edit_message_rejects_deleted_message(fake_model):
    msg = fake_model.create_message("room-1", "user-1", "Alice", "Hi")
    fake_model.soft_delete_message(msg["id"])
    with pytest.raises(HTTPException) as exc_info:
        chat_controller.edit_message(msg["id"], "user-1", "new content")
    assert exc_info.value.status_code == 400


def test_delete_message_success(fake_model):
    msg = fake_model.create_message("room-1", "user-1", "Alice", "Hi")
    deleted = chat_controller.delete_message(msg["id"], "user-1")
    assert deleted["is_deleted"] is True


def test_delete_message_forbidden_for_other_user(fake_model):
    msg = fake_model.create_message("room-1", "user-1", "Alice", "Hi")
    with pytest.raises(HTTPException) as exc_info:
        chat_controller.delete_message(msg["id"], "user-2")
    assert exc_info.value.status_code == 403


def test_delete_message_not_found(fake_model):
    with pytest.raises(HTTPException) as exc_info:
        chat_controller.delete_message("nonexistent", "user-1")
    assert exc_info.value.status_code == 404