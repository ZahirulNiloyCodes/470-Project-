import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchLiveKitToken,
  fetchActiveSessions,
  createScreenShareSocket,
  notifyStart,
  notifyStop,
} from "./screenshareService";

describe("fetchLiveKitToken", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("posts to /screenshare/token with correct body", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "t1", livekit_url: "wss://x", room_name: "room-room-1" }),
    });

    const result = await fetchLiveKitToken("room-1", "p1", "Alice");

    expect(result.token).toBe("t1");
    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toContain("/screenshare/token");
    expect(JSON.parse(options.body)).toEqual({
      room_id: "room-1",
      participant_id: "p1",
      participant_name: "Alice",
    });
  });

  it("throws when response not ok", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });
    await expect(fetchLiveKitToken("room-1", "p1", "Alice")).rejects.toThrow(
      "Failed to get LiveKit token"
    );
  });
});

describe("fetchActiveSessions", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("returns sessions array", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessions: [{ id: "s1" }] }),
    });
    const result = await fetchActiveSessions("room-1");
    expect(result).toEqual([{ id: "s1" }]);
  });

  it("throws when response not ok", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });
    await expect(fetchActiveSessions("room-1")).rejects.toThrow("Failed to load active sessions");
  });
});

describe("notifyStart / notifyStop", () => {
  it("notifyStart sends correct payload", () => {
    const send = vi.fn();
    notifyStart({ send } as any, "p1");
    expect(send).toHaveBeenCalledWith(JSON.stringify({ type: "start", participant_id: "p1" }));
  });

  it("notifyStop sends correct payload", () => {
    const send = vi.fn();
    notifyStop({ send } as any, "s1", "p1");
    expect(send).toHaveBeenCalledWith(
      JSON.stringify({ type: "stop", session_id: "s1", participant_id: "p1" })
    );
  });
});

describe("createScreenShareSocket", () => {
  class FakeWebSocket {
    url: string;
    onmessage: ((e: { data: string }) => void) | null = null;
    constructor(url: string) {
      this.url = url;
    }
  }

  beforeEach(() => vi.stubGlobal("WebSocket", FakeWebSocket as any));
  afterEach(() => vi.unstubAllGlobals());

  it("connects to the correct ws endpoint", () => {
    const socket = createScreenShareSocket("room-1", vi.fn()) as any;
    expect(socket.url).toContain("/screenshare/ws/room-1");
  });

  it("parses incoming JSON", () => {
    const onMessage = vi.fn();
    const socket = createScreenShareSocket("room-1", onMessage) as any;
    socket.onmessage({
      data: JSON.stringify({ type: "started", session: { id: "s1", participant_id: "p1" } }),
    });
    expect(onMessage).toHaveBeenCalledWith({
      type: "started",
      session: { id: "s1", participant_id: "p1" },
    });
  });
});