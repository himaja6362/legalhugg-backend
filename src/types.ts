export type RiskLevel = 'Low' | 'Medium' | 'High';

export type SupportedLanguage = 'English' | 'Kannada' | 'Hindi' | 'Telugu';

export interface ImportantInformation {
  importantTerms: string[];
  obligations: string[];
  deadlines: string[];
  penalties: string[];
  paymentConditions: string[];
  terminationConditions: string[];
}

export interface DetectedRisk {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  reason: string;
  simpleExplanation: string;
  supportingEvidence: string;
  pageOrSection: string;
  category: string;
}

export interface DocumentCheckItem {
  id: string;
  type: 'missing' | 'conflicting' | 'ambiguous';
  title: string;
  description: string;
  evidenceOrContext: string;
  pageOrSection: string;
  recommendation: string;
}

export interface SensitiveItem {
  id: string;
  category: 'Aadhaar Number' | 'Phone Number' | 'Email Address' | 'Physical Address' | 'Bank Account / IFSC' | 'PAN Number' | 'Other PII';
  maskedValue: string;
  originalSnippet: string;
  pageOrSection: string;
  severity: 'High' | 'Medium';
}

export interface QAMessage {
  id: string;
  question: string;
  answer: string;
  evidence: string;
  pageOrSection: string;
  foundInDocument: boolean;
  language: SupportedLanguage;
  timestamp: string;
}

export interface TranslatedContent {
  language: SupportedLanguage;
  documentType?: string;
  summary: string;
  importantInformation: ImportantInformation;
  risks: Array<{
    id: string;
    title: string;
    reason: string;
    simpleExplanation: string;
  }>;
  documentChecks: Array<{
    id: string;
    title: string;
    description: string;
    recommendation: string;
  }>;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  userName: string;
  documentId: string;
  documentName: string;
  fileType: 'PDF' | 'DOCX' | 'TXT';
  fileSize: number;
  pageCount: number;
  wordCount: number;
  uploadDate: string;
  overallRiskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  documentType: string;
  summary: string;
  extractedText: string;
  importantInformation: ImportantInformation;
  risks: DetectedRisk[];
  missingInformation: DocumentCheckItem[];
  conflictingInformation: DocumentCheckItem[];
  ambiguousInformation: DocumentCheckItem[];
  sensitiveInformation: SensitiveItem[];
  qaHistory: QAMessage[];
  translations?: Record<string, TranslatedContent>;
}

export interface LegalSchemeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  mandatoryClauses: string[];
  commonRisks: string[];
  regulatoryFramework: string;
}

export interface ReportRecord {
  id: string;
  analysisId: string;
  documentName: string;
  generatedAt: string;
  language: SupportedLanguage;
  overallRiskScore: number;
  riskLevel: RiskLevel;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization: string;
  preferredLanguage: SupportedLanguage;
  createdAt: string;
}

