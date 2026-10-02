import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Certificat de participation" };

export default async function ChallengeCertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  const { slug } = await params;
  if (!user) redirect(`/login?next=/challenges/${slug}/certificate`);

  const challenge = await db.challenge.findUnique({ where: { slug } });
  if (!challenge) notFound();
  const participation = await db.challengeParticipation.findUnique({ where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } } });
  if (!participation || participation.status !== "COMPLETED" || !participation.completedAt) notFound();

  return <div className="container certificate-page">
    <Link className="arrow-link certificate-actions" href={`/challenges/${slug}`}><ArrowLeft size={16} /> Retour au challenge</Link>
    <div className="certificate">
      <div className="certificate-frame">
        <div className="certificate-brand"><span className="logo-mark"><i /><i /><i /></span><b>Young Speaker</b></div>
        <h1>Certificat de participation</h1>
        <p className="certificate-body">Ce certificat est fièrement décerné à</p>
        <p className="certificate-name">{user.profile?.fullName || user.profile?.displayName || "Un·e Young Speaker"}</p>
        <p className="certificate-body">pour avoir mené à bien le challenge</p>
        <p className="certificate-challenge">« {challenge.title} »</p>
        <p className="certificate-body">et gagné {challenge.points} points pour son engagement dans la communauté.</p>
        <div className="certificate-footer">
          <div><small>Date</small><b>{formatDate(participation.completedAt)}</b></div>
          <div className="certificate-seal">✦</div>
          <div style={{ textAlign: "right" }}><small>Certificat n°</small><b>{participation.id.slice(-8).toUpperCase()}</b></div>
        </div>
      </div>
    </div>
    <div className="certificate-actions" style={{ textAlign: "center" }}><PrintButton /></div>
  </div>;
}
