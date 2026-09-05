"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import SharedPomodoro from "@/components/pomodoro/SharedPomodoro";
import FlashcardDeck from "@/components/flashcards/FlashcardDeck";
import PeerRatingModal from "@/components/ratings/PeerRatingModal";
import HelpfulnessSummaryCard from "@/components/ratings/HelpfulnessSummaryCard";
import GlobalRoomSearchView from "@/components/member3/GlobalRoomSearchView";
import SessionLoggerView from "@/components/member3/SessionLoggerView";
import KanbanBoardView from "@/components/member3/KanbanBoardView";
import ResourceHubView from "@/components/member3/ResourceHubView";
import { roomService, getDevUserId } from "@/services/roomService";
import { flashcardService } from "@/services/flashcardService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Award,
  CheckCircle2,
  Home,
  Users,
  Presentation,
  Search,
  MessageSquare,
  HelpCircle,
  Monitor,
  CheckSquare,
  FolderOpen,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"all" | "member1" | "member2" | "member3">("all");
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("room-test-1");
  const [notes, setNotes] = useState("");
  const [deckTitle, setDeckTitle] = useState("Operating Systems Notes");
  const [cards, setCards] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // FR13 Peer Rating System state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingRefreshTrigger, setRatingRefreshTrigger] = useState(0);
  const currentUserId = getDevUserId();

  const fetchRooms = async () => {
    try {
      const data = await roomService.getPublicRooms();
      setRooms(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleGenerateFlashcards = async () => {
    if (!notes.trim()) return alert("Please enter some study notes.");
    setIsGenerating(true);
    try {
      const res = await flashcardService.generateCards({
        title: deckTitle,
        study_notes: notes,
        num_cards: 4,
        room_id: selectedRoom,
      });
      setCards(res.cards);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionFinished = () => {
    // Automatically prompt peer rating after study session finishes
    setIsRatingModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 -ml-2 px-2 h-7 text-xs">
                  <Home className="w-3.5 h-3.5 mr-1" />
                  Home
                </Button>
              </Link>
              <Badge className="bg-blue-100 text-blue-800 text-xs font-mono">EduStream Testing Hub</Badge>
            </div>
            <h1 className="text-2xl font-black text-slate-900">All Teammate Features Workspace</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive testbed uniting Member 1, Member 2, and Member 3 features.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/rooms/${selectedRoom}`}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                Open Live Room ({selectedRoom}) &rarr;
              </Button>
            </Link>
            <PeerRatingModal
              roomId={selectedRoom}
              roomTitle={`Study Session (${selectedRoom})`}
              isOpen={isRatingModalOpen}
              onOpenChange={setIsRatingModalOpen}
              onRatingsSubmitted={() => setRatingRefreshTrigger((prev) => prev + 1)}
              triggerButtonText="Rate Peers"
            />
            <CreateRoomModal onCreated={fetchRooms} />
          </div>
        </div>

        {/* Member Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="text-xs font-semibold"
          >
            All Members Overview
          </Button>
          <Button
            variant={activeTab === "member1" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("member1")}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900"
          >
            Member 1 (FR1, FR5, FR9, FR13)
          </Button>
          <Button
            variant={activeTab === "member2" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("member2")}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Member 2 (FR2, FR6, FR10, FR14, Auth)
          </Button>
          <Button
            variant={activeTab === "member3" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("member3")}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Member 3 (FR3, FR7, FR11, FR15)
          </Button>
        </div>

        {/* MEMBER 1 SECTION */}
        {(activeTab === "all" || activeTab === "member1") && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Badge className="bg-blue-600 text-white text-xs">Member 1</Badge>
              <h2 className="text-lg font-bold text-slate-900">Study Rooms, Pomodoro, AI Flashcards & Peer Ratings</h2>
            </div>

            {/* FR1 & FR5 row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>FR1: Active Study Rooms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rooms.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">
                      No active study rooms yet. Create one to get started.
                    </p>
                  ) : (
                    rooms.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRoom(r.id)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition ${
                          selectedRoom === r.id
                            ? "border-blue-600 bg-blue-50/50"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-slate-900">{r.title}</h3>
                          <div className="flex gap-1.5">
                            {r.tags?.map((t: string) => (
                              <Badge key={t} variant="secondary" className="text-xs bg-slate-200 text-slate-800">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{r.description || "No description provided."}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>FR5: Synchronized Pomodoro</CardTitle>
                  <Badge variant="outline" className="text-xs text-slate-600">
                    Auto-triggers FR13 on End
                  </Badge>
                </CardHeader>
                <CardContent className="py-6 space-y-4">
                  <SharedPomodoro
                    roomId={selectedRoom}
                    isHost={true}
                    onSessionFinished={handleSessionFinished}
                  />
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsRatingModalOpen(true)}
                      className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
                      Simulate Session End & Rate Peers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FR13 Peer Rating System Section */}
            <Card className="border-amber-200 bg-gradient-to-b from-white to-amber-50/20">
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Award className="w-5 h-5 text-amber-600" />
                      FR13: Peer Rating System (Post-Study Session Helpfulness Evaluation)
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      After each study session concludes, participants rate the helpfulness of other members to foster accountability and collaboration.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsRatingModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold self-start sm:self-auto"
                  >
                    <Star className="w-4 h-4 mr-1.5 fill-white" />
                    Launch Peer Rating Dialog
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4 text-xs text-slate-600 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 text-sm">How FR13 Works in EduStream:</h4>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Session Completion Trigger:</strong> Rating is prompted automatically when the synchronized Pomodoro study timer concludes or when manually finished by participants.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>1–5 Helpfulness Scale:</strong> Rate peers on helpfulness (from <em>Needs Improvement</em> up to <em>Extremely Helpful</em>).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Qualitative Peer Feedback:</strong> Leave optional notes highlighting specific contributions (e.g. clear explanations, shared notes).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Self-Rating Prevention:</strong> The system strictly prevents participants from rating themselves.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Reputation Aggregation:</strong> Computes average scores, 5-star distribution breakdowns, and testimonials in real time.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Live Helpfulness Reputation Card */}
                  <HelpfulnessSummaryCard
                    userId={currentUserId}
                    userName="You (Active Participant)"
                    refreshTrigger={ratingRefreshTrigger}
                  />
                </div>
              </CardContent>
            </Card>

            {/* FR9: AI Flashcards */}
            <Card>
              <CardHeader>
                <CardTitle>FR9: AI Flashcard Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Deck Title</label>
                  <Input
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    placeholder="e.g., Operating Systems Unit 1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Study Notes</label>
                  <Textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Paste revision notes or lecture summaries here..."
                  />
                </div>
                <Button
                  onClick={handleGenerateFlashcards}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {isGenerating ? "Generating Flashcards..." : "Generate Flashcards with AI"}
                </Button>

                {cards.length > 0 && (
                  <div className="pt-6 border-t border-slate-200">
                    <FlashcardDeck cards={cards} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* MEMBER 2 SECTION */}
        {(activeTab === "all" || activeTab === "member2") && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Badge className="bg-indigo-600 text-white text-xs">Member 2</Badge>
              <h2 className="text-lg font-bold text-slate-900">Live Collaboration: Canvas, Chat, Q&A, ScreenShare & Auth</h2>
            </div>

            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white">
              <CardHeader>
                <CardTitle className="text-lg text-indigo-950 flex items-center justify-between">
                  <span>Interactive Real-time Room Tools</span>
                  <Link href={`/rooms/${selectedRoom}`}>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                      Enter Live Collaboration Room &rarr;
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      <Presentation className="w-4 h-4" />
                      FR2: Canvas Whiteboard
                    </div>
                    <p className="text-xs text-slate-500">Real-time collaborative whiteboard with drawing, shape tools, and stroke sync.</p>
                    <Link href={`/rooms/${selectedRoom}/canvas`} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Launch Canvas &rarr;
                      </Button>
                    </Link>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      <MessageSquare className="w-4 h-4" />
                      FR6: Group Chat
                    </div>
                    <p className="text-xs text-slate-500">Multi-participant WebSocket messaging with user identities & live status.</p>
                    <Link href={`/rooms/${selectedRoom}/chat`} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Launch Chat &rarr;
                      </Button>
                    </Link>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      <HelpCircle className="w-4 h-4" />
                      FR10: Anonymous Q&A
                    </div>
                    <p className="text-xs text-slate-500">Post anonymous questions, upvote popular topics, and mark answered.</p>
                    <Link href={`/rooms/${selectedRoom}/qna`} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Launch Q&A Queue &rarr;
                      </Button>
                    </Link>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                      <Monitor className="w-4 h-4" />
                      FR14: Screen Share
                    </div>
                    <p className="text-xs text-slate-500">Stream screen and application windows peer-to-peer to all participants.</p>
                    <Link href={`/rooms/${selectedRoom}/screenshare`} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Launch Screen Share &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
                  <span><strong>Member 2 Authentication & Profile:</strong> Secure bcrypt password hashing & JWT token sessions</span>
                  <div className="flex gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-xs h-7">Login Page</Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="ghost" size="sm" className="text-xs h-7">Register Page</Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-xs h-7">User Dashboard</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MEMBER 3 SECTION */}
        {(activeTab === "all" || activeTab === "member3") && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Badge className="bg-emerald-600 text-white text-xs">Member 3</Badge>
              <h2 className="text-lg font-bold text-slate-900">Room Search, Kanban Task Board, Resource Hub & Session Logger</h2>
            </div>

            {/* FR3: Global Room Search & FR15: Session Logger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Search className="w-5 h-5 text-emerald-600" />
                    FR3: Global Room Search & Topic Tag Filter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GlobalRoomSearchView />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    FR15: Study Session Logger & History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionLoggerView userId={currentUserId} roomId={selectedRoom} />
                </CardContent>
              </Card>
            </div>

            {/* FR7: Kanban Board & FR11: Resource Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    FR7: Room Kanban Task Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KanbanBoardView roomId={selectedRoom} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <FolderOpen className="w-5 h-5 text-emerald-600" />
                    FR11: Room Resource & Document Hub
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResourceHubView roomId={selectedRoom} userId={currentUserId} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

