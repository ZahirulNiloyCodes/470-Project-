"use client";

import { useEffect, useState } from "react";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import SharedPomodoro from "@/components/pomodoro/SharedPomodoro";
import FlashcardDeck from "@/components/flashcards/FlashcardDeck";
import { roomService } from "@/services/roomService";
import { flashcardService } from "@/services/flashcardService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DemoPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("room-test-1");
  const [notes, setNotes] = useState("");
  const [deckTitle, setDeckTitle] = useState("Operating Systems Notes");
  const [cards, setCards] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">EduStream Member 1 Workspace</h1>
            <p className="text-sm text-slate-500">FR1 (Rooms), FR5 (Pomodoro), FR9 (AI Flashcards)</p>
          </div>
          <CreateRoomModal onCreated={fetchRooms} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>FR1: Active Study Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rooms.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No active study rooms yet. Create one to get started.</p>
              ) : (
                rooms.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoom(r.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition ${
                      selectedRoom === r.id ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">{r.title}</h3>
                      <div className="flex gap-1.5">
                        {r.tags?.map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-xs bg-slate-200 text-slate-800">{t}</Badge>
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
            <CardHeader>
              <CardTitle>FR5: Synchronized Pomodoro</CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <SharedPomodoro roomId={selectedRoom} isHost={true} />
            </CardContent>
          </Card>
        </div>

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
            <Button onClick={handleGenerateFlashcards} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
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
