export type JobType = 'government' | 'private' | 'exam' | 'scholarship' | 'internship';

export interface Job {
  id: string;
  title: string;
  organization: string;
  type: JobType;
  category: string;
  description: string;
  eligibility: string;
  lastDate: string;
  officialLink: string;
  pdfUrl?: string;
  salary?: string;
  vacancyCount?: number;
  tags: string[];
  createdAt: string;
  officialWebsiteUrl?: string;
  applyOnlineUrl?: string;
  syllabusPdfUrl?: string;
  notificationPdfUrl?: string;
  admitCardUrl?: string;
  resultUrl?: string;
  isActive?: boolean;
  linksMeta?: {
    officialWebsiteStatus?: 'verified' | 'unverified' | 'broken';
    applyOnlineStatus?: 'active' | 'closed' | 'upcoming' | 'broken';
    syllabusPdfStatus?: 'verified' | 'broken' | 'unavailable';
    lastChecked?: string;
  };
  aiSimplifiedExplanation?: {
    english: string;
    hindi: string;
    hinglish: string;
  };
  importantDates?: string;
  selectionProcess?: string;
  syllabus?: string;
  vacancyDetails?: string;
  statusBadge?: string;
  overview?: {
    introduction: string;
    conductingBody: string;
    jobRole: string;
    department: string;
    location: string;
    postingType: string;
  };
  vacancyData?: {
    total: number;
    categoryWise: Record<string, number>;
    trends: Array<{ year: string; count: number }>;
    analysis: string;
  };
  eligibilityData?: {
    ageLimit: { min: number; max: number };
    ageRelaxation: Record<string, string>;
    education: string;
    physical?: { height: string; chest: string; pet: string } | null;
    nationality: string;
  };
  examPattern?: {
    stages: Array<{ stage: string; marks: number; duration: string; type: string }>;
    distribution: string;
    subjectWeightage: Array<{ subject: string; questions: number; marks: number; weightage: string }>;
    negativeMarking: string;
    difficulty: string;
  };
  detailedSyllabus?: {
    subjects: Array<{ name: string; topics: string[] }>;
    importantTopics: string[];
    aiSimplifiedSyllabus: string;
    pdfDownloadUrl: string;
  };
  cutoffAnalysis?: {
    years: Array<{ year: string; general: number; obc: number; sc: number; st: number; ews: number }>;
    trendAnalysis: string;
    predictedSafeScore: number;
    difficultyComparison: string;
  };
  previousPapers?: {
    papers: Array<{ year: string; title: string; pdfUrl: string; solved: boolean; topicAnalysis: string }>;
  };
  coachingRecommendations?: {
    online: Array<{ name: string; fee: string; features: string; language: string }>;
    offline: Array<{ name: string; location: string; fee: string; features: string }>;
    budget: string;
  };
  selfStudyMaterials?: {
    books: Array<{ subject: string; title: string; author: string }>;
    youtubeChannels: string[];
    notes: string;
    ncertRecommendations: string;
    freeMockTests: Array<{ platform: string; url: string }>;
  };
  aiPrepGuide?: {
    roadmap: string;
    dailyTargets: string;
    beginnerStrategy: string;
    threeMonthPlan: string;
    sixMonthPlan: string;
    timeManagement: string;
  };
  selectionProcessFlow?: {
    steps: Array<{ name: string; description: string; type: string }>;
  };
  salaryDetails?: {
    inHand: string;
    gradePay: string;
    allowances: string[];
    promotionHierarchy: string[];
    careerGrowth: string;
  };
  competitionAnalysis?: {
    applicantsPerYear: string;
    selectionRatio: string;
    competitionLevel: string;
    successProbability: string;
  };
  regionalExplanation?: {
    regionalLanguages: Array<{ lang: string; text: string }>;
  };
  liveStatusTracker?: {
    formStatus: string;
    countdownDays: number;
    admitCardStatus: string;
    resultStatus: string;
    counselingStatus: string;
  };
  relatedExams?: {
    similar: Array<{ title: string; salary: string; qualification: string }>;
  };
}

export interface Education {
  qualification: string;
  stream?: string;
  passingYear?: string;
  percentage?: string;
  institution?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  gender?: string;
  dob?: string;
  state?: string;
  category?: string;
  education?: Education;
  skills?: string[];
  preferredJobs?: string[];
  language?: string;
  role: 'user' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
  notes?: string;
  lastActiveAt?: any;
  deviceType?: string;
  appVersion?: string;
  premium?: boolean;
  notificationPreferences?: {
    all: boolean;
    exams: boolean;
    results: boolean;
    studyAlerts?: boolean;
    coachingTriggers?: boolean;
    intensity?: 'low' | 'medium' | 'high';
    quietHoursStart?: string; // e.g., "22:00"
    quietHoursEnd?: string; // e.g., "07:00"
    language?: 'en' | 'hi' | 'hi-en';
    motivationalAlerts?: boolean;
    engagementScore?: number;
  };
  createdAt: any;
}

export interface SmartNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: 'study' | 'deadline' | 'motivation' | 'broadcast';
  timestamp: string; // ISO string or other format
  read: boolean;
  language: 'en' | 'hi' | 'hi-en';
  sentTimestamp: number;
}

export interface ChatMsg {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}
