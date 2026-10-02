import { db } from "@/lib/db";

export function getActiveCampaign() {
  return db.awarenessCampaign.findFirst({ where: { isActive: true } });
}

export type ActiveCampaign = Awaited<ReturnType<typeof getActiveCampaign>>;
