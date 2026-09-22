#!/usr/bin/env bash
# Déploiement sur le serveur. Fichiers requis dans ce dossier :
#   deploy.sh, docker-compose.prod.yml, .env.production
#
# Usage : ./deploy.sh [commande]
#   deploy [tag]   récupère l'image, sauvegarde la base, migre, redémarre (défaut ; tag = IMAGE_TAG du .env.production)
#                  Rollback : ./deploy.sh deploy <ancien-tag>
#   seed-admin     crée/met à jour le super administrateur (réinitialise son mot de passe)
#   backup         dump PostgreSQL compressé dans ./backups
#   status         état des conteneurs
#   logs [service] suit les logs (défaut : web)
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="backups"
KEEP_BACKUPS=10
HEALTH_TIMEOUT=120

dc() { docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"; }
log() { echo "==> $*"; }
die() { echo "Erreur : $*" >&2; exit 1; }

preflight() {
  command -v docker >/dev/null || die "docker n'est pas installé."
  docker compose version >/dev/null 2>&1 || die "le plugin docker compose est requis."
  [ -f "$COMPOSE_FILE" ] || die "$COMPOSE_FILE introuvable."
  [ -f "$ENV_FILE" ] || die "$ENV_FILE introuvable."
  if grep -qE '^[A-Z_]+=.*CHANGE_ME' "$ENV_FILE"; then
    die "$ENV_FILE contient encore des CHANGE_ME :$(grep -E '^[A-Z_]+=.*CHANGE_ME' "$ENV_FILE" | cut -d= -f1 | sed 's/^/ /' | tr -d '\n')"
  fi
  dc config -q
}

set_env() { # set_env KEY VALUE — met à jour le fichier en place (préserve droits et propriétaire)
  local tmp
  tmp="$(mktemp)"
  if grep -qE "^$1=" "$ENV_FILE"; then
    sed "s|^$1=.*|$1=$2|" "$ENV_FILE" > "$tmp"
  else
    { cat "$ENV_FILE"; echo "$1=$2"; } > "$tmp"
  fi
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}

db_running() { [ -n "$(dc ps -q --status running db 2>/dev/null)" ]; }

backup() {
  db_running || die "le conteneur db ne tourne pas."
  mkdir -p "$BACKUP_DIR"
  local file="$BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sql.gz"
  dc exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$file.partial"
  mv "$file.partial" "$file"
  log "Sauvegarde : $file"
  # shellcheck disable=SC2012
  ls -1t "$BACKUP_DIR"/db-*.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
}

wait_healthy() {
  local id status elapsed=0
  id="$(dc ps -q web)"
  [ -n "$id" ] || die "le conteneur web n'a pas démarré."
  while [ "$elapsed" -lt "$HEALTH_TIMEOUT" ]; do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$id")"
    case "$status" in
      healthy|running) return 0 ;;
      unhealthy|exited|dead) break ;;
    esac
    sleep 3
    elapsed=$((elapsed + 3))
  done
  dc logs --tail 50 web >&2
  die "web n'est pas sain (statut : ${status:-inconnu})."
}

deploy() {
  local previous tag
  previous="$(grep -E '^IMAGE_TAG=' "$ENV_FILE" | tail -n1 | cut -d= -f2- || true)"
  tag="${1:-${previous:-latest}}"
  export IMAGE_TAG="$tag"

  preflight
  log "Déploiement du tag : $tag (précédent : ${previous:-aucun})"

  dc pull web migrate
  if db_running; then backup; else log "Base absente, sauvegarde ignorée (premier déploiement)."; fi

  dc up -d --remove-orphans
  wait_healthy

  set_env IMAGE_TAG "$tag"
  docker image prune -f >/dev/null
  log "Déployé : $tag"
  [ "$previous" = "$tag" ] || log "Rollback : ./deploy.sh deploy ${previous:-<tag>}"
}

seed_admin() {
  preflight
  grep -qE '^SUPER_ADMIN_PASSWORD=.+' "$ENV_FILE" || die "SUPER_ADMIN_PASSWORD est vide."
  dc up -d db
  dc --profile tools run --rm seed-admin
}

case "${1:-deploy}" in
  deploy)     deploy "${2:-}" ;;
  seed-admin) seed_admin ;;
  backup)     preflight; backup ;;
  status)     dc ps ;;
  logs)       dc logs -f --tail 100 "${2:-web}" ;;
  -h|--help|help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//' ;;
  *)          die "commande inconnue : $1 (voir ./deploy.sh help)" ;;
esac
