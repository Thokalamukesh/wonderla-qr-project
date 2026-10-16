"use client";
import React, { useState } from "react";

interface Props {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/qr-code/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Login failed");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-1 text-xl font-bold text-slate-800">Wonderla QR Admin</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in to manage park configurations.</p>

        <label className="mb-1 block text-xs font-semibold text-slate-600">Username</label>
        <input
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
        <input
          type="password"
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
