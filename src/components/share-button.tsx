"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const articleUrl = () => `${window.location.origin}/articles/${slug}`;

  async function share() {
    // Feuille de partage native sur mobile/tablette ; menu de liens sur ordinateur.
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, text: title, url: articleUrl() });
      } catch {
        // partage annulé par la personne : rien à faire
      }
      return;
    }
    setOpen((current) => !current);
  }

  async function copy() {
    const url = articleUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copie le lien de ton article :", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const targets = open ? shareTargets(articleUrl(), title) : [];

  return <div className="share">
    <button type="button" className="button small" onClick={share} aria-expanded={open}><Share2 size={14} />Partager</button>
    {open && <div className="share-options">
      {targets.map(([label, href]) => <a key={label} className="share-chip" href={href} target="_blank" rel="noopener noreferrer">{label}</a>)}
      <button type="button" className="share-chip" onClick={copy}>{copied ? <><Check size={13} />Lien copié</> : "Copier le lien"}</button>
    </div>}
  </div>;
}

function shareTargets(url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  return [
    ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`],
    ["X", `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`],
  ] as const;
}
