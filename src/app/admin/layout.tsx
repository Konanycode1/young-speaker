import { redirect } from "next/navigation";
import { AdminNavigation } from "@/components/admin-navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");
  return <div className="admin-area"><AdminNavigation role={user.role} />{children}</div>;
}
