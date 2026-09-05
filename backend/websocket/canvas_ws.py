from typing import Dict, List
from fastapi import WebSocket


class CanvasConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.setdefault(room_id, []).append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket) -> None:
        connections = self.active_connections.get(room_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections and room_id in self.active_connections:
            del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict, sender: WebSocket) -> None:
        for connection in self.active_connections.get(room_id, []):
            if connection is not sender:
                await connection.send_json(message)


canvas_manager = CanvasConnectionManager()