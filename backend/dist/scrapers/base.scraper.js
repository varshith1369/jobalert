import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class BaseScraper {
    hashContent(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    async runWithRetry(maxRetries = 3, backoffMs = 1000) {
        let attempt = 0;
        let lastError = null;
        while (attempt < maxRetries) {
            try {
                console.log(`[Scraper: ${this.name}] Attempt ${attempt + 1}/${maxRetries} starting...`);
                const jobs = await this.scrape();
                // Update crawler status in database
                await prisma.crawlerSource.upsert({
                    where: { name: this.name },
                    update: {
                        lastRunAt: new Date(),
                        lastSuccessAt: new Date(),
                        status: 'HEALTHY',
                        itemsFound: jobs.length,
                        errorMessage: null,
                    },
                    create: {
                        name: this.name,
                        baseUrl: this.baseUrl,
                        parserType: this.parserType,
                        scheduleCron: this.scheduleCron,
                        lastRunAt: new Date(),
                        lastSuccessAt: new Date(),
                        status: 'HEALTHY',
                        itemsFound: jobs.length,
                    }
                });
                console.log(`[Scraper: ${this.name}] Successfully extracted ${jobs.length} jobs.`);
                return jobs;
            }
            catch (err) {
                attempt++;
                lastError = err;
                console.error(`[Scraper: ${this.name}] Attempt ${attempt} failed: ${err.message}`);
                if (attempt < maxRetries) {
                    await new Promise((res) => setTimeout(res, backoffMs * Math.pow(2, attempt - 1)));
                }
            }
        }
        // Mark crawler as DEGRADED or FAILING
        await prisma.crawlerSource.upsert({
            where: { name: this.name },
            update: {
                lastRunAt: new Date(),
                status: 'FAILING',
                errorMessage: lastError?.message || 'Unknown crawler error',
            },
            create: {
                name: this.name,
                baseUrl: this.baseUrl,
                parserType: this.parserType,
                scheduleCron: this.scheduleCron,
                lastRunAt: new Date(),
                status: 'FAILING',
                errorMessage: lastError?.message || 'Unknown crawler error',
            }
        });
        return [];
    }
}
