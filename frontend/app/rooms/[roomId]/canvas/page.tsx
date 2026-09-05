import CollaborativeCanvas from "@/components/canvas/CollaborativeCanvas";

interface PageProps {
  params: { roomId: string };
}

export default function CanvasPage({ params }: PageProps) {
  return <CollaborativeCanvas roomId={params.roomId} />;
}