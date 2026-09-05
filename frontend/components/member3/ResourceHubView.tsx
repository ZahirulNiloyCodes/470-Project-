"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ResourceHubView({ roomId, userId }: { roomId: string; userId: string }) {
  const [resources, setResources] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<'link' | 'file'>("link");

  const fetchResources = async () => {
    const res = await fetch(`/api/resources/${roomId}`);
    setResources(await res.json());
  };

  useEffect(() => { fetchResources(); }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId, user_id: userId, title, resource_type: type, url }),
    });
    setTitle("");
    setUrl("");
    fetchResources();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>Add Resource</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Resource Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input placeholder="URL / File Link" value={url} onChange={(e) => setUrl(e.target.value)} required />
            <div className="flex gap-2">
              <Button type="button" variant={type === "link" ? "default" : "outline"} onClick={() => setType("link")}>Link</Button>
              <Button type="button" variant={type === "file" ? "default" : "outline"} onClick={() => setType("file")}>File</Button>
            </div>
            <Button type="submit" className="w-full">Upload Resource</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-xl font-bold">Room Resources</h3>
        {resources.map((item) => (
          <div key={item.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{item.title}</p>
              <span className="text-xs text-gray-500 uppercase">{item.resource_type}</span>
            </div>
            <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Open</a>
          </div>
        ))}
      </div>
    </div>
  );
}