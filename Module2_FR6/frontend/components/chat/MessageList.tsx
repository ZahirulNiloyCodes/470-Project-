"use client";

import { useEffect, useRef } from "react";

import {
  ChatMessage,
} from "@/types/chat";

import MessageItem from "./MessageItem";


interface Props {
  messages: ChatMessage[];

  currentUserId: string;

  onEdit: (
    message: ChatMessage
  ) => void;

  onDelete: (
    message: ChatMessage
  ) => void;
}


export default function MessageList({
  messages,
  currentUserId,
  onEdit,
  onDelete,
}: Props) {

  const bottomRef =
    useRef<HTMLDivElement>(null);


  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  return (
    <div className="flex-1 overflow-y-auto px-6">

      {messages.length === 0 && (

        <div className="flex h-full items-center justify-center">

          <p className="text-gray-500">
            No messages yet. Start the conversation!
          </p>

        </div>

      )}


      {messages.map((message) => (

        <MessageItem
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />

      ))}


      <div ref={bottomRef} />

    </div>
  );
}