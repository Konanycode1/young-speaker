import { SettingsForm } from "@/components/settings-form";
import { requireSpeaker } from "@/lib/dashboard";

export default async function SettingsPage() {
  const user = await requireSpeaker();
  return <><div className="dash-head"><div><span className="eyebrow">Compte et sécurité</span><h1>Paramètres</h1></div></div><SettingsForm email={user.email} /></>;
}
