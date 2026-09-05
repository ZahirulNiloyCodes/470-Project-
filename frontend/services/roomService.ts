const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CreateRoomPayload {
  title: string;
  description?: string;
  is_private: boolean;
  access_code?: string;
  tags: string[];
  max_participants: number;
}

export const getDevUserId = (): string => {
  if (typeof window === "undefined") return "11111111-1111-4111-a111-111111111111";
  let id = localStorage.getItem("edustream_dev_user_id");
  if (!id) {
    id = "11111111-1111-4111-a111-111111111111";
    localStorage.setItem("edustream_dev_user_id", id);
  }
  return id;
};

const DEFAULT_ROOMS = [
  {
    id: "11111111-2222-3333-4444-555555555555",
    title: "Operating Systems Final Prep",
    description: "Collaborative review of Process Scheduling, Deadlocks, and Virtual Memory.",
    is_private: false,
    access_code: null,
    tags: ["Operating Systems", "CS470", "Finals"],
    max_participants: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: "22222222-3333-4444-5555-666666666666",
    title: "Algorithms & Problem Solving",
    description: "Practicing graph algorithms (Dijkstra, BFS/DFS) and dynamic programming.",
    is_private: false,
    access_code: null,
    tags: ["Algorithms", "Data Structures", "LeetCode"],
    max_participants: 8,
    created_at: new Date().toISOString(),
  },
];

const getLocalRooms = () => {
  if (typeof window === "undefined") return DEFAULT_ROOMS;
  const stored = localStorage.getItem("edustream_local_rooms");
  if (!stored) {
    localStorage.setItem("edustream_local_rooms", JSON.stringify(DEFAULT_ROOMS));
    return DEFAULT_ROOMS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_ROOMS;
  }
};

const saveLocalRooms = (rooms: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("edustream_local_rooms", JSON.stringify(rooms));
  }
};

export const roomService = {
  async createRoom(data: CreateRoomPayload) {
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": getDevUserId(),
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }

    const newRoom = {
      id: "room-" + Date.now(),
      title: data.title,
      description: data.description || "",
      is_private: data.is_private,
      access_code: data.access_code || null,
      tags: data.tags || [],
      max_participants: data.max_participants || 10,
      created_at: new Date().toISOString(),
    };
    const current = getLocalRooms();
    const updated = [newRoom, ...current];
    saveLocalRooms(updated);
    return newRoom;
  },

  async getPublicRooms(tag?: string) {
    try {
      const url = tag ? `${API_URL}/api/rooms?tag=${encodeURIComponent(tag)}` : `${API_URL}/api/rooms`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Backend offline fallback
    }

    let rooms = getLocalRooms();
    if (tag) {
      const tClean = tag.toLowerCase();
      rooms = rooms.filter((r: any) =>
        (r.tags || []).some((t: string) => t.toLowerCase().includes(tClean))
      );
    }
    return rooms;
  },
};
