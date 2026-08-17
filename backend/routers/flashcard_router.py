from fastapi import APIRouter, Depends, Header
from typing import Optional
from schemas.flashcard_schema import FlashcardGenerateRequest, FlashcardDeckResponse
from controllers.flashcard_controller import FlashcardController
from config.supabase import supabase

router = APIRouter(prefix="/api/flashcards", tags=["AI Flashcards"])

DEFAULT_USER_ID = "11111111-1111-4111-a111-111111111111"

async def resolve_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
) -> str:
    if x_user_id:
        return x_user_id
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            if supabase:
                user = supabase.auth.get_user(token)
                if user and user.user:
                    return user.user.id
        except Exception:
            pass
    return DEFAULT_USER_ID

@router.post("/generate", response_model=FlashcardDeckResponse, status_code=201)
def generate_flashcards(request: FlashcardGenerateRequest, user_id: str = Depends(resolve_user_id)):
    return FlashcardController.generate_and_save(request, user_id)
