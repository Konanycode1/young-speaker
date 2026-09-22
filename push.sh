#!/usr/bin/env bash
# Build les images (app + migrator) et les pousse vers le registre.
#
# Usage : ./push.sh [tag]
#   tag        défaut : AAAAMMJJ-HHMMSS ; l'image est aussi poussée en :latest
# Variables : IMAGE_NAME, NEXT_PUBLIC_APP_URL (sinon lues dans .env.production),
#             PLATFORM (défaut linux/amd64, adapter si le serveur est en ARM)
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE=".env.production"
PLATFORM="${PLATFORM:-linux/amd64}"

read_env() {
  [ -f "$ENV_FILE" ] || return 0
  { grep -E "^$1=" "$ENV_FILE" || true; } | tail -n1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'
}

IMAGE_NAME="${IMAGE_NAME:-$(read_env IMAGE_NAME)}"
APP_URL="${NEXT_PUBLIC_APP_URL:-$(read_env NEXT_PUBLIC_APP_URL)}"
TAG="${1:-$(date +%Y%m%d-%H%M%S)}"

for pair in "IMAGE_NAME=$IMAGE_NAME" "NEXT_PUBLIC_APP_URL=$APP_URL"; do
  if [ -z "${pair#*=}" ] || [[ "$pair" == *CHANGE_ME* ]]; then
    echo "Erreur : ${pair%%=*} est vide ou vaut CHANGE_ME (voir $ENV_FILE)." >&2
    exit 1
  fi
done

docker buildx version >/dev/null 2>&1 || { echo "Erreur : docker buildx est requis." >&2; exit 1; }

echo "==> Image    : $IMAGE_NAME:$TAG (+ latest)"
echo "==> Platform : $PLATFORM"
echo "==> App URL  : $APP_URL"

docker buildx build \
  --platform "$PLATFORM" \
  --target runner \
  --build-arg "NEXT_PUBLIC_APP_URL=$APP_URL" \
  -t "$IMAGE_NAME:$TAG" -t "$IMAGE_NAME:latest" \
  --push .

docker buildx build \
  --platform "$PLATFORM" \
  --target migrator \
  -t "$IMAGE_NAME-migrate:$TAG" -t "$IMAGE_NAME-migrate:latest" \
  --push .

cat <<EOF

Poussé : $IMAGE_NAME:$TAG
Sur le serveur : ./deploy.sh deploy $TAG
EOF
