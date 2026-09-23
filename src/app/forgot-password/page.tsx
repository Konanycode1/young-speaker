import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ForgotPasswordPage() {
  return <div className="auth-page"><aside className="auth-art"><span className="eyebrow">Mot de passe oublié</span><h2>Pas de panique,<br />on répare ça.</h2><blockquote>« Indique ton email et ton pseudonyme pour choisir un nouveau mot de passe. »</blockquote></aside><section className="auth-panel"><div className="form-card"><span className="eyebrow">Réinitialisation</span><h1>Choisis un nouveau mot de passe.</h1><p>Renseigne l’email et le pseudonyme de ton compte pour confirmer que c’est bien toi.</p><ResetPasswordForm /><div className="form-foot"><Link href="/login">Retour à la connexion</Link></div></div></section></div>;
}
