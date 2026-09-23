import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return <div className="auth-page"><aside className="auth-art"><span className="eyebrow">Bienvenue chez toi</span><h2>Les mots créent<br />du mouvement.</h2><blockquote>« Young Speaker m’a montré que mon expérience pouvait aider quelqu’un d’autre à se sentir moins seul. »</blockquote><b>— Aya, 17 ans</b></aside><section className="auth-panel"><div className="form-card"><span className="eyebrow">Connexion</span><h1>Heureux de te revoir.</h1><p>Retrouve tes articles, tes challenges et ta communauté.</p><AuthForm mode="login" /><div className="form-foot"><Link href="/forgot-password">Mot de passe oublié ?</Link></div><div className="form-foot">Pas encore de compte ? <Link href="/register">Rejoins-nous</Link></div></div></section></div>;
}
