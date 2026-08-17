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

export const roomService = {
  async createRoom(data: CreateRoomPayload) {
    const res = await fetch(`${API_URL}/api/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": getDevUserId(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to create room");
    }
    return res.json();
  },

  async getPublicRooms(tag?: string) {
    const url = tag ? `${API_URL}/api/rooms?tag=${encodeURIComponent(tag)}` : `${API_URL}/api/rooms`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch rooms");
    return res.json();
  },
};
