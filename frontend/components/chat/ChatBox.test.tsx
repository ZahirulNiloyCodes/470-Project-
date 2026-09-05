import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "./ChatBox";
import * as chatService from "@/services/chatService";

describe("ChatBox", () => {
  let fakeSocket: any;

  beforeEach(() => {
    fakeSocket = { send: vi.fn(), close: vi.fn(), readyState: 1 };
    vi.spyOn(chatService, "fetchMessages").mockResolvedValue([
      {
        id: "m1", room_id: "room-1", user_id: "u1", username: "Alice",
        content: "Hello world", is_edited: false, is_deleted: false,
        created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
      },
    ]);
    vi.spyOn(chatService, "createChatSocket").mockReturnValue(fakeSocket);
    vi.spyOn(chatService, "sendNewMessage");
  });

  afterEach(() => vi.restoreAllMocks());

  it("loads and displays existing messages", async () => {
    render(<ChatBox roomId="room-1" currentUserId="u1" currentUsername="Alice" />);
    await waitFor(() => {
      expect(screen.getByText(/Hello world/)).toBeInTheDocument();
    });
  });

  it("sends a new message when submit is triggered", async () => {
    render(<ChatBox roomId="room-1" currentUserId="u1" currentUsername="Alice" />);
    await waitFor(() => expect(chatService.fetchMessages).toHaveBeenCalled());

    const textarea = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(textarea, { target: { value: "New message" } });
    fireEvent.click(screen.getByText("Send"));

    expect(chatService.sendNewMessage).toHaveBeenCalledWith(
      fakeSocket,
      expect.objectContaining({ room_id: "room-1", user_id: "u1", content: "New message" })
    );
  });

  it("does not send empty messages", async () => {
    render(<ChatBox roomId="room-1" currentUserId="u1" currentUsername="Alice" />);
    await waitFor(() => expect(chatService.fetchMessages).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Send"));
    expect(chatService.sendNewMessage).not.toHaveBeenCalled();
  });

  it("appends incoming new messages from the socket", async () => {
    render(<ChatBox roomId="room-1" currentUserId="u1" currentUsername="Alice" />);
    await waitFor(() => expect(chatService.createChatSocket).toHaveBeenCalled());

    const onMessageCallback = (chatService.createChatSocket as any).mock.calls[0][1];
    onMessageCallback({
      type: "new",
      message: {
        id: "m2", room_id: "room-1", user_id: "u2", username: "Bob",
        content: "Hi there", is_edited: false, is_deleted: false,
        created_at: "2024-01-01T00:01:00Z", updated_at: "2024-01-01T00:01:00Z",
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/Hi there/)).toBeInTheDocument();
    });
  });
});