#!/bin/sh
set -e

echo "Waiting for Redis..."
until node -e "
const redis = require('redis');
const client = redis.createClient({ socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) } });
client.connect().then(() => client.ping()).then(() => client.quit()).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done

echo "Waiting for MySQL..."
until node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}).then(c => c.ping().then(() => c.end())).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done

echo "Running database migrations..."
node dist/database/run-migrations.js

echo "Running database seed..."
node dist/database/seeds/seed.js

mkdir -p "${UPLOAD_DIR:-uploads}"

echo "Starting API..."
exec node dist/main.js
