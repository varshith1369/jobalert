import { Request, Response } from 'express';
import { JobService } from '../services/job.service.js';

const jobService = new JobService();

export class JobController {
  async getJobs(req: Request, res: Response): Promise<void> {
    try {
      const { category, minEducation, stateCode, search, closingSoon, page, limit } = req.query;
      const result = await jobService.getJobs({
        category: category as string,
        minEducation: minEducation as string,
        stateCode: stateCode as string,
        search: search as string,
        closingSoon: closingSoon as '24h' | '3d' | '7d',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 15,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch jobs', details: err.message });
    }
  }

  async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const job = await jobService.getJobById(id);
      if (!job) {
        res.status(404).json({ error: 'Job notification not found' });
        return;
      }
      res.json(job);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch job details', details: err.message });
    }
  }

  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await jobService.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to calculate stats', details: err.message });
    }
  }

  async getCalendar(_req: Request, res: Response): Promise<void> {
    try {
      const events = await jobService.getCalendarEvents();
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch calendar events', details: err.message });
    }
  }

  async getFilters(_req: Request, res: Response): Promise<void> {
    try {
      const filters = await jobService.getFilterOptions();
      res.json(filters);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch filter options', details: err.message });
    }
  }
}
