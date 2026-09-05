from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from controllers import canvas_controller
from websocket.canvas_ws import canvas_manager
from schemas.canvas_schema import CanvasWSMessage

router = APIRouter(prefix="/canvas", tags=["canvas"])


@router.get("/{room_id}/snapshot")
def get_snapshot(room_id: str):
    return {"records": canvas_controller.get_canvas_snapshot(room_id)}


@router.websocket("/ws/{room_id}")
async def canvas_ws(websocket: WebSocket, room_id: str):
    await canvas_manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            message = CanvasWSMessage(**data)

            if message.type == "update" and message.records:
                canvas_controller.save_records(room_id, message.records)
            elif message.type == "delete" and message.ids:
                canvas_controller.remove_records(room_id, message.ids)

            await canvas_manager.broadcast(room_id, message.model_dump(), sender=websocket)
    except WebSocketDisconnect:
        canvas_manager.disconnect(room_id, websocket)