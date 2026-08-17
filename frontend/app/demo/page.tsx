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
    <div className="container mx-auto p-8 space-y-10 max-w-5xl">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">EduStream Member 1 Workspace</h1>
          <p className="text-sm text-muted-foreground">FR1 (Rooms), FR5 (Pomodoro), FR9 (AI Flashcards)</p>
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
              <p className="text-sm text-muted-foreground">No rooms found. Click 'Create Study Room' above.</p>
            ) : (
              rooms.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoom(r.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedRoom === r.id ? "border-blue-500 bg-blue-50/20" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{r.title}</h3>
                    <div className="flex gap-1">
                      {r.tags?.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{r.description || "No description."}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-center">FR5: Synchronized Pomodoro</CardTitle>
          </CardHeader>
          <SharedPomodoro roomId={selectedRoom} isHost={true} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FR9: AI Flashcard Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="Deck Title"
          />
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here..."
          />
          <Button onClick={handleGenerateFlashcards} disabled={isGenerating}>
            {isGenerating ? "Generating Flashcards..." : "Generate Flashcards with AI"}
          </Button>

          {cards.length > 0 && (
            <div className="pt-4 border-t">
              <FlashcardDeck cards={cards} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
