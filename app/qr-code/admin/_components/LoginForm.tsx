"use client";
import React, { useState } from "react";

interface Props {
  onSuccess: (user: { username: string; role: "superadmin" | "park"; parkSlug?: string }) => void;
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
        setError(res.status === 401
          ? "Invalid credentials for this deployment. On Vercel, check QR_ADMIN_USERNAME and QR_ADMIN_PASSWORD under Project Settings → Environment Variables, then redeploy. .env.local is only used on your computer."
          : json.error || "Login failed");
        return;
      }
      onSuccess(json.user);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101c4b] px-4 py-10">
      <div aria-hidden="true" className="absolute -right-24 -top-28 size-80 rounded-full bg-[#364fc8]/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-20 size-80 rounded-full bg-[#ffd400]/15 blur-3xl" />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-[28px] border border-white/60 bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] sm:p-9">
        <img src="/wonderla/logo.png" alt="Wonderla" className="mb-7 h-12 w-auto object-contain object-left" />
        <p className="mb-2 font-mulish text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600">Park management</p>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mb-7 text-sm leading-relaxed text-slate-500">Sign in to manage park information and guest experiences.</p>

        <label className="mb-1.5 block text-xs font-bold text-slate-700">Username</label>
        <input
          className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="mb-1.5 block text-xs font-bold text-slate-700">Password</label>
        <input
          type="password"
          className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p role="alert" className="mb-4 text-sm leading-relaxed text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#2A41B1] py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-900/20 transition hover:bg-[#20358f] active:scale-[0.99] disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
