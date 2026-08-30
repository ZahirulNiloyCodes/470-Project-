"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getMessages,
} from "@/lib/api";

import {
  createChatSocket,
} from "@/lib/websocket";

import {
  ChatMessage,
  WebSocketEvent,
} from "@/types/chat";

import MessageList from "./MessageList";
import MessageInput from "./MessageInput";


interface Props {
  roomId: string;
  userId: string;
  username: string;
  roomTitle: string;
}

export default function ChatWindow({
  roomId,
  userId,
  username,
  roomTitle,
}: Props) {

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [editingMessage, setEditingMessage] =
    useState<ChatMessage | null>(null);

  const socketRef =
    useRef<WebSocket | null>(null);


  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        const data = await getMessages(roomId);

        if (!cancelled) {
          setMessages(data);
        }
      } catch (error) {
        console.error(
          "Failed to load messages:",
          error
        );
      }
    }

    loadMessages();

    const socket = createChatSocket(
      roomId,
      handleSocketEvent
    );

    socketRef.current = socket;

    return () => {
      cancelled = true;

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000, "Component unmounted");
      }
    };
  }, [roomId]);

  function handleSocketEvent(
    event: WebSocketEvent
  ) {

    if (event.type === "message") {

      setMessages((previous) => [
        ...previous,
        event.data,
      ]);

    }


    if (event.type === "edit") {

      setMessages((previous) =>
        previous.map((message) =>
          message.id === event.data.id
            ? event.data
            : message
        )
      );

    }


    if (event.type === "delete") {

      setMessages((previous) =>
        previous.map((message) =>
          message.id === event.data.id
            ? event.data
            : message
        )
      );

    }

  }


  function sendMessage(
    content: string
  ) {

    if (!socketRef.current) {
      return;
    }


    if (
      socketRef.current.readyState !==
      WebSocket.OPEN
    ) {
      return;
    }


    if (editingMessage) {

      socketRef.current.send(
        JSON.stringify({
          type: "edit",
          message_id:
            editingMessage.id,
          room_id: roomId,
          user_id: userId,
          username,
          content,
        })
      );

      setEditingMessage(null);

      return;
    }


    socketRef.current.send(
      JSON.stringify({
        type: "message",
        room_id: roomId,
        user_id: userId,
        username,
        content,
      })
    );

  }


  function handleDelete(message: ChatMessage) {
    if (!socketRef.current) {
      return;
    }

    if (
      socketRef.current.readyState !==
      WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "delete",
        message_id: message.id,
        room_id: roomId,
        user_id: userId,
        username,
      })
    );
  }


  function handleEdit(
    message: ChatMessage
  ) {

    setEditingMessage(
      message
    );

  }


  return (
    <div
      className="
        flex h-[700px]
        w-full max-w-4xl
        flex-col
        overflow-hidden
        rounded-xl
        border
        bg-white
        shadow-lg
        dark:bg-gray-950
      "
    >

      <div
        className="
          border-b
          px-6 py-4
        "
      >

        <h1 className="text-lg font-semibold text-white">
          Real-Time Chat
        </h1>

        <p className="text-xs text-gray-500">
          Room: {roomTitle}
        </p>

      </div>


      <MessageList
        messages={messages}
        currentUserId={userId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />


      <MessageInput
        onSend={sendMessage}
        editing={
          editingMessage !== null
        }
        initialValue={
          editingMessage?.content || ""
        }
        onCancelEdit={() =>
          setEditingMessage(null)
        }
      />

    </div>
  );
}