import { getDevUserId } from "./roomService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface GenerateCardsPayload {
  room_id?: string;
  title: string;
  study_notes: string;
  num_cards?: number;
}

export const flashcardService = {
  async generateCards(data: GenerateCardsPayload) {
    const res = await fetch(`${API_URL}/api/flashcards/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": getDevUserId(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to generate flashcards");
    }
    return res.json();
  },
};
