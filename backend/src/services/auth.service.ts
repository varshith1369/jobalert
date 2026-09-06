import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, password: string, fullName?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
        preference: {
          create: {
            preferredEducation: 'GRADUATE',
            preferredCategories: JSON.stringify(['CENTRAL_GOVT', 'BANKING']),
            preferredStates: JSON.stringify(['ALL_INDIA']),
            emailDigestFrequency: 'DAILY',
          }
        }
      },
      include: { preference: true }
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      preferences: user.preference,
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { preference: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      preferences: user.preference,
      token,
    };
  }
}
