"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { roomService } from "@/services/roomService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface FormData {
  title: string;
  description: string;
  access_code?: string;
  max_participants: number;
}

export default function CreateRoomModal({ onCreated }: { onCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>(["Operating Systems"]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: FormData) => {
    try {
      await roomService.createRoom({
        title: data.title,
        description: data.description,
        is_private: isPrivate,
        access_code: data.access_code,
        tags,
        max_participants: Number(data.max_participants) || 10,
      });
      setIsOpen(false);
      reset();
      if (onCreated) onCreated();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">Create Study Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create a Study Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Title</label>
            <Input {...register("title", { required: true })} placeholder="e.g. OS Midterm Prep" />
          </div>

          <div>
            <label className="text-sm font-semibold">Description</label>
            <Textarea {...register("description")} placeholder="Study session objectives..." />
          </div>

          <div>
            <label className="text-sm font-semibold">Academic Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. Operating Systems"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Private Room</label>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {isPrivate && (
            <div>
              <label className="text-sm font-semibold">Access Code</label>
              <Input {...register("access_code", { required: isPrivate })} placeholder="Enter room access code" />
            </div>
          )}

          <Button type="submit" className="w-full">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
