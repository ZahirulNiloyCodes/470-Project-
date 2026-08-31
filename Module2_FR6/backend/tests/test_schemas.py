# Unit test
import uuid

import pytest
from pydantic import ValidationError

from app.schemas import CreateMessage, UpdateMessage


def test_create_message_valid():
    data = CreateMessage(
        room_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        username="Test User",
        content="Test message",
    )

    assert data.username == "Test User"
    assert data.content == "Test message"


def test_create_message_empty_content():
    with pytest.raises(ValidationError):
        CreateMessage(
            room_id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            username="Test User",
            content="",
        )


def test_update_message_valid():
    data = UpdateMessage(
        content="Updated message"
    )

    assert data.content == "Updated message"


def test_update_message_empty_content():
    with pytest.raises(ValidationError):
        UpdateMessage(content="")