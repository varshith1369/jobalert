import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { IngestionScheduler } from '../scrapers/scheduler.js';

const prisma = new PrismaClient();
const scheduler = new IngestionScheduler();

export class CrawlerController {
  async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const sources = await prisma.crawlerSource.findMany({
        orderBy: { lastRunAt: 'desc' },
      });
      res.json(sources);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch crawler statuses', details: err.message });
    }
  }

  async triggerManualRun(_req: Request, res: Response): Promise<void> {
    try {
      // Trigger run asynchronously or wait for execution
      scheduler.runAllScrapers().catch(e => console.error('Background scrape failed:', e));
      res.json({ message: 'Scrapers triggered successfully in the background' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to trigger scrapers', details: err.message });
    }
  }
}
