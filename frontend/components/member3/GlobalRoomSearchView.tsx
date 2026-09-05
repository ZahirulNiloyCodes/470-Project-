"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function GlobalRoomSearchView() {
  const [keyword, setKeyword] = useState("");
  const [tag, setTag] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);

  const sampleRooms = [
    { id: "room-os-101", title: "Operating Systems Final Prep", tags: ["OS", "Computer Science"] },
    { id: "room-algo-202", title: "Algorithms & Complexity Group", tags: ["Algorithms", "Math"] },
  ];

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append("q", keyword);
      if (tag) params.append("tag", tag);

      const res = await fetch(`/api/rooms/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
          return;
        }
      }
    } catch (err) {
      console.warn("Room search backend offline, using local filter fallback");
    }

    // Local filter fallback
    const filtered = sampleRooms.filter((r) => {
      const matchesKeyword = !keyword || r.title.toLowerCase().includes(keyword.toLowerCase());
      const matchesTag = !tag || r.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()));
      return matchesKeyword && matchesTag;
    });
    setRooms(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search title..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Input
          placeholder="Filter by Tag (e.g. OS)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <Button onClick={handleSearch} className="whitespace-nowrap">
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            No rooms found matching your search.
          </div>
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900">{room.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-1 flex-wrap">
                  {room.tags?.map((t: string) => (
                    <span key={t} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="pt-2">
                  <a
                    href={`/rooms/${room.id}`}
                    className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Enter Room &rarr;
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}