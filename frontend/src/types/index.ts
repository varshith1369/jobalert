export interface Organization {
  id: number;
  name: string;
  shortName: string;
  websiteUrl: string;
  logoUrl?: string | null;
}

export interface Location {
  id: number;
  stateCode: string;
  stateName: string;
  cityDistrict?: string | null;
  isAllIndia: boolean;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  notificationNumber?: string | null;
  category: 'CENTRAL_GOVT' | 'STATE_GOVT' | 'BANKING' | 'DEFENCE' | 'TEACHING' | 'RAILWAYS' | 'PRIVATE';
  minEducation: 'EIGHTH_PASS' | 'TENTH_PASS' | 'TWELFTH_PASS' | 'DIPLOMA' | 'GRADUATE' | 'POST_GRADUATE';
  totalVacancies?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  postDate: string;
  deadline: string;
  examDate?: string | null;
  sourceType: string;
  officialSourceUrl: string;
  officialPdfUrl?: string | null;
  rawContentSummary: string;
  organization: Organization;
  location?: Location | null;
}

export interface JobStats {
  totalActive: number;
  newToday: number;
  closing24h: number;
  closing3d: number;
}

export interface CalendarEvent {
  id: string;
  jobId: string;
  title: string;
  orgShortName: string;
  category: string;
  date: string;
  eventType: 'DEADLINE' | 'EXAM' | 'POSTED';
  officialSourceUrl: string;
}

export interface CrawlerSource {
  id: number;
  name: string;
  baseUrl: string;
  parserType: string;
  scheduleCron: string;
  lastRunAt?: string | null;
  lastSuccessAt?: string | null;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILING';
  itemsFound: number;
  errorMessage?: string | null;
}

export interface UserPreferences {
  preferredEducation: string;
  preferredCategories: string[];
  preferredStates: string[];
  emailDigestFrequency: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string | null;
  preferences?: UserPreferences | null;
}

export interface JobInteraction {
  jobId: string;
  isSaved: boolean;
  status: string;
  job: Job;
}
