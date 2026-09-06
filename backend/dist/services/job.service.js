import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class JobService {
    async getJobs(filters) {
        const { category, minEducation, stateCode, search, closingSoon, page = 1, limit = 15 } = filters;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
        };
        if (category && category !== 'ALL') {
            where.category = category;
        }
        if (minEducation && minEducation !== 'ALL') {
            where.minEducation = minEducation;
        }
        if (stateCode && stateCode !== 'ALL') {
            where.location = {
                stateCode: stateCode,
            };
        }
        if (search && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { title: { contains: q } },
                { rawContentSummary: { contains: q } },
                { organization: { name: { contains: q } } },
                { organization: { shortName: { contains: q } } },
            ];
        }
        const now = new Date();
        if (closingSoon === '24h') {
            where.deadline = {
                gte: now,
                lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            };
        }
        else if (closingSoon === '3d') {
            where.deadline = {
                gte: now,
                lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            };
        }
        else if (closingSoon === '7d') {
            where.deadline = {
                gte: now,
                lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            };
        }
        // Default sorting: urgent deadlines first, then latest posted
        const [total, jobs] = await Promise.all([
            prisma.job.count({ where }),
            prisma.job.findMany({
                where,
                include: {
                    organization: true,
                    location: true,
                },
                orderBy: [
                    { deadline: 'asc' },
                    { postDate: 'desc' },
                ],
                skip,
                take: limit,
            }),
        ]);
        return {
            jobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getJobById(id) {
        return prisma.job.findUnique({
            where: { id },
            include: {
                organization: true,
                location: true,
            },
        });
    }
    async getStats() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const [totalActive, newToday, closing24h, closing3d] = await Promise.all([
            prisma.job.count({ where: { isActive: true } }),
            prisma.job.count({ where: { isActive: true, postDate: { gte: oneDayAgo } } }),
            prisma.job.count({ where: { isActive: true, deadline: { gte: now, lte: in24h } } }),
            prisma.job.count({ where: { isActive: true, deadline: { gte: now, lte: in3Days } } }),
        ]);
        return {
            totalActive,
            newToday,
            closing24h,
            closing3d,
        };
    }
    async getCalendarEvents() {
        const jobs = await prisma.job.findMany({
            where: { isActive: true },
            include: { organization: true },
            orderBy: { deadline: 'asc' },
        });
        const events = [];
        for (const job of jobs) {
            events.push({
                id: `${job.id}-deadline`,
                jobId: job.id,
                title: `${job.organization.shortName}: Application Deadline`,
                orgShortName: job.organization.shortName,
                category: job.category,
                date: job.deadline,
                eventType: 'DEADLINE',
                officialSourceUrl: job.officialSourceUrl,
            });
            if (job.examDate) {
                events.push({
                    id: `${job.id}-exam`,
                    jobId: job.id,
                    title: `${job.organization.shortName}: Examination Date`,
                    orgShortName: job.organization.shortName,
                    category: job.category,
                    date: job.examDate,
                    eventType: 'EXAM',
                    officialSourceUrl: job.officialSourceUrl,
                });
            }
            events.push({
                id: `${job.id}-post`,
                jobId: job.id,
                title: `${job.organization.shortName}: Notification Released`,
                orgShortName: job.organization.shortName,
                category: job.category,
                date: job.postDate,
                eventType: 'POSTED',
                officialSourceUrl: job.officialSourceUrl,
            });
        }
        return events;
    }
    async getFilterOptions() {
        const [locations, organizations] = await Promise.all([
            prisma.location.findMany({
                orderBy: { stateName: 'asc' },
            }),
            prisma.organization.findMany({
                orderBy: { shortName: 'asc' },
            }),
        ]);
        const categories = [
            { code: 'CENTRAL_GOVT', label: 'Central Government' },
            { code: 'STATE_GOVT', label: 'State Government' },
            { code: 'BANKING', label: 'Banking & Insurance' },
            { code: 'DEFENCE', label: 'Defence & Police' },
            { code: 'RAILWAYS', label: 'Railways (RRB)' },
            { code: 'TEACHING', label: 'Teaching (TET/CTET)' },
            { code: 'PRIVATE', label: 'Private Sector & IT' },
        ];
        const qualifications = [
            { code: 'EIGHTH_PASS', label: '8th Pass' },
            { code: 'TENTH_PASS', label: '10th Pass (Matric)' },
            { code: 'TWELFTH_PASS', label: '12th Pass (10+2)' },
            { code: 'DIPLOMA', label: 'Diploma / ITI' },
            { code: 'GRADUATE', label: 'Graduate (Any Degree / B.Tech)' },
            { code: 'POST_GRADUATE', label: 'Post Graduate (Masters / Ph.D)' },
        ];
        return {
            locations,
            organizations,
            categories,
            qualifications,
        };
    }
}
