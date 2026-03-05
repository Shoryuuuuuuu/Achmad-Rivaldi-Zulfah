import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SetupRequiredProps {
  title?: string;
  description?: string;
}

export function SetupRequired({
  title = "Website belum disiapkan",
  description = "Silakan setup dulu lewat dashboard admin, lalu publish agar halaman publik tampil.",
}: SetupRequiredProps) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Akses awal admin</p>
          <p className="mt-1">
            Username: <span className="font-mono">admin</span>
          </p>
          <p>
            Password: <span className="font-mono">admin</span>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/login">Buka Admin</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin">Ke Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
