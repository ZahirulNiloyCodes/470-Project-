import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchMessages,
  createChatSocket,
  sendNewMessage,
  sendEditMessage,
  sendDeleteMessage,
} from "./chatService";

describe("fetchMessages", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("returns messages when response ok", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [{ id: "m1", content: "hi" }] }),
    });
    const result = await fetchMessages("room-1");
    expect(result).toEqual([{ id: "m1", content: "hi" }]);
  });

  it("throws when response not ok", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });
    await expect(fetchMessages("room-1")).rejects.toThrow("Failed to load messages");
  });
});

describe("chat socket senders", () => {
  it("sendNewMessage sends correct payload shape", () => {
    const send = vi.fn();
    const socket = { send } as any;
    sendNewMessage(socket, { room_id: "r1", user_id: "u1", username: "A", content: "hi" });

    expect(send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "new",
        payload: { room_id: "r1", user_id: "u1", username: "A", content: "hi" },
      })
    );
  });

  it("sendEditMessage sends correct payload shape", () => {
    const send = vi.fn();
    const socket = { send } as any;
    sendEditMessage(socket, "m1", "u1", "edited");

    expect(send).toHaveBeenCalledWith(
      JSON.stringify({ type: "edit", message_id: "m1", user_id: "u1", content: "edited" })
    );
  });

  it("sendDeleteMessage sends correct payload shape", () => {
    const send = vi.fn();
    const socket = { send } as any;
    sendDeleteMessage(socket, "m1", "u1");

    expect(send).toHaveBeenCalledWith(
      JSON.stringify({ type: "delete", message_id: "m1", user_id: "u1" })
    );
  });
});

describe("createChatSocket", () => {
  class FakeWebSocket {
    url: string;
    onmessage: ((e: { data: string }) => void) | null = null;
    constructor(url: string) {
      this.url = url;
    }
  }

  beforeEach(() => vi.stubGlobal("WebSocket", FakeWebSocket as any));
  afterEach(() => vi.unstubAllGlobals());

  it("parses incoming JSON and calls onMessage", () => {
    const onMessage = vi.fn();
    const socket = createChatSocket("room-1", onMessage) as any;
    socket.onmessage({ data: JSON.stringify({ type: "new", message: { id: "m1" } }) });
    expect(onMessage).toHaveBeenCalledWith({ type: "new", message: { id: "m1" } });
  });
});