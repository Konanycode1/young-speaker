import { db } from "@/lib/db";

const SETTINGS_ID = "singleton";

export async function getSiteSettings() {
  return db.siteSettings.upsert({ where: { id: SETTINGS_ID }, update: {}, create: { id: SETTINGS_ID } });
}

export async function setAutoPublishArticles(value: boolean) {
  return db.siteSettings.upsert({ where: { id: SETTINGS_ID }, update: { autoPublishArticles: value }, create: { id: SETTINGS_ID, autoPublishArticles: value } });
}
