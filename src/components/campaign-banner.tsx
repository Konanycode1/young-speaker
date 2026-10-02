"use client";

import { Ribbon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Campaign = { slug: string; name: string; message: string; color: string; ctaLabel: string | null; ctaUrl: string | null };

export function CampaignBanner({ campaign }: { campaign: Campaign | null }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!campaign) return;
    let value = false;
    try {
      value = sessionStorage.getItem(`campaign-dismissed-${campaign.slug}`) === "1";
    } catch {
      value = false;
    }
    queueMicrotask(() => setDismissed(value));
  }, [campaign]);

  if (!campaign || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(`campaign-dismissed-${campaign!.slug}`, "1");
    } catch {
      // stockage indisponible : la bannière réapparaîtra au prochain chargement, sans gravité
    }
  }

  return <div className="campaign-banner" style={{ "--campaign-color": campaign.color } as React.CSSProperties}>
    <div className="campaign-banner-inner">
      <Ribbon size={18} />
      <p>{campaign.message}</p>
      {campaign.ctaLabel && campaign.ctaUrl && <Link className="campaign-banner-cta" href={campaign.ctaUrl}>{campaign.ctaLabel}</Link>}
      <button type="button" className="campaign-banner-close" onClick={dismiss} aria-label="Fermer"><X size={16} /></button>
    </div>
  </div>;
}
