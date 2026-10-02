import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/article-editor";
import { getActiveCampaign } from "@/lib/campaign";
import { db } from "@/lib/db";
import { requireSpeaker, statusLabels } from "@/lib/dashboard";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSpeaker();
  const { id } = await params;
  const article = await db.article.findFirst({ where: { id, deletedAt: null }, include: { category: true } });
  if (!article) notFound();
  if (article.authorId !== user.id) notFound();

  const [theme, campaign] = await Promise.all([
    db.weeklyTheme.findFirst({ where: { startsAt: { lte: new Date() }, endsAt: { gte: new Date() } }, orderBy: { startsAt: "desc" } }),
    getActiveCampaign(),
  ]);
  const articleTheme = article.weeklyThemeId && article.weeklyThemeId !== theme?.id
    ? await db.weeklyTheme.findUnique({ where: { id: article.weeklyThemeId } })
    : null;
  const specialTheme = campaign?.themePrompt ? campaign : null;
  const articleCampaign = article.campaignId && article.campaignId !== specialTheme?.id
    ? await db.awarenessCampaign.findUnique({ where: { id: article.campaignId } })
    : null;

  return <>
    <div className="dash-head">
      <div><span className="eyebrow">Continuer la rédaction</span><h1>Modifier l’article</h1></div>
      <span className="status">{statusLabels[article.status]}</span>
    </div>
    {article.rejectionReason && <p className="form-error">Motif indiqué par la modération : {article.rejectionReason}</p>}
    <ArticleEditor
      themeId={articleTheme?.id ?? theme?.id}
      themeTitle={articleTheme?.title ?? theme?.title}
      campaignId={articleCampaign?.id ?? specialTheme?.id}
      campaignName={articleCampaign?.name ?? specialTheme?.name}
      campaignPrompt={(articleCampaign?.themePrompt ?? specialTheme?.themePrompt) ?? undefined}
      article={{
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category.name,
        weeklyThemeId: article.weeklyThemeId,
        campaignId: article.campaignId,
        status: article.status,
      }}
    />
  </>;
}
