"use client";

import { Ribbon } from "lucide-react";
import { useCampaign } from "./campaign-context";

export function CampaignRibbon({ size = 14 }: { size?: number }) {
  const campaign = useCampaign();
  if (!campaign) return null;
  return <Ribbon size={size} className="campaign-ribbon" style={{ color: campaign.color }} aria-label={campaign.name} />;
}
