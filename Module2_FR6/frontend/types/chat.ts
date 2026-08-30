export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
}

export type WebSocketEvent =
  | {
      type: "message";
      data: ChatMessage;
    }
  | {
      type: "edit";
      data: ChatMessage;
    }
  | {
      type: "delete";
      data: ChatMessage;
    };