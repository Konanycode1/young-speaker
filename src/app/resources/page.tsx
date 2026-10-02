import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Ressources d’écoute", description: "Des pistes concrètes si tu traverses un moment difficile." };

export default function ResourcesPage() {
  return <>
    <section className="page-hero container"><span className="eyebrow">Besoin d’aide ?</span><h1>Tu n’as pas à traverser ça seul·e.</h1><p>Ces pistes ne remplacent pas un professionnel, mais elles peuvent être un premier pas.</p></section>
    <section className="container legal">
      <article className="legal-body">
        <div className="legal-callout"><p><strong>Si toi ou quelqu’un que tu connais es en danger immédiat</strong>, ne reste pas seul·e avec ça : contacte tout de suite les services d’urgence de ton pays, ou une personne de confiance à proximité. Cette page ne remplace pas un service d’urgence.</p></div>

        <h2>Parler à une personne de confiance</h2>
        <p>Un parent, un membre de ta famille, un·e enseignant·e, l’infirmerie ou le service social de ton établissement, un médecin : ce sont souvent les personnes les mieux placées pour t’aider rapidement, même si c’est difficile à initier. Tu peux commencer par une phrase simple : « En ce moment, ça ne va pas vraiment, j’aurais besoin d’en parler. »</p>

        <h2>Trouver une ligne d’écoute près de chez toi</h2>
        <p>De nombreux pays ont une ligne d’écoute jeunesse gratuite et confidentielle. Cherche « ligne d’écoute jeunesse » ou « soutien psychologique jeunes » suivi du nom de ton pays, ou demande à un·e adulte de confiance de t’aider à trouver la bonne ressource près de chez toi.</p>

        <h2>Des gestes simples qui peuvent aider</h2>
        <ul>
          <li>Mettre des mots sur ce que tu ressens, par écrit ou à voix haute — tu peux commencer sur <Link href="/comment-vas-tu">Comment vas-tu ?</Link>.</li>
          <li>Respirer lentement quelques minutes, marcher, ou changer d’environnement.</li>
          <li>Éviter de rester isolé·e : même un message à quelqu’un en qui tu as confiance compte.</li>
          <li>Prendre soin des bases : dormir, manger, bouger un minimum, même quand tout paraît difficile.</li>
        </ul>

        <h2>Sur Young Speaker</h2>
        <p>Tu peux aussi lire les témoignages d’autres jeunes qui ont traversé des moments similaires dans <Link href="/articles">les articles de la communauté</Link>, ou nous écrire directement à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> si tu ne sais pas vers qui te tourner.</p>
      </article>
    </section>
  </>;
}
