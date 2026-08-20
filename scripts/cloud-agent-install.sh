#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUNTIME_DIR="$ROOT_DIR/.cursor/runtime"
DB_ENV_FILE="$RUNTIME_DIR/db.env"
DB_NAME="algoerp_dev"
DB_USER="algoerp"
SCHEMA_FILE="$ROOT_DIR/docs/db/live_schema.sql"

mkdir -p "$RUNTIME_DIR"

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

run_sql() {
  if command -v sudo >/dev/null 2>&1; then
    sudo mariadb "$@"
  else
    mariadb "$@"
  fi
}

ensure_db_user() {
  if [[ -f "$DB_ENV_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$DB_ENV_FILE"
    return 0
  fi

  local db_password
  db_password="$(openssl rand -hex 16)"

  run_sql <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${db_password}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

  cat >"$DB_ENV_FILE" <<ENV
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${db_password}
DATABASE_URL=mysql://${DB_USER}:${db_password}@localhost:3306/${DB_NAME}
ENV
  chmod 600 "$DB_ENV_FILE"
}

import_schema_if_needed() {
  # shellcheck disable=SC1090
  source "$DB_ENV_FILE"

  local table_count
  table_count="$(mariadb -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -Nse \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';")"

  if [[ "$table_count" -ge 100 ]]; then
    echo "Database schema already present (${table_count} tables)."
    return 0
  fi

  echo "Importing schema from ${SCHEMA_FILE}..."
  mariadb -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <"$SCHEMA_FILE"
  echo "Schema import complete."
}

start_mariadb
ensure_db_user
import_schema_if_needed

npm ci
npx prisma generate

echo "Install complete."
