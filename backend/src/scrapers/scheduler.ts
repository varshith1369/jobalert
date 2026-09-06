import cron from 'node-cron';
import { UPSCScraper } from './upsc.scraper.js';
import { SSCScraper } from './ssc.scraper.js';
import { AdzunaClient } from './adzuna.client.js';
import { Normalizer } from './normalizer.js';

export class IngestionScheduler {
  private upsc = new UPSCScraper();
  private ssc = new SSCScraper();
  private adzuna = new AdzunaClient();

  public async runAllScrapers(): Promise<void> {
    console.log('⏰ [Scheduler] Triggering on-demand ingestion run across all sources...');
    
    // Run scrapers with automatic retry and telemetry
    const [upscJobs, sscJobs, adzunaJobs] = await Promise.all([
      this.upsc.runWithRetry(2),
      this.ssc.runWithRetry(2),
      this.adzuna.runWithRetry(2),
    ]);

    const allExtracted = [...upscJobs, ...sscJobs, ...adzunaJobs];
    console.log(`📥 [Scheduler] Ingesting ${allExtracted.length} total extracted jobs...`);

    const result = await Normalizer.ingestJobs(allExtracted);
    console.log(`✅ [Scheduler] Ingestion complete: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`);
  }

  public initCrons(): void {
    console.log('🚀 [Scheduler] Initializing automated background cron tasks...');

    // Run UPSC/SSC check every 2 hours during day (10am - 8pm)
    cron.schedule('0 */2 * * *', async () => {
      console.log('⏰ [Cron] Running UPSC and SSC scrapers...');
      const [upsc, ssc] = await Promise.all([this.upsc.runWithRetry(), this.ssc.runWithRetry()]);
      await Normalizer.ingestJobs([...upsc, ...ssc]);
    });

    // Run Adzuna private API every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ [Cron] Running Adzuna private jobs ingestion...');
      const jobs = await this.adzuna.runWithRetry();
      await Normalizer.ingestJobs(jobs);
    });

    console.log('✅ [Scheduler] Crons scheduled.');
  }
}
