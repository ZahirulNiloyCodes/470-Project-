import ChatWindow from "@/components/chat/ChatWindow";
import { getRoom } from "@/lib/api";

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function ChatPage({
  params,
}: PageProps) {
  const { roomId } = await params;

  const room = await getRoom(roomId);

  return (
    <main
      className="
        min-h-screen
        bg-gray-100
        p-6
        dark:bg-gray-900
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-5xl
          justify-center
        "
      >
        <ChatWindow
          roomId={roomId}
          userId="TEMP_USER_ID"
          username="TEMP_USER"
          roomTitle={room.title}
        />
      </div>
    </main>
  );
}