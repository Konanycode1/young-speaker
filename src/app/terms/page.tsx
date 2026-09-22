import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Conditions d’utilisation", description: "Les conditions d’utilisation de la plateforme Young Speaker." };

export default function TermsPage() {
  return <LegalPage eyebrow="Conditions d’utilisation" title="Les règles du jeu." intro="En utilisant Young Speaker, tu acceptes les conditions ci-dessous. Elles sont courtes : prends deux minutes pour les lire." current="/terms">
    <h2>1. À quoi sert Young Speaker ?</h2>
    <p>Young Speaker est une plateforme communautaire qui permet aux jeunes de publier une opinion, un témoignage ou une expérience, de lire celles des autres, de voter, de commenter et de relever des challenges. Les contenus sont partagés dans un cadre modéré.</p>

    <h2>2. Ton compte</h2>
    <ul>
      <li>Tu fournis une adresse email valide et tu choisis un pseudonyme public. Nous te conseillons de ne pas utiliser ton vrai nom.</li>
      <li>Tu es responsable de la confidentialité de ton mot de passe et de l’activité de ton compte. Ne le partage avec personne.</li>
      <li>Si tu as moins de 15 ans, demande l’accord d’un parent ou d’un tuteur avant de t’inscrire.</li>
      <li>Un compte est personnel : un seul compte par personne, sans usurpation d’identité.</li>
    </ul>

    <h2>3. Ce que tu publies</h2>
    <p>Tu restes propriétaire de tes textes. En les publiant, tu nous autorises à les afficher sur la plateforme et à les présenter (par exemple sur la page d’accueil ou dans les résultats de recherche), sans contrepartie et tant qu’ils sont en ligne. Tu peux demander leur retrait à tout moment.</p>
    <p>Tu garantis que tes contenus t’appartiennent, qu’ils ne copient pas le travail d’autrui et qu’ils ne portent pas atteinte aux droits d’une autre personne.</p>

    <h2>4. Ce qui est interdit</h2>
    <p>Les règles détaillées figurent dans la <Link href="/safety">charte de la communauté</Link>, qui fait partie de ces conditions. En résumé, sont interdits :</p>
    <ul>
      <li>les insultes, le langage vulgaire et le harcèlement ;</li>
      <li>les propos racistes, discriminatoires ou haineux ;</li>
      <li>la propagande et les contenus politiques partisans (la plateforme est apolitique) ;</li>
      <li>les contenus sexuels, violents ou dangereux, le spam et la publicité ;</li>
      <li>la publication d’informations personnelles d’autrui sans son accord ;</li>
      <li>toute tentative de perturber le service ou d’accéder à des comptes ou à des données qui ne sont pas les tiens.</li>
    </ul>

    <h2>5. Modération et sanctions</h2>
    <p>Les articles sont relus avant publication et les commentaires sont soumis à un filtre automatique. Nous pouvons refuser, masquer ou supprimer tout contenu qui ne respecte pas ces conditions. En cas de manquement, nous pouvons avertir, suspendre ou supprimer un compte, sans préavis lorsque l’infraction est grave (racisme, menaces, harcèlement, mise en danger d’un·e mineur·e).</p>

    <h2>6. Un espace d’expression, pas un avis professionnel</h2>
    <p>Les textes publiés sont des expériences et des opinions personnelles. Ils ne remplacent ni un avis médical, ni un accompagnement psychologique, juridique ou professionnel. En cas de détresse ou de danger, contacte les services d’urgence de ton pays ou un adulte de confiance.</p>

    <h2>7. Disponibilité du service</h2>
    <p>Nous faisons de notre mieux pour que la plateforme soit disponible et fiable, mais nous ne pouvons pas garantir un fonctionnement sans interruption. Nous pouvons modifier ou suspendre certaines fonctionnalités, notamment pour la maintenance ou la sécurité.</p>

    <h2>8. Supprimer ton compte</h2>
    <p>Tu peux demander à tout moment la suppression de ton compte en écrivant à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Le traitement de tes données est décrit dans la <Link href="/privacy">politique de confidentialité</Link>.</p>

    <h2>9. Modifications</h2>
    <p>Ces conditions peuvent évoluer. La date de dernière mise à jour figure en bas de cette page ; en cas de changement important, nous te le signalerons sur la plateforme. Continuer à utiliser Young Speaker après une modification vaut acceptation.</p>

    <h2>10. Nous contacter</h2>
    <p>Pour toute question : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
  </LegalPage>;
}
