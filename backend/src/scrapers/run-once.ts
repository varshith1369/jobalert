import { IngestionScheduler } from './scheduler.js';

async function run() {
  const scheduler = new IngestionScheduler();
  await scheduler.runAllScrapers();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error running scrapers:', err);
  process.exit(1);
});
