"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Welcome, {user.name}</h1>
        <div className="bg-zinc-900 rounded-lg p-6 space-y-2">
          <p><span className="text-zinc-500">Email:</span> {user.email}</p>
          <p><span className="text-zinc-500">Role:</span> {user.role}</p>
          <p><span className="text-zinc-500">Peer Reputation Score:</span> {user.peer_reputation_score}</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="mt-6 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );
}