# Young Speaker

Young Speaker est une plateforme communautaire d’expression destinée aux adolescents et aux jeunes. Elle permet de publier une opinion, un témoignage ou une expérience dans un cadre modéré, puis d’interagir par des votes, commentaires, challenges et badges.

## Ce que contient ce MVP

- Landing page responsive avec thème de la semaine, articles, speakers, challenge et classement
- Catalogue d’articles, filtres, page de lecture, avertissement sensible et vote protégé par cookie
- Pages thèmes, challenges, speakers, profil public et recherche
- Inscription réelle avec choix commentateur/Young Speaker, connexion et sessions persistées en base
- Dashboard et administration protégés côté serveur par session valide et contrôle strict du rôle
- Commentaires persistés dans PostgreSQL et réservés aux membres connectés
- Dashboard Young Speaker et éditeur d’article
- Dashboard admin et file de modération interactive
- Route Handlers pour articles, votes, thème, challenges et speakers
- SEO : metadata, Open Graph, sitemap et robots
- Mode clair/sombre, navigation clavier, états vides et responsive mobile-first
- Schéma Prisma normalisé et seed réaliste
- Docker Compose avec Next.js et PostgreSQL

## Stack

Next.js App Router, React, TypeScript strict, CSS moderne, Prisma, PostgreSQL, Zod, bcryptjs et Lucide Icons.

## Installation locale

Prérequis : Node.js 24+, pnpm 10+ et PostgreSQL.

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
pnpm prisma:seed
pnpm dev
```

Ouvrir `http://localhost:3901`.

## Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL |
| `AUTH_SECRET` | Secret long et aléatoire pour signer les sessions |
| `NEXT_PUBLIC_APP_URL` | URL canonique de l’application |

## Docker

```bash
docker compose up --build
```

PostgreSQL est exposé sur le port `5433` de la machine afin d’éviter les conflits avec une installation locale utilisant déjà `5432`. Ce port peut être personnalisé avec `POSTGRES_PORT`.

Pour initialiser la base depuis la machine hôte après le démarrage de PostgreSQL :

```bash
pnpm exec prisma migrate deploy
pnpm prisma:seed
```

## Production

Les images sont construites en local, poussées vers un registre, puis simplement tirées sur le serveur.

**1. Configurer** : `cp .env.production.example .env.production`, puis remplacer les `CHANGE_ME` (`IMAGE_NAME`, `NEXT_PUBLIC_APP_URL`, `SUPER_ADMIN_*`). `AUTH_SECRET` et `POSTGRES_PASSWORD` : `openssl rand -hex 32`.

**2. Pousser** (après un `docker login` sur le registre) :

```bash
./push.sh            # tag AAAAMMJJ-HHMMSS + latest
./push.sh v1.2.0     # tag explicite
```

Deux images sont poussées : `IMAGE_NAME:<tag>` (application) et `IMAGE_NAME-migrate:<tag>` (schéma Prisma et seeds). Le build cible `linux/amd64` par défaut (`PLATFORM=linux/arm64` pour un serveur ARM).

**3. Déployer** : copier `deploy.sh`, `docker-compose.prod.yml` et `.env.production` dans un dossier du serveur (ex. `/opt/young-speaker`), faire `docker login` si le registre est privé, puis :

```bash
./deploy.sh deploy <tag>    # pull, sauvegarde de la base, migration, redémarrage, contrôle de santé
./deploy.sh seed-admin      # premier déploiement : crée le super administrateur
./deploy.sh deploy <ancien-tag>   # rollback
./deploy.sh backup | status | logs
```

L’application écoute sur `127.0.0.1:3901` : placer un reverse proxy HTTPS (Caddy, Nginx…) devant, ou mettre `APP_BIND=0.0.0.0`. Le schéma est appliqué avec `prisma db push` (le dépôt n’a pas de migrations) : une modification destructive est refusée plutôt qu’appliquée.

## Comptes de démonstration

- Speaker : `speaker1@demo.youngspeaker.org` / `Demo2026!`
- Admin : `admin@demo.youngspeaker.org` / `Demo2026!`

