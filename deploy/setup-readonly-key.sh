#!/usr/bin/env bash
set -euo pipefail
if [[ ! -f /home/deploy/.ssh/github_readonly ]]; then
  sudo -u deploy ssh-keygen -q -t ed25519 -N '' -C empleados-github-readonly -f /home/deploy/.ssh/github_readonly
fi
sudo -iu deploy cat /home/deploy/.ssh/github_readonly.pub
