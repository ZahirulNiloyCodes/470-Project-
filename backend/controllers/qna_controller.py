from typing import Any, Dict, List, Optional
from fastapi import HTTPException
from models import qna_model


def submit_question(room_id: str, participant_id: Optional[str], question: str) -> Dict[str, Any]:
    trimmed = question.strip()
    if len(trimmed) < 3:
        raise HTTPException(status_code=400, detail="Question must be at least 3 characters")
    if len(trimmed) > 2000:
        raise HTTPException(status_code=400, detail="Question is too long")
    return qna_model.create_question(room_id, participant_id, trimmed)


def list_questions_for_host(room_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Host view — participant_id included (host needs it for moderation)."""
    return qna_model.get_questions_by_room(room_id, status)


def list_questions_for_participants(room_id: str) -> List[Dict[str, Any]]:
    """
    Participant-facing view — participant_id stripped so no one can see
    who asked which question. Only pending/answered shown (dismissed hidden).
    """
    rows = qna_model.get_questions_by_room(room_id)
    visible = [r for r in rows if r["status"] != "dismissed"]
    for row in visible:
        row.pop("participant_id", None)
    return visible


def answer_question(question_id: str, answer: str) -> Dict[str, Any]:
    trimmed = answer.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    existing = qna_model.get_question_by_id(question_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Question not found")
    if existing["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending questions can be answered")

    updated = qna_model.answer_question(question_id, trimmed)
    return updated


def dismiss_question(question_id: str) -> Dict[str, Any]:
    existing = qna_model.get_question_by_id(question_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Question not found")
    if existing["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending questions can be dismissed")

    updated = qna_model.dismiss_question(question_id)
    return updated


def get_queue_position(question_id: str) -> int:
    existing = qna_model.get_question_by_id(question_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Question not found")
    return qna_model.get_queue_position(question_id)