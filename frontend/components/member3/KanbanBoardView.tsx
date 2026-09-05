"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function KanbanBoardView({ roomId }: { roomId: string }) {
  const [tasks, setTasks] = useState<any[]>([
    { id: "task-1", room_id: roomId, title: "Review Chapter 3 Memory Management", status: "todo" },
    { id: "task-2", room_id: roomId, title: "Implement Page Replacement Algorithms", status: "in_progress" },
    { id: "task-3", room_id: roomId, title: "Submit Assignment Report", status: "done" },
  ]);
  const [title, setTitle] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
      }
    } catch (e) {
      console.warn("Tasks backend offline, using local state");
    }
  };

  useEffect(() => { fetchTasks(); }, [roomId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      room_id: roomId,
      title: title.trim(),
      status: "todo",
    };
    setTasks((prev) => [...prev, newTask]);
    setTitle("");
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId, title: newTask.title }),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  const updateStatus = async (taskId: string, status: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      // Offline fallback
    }
  };

  const columns: Array<"todo" | "in_progress" | "done"> = ["todo", "in_progress", "done"];

  return (
    <div className="p-4 space-y-4">
      <form onSubmit={addTask} className="flex gap-2 max-w-md">
        <Input placeholder="New Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Button type="submit">Add Task</Button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <Card key={col} className="bg-gray-50">
            <CardHeader><CardTitle className="capitalize">{col.replace("_", " ")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tasks.filter((t) => t.status === col).map((task) => (
                <div key={task.id} className="p-3 bg-white shadow rounded space-y-2">
                  <p>{task.title}</p>
                  <div className="flex justify-between gap-1">
                    {col !== "todo" && <Button size="sm" variant="outline" onClick={() => updateStatus(task.id, "todo")}>To Do</Button>}
                    {col !== "in_progress" && <Button size="sm" variant="outline" onClick={() => updateStatus(task.id, "in_progress")}>Progress</Button>}
                    {col !== "done" && <Button size="sm" variant="outline" onClick={() => updateStatus(task.id, "done")}>Done</Button>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}