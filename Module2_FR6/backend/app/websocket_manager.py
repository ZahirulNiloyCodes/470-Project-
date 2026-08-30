from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        room_id: str
    ):
        await websocket.accept()

        if room_id not in self.rooms:
            self.rooms[room_id] = []

        self.rooms[room_id].append(websocket)

    def disconnect(
        self,
        websocket: WebSocket,
        room_id: str
    ):
        if room_id not in self.rooms:
            return

        if websocket in self.rooms[room_id]:
            self.rooms[room_id].remove(websocket)

        if not self.rooms[room_id]:
            del self.rooms[room_id]

    async def broadcast(
        self,
        room_id: str,
        message: dict
    ):
        if room_id not in self.rooms:
            return

        disconnected = []

        for websocket in self.rooms[room_id]:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(websocket, room_id)


manager = ConnectionManager()