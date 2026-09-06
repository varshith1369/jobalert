import { JobService } from '../services/job.service.js';
const jobService = new JobService();
export class JobController {
    async getJobs(req, res) {
        try {
            const { category, minEducation, stateCode, search, closingSoon, page, limit } = req.query;
            const result = await jobService.getJobs({
                category: category,
                minEducation: minEducation,
                stateCode: stateCode,
                search: search,
                closingSoon: closingSoon,
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 15,
            });
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch jobs', details: err.message });
        }
    }
    async getJobById(req, res) {
        try {
            const id = req.params.id;
            const job = await jobService.getJobById(id);
            if (!job) {
                res.status(404).json({ error: 'Job notification not found' });
                return;
            }
            res.json(job);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch job details', details: err.message });
        }
    }
    async getStats(_req, res) {
        try {
            const stats = await jobService.getStats();
            res.json(stats);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to calculate stats', details: err.message });
        }
    }
    async getCalendar(_req, res) {
        try {
            const events = await jobService.getCalendarEvents();
            res.json(events);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch calendar events', details: err.message });
        }
    }
    async getFilters(_req, res) {
        try {
            const filters = await jobService.getFilterOptions();
            res.json(filters);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to fetch filter options', details: err.message });
        }
    }
}
