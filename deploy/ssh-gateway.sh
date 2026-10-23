#!/usr/bin/env bash
set -euo pipefail
if [[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ ([a-f0-9]{40})$ ]]; then
  exec /srv/empleados/bin/deploy.sh "${BASH_REMATCH[1]}"
fi
echo 'Only the deployment command is allowed' >&2
exit 1
