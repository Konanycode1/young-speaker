import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MODERATOR") redirect("/admin");
  if (user.role !== "YOUNG_SPEAKER") redirect("/articles?notice=speaker-required");
  return <div className="dashboard-shell"><DashboardSidebar displayName={user.profile?.displayName ?? "Young Speaker"} /><div className="dash-main">{children}</div></div>;
}
