#!/usr/bin/env bash
# Reuse the matching, tested CI build: never compile on the 1 GB EC2 host.
set -euo pipefail
cd /srv/empleados/pm2-source/current
source_sha=$(git rev-parse HEAD)
active=$(readlink -f /srv/empleados/current)
[[ "$(basename "$active")" == "$source_sha-"* ]] || {
  echo 'Wait for GitHub Actions to deploy this commit before the manual PM2 demonstration.'
  exit 1
}
test -f "$active/backend/dist/index.js"
cp -r "$active/backend/dist" backend/
cd backend
npm ci --omit=dev --ignore-scripts --no-audit --no-fund
ln -sfn /srv/empleados/shared/backend.env .env
cd ..
sudo -u deploy pm2 startOrReload deploy/pm2-deploy.config.cjs --env production
sudo -u deploy pm2 save
for attempt in $(seq 1 20); do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/api/v1/health; then exit 0; fi
  sleep 2
done
exit 1
