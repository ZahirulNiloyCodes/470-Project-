from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from controllers import chat_controller
from websocket.chat_ws import chat_manager
from schemas.chat_schema import MessageCreate, MessageUpdate

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/{room_id}/messages")
def get_messages(room_id: str):
    return {"messages": chat_controller.list_messages(room_id)}


@router.websocket("/ws/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: str):
    await chat_manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("type")

            try:
                if action == "new":
                    payload = MessageCreate(**data["payload"])
                    message = chat_controller.send_message(
                        payload.room_id, payload.user_id, payload.username, payload.content
                    )
                    await chat_manager.broadcast(room_id, {"type": "new", "message": message})

                elif action == "edit":
                    message_id = data["message_id"]
                    user_id = data["user_id"]
                    payload = MessageUpdate(content=data["content"])
                    message = chat_controller.edit_message(message_id, user_id, payload.content)
                    await chat_manager.broadcast(room_id, {"type": "edit", "message": message})

                elif action == "delete":
                    message_id = data["message_id"]
                    user_id = data["user_id"]
                    message = chat_controller.delete_message(message_id, user_id)
                    await chat_manager.broadcast(
                        room_id, {"type": "delete", "message_id": message_id, "message": message}
                    )
            except HTTPException as exc:
                await websocket.send_json({"type": "error", "detail": exc.detail})

    except WebSocketDisconnect:
        chat_manager.disconnect(room_id, websocket)