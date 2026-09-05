import ResourceHubView from '@/views/ResourceHubView';
import KanbanBoardView from '@/views/KanbanBoardView';
import SessionLoggerView from '@/views/SessionLoggerView';
import GlobalRoomSearchView from '@/views/GlobalRoomSearchView';

export default function Home() {
  const dummyRoomId = "room-101";
  const dummyUserId = "user-001";

  return (
    <main className="min-h-screen p-8 space-y-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold">EduStream Workspace</h1>
      
      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Global Room Search (FR-15)</h2>
        <GlobalRoomSearchView />
      </section>

      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Resource Hub (FR-3)</h2>
        <ResourceHubView roomId={dummyRoomId} userId={dummyUserId} />
      </section>

      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Kanban Task Board (FR-7)</h2>
        <KanbanBoardView roomId={dummyRoomId} />
      </section>

      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Study Session Logger (FR-11)</h2>
        <SessionLoggerView userId={dummyUserId} roomId={dummyRoomId} />
      </section>
    </main>
  );
}
