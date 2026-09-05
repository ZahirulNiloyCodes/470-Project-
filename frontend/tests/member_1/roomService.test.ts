import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { roomService, getDevUserId } from "@/services/roomService";

describe("roomService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getDevUserId returns default uuid or stored value", () => {
    const id = getDevUserId();
    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });

  it("createRoom posts payload with X-User-Id header", async () => {
    const mockRoom = { id: "room-1", title: "OS Lab" };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoom,
    });

    const res = await roomService.createRoom({
      title: "OS Lab",
      is_private: false,
      tags: ["OS"],
      max_participants: 10,
    });

    expect(res).toEqual(mockRoom);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/rooms"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-User-Id": expect.any(String),
        }),
      })
    );
  });

  it("getPublicRooms fetches rooms list without tag", async () => {
    const mockRooms = [{ id: "r1", title: "Public Room" }];
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRooms,
    });

    const res = await roomService.getPublicRooms();
    expect(res).toEqual(mockRooms);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/rooms"));
  });

  it("getPublicRooms appends tag query parameter when provided", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await roomService.getPublicRooms("Algorithms");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/rooms?tag=Algorithms"));
  });
});
