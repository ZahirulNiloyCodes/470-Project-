import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">EduStream Platform</h1>
      <p className="text-slate-600 mb-6 max-w-md">Collaborative Study Rooms, Shared Pomodoro, and AI Flashcards.</p>
      <Link href="/demo">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3">
          Open Member 1 Workspace (/demo)
        </Button>
      </Link>
    </main>
  );
}
