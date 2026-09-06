"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding for JobAlert...');
    // 1. Locations (Indian States & UTs + All India)
    const locationsData = [
        { stateCode: 'ALL_INDIA', stateName: 'All India', cityDistrict: null, isAllIndia: true },
        { stateCode: 'DL', stateName: 'Delhi', cityDistrict: 'New Delhi', isAllIndia: false },
        { stateCode: 'UP', stateName: 'Uttar Pradesh', cityDistrict: 'Lucknow', isAllIndia: false },
        { stateCode: 'BR', stateName: 'Bihar', cityDistrict: 'Patna', isAllIndia: false },
        { stateCode: 'MH', stateName: 'Maharashtra', cityDistrict: 'Mumbai', isAllIndia: false },
        { stateCode: 'RJ', stateName: 'Rajasthan', cityDistrict: 'Jaipur', isAllIndia: false },
        { stateCode: 'MP', stateName: 'Madhya Pradesh', cityDistrict: 'Bhopal', isAllIndia: false },
        { stateCode: 'KA', stateName: 'Karnataka', cityDistrict: 'Bengaluru', isAllIndia: false },
        { stateCode: 'TN', stateName: 'Tamil Nadu', cityDistrict: 'Chennai', isAllIndia: false },
        { stateCode: 'WB', stateName: 'West Bengal', cityDistrict: 'Kolkata', isAllIndia: false },
        { stateCode: 'TS', stateName: 'Telangana', cityDistrict: 'Hyderabad', isAllIndia: false },
        { stateCode: 'HR', stateName: 'Haryana', cityDistrict: 'Panchkula', isAllIndia: false },
        { stateCode: 'PB', stateName: 'Punjab', cityDistrict: 'Chandigarh', isAllIndia: false },
        { stateCode: 'GJ', stateName: 'Gujarat', cityDistrict: 'Gandhinagar', isAllIndia: false },
        { stateCode: 'OD', stateName: 'Odisha', cityDistrict: 'Bhubaneswar', isAllIndia: false },
        { stateCode: 'JH', stateName: 'Jharkhand', cityDistrict: 'Ranchi', isAllIndia: false },
        { stateCode: 'UK', stateName: 'Uttarakhand', cityDistrict: 'Dehradun', isAllIndia: false },
        { stateCode: 'AS', stateName: 'Assam', cityDistrict: 'Guwahati', isAllIndia: false },
        { stateCode: 'KL', stateName: 'Kerala', cityDistrict: 'Thiruvananthapuram', isAllIndia: false },
        { stateCode: 'AP', stateName: 'Andhra Pradesh', cityDistrict: 'Amaravati', isAllIndia: false },
    ];
    for (const loc of locationsData) {
        const existing = await prisma.location.findFirst({
            where: { stateCode: loc.stateCode, cityDistrict: loc.cityDistrict }
        });
        if (!existing) {
            await prisma.location.create({ data: loc });
        }
    }
    console.log('✅ Indian Locations seeded.');
    const allIndiaLoc = await prisma.location.findFirst({ where: { stateCode: 'ALL_INDIA' } });
    const upLoc = await prisma.location.findFirst({ where: { stateCode: 'UP' } });
    const brLoc = await prisma.location.findFirst({ where: { stateCode: 'BR' } });
    const kaLoc = await prisma.location.findFirst({ where: { stateCode: 'KA' } });
    // 2. Organizations
    const orgsData = [
        { shortName: 'UPSC', name: 'Union Public Service Commission', websiteUrl: 'https://upsc.gov.in', logoUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=128&q=80' },
        { shortName: 'SSC', name: 'Staff Selection Commission', websiteUrl: 'https://ssc.gov.in', logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&q=80' },
        { shortName: 'IBPS', name: 'Institute of Banking Personnel Selection', websiteUrl: 'https://ibps.in', logoUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=128&q=80' },
        { shortName: 'SBI', name: 'State Bank of India', websiteUrl: 'https://sbi.co.in/careers', logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=128&q=80' },
        { shortName: 'RRB', name: 'Railway Recruitment Control Board', websiteUrl: 'https://indianrailways.gov.in', logoUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=128&q=80' },
        { shortName: 'ARMY', name: 'Indian Army Recruitment Directorate', websiteUrl: 'https://joinindianarmy.nic.in', logoUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=128&q=80' },
        { shortName: 'UPPSC', name: 'Uttar Pradesh Public Service Commission', websiteUrl: 'https://uppsc.up.nic.in', logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&q=80' },
        { shortName: 'BPSC', name: 'Bihar Public Service Commission', websiteUrl: 'https://bpsc.bih.nic.in', logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&q=80' },
        { shortName: 'CBSE_TET', name: 'Central Teacher Eligibility Test (CTET)', websiteUrl: 'https://ctet.nic.in', logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&q=80' },
        { shortName: 'TCS', name: 'Tata Consultancy Services - National Qualifier Test', websiteUrl: 'https://www.tcs.com/careers', logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&q=80' },
        { shortName: 'INFOSYS', name: 'Infosys Springboard & Specialist Programmer', websiteUrl: 'https://www.infosys.com/careers', logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&q=80' },
    ];
    const orgMap = {};
    for (const org of orgsData) {
        const upserted = await prisma.organization.upsert({
            where: { shortName: org.shortName },
            update: org,
            create: org,
        });
        orgMap[org.shortName] = upserted.id;
    }
    console.log('✅ Recruitment Organizations seeded.');
    // 3. Realistic Job Listings with varying deadlines (Urgent <24h, 3 days, 15 days)
    const now = new Date();
    const closingIn18h = new Date(now.getTime() + 18 * 60 * 60 * 1000);
    const closingIn36h = new Date(now.getTime() + 36 * 60 * 60 * 1000);
    const closingIn3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const closingIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const closingIn20Days = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
    const sampleJobs = [
        {
            title: 'UPSC Civil Services (Preliminary) Examination 2026',
            slug: 'upsc-civil-services-preliminary-2026',
            notificationNumber: '05/2026-CSP',
            organizationId: orgMap['UPSC'],
            category: 'CENTRAL_GOVT',
            minEducation: 'GRADUATE',
            locationId: allIndiaLoc?.id,
            totalVacancies: 1105,
            salaryMin: 56100,
            salaryMax: 250000,
            postDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            deadline: closingIn18h, // Closing within 24 hours!
            examDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://upsconline.nic.in',
            officialPdfUrl: 'https://upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl.pdf',
            rawContentSummary: 'Recruitment for Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS) and Central Group A & B services. Minimum age 21 years. Degree from recognized university required.',
            isActive: true,
        },
        {
            title: 'SSC Combined Graduate Level (CGL) Examination 2026',
            slug: 'ssc-cgl-examination-2026',
            notificationNumber: 'F.No. 3/1/2026-P&P-I',
            organizationId: orgMap['SSC'],
            category: 'CENTRAL_GOVT',
            minEducation: 'GRADUATE',
            locationId: allIndiaLoc?.id,
            totalVacancies: 17727,
            salaryMin: 44900,
            salaryMax: 142400,
            postDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            deadline: closingIn36h, // Closing soon!
            examDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://ssc.gov.in/candidate-portal/one-time-registration',
            officialPdfUrl: 'https://ssc.gov.in/api/attachment/notice_cgl_2026.pdf',
            rawContentSummary: 'Staff Selection Commission invites applications for Inspector, Sub-Inspector, Auditor, Tax Assistant, and Assistant Section Officer posts across ministries. Tier-1 Computer Based Examination scheduled soon.',
            isActive: true,
        },
        {
            title: 'SBI Probationary Officers (PO) Recruitment 2026',
            slug: 'sbi-po-recruitment-2026',
            notificationNumber: 'CRPD/PO/2026-27/01',
            organizationId: orgMap['SBI'],
            category: 'BANKING',
            minEducation: 'GRADUATE',
            locationId: allIndiaLoc?.id,
            totalVacancies: 2000,
            salaryMin: 41960,
            salaryMax: 65000,
            postDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            deadline: closingIn3Days,
            examDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://sbi.co.in/web/careers/current-openings',
            officialPdfUrl: 'https://sbi.co.in/documents/crpd-po-2026.pdf',
            rawContentSummary: 'State Bank of India recruitment for 2,000 Probationary Officers. Any degree holder aged 21-30 years can apply. Comprehensive training and fast-track career progression provided.',
            isActive: true,
        },
        {
            title: 'RRB Non-Technical Popular Categories (NTPC) Recruitment',
            slug: 'rrb-ntpc-recruitment-2026',
            notificationNumber: 'CEN 03/2026',
            organizationId: orgMap['RRB'],
            category: 'RAILWAYS',
            minEducation: 'TWELFTH_PASS',
            locationId: allIndiaLoc?.id,
            totalVacancies: 11558,
            salaryMin: 19900,
            salaryMax: 63200,
            postDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            deadline: closingIn7Days,
            examDate: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000),
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://www.rrbapply.gov.in',
            officialPdfUrl: 'https://indianrailways.gov.in/rrb/ntpc_cen03_2026.pdf',
            rawContentSummary: 'Railway Recruitment Boards invite applications for Junior Clerk, Accounts Clerk, Commercial cum Ticket Clerk, Goods Train Manager, and Senior Commercial Clerk. Open for 12th Pass and Graduates.',
            isActive: true,
        },
        {
            title: 'Indian Army Technical Graduate Course (TGC-141)',
            slug: 'indian-army-tgc-141-recruitment',
            notificationNumber: 'TGC-141/JULY-2026',
            organizationId: orgMap['ARMY'],
            category: 'DEFENCE',
            minEducation: 'GRADUATE', // Engineering degree
            locationId: allIndiaLoc?.id,
            totalVacancies: 40,
            salaryMin: 56100,
            salaryMax: 177500,
            postDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
            deadline: closingIn3Days,
            examDate: null,
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://joinindianarmy.nic.in',
            officialPdfUrl: 'https://joinindianarmy.nic.in/writereaddata/Portal/Notification/TGC141.pdf',
            rawContentSummary: 'Permanent Commission in the Indian Army for Engineering graduates. Streams include Civil, Mechanical, Computer Science, and Electrical Engineering. No written exam; shortlisting based on engineering cut-off followed by SSB.',
            isActive: true,
        },
        {
            title: 'UPPSC Combined State / Upper Subordinate Services (PCS) 2026',
            slug: 'uppsc-pcs-examination-2026',
            notificationNumber: 'A-1/E-1/2026',
            organizationId: orgMap['UPPSC'],
            category: 'STATE_GOVT',
            minEducation: 'GRADUATE',
            locationId: upLoc?.id,
            totalVacancies: 384,
            salaryMin: 56100,
            salaryMax: 177500,
            postDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            deadline: closingIn20Days,
            examDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://uppsc.up.nic.in',
            officialPdfUrl: 'https://uppsc.up.nic.in/notices/pcs_2026_advt.pdf',
            rawContentSummary: 'Uttar Pradesh Public Service Commission notice for Sub Divisional Magistrate (SDM), Deputy SP, Block Development Officer (BDO), and ARTO posts. Domicile relaxations as per UP govt rules.',
            isActive: true,
        },
        {
            title: 'BPSC 70th Integrated Combined Competitive Examination',
            slug: 'bpsc-70th-cce-recruitment',
            notificationNumber: 'Advt No. 25/2026',
            organizationId: orgMap['BPSC'],
            category: 'STATE_GOVT',
            minEducation: 'GRADUATE',
            locationId: brLoc?.id,
            totalVacancies: 1957,
            salaryMin: 53100,
            salaryMax: 167800,
            postDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            deadline: closingIn7Days,
            examDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://bpsc.bih.nic.in',
            officialPdfUrl: 'https://bpsc.bih.nic.in/Advt/NB-2026-70CCE.pdf',
            rawContentSummary: 'Bihar Public Service Commission 70th CCE for administrative, police, and financial services in Bihar state cadre. Preliminary examination followed by written mains.',
            isActive: true,
        },
        {
            title: 'Central Teacher Eligibility Test (CTET) July 2026',
            slug: 'ctet-examination-july-2026',
            notificationNumber: 'CBSE/CTET/JULY-2026',
            organizationId: orgMap['CBSE_TET'],
            category: 'TEACHING',
            minEducation: 'DIPLOMA', // D.El.Ed / B.Ed
            locationId: allIndiaLoc?.id,
            totalVacancies: null,
            salaryMin: 35400,
            salaryMax: 112400,
            postDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
            deadline: closingIn7Days,
            examDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
            sourceType: 'SCRAPER',
            officialSourceUrl: 'https://ctet.nic.in',
            officialPdfUrl: 'https://ctet.nic.in/documents/information_bulletin_2026.pdf',
            rawContentSummary: 'Eligibility certificate exam for appointment as teacher for Classes I to VIII in KVS, NVS, Central Schools, and CBSE-affiliated institutions nationwide.',
            isActive: true,
        },
        {
            title: 'TCS National Qualifier Test (NQT) - Off-Campus Freshers Drive',
            slug: 'tcs-nqt-freshers-hiring-2026',
            notificationNumber: 'NQT-BATCH-2025-2026',
            organizationId: orgMap['TCS'],
            category: 'PRIVATE',
            minEducation: 'GRADUATE',
            locationId: kaLoc?.id,
            totalVacancies: 15000,
            salaryMin: 350000,
            salaryMax: 900000, // Annual CTC
            salaryCurrency: 'INR/yr',
            postDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            deadline: closingIn20Days,
            examDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            sourceType: 'API',
            officialSourceUrl: 'https://www.tcs.com/careers/india/tcs-fresher-hiring',
            officialPdfUrl: null,
            rawContentSummary: 'Multi-level hiring for Ninja (3.36 LPA), Digital (7 LPA), and Prime (9 LPA) software developer roles. Open for B.Tech/B.E/MCA/M.Sc batches of 2025 and 2026.',
            isActive: true,
        }
    ];
    for (const job of sampleJobs) {
        await prisma.job.upsert({
            where: { slug: job.slug },
            update: job,
            create: job,
        });
    }
    console.log(`✅ Seeded ${sampleJobs.length} active recruitment notifications.`);
    // 4. Crawler Sources
    const crawlerSources = [
        {
            name: 'UPSC Official Gazette Scraper',
            baseUrl: 'https://upsc.gov.in/recruitment/active-examinations',
            parserType: 'CHEERIO',
            scheduleCron: '0 */2 * * *',
            lastRunAt: new Date(now.getTime() - 30 * 60 * 1000),
            lastSuccessAt: new Date(now.getTime() - 30 * 60 * 1000),
            status: 'HEALTHY',
            itemsFound: 8,
            errorMessage: null,
        },
        {
            name: 'SSC Notice Board Scraper',
            baseUrl: 'https://ssc.gov.in/api/notices',
            parserType: 'CHEERIO',
            scheduleCron: '0 */2 * * *',
            lastRunAt: new Date(now.getTime() - 45 * 60 * 1000),
            lastSuccessAt: new Date(now.getTime() - 45 * 60 * 1000),
            status: 'HEALTHY',
            itemsFound: 12,
            errorMessage: null,
        },
        {
            name: 'IBPS Banking Recruitment Monitor',
            baseUrl: 'https://www.ibps.in',
            parserType: 'CHEERIO',
            scheduleCron: '0 */4 * * *',
            lastRunAt: new Date(now.getTime() - 60 * 60 * 1000),
            lastSuccessAt: new Date(now.getTime() - 60 * 60 * 1000),
            status: 'HEALTHY',
            itemsFound: 4,
            errorMessage: null,
        },
        {
            name: 'Adzuna Private Jobs API',
            baseUrl: 'https://api.adzuna.com/v1/api/jobs/in/search',
            parserType: 'API',
            scheduleCron: '0 */6 * * *',
            lastRunAt: new Date(now.getTime() - 15 * 60 * 1000),
            lastSuccessAt: new Date(now.getTime() - 15 * 60 * 1000),
            status: 'HEALTHY',
            itemsFound: 45,
            errorMessage: null,
        }
    ];
    for (const cs of crawlerSources) {
        await prisma.crawlerSource.upsert({
            where: { name: cs.name },
            update: cs,
            create: cs,
        });
    }
    console.log('✅ Crawler Sources registered.');
    console.log('🎉 Database seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
