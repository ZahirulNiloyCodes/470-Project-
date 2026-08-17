"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function SharedPomodoro({ roomId, isHost }: { roomId: string; isHost: boolean }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("WORK");
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/pomodoro/${roomId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "SYNC_STATE" || msg.type === "TICK") {
        setSeconds(msg.data.remaining_seconds);
        setIsRunning(msg.data.is_running);
        setMode(msg.data.mode);
      }
    };

    return () => ws.current?.close();
  }, [roomId]);

  const sendAction = (action: string, payload = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, ...payload }));
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">{mode} SESSION</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-5xl font-mono font-bold tracking-tight">{formatTime(seconds)}</div>
        {isHost ? (
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button size="sm" onClick={() => sendAction("START")} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-1" /> Start
              </Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => sendAction("PAUSE")}>
                <Pause className="w-4 h-4 mr-1" /> Pause
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => sendAction("RESET")}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Host is controlling the clock</p>
        )}
      </CardContent>
    </Card>
  );
}
