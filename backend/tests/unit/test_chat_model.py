import pytest
from models import chat_model


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch, fake_supabase):
    monkeypatch.setattr(chat_model, "supabase", fake_supabase)
    return fake_supabase


def test_create_message_inserts_row(patch_supabase):
    msg = chat_model.create_message("room-1", "user-1", "Alice", "Hello")

    assert msg["room_id"] == "room-1"
    assert msg["content"] == "Hello"
    assert msg["is_edited"] is False
    assert msg["is_deleted"] is False
    assert "id" in msg


def test_get_messages_by_room_returns_only_that_room(patch_supabase):
    chat_model.create_message("room-1", "user-1", "Alice", "Hi")
    chat_model.create_message("room-2", "user-2", "Bob", "Hey")

    result = chat_model.get_messages_by_room("room-1")

    assert len(result) == 1
    assert result[0]["username"] == "Alice"


def test_get_message_by_id_returns_none_if_missing(patch_supabase):
    assert chat_model.get_message_by_id("nonexistent") is None


def test_get_message_by_id_returns_row(patch_supabase):
    created = chat_model.create_message("room-1", "user-1", "Alice", "Hi")
    fetched = chat_model.get_message_by_id(created["id"])
    assert fetched["content"] == "Hi"


def test_update_message_sets_content_and_is_edited(patch_supabase):
    created = chat_model.create_message("room-1", "user-1", "Alice", "Hi")
    updated = chat_model.update_message(created["id"], "Hi edited")

    assert updated["content"] == "Hi edited"
    assert updated["is_edited"] is True


def test_soft_delete_message_marks_deleted_and_clears_content(patch_supabase):
    created = chat_model.create_message("room-1", "user-1", "Alice", "Hi")
    deleted = chat_model.soft_delete_message(created["id"])

    assert deleted["is_deleted"] is True
    assert deleted["content"] == ""