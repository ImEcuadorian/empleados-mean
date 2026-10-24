#!/usr/bin/env bash
# Explicit lab test: brief outage, automatic restart even if the test fails.
set -euo pipefail
trap 'sudo -iu deploy pm2 start empleados-api >/dev/null' EXIT
sudo -iu deploy pm2 stop empleados-api >/dev/null
echo 'API detenida para comprobar eventos PM2 y alerta de salud'
sleep 35
sudo -iu deploy pm2 start empleados-api >/dev/null
trap - EXIT
echo 'API iniciada de nuevo'
for attempt in $(seq 1 15); do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/api/v1/health; then exit 0; fi
  sleep 2
done
exit 1
