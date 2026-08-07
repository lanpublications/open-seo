#!/bin/sh
# Run before starting an upgraded install of this fork (README: "Upgrading this
# fork"). The Content Optimization migration gets a new number whenever
# upstream adds a migration of its own, so an install that already has the
# module's tables would stop at startup with "table content_scans already
# exists". This records the current module migration as applied, but only when
# those tables are already there. Safe to run on every upgrade.
set -e

f=$(basename "$(grep -l 'CREATE TABLE `content_scans`' drizzle/*.sql)")

pnpm exec wrangler d1 execute DB --local --command "INSERT INTO d1_migrations (name) SELECT '$f' WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'content_scans') AND NOT EXISTS (SELECT 1 FROM d1_migrations WHERE name = '$f')"

echo "Upgrade prep done. Start the app with docker compose up -d"
