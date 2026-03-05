"use client";

import { Button } from "@/components/ui/button";
import {
  SiteContent,
  PortfolioType,
  PortfolioStatus,
  emptyContent,
} from "@/lib/content-types";
import { getIcon } from "@/components/ui/icon-mapper";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

type TabKey =
  | "overview"
  | "profile"
  | "experience"
  | "education"
  | "organization"
  | "skills"
  | "portfolio"
  | "publish"
  | "settings";

interface AnalyticsData {
  totals: {
    pageViews: number;
    hireClicks: number;
    contactClicks: number;
  };
  trend: Array<{ date: string; views: number }>;
  topProjects: Array<{ projectId: string; clicks: number }>;
}

interface AdminSettings {
  username: string;
  updated_at: string;
}

interface RevisionMeta {
  id: number;
  status: "draft" | "published" | "archived";
  note: string | null;
  createdAt: string;
}

interface RevisionBundle {
  draft: SiteContent;
  published: SiteContent;
  history: RevisionMeta[];
}

interface MediaItem {
  path: string;
  name: string;
  folder: string;
  updatedAt: string;
  size: number;
  mimeType: string;
  url: string;
}

interface MediaResponse {
  items: MediaItem[];
}

interface SupabaseConfigResponse {
  source: "runtime" | "env" | "none";
  configured: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}

interface SupabaseTestResponse {
  connected: boolean;
  schemaReady: boolean;
  message: string;
}

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Ringkasan" },
  { key: "profile", label: "Profil & Hero" },
  { key: "experience", label: "Pengalaman Kerja" },
  { key: "education", label: "Pendidikan" },
  { key: "organization", label: "Organisasi" },
  { key: "skills", label: "Skill" },
  { key: "portfolio", label: "Portofolio" },
  { key: "publish", label: "Pusat Publish" },
  { key: "settings", label: "Pengaturan Admin" },
];

const emojiLibrary = [
  "😀",
  "😁",
  "😎",
  "🔥",
  "✨",
  "🚀",
  "📚",
  "🎯",
  "🛠️",
  "💡",
  "🌐",
  "📱",
  "🧠",
  "🧩",
  "🎨",
  "📈",
  "🎓",
  "💻",
  "📹",
  "🧪",
  "📌",
  "📂",
  "🏆",
  "🤝",
  "⭐",
  "✅",
  "🚧",
  "🎬",
  "🧭",
  "🔍",
  "🗂️",
  "📊",
  "📣",
  "📦",
  "📝",
  "🔗",
  "🧰",
  "👨‍💻",
  "🧑‍💼",
  "📍",
];

const iconLibrary = [
  "Code",
  "Monitor",
  "Layout",
  "FileText",
  "BookOpen",
  "GraduationCap",
  "Layers",
  "CheckSquare",
  "Video",
  "Globe",
  "Smartphone",
  "Server",
  "Database",
  "Gamepad2",
  "Users",
  "Briefcase",
  "Calendar",
  "User",
  "MessageSquare",
  "Mail",
  "Phone",
  "Linkedin",
  "Github",
  "ExternalLink",
  "PenSquare",
  "Sparkles",
  "Target",
  "Lightbulb",
  "Wrench",
  "BarChart3",
  "Brain",
  "Book",
  "Film",
  "ClipboardList",
  "Rocket",
  "ShieldCheck",
  "Award",
  "FolderKanban",
  "PencilRuler",
  "Megaphone",
];

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Request gagal.");
  }
  return payload;
}

function setItemOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const copy = [...items];
  const [current] = copy.splice(from, 1);
  copy.splice(to, 0, current);
  return copy;
}

function tabDescription(tab: TabKey): string {
  switch (tab) {
    case "overview":
      return "Liat traffic, status, dan aksi cepet.";
    case "profile":
      return "Ngatur identitas, hero, kontak, dan CV.";
    case "experience":
      return "Ngatur timeline pengalaman kerja.";
    case "education":
      return "Ngatur riwayat pendidikan dan pencapaian.";
    case "organization":
      return "Ngatur riwayat organisasi dan kepemimpinan.";
    case "skills":
      return "Ngatur kategori skill pake icon picker.";
    case "portfolio":
      return "Bikin project step-by-step.";
    case "publish":
      return "Liat draft, publish, atau balikin revisi.";
    case "settings":
      return "Atur akun admin, setup Supabase, sama reset pabrik.";
    default:
      return "";
  }
}

