export type JobCategory = 
  | 'CENTRAL_GOVT' 
  | 'STATE_GOVT' 
  | 'BANKING' 
  | 'DEFENCE' 
  | 'TEACHING' 
  | 'RAILWAYS' 
  | 'PRIVATE';

export type EducationLevel = 
  | 'EIGHTH_PASS' 
  | 'TENTH_PASS' 
  | 'TWELFTH_PASS' 
  | 'DIPLOMA' 
  | 'GRADUATE' 
  | 'POST_GRADUATE';

export interface RawScrapedJob {
  title: string;
  orgShortName: string;
  orgName?: string;
  category: JobCategory;
  minEducation: EducationLevel;
  stateCode?: string;
  notificationNumber?: string;
  totalVacancies?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  postDate: Date;
  deadline: Date;
  examDate?: Date;
  officialSourceUrl: string;
  officialPdfUrl?: string;
  rawContentSummary: string;
}

export interface JobFilterQuery {
  category?: string;
  minEducation?: string;
  stateCode?: string;
  search?: string;
  closingSoon?: '24h' | '3d' | '7d';
  page?: number;
  limit?: number;
}
