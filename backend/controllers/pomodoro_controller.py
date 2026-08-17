import asyncio
from typing import Dict, List
from fastapi import WebSocket
from models.pomodoro_model import PomodoroRoomState

class PomodoroController:
    active_connections: Dict[str, List[WebSocket]] = {}
    active_tasks: Dict[str, asyncio.Task] = {}

    @classmethod
    async def connect(cls, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in cls.active_connections:
            cls.active_connections[room_id] = []
        cls.active_connections[room_id].append(websocket)
        state = PomodoroRoomState.get_or_create(room_id)
        await websocket.send_json({"type": "SYNC_STATE", "data": state})

    @classmethod
    def disconnect(cls, room_id: str, websocket: WebSocket):
        if room_id in cls.active_connections and websocket in cls.active_connections[room_id]:
            cls.active_connections[room_id].remove(websocket)

    @classmethod
    async def broadcast(cls, room_id: str, message: dict):
        if room_id in cls.active_connections:
            for conn in cls.active_connections[room_id]:
                await conn.send_json(message)

    @classmethod
    async def _timer_loop(cls, room_id: str):
        while True:
            await asyncio.sleep(1)
            state = PomodoroRoomState.get_or_create(room_id)
            if state["is_running"] and state["remaining_seconds"] > 0:
                state["remaining_seconds"] -= 1
                await cls.broadcast(room_id, {"type": "TICK", "data": state})
            elif state["remaining_seconds"] <= 0 and state["is_running"]:
                state["is_running"] = False
                await cls.broadcast(room_id, {"type": "FINISHED", "data": state})
                break

    @classmethod
    async def handle_action(cls, room_id: str, action_data: dict):
        state = PomodoroRoomState.get_or_create(room_id)
        action = action_data.get("action")

        if action == "START":
            state["is_running"] = True
            if room_id not in cls.active_tasks or cls.active_tasks[room_id].done():
                cls.active_tasks[room_id] = asyncio.create_task(cls._timer_loop(room_id))
        elif action == "PAUSE":
            state["is_running"] = False
        elif action == "RESET":
            state["is_running"] = False
            state["remaining_seconds"] = 25 * 60 if state["mode"] == "WORK" else 5 * 60
        elif action == "SET_MODE":
            state["mode"] = action_data.get("mode", "WORK")
            mins = action_data.get("duration_minutes", 25)
            state["remaining_seconds"] = mins * 60
            state["is_running"] = False

        PomodoroRoomState.update(room_id, state)
        await cls.broadcast(room_id, {"type": "SYNC_STATE", "data": state})
