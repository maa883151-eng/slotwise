"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Incorrect password");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-[#fbf9f6] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-white p-7 flex flex-col gap-3 shadow-[0_8px_30px_rgba(30,25,15,0.08)]"
      >
        <h1 className="text-lg font-semibold text-zinc-900">Admin sign in</h1>
        <p className="text-sm text-zinc-500">Demo password: admin1234</p>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-[10px] border-0 bg-zinc-50 px-3.5 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-teal-800 text-white py-2.5 text-sm font-semibold hover:bg-teal-900 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
