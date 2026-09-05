from typing import Dict, List
from fastapi import WebSocket


class QnAConnectionManager:
    """
    দুই ধরনের connection আলাদা রাখছি: host এবং participant.
    কারণ host broadcast এ participant_id সহ full data পাবে,
    participant broadcast এ participant_id বাদ দিয়ে পাঠানো হবে (anonymity বজায় রাখতে)।
    """

    def __init__(self) -> None:
        self.host_connections: Dict[str, List[WebSocket]] = {}
        self.participant_connections: Dict[str, List[WebSocket]] = {}

    async def connect_host(self, room_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.host_connections.setdefault(room_id, []).append(websocket)

    async def connect_participant(self, room_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.participant_connections.setdefault(room_id, []).append(websocket)

    def disconnect_host(self, room_id: str, websocket: WebSocket) -> None:
        conns = self.host_connections.get(room_id, [])
        if websocket in conns:
            conns.remove(websocket)

    def disconnect_participant(self, room_id: str, websocket: WebSocket) -> None:
        conns = self.participant_connections.get(room_id, [])
        if websocket in conns:
            conns.remove(websocket)

    async def broadcast_to_host(self, room_id: str, message: dict) -> None:
        for conn in list(self.host_connections.get(room_id, [])):
            try:
                await conn.send_json(message)
            except Exception:
                self.disconnect_host(room_id, conn)

    async def broadcast_to_participants(self, room_id: str, message: dict) -> None:
        # participant_id anonymize করে পাঠানো
        safe_message = dict(message)
        if safe_message.get("question"):
            safe_question = dict(safe_message["question"])
            safe_question.pop("participant_id", None)
            safe_message["question"] = safe_question

        for conn in list(self.participant_connections.get(room_id, [])):
            try:
                await conn.send_json(safe_message)
            except Exception:
                self.disconnect_participant(room_id, conn)

    async def broadcast_all(self, room_id: str, message: dict) -> None:
        await self.broadcast_to_host(room_id, message)
        await self.broadcast_to_participants(room_id, message)


qna_manager = QnAConnectionManager()