"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChatMessage as ChatMessageType } from "@/services/chatService";

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserId: string;
  onEdit: (messageId: string, currentContent: string) => void;
  onDelete: (messageId: string) => void;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // 0 ঘণ্টা মানে 12 AM/PM

  return `${dd}/${mm}/${yyyy}, ${hours}:${minutes} ${ampm}`;
}

export default function ChatMessage({
  message,
  currentUserId,
  onEdit,
  onDelete,
}: ChatMessageProps) {
  const isOwner = message.user_id === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (message.is_deleted) {
    return (
      <div className="text-sm italic text-zinc-500 px-3 py-1">
        {message.username} deleted this message
      </div>
    );
  }

  return (
    <div className="group relative px-3 py-2 hover:bg-zinc-800/60 rounded-md">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-zinc-100">{message.username}</span>
        <span className="text-xs text-zinc-500">{formatTimestamp(message.created_at)}</span>
        {message.is_edited && <span className="text-xs text-zinc-500">(edited)</span>}

        {isOwner && (
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(message.id, message.content)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="prose prose-sm prose-invert max-w-none mt-1">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter style={oneDark as any} language={match[1]} PreTag="div">
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}