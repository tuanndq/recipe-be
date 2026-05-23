import dataSource from './data-source';

async function runMigrations(): Promise<void> {
  await dataSource.initialize();
  const executed = await dataSource.runMigrations();
  if (executed.length === 0) {
    console.log('No pending migrations.');
  } else {
    executed.forEach((m) => console.log(`Applied migration: ${m.name}`));
  }
}

runMigrations()
  .then(() => dataSource.destroy())
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
