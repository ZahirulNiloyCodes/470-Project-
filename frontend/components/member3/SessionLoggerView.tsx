"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SessionLoggerView({ userId, roomId }: { userId: string; roomId: string }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const fetchLogs = async () => {
    const res = await fetch(`/api/study-logs/user/${userId}`);
    setLogs(await res.json());
  };

  useEffect(() => { fetchLogs(); }, [userId]);

  const handleStop = async () => {
    setIsActive(false);
    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    await fetch("/api/study-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, room_id: roomId, duration_minutes: durationMinutes }),
    });
    setSeconds(0);
    fetchLogs();
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <Card className="text-center">
        <CardHeader><CardTitle>Session Timer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-mono">{Math.floor(seconds / 60)}m {seconds % 60}s</div>
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <Button onClick={() => setIsActive(true)}>Start Session</Button>
            ) : (
              <Button variant="destructive" onClick={handleStop}>Stop & Save Log</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Study History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between border-b py-2 text-sm">
              <span>{new Date(log.session_date).toLocaleDateString()}</span>
              <span className="font-bold">{log.duration_minutes} Minutes</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
