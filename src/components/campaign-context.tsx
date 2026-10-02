"use client";

import { createContext, useContext } from "react";

export type CampaignInfo = { name: string; color: string } | null;

const CampaignContext = createContext<CampaignInfo>(null);

export function CampaignProvider({ campaign, children }: { campaign: CampaignInfo; children: React.ReactNode }) {
  return <CampaignContext.Provider value={campaign}>{children}</CampaignContext.Provider>;
}

export function useCampaign() {
  return useContext(CampaignContext);
}
