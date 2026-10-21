export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'kn' | 'ml' | 'or' | 'ur';

export interface UserProfile {
  id: string;
  name: string;
  contactType: 'mobile' | 'email';
  contactValue: string;
  state: string;
  preferredLanguage: LanguageCode;
  token: string;
  loggedInAt: string;
}

export type Sector = 
  | 'Education'
  | 'Healthcare'
  | 'Women & Child Welfare'
  | 'Agriculture'
  | 'Employment'
  | 'Skill Development'
  | 'Housing'
  | 'Disability Support'
  | 'Senior Citizens'
  | 'Financial Support'
  | 'Entrepreneurship'
  | 'Social Welfare'
  | 'Rural Development'
  | 'Urban Development'
  | 'Food & Nutrition'
  | 'Pension & Social Security'
  | 'Fisheries & Animal Husbandry'
  | 'MSME'
  | 'Tribal Welfare'
  | 'Energy & Utilities';

export interface SchemeEligibility {
  minAge?: number;
  maxAge?: number;
  gender?: 'All' | 'Female' | 'Male' | 'Transgender';
  occupations?: string[];
  maxAnnualIncome?: number; // In INR
  landholdingLimitAcres?: number;
  categories?: string[]; // General, OBC, SC, ST, EWS, Minority
  residencyState?: string; // 'All' or specific state
  requiresBplCard?: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  nameInHindi?: string;
  nameInTamil?: string;
  nameInMalayalam?: string;
  nameInOdia?: string;
  nameInUrdu?: string;
  ministry: string;
  level: 'Central' | 'State';
  states: string[]; // ['All'] or specific states
  sector: Sector;
  description: string;
  financialBenefit: string;
  eligibility: SchemeEligibility;
  documentsRequired: string[];
  applicationProcess: string[];
  officialPortalUrl: string;
  helplineNumber?: string;
  tags: string[];
  lastUpdated: string;
}

export interface CitizenProfileInput {
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  state: string;
  areaType: 'Rural' | 'Urban';
  occupation: string;
  annualIncome: number;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';
  landholdingAcres: number;
  hasBplCard: boolean;
  isStudent: boolean;
  hasDisability: boolean;
}

export interface EligibilityResult {
  scheme: Scheme;
  isEligible: boolean;
  matchScore: number; // 0 to 100
  qualifiedCriteria: string[];
  disqualifiedCriteria: string[];
  reason: string;
}
