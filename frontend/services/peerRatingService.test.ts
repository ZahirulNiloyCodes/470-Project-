import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { peerRatingService } from "./peerRatingService";

describe("peerRatingService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("submitRating", () => {
    it("submits single peer rating and returns result", async () => {
      const mockResult = {
        id: "rate-1",
        room_id: "room-1",
        rater_id: "u1",
        ratee_id: "u2",
        rating: 5,
        feedback: "Awesome help",
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const res = await peerRatingService.submitRating({
        room_id: "room-1",
        ratee_id: "u2",
        rating: 5,
        feedback: "Awesome help",
      });

      expect(res).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ratings/"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-User-Id": expect.any(String),
          }),
          body: JSON.stringify({
            room_id: "room-1",
            ratee_id: "u2",
            rating: 5,
            feedback: "Awesome help",
          }),
        })
      );
    });

    it("throws detailed error when response is not ok", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Participants cannot rate their own helpfulness." }),
      });

      await expect(
        peerRatingService.submitRating({
          room_id: "room-1",
          ratee_id: "u1",
          rating: 5,
        })
      ).rejects.toThrow("Participants cannot rate their own helpfulness.");
    });
  });

  describe("submitBatchRatings", () => {
    it("submits batch ratings successfully", async () => {
      const mockBatch = [
        { id: "rate-1", ratee_id: "u2", rating: 5 },
        { id: "rate-2", ratee_id: "u3", rating: 4 },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBatch,
      });

      const res = await peerRatingService.submitBatchRatings({
        room_id: "room-1",
        ratings: [
          { ratee_id: "u2", rating: 5 },
          { ratee_id: "u3", rating: 4 },
        ],
      });

      expect(res).toEqual(mockBatch);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ratings/batch"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("getUserSummary", () => {
    it("fetches user helpfulness summary", async () => {
      const mockSummary = {
        user_id: "u2",
        average_rating: 4.75,
        total_ratings: 4,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 3 },
        recent_feedback: ["Great tutor"],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummary,
      });

      const res = await peerRatingService.getUserSummary("u2");
      expect(res).toEqual(mockSummary);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ratings/user/u2/summary")
      );
    });
  });

  describe("getEligiblePeers", () => {
    it("fetches list of peers in room eligible to be rated", async () => {
      const mockPeers = [
        { user_id: "u2", username: "Sarah", has_rated: false },
        { user_id: "u3", username: "Alex", has_rated: true, current_rating: 5 },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPeers,
      });

      const res = await peerRatingService.getEligiblePeers("room-1");
      expect(res).toEqual(mockPeers);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/ratings/room/room-1/eligible"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-User-Id": expect.any(String),
          }),
        })
      );
    });
  });
});
