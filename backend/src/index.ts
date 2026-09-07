import app from './app.js';
import { config } from './config/index.js';
import { IngestionScheduler } from './scrapers/scheduler.js';

const scheduler = new IngestionScheduler();
scheduler.initCrons();

app.listen(config.port, () => {
  console.log(`🚀 JobAlert Backend running on http://localhost:${config.port}`);
});
