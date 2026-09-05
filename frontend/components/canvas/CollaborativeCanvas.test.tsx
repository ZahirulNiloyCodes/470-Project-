import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import CollaborativeCanvas from "./CollaborativeCanvas";
import * as canvasService from "@/services/canvasService";

vi.mock("tldraw", async () => {
  const actual = await vi.importActual<any>("tldraw");
  return {
    ...actual,
    Tldraw: () => <div data-testid="tldraw-mock" />,
  };
});

describe("CollaborativeCanvas", () => {
  beforeEach(() => {
    vi.spyOn(canvasService, "fetchCanvasSnapshot").mockResolvedValue([]);
    vi.spyOn(canvasService, "createCanvasSocket").mockReturnValue({
      close: vi.fn(),
      readyState: 1,
      send: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches the initial snapshot for the given room", async () => {
    render(<CollaborativeCanvas roomId="room-1" />);

    await waitFor(() => {
      expect(canvasService.fetchCanvasSnapshot).toHaveBeenCalledWith("room-1");
    });
  });

  it("opens a websocket connection scoped to the room", async () => {
    render(<CollaborativeCanvas roomId="room-1" />);

    await waitFor(() => {
      expect(canvasService.createCanvasSocket).toHaveBeenCalledWith(
        "room-1",
        expect.any(Function)
      );
    });
  });

  it("renders the tldraw canvas", () => {
    const { getByTestId } = render(<CollaborativeCanvas roomId="room-1" />);
    expect(getByTestId("tldraw-mock")).toBeInTheDocument();
  });
});