import { getDevUserId } from "./roomService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PeerRatingPayload {
  room_id: string;
  ratee_id: string;
  rating: number;
  feedback?: string;
}

export interface PeerRatingItemPayload {
  ratee_id: string;
  rating: number;
  feedback?: string;
}

export interface BatchRatingPayload {
  room_id: string;
  ratings: PeerRatingItemPayload[];
}

export interface PeerRating {
  id: string;
  room_id: string;
  rater_id: string;
  ratee_id: string;
  rating: number;
  feedback?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RatingSummary {
  user_id: string;
  average_rating: number;
  total_ratings: number;
  rating_distribution: Record<number, number>;
  recent_feedback: string[];
}

export interface EligiblePeer {
  user_id: string;
  username: string;
  has_rated: boolean;
  current_rating?: number | null;
  current_feedback?: string | null;
}

export const peerRatingService = {
  async submitRating(payload: PeerRatingPayload): Promise<PeerRating> {
    const res = await fetch(`${API_URL}/api/ratings/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": getDevUserId(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to submit rating" }));
      throw new Error(err.detail || "Failed to submit rating");
    }

    return res.json();
  },

  async submitBatchRatings(payload: BatchRatingPayload): Promise<PeerRating[]> {
    const res = await fetch(`${API_URL}/api/ratings/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": getDevUserId(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to submit batch ratings" }));
      throw new Error(err.detail || "Failed to submit batch ratings");
    }

    return res.json();
  },

  async getUserSummary(userId: string): Promise<RatingSummary> {
    const res = await fetch(`${API_URL}/api/ratings/user/${encodeURIComponent(userId)}/summary`);
    if (!res.ok) {
      throw new Error("Failed to load user rating summary");
    }
    return res.json();
  },

  async getUserRatings(userId: string): Promise<PeerRating[]> {
    const res = await fetch(`${API_URL}/api/ratings/user/${encodeURIComponent(userId)}`);
    if (!res.ok) {
      throw new Error("Failed to load user ratings");
    }
    return res.json();
  },

  async getEligiblePeers(roomId: string): Promise<EligiblePeer[]> {
    const res = await fetch(`${API_URL}/api/ratings/room/${encodeURIComponent(roomId)}/eligible`, {
      headers: {
        "X-User-Id": getDevUserId(),
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch eligible session peers");
    }
    return res.json();
  },

  async getMyRoomRatings(roomId: string): Promise<PeerRating[]> {
    const res = await fetch(`${API_URL}/api/ratings/room/${encodeURIComponent(roomId)}/mine`, {
      headers: {
        "X-User-Id": getDevUserId(),
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch user ratings for room");
    }
    return res.json();
  },
};
