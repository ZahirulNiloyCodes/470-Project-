from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from controllers.pomodoro_controller import PomodoroController

router = APIRouter(prefix="/ws/pomodoro", tags=["Pomodoro Realtime"])

@router.websocket("/{room_id}")
async def pomodoro_ws(websocket: WebSocket, room_id: str):
    await PomodoroController.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await PomodoroController.handle_action(room_id, data)
    except WebSocketDisconnect:
        PomodoroController.disconnect(room_id, websocket)
