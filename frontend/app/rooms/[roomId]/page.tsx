"use client";

import { useState } from "react";
import Link from "next/link";
import SharedPomodoro from "@/components/pomodoro/SharedPomodoro";
import PeerRatingModal from "@/components/ratings/PeerRatingModal";
import CollaborativeCanvas from "@/components/canvas/CollaborativeCanvas";
import ChatBox from "@/components/chat/ChatBox";
import QnAQueue from "@/components/qna/QnAQueue";
import ScreenShareView from "@/components/screenshare/ScreenShareView";
import KanbanBoardView from "@/components/member3/KanbanBoardView";
import ResourceHubView from "@/components/member3/ResourceHubView";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MessageSquare, Presentation, HelpCircle, Monitor, CheckSquare, FolderOpen } from "lucide-react";

interface RoomPageProps {
  params: { roomId: string };
}

export default function RoomDetailsPage({ params }: RoomPageProps) {
  const { roomId } = params;
  const [activeTab, setActiveTab] = useState<"pomodoro" | "canvas" | "chat" | "qna" | "screenshare" | "tasks" | "resources">("pomodoro");
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Default dev credentials
  const currentUserId = "11111111-1111-4111-a111-111111111111";
  const currentUsername = "Student";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/demo">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Hub
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-700" />
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            Room: <span className="text-blue-400 font-mono text-base">{roomId}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <PeerRatingModal
            roomId={roomId}
            roomTitle={`Study Session (${roomId})`}
            isOpen={isRatingOpen}
            onOpenChange={setIsRatingOpen}
            onRatingsSubmitted={() => {}}
            triggerButtonText="Rate Peers"
          />
        </div>
      </header>

      {/* Tabs navigation */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pomodoro")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "pomodoro"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          Pomodoro & Ratings
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "chat"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>

        <button
          onClick={() => setActiveTab("canvas")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "canvas"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Presentation className="w-4 h-4" />
          Whiteboard
        </button>

        <button
          onClick={() => setActiveTab("qna")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "qna"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Anonymous Q&A
        </button>

        <button
          onClick={() => setActiveTab("screenshare")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "screenshare"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Monitor className="w-4 h-4" />
          Screen Share
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Kanban Tasks
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "resources"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Resources
        </button>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-6">
        {activeTab === "pomodoro" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <SharedPomodoro
              roomId={roomId}
              isHost={true}
              onSessionFinished={() => setIsRatingOpen(true)}
            />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="h-[750px] max-w-4xl mx-auto rounded-lg overflow-hidden border border-slate-800">
            <ChatBox
              roomId={roomId}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
            />
          </div>
        )}

        {activeTab === "canvas" && (
          <div className="h-[750px] rounded-lg overflow-hidden border border-slate-800 bg-white text-slate-900">
            <CollaborativeCanvas roomId={roomId} />
          </div>
        )}

        {activeTab === "qna" && (
          <div className="max-w-4xl mx-auto rounded-lg p-6 bg-slate-900 border border-slate-800">
            <QnAQueue
              roomId={roomId}
              mode="participant"
              participantId={currentUserId}
            />
          </div>
        )}

        {activeTab === "screenshare" && (
          <div className="max-w-4xl mx-auto rounded-lg p-6 bg-slate-900 border border-slate-800">
            <ScreenShareView
              roomId={roomId}
              participantId={currentUserId}
              participantName={currentUsername}
            />
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="max-w-5xl mx-auto bg-white rounded-lg p-6 border border-slate-800 text-slate-900">
            <KanbanBoardView roomId={roomId} />
          </div>
        )}

        {activeTab === "resources" && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border border-slate-800 text-slate-900">
            <ResourceHubView roomId={roomId} userId={currentUserId} />
          </div>
        )}
      </main>
    </div>
  );
}
