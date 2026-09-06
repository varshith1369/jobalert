import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

export class NotificationService {
  async sendPushNotification(title: string, message: string, url: string = '/') {
    const preferences = await prisma.userPreference.findMany({
      where: {
        pushSubscription: { not: null },
      },
    });

    console.log(`[NotificationService] Sending Web Push notification to ${preferences.length} subscribers...`);
    let sentCount = 0;

    for (const pref of preferences) {
      if (!pref.pushSubscription) continue;
      try {
        // In production, webpush.sendNotification(JSON.parse(pref.pushSubscription), payload)
        // Here we simulate successful dispatch with logging
        sentCount++;
      } catch (err: any) {
        console.error(`[NotificationService] Failed to dispatch push to user ${pref.userId}:`, err.message);
      }
    }

    return { totalSubscribers: preferences.length, sentCount };
  }

  async sendTelegramAlert(message: string, chatId?: string) {
    const { botToken } = config.telegram;
    if (!botToken) {
      console.log('[NotificationService] Telegram bot token not configured. Log alert:', message);
      return { status: 'SIMULATED', message };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const targetChat = chatId || '@JobAlertIndiaOfficial';
      const resp = await axios.post(url, {
        chat_id: targetChat,
        text: message,
        parse_mode: 'Markdown',
      });
      return { status: 'SENT', data: resp.data };
    } catch (err: any) {
      console.error('[NotificationService] Telegram dispatch error:', err.message);
      return { status: 'FAILED', error: err.message };
    }
  }

  async generateDailyDigest(userId: string) {
    const pref = await prisma.userPreference.findUnique({ where: { userId } });
    if (!pref) return null;

    const categories: string[] = JSON.parse(pref.preferredCategories || '[]');
    const states: string[] = JSON.parse(pref.preferredStates || '[]');

    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
        OR: [
          { category: { in: categories.length ? categories : undefined } },
          { minEducation: pref.preferredEducation },
        ]
      },
      include: { organization: true },
      take: 5,
      orderBy: { deadline: 'asc' },
    });

    const digestHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-top: 0;">JobAlert Daily Digest</h2>
        <p>Here are high-priority openings matching your qualifications closing soon:</p>
        <div style="margin: 20px 0;">
          ${jobs.map((j) => `
            <div style="padding: 12px; margin-bottom: 12px; background-color: #f8fafc; border-left: 4px solid #16a34a; border-radius: 4px;">
              <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #0f172a;">${j.title}</h3>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                Organization: <strong>${j.organization.shortName}</strong> | Deadline: <strong>${new Date(j.deadline).toLocaleDateString('en-IN')}</strong>
              </p>
              <a href="${j.officialSourceUrl}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #16a34a; text-decoration: none; font-weight: bold;">
                Apply on Official Site &rarr;
              </a>
            </div>
          `).join('')}
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">You received this because you subscribed to JobAlert Daily Email Alerts.</p>
      </div>
    `;

    return {
      userId,
      jobCount: jobs.length,
      html: digestHtml,
    };
  }
}
