"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setSession(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto flex flex-col gap-4 bg-zinc-900 text-zinc-100 p-8 rounded-lg shadow-xl"
    >
      <h1 className="text-2xl font-semibold mb-2">Log in</h1>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-400">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          required
          className="border border-zinc-700 bg-zinc-800 rounded-md p-3 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-400">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter your password"
          required
          className="border border-zinc-700 bg-zinc-800 rounded-md p-3 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white rounded-md p-3 text-sm font-medium disabled:opacity-50 transition-colors mt-2"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>

      <p className="text-sm text-zinc-500 text-center mt-2">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-blue-400 hover:underline">
          Register
        </a>
      </p>
    </form>
  );
}