from typing import Dict, List, Optional
from fastapi import WebSocket


class ScreenShareConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # কোন websocket কোন participant_id-এর, সেটা track করার জন্য।
        # কারণ disconnect হলে শুধু websocket object পাওয়া যায়,
        # কিন্তু participant_id লাগবে DB session end করার জন্য।
        self.connection_participant: Dict[WebSocket, Optional[str]] = {}

    async def connect(self, room_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.setdefault(room_id, []).append(websocket)
        self.connection_participant[websocket] = None

    def set_participant(self, websocket: WebSocket, participant_id: Optional[str]) -> None:
        """প্রথম 'start' মেসেজ আসার সময় এই websocket কার (কোন participant_id-এর), সেটা রেকর্ড করি।"""
        if participant_id:
            self.connection_participant[websocket] = participant_id

    def get_participant(self, websocket: WebSocket) -> Optional[str]:
        return self.connection_participant.get(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket) -> None:
        conns = self.active_connections.get(room_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns and room_id in self.active_connections:
            del self.active_connections[room_id]

        self.connection_participant.pop(websocket, None)

    async def broadcast(self, room_id: str, message: dict) -> None:
        for conn in self.active_connections.get(room_id, []):
            await conn.send_json(message)


screenshare_manager = ScreenShareConnectionManager()