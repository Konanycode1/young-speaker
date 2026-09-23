import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate, requireSpeaker } from "@/lib/dashboard";

export default async function MyComments() {
  const user = await requireSpeaker();
  const comments = await db.comment.findMany({
    where: { authorId: user.id, deletedAt: null },
    include: { article: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <>
    <div className="dash-head"><div><span className="eyebrow">Mon activité</span><h1>Mes commentaires</h1></div></div>
    <div className="panel">
      {comments.length ? <div className="account-comments">{comments.map((comment) => {
        const slug = comment.article?.slug ?? comment.articleSlug;
        return <article key={comment.id}><p>{comment.content}</p><small>{formatDate(comment.createdAt)}{comment.article?.title ? ` · ${comment.article.title}` : ""}</small>{slug && <Link href={`/articles/${slug}`}>Voir la discussion</Link>}</article>;
      })}</div> : <div className="empty-note">Tu n’as pas encore commenté d’article.<br /><br /><Link className="button small" href="/articles">Explorer les articles</Link></div>}
    </div>
  </>;
}
