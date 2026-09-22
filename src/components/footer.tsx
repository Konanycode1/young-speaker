import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  return <footer className="footer"><div className="footer-top">
    <div><Logo /><p>La plateforme où chaque jeune peut<br />prendre la parole et faire bouger les lignes.</p><div className="socials"><a href="#" aria-label="Instagram"><Instagram size={18}/></a><a href="#" aria-label="YouTube"><Youtube size={18}/></a><a href="#" aria-label="LinkedIn"><Linkedin size={18}/></a></div></div>
    <div><b>Découvrir</b><Link href="/articles">Les articles</Link><Link href="/speakers">Young Speakers</Link><Link href="/themes">Thèmes</Link><Link href="/challenges">Challenges</Link></div>
    <div><b>Participer</b><Link href="/become-speaker">Devenir Speaker</Link><Link href="/dashboard/new-article">Écrire un article</Link><Link href="/about">Notre mission</Link></div>
    <div><b>Besoin d’aide ?</b><Link href="/resources">Ressources d’écoute</Link><Link href="/safety">Charte & modération</Link><a href="mailto:bonjour@youngspeaker.org">Nous contacter</a></div>
  </div><div className="footer-bottom"><span>© 2026 Young Speaker. Fait avec du cœur pour la jeunesse.</span><span><Link href="/privacy">Confidentialité</Link><Link href="/terms">Conditions</Link><Link href="/safety">Charte</Link></span></div></footer>;
}
