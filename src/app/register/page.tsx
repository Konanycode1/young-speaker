import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <div className="auth-page"><aside className="auth-art"><span className="eyebrow">Ta voix, tes règles</span><h2>Un espace pour<br />être vraiment toi.</h2><blockquote>Tu peux utiliser un pseudonyme. Tes données personnelles ne seront jamais affichées sans ton accord.</blockquote><b>🛡️ Sécurité et bienveillance d’abord</b></aside><section className="auth-panel"><div className="form-card"><span className="eyebrow">Inscription</span><h1>{type === "speaker" ? "Deviens Young Speaker." : "Crée ton espace."}</h1><p>Choisis comment tu souhaites participer à la communauté.</p><AuthForm mode="register" defaultType={type === "speaker" ? "SPEAKER" : "COMMENTER"} /><div className="form-foot">Déjà membre ? <Link href="/login">Se connecter</Link></div></div></section></div>;
}
