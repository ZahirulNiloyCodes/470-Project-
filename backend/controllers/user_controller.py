from typing import Optional
from fastapi import HTTPException
from models import user_model, peer_rating_model, room_membership_model
from config.security import hash_password


def update_profile(user_id: str, name: Optional[str], password: Optional[str]) -> dict:
    fields = {}
    if name:
        fields["name"] = name.strip()
    if password:
        fields["password_hash"] = hash_password(password)

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    updated = user_model.update_user(user_id, fields)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")

    updated.pop("password_hash", None)
    return updated


def rate_peer(rater_id: str, peer_id: str, score: int) -> None:
    if rater_id == peer_id:
        raise HTTPException(status_code=400, detail="You cannot rate yourself")

    target = user_model.get_user_by_id(peer_id)
    if not target:
        raise HTTPException(status_code=404, detail="Peer not found")

    peer_rating_model.upsert_rating(rater_id, peer_id, score)
    new_avg = peer_rating_model.get_average_score(peer_id)
    user_model.update_reputation_score(peer_id, round(new_avg, 2))


def create_room(host_id: str, title: str) -> dict:
    return room_membership_model.create_room(title.strip(), host_id)


def join_room(user_id: str, room_id: str) -> dict:
    room = room_membership_model.get_room_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    existing = room_membership_model.get_membership(room_id, user_id)
    if existing:
        return {"joined": True, "room_id": room_id}

    room_membership_model.add_participant(room_id, user_id)
    return {"joined": True, "room_id": room_id}