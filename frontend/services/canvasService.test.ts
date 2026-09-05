import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchCanvasSnapshot, createCanvasSocket } from "./canvasService";

describe("fetchCanvasSnapshot", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns records when the response is ok", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ records: [{ id: "rec-1" }] }),
    });

    const result = await fetchCanvasSnapshot("room-1");

    expect(result).toEqual([{ id: "rec-1" }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/canvas/room-1/snapshot"));
  });

  it("throws when the response is not ok", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });

    await expect(fetchCanvasSnapshot("room-1")).rejects.toThrow(
      "Failed to load canvas snapshot"
    );
  });
});

describe("createCanvasSocket", () => {
  class FakeWebSocket {
    static instances: FakeWebSocket[] = [];
    url: string;
    onmessage: ((event: { data: string }) => void) | null = null;
    constructor(url: string) {
      this.url = url;
      FakeWebSocket.instances.push(this);
    }
  }

  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal("WebSocket", FakeWebSocket as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds a ws:// url from the API base", () => {
    const socket = createCanvasSocket("room-1", vi.fn());
    expect((socket as any).url).toContain("/canvas/ws/room-1");
    expect((socket as any).url.startsWith("ws")).toBe(true);
  });

  it("calls onMessage with parsed JSON when a message arrives", () => {
    const onMessage = vi.fn();
    const socket = createCanvasSocket("room-1", onMessage) as any;

    socket.onmessage({ data: JSON.stringify({ type: "update", records: [{ id: "a" }] }) });

    expect(onMessage).toHaveBeenCalledWith({ type: "update", records: [{ id: "a" }] });
  });
});