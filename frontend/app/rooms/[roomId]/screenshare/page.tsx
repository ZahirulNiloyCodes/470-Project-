"use client";

import ScreenShareView from "@/components/screenshare/ScreenShareView";

interface PageProps {
  params: { roomId: string };
}

export default function ScreenSharePage({ params }: PageProps) {
  // TODO: auth system আসলে real participantId/participantName বসবে
  const participantId = "temp-participant-id";
  const participantName = "temp-user";

  return (
    <div className="h-screen">
      <ScreenShareView
        roomId={params.roomId}
        participantId={participantId}
        participantName={participantName}
      />
    </div>
  );
}