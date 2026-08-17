"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Flashcard {
  question: string;
  answer: string;
}

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards || cards.length === 0) return <div>No flashcards generated.</div>;

  const current = cards[index];

  return (
    <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
      <Card
        onClick={() => setFlipped(!flipped)}
        className="w-full h-56 flex items-center justify-center p-6 text-center cursor-pointer select-none transition-transform hover:scale-[1.02]"
      >
        <CardContent className="p-0">
          <p className="text-xs uppercase text-muted-foreground mb-2">
            {flipped ? "Answer" : "Question"} ({index + 1} / {cards.length})
          </p>
          <p className="text-lg font-medium">{flipped ? current.answer : current.question}</p>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => { setIndex(index - 1); setFlipped(false); }}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          disabled={index === cards.length - 1}
          onClick={() => { setIndex(index + 1); setFlipped(false); }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
