import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getServerSession } from "@/lib/admin-session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
