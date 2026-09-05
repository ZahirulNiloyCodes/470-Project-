"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function GlobalRoomSearchView() {
  const [keyword, setKeyword] = useState("");
  const [tag, setTag] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (keyword) params.append("q", keyword);
    if (tag) params.append("tag", tag);

    const res = await fetch(`/api/rooms/search?${params.toString()}`);
    setRooms(await res.json());
  };

  useEffect(() => { handleSearch(); }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div className="flex gap-2">
        <Input placeholder="Search title..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <Input placeholder="Filter by Tag (e.g. OS)" value={tag} onChange={(e) => setTag(e.target.value)} />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader><CardTitle>{room.title}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-1 flex-wrap">
                {room.tags.map((t: string) => (
                  <span key={t} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{t}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}