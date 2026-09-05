from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from controllers import screenshare_controller
from websocket.screenshare_ws import screenshare_manager
from schemas.screenshare_schema import TokenRequest

router = APIRouter(prefix="/screenshare", tags=["screenshare"])


@router.post("/token")
def get_token(payload: TokenRequest):
    return screenshare_controller.generate_livekit_token(
        payload.room_id, payload.participant_id, payload.participant_name
    )


@router.get("/{room_id}/active")
def get_active(room_id: str):
    return {"sessions": screenshare_controller.list_active_sessions(room_id)}


@router.websocket("/ws/{room_id}")
async def screenshare_ws(websocket: WebSocket, room_id: str):
    await screenshare_manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("type")
            participant_id = data.get("participant_id")

            try:
                if action == "start":
                    # এই websocket connection টা কার (participant_id) সেটা এখানে রেকর্ড করছি,
                    # যাতে পরে disconnect হলে চিনতে পারি কার session end করতে হবে।
                    screenshare_manager.set_participant(websocket, participant_id)

                    session = screenshare_controller.start_screen_share(room_id, participant_id)
                    await screenshare_manager.broadcast(
                        room_id, {"type": "started", "session": session}
                    )
                elif action == "stop":
                    session = screenshare_controller.stop_screen_share(
                        data["session_id"], participant_id
                    )
                    await screenshare_manager.broadcast(
                        room_id,
                        {"type": "stopped", "session": session, "participant_id": participant_id},
                    )
            except HTTPException as exc:
                await websocket.send_json({"type": "error", "detail": exc.detail})

    except WebSocketDisconnect:
        # Tab বন্ধ / network drop হলে এখানে আসবে।
        # এই connection যদি কোনো participant-এর ছিল এবং তার active session থাকে,
        # সেগুলো auto-end করে বাকি সবাইকে "stopped" broadcast করছি —
        # নাহলে DB-তে session চিরকাল "active" থেকে যাবে এবং UI-তেও ভুল অবস্থা দেখাবে।
        participant_id = screenshare_manager.get_participant(websocket)
        screenshare_manager.disconnect(room_id, websocket)

        if participant_id:
            ended_sessions = screenshare_controller.end_all_sessions_for_participant(
                room_id, participant_id
            )
            for session in ended_sessions:
                await screenshare_manager.broadcast(
                    room_id,
                    {"type": "stopped", "session": session, "participant_id": participant_id},
                )