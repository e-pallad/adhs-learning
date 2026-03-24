#!/bin/bash
# deploy-netcup.sh — Deploy Devfluent on a netcup vServer
# Run this script ON THE SERVER after cloning the repo.
#
# Prerequisites (run once manually):
#   apt install -y docker.io docker-compose-plugin certbot
#   systemctl enable --now docker
#
# Usage:
#   chmod +x scripts/deploy-netcup.sh
#   ./scripts/deploy-netcup.sh <your-domain.example.com>

set -euo pipefail

DOMAIN="${1:-devfluent.de}"
COMPOSE="docker compose -f compose.netcup.yml"

echo "==> Checking for .env.production ..."
if [[ ! -f .env.production ]]; then
  echo "ERROR: .env.production not found. Create it from .env.production.example first." >&2
  exit 1
fi

echo "==> Replacing placeholder domain in nginx config ..."
sed -i "s/DOMAIN/${DOMAIN}/g" nginx/netcup.conf

echo "==> Obtaining TLS certificate (certbot standalone) ..."
# Stop nginx if it is already running so certbot can bind port 80
$COMPOSE stop nginx 2>/dev/null || true
certbot certonly --standalone -d "${DOMAIN}" -d "www.${DOMAIN}" \
  --non-interactive --agree-tos --register-unsafely-without-email

echo "==> Building app image ..."
$COMPOSE build

echo "==> Starting all services ..."
$COMPOSE up -d

echo ""
echo "==> Done!  Devfluent is running at https://${DOMAIN}"
echo "    Logs: docker compose -f compose.netcup.yml logs -f"
echo ""
echo "==> To renew certificates automatically, add to cron:"
echo "    0 3 * * * certbot renew --quiet && docker compose -f /path/to/repo/compose.netcup.yml restart nginx"
