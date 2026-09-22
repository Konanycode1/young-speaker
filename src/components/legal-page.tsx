import Link from "next/link";

export { CONTACT_EMAIL } from "@/lib/site";
export const LEGAL_UPDATED = "21 septembre 2026";

const documents = [
  ["/safety", "Charte de la communauté"],
  ["/terms", "Conditions d’utilisation"],
  ["/privacy", "Confidentialité"],
] as const;

export function LegalPage({ eyebrow, title, intro, current, children }: { eyebrow: string; title: string; intro: string; current: string; children: React.ReactNode }) {
  return <>
    <section className="page-hero container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></section>
    <section className="container legal">
      <nav className="legal-nav" aria-label="Documents">{documents.map(([href, label]) => <Link key={href} href={href} aria-current={href === current ? "page" : undefined}>{label}</Link>)}</nav>
      <article className="legal-body">{children}<p className="legal-updated">Dernière mise à jour : {LEGAL_UPDATED}</p></article>
    </section>
  </>;
}
