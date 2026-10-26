import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminDashboard from "@/features/admin/AdminDashboard";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** The studio must never be indexed or previewed by search engines. */
export const metadata: Metadata = {
  title: "Admin Studio — ShutterScape",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Second gate in front of the dashboard. Middleware already rejects requests
 * without a valid cookie; checking again here means the studio can never render
 * for an anonymous visitor if the matcher is ever edited.
 */
export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminDashboard />;
}
