import { redirect } from "next/navigation";
import { AutoPublishToggle } from "@/components/auto-publish-toggle";
import { getCurrentUser } from "@/lib/auth";
import { canManageSettings } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || !canManageSettings(user.role)) redirect("/admin");
  const settings = await getSiteSettings();
  return <div className="container section">
    <div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Paramètres</h1></div></div>
    <AutoPublishToggle initialValue={settings.autoPublishArticles} />
  </div>;
}
