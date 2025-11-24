#!/usr/bin/env bash
set -euo pipefail

# Simple project bootstrapper:
# - ensures a .env with DATABASE_URL is present (defaults to file:local.db)
# - installs npm deps
# - runs Prisma migrations against the local SQLite database

cd "$(dirname "$0")"

ENV_FILE=".env"
DEFAULT_DB_URL="${DATABASE_URL:-file:local.db}"

ensure_env() {
	if [[ -f "$ENV_FILE" ]]; then
		if ! grep -q '^DATABASE_URL=' "$ENV_FILE"; then
			echo "DATABASE_URL=$DEFAULT_DB_URL" >>"$ENV_FILE"
			echo "Added DATABASE_URL to existing $ENV_FILE ($DEFAULT_DB_URL)"
		else
			echo "$ENV_FILE already has DATABASE_URL; leaving as-is"
		fi
	else
		cat >"$ENV_FILE" <<EOF
DATABASE_URL=$DEFAULT_DB_URL
EOF
		echo "Created $ENV_FILE with DATABASE_URL=$DEFAULT_DB_URL"
	fi
}

main() {
	ensure_env

	echo "Installing npm dependencies..."
	npm install

	echo "Applying Prisma migrations (creates local SQLite DB if missing)..."
	npx prisma migrate dev --name init --skip-seed

	echo "All set. Start the dev server with: npm run dev"
}

main "$@"
