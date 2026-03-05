"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface SetupStatusResponse {
  source?: "runtime" | "env" | "none";
  configured?: boolean;
  supabaseUrl?: string;
}

interface SetupTestResponse {
  connected: boolean;
  schemaReady: boolean;
  message: string;
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState("");
  const [setupSource, setSetupSource] = useState<"runtime" | "env" | "none">("none");
  const [setupConfigured, setSetupConfigured] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [setupMessage, setSetupMessage] = useState("");

  useEffect(() => {
    void loadSetupStatus();
  }, []);

  async function loadSetupStatus() {
    try {
      const response = await fetch("/api/setup/supabase", { cache: "no-store" });
      const payload = (await response.json()) as SetupStatusResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Gagal ngambil status setup.");
      }
      setSetupSource(payload.source || "none");
      setSetupConfigured(Boolean(payload.configured));
      if (payload.supabaseUrl) {
        setSupabaseUrl(payload.supabaseUrl);
      }
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Gagal ngambil status setup.");
    }
  }

  async function handleTestConnection() {
    setSetupLoading(true);
    setSetupError("");
    setSetupMessage("");

    try {
      const response = await fetch("/api/setup/supabase/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supabaseUrl, supabaseServiceRoleKey }),
      });

      const payload = (await response.json()) as SetupTestResponse & { error?: string };
      if (!response.ok && payload.error) {
        throw new Error(payload.error);
      }
      setSetupMessage(payload.message || "Test selesai.");
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Tes koneksi gagal.");
    } finally {
      setSetupLoading(false);
    }
  }

  async function handleSaveSetup() {
    setSetupLoading(true);
    setSetupError("");
    setSetupMessage("");

    try {
      const response = await fetch("/api/setup/supabase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl,
          supabaseAnonKey,
          supabaseServiceRoleKey,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Gagal nyimpen setup.");
      }

      setSetupMessage("Konfig Supabase ke-save. Lu bisa login sekarang.");
      await loadSetupStatus();
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Gagal nyimpen setup.");
    } finally {
      setSetupLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Login gagal.");
      }

      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-4">
        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900">Setup Supabase Dulu</h1>
          <p className="mt-1 text-sm text-slate-600">
            Isi sekali doang, abis itu gas pake dashboard admin.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Status: {setupConfigured ? "Udah kehubung" : "Belom kehubung"} ({setupSource})
          </p>

          {setupError ? (
            <div className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
              {setupError}
            </div>
          ) : null}
          {setupMessage ? (
            <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
              {setupMessage}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3">
            <label className="block text-sm">
              Supabase URL
              <input
                className="mt-1 w-full rounded border p-2"
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Supabase Anon Key
              <input
                className="mt-1 w-full rounded border p-2"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Supabase Service Role Key
              <input
                className="mt-1 w-full rounded border p-2"
                value={supabaseServiceRoleKey}
                onChange={(e) => setSupabaseServiceRoleKey(e.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleTestConnection} disabled={setupLoading}>
              {setupLoading ? "Lagi ngetes..." : "Tes Koneksi"}
            </Button>
            <Button onClick={handleSaveSetup} disabled={setupLoading}>
              {setupLoading ? "Lagi nyimpen..." : "Simpan Setup"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900">Masuk Admin</h2>
          <p className="mt-1 text-sm text-slate-600">Masuk buat ngatur isi profil lu.</p>
          <p className="mt-1 text-xs text-slate-500">
            Bawaan awal: username <span className="font-mono">admin</span>, password{" "}
            <span className="font-mono">admin</span>
          </p>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form className="mt-4 space-y-4" onSubmit={handleLogin}>
            <label className="block text-sm">
              Username
              <input
                className="mt-1 w-full rounded border p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              Password
              <input
                type="password"
                className="mt-1 w-full rounded border p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Lagi masuk..." : "Masuk"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
