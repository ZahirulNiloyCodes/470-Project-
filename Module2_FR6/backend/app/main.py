from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import supabase
from .routers.messages import router as messages_router
from .schemas import WebSocketMessage
from .websocket_manager import manager
from .routers.rooms import router as rooms_router


app = FastAPI(
    title="Module 2 FR6 - Real-Time Chat API",
    version="1.0.0"
)

app.include_router(rooms_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(messages_router)


@app.get("/")
async def root():
    return {
        "message": "Module 2 FR6 Chat API is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


@app.websocket("/ws/chat/{room_id}")
async def websocket_chat(
    websocket: WebSocket,
    room_id: str
):

    await manager.connect(
        websocket,
        room_id
    )

    try:

        while True:

            data = await websocket.receive_json()

            payload = WebSocketMessage(
                **data
            )

            if payload.type == "message":

                response = (
                    supabase
                    .table("messages")
                    .insert({
                        "room_id": str(room_id),
                        "user_id": str(payload.user_id),
                        "username": payload.username,
                        "content": payload.content or "",
                    })
                    .execute()
                )

                if response.data:

                    await manager.broadcast(
                        room_id,
                        {
                            "type": "message",
                            "data": response.data[0]
                        }
                    )

            elif payload.type == "edit":

                if not payload.message_id:
                    continue

                response = (
                    supabase
                    .table("messages")
                    .update({
                        "content": payload.content or "",
                        "is_edited": True
                    })
                    .eq("id", str(payload.message_id))
                    .execute()
                )

                if response.data:

                    await manager.broadcast(
                        room_id,
                        {
                            "type": "edit",
                            "data": response.data[0]
                        }
                    )

            elif payload.type == "delete":

                if not payload.message_id:
                    continue

                response = (
                    supabase
                    .table("messages")
                    .update({
                        "is_deleted": True,
                        "content": ""
                    })
                    .eq("id", str(payload.message_id))
                    .execute()
                )

                if response.data:

                    await manager.broadcast(
                        room_id,
                        {
                            "type": "delete",
                            "data": response.data[0]
                        }
                    )

    except WebSocketDisconnect:

        manager.disconnect(
            websocket,
            room_id
        )