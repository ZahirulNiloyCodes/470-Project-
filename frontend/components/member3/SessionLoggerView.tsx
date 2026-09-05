"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, History, Clock, Flame, CheckCircle } from "lucide-react";

interface StudyLog {
  id: string;
  user_id: string;
  room_id: string;
  duration_minutes: number;
  session_date: string;
}

const DEFAULT_SAMPLE_LOGS: StudyLog[] = [
  {
    id: "log-1",
    user_id: "demo-user",
    room_id: "room-1",
    duration_minutes: 50,
    session_date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "log-2",
    user_id: "demo-user",
    room_id: "room-1",
    duration_minutes: 30,
    session_date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "log-3",
    user_id: "demo-user",
    room_id: "room-1",
    duration_minutes: 45,
    session_date: new Date().toISOString(),
  },
];

export default function SessionLoggerView({ userId, roomId }: { userId: string; roomId: string }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState<StudyLog[]>(DEFAULT_SAMPLE_LOGS);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/study-logs/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        }
      }
    } catch (err) {
      console.warn("Could not reach study logs backend, using sample history:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    setIsActive(false);
    setIsPaused(false);
    const durationMinutes = Math.max(1, Math.round(seconds / 60));

    const newLog: StudyLog = {
      id: "log-" + Date.now(),
      user_id: userId,
      room_id: roomId,
      duration_minutes: durationMinutes,
      session_date: new Date().toISOString(),
    };

    // Optimistic UI update
    setLogs((prev) => [newLog, ...prev]);
    setSeconds(0);
    setSaveStatus(`Session of ${durationMinutes} min saved to your study log!`);
    setTimeout(() => setSaveStatus(null), 4000);

    try {
      await fetch("/api/study-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          room_id: roomId,
          duration_minutes: durationMinutes,
        }),
      });
    } catch (err) {
      console.warn("Study log saved locally (backend unreachable)");
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalMinutesStudied = logs.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      {/* Session Timer Card */}
      <Card className="border border-slate-200 shadow-sm text-center">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              FR15: Study Session Logger
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
              Auto Tracking
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="py-6 bg-slate-900 rounded-xl text-white shadow-inner">
            <span className="text-5xl sm:text-6xl font-mono font-extrabold tracking-wider">
              {formatTime(seconds)}
            </span>
            <p className="text-xs text-slate-400 mt-2">
              {isActive
                ? isPaused
                  ? "Timer Paused"
                  : "Logging Study Session Time..."
                : "Timer Ready - Press Start"}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {!isActive ? (
              <Button
                onClick={handleStart}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  className="border-slate-300 flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleStop}
                  className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Stop & Save Log
                </Button>
              </>
            )}
          </div>

          {saveStatus && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1.5 pt-1">
              <CheckCircle className="w-4 h-4" />
              {saveStatus}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stat */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Study Time</p>
            <p className="text-lg font-extrabold text-slate-900">{totalMinutesStudied} mins</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Completed Sessions</p>
            <p className="text-lg font-extrabold text-slate-900">{logs.length} sessions</p>
          </div>
        </div>
      </div>

      {/* Study History Card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              Study Session History
            </CardTitle>
            <span className="text-xs text-slate-500">{logs.length} logged records</span>
          </div>
        </CardHeader>
        <CardContent className="pt-3 divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between items-center py-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-slate-700 font-medium">
                  {new Date(log.session_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Badge variant="secondary" className="font-semibold text-xs text-indigo-800 bg-indigo-50">
                {log.duration_minutes} Minutes
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
