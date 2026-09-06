import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { JobController } from './controllers/job.controller.js';
import { AuthController } from './controllers/auth.controller.js';
import { UserController } from './controllers/user.controller.js';
import { CrawlerController } from './controllers/crawler.controller.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { rateLimit } from './middlewares/rate-limit.middleware.js';
import { IngestionScheduler } from './scrapers/scheduler.js';
const app = express();
// Global Middlewares
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
}));
app.use(express.json());
// Apply basic rate limiting (120 reqs/min per IP)
app.use('/api', rateLimit({ maxRequests: 120, windowMs: 60 * 1000 }));
// Instantiate Controllers
const jobController = new JobController();
const authController = new AuthController();
const userController = new UserController();
const crawlerController = new CrawlerController();
// 1. Public Job & Feed Routes
app.get('/api/jobs', (req, res) => jobController.getJobs(req, res));
app.get('/api/jobs/:id', (req, res) => jobController.getJobById(req, res));
app.get('/api/stats', (req, res) => jobController.getStats(req, res));
app.get('/api/calendar', (req, res) => jobController.getCalendar(req, res));
app.get('/api/filters', (req, res) => jobController.getFilters(req, res));
// 2. Authentication Routes
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.get('/api/auth/me', authMiddleware, (req, res) => authController.me(req, res));
// 3. User Preferences & Tracking Routes (Protected)
app.get('/api/user/preferences', authMiddleware, (req, res) => userController.getPreferences(req, res));
app.put('/api/user/preferences', authMiddleware, (req, res) => userController.updatePreferences(req, res));
app.post('/api/user/save', authMiddleware, (req, res) => userController.toggleSaveJob(req, res));
app.post('/api/user/status', authMiddleware, (req, res) => userController.updateJobStatus(req, res));
app.get('/api/user/interactions', authMiddleware, (req, res) => userController.getInteractions(req, res));
app.get('/api/user/email-digest-preview', authMiddleware, (req, res) => userController.testEmailDigest(req, res));
// 4. Web Push Subscription Handler
app.post('/api/push/subscribe', authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { subscription } = req.body;
        if (!userId || !subscription) {
            res.status(400).json({ error: 'Subscription data required' });
            return;
        }
        await userController.updatePreferences(req, res);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 5. Crawler Health & Admin Routes
app.get('/api/admin/crawlers', (req, res) => crawlerController.getStatus(req, res));
app.post('/api/admin/crawlers/run', (req, res) => crawlerController.triggerManualRun(req, res));
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), service: 'JobAlert API' });
});
// Initialize Background Ingestion Scheduler
const scheduler = new IngestionScheduler();
scheduler.initCrons();
// Start Server
app.listen(config.port, () => {
    console.log(`🚀 JobAlert Backend running on http://localhost:${config.port}`);
});
