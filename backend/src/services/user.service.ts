import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async getPreferences(userId: string) {
    let pref = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await prisma.userPreference.create({
        data: {
          userId,
          preferredEducation: 'GRADUATE',
          preferredCategories: JSON.stringify(['CENTRAL_GOVT']),
          preferredStates: JSON.stringify(['ALL_INDIA']),
        }
      });
    }

    return {
      ...pref,
      preferredCategories: JSON.parse(pref.preferredCategories || '[]'),
      preferredStates: JSON.parse(pref.preferredStates || '[]'),
    };
  }

  async updatePreferences(userId: string, data: {
    preferredEducation?: string;
    preferredCategories?: string[];
    preferredStates?: string[];
    emailDigestFrequency?: string;
    pushSubscription?: any;
    telegramChatId?: string;
  }) {
    const updateData: any = {};
    if (data.preferredEducation) updateData.preferredEducation = data.preferredEducation;
    if (data.preferredCategories) updateData.preferredCategories = JSON.stringify(data.preferredCategories);
    if (data.preferredStates) updateData.preferredStates = JSON.stringify(data.preferredStates);
    if (data.emailDigestFrequency) updateData.emailDigestFrequency = data.emailDigestFrequency;
    if (data.pushSubscription) updateData.pushSubscription = JSON.stringify(data.pushSubscription);
    if (data.telegramChatId) updateData.telegramChatId = data.telegramChatId;

    const pref = await prisma.userPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      }
    });

    return {
      ...pref,
      preferredCategories: JSON.parse(pref.preferredCategories || '[]'),
      preferredStates: JSON.parse(pref.preferredStates || '[]'),
    };
  }

  async toggleSaveJob(userId: string, jobId: string) {
    const existing = await prisma.userJobInteraction.findUnique({
      where: {
        userId_jobId: { userId, jobId },
      }
    });

    if (existing) {
      const updated = await prisma.userJobInteraction.update({
        where: { userId_jobId: { userId, jobId } },
        data: { isSaved: !existing.isSaved }
      });
      return { isSaved: updated.isSaved, status: updated.status };
    } else {
      const created = await prisma.userJobInteraction.create({
        data: {
          userId,
          jobId,
          isSaved: true,
          status: 'SAVED',
        }
      });
      return { isSaved: created.isSaved, status: created.status };
    }
  }

  async updateJobStatus(userId: string, jobId: string, status: string) {
    return prisma.userJobInteraction.upsert({
      where: {
        userId_jobId: { userId, jobId },
      },
      update: { status },
      create: {
        userId,
        jobId,
        isSaved: true,
        status,
      }
    });
  }

  async getUserInteractions(userId: string) {
    return prisma.userJobInteraction.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            organization: true,
            location: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
