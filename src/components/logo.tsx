import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link className="logo" href="/" aria-label="Young Speaker, accueil"><span className="logo-mark"><i /><i /><i /></span>{!compact && <span>Young<br /><b>Speaker</b></span>}</Link>;
}
