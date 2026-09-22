import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Politique de confidentialité", description: "Quelles données Young Speaker collecte, pourquoi, et comment exercer tes droits." };

export default function PrivacyPage() {
  return <LegalPage eyebrow="Politique de confidentialité" title="Tes données, en clair." intro="Nous collectons le minimum nécessaire pour faire vivre la communauté. Voici ce que nous gardons, pourquoi, et comment garder la main dessus." current="/privacy">
    <h2>1. Qui est responsable de tes données ?</h2>
    <p>La plateforme Young Speaker est responsable du traitement des données décrites ici. Pour toute question ou demande, écris-nous à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

    <h2>2. Les données que nous collectons</h2>
    <ul>
      <li><strong>Ton compte :</strong> adresse email, pseudonyme, rôle sur la plateforme et mot de passe. Le mot de passe n’est jamais stocké en clair : seule une empreinte chiffrée est conservée.</li>
      <li><strong>Ton profil (facultatif) :</strong> nom affiché, biographie, tranche d’âge, ville, pays, centres d’intérêt et photo. Tu n’es pas obligé·e de les renseigner.</li>
      <li><strong>Ce que tu fais sur la plateforme :</strong> articles, commentaires, votes, participations aux challenges, badges et notifications.</li>
      <li><strong>Données techniques :</strong> un identifiant de connexion (voir « Cookies ») et, comme sur tout site, des journaux techniques temporaires du serveur (adresse IP, date, page demandée) utilisés pour la sécurité et le bon fonctionnement du service.</li>
    </ul>
    <p>Nous ne te demandons ni ton nom complet, ni ton adresse, ni ton numéro de téléphone.</p>

    <h2>3. Ce qui est visible par les autres</h2>
    <p>Sont publics : ton pseudonyme, ton nom affiché, ta biographie et les articles et commentaires que tu publies. Ton email, ta tranche d’âge, ta ville, ton pays et tes centres d’intérêt ne sont pas affichés publiquement. Tu peux écrire sous pseudonyme : choisis-en un qui ne permet pas de t’identifier.</p>

    <h2>4. Pourquoi nous utilisons tes données</h2>
    <ul>
      <li>créer et sécuriser ton compte, et te permettre de te connecter ;</li>
      <li>publier tes contenus, gérer les votes, les commentaires, les challenges et les badges ;</li>
      <li>modérer les contenus et faire respecter la <Link href="/safety">charte de la communauté</Link> ;</li>
      <li>te contacter au sujet de ton compte ou de tes publications ;</li>
      <li>protéger la plateforme contre les abus et les fraudes.</li>
    </ul>
    <p>Nous ne vendons pas tes données et nous ne les utilisons ni pour de la publicité ni pour du profilage commercial.</p>

    <h2>5. Cookies et stockage local</h2>
    <p>Young Speaker utilise uniquement des cookies strictement nécessaires au fonctionnement du site :</p>
    <ul>
      <li><strong>ys_session</strong> : te garde connecté·e (30 jours au maximum). Il n’est pas lisible par les scripts du navigateur.</li>
      <li><strong>ys_visitor</strong> : permet à un visiteur non connecté de voter une seule fois par article (1 an). Nous n’en conservons qu’une empreinte chiffrée.</li>
      <li><strong>theme</strong> (stockage local du navigateur) : mémorise ton choix entre thème clair et sombre.</li>
    </ul>
    <p>Aucun cookie publicitaire ni outil de suivi. Les polices de caractères sont chargées depuis Google Fonts : ton navigateur contacte alors ce service, qui peut voir ton adresse IP.</p>

    <h2>6. Avec qui nous partageons tes données</h2>
    <p>Seules les personnes chargées de l’administration et de la modération y accèdent, dans la limite de ce qui leur est nécessaire. Les données sont hébergées sur les serveurs utilisés pour faire fonctionner la plateforme. Nous ne les transmettons à des tiers que si la loi nous y oblige ou pour protéger la sécurité d’une personne.</p>

    <h2>7. Combien de temps nous les gardons</h2>
    <ul>
      <li>Les données de ton compte sont conservées tant que ton compte est actif.</li>
      <li>Une session de connexion expire au bout de 30 jours.</li>
      <li>Quand tu demandes la suppression de ton compte, tes données personnelles sont supprimées ou rendues anonymes, sauf si la loi nous impose de les conserver. Des sauvegardes techniques, conservées en nombre limité et renouvelées régulièrement, peuvent les contenir pendant une courte période.</li>
    </ul>

    <h2>8. Tes droits</h2>
    <p>Tu peux à tout moment accéder à tes données, les corriger, les faire supprimer, demander leur limitation ou leur portabilité, et t’opposer à certains usages. Tu peux modifier ton profil et ton mot de passe directement depuis ton espace. Pour le reste (suppression du compte, copie de tes données…), écris à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> : nous répondons dans les meilleurs délais. Tu peux aussi saisir l’autorité de protection des données de ton pays si tu estimes que tes droits ne sont pas respectés.</p>

    <h2>9. Jeunes et mineur·e·s</h2>
    <p>Young Speaker s’adresse aux jeunes et nous y portons une attention particulière :</p>
    <ul>
      <li>si tu as moins de 15 ans, demande l’accord d’un parent ou d’un tuteur avant de t’inscrire ;</li>
      <li>n’indique jamais ton nom complet, ton adresse, ton téléphone ou ton établissement dans un texte, un commentaire ou ton profil ;</li>
      <li>un parent ou tuteur peut nous écrire pour consulter, corriger ou supprimer les données d’un·e mineur·e.</li>
    </ul>

    <h2>10. Sécurité</h2>
    <p>Nous protégeons tes données : mots de passe et jetons de connexion chiffrés, accès restreints et contrôle des rôles côté serveur. Aucun système n’est infaillible : en cas de problème de sécurité qui te concerne, nous t’en informerons.</p>

    <h2>11. Modifications</h2>
    <p>Cette politique peut évoluer. La date de dernière mise à jour figure en bas de cette page ; en cas de changement important, nous te le signalerons sur la plateforme. Voir aussi nos <Link href="/terms">conditions d’utilisation</Link>.</p>
  </LegalPage>;
}
