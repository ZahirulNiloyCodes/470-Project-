"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChatMessage as ChatMessageType,
  fetchMessages,
  createChatSocket,
  sendNewMessage,
  sendEditMessage,
  sendDeleteMessage,
} from "@/services/chatService";
import ChatMessage from "./ChatMessage";

interface ChatBoxProps {
  roomId: string;
  currentUserId: string;
  currentUsername: string;
}

export default function ChatBox({ roomId, currentUserId, currentUsername }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchMessages(roomId)
      .then((msgs) => {
        if (isMounted) setMessages(msgs);
      })
      .catch((err) => console.error("Failed to load messages:", err));

    const socket = createChatSocket(roomId, (incoming) => {
      if (incoming.type === "new") {
        setMessages((prev) => [...prev, incoming.message]);
      } else if (incoming.type === "edit" || incoming.type === "delete") {
        setMessages((prev) =>
          prev.map((m) => (m.id === incoming.message.id ? incoming.message : m))
        );
      } else if (incoming.type === "error") {
        console.error("Chat error:", incoming.detail);
      }
    });

    socketRef.current = socket;
    return () => {
      isMounted = false;
      socket.close();
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || !socketRef.current) return;

    if (editingId) {
      sendEditMessage(socketRef.current, editingId, currentUserId, trimmed);
      setEditingId(null);
    } else {
      sendNewMessage(socketRef.current, {
        room_id: roomId,
        user_id: currentUserId,
        username: currentUsername,
        content: trimmed,
      });
    }
    setInput("");
  };

  const handleEdit = (messageId: string, currentContent: string) => {
    setEditingId(messageId);
    setInput(currentContent);
  };

  const handleDelete = (messageId: string) => {
    if (!socketRef.current) return;
    sendDeleteMessage(socketRef.current, messageId, currentUserId);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100">
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500 text-center mt-8">
            Still no messages — send the first message.
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-700 p-3 flex flex-col gap-2 bg-zinc-900">
        {editingId && (
          <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
            <span>Editing message...</span>
            <button
              onClick={() => {
                setEditingId(null);
                setInput("");
              }}
              className="text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type a message... (Markdown & ```code``` supported)"
            className="flex-1 border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-md text-sm transition-colors"
          >
            {editingId ? "Save" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}