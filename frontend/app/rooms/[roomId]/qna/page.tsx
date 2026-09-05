"use client";

import QnAQueue from "@/components/qna/QnAQueue";

interface PageProps {
  params: { roomId: string };
}

export default function QnAPage({ params }: PageProps) {
  // TODO: actual auth/role system আসলে এখান থেকে real mode/participantId নিতে হবে
  const mode: "host" | "participant" = "participant";
  const participantId = null;

  return (
    <div className="h-screen">
      <QnAQueue roomId={params.roomId} mode={mode} participantId={participantId} />
    </div>
  );
}