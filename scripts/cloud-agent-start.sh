#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUNTIME_DIR="$ROOT_DIR/.cursor/runtime"
DB_ENV_FILE="$RUNTIME_DIR/db.env"
ENV_FILE="$ROOT_DIR/.env"

start_mariadb() {
  if mariadb-admin ping -h localhost --silent 2>/dev/null; then
    return 0
  fi

  if command -v sudo >/dev/null 2>&1; then
    sudo service mariadb start 2>/dev/null || sudo mysqld_safe --datadir=/var/lib/mysql &
  else
    mysqld_safe --datadir=/var/lib/mysql &
  fi

  for _ in $(seq 1 30); do
    if mariadb-admin ping -h localhost --silent 2>/dev/null; then
      return 0
    fi
    sleep 1
  done

  echo "MariaDB did not become ready in time." >&2
  exit 1
}

write_env_file() {
  if [[ ! -f "$DB_ENV_FILE" ]]; then
    echo "Missing ${DB_ENV_FILE}. Run scripts/cloud-agent-install.sh first." >&2
    exit 1
  fi

  # shellcheck disable=SC1090
  source "$DB_ENV_FILE"

  local access_secret refresh_secret
  access_secret="${JWT_ACCESS_SECRET:-$(openssl rand -hex 24)}"
  refresh_secret="${JWT_REFRESH_SECRET:-$(openssl rand -hex 24)}"

  cat >"$ENV_FILE" <<ENV
PORT=${PORT:-5000}
NODE_ENV=${NODE_ENV:-development}
DATABASE_URL=${DATABASE_URL}
JWT_ACCESS_SECRET=${access_secret}
JWT_REFRESH_SECRET=${refresh_secret}
LOG_TO_FILE=false
ENV
  chmod 600 "$ENV_FILE"
}

start_mariadb
write_env_file
echo "Environment ready (MariaDB running, .env written)."
