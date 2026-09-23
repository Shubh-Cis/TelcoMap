#!/bin/sh
set -e

echo "[Entrypoint] Synchronizing Prisma database schema..."
npx prisma db push --skip-generate

echo "[Entrypoint] Checking seed data status..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.site.count().then(count => {
  if (count === 0) {
    console.log('[Entrypoint] No sites found. Triggering seed...');
    process.exit(1);
  } else {
    console.log('[Entrypoint] Database populated with ' + count + ' network sites.');
    process.exit(0);
  }
}).catch((err) => {
  console.error('[Entrypoint] Check failed:', err.message);
  process.exit(1);
});
" || node dist/prisma/seed.js || true

echo "[Entrypoint] Executing backend command: $@"
exec "$@"
