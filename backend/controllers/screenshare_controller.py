from typing import Any, Dict, List, Optional
from fastapi import HTTPException
from livekit import api as lk_api
from config.livekit_client import LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL
from models import screenshare_model


def generate_livekit_token(room_id: str, participant_id: str, participant_name: str) -> Dict[str, str]:
    """
    room_id কে LiveKit room name হিসেবে ব্যবহার করছি (1 study room = 1 LiveKit room)।
    Grant দিচ্ছি: room join + camera/mic/screen-share publish permission।
    """
    room_name = f"room-{room_id}"

    token = (
        lk_api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(participant_id)
        .with_name(participant_name)
        .with_grants(
            lk_api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
    )

    return {
        "token": token.to_jwt(),
        "livekit_url": LIVEKIT_URL,
        "room_name": room_name,
    }


def start_screen_share(room_id: str, participant_id: Optional[str]) -> Dict[str, Any]:
    active = screenshare_model.get_active_sessions(room_id)
    if any(s["participant_id"] == participant_id for s in active):
        raise HTTPException(status_code=400, detail="You are already sharing your screen")

    room_name = f"room-{room_id}"
    return screenshare_model.create_session(room_id, participant_id, room_name)


def stop_screen_share(session_id: str, participant_id: Optional[str]) -> Dict[str, Any]:
    existing = screenshare_model.get_session_by_id(session_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Session not found")
    if existing["participant_id"] != participant_id:
        raise HTTPException(status_code=403, detail="You can only stop your own screen share")
    if existing.get("ended_at") is not None:
        raise HTTPException(status_code=400, detail="Session already ended")

    return screenshare_model.end_session(session_id)


def list_active_sessions(room_id: str) -> List[Dict[str, Any]]:
    return screenshare_model.get_active_sessions(room_id)

def end_all_sessions_for_participant(room_id: str, participant_id: Optional[str]) -> List[Dict[str, Any]]:
    """
    Disconnect (tab close / network drop) হলে কল হবে।
    ওই participant-এর room-এ যত active session আছে (normally ১টাই থাকা উচিত,
    কিন্তু একাধিক browser tab থেকে share শুরু করলে একাধিকও হতে পারে) — সবগুলো end করে দেয়।
    """
    if not participant_id:
        return []

    active = screenshare_model.get_active_sessions_for_participant(room_id, participant_id)
    ended = []
    for session in active:
        result = screenshare_model.end_session(session["id"])
        if result:
            ended.append(result)
    return ended