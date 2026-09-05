"use client";

import { useEffect, useState } from "react";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import SharedPomodoro from "@/components/pomodoro/SharedPomodoro";
import FlashcardDeck from "@/components/flashcards/FlashcardDeck";
import PeerRatingModal from "@/components/ratings/PeerRatingModal";
import HelpfulnessSummaryCard from "@/components/ratings/HelpfulnessSummaryCard";
import { roomService, getDevUserId } from "@/services/roomService";
import { flashcardService } from "@/services/flashcardService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Award, CheckCircle2 } from "lucide-react";

export default function DemoPage() {
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
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">EduStream Member 1 Workspace</h1>
            <p className="text-sm text-slate-500">
              FR1 (Rooms), FR5 (Pomodoro), FR9 (AI Flashcards), <span className="font-semibold text-amber-700">FR13 (Peer Rating System)</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PeerRatingModal
              roomId={selectedRoom}
              roomTitle={`Study Session (${selectedRoom})`}
              isOpen={isRatingModalOpen}
              onOpenChange={setIsRatingModalOpen}
              onRatingsSubmitted={() => setRatingRefreshTrigger((prev) => prev + 1)}
              triggerButtonText="Rate Session Peers"
            />
            <CreateRoomModal onCreated={fetchRooms} />
          </div>
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
    </main>
  );
}
