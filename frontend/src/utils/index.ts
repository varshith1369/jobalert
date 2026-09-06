export interface UrgencyInfo {
  label: string;
  isUrgent: boolean; // < 24 hours
  level: 'red' | 'amber' | 'green' | 'expired';
  hoursLeft: number;
}

export function calculateUrgency(deadlineStr: string): UrgencyInfo {
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { label: 'Closed', isUrgent: false, level: 'expired', hoursLeft: 0 };
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);
  const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hoursLeft < 24) {
    return {
      label: `Closing in ${hoursLeft}h ${minutesLeft}m`,
      isUrgent: true,
      level: 'red',
      hoursLeft,
    };
  } else if (daysLeft <= 3) {
    return {
      label: `Closing in ${daysLeft} days`,
      isUrgent: false,
      level: 'amber',
      hoursLeft,
    };
  } else {
    return {
      label: `${daysLeft} days left`,
      isUrgent: false,
      level: 'green',
      hoursLeft,
    };
  }
}

export function formatSalary(min?: number | null, max?: number | null, currency = 'INR'): string {
  if (!min && !max) return 'As per rules';
  const formatNum = (n: number) => {
    if (currency.includes('/yr') || n >= 100000) {
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)} LPA`;
      return `₹${n.toLocaleString('en-IN')}`;
    }
    return `₹${n.toLocaleString('en-IN')}`;
  };

  if (min && max) {
    return `${formatNum(min)} - ${formatNum(max)}`;
  }
  if (min) return `From ${formatNum(min)}`;
  return `Up to ${formatNum(max!)}`;
}

export const CATEGORY_LABELS: Record<string, { en: string; hi: string; color: string }> = {
  CENTRAL_GOVT: { en: 'Central Govt', hi: 'केंद्र सरकार', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  STATE_GOVT: { en: 'State Govt', hi: 'राज्य सरकार', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  BANKING: { en: 'Banking & Finance', hi: 'बैंकिंग', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DEFENCE: { en: 'Defence & Police', hi: 'रक्षा / पुलिस', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  RAILWAYS: { en: 'Railways (RRB)', hi: 'रेलवे (RRB)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  TEACHING: { en: 'Teaching (TET)', hi: 'शिक्षक भर्ती', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  PRIVATE: { en: 'Private / IT', hi: 'प्राइवेट / आईटी', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export const EDUCATION_LABELS: Record<string, { en: string; hi: string }> = {
  EIGHTH_PASS: { en: '8th Pass', hi: '8वीं पास' },
  TENTH_PASS: { en: '10th Pass (Matric)', hi: '10वीं पास' },
  TWELFTH_PASS: { en: '12th Pass (10+2)', hi: '12वीं पास' },
  DIPLOMA: { en: 'Diploma / ITI', hi: 'डिप्लोमा / आईटीआई' },
  GRADUATE: { en: 'Graduate / B.Tech', hi: 'स्नातक / बी.टेक' },
  POST_GRADUATE: { en: 'Post Graduate / Masters', hi: 'परास्नातक' },
};

// Bilingual dictionary
export const translations = {
  en: {
    appName: 'JobAlert',
    tagline: 'Real-time Govt & Private Recruitment Engine',
    searchPlaceholder: 'Search exams (e.g. UPSC, SSC CGL, RRB, Banking)...',
    liveTicker: 'LIVE NOTIFICATIONS',
    closingIn24h: 'Closing in 24 hrs',
    newToday: 'New Today',
    totalActive: 'Active Openings',
    allCategories: 'All Categories',
    allStates: 'All India / States',
    allQualifications: 'Any Qualification',
    filterByDeadline: 'Urgency Filter',
    closingSoon24: 'Closing in 24 Hours (Urgent)',
    closingSoon3d: 'Closing in 3 Days',
    closingSoon7d: 'Closing in 7 Days',
    viewPdf: 'Official Notification PDF',
    applyNow: 'Apply on Official Site',
    saveJob: 'Save',
    saved: 'Saved',
    markApplied: 'Mark as Applied',
    applied: 'Applied',
    examCalendar: 'Exam Calendar',
    myTracker: 'My Applications',
    crawlerMonitor: 'Crawler Status',
    resetFilters: 'Reset Filters',
    vacancies: 'Vacancies',
    salary: 'Pay Scale',
    deadline: 'Last Date to Apply',
    postedOn: 'Posted',
    turnOnPush: 'Enable Push Alerts',
    pushActive: 'Push Alerts Active',
    onboardingTitle: 'Personalize Your Job Alerts in 30 Seconds',
    onboardingDesc: 'Get curated exam alerts matching your exact qualification and preferred states.',
    completeSetup: 'Save Preferences & View Jobs',
  },
  hi: {
    appName: 'जॉब अलर्ट',
    tagline: 'सरकारी व प्राइवेट भर्ती सूचना और लाइव अलर्ट',
    searchPlaceholder: 'परीक्षा खोजें (जैसे UPSC, SSC CGL, रेलवे, बैंक)...',
    liveTicker: 'लाइव सूचनाएं',
    closingIn24h: '24 घंटे में समाप्त',
    newToday: 'आज की नई भर्तियां',
    totalActive: 'सक्रिय भर्तियां',
    allCategories: 'सभी श्रेणियां',
    allStates: 'अखिल भारतीय / राज्य',
    allQualifications: 'सभी शैक्षणिक योग्यता',
    filterByDeadline: 'अंतिम तिथि फिल्टर',
    closingSoon24: '24 घंटे में समाप्त होने वाली (अति आवश्यक)',
    closingSoon3d: '3 दिनों में समाप्त',
    closingSoon7d: '7 दिनों में समाप्त',
    viewPdf: 'आधिकारिक नोटिफिकेशन PDF',
    applyNow: 'आधिकारिक पोर्टल पर आवेदन करें',
    saveJob: 'सेव करें',
    saved: 'सेव्ड',
    markApplied: 'आवेदन कर दिया',
    applied: 'आवेदित',
    examCalendar: 'परीक्षा कैलेंडर',
    myTracker: 'मेरे आवेदन',
    crawlerMonitor: 'क्रॉलर स्थिति',
    resetFilters: 'फिल्टर रीसेट करें',
    vacancies: 'कुल पद',
    salary: 'वेतनमान',
    deadline: 'आवेदन की अंतिम तिथि',
    postedOn: 'जारी तिथि',
    turnOnPush: 'पुश अलर्ट चालू करें',
    pushActive: 'पुश अलर्ट सक्रिय',
    onboardingTitle: '30 सेकंड में अपने जॉब अलर्ट सेट करें',
    onboardingDesc: 'अपनी योग्यता और पसंदीदा राज्यों के अनुसार सटीक भर्ती सूचनाएं प्राप्त करें।',
    completeSetup: 'प्राथमिकताएं सेव करें',
  }
};
