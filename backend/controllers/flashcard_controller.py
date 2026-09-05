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
            cards = []
            lines = [line.strip("-*# \t\r\n") for line in data.study_notes.split("\n") if len(line.strip()) > 10]
            for i, line in enumerate(lines[:data.num_cards]):
                if ":" in line:
                    parts = line.split(":", 1)
                    cards.append({"question": f"What is {parts[0].strip()}?", "answer": parts[1].strip()})
                elif " - " in line:
                    parts = line.split(" - ", 1)
                    cards.append({"question": f"Define {parts[0].strip()}", "answer": parts[1].strip()})
                else:
                    cards.append({"question": f"Key takeaway #{i+1} from {data.title}:", "answer": line})

            if not cards:
                cards = [
                    {"question": f"What is the primary focus of {data.title}?", "answer": data.title},
                    {"question": "Core Study Summary", "answer": data.study_notes[:180] + ("..." if len(data.study_notes) > 180 else "")}
                ]
            while len(cards) < min(data.num_cards, 4) and len(cards) < 4:
                cards.append({
                    "question": f"Concept Check #{len(cards)+1}: {data.title}",
                    "answer": f"Key principle extracted from session notes: {data.study_notes[:100]}..."
                })

        payload = {
            "user_id": user_id,
            "room_id": str(data.room_id) if data.room_id else None,
            "title": data.title,
            "cards": cards
        }
        
        saved = FlashcardModel.save_deck(payload)
        return FlashcardDeckResponse(**saved)
