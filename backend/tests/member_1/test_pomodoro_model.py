import pytest
from models.pomodoro_model import PomodoroRoomState


def test_pomodoro_get_or_create_default_state():
    state = PomodoroRoomState.get_or_create("test-room-pomo-1")
    assert state["remaining_seconds"] == 25 * 60
    assert state["is_running"] is False
    assert state["mode"] == "WORK"


def test_pomodoro_update_state():
    room_id = "test-room-pomo-2"
    PomodoroRoomState.get_or_create(room_id)
    updated = {
        "remaining_seconds": 300,
        "is_running": True,
        "mode": "BREAK",
        "host_id": "u1",
    }
    PomodoroRoomState.update(room_id, updated)
    fetched = PomodoroRoomState.get_or_create(room_id)
    assert fetched["remaining_seconds"] == 300
    assert fetched["is_running"] is True
    assert fetched["mode"] == "BREAK"