function GlassPanel({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/40 bg-white/55 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-600 mt-1">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange([...items, ""])}
          className="h-8"
        >
          Tambah
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[index] = e.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 w-10 p-0"
              onClick={() => {
                const next = items.filter((_, i) => i !== index);
                onChange(next);
              }}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"icon" | "emoji">(
    value.startsWith("emoji:") ? "emoji" : "icon"
  );

  const filteredIcons = useMemo(
    () =>
      iconLibrary.filter((icon) =>
        icon.toLowerCase().includes(query.toLowerCase().trim())
      ),
    [query]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <button
          className={classNames(
            "rounded-full px-3 py-1 text-xs font-medium",
            mode === "icon" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
          )}
          onClick={() => setMode("icon")}
          type="button"
        >
          Icon
        </button>
        <button
          className={classNames(
            "rounded-full px-3 py-1 text-xs font-medium",
            mode === "emoji" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
          )}
          onClick={() => setMode("emoji")}
          type="button"
        >
          Emoji
        </button>
      </div>

      {mode === "icon" ? (
        <>
          <input
            className="mb-2 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Search icon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1">
            {filteredIcons.map((icon) => {
              const Icon = getIcon(icon);
              return (
                <button
                  key={icon}
                  type="button"
                  onClick={() => onChange(icon)}
                  className={classNames(
                    "flex items-center gap-2 rounded-lg border px-2 py-2 text-xs",
                    value === icon
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{icon}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid max-h-40 grid-cols-8 gap-2 overflow-y-auto pr-1">
          {emojiLibrary.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(`emoji:${emoji}`)}
              className={classNames(
                "h-9 rounded-lg border text-lg",
                value === `emoji:${emoji}`
                  ? "border-slate-900 bg-slate-900"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Selected: {value.startsWith("emoji:") ? value.replace("emoji:", "") : value}
      </p>
    </div>
  );
}

function MediaLibraryDialog({
  open,
  onClose,
  items,
  onPick,
  accept,
}: {
  open: boolean;
  onClose: () => void;
  items: MediaItem[];
  onPick: (url: string) => void;
  accept: "image" | "video" | "pdf" | "all";
}) {
  if (!open) return null;

  const filtered = items.filter((item) => {
    if (accept === "all") return true;
    if (accept === "pdf") return item.mimeType.includes("pdf") || item.name.endsWith(".pdf");
    if (accept === "video") return item.mimeType.startsWith("video/") || /\.(mov|mp4|webm)$/i.test(item.name);
    return item.mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(item.name);
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-white/20 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Media Library</h3>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
        <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                onPick(item.url);
                onClose();
              }}
              className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-900"
            >
              <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
              <p className="text-xs text-slate-500">{item.folder}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{item.mimeType}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [published, setPublished] = useState<SiteContent | null>(null);
  const [history, setHistory] = useState<RevisionMeta[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [portfolioStep, setPortfolioStep] = useState(1);

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryAccept, setLibraryAccept] = useState<"image" | "video" | "pdf" | "all">("all");
  const libraryPickRef = useRef<((url: string) => void) | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState("");
  const [supabaseSource, setSupabaseSource] = useState<"runtime" | "env" | "none">("none");
  const [supabaseStatus, setSupabaseStatus] = useState("");

  const lastSavedSnapshot = useRef("");
  const initializedRef = useRef(false);

  const snapshotString = useMemo(() => {
    if (!draft) return "";
    return JSON.stringify(draft);
  }, [draft]);

  const selectedProject = useMemo(() => {
    if (!draft || !selectedProjectId) return null;
    return draft.portfolio.find((item) => item.id === selectedProjectId) || null;
  }, [draft, selectedProjectId]);

  async function loadBase() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [revisionRes, analyticsRes, settingsRes, mediaRes, supabaseRes] = await Promise.all([
        fetch("/api/admin/revisions", { cache: "no-store" }).then((res) => parseJson<RevisionBundle>(res)),
        fetch("/api/admin/analytics", { cache: "no-store" }).then((res) => parseJson<AnalyticsData>(res)),
        fetch("/api/admin/settings", { cache: "no-store" }).then((res) => parseJson<AdminSettings>(res)),
        fetch("/api/admin/media", { cache: "no-store" }).then((res) => parseJson<MediaResponse>(res)),
        fetch("/api/setup/supabase", { cache: "no-store" }).then((res) =>
          parseJson<SupabaseConfigResponse>(res)
        ),
      ]);

      setDraft(revisionRes.draft || emptyContent);
      setPublished(revisionRes.published || emptyContent);
      setHistory(revisionRes.history || []);
      setAnalytics(analyticsRes);
      setSettings(settingsRes);
      setMedia(mediaRes.items || []);
      setSupabaseSource(supabaseRes.source || "none");
      setSupabaseUrl(supabaseRes.supabaseUrl || "");
      setSupabaseAnonKey(supabaseRes.supabaseAnonKey || "");
      setSupabaseServiceRoleKey(supabaseRes.supabaseServiceRoleKey || "");

      const firstProjectId = revisionRes.draft?.portfolio?.[0]?.id || "";
      setSelectedProjectId(firstProjectId);

      const serialized = JSON.stringify(revisionRes.draft || emptyContent);
      lastSavedSnapshot.current = serialized;
      initializedRef.current = true;
      setSaveState("saved");
      setMessage("Dashboard kebuka.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal ngebuka dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function uploadFile(folder: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const payload = await parseJson<{ url: string }>(response);
    await refreshMedia();
    return payload.url;
  }

  async function refreshMedia() {
    try {
      const mediaRes = await fetch("/api/admin/media", { cache: "no-store" }).then((res) =>
        parseJson<MediaResponse>(res)
      );
      setMedia(mediaRes.items || []);
    } catch {
    }
  }

  function openMediaPicker(
    accept: "image" | "video" | "pdf" | "all",
    onPick: (url: string) => void
  ) {
    libraryPickRef.current = onPick;
    setLibraryAccept(accept);
    setLibraryOpen(true);
  }

  async function saveDraftNow(serialized: string) {
    setSaveState("saving");
    try {
      const body = JSON.parse(serialized) as SiteContent;
      const response = await fetch("/api/admin/revisions/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot: body }),
      });
      const payload = await parseJson<{ snapshot: SiteContent }>(response);

      lastSavedSnapshot.current = serialized;
      setDraft(payload.snapshot);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function publishDraftNow() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await fetch("/api/admin/revisions/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Dipublish via admin" }),
      }).then((res) => parseJson<{ success: boolean }>(res));

      await loadBase();
      setMessage("Draft udah naik ke live.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal publish draft.");
    } finally {
      setLoading(false);
    }
  }

  async function restoreAsDraft(revisionId: number) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = await fetch("/api/admin/revisions/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId }),
      }).then((res) => parseJson<{ snapshot: SiteContent }>(res));

      setDraft(payload.snapshot);
      const serialized = JSON.stringify(payload.snapshot);
      lastSavedSnapshot.current = serialized;
      setSaveState("saved");
      setMessage(`Revisi #${revisionId} udah dibalikin ke draft.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal balikin revisi.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAdminSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername,
          newPassword,
        }),
      }).then((res) => parseJson<{ success: boolean; username: string }>(res));

      setSettings((prev) => ({
        username: payload.username,
        updated_at: prev?.updated_at || new Date().toISOString(),
      }));
      setCurrentPassword("");
      setNewUsername("");
      setNewPassword("");
      setMessage("Akun admin udah ke-update.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal update akun admin.");
    } finally {
      setLoading(false);
    }
  }

  async function testSupabaseConnection() {
    setLoading(true);
    setError("");
    setMessage("");
    setSupabaseStatus("");

    try {
      const response = await fetch("/api/setup/supabase/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl,
          supabaseServiceRoleKey,
        }),
      });

      const payload = (await response.json()) as SupabaseTestResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || payload.message || "Gagal ngetes koneksi.");
      }

      setSupabaseStatus(payload.message || "Tes koneksi kelar.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal ngetes koneksi Supabase.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSupabaseConfig() {
    setLoading(true);
    setError("");
    setMessage("");
    setSupabaseStatus("");

    try {
      await fetch("/api/setup/supabase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl,
          supabaseAnonKey,
          supabaseServiceRoleKey,
        }),
      }).then((res) => parseJson<{ success: boolean }>(res));

      const latest = await fetch("/api/setup/supabase", {
        cache: "no-store",
      }).then((res) => parseJson<SupabaseConfigResponse>(res));

      setSupabaseSource(latest.source || "runtime");
      setMessage("Config Supabase udah kesimpen.");
      setSupabaseStatus("Config udah kesimpen dan siap dipake.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal nyimpen config Supabase.");
    } finally {
      setLoading(false);
    }
  }

  async function factoryReset() {
    const confirmed = window.confirm(
      "Reset pabrik bakal ngapus total isi web + analytics + akun admin + config Supabase. Lanjut?"
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");
    setSupabaseStatus("");

    try {
      await fetch("/api/admin/factory-reset", {
        method: "POST",
      }).then((res) =>
        parseJson<{
          success: boolean;
          resetConfig: boolean;
        }>(res)
      );

      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset pabrik gagal dijalanin.");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(mutator: (current: SiteContent) => SiteContent) {
    setDraft((prev) => {
      const base = deepClone(prev || emptyContent);
      return mutator(base);
    });
    setSaveState("unsaved");
  }

  function updateProject(mutator: (project: SiteContent["portfolio"][number]) => void) {
    if (!selectedProjectId) return;
    updateDraft((current) => {
      const next = deepClone(current);
      const index = next.portfolio.findIndex((item) => item.id === selectedProjectId);
      if (index === -1) return next;
      mutator(next.portfolio[index]);
      return next;
    });
  }

  useEffect(() => {
    void loadBase();
  }, []);

  useEffect(() => {
    if (!initializedRef.current || !snapshotString) return;

    if (snapshotString === lastSavedSnapshot.current) {
      return;
    }

    setSaveState("unsaved");
    const timeout = setTimeout(() => {
      void saveDraftNow(snapshotString);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [snapshotString]);

  const saveBadge =
    saveState === "saving"
      ? "Lagi nyimpen draft..."
      : saveState === "saved"
        ? "Draft ke-save"
        : saveState === "unsaved"
          ? "Ada perubahan belom ke-save"
          : saveState === "error"
            ? "Gagal nyimpen"
            : "";

  const saveBadgeClass =
    saveState === "saving"
      ? "bg-amber-100 text-amber-700"
      : saveState === "saved"
        ? "bg-emerald-100 text-emerald-700"
        : saveState === "unsaved"
          ? "bg-slate-200 text-slate-700"
          : "bg-rose-100 text-rose-700";

  if (!draft) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl">
          <p className="text-slate-700">Dashboard lagi kebuka...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#dbeafe_0%,#eef2ff_35%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-5 rounded-2xl border border-white/40 bg-white/55 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Panel Admin Profil</h1>
              <p className="text-sm text-slate-600 mt-1">Ngatur konten dari draft sampe publish.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={classNames("rounded-full px-3 py-1 text-xs font-medium", saveBadgeClass)}>{saveBadge}</span>
              <Button variant="outline" onClick={loadBase} disabled={loading}>Muat Ulang</Button>
              <a href="/admin/preview" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Liat Draft</Button>
              </a>
              <Button onClick={publishDraftNow} disabled={loading || saveState === "saving"}>Publish</Button>
              <Button variant="outline" onClick={logout}>Keluar</Button>
            </div>
          </div>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={classNames(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-white/80 text-slate-700 hover:bg-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-4 text-sm text-slate-600">{tabDescription(activeTab)}</p>

        {message ? (
          <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {activeTab === "overview" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <GlassPanel title="Traffic" subtitle="Data live dari tracking event.">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Views</p>
                  <p className="text-xl font-bold">{analytics?.totals.pageViews || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Hire</p>
                  <p className="text-xl font-bold">{analytics?.totals.hireClicks || 0}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Contact</p>
                  <p className="text-xl font-bold">{analytics?.totals.contactClicks || 0}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                {(analytics?.trend || []).slice(-8).map((point) => (
                  <div key={point.date} className="rounded-lg bg-slate-50 p-2">
                    <p className="text-slate-500">{point.date}</p>
                    <p className="font-semibold text-slate-800">{point.views}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel title="Content Health" subtitle="Quick summary for section readiness.">
              <div className="space-y-2 text-sm">
                <p>Experience items: <strong>{draft.experiences.length}</strong></p>
                <p>Item pendidikan: <strong>{draft.education.length}</strong></p>
                <p>Item organisasi: <strong>{draft.organizations.length}</strong></p>
                <p>Skill: <strong>{draft.skills.length}</strong></p>
                <p>Projects: <strong>{draft.portfolio.length}</strong></p>
              </div>
            </GlassPanel>

            <GlassPanel title="Project Paling Diklik" subtitle="Project yang paling sering diklik dari portofolio.">
              <div className="space-y-2 text-sm">
                {(analytics?.topProjects || []).length ? (
                  (analytics?.topProjects || []).map((item) => (
                    <div key={item.projectId} className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="font-medium">{item.projectId}</p>
                      <p className="text-slate-500">{item.clicks} clicks</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Belom ada data klik.</p>
                )}
              </div>
            </GlassPanel>
          </div>
        ) : null}

        {activeTab === "profile" ? (
          <div className="space-y-4">
            <GlassPanel title="Identity" subtitle="Main profile shown in hero and contact section.">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  Name
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.name}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.name = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Peran / Spesialisasi
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.role}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.role = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Location
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.location}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.location = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Email
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.email}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.email = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Phone / WhatsApp
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.phone}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.phone = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  LinkedIn URL
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.linkedin}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.linkedin = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
              </div>
            </GlassPanel>

            <GlassPanel title="Media" subtitle="Upload atau pilih dari pustaka media.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-slate-700">Foto Profil</p>
                  {draft.profile.avatar ? (
                    <img
                      src={draft.profile.avatar}
                      alt="Avatar"
                      className="mt-2 h-40 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadFile("avatars", file);
                          updateDraft((current) => {
                            current.profile.avatar = url;
                            return current;
                          });
                        }}
                      />
                    </label>
                    <Button
                      variant="outline"
                      onClick={() =>
                        openMediaPicker("image", (url) =>
                          updateDraft((current) => {
                            current.profile.avatar = url;
                            return current;
                          })
                        )
                      }
                    >
                      Pilih dari Library
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-slate-700">CV PDF</p>
                  <p className="mt-2 text-xs text-slate-500 break-all">{draft.profile.cv || "Belom ada CV dipilih"}</p>
                  <div className="mt-2 flex gap-2">
                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs">
                      Upload PDF
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadFile("cv", file);
                          updateDraft((current) => {
                            current.profile.cv = url;
                            return current;
                          });
                        }}
                      />
                    </label>
                    <Button
                      variant="outline"
                      onClick={() =>
                        openMediaPicker("pdf", (url) =>
                          updateDraft((current) => {
                            current.profile.cv = url;
                            return current;
                          })
                        )
                      }
                    >
                      Pilih dari Library
                    </Button>
                  </div>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel title="Tentang & Fokus" subtitle="Isi paragraf dan fokus utama profil lu.">
              <div className="space-y-3">
                <StringListEditor
                  label="Paragraf Tentang"
                  items={draft.profile.summary}
                  placeholder="Tulis paragraf..."
                  onChange={(items) =>
                    updateDraft((current) => {
                      current.profile.summary = items;
                      return current;
                    })
                  }
                />
                <StringListEditor
                  label="Fokus Utama"
                  items={draft.profile.coreFocus}
                  placeholder="Contoh: LMS Management"
                  onChange={(items) =>
                    updateDraft((current) => {
                      current.profile.coreFocus = items;
                      return current;
                    })
                  }
                />
              </div>
            </GlassPanel>

            <GlassPanel title="Modal Hire Me" subtitle="Isi konten buat aksi kontak di modal.">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  Judul Modal
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.hireModalTitle}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.hireModalTitle = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Subjudul Modal
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.hireModalSubtitle}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.hireModalSubtitle = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm md:col-span-2">
                  Template Pesan WhatsApp
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={draft.profile.whatsappTemplate}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.whatsappTemplate = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Subjek Email
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={draft.profile.emailSubject}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.emailSubject = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
                <label className="text-sm md:col-span-2">
                  Template Email
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2"
                    value={draft.profile.emailTemplate}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.profile.emailTemplate = e.target.value;
                        return current;
                      })
                    }
                  />
                </label>
              </div>
            </GlassPanel>
          </div>
        ) : null}

        {activeTab === "experience" ? (
          <GlassPanel
            title="Pengalaman Kerja"
            subtitle="Tambah, urutin, terus edit timeline kerja."
            right={
              <Button
                onClick={() =>
                  updateDraft((current) => {
                    current.experiences.push({
                      id: Date.now(),
                      role: "",
                      company: "",
                      period: "",
                      location: "",
                      description: [""],
                      sortOrder: current.experiences.length + 1,
                    });
                    current.experiences = setItemOrder(current.experiences);
                    return current;
                  })
                }
              >
                Tambah Pengalaman
              </Button>
            }
          >
            <div className="space-y-3">
              {draft.experiences.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Item #{index + 1}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={index === 0}
                        onClick={() =>
                          updateDraft((current) => {
                            current.experiences = setItemOrder(
                              moveItem(current.experiences, index, index - 1)
                            );
                            return current;
                          })
                        }
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        disabled={index === draft.experiences.length - 1}
                        onClick={() =>
                          updateDraft((current) => {
                            current.experiences = setItemOrder(
                              moveItem(current.experiences, index, index + 1)
                            );
                            return current;
                          })
                        }
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateDraft((current) => {
                            current.experiences = setItemOrder(
                              current.experiences.filter((_, i) => i !== index)
                            );
                            return current;
                          })
                        }
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Peran" value={item.role}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.experiences[index].role = e.target.value;
                          return current;
                        })
                      }
                    />
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Perusahaan" value={item.company}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.experiences[index].company = e.target.value;
                          return current;
                        })
                      }
                    />
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Periode" value={item.period}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.experiences[index].period = e.target.value;
                          return current;
                        })
                      }
                    />
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Lokasi" value={item.location}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.experiences[index].location = e.target.value;
                          return current;
                        })
                      }
                    />
                  </div>

                  <div className="mt-2">
                    <StringListEditor
                      label="Tanggung Jawab"
                      items={item.description}
                      placeholder="Tulis satu tanggung jawab"
                      onChange={(items) =>
                        updateDraft((current) => {
                          current.experiences[index].description = items;
                          return current;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        ) : null}

        {activeTab === "education" ? (
          <GlassPanel
            title="Pendidikan"
            subtitle="Atur kartu pendidikan dan pencapaian."
            right={
              <Button
                onClick={() =>
                  updateDraft((current) => {
                    current.education.push({
                      id: Date.now(),
                      institution: "",
                      degree: "",
                      period: "",
                      description: "",
                      achievements: [],
                      sortOrder: current.education.length + 1,
                    });
                    current.education = setItemOrder(current.education);
                    return current;
                  })
                }
              >
                Tambah Pendidikan
              </Button>
            }
          >
            <div className="space-y-3">
              {draft.education.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Item #{index + 1}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" disabled={index === 0} onClick={() =>
                        updateDraft((current) => {
                          current.education = setItemOrder(moveItem(current.education, index, index - 1));
                          return current;
                        })
                      }>↑</Button>
                      <Button variant="outline" disabled={index === draft.education.length - 1} onClick={() =>
                        updateDraft((current) => {
                          current.education = setItemOrder(moveItem(current.education, index, index + 1));
                          return current;
                        })
                      }>↓</Button>
                      <Button variant="outline" onClick={() =>
                        updateDraft((current) => {
                          current.education = setItemOrder(current.education.filter((_, i) => i !== index));
                          return current;
                        })
                      }>Hapus</Button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Institusi" value={item.institution}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.education[index].institution = e.target.value;
                          return current;
                        })
                      }
                    />
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Gelar" value={item.degree}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.education[index].degree = e.target.value;
                          return current;
                        })
                      }
                    />
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Periode" value={item.period}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.education[index].period = e.target.value;
                          return current;
                        })
                      }
                    />
                  </div>

                  <textarea
                    className="mt-2 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Deskripsi"
                    value={item.description || ""}
                    onChange={(e) =>
                      updateDraft((current) => {
                        current.education[index].description = e.target.value;
                        return current;
                      })
                    }
                  />

                  <div className="mt-2">
                    <StringListEditor
                      label="Pencapaian"
                      items={item.achievements || []}
                      placeholder="Tambah satu pencapaian"
                      onChange={(items) =>
                        updateDraft((current) => {
                          current.education[index].achievements = items;
                          return current;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        ) : null}

        {activeTab === "organization" ? (
          <GlassPanel
            title="Pengalaman Organisasi"
            subtitle="Atur riwayat organisasi."
            right={
              <Button
                onClick={() =>
                  updateDraft((current) => {
                    current.organizations.push({
                      id: Date.now(),
                      role: "",
                      organization: "",
                      period: "",
                      description: [""],
                      sortOrder: current.organizations.length + 1,
                    });
                    current.organizations = setItemOrder(current.organizations);
                    return current;
                  })
                }
              >
                Tambah Organisasi
              </Button>
            }
          >
            <div className="space-y-3">
              {draft.organizations.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Item #{index + 1}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" disabled={index === 0} onClick={() =>
                        updateDraft((current) => {
                          current.organizations = setItemOrder(moveItem(current.organizations, index, index - 1));
                          return current;
                        })
                      }>↑</Button>
                      <Button variant="outline" disabled={index === draft.organizations.length - 1} onClick={() =>
                        updateDraft((current) => {
                          current.organizations = setItemOrder(moveItem(current.organizations, index, index + 1));
                          return current;
                        })
                      }>↓</Button>
                      <Button variant="outline" onClick={() =>
                        updateDraft((current) => {
                          current.organizations = setItemOrder(current.organizations.filter((_, i) => i !== index));
                          return current;
                        })
                      }>Hapus</Button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Peran" value={item.role}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.organizations[index].role = e.target.value;
                          return current;
                        })
                      }
                    />
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Organisasi" value={item.organization}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.organizations[index].organization = e.target.value;
                          return current;
                        })
                      }
                    />
                    <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="Periode" value={item.period}
                      onChange={(e) =>
                        updateDraft((current) => {
                          current.organizations[index].period = e.target.value;
                          return current;
                        })
                      }
                    />
                  </div>

                  <div className="mt-2">
                    <StringListEditor
                      label="Tanggung Jawab"
                      items={item.description}
                      placeholder="Satu tanggung jawab"
                      onChange={(items) =>
                        updateDraft((current) => {
                          current.organizations[index].description = items;
                          return current;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        ) : null}

        {activeTab === "skills" ? (
          <GlassPanel
            title="Skill & Keahlian"
            subtitle="Udah ada icon picker sama emoji picker."
            right={
              <Button
                onClick={() =>
                  updateDraft((current) => {
                    current.skills.push({
                      id: Date.now(),
                      category: "Skill Teknis",
                      name: "",
                      icon: "Code",
                      sortOrder: current.skills.length + 1,
                    });
                    current.skills = setItemOrder(current.skills);
                    return current;
                  })
                }
              >
                Tambah Skill
              </Button>
            }
          >
            <div className="space-y-3">
              {draft.skills.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Skill #{index + 1}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" disabled={index === 0} onClick={() =>
                        updateDraft((current) => {
                          current.skills = setItemOrder(moveItem(current.skills, index, index - 1));
                          return current;
                        })
                      }>↑</Button>
                      <Button variant="outline" disabled={index === draft.skills.length - 1} onClick={() =>
                        updateDraft((current) => {
                          current.skills = setItemOrder(moveItem(current.skills, index, index + 1));
                          return current;
                        })
                      }>↓</Button>
                      <Button variant="outline" onClick={() =>
                        updateDraft((current) => {
                          current.skills = setItemOrder(current.skills.filter((_, i) => i !== index));
                          return current;
                        })
                      }>Hapus</Button>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    <label className="text-sm">
                      Category
                      <input
                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                        value={item.category}
                        onChange={(e) =>
                          updateDraft((current) => {
                            current.skills[index].category = e.target.value;
                            return current;
                          })
                        }
                      />
                    </label>
                    <label className="text-sm">
                      Skill Name
                      <input
                        className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                        value={item.name}
                        onChange={(e) =>
                          updateDraft((current) => {
                            current.skills[index].name = e.target.value;
                            return current;
                          })
                        }
                      />
                    </label>
                    <div className="text-sm">
                      Icon / Emoji
                      <div className="mt-1">
                        <IconPicker
                          value={item.icon}
                          onChange={(value) =>
                            updateDraft((current) => {
                              current.skills[index].icon = value;
                              return current;
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        ) : null}

        {activeTab === "portfolio" ? (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <GlassPanel
                title="Daftar Project"
                subtitle="Pilih project biar bisa lu edit langkah demi langkah."
                right={
                  <Button
                    onClick={() =>
                      updateDraft((current) => {
                        const slug = `new-project-${current.portfolio.length + 1}`;
                        current.portfolio.push({
                          id: slug,
                          title: "Project Baru",
                          description: "",
                          longDescription: "",
                          challenge: "",
                          solution: "",
                          features: [],
                          techStackDetails: [],
                          gallery: [],
                          tags: [],
                          image: "",
                          type: "web",
                          status: "published",
                          url: null,
                          pdfUrl: null,
                          videoUrl: null,
                          role: "",
                          timeline: "",
                          maintenanceTitle: "",
                          maintenanceIcon: "🚧",
                          maintenanceHeader: "",
                          maintenanceBody: "",
                          sortOrder: current.portfolio.length + 1,
                        });
                        current.portfolio = setItemOrder(current.portfolio);
                        return current;
                      })
                    }
                  >
                    Tambah Project
                  </Button>
                }
              >
                <div className="space-y-2">
                  {draft.portfolio.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(item.id);
                        setPortfolioStep(1);
                      }}
                      className={classNames(
                        "w-full rounded-xl border px-3 py-2 text-left",
                        selectedProjectId === item.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <p className="font-medium truncate">{item.title || item.id}</p>
                      <p className={classNames("text-xs", selectedProjectId === item.id ? "text-slate-200" : "text-slate-500")}>{item.id}</p>
                      <div className="mt-2 flex gap-1">
                        <span className={classNames("rounded-full px-2 py-0.5 text-[10px]", selectedProjectId === item.id ? "bg-white/15" : "bg-slate-100")}>{item.type}</span>
                        <span className={classNames("rounded-full px-2 py-0.5 text-[10px]", selectedProjectId === item.id ? "bg-white/15" : "bg-slate-100")}>{item.status}</span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="outline"
                          className="h-7"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDraft((current) => {
                              current.portfolio = setItemOrder(moveItem(current.portfolio, index, index - 1));
                              return current;
                            });
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          className="h-7"
                          disabled={index === draft.portfolio.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDraft((current) => {
                              current.portfolio = setItemOrder(moveItem(current.portfolio, index, index + 1));
                              return current;
                            });
                          }}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="outline"
                          className="h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDraft((current) => {
                              current.portfolio = setItemOrder(current.portfolio.filter((_, i) => i !== index));
                              return current;
                            });
                            if (selectedProjectId === item.id) {
                              setSelectedProjectId(draft.portfolio[Math.max(0, index - 1)]?.id || "");
                            }
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              </GlassPanel>
            </div>

            <div className="lg:col-span-8">
              <GlassPanel
                title="Bikin Project"
                subtitle="Editor langkah demi langkah biar gampang."
              >
                {selectedProject ? (
                  <>
                    <div className="mb-4 grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => setPortfolioStep(step)}
                          className={classNames(
                            "rounded-lg px-2 py-2 text-xs font-medium",
                            portfolioStep === step
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          Langkah {step}
                        </button>
                      ))}
                    </div>

                    {portfolioStep === 1 ? (
                      <div className="space-y-3">
                        <label className="text-sm block">
                          ID Project (slug)
                          <input
                            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                            value={selectedProject.id}
                            onChange={(e) =>
                              updateProject((project) => {
                                project.id = e.target.value.toLowerCase().replace(/\s+/g, "-");
                              })
                            }
                          />
                        </label>
                        <label className="text-sm block">
                          Judul
                          <input
                            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                            value={selectedProject.title}
                            onChange={(e) => updateProject((project) => { project.title = e.target.value; })}
                          />
                        </label>
                        <label className="text-sm block">
                          Deskripsi Singkat
                          <textarea
                            className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2"
                            value={selectedProject.description}
                            onChange={(e) => updateProject((project) => { project.description = e.target.value; })}
                          />
                        </label>

                        <div className="grid gap-3 md:grid-cols-3">
                          <label className="text-sm block">
                            Tipe
                            <select
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.type}
                              onChange={(e) => updateProject((project) => { project.type = e.target.value as PortfolioType; })}
                            >
                              <option value="web">Project Web</option>
                              <option value="app">Project App</option>
                              <option value="pdf">Project PDF</option>
                              <option value="video">Project Video</option>
                            </select>
                          </label>

                          <label className="text-sm block">
                            Status
                            <select
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.status}
                              onChange={(e) => updateProject((project) => { project.status = e.target.value as PortfolioStatus; })}
                            >
                              <option value="published">Dipublikasi</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="under_uploading">Lagi Di-upload</option>
                            </select>
                          </label>

                          <label className="text-sm block">
                            Urutan
                            <input
                              type="number"
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.sortOrder}
                              onChange={(e) =>
                                updateProject((project) => {
                                  project.sortOrder = Number(e.target.value || 0);
                                })
                              }
                            />
                          </label>
                        </div>

                        <StringListEditor
                          label="Tags"
                          items={selectedProject.tags}
                          placeholder="Tag"
                          onChange={(items) =>
                            updateProject((project) => {
                              project.tags = items;
                            })
                          }
                        />
                      </div>
                    ) : null}

                    {portfolioStep === 2 ? (
                      <div className="space-y-3">
                        <label className="text-sm block">
                          Deskripsi Panjang
                          <textarea
                            className="mt-1 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2"
                            value={selectedProject.longDescription}
                            onChange={(e) => updateProject((project) => { project.longDescription = e.target.value; })}
                          />
                        </label>

                        <label className="text-sm block">
                          Tantangan
                          <textarea
                            className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2"
                            value={selectedProject.challenge}
                            onChange={(e) => updateProject((project) => { project.challenge = e.target.value; })}
                          />
                        </label>

                        <label className="text-sm block">
                          Solusi
                          <textarea
                            className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2"
                            value={selectedProject.solution}
                            onChange={(e) => updateProject((project) => { project.solution = e.target.value; })}
                          />
                        </label>

                        <StringListEditor
                          label="Fitur Utama"
                          items={selectedProject.features}
                          placeholder="Satu fitur"
                          onChange={(items) => updateProject((project) => { project.features = items; })}
                        />
                      </div>
                    ) : null}

                    {portfolioStep === 3 ? (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="text-sm font-medium">Media Cover</p>
                          {selectedProject.image ? (
                            <img src={selectedProject.image} alt="Cover" className="mt-2 h-44 w-full rounded-lg object-cover" />
                          ) : (
                            <p className="mt-2 text-xs text-slate-500">Belom ada cover dipilih.</p>
                          )}
                          <div className="mt-2 flex gap-2">
                            <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs">
                              Upload Cover
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const url = await uploadFile("portfolio", file);
                                  updateProject((project) => { project.image = url; });
                                }}
                              />
                            </label>
                            <Button
                              variant="outline"
                              onClick={() => openMediaPicker("image", (url) => updateProject((project) => { project.image = url; }))}
                            >
                              Pilih dari Library
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium">Galeri</p>
                            <div className="flex gap-2">
                              <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs">
                                Upload
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*,.pdf,video/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (!files.length) return;
                                    const urls = await Promise.all(
                                      files.map((file) => uploadFile("portfolio", file))
                                    );
                                    updateProject((project) => {
                                      project.gallery = [...project.gallery, ...urls];
                                    });
                                  }}
                                />
                              </label>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  openMediaPicker("all", (url) =>
                                    updateProject((project) => {
                                      project.gallery = [...project.gallery, url];
                                    })
                                  )
                                }
                              >
                                Pilih
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                            {selectedProject.gallery.map((url, idx) => (
                              <div key={`${url}-${idx}`} className="relative rounded-lg border border-slate-200 bg-slate-50 p-2">
                                <p className="truncate text-xs text-slate-600">{url.split("/").pop()}</p>
                                <div className="mt-2 flex gap-1">
                                  <Button
                                    variant="outline"
                                    className="h-7"
                                    onClick={() =>
                                      updateProject((project) => {
                                        project.gallery = project.gallery.filter((_, i) => i !== idx);
                                      })
                                    }
                                  >
                                    Hapus
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedProject.type === "pdf" ? (
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-sm font-medium">File PDF</p>
                            <p className="mt-1 text-xs text-slate-500 break-all">{selectedProject.pdfUrl || "Belom ada PDF dipilih"}</p>
                            <div className="mt-2 flex gap-2">
                              <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs">
                                Upload PDF
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = await uploadFile("portfolio", file);
                                    updateProject((project) => { project.pdfUrl = url; });
                                  }}
                                />
                              </label>
                              <Button variant="outline" onClick={() =>
                                openMediaPicker("pdf", (url) => updateProject((project) => { project.pdfUrl = url; }))
                              }>
                                Pilih PDF
                              </Button>
                            </div>
                          </div>
                        ) : null}

                        {selectedProject.type === "video" ? (
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-sm font-medium">File Video</p>
                            <p className="mt-1 text-xs text-slate-500 break-all">{selectedProject.videoUrl || "Belom ada video dipilih"}</p>
                            <div className="mt-2 flex gap-2">
                              <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs">
                                Upload Video
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const url = await uploadFile("portfolio", file);
                                    updateProject((project) => { project.videoUrl = url; });
                                  }}
                                />
                              </label>
                              <Button variant="outline" onClick={() =>
                                openMediaPicker("video", (url) => updateProject((project) => { project.videoUrl = url; }))
                              }>
                                Pilih Video
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {portfolioStep === 4 ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm block">
                            Peran
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.role || ""}
                              onChange={(e) => updateProject((project) => { project.role = e.target.value; })}
                            />
                          </label>
                          <label className="text-sm block">
                            Timeline
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.timeline || ""}
                              onChange={(e) => updateProject((project) => { project.timeline = e.target.value; })}
                            />
                          </label>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">Stack Teknologi</p>
                            <Button
                              variant="outline"
                              onClick={() =>
                                updateProject((project) => {
                                  project.techStackDetails = [...project.techStackDetails, { name: "", icon: "Code" }];
                                })
                              }
                            >
                              Tambah Tech
                            </Button>
                          </div>

                          {selectedProject.techStackDetails.map((tech, index) => (
                            <div key={`${tech.name}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
                              <div className="grid gap-3 md:grid-cols-2">
                                <label className="text-sm block">
                                  Nama
                                  <input
                                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                                    value={tech.name}
                                    onChange={(e) =>
                                      updateProject((project) => {
                                        project.techStackDetails[index].name = e.target.value;
                                      })
                                    }
                                  />
                                </label>
                                <div>
                                  <p className="text-sm">Icon / Emoji</p>
                                  <div className="mt-1">
                                    <IconPicker
                                      value={tech.icon}
                                      onChange={(value) =>
                                        updateProject((project) => {
                                          project.techStackDetails[index].icon = value;
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    updateProject((project) => {
                                      project.techStackDetails = project.techStackDetails.filter((_, i) => i !== index);
                                    })
                                  }
                                >
                                  Hapus Tech
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {portfolioStep === 5 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600">
                          Atur pesan maintenance kalau status project bukan published.
                        </p>

                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm block">
                            Judul Modal
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.maintenanceTitle || ""}
                              onChange={(e) => updateProject((project) => { project.maintenanceTitle = e.target.value; })}
                            />
                          </label>
                          <label className="text-sm block">
                            Header Modal
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.maintenanceHeader || ""}
                              onChange={(e) => updateProject((project) => { project.maintenanceHeader = e.target.value; })}
                            />
                          </label>
                          <label className="text-sm block">
                            Ikon Maintenance
                            <input
                              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                              value={selectedProject.maintenanceIcon || "🚧"}
                              onChange={(e) => updateProject((project) => { project.maintenanceIcon = e.target.value; })}
                            />
                          </label>
                        </div>

                        <label className="text-sm block">
                          Isi Modal
                          <textarea
                            className="mt-1 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2"
                            value={selectedProject.maintenanceBody || ""}
                            onChange={(e) => updateProject((project) => { project.maintenanceBody = e.target.value; })}
                          />
                        </label>
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="outline"
                        disabled={portfolioStep === 1}
                        onClick={() => setPortfolioStep((prev) => Math.max(1, prev - 1))}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        disabled={portfolioStep === 5}
                        onClick={() => setPortfolioStep((prev) => Math.min(5, prev + 1))}
                      >
                        Lanjut
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500">Pilih project dulu biar bisa ngedit.</p>
                )}
              </GlassPanel>
            </div>
          </div>
        ) : null}

        {activeTab === "publish" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <GlassPanel
              title="Draft vs Live"
              subtitle="Cek dulu draft lu sebelum publish."
            >
              <div className="space-y-2 text-sm">
                <p>Project draft: <strong>{draft.portfolio.length}</strong></p>
                <p>Project published: <strong>{published?.portfolio.length || 0}</strong></p>
                <p>Status simpan: <strong>{saveBadge}</strong></p>
              </div>

              <div className="mt-3 flex gap-2">
                <a href="/admin/preview" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">Buka Preview Draft</Button>
                </a>
                <Button onClick={publishDraftNow} disabled={loading || saveState === "saving"}>Publish ke Live</Button>
              </div>
            </GlassPanel>

            <GlassPanel title="Riwayat Revisi" subtitle="Balikin revisi lama jadi draft lagi.">
              <div className="space-y-2">
                {history.length ? (
                  history.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-sm font-medium text-slate-800">Revisi #{item.id}</p>
                      <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.status} {item.note ? `• ${item.note}` : ""}</p>
                      <div className="mt-2">
                        <Button variant="outline" onClick={() => restoreAsDraft(item.id)}>
                          Balikin ke Draft
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Belom ada riwayat revisi.</p>
                )}
              </div>
            </GlassPanel>
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="grid gap-4">
            <GlassPanel title="Akun Admin" subtitle="Ganti username/password admin dari sini.">
              <div className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                Username sekarang: <strong>{settings?.username || "-"}</strong>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm block">
                  Password Sekarang
                  <input
                    type="password"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </label>
                <label className="text-sm block">
                  Username Baru
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </label>
                <label className="text-sm block md:col-span-2">
                  Password Baru
                  <input
                    type="password"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4">
                <Button onClick={saveAdminSettings} disabled={loading}>Simpan Akun Admin</Button>
              </div>
            </GlassPanel>

            <GlassPanel title="Koneksi Supabase" subtitle="Isi kredensial, tes koneksi, terus simpan.">
              <div className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                Sumber aktif: <strong>{supabaseSource}</strong>
              </div>

              {supabaseStatus ? (
                <div className="mb-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {supabaseStatus}
                </div>
              ) : null}

              <div className="grid gap-3">
                <label className="text-sm block">
                  Supabase URL
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                  />
                </label>
                <label className="text-sm block">
                  Supabase Anon Key
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  />
                </label>
                <label className="text-sm block">
                  Supabase Service Role Key
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3"
                    value={supabaseServiceRoleKey}
                    onChange={(e) => setSupabaseServiceRoleKey(e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={testSupabaseConnection} disabled={loading}>
                  Tes Koneksi
                </Button>
                <Button onClick={saveSupabaseConfig} disabled={loading}>
                  Simpen Config Supabase
                </Button>
              </div>
            </GlassPanel>

            <GlassPanel title="Reset Pabrik" subtitle="Balikin semuanya ke kondisi awal banget.">
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                Ini bakal ngapus konten, revisi, analytics, akun admin, dan config Supabase.
              </div>
              <div className="mt-4">
                <Button variant="destructive" onClick={factoryReset} disabled={loading}>
                  Gas Reset Pabrik
                </Button>
              </div>
            </GlassPanel>
          </div>
        ) : null}
      </div>

      <MediaLibraryDialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        items={media}
        accept={libraryAccept}
        onPick={(url) => {
          libraryPickRef.current?.(url);
        }}
      />
    </main>
  );
}
