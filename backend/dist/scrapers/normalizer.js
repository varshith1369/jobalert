import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class Normalizer {
    static slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    static detectEducation(text) {
        const lower = text.toLowerCase();
        if (lower.includes('post graduate') || lower.includes('phd') || lower.includes('m.tech') || lower.includes('mca') || lower.includes('md') || lower.includes('ms')) {
            return 'POST_GRADUATE';
        }
        if (lower.includes('degree') || lower.includes('graduate') || lower.includes('b.tech') || lower.includes('b.e') || lower.includes('b.sc') || lower.includes('b.com') || lower.includes('ba') || lower.includes('bachelor')) {
            return 'GRADUATE';
        }
        if (lower.includes('diploma') || lower.includes('polytechnic') || lower.includes('iti') || lower.includes('d.el.ed')) {
            return 'DIPLOMA';
        }
        if (lower.includes('12th') || lower.includes('intermediate') || lower.includes('higher secondary') || lower.includes('10+2')) {
            return 'TWELFTH_PASS';
        }
        if (lower.includes('10th') || lower.includes('matric') || lower.includes('sslc')) {
            return 'TENTH_PASS';
        }
        if (lower.includes('8th') || lower.includes('eighth')) {
            return 'EIGHTH_PASS';
        }
        return 'GRADUATE'; // Default baseline
    }
    static detectCategory(orgShortName, title) {
        const combined = `${orgShortName} ${title}`.toLowerCase();
        if (combined.includes('bank') || combined.includes('sbi') || combined.includes('ibps') || combined.includes('rbi') || combined.includes('nabard')) {
            return 'BANKING';
        }
        if (combined.includes('army') || combined.includes('navy') || combined.includes('air force') || combined.includes('defence') || combined.includes('nda') || combined.includes('cds') || combined.includes('afcat')) {
            return 'DEFENCE';
        }
        if (combined.includes('railway') || combined.includes('rrb') || combined.includes('ntpc')) {
            return 'RAILWAYS';
        }
        if (combined.includes('teacher') || combined.includes('tet') || combined.includes('ctet') || combined.includes('kvs') || combined.includes('nvs') || combined.includes('prt') || combined.includes('tgt') || combined.includes('pgt')) {
            return 'TEACHING';
        }
        if (combined.includes('psc') || combined.includes('state') || combined.includes('police') || combined.includes('patwari')) {
            return 'STATE_GOVT';
        }
        if (combined.includes('tcs') || combined.includes('infosys') || combined.includes('wipro') || combined.includes('engineer') || combined.includes('developer') || combined.includes('private')) {
            return 'PRIVATE';
        }
        return 'CENTRAL_GOVT';
    }
    static async ingestJobs(rawJobs) {
        let added = 0;
        let updated = 0;
        let skipped = 0;
        for (const raw of rawJobs) {
            try {
                // 1. Resolve or create organization
                let org = await prisma.organization.findUnique({
                    where: { shortName: raw.orgShortName },
                });
                if (!org) {
                    org = await prisma.organization.create({
                        data: {
                            shortName: raw.orgShortName,
                            name: raw.orgName || raw.orgShortName,
                            websiteUrl: raw.officialSourceUrl,
                        }
                    });
                }
                // 2. Resolve location
                let locationId = null;
                if (raw.stateCode) {
                    const loc = await prisma.location.findFirst({
                        where: { stateCode: raw.stateCode },
                    });
                    if (loc)
                        locationId = loc.id;
                }
                if (!locationId) {
                    const allIndia = await prisma.location.findFirst({ where: { stateCode: 'ALL_INDIA' } });
                    locationId = allIndia?.id || null;
                }
                // 3. Generate clean slug
                const baseSlug = this.slugify(`${raw.orgShortName}-${raw.title}`);
                const slug = baseSlug.length > 200 ? baseSlug.substring(0, 200) : baseSlug;
                // 4. Check for existing job (Deduplication)
                const existingJob = await prisma.job.findFirst({
                    where: {
                        OR: [
                            { slug },
                            {
                                organizationId: org.id,
                                title: raw.title,
                            }
                        ]
                    }
                });
                if (existingJob) {
                    // Update deadline or URLs if modified
                    await prisma.job.update({
                        where: { id: existingJob.id },
                        data: {
                            deadline: raw.deadline,
                            officialSourceUrl: raw.officialSourceUrl,
                            officialPdfUrl: raw.officialPdfUrl || existingJob.officialPdfUrl,
                            rawContentSummary: raw.rawContentSummary,
                            isActive: true,
                        }
                    });
                    updated++;
                }
                else {
                    // Insert fresh job
                    await prisma.job.create({
                        data: {
                            organizationId: org.id,
                            title: raw.title,
                            slug,
                            notificationNumber: raw.notificationNumber || null,
                            category: raw.category,
                            minEducation: raw.minEducation,
                            locationId,
                            totalVacancies: raw.totalVacancies || null,
                            salaryMin: raw.salaryMin || null,
                            salaryMax: raw.salaryMax || null,
                            salaryCurrency: raw.salaryCurrency || 'INR',
                            postDate: raw.postDate,
                            deadline: raw.deadline,
                            examDate: raw.examDate || null,
                            sourceType: 'SCRAPER',
                            officialSourceUrl: raw.officialSourceUrl,
                            officialPdfUrl: raw.officialPdfUrl || null,
                            rawContentSummary: raw.rawContentSummary,
                            isActive: true,
                        }
                    });
                    added++;
                }
            }
            catch (err) {
                console.error(`[Normalizer] Error processing job '${raw.title}':`, err.message);
                skipped++;
            }
        }
        return { added, updated, skipped };
    }
}
