import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchQuestions,
  fetchQueuePosition,
  createParticipantSocket,
  createHostSocket,
  submitQuestion,
  answerQuestion,
  dismissQuestion,
} from "./qnaService";

describe("fetchQuestions", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("fetches with participant view by default", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: [{ id: "q1" }] }),
    });
    const result = await fetchQuestions("room-1");
    expect(result).toEqual([{ id: "q1" }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("view=participant"));
  });

  it("fetches with host view when specified", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ questions: [{ id: "q1", participant_id: "p1" }] }),
    });
    const result = await fetchQuestions("room-1", "host");
    expect(result[0].participant_id).toBe("p1");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("view=host"));
  });

  it("throws when response not ok", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });
    await expect(fetchQuestions("room-1")).rejects.toThrow("Failed to load questions");
  });
});

describe("fetchQueuePosition", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("returns the position number", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ position: 4 }) });
    const result = await fetchQueuePosition("q1");
    expect(result).toBe(4);
  });

  it("throws when response not ok", async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false });
    await expect(fetchQueuePosition("q1")).rejects.toThrow("Failed to load queue position");
  });
});

describe("qna socket senders", () => {
  it("submitQuestion sends correct shape", () => {
    const send = vi.fn();
    submitQuestion({ send } as any, { room_id: "r1", participant_id: "p1", question: "Q?" });
    expect(send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "submit",
        payload: { room_id: "r1", participant_id: "p1", question: "Q?" },
      })
    );
  });

  it("answerQuestion sends correct shape", () => {
    const send = vi.fn();
    answerQuestion({ send } as any, "q1", "The answer");
    expect(send).toHaveBeenCalledWith(
      JSON.stringify({ type: "answer", question_id: "q1", answer: "The answer" })
    );
  });

  it("dismissQuestion sends correct shape", () => {
    const send = vi.fn();
    dismissQuestion({ send } as any, "q1");
    expect(send).toHaveBeenCalledWith(
      JSON.stringify({ type: "dismiss", question_id: "q1" })
    );
  });
});

describe("socket factories", () => {
  class FakeWebSocket {
    url: string;
    onmessage: ((e: { data: string }) => void) | null = null;
    constructor(url: string) {
      this.url = url;
    }
  }

  beforeEach(() => vi.stubGlobal("WebSocket", FakeWebSocket as any));
  afterEach(() => vi.unstubAllGlobals());

  it("createParticipantSocket connects to the participant endpoint", () => {
    const socket = createParticipantSocket("room-1", vi.fn()) as any;
    expect(socket.url).toContain("/qna/ws/room-1/participant");
  });

  it("createHostSocket connects to the host endpoint", () => {
    const socket = createHostSocket("room-1", vi.fn()) as any;
    expect(socket.url).toContain("/qna/ws/room-1/host");
  });

  it("parses incoming messages", () => {
    const onMessage = vi.fn();
    const socket = createParticipantSocket("room-1", onMessage) as any;
    socket.onmessage({ data: JSON.stringify({ type: "new", question: { id: "q1" } }) });
    expect(onMessage).toHaveBeenCalledWith({ type: "new", question: { id: "q1" } });
  });
});