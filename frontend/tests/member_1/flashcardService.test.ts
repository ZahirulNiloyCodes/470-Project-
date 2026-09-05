import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flashcardService } from "@/services/flashcardService";

describe("flashcardService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("generateCards sends POST request with correct payload and headers", async () => {
    const mockDeck = {
      id: "deck-1",
      title: "Data Structures",
      cards: [{ question: "Q1", answer: "A1" }],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDeck,
    });

    const res = await flashcardService.generateCards({
      title: "Data Structures",
      study_notes: "Stacks and queues overview.",
      num_cards: 1,
    });

    expect(res).toEqual(mockDeck);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/flashcards/generate"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-User-Id": expect.any(String),
        }),
      })
    );
  });

  it("throws error with backend detail message when generation fails", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Invalid notes provided" }),
    });

    await expect(
      flashcardService.generateCards({
        title: "Test",
        study_notes: "",
      })
    ).rejects.toThrow("Invalid notes provided");
  });
});
