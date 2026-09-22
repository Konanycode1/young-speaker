import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Charte de la communauté", description: "Respect, apolitisme et bienveillance : les règles de vie de Young Speaker." };

export default function SafetyPage() {
  return <LegalPage eyebrow="Charte de la communauté" title="Un espace sûr, pour toutes et tous." intro="Young Speaker existe pour que chacun·e puisse s’exprimer sans peur d’être insulté·e ou jugé·e. Ces règles s’appliquent à tous les membres, sans exception." current="/safety">
    <h2>1. Respect et bienveillance</h2>
    <p>On peut ne pas être d’accord, mais on le dit avec respect. Chaque personne mérite d’être écoutée, quels que soient son âge, son origine, sa religion, son genre, son orientation, son apparence ou son parcours.</p>

    <h2>2. Ce qui n’est pas accepté</h2>
    <ul>
      <li><strong>Les insultes</strong> et les attaques personnelles, y compris sous forme de moquerie ou d’humiliation.</li>
      <li><strong>Le langage vulgaire ou grossier</strong>, dans les articles, les commentaires comme dans les pseudonymes.</li>
      <li><strong>Les propos racistes, xénophobes ou discriminatoires</strong> : toute remarque visant une personne ou un groupe à cause de son origine, de sa couleur de peau, de sa religion, de sa nationalité, de son genre, de son orientation, d’un handicap ou de sa situation sociale.</li>
      <li><strong>Le harcèlement, les menaces et l’incitation à la haine</strong>, sur la plateforme ou à partir d’elle.</li>
      <li><strong>Les contenus sexuels ou violents</strong> gratuits, et tout ce qui met un·e mineur·e en danger.</li>
      <li><strong>Les informations personnelles d’autrui</strong> (nom complet, adresse, téléphone, photos) publiées sans son accord.</li>
      <li><strong>Le spam</strong>, la publicité et les tentatives d’usurpation d’identité.</li>
    </ul>
    <div className="legal-callout"><p><strong>Tolérance zéro</strong> pour les propos racistes, discriminatoires et les insultes : le contenu est retiré et le compte peut être suspendu ou supprimé dès la première infraction grave.</p></div>

    <h2>3. Un espace apolitique</h2>
    <p>Young Speaker est un lieu d’expression personnelle, ouvert à tous les jeunes, quelles que soient leurs convictions. Pour que chacun·e s’y sente à l’aise, la plateforme reste <strong>apolitique</strong> :</p>
    <ul>
      <li>pas de propagande ni de campagne en faveur ou contre un parti, un candidat, un gouvernement ou un mouvement politique ;</li>
      <li>pas d’appel à voter, à manifester ou à rejoindre une organisation politique ;</li>
      <li>pas de débat partisan ni d’attaque contre des responsables politiques ;</li>
      <li>pas de prosélytisme, qu’il soit politique ou religieux.</li>
    </ul>
    <p>Tu peux en revanche parler de <strong>ton vécu</strong> et de sujets de société (éducation, santé mentale, relations, avenir…) à partir de ton expérience et avec nuance, sans t’en servir pour faire campagne.</p>

    <h2>4. Ta sécurité</h2>
    <ul>
      <li>Utilise un pseudonyme et ne partage jamais ton adresse, ton téléphone, ton établissement ou tes mots de passe.</li>
      <li>Les sujets sensibles (violences, deuil, santé mentale…) doivent s’accompagner d’un avertissement et de retenue.</li>
      <li>Si toi ou quelqu’un que tu connais êtes en danger immédiat, ne comptez pas sur la plateforme : contactez les services d’urgence de votre pays ou un adulte de confiance.</li>
    </ul>

    <h2>5. Comment fonctionne la modération</h2>
    <ul>
      <li><strong>Relecture avant publication :</strong> chaque article est lu par l’équipe avant d’être publié. S’il est refusé, tu reçois le motif pour pouvoir le corriger.</li>
      <li><strong>Filtre automatique :</strong> un filtre bloque les commentaires, articles, pseudonymes et profils qui contiennent des insultes, des vulgarités ou des propos racistes. Il ne remplace pas le jugement des modérateurs et peut se tromper : reformule ton texte ou écris-nous.</li>
      <li><strong>Retrait et sanctions :</strong> un contenu qui enfreint la charte peut être masqué ou supprimé. Selon la gravité et la répétition, le compte reçoit un avertissement, une suspension ou une suppression définitive.</li>
    </ul>

    <h2>6. Signaler un problème</h2>
    <p>Tu as vu un contenu ou un comportement qui ne respecte pas cette charte ? Écris-nous à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> en indiquant la page concernée. Nous traitons chaque signalement avec sérieux et discrétion.</p>
    <p>En créant un compte, tu acceptes cette charte, les <Link href="/terms">conditions d’utilisation</Link> et la <Link href="/privacy">politique de confidentialité</Link>.</p>
  </LegalPage>;
}
