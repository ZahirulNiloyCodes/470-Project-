# websocket_manager.py = ConnectionManager + manager

from fastapi import WebSocket
from typing import Dict, List
from datetime import datetime, timezone

import logging

from database import supabase

logger = logging.getLogger(__name__)

class ConnectionManager:

    def __init__(self):

        # room_id -> connected WebSockets
        self.rooms: Dict[str, List[WebSocket]] = {}

        # room_id -> record_id -> tldraw record
        #
        # This is the in-memory cache.
        # Supabase is the persistent database.
        self.canvas_states: Dict[
            str,
            Dict[str, dict]
        ] = {}


    # =====================================================
    # LOAD CANVAS FROM SUPABASE
    # =====================================================

    async def load_canvas_state_from_database(
        self,
        room_id: str
    ):
        try:
            response = (
                supabase
                .table("canvas_records")
                .select("record_id, record")
                .eq("room_id", room_id)
                .execute()
            )

            records = {}

            for row in response.data:
                records[row["record_id"]] = row["record"]


            self.canvas_states[room_id] = records

            logger.info(
                f"Loaded {len(records)} canvas records "
                f"from Supabase for room '{room_id}'"
            )

        except Exception as e:
            logger.error(
                f"Failed to load canvas state from "
                f"Supabase for room '{room_id}': {e}"
            )

            # Keep the application usable even if
            # database is temporarily unavailable.
            if room_id not in self.canvas_states:
                self.canvas_states[room_id] = {}


    # =====================================================
    # CONNECT
    # =====================================================

    async def connect(
        self,
        room_id: str,
        websocket: WebSocket
    ):

        await websocket.accept()

        if room_id not in self.rooms:
            self.rooms[room_id] = []

        self.rooms[room_id].append(websocket)


        # -------------------------------------------------
        # Load persistent state only when this room is
        # not already loaded in memory.
        # -------------------------------------------------

        if room_id not in self.canvas_states:
            await self.load_canvas_state_from_database(
                room_id
            )


        logger.info(
            f"Client connected to room '{room_id}'. "
            f"Total clients: {len(self.rooms[room_id])}"
        )


        # -------------------------------------------------
        # Send current canvas to newly connected client
        # -------------------------------------------------

        await self.send_canvas_state(
            room_id,
            websocket
        )


    # =====================================================
    # DISCONNECT
    # =====================================================

    def disconnect(
        self,
        room_id: str,
        websocket: WebSocket
    ):

        if room_id not in self.rooms:
            return

        if websocket in self.rooms[room_id]:
            self.rooms[room_id].remove(
                websocket
            )

        remaining = len(
            self.rooms[room_id]
        )

        logger.info(
            f"Client disconnected from room "
            f"'{room_id}'. "
            f"Remaining clients: {remaining}"
        )

        # -------------------------------------------------
        # IMPORTANT:
        #
        # Do NOT delete canvas_states.
        #
        # Supabase also contains the persistent copy.
        # -------------------------------------------------

        if remaining == 0:
            del self.rooms[room_id]

            logger.info(
                f"No active clients in room "
                f"'{room_id}'. "
                f"Canvas state remains in memory "
                f"and Supabase."
            )


    # =====================================================
    # UPDATE IN-MEMORY CANVAS STATE
    # =====================================================

    def update_canvas_state(
        self,
        room_id: str,
        message: dict
    ):

        if room_id not in self.canvas_states:
            self.canvas_states[room_id] = {}

        changes = message.get(
            "changes",
            {}
        )

        # -----------------------------
        # Added
        # -----------------------------

        added = changes.get(
            "added",
            {}
        )

        for record_id, record in added.items():

            self.canvas_states[room_id][
                record_id
            ] = record

        # -----------------------------
        # Updated
        # -----------------------------

        updated = changes.get(
            "updated",
            {}
        )

        for record_id, change in updated.items():

            if (
                isinstance(change, list)
                and len(change) >= 2
            ):
                new_record = change[1]

                self.canvas_states[room_id][
                    record_id
                ] = new_record

        # -----------------------------
        # Removed
        # -----------------------------

        removed = changes.get(
            "removed",
            {}
        )

        for record_id in removed.keys():
            self.canvas_states[room_id].pop(
                record_id,
                None
            )

        logger.info(
            f"Canvas state updated for room "
            f"'{room_id}'. "
            f"Total records: "
            f"{len(self.canvas_states[room_id])}"
        )

    # =====================================================
    # PERSIST CANVAS CHANGES TO SUPABASE
    # =====================================================

    async def persist_canvas_changes(
        self,
        room_id: str,
        message: dict
    ):

        changes = message.get(
            "changes",
            {}
        )

        added = changes.get(
            "added",
            {}
        )

        updated = changes.get(
            "updated",
            {}
        )

        removed = changes.get(
            "removed",
            {}
        )

        # -------------------------------------------------
        # INSERT / UPDATE
        # -------------------------------------------------

        rows_to_upsert = []

        current_time = (
            datetime
            .now(timezone.utc)
            .isoformat()
        )

        # Added records

        for record_id, record in added.items():
            rows_to_upsert.append({
                "room_id": room_id,
                "record_id": record_id,
                "record": record,
                "updated_at": current_time,
            })

        # Updated records

        for record_id, change in updated.items():
            if (
                isinstance(change, list)
                and len(change) >= 2
            ):
                
                new_record = change[1]

                rows_to_upsert.append({
                    "room_id": room_id,
                    "record_id": record_id,
                    "record": new_record,
                    "updated_at": current_time,
                })

        try:
            if rows_to_upsert:
                (
                    supabase
                    .table("canvas_records")
                    .upsert(
                        rows_to_upsert,
                        on_conflict="room_id,record_id"
                    )
                    .execute()
                )

                logger.info(
                    f"Saved {len(rows_to_upsert)} "
                    f"canvas records to Supabase "
                    f"for room '{room_id}'"
                )

            # -------------------------------------------------
            # DELETE
            # -------------------------------------------------

            if removed:
                record_ids = list(
                    removed.keys()
                )

                (
                    supabase
                    .table("canvas_records")
                    .delete()
                    .eq(
                        "room_id",
                        room_id
                    )
                    .in_(
                        "record_id",
                        record_ids
                    )
                    .execute()
                )

                logger.info(
                    f"Deleted {len(record_ids)} "
                    f"canvas records from Supabase "
                    f"for room '{room_id}'"
                )


        except Exception as e:
            logger.error(
                f"Failed to persist canvas changes "
                f"to Supabase for room "
                f"'{room_id}': {e}"
            )

    # =====================================================
    # SEND CURRENT CANVAS TO ONE CLIENT
    # =====================================================

    async def send_canvas_state(
        self,
        room_id: str,
        websocket: WebSocket
    ):

        records = list(
            self.canvas_states
            .get(
                room_id,
                {}
            )
            .values()
        )

        await websocket.send_json({
            "type": "canvas_state",
            "records": records,
        })

        logger.info(
            f"Sent canvas state to client "
            f"in room '{room_id}'. "
            f"Records: {len(records)}"
        )

    # =====================================================
    # BROADCAST
    # =====================================================

    async def broadcast(
        self,
        room_id: str,
        message: dict,
        sender: WebSocket
    ):

        if room_id not in self.rooms:
            return

        disconnected = []

        for connection in self.rooms[room_id]:
            if connection == sender:
                continue

            try:
                await connection.send_json(
                    message
                )

            except Exception as e:
                logger.error(
                    f"Failed to send message: {e}"
                )

                disconnected.append(
                    connection
                )

        # -------------------------------------------------
        # Remove broken connections
        # -------------------------------------------------

        for connection in disconnected:
            self.disconnect(
                room_id,
                connection
            )

# =========================================================
# GLOBAL MANAGER
# =========================================================

manager = ConnectionManager()