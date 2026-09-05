"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function SharedPomodoro({
  roomId,
  isHost,
  onSessionFinished,
}: {
  roomId: string;
  isHost: boolean;
  onSessionFinished?: () => void;
}) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("WORK");
  const ws = useRef<WebSocket | null>(null);
  const localInterval = useRef<any>(null);

  useEffect(() => {
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/pomodoro/${roomId}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "SYNC_STATE" || msg.type === "TICK") {
          setSeconds(msg.data.remaining_seconds);
          setIsRunning(msg.data.is_running);
          setMode(msg.data.mode);
        } else if (msg.type === "FINISHED") {
          setIsRunning(false);
          onSessionFinished?.();
        }
      };

      ws.current.onerror = () => {
        // Fallback to local timer
      };
    } catch {
      // Backend offline
    }

    return () => {
      ws.current?.close();
      if (localInterval.current) clearInterval(localInterval.current);
    };
  }, [roomId, onSessionFinished]);

  const sendAction = (action: string, payload: any = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, ...payload }));
      return;
    }

    // Local fallback when backend WebSocket is offline
    if (action === "START") {
      setIsRunning(true);
      if (localInterval.current) clearInterval(localInterval.current);
      localInterval.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(localInterval.current);
            setIsRunning(false);
            onSessionFinished?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (action === "PAUSE") {
      setIsRunning(false);
      if (localInterval.current) clearInterval(localInterval.current);
    } else if (action === "RESET") {
      setIsRunning(false);
      if (localInterval.current) clearInterval(localInterval.current);
      setSeconds(mode === "WORK" ? 25 * 60 : 5 * 60);
    } else if (action === "SET_MODE") {
      const newMode = payload.mode || "WORK";
      setMode(newMode);
      setIsRunning(false);
      if (localInterval.current) clearInterval(localInterval.current);
      setSeconds(newMode === "WORK" ? 25 * 60 : 5 * 60);
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
