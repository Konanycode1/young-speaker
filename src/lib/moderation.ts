// Filtre automatique du langage (insultes, vulgarités, propos racistes ou discriminatoires).
// Il complète la modération humaine : il ne bloque que les termes sans ambiguïté, le reste
// (ton, sujets politiques, contexte) relève des modérateurs. Voir la charte : /safety.

export const LANGUAGE_ERROR =
  "Ce texte ne respecte pas la charte de la communauté : pas d’insultes, de vulgarité ni de propos racistes ou discriminatoires. Reformule-le pour continuer.";

// Écrits sans accents ni lettres doublées : le texte est normalisé de la même façon avant comparaison.
const TERMS = [
  // vulgarités et insultes
  "putain", "pute", "ptn", "merde", "merdique", "connard", "connasse", "conne", "salope", "salopard", "salaud",
  "enculer", "encule", "enfoire", "batard", "bordel", "couille", "chier", "nique", "niquer", "ntm", "fdp",
  "fils de pute", "ta gueule", "ferme ta gueule", "trou du cul", "va te faire foutre", "va crever",
  "tapette", "tarlouze", "gouine", "pede", "attarde",
  "fuck", "fucking", "fucker", "motherfucker", "shit", "bitch", "asshole", "bastard", "cunt", "whore", "slut", "faggot", "retard",
  // propos racistes et discriminatoires
  "nigger", "nigga", "negre", "negresse", "negro", "bamboula", "bougnoule", "bicot", "crouille", "youpin", "chinetoque",
  "niakoue", "rital", "boche",
  "sale noir", "sale arabe", "sale juif", "sale blanc", "sale musulman", "sale chinois", "sale race", "sale etranger",
  "sale negre", "sale pede", "sale gouine",
  "retourne dans ton pays", "retourne chez toi", "heil hitler", "sieg heil", "vive hitler",
];

const squash = (value: string) => value.replace(/(.)\1+/g, "$1");

function normalize(text: string) {
  return squash(
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[@4]/g, "a")
      .replace(/3/g, "e")
      .replace(/1/g, "i")
      .replace(/0/g, "o")
      .replace(/[$5]/g, "s")
      // « p.u.t.a.i.n », « p u t a i n » : recolle les lettres isolées séparées
      .replace(/(?<![a-z])(?:[a-z][\s.\-_*]+){2,}[a-z](?![a-z])/g, (match) => match.replace(/[\s.\-_*]+/g, ""))
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " "),
  );
}

const pattern = new RegExp(
  `(?<![a-z])(?:${[...new Set(TERMS.map((term) => normalize(term)))].map((term) => term.replace(/ /g, "\\s+")).join("|")})s?(?![a-z])`,
);

export function violatesLanguageRules(...texts: Array<string | null | undefined>) {
  return texts.some((text) => Boolean(text) && pattern.test(normalize(text as string)));
}
