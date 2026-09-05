import pytest
from controllers.pomodoro_controller import PomodoroController
from models.pomodoro_model import PomodoroRoomState


@pytest.fixture
def mock_broadcast(monkeypatch):
    broadcast_messages = []
    async def fake_broadcast(r_id, msg):
        broadcast_messages.append(msg)
    monkeypatch.setattr(PomodoroController, "broadcast", fake_broadcast)
    return broadcast_messages


@pytest.mark.anyio
async def test_pomodoro_handle_start_action(mock_broadcast):
    room_id = "test-pomo-ctrl-1"
    await PomodoroController.handle_action(room_id, {"action": "START"})
    state = PomodoroRoomState.get_or_create(room_id)
    assert state["is_running"] is True


@pytest.mark.anyio
async def test_pomodoro_handle_pause_action(mock_broadcast):
    room_id = "test-pomo-ctrl-2"
    await PomodoroController.handle_action(room_id, {"action": "START"})
    await PomodoroController.handle_action(room_id, {"action": "PAUSE"})
    state = PomodoroRoomState.get_or_create(room_id)
    assert state["is_running"] is False


@pytest.mark.anyio
async def test_pomodoro_handle_reset_action(mock_broadcast):
    room_id = "test-pomo-ctrl-3"
    state = PomodoroRoomState.get_or_create(room_id)
    state["remaining_seconds"] = 120
    await PomodoroController.handle_action(room_id, {"action": "RESET"})
    assert state["remaining_seconds"] == 25 * 60
    assert state["is_running"] is False


@pytest.mark.anyio
async def test_pomodoro_handle_set_mode(mock_broadcast):
    room_id = "test-pomo-ctrl-4"
    await PomodoroController.handle_action(room_id, {"action": "SET_MODE", "mode": "BREAK", "duration_minutes": 5})
    state = PomodoroRoomState.get_or_create(room_id)
    assert state["mode"] == "BREAK"
    assert state["remaining_seconds"] == 5 * 60
