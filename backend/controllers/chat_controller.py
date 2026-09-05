from typing import Any, Dict, List, Optional
from fastapi import HTTPException
from models import chat_model


def list_messages(room_id: str) -> List[Dict[str, Any]]:
    return chat_model.get_messages_by_room(room_id)


def send_message(room_id: str, user_id: str, username: str, content: str) -> Dict[str, Any]:
    trimmed = content.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")
    return chat_model.create_message(room_id, user_id, username, trimmed)


def edit_message(message_id: str, user_id: str, content: str) -> Dict[str, Any]:
    existing = chat_model.get_message_by_id(message_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Message not found")
    if existing["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own messages")
    if existing["is_deleted"]:
        raise HTTPException(status_code=400, detail="Cannot edit a deleted message")

    trimmed = content.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    updated = chat_model.update_message(message_id, trimmed)
    return updated


def delete_message(message_id: str, user_id: str) -> Dict[str, Any]:
    existing = chat_model.get_message_by_id(message_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Message not found")
    if existing["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")

    deleted = chat_model.soft_delete_message(message_id)
    return deleted