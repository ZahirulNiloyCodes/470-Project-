import { ChatMessage } from "@/types/chat";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";


export async function getMessages(
  roomId: string
): Promise<ChatMessage[]> {

  const response = await fetch(
    `${API_URL}/api/messages/${roomId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch messages"
    );
  }

  return response.json();
}


export async function updateMessage(
  messageId: string,
  content: string
) {

  const response = await fetch(
    `${API_URL}/api/messages/${messageId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        content,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update message"
    );
  }

  return response.json();
}


export async function deleteMessage(
  messageId: string
) {

  const response = await fetch(
    `${API_URL}/api/messages/${messageId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete message"
    );
  }

  return response.json();
}

export async function getRoom(roomId: string) {
  const response = await fetch(
    `${API_URL}/api/rooms/${roomId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load room");
  }

  return response.json();
}