De nouveaux comptes peuvent être créés directement depuis `/register`. Le rôle `VISITOR` permet de commenter et voter ; le rôle `YOUNG_SPEAKER` donne également accès au dashboard de publication.

Pour créer ou réinitialiser un administrateur sans conserver son mot de passe dans le dépôt :

```bash
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="mot-de-passe-solide" pnpm admin:create
```

Pour créer ou mettre à jour le super-administrateur de manière idempotente :

```bash
SUPER_ADMIN_EMAIL="admin@youngspeaker.com" \
SUPER_ADMIN_PASSWORD="mot-de-passe-solide" \
SUPER_ADMIN_USERNAME="admin" \
pnpm superadmin:seed
```

Le seeder ne supprime aucune donnée métier. Il crée le compte s’il n’existe pas, sinon il le promeut en `SUPER_ADMIN`, actualise son profil et son mot de passe, puis révoque ses anciennes sessions.

## Architecture

```text
src/app/            pages publiques, auth, dashboard, admin et API
src/components/     composants visuels et interactifs réutilisables
src/lib/            données de démonstration et utilitaires
prisma/             schéma relationnel et seed
```

Les Server Components rendent les pages de lecture. Les Client Components sont limités aux interactions (menu, thème, formulaire, vote, modération). Les écritures passent par des Route Handlers validés côté serveur. Prisma constitue la frontière d’accès future aux données et peut être remplacé par un dépôt de recherche Elasticsearch sans modifier les vues.

## Rôles et permissions

| Action | Visiteur | Young Speaker | Modérateur | Admin |
| --- | :---: | :---: | :---: | :---: |
| Lire, chercher, voir les profils | ✓ | ✓ | ✓ | ✓ |
| Voter | limité | ✓ | ✓ | ✓ |
| Commenter |  | ✓ | ✓ | ✓ |
| Créer et soumettre un article |  | ✓ | ✓ | ✓ |
| Modérer articles/commentaires |  |  | ✓ | ✓ |
| Gérer utilisateurs, thèmes, badges |  |  |  | ✓ |

Toutes les permissions finales doivent être vérifiées côté serveur. Le middleware ne remplace jamais une vérification RBAC dans une Route Handler ou une Server Action.

## Modèle métier

Le schéma inclut `User`, `Profile`, `Article`, `Category`, `WeeklyTheme`, `Vote`, `Comment`, `Challenge`, `ChallengeParticipation`, `Badge`, `UserBadge`, `Report` et `Notification`, avec contraintes uniques, index, compteurs dénormalisés et suppressions logiques sur les contenus sensibles.

## Sécurité et prochaines étapes de production

- Les sessions utilisent un jeton aléatoire dont seul le hash est stocké en base, avec cookie `httpOnly`, `SameSite=Lax` et expiration. Ajouter rotation, révocation globale et récupération de mot de passe avant production publique.
- Effectuer le RBAC côté serveur sur chaque mutation et journaliser les actions de modération.
- Associer vote utilisateur et empreintes hachées session/IP/device, ajouter une fenêtre de rate limiting et une transaction Prisma pour le compteur.
- Nettoyer le HTML riche avec une allowlist stricte avant stockage et rendu ; ne jamais utiliser du HTML utilisateur brut.
- Ajouter CSRF aux mutations authentifiées si l’architecture retenue n’est pas protégée par `SameSite` et vérification d’origine.
- Chiffrer les secrets, minimiser les données personnelles des mineurs, prévoir export/suppression et politique de conservation.
- Ne pas présenter les contenus communautaires comme des conseils médicaux ; afficher des ressources locales d’urgence selon le pays.
- Ajouter tests unitaires, intégration API, E2E des permissions et audit d’accessibilité avant déploiement.

## Qualité

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm exec prisma validate
```

## Plan d’évolution

1. Brancher Prisma/PostgreSQL aux pages aujourd’hui alimentées par les fixtures.
2. Étendre la matrice RBAC à toutes les mutations et ajouter la récupération de compte.
3. Finaliser commentaires, signalements et notifications en base.
4. Ajouter stockage média signé, rate limiting distribué et journal d’audit.
5. Couvrir les parcours critiques par tests avant le premier déploiement.
