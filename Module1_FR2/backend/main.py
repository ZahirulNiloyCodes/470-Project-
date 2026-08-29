# main.py = routes + controller (root endpoint, debug endpoint, websocket endpoint)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

import logging
import asyncio

from database import supabase
from websocket_manager import manager

app = FastAPI()

logger = logging.getLogger(__name__)

# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():

    return {
        "message":
        "Collaborative Canvas Backend is running"
    }


# =========================================================
# DEBUG
# =========================================================

@app.get("/debug/room/{room_id}")
async def debug_room(
    room_id: str
):

    connections = len(
        manager.rooms.get(
            room_id,
            []
        )
    )

    canvas_records = len(
        manager.canvas_states.get(
            room_id,
            {}
        )
    )

    # Also check persistent database count

    database_records = 0

    try:
        response = (
            supabase
            .table("canvas_records")
            .select(
                "record_id",
                count="exact"
            )
            .eq(
                "room_id",
                room_id
            )
            .execute()
        )

        database_records = (
            response.count or 0
        )

    except Exception as e:

        logger.error(
            f"Failed to read database count: {e}"
        )

    return {
        "room_id": room_id,
        "connections": connections,
        "canvas_records_in_memory": canvas_records,
        "canvas_records_in_database": database_records,
    }


# =========================================================
# WEBSOCKET
# =========================================================

@app.websocket("/ws/canvas/{room_id}")
async def canvas_websocket(
    websocket: WebSocket,
    room_id: str
):

    await manager.connect(
        room_id,
        websocket
    )

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get(
                "type"
            )

            # =============================================
            # REQUEST CURRENT CANVAS
            # =============================================

            if message_type == "request_canvas_state":
                await manager.send_canvas_state(
                    room_id,
                    websocket
                )
                continue

            # =============================================
            # CANVAS CHANGES
            # =============================================

            if message_type == "canvas_changes":
                logger.info(
                    f"Canvas update received "
                    f"from room '{room_id}'"
                )

                # -----------------------------------------
                # 1. Update in-memory state
                # -----------------------------------------

                manager.update_canvas_state(
                    room_id,
                    data
                )

                # -----------------------------------------
                # 2. Broadcast immediately
                #
                # IMPORTANT:
                # Do not wait for Supabase.
                # -----------------------------------------

                await manager.broadcast(
                                room_id,
                                data,
                                websocket
                )

                # -----------------------------------------
                # 3. Persist to Supabase in background
                # -----------------------------------------

                asyncio.create_task(
                    manager.persist_canvas_changes(
                            room_id,
                            data
                    )
                )


    except WebSocketDisconnect:

        logger.info(
            f"WebSocket disconnected "
            f"from room '{room_id}'"
        )

        manager.disconnect(
            room_id,
            websocket
        )

    except Exception as e:

        logger.error(
            f"WebSocket error in room "
            f"'{room_id}': {e}"
        )

        manager.disconnect(
            room_id,
            websocket
        )