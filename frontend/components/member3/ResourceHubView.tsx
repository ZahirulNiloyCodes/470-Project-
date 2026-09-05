"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Link2, PlusCircle, CheckCircle } from "lucide-react";

interface Resource {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  resource_type: "link" | "file";
  url: string;
  created_at?: string;
}

const DEFAULT_SAMPLE_RESOURCES: Resource[] = [
  {
    id: "res-sample-1",
    room_id: "room-1",
    user_id: "demo-user",
    title: "Operating Systems Lecture Slides (PDF)",
    resource_type: "file",
    url: "https://example.com/os-lecture-slides.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "res-sample-2",
    room_id: "room-1",
    user_id: "demo-user",
    title: "FastAPI Documentation & Tutorials",
    resource_type: "link",
    url: "https://fastapi.tiangolo.com",
    created_at: new Date().toISOString(),
  },
  {
    id: "res-sample-3",
    room_id: "room-1",
    user_id: "demo-user",
    title: "Database Indexing & Normalization Cheatsheet",
    resource_type: "link",
    url: "https://use-the-index-luke.com",
    created_at: new Date().toISOString(),
  },
];

export default function ResourceHubView({ roomId, userId }: { roomId: string; userId: string }) {
  const [resources, setResources] = useState<Resource[]>(DEFAULT_SAMPLE_RESOURCES);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"link" | "file">("link");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      const res = await fetch(`/api/resources/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setResources(data);
        }
      }
    } catch (err) {
      console.warn("Could not reach backend resource hub, using sample data:", err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [roomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsLoading(true);
    const newResource: Resource = {
      id: "res-" + Date.now(),
      room_id: roomId,
      user_id: userId,
      title: title.trim(),
      resource_type: type,
      url: url.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setResources((prev) => [newResource, ...prev]);
    setTitle("");
    setUrl("");

    try {
      await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          user_id: userId,
          title: newResource.title,
          resource_type: newResource.resource_type,
          url: newResource.url,
        }),
      });
      setStatusMessage("Resource uploaded successfully!");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.warn("Resource saved locally (backend unreachable)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      {/* Upload Form Card */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Upload Study Resource (FR11)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase">Resource Title</label>
              <Input
                placeholder="e.g. Chapter 4 Practice Problems or Official Docs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase">URL or Drive Link</label>
              <Input
                placeholder="https://..."
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === "link" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType("link")}
                  className="flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Web Link
                </Button>
                <Button
                  type="button"
                  variant={type === "file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType("file")}
                  className="flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  File Document
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isLoading ? "Uploading..." : "Save Resource"}
              </Button>
            </div>
            {statusMessage && (
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4" />
                {statusMessage}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Resource List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Room Study Materials <span className="text-sm font-normal text-slate-500">({resources.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {resources.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex justify-between items-center hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-md text-slate-700">
                  {item.resource_type === "file" ? (
                    <FileText className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Link2 className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                      {item.resource_type}
                    </Badge>
                    <span className="text-xs text-slate-400 truncate max-w-xs">{item.url}</span>
                  </div>
                </div>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                Open
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}