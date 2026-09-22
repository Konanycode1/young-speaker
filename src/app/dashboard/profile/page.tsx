import { ProfileForm } from "@/components/profile-form";
import { requireSpeaker } from "@/lib/dashboard";

export default async function ProfilePage() {
  const user = await requireSpeaker(); if (!user.profile) return null;
  return <><div className="dash-head"><div><span className="eyebrow">Mon identité publique</span><h1>Mon profil</h1></div><a className="button outline" href={`/speakers/${user.profile.username}`}>Voir mon profil public</a></div><ProfileForm profile={user.profile} /></>;
}
