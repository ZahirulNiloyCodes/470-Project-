import json
from fastapi import HTTPException
from config.openai_client import openai_client
from models.flashcard_model import FlashcardModel
from schemas.flashcard_schema import FlashcardGenerateRequest, FlashcardDeckResponse

class FlashcardController:
    @staticmethod
    def generate_and_save(data: FlashcardGenerateRequest, user_id: str) -> FlashcardDeckResponse:
        system_prompt = (
            "You are an academic assistant. Extract key concepts from study notes and "
            "generate concise Q&A flashcards. Respond strictly in valid JSON format: "
            '{"cards": [{"question": "...", "answer": "..."}]}'
        )
        user_prompt = f"Generate {data.num_cards} flashcards from these notes:\n\n{data.study_notes}"

        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3
            )
            raw_content = json.loads(response.choices[0].message.content)
            cards = raw_content.get("cards", [])
        except Exception:
            cards = [
                {"question": "What is the primary topic of the notes?", "answer": data.title},
                {"question": "Key Summary", "answer": data.study_notes[:100] + "..."}
            ]

        payload = {
            "user_id": user_id,
            "room_id": str(data.room_id) if data.room_id else None,
            "title": data.title,
            "cards": cards
        }
        
        saved = FlashcardModel.save_deck(payload)
        return FlashcardDeckResponse(**saved)
