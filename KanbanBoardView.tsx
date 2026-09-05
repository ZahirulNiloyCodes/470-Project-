"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function KanbanBoardView({ roomId }: { roomId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  const fetchTasks = async () => {
    const res = await fetch(`/api/tasks/${roomId}`);
    setTasks(await res.json());
  };

  useEffect(() => { fetchTasks(); }, [roomId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId, title }),
    });
    setTitle("");
    fetchTasks();
  };

  const updateStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTasks();
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