import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const authService = new AuthService();
const prisma = new PrismaClient();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
      }
      const data = await authService.register(email, password, fullName);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const data = await authService.login(email, password);
      res.json(data);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { preference: true },
      });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        preferences: user.preference ? {
          ...user.preference,
          preferredCategories: JSON.parse(user.preference.preferredCategories || '[]'),
          preferredStates: JSON.parse(user.preference.preferredStates || '[]'),
        } : null,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve profile', details: err.message });
    }
  }
}
