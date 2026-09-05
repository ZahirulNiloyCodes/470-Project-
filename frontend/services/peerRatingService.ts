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

const DEFAULT_SUMMARY: RatingSummary = {
  user_id: "11111111-1111-4111-a111-111111111111",
  average_rating: 4.8,
  total_ratings: 4,
  rating_distribution: { 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 },
  recent_feedback: [
    "Extremely helpful explaining virtual memory and page tables!",
    "Great focus host during the Pomodoro study sprint.",
    "Very collaborative and shared helpful flashcard summaries.",
    "Patient and concise during deadlock algorithm reviews.",
  ],
};

const DEFAULT_PEERS: EligiblePeer[] = [
  {
    user_id: "22222222-2222-4222-a222-222222222222",
    username: "Sarah (Study Partner)",
    has_rated: false,
    current_rating: null,
    current_feedback: null,
  },
  {
    user_id: "33333333-3333-4333-a333-333333333333",
    username: "Alex (Discussion Lead)",
    has_rated: false,
    current_rating: null,
    current_feedback: null,
  },
  {
    user_id: "44444444-4444-4444-a444-444444444444",
    username: "David (Note Sharer)",
    has_rated: false,
    current_rating: null,
    current_feedback: null,
  },
];

const getLocalSummary = (): RatingSummary => {
  if (typeof window === "undefined") return DEFAULT_SUMMARY;
  const stored = localStorage.getItem("edustream_local_rating_summary");
  if (!stored) {
    localStorage.setItem("edustream_local_rating_summary", JSON.stringify(DEFAULT_SUMMARY));
    return DEFAULT_SUMMARY;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SUMMARY;
  }
};

const getLocalPeers = (): EligiblePeer[] => {
  if (typeof window === "undefined") return DEFAULT_PEERS;
  const stored = localStorage.getItem("edustream_local_peers");
  if (!stored) {
    localStorage.setItem("edustream_local_peers", JSON.stringify(DEFAULT_PEERS));
    return DEFAULT_PEERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_PEERS;
  }
};

export const peerRatingService = {
  async submitRating(payload: PeerRatingPayload): Promise<PeerRating> {
    try {
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
      return await res.json();
    } catch (err: any) {
      if (err.message && err.message !== "Failed to fetch" && !err.message.includes("fetch")) {
        throw err;
      }
      // Backend offline fallback
    }

    // Local fallback
    const peers = getLocalPeers();
    const updatedPeers = peers.map((p) =>
      p.user_id === payload.ratee_id
        ? { ...p, has_rated: true, current_rating: payload.rating, current_feedback: payload.feedback || null }
        : p
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("edustream_local_peers", JSON.stringify(updatedPeers));
    }

    const summary = getLocalSummary();
    const newTotal = summary.total_ratings + 1;
    const newDist = { ...summary.rating_distribution };
    newDist[payload.rating] = (newDist[payload.rating] || 0) + 1;
    const sum = Object.entries(newDist).reduce((acc, [k, v]) => acc + Number(k) * v, 0);
    const newAvg = Number((sum / newTotal).toFixed(2));
    const newFeedback = payload.feedback ? [payload.feedback, ...summary.recent_feedback] : summary.recent_feedback;

    const updatedSummary = {
      ...summary,
      average_rating: newAvg,
      total_ratings: newTotal,
      rating_distribution: newDist,
      recent_feedback: newFeedback,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("edustream_local_rating_summary", JSON.stringify(updatedSummary));
    }

    return {
      id: "rating-" + Date.now(),
      room_id: payload.room_id,
      rater_id: getDevUserId(),
      ratee_id: payload.ratee_id,
      rating: payload.rating,
      feedback: payload.feedback || null,
      created_at: new Date().toISOString(),
    };
  },

  async submitBatchRatings(payload: BatchRatingPayload): Promise<PeerRating[]> {
    try {
      const res = await fetch(`${API_URL}/api/ratings/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": getDevUserId(),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }

    const results: PeerRating[] = [];
    for (const r of payload.ratings) {
      const saved = await this.submitRating({
        room_id: payload.room_id,
        ratee_id: r.ratee_id,
        rating: r.rating,
        feedback: r.feedback,
      });
      results.push(saved);
    }
    return results;
  },

  async getUserSummary(userId: string): Promise<RatingSummary> {
    try {
      const res = await fetch(`${API_URL}/api/ratings/user/${encodeURIComponent(userId)}/summary`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }
    return getLocalSummary();
  },

  async getUserRatings(userId: string): Promise<PeerRating[]> {
    try {
      const res = await fetch(`${API_URL}/api/ratings/user/${encodeURIComponent(userId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }
    return [];
  },

  async getEligiblePeers(roomId: string): Promise<EligiblePeer[]> {
    try {
      const res = await fetch(`${API_URL}/api/ratings/room/${encodeURIComponent(roomId)}/eligible`, {
        headers: {
          "X-User-Id": getDevUserId(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Backend offline fallback
    }
    return getLocalPeers();
  },

  async getMyRoomRatings(roomId: string): Promise<PeerRating[]> {
    try {
      const res = await fetch(`${API_URL}/api/ratings/room/${encodeURIComponent(roomId)}/mine`, {
        headers: {
          "X-User-Id": getDevUserId(),
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }
    return [];
  },
};
