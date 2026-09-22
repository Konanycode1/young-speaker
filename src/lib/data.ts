export type Article = {
  slug: string; title: string; excerpt: string; category: string; author: string;
  initials: string; color: string; votes: number; views: number; readTime: number;
  date: string; featured?: boolean; sensitive?: string; content: string[];
};

export const articles: Article[] = [
  { slug: "parler-sante-mentale-sans-honte", title: "Parler de sa santé mentale, ce n'est pas être faible", excerpt: "J'ai longtemps cru qu'il fallait tout garder pour moi. Le jour où j'ai parlé a tout changé.", category: "Santé mentale", author: "Aya K.", initials: "AK", color: "#ffd56a", votes: 284, views: 1842, readTime: 5, date: "12 sept. 2026", featured: true, sensitive: "Ce récit aborde l'anxiété et la santé mentale.", content: ["Pendant longtemps, j'ai souri pour que personne ne pose de question. À l'école, on me voyait comme celle qui gérait tout. Pourtant, à l'intérieur, chaque journée ressemblait à une montagne.", "J'ai fini par en parler à ma grande sœur. Elle n'a pas essayé de tout réparer. Elle m'a simplement écoutée, sans jugement. C'est là que j'ai compris que demander de l'aide était une force.", "Si tu te reconnais dans ces mots, choisis une personne de confiance. Tu n'as pas besoin de tout raconter d'un coup. Une phrase suffit pour commencer : « En ce moment, ça ne va pas vraiment. »"] },
  { slug: "pression-reseaux-sociaux", title: "La pression d'être parfait sur les réseaux", excerpt: "Derrière les filtres et les likes, comment rester soi-même ?", category: "Réseaux sociaux", author: "Moussa D.", initials: "MD", color: "#a5e4d5", votes: 219, views: 1320, readTime: 4, date: "10 sept. 2026", content: ["Nos fils d'actualité montrent des vies soigneusement sélectionnées. À force de comparer nos coulisses aux meilleurs moments des autres, on oublie notre propre valeur.", "J'ai commencé par masquer les comptes qui me faisaient du mal et suivre des créateurs honnêtes. Mon écran est devenu un espace plus sain."] },
  { slug: "oser-choisir-sa-voie", title: "Oser choisir sa voie quand tout le monde a un avis", excerpt: "Mes parents rêvaient d'une carrière pour moi. J'ai appris à construire la mienne.", category: "Orientation", author: "Inès B.", initials: "IB", color: "#cfb8ff", votes: 176, views: 987, readTime: 6, date: "8 sept. 2026", content: ["Choisir son avenir ressemble parfois à une discussion où tout le monde parle sauf nous.", "J'ai préparé mon projet, rencontré des professionnels et présenté un plan concret à ma famille. Le dialogue n'a pas été immédiat, mais il est devenu possible."] },
  { slug: "amitie-qui-fait-grandir", title: "Les amitiés qui nous font grandir", excerpt: "Reconnaître une relation saine et apprendre à poser ses limites.", category: "Relations", author: "Noah T.", initials: "NT", color: "#ffaaa5", votes: 143, views: 812, readTime: 3, date: "6 sept. 2026", content: ["Une bonne amitié ne demande pas de devenir plus petit pour laisser l'autre prendre toute la place.", "Poser une limite ne met pas fin à une vraie amitié. Cela lui donne une chance de devenir plus honnête."] },
  { slug: "ecole-droit-erreur", title: "À l'école, avons-nous encore le droit à l'erreur ?", excerpt: "Nos notes mesurent un résultat, pas tout ce que nous sommes capables de devenir.", category: "Éducation", author: "Sarah M.", initials: "SM", color: "#8cc8ff", votes: 131, views: 740, readTime: 5, date: "4 sept. 2026", content: ["Une mauvaise note peut sembler définitive quand on a seize ans. Pourtant, elle ne raconte qu'un instant.", "Apprendre demande de tenter, de rater, puis de comprendre. L'erreur n'est pas l'opposé de la réussite : elle fait partie du chemin."] },
  { slug: "petites-victoires-confiance", title: "Mes petites victoires pour retrouver confiance", excerpt: "Sept habitudes simples qui m'ont aidée à changer le regard que je porte sur moi.", category: "Développement personnel", author: "Léa P.", initials: "LP", color: "#ffc98e", votes: 119, views: 693, readTime: 4, date: "2 sept. 2026", content: ["La confiance n'est pas arrivée comme un déclic. Elle s'est construite dans des gestes minuscules répétés chaque jour.", "Noter une victoire, même discrète, m'a appris à voir mes progrès plutôt que mes manques."] }
];

export const speakers = [
  { name: "Aya K.", handle: "@ayavoix", initials: "AK", color: "#ffd56a", bio: "J'écris pour rendre visibles nos émotions.", articles: 12, votes: 1280, badge: "Voice of Youth" },
  { name: "Moussa D.", handle: "@moussapense", initials: "MD", color: "#a5e4d5", bio: "Tech, société et vraie vie sans filtre.", articles: 9, votes: 942, badge: "Speaker actif" },
  { name: "Inès B.", handle: "@inesavance", initials: "IB", color: "#cfb8ff", bio: "Orientation, rêves et courage d'essayer.", articles: 8, votes: 811, badge: "Community Contributor" },
  { name: "Noah T.", handle: "@noahecoute", initials: "NT", color: "#ffaaa5", bio: "Des mots pour mieux vivre nos relations.", articles: 7, votes: 704, badge: "Young Speaker" }
];

export const challenges = [
  { title: "7 jours sans jugement", description: "Pendant une semaine, remplace chaque jugement — envers toi ou les autres — par une question bienveillante.", days: 5, participants: 438, level: "Accessible", color: "violet", icon: "♡" },
  { title: "5 choses que j'aime chez moi", description: "Prends cinq minutes pour reconnaître tes forces et partage-en une avec la communauté.", days: 12, participants: 286, level: "Facile", color: "yellow", icon: "✦" },
  { title: "Démasque une infox", description: "Choisis une information virale, vérifie ses sources et explique ce que tu as découvert.", days: 18, participants: 173, level: "Intermédiaire", color: "mint", icon: "◎" }
];

export const theme = { title: "Pourquoi est-il si difficile de parler de sa santé mentale ?", description: "Partage ton expérience, ton regard ou les solutions qui pourraient nous aider à mieux nous écouter.", end: "18 septembre", participations: 47, votes: 1428 };

export const categories = ["Tous", "Santé mentale", "Relations", "Éducation", "Réseaux sociaux", "Orientation", "Développement personnel"];
