import { redirect } from "next/navigation";
import { CampaignAdminForm } from "@/components/campaign-admin-form";
import { CampaignToggleButton } from "@/components/campaign-toggle-button";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { canManageSettings } from "@/lib/permissions";

export default async function AdminCampaignsPage() {
  const user = await getCurrentUser();
  if (!user || !canManageSettings(user.role)) redirect("/admin");

  const campaigns = await db.awarenessCampaign.findMany({ orderBy: { createdAt: "desc" } });

  return <div className="container section">
    <div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Campagnes de sensibilisation</h1></div></div>
    <p className="helper-text">Une seule campagne peut être active à la fois : elle affiche un ruban sur les articles et un bandeau en haut du site. Désactive-la à la fin du mois — tu pourras la réactiver ou en créer une nouvelle plus tard pour une autre cause.</p>
    <div className="admin-split">
      <CampaignAdminForm />
      <section className="panel">
        <h2>Campagnes enregistrées</h2>
        <div className="admin-list">
          {campaigns.map((campaign) => <article key={campaign.id}>
            <div>
              <span className={`status ${campaign.isActive ? "" : "pending"}`}>{campaign.isActive ? "Active" : "Inactive"}</span>
              <h3><span className="campaign-admin-swatch" style={{ background: campaign.color }} />{campaign.name}</h3>
              <p>{campaign.message}</p>
              {(campaign.startsAt || campaign.endsAt) && <p>{campaign.startsAt ? formatDate(campaign.startsAt) : "?"} → {campaign.endsAt ? formatDate(campaign.endsAt) : "?"}</p>}
            </div>
            <CampaignToggleButton id={campaign.id} isActive={campaign.isActive} />
          </article>)}
          {!campaigns.length && <div className="empty-note">Aucune campagne enregistrée pour le moment.</div>}
        </div>
      </section>
    </div>
  </div>;
}
