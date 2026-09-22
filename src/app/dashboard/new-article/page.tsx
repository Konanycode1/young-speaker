import { ArticleEditor } from "@/components/article-editor";
import { db } from "@/lib/db";
import { requireSpeaker } from "@/lib/dashboard";

export default async function NewArticlePage() {
  await requireSpeaker();
  const theme = await db.weeklyTheme.findFirst({ where: { startsAt: { lte: new Date() }, endsAt: { gte: new Date() } }, orderBy: { startsAt: "desc" } });
  return <><div className="dash-head"><div><span className="eyebrow">Nouvelle publication</span><h1>Écris ce qui compte.</h1></div><span className="status">Nouveau brouillon</span></div><ArticleEditor themeId={theme?.id} themeTitle={theme?.title} /></>;
}
