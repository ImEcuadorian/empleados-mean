#!/usr/bin/env bash
set -euo pipefail
export PATH="/usr/local/bin:/usr/bin:/bin"
base=/srv/empleados
sha=${1:?Missing commit SHA}
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid SHA'; exit 1; }
exec 9>"$base/deploy.lock"
flock -w 300 9
release="$base/releases/$sha-$(date +%s%N)"
mkdir -m 755 "$release"
tar -xzf - --no-same-owner -C "$release"
test -f "$release/backend/dist/index.js"
test -f "$release/frontend/index.html"
test -f "$base/shared/backend.env"
ln -s "$base/shared/backend.env" "$release/backend/.env"
cd "$release/backend"
npm ci --omit=dev --ignore-scripts --no-audit --no-fund
previous=$(readlink -f "$base/current" || true)
ln -s "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
pm2 startOrRestart "$release/ecosystem.config.cjs" --update-env
healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --max-time 3 http://127.0.0.1:3000/api/v1/health >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  if [[ -n "$previous" && -d "$previous" ]]; then
    ln -s "$previous" "$base/current.rollback"
    mv -Tf "$base/current.rollback" "$base/current"
    pm2 startOrRestart "$previous/ecosystem.config.cjs" --update-env
  else
    pm2 stop empleados-api || true
  fi
  echo 'Deployment failed its health check; previous release restored if available'
  exit 1
fi
pm2 save
echo "Deployment healthy: $sha"
