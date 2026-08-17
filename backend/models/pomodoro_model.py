from typing import Dict, Any

class PomodoroRoomState:
    _states: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def get_or_create(cls, room_id: str) -> Dict[str, Any]:
        if room_id not in cls._states:
            cls._states[room_id] = {
                "remaining_seconds": 25 * 60,
                "is_running": False,
                "mode": "WORK",
                "host_id": None
            }
        return cls._states[room_id]

    @classmethod
    def update(cls, room_id: str, state: Dict[str, Any]):
        cls._states[room_id] = state
