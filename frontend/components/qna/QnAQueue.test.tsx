import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QnAQueue from "./QnAQueue";
import * as qnaService from "@/services/qnaService";

const pendingQuestion = {
  id: "q1", room_id: "room-1", participant_id: "p1",
  question: "What is FastAPI?", status: "pending" as const, answer: null,
  answered_at: null, dismissed_at: null,
  created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z",
};

const answeredQuestion = {
  ...pendingQuestion, id: "q2", question: "Answered Q",
  status: "answered" as const, answer: "Here's the answer",
};

describe("QnAQueue - participant mode", () => {
  let fakeSocket: any;

  beforeEach(() => {
    fakeSocket = { send: vi.fn(), close: vi.fn(), readyState: 1 };
    vi.spyOn(qnaService, "fetchQuestions").mockResolvedValue([pendingQuestion, answeredQuestion]);
    vi.spyOn(qnaService, "createParticipantSocket").mockReturnValue(fakeSocket);
    vi.spyOn(qnaService, "submitQuestion");
  });

  afterEach(() => vi.restoreAllMocks());

  it("shows the ask-a-question input for participants", async () => {
    render(<QnAQueue roomId="room-1" mode="participant" participantId="p1" />);
    expect(screen.getByPlaceholderText(/Ask an anonymous question/i)).toBeInTheDocument();
  });

  it("does not show host controls (answer/dismiss) for participants", async () => {
    render(<QnAQueue roomId="room-1" mode="participant" participantId="p1" />);
    await waitFor(() => expect(qnaService.fetchQuestions).toHaveBeenCalled());
    expect(screen.queryByText("Answer")).not.toBeInTheDocument();
    expect(screen.queryByText("Dismiss")).not.toBeInTheDocument();
  });

  it("submits a question via the socket", async () => {
    render(<QnAQueue roomId="room-1" mode="participant" participantId="p1" />);
    await waitFor(() => expect(qnaService.createParticipantSocket).toHaveBeenCalled());

    const textarea = screen.getByPlaceholderText(/Ask an anonymous question/i);
    fireEvent.change(textarea, { target: { value: "New question here" } });
    fireEvent.click(screen.getByText("Ask"));

    expect(qnaService.submitQuestion).toHaveBeenCalledWith(
      fakeSocket,
      { room_id: "room-1", participant_id: "p1", question: "New question here" }
    );
  });

  it("disables Ask button when question is too short", async () => {
    render(<QnAQueue roomId="room-1" mode="participant" participantId="p1" />);
    const textarea = screen.getByPlaceholderText(/Ask an anonymous question/i);
    fireEvent.change(textarea, { target: { value: "hi" } });
    expect(screen.getByText("Ask")).toBeDisabled();
  });

  it("renders pending and answered questions in separate sections", async () => {
    render(<QnAQueue roomId="room-1" mode="participant" participantId="p1" />);
    await waitFor(() => {
      expect(screen.getByText("What is FastAPI?")).toBeInTheDocument();
      expect(screen.getByText("Answered Q")).toBeInTheDocument();
      expect(screen.getByText("Here's the answer")).toBeInTheDocument();
    });
  });
});

describe("QnAQueue - host mode", () => {
  let fakeSocket: any;

  beforeEach(() => {
    fakeSocket = { send: vi.fn(), close: vi.fn(), readyState: 1 };
    vi.spyOn(qnaService, "fetchQuestions").mockResolvedValue([pendingQuestion]);
    vi.spyOn(qnaService, "createHostSocket").mockReturnValue(fakeSocket);
    vi.spyOn(qnaService, "answerQuestion");
    vi.spyOn(qnaService, "dismissQuestion");
  });

  afterEach(() => vi.restoreAllMocks());

  it("does not show the ask-a-question input for host", async () => {
    render(<QnAQueue roomId="room-1" mode="host" />);
    expect(screen.queryByPlaceholderText(/Ask an anonymous question/i)).not.toBeInTheDocument();
  });

  it("shows Answer and Dismiss controls for pending questions", async () => {
    render(<QnAQueue roomId="room-1" mode="host" />);
    await waitFor(() => {
      expect(screen.getByText("Answer")).toBeInTheDocument();
      expect(screen.getByText("Dismiss")).toBeInTheDocument();
    });
  });

  it("sends an answer via the socket", async () => {
    render(<QnAQueue roomId="room-1" mode="host" />);
    await waitFor(() => expect(qnaService.createHostSocket).toHaveBeenCalled());

    const input = screen.getByPlaceholderText(/Write an answer/i);
    fireEvent.change(input, { target: { value: "Here is my answer" } });
    fireEvent.click(screen.getByText("Answer"));

    expect(qnaService.answerQuestion).toHaveBeenCalledWith(fakeSocket, "q1", "Here is my answer");
  });

  it("dismisses a question via the socket", async () => {
    render(<QnAQueue roomId="room-1" mode="host" />);
    await waitFor(() => expect(qnaService.createHostSocket).toHaveBeenCalled());

    fireEvent.click(screen.getByText("Dismiss"));
    expect(qnaService.dismissQuestion).toHaveBeenCalledWith(fakeSocket, "q1");
  });

  it("moves a question from pending to answered when socket pushes an update", async () => {
    render(<QnAQueue roomId="room-1" mode="host" />);
    await waitFor(() => expect(qnaService.createHostSocket).toHaveBeenCalled());

    const onMessageCallback = (qnaService.createHostSocket as any).mock.calls[0][1];
    onMessageCallback({
      type: "answered",
      question: { ...pendingQuestion, status: "answered", answer: "New answer" },
    });

    await waitFor(() => {
      expect(screen.getByText("New answer")).toBeInTheDocument();
    });
  });
});