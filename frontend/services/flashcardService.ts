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
    try {
      const res = await fetch(`${API_URL}/api/flashcards/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": getDevUserId(),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Failed to generate flashcards" }));
        throw new Error(error.detail || "Failed to generate flashcards");
      }
      return await res.json();
    } catch (err: any) {
      if (err.message && err.message !== "Failed to fetch" && !err.message.includes("fetch")) {
        throw err;
      }
      // Backend offline fallback
    }

    // Local client-side generation fallback
    const targetCards = data.num_cards || 4;
    const lines = (data.study_notes || "")
      .split("\n")
      .map((l) => l.replace(/^[-*#\d.]+\s*/, "").trim())
      .filter((l) => l.length > 10);

    const cards: Array<{ question: string; answer: string }> = [];

    for (const line of lines) {
      if (cards.length >= targetCards) break;
      if (line.includes(":")) {
        const [q, a] = line.split(":", 2);
        cards.push({ question: `What is ${q.trim()}?`, answer: a.trim() });
      } else if (line.includes(" - ")) {
        const [q, a] = line.split(" - ", 2);
        cards.push({ question: `Define ${q.trim()}`, answer: a.trim() });
      } else {
        cards.push({
          question: `Key concept #${cards.length + 1} from ${data.title}:`,
          answer: line,
        });
      }
    }

    if (cards.length === 0) {
      cards.push({
        question: `What is the core focus of ${data.title}?`,
        answer: data.title,
      });
      cards.push({
        question: "Primary Summary",
        answer: data.study_notes.slice(0, 150) + (data.study_notes.length > 150 ? "..." : ""),
      });
    }

    while (cards.length < Math.min(targetCards, 4)) {
      cards.push({
        question: `Concept Check #${cards.length + 1}: ${data.title}`,
        answer: `Important principle extracted from session notes: ${data.study_notes.slice(0, 80)}...`,
      });
    }

    return {
      id: "deck-" + Date.now(),
      user_id: getDevUserId(),
      room_id: data.room_id || null,
      title: data.title,
      cards,
      created_at: new Date().toISOString(),
    };
  },
};
