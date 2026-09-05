"use client";

import ChatBox from "@/components/chat/ChatBox";

interface PageProps {
  params: { roomId: string };
}

export default function ChatPage({ params }: PageProps) {
  // TODO: actual auth system আসলে এখান থেকে real user id/username নিতে হবে
  const currentUserId = "temp-user-id";
  const currentUsername = "temp-username";

  return (
    <div className="h-screen">
      <ChatBox
        roomId={params.roomId}
        currentUserId={currentUserId}
        currentUsername={currentUsername}
      />
    </div>
  );
}