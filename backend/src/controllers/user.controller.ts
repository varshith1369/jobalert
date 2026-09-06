import { Response } from 'express';
import { UserService } from '../services/user.service.js';
import { NotificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const userService = new UserService();
const notificationService = new NotificationService();

export class UserController {
  async getPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const prefs = await userService.getPreferences(userId);
      res.json(prefs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const updated = await userService.updatePreferences(userId, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async toggleSaveJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { jobId } = req.body;
      if (!userId || !jobId) {
        res.status(400).json({ error: 'Job ID required' });
        return;
      }
      const result = await userService.toggleSaveJob(userId, jobId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateJobStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { jobId, status } = req.body;
      if (!userId || !jobId || !status) {
        res.status(400).json({ error: 'Job ID and status required' });
        return;
      }
      const result = await userService.updateJobStatus(userId, jobId, status);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getInteractions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const interactions = await userService.getUserInteractions(userId);
      res.json(interactions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async testEmailDigest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const digest = await notificationService.generateDailyDigest(userId);
      res.json({ message: 'Daily digest preview generated', digest });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
