import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatMessage from "./ChatMessage";

const baseMessage = {
  id: "m1",
  room_id: "room-1",
  user_id: "u1",
  username: "Alice",
  content: "Hello **world**",
  is_edited: false,
  is_deleted: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ChatMessage", () => {
  it("renders markdown bold text", () => {
    render(
      <ChatMessage message={baseMessage} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    const bold = screen.getByText("world");
    expect(bold.tagName.toLowerCase()).toBe("strong");
  });

  it("renders code blocks using syntax highlighter", () => {
    const msg = { ...baseMessage, content: "```js\nconsole.log('hi')\n```" };
    render(<ChatMessage message={msg} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/console\.log/)).toBeInTheDocument();
  });

  it("shows deleted placeholder when is_deleted is true", () => {
    const msg = { ...baseMessage, is_deleted: true };
    render(<ChatMessage message={msg} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/deleted this message/i)).toBeInTheDocument();
  });

  it("shows edit/delete controls only for message owner", () => {
    const { rerender } = render(
      <ChatMessage message={baseMessage} currentUserId="u1" onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();

    rerender(
      <ChatMessage message={baseMessage} currentUserId="u2" onEdit={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("calls onEdit with message id and content when Edit clicked", () => {
    const onEdit = vi.fn();
    render(
      <ChatMessage message={baseMessage} currentUserId="u1" onEdit={onEdit} onDelete={vi.fn()} />
    );
    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith("m1", "Hello **world**");
  });

  it("calls onDelete with message id when Delete clicked", () => {
    const onDelete = vi.fn();
    render(
      <ChatMessage message={baseMessage} currentUserId="u1" onEdit={vi.fn()} onDelete={onDelete} />
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith("m1");
  });
});