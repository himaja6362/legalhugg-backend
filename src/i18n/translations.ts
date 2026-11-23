import { SupportedLanguage } from '../types';

export interface AppTranslationDictionary {
  // Brand & Header
  appTitle: string;
  appShortTitle: string;
  languageLabel: string;
  translatingStatus: string;
  // Sidebar Navigation (All Preserved Pages)
  navWelcome: string;
  navDashboard: string;
  navAnalyze: string;
  navQA: string;
  navHistory: string;
  navReports: string;
  navSettings: string;
  navLanguageVoice: string;
  navProfile: string;
  navLogin: string;
  navLogout: string;
  // Section 15: Minimal Welcome Experience
  welcomeHeading: string;
  welcomeDescription: string;
  exploreBtn: string;
  exploreHeading: string;
  choice1Title: string;
  choice1Desc: string;
  choice1Btn: string;
  choice2Title: string;
  choice2Desc: string;
  choice2Btn: string;
  closingStatement: string;
  startAgainBtn: string;
  openMainDashboardBtn: string;
  // Dashboard Page
  dashboardHeading: string;
  dashboardSubtitle: string;
  statDocsAnalyzed: string;
  statRisksDetected: string;
  statReportsGenerated: string;
  statActiveLanguage: string;
  recentDocumentsHeading: string;
  recentAnalysesHeading: string;
  noDocumentsYetTitle: string;
  noDocumentsYetDesc: string;
  uploadFirstDocBtn: string;
  viewAnalysisBtn: string;
  downloadReportBtn: string;
  // Analyze Document Page (Upload + Full Results)
  analyzePageHeading: string;
  analyzePageSubtitle: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  selectedFileLabel: string;
  fileTypeLabel: string;
  fileSizeLabel: string;
  replaceFileBtn: string;
  removeFileBtn: string;
  startAnalysisBtn: string;
  processingStatus: string;
  ocrFallbackNotice: string;
  // Analysis Results & Findings
  executiveSummaryHeading: string;
  overallRiskScoreLabel: string;
  overallRiskLevelLabel: string;
  lowRisk: string;
  mediumRisk: string;
  highRisk: string;
  importantTermsHeading: string;
  importantTermsSub: string;
  obligationsLabel: string;
  deadlinesLabel: string;
  penaltiesLabel: string;
  paymentConditionsLabel: string;
  terminationConditionsLabel: string;
  potentialRisksHeading: string;
  reasonLabel: string;
  explanationLabel: string;
  evidenceLabel: string;
  pageRefLabel: string;
  contradictionDetectorHeading: string;
  contradictionDetectorSub: string;
  ambiguityDetectorHeading: string;
  ambiguityDetectorSub: string;
  missingInfoHeading: string;
  missingInfoSub: string;
  recommendationLabel: string;
  sensitiveInfoHeading: string;
  sensitiveInfoSub: string;
  sensitivePrivacyWarning: string;
  externalAiNotice: string;
  revealSensitiveBtn: string;
  maskSensitiveBtn: string;
  noneFoundText: string;
  // Document Q&A Page
  qaPageHeading: string;
  qaPageSubtitle: string;
  qaSelectDocLabel: string;
  qaInputPlaceholder: string;
  qaSubmitBtn: string;
  qaSuggestedHeading: string;
  qaSuggestedQuestions: string[];
  qaSearchingStatus: string;
  qaEmptyState: string;
  qaNotEnoughInfoMsg: string;
  // Voice Output (TTS) & Voice Input (STT)
  voicePlay: string;
  voicePause: string;
  voiceResume: string;
  voiceStop: string;
  voiceUnavailableMsg: string;
  voiceMicStart: string;
  voiceMicListening: string;
  voiceMicStop: string;
  voiceMicPermissionDenied: string;
  voiceMicUnsupported: string;
  voicePrivacyNotice: string;
  // Analysis History & Reports Pages
  historyPageHeading: string;
  historyPageSubtitle: string;
  searchPlaceholder: string;
  filterAll: string;
  deleteRecordBtn: string;
  reportsPageHeading: string;
  reportsPageSubtitle: string;
  noReportsYet: string;
  reportGeneratedOn: string;
  // Settings, Profile & Privacy, and Auth Pages
  settingsPageHeading: string;
  settingsPageSubtitle: string;
  preferredLanguageSetting: string;
  voiceSettingsHeading: string;
  autoStopVoiceLabel: string;
  privacySettingsHeading: string;
  externalServiceExplanation: string;
  profilePageHeading: string;
  profilePageSubtitle: string;
  fullNameLabel: string;
  emailAddressLabel: string;
  organizationLabel: string;
  saveProfileBtn: string;
  profileSavedMsg: string;
  loginHeading: string;
  registerHeading: string;
  passwordLabel: string;
  signInBtn: string;
  createAccountBtn: string;
  switchToRegister: string;
  switchToLogin: string;
  legalDisclaimer: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, AppTranslationDictionary> = {
  English: {
    appTitle: 'AI-Powered Legal Document Risk Analysis Suite',
    appShortTitle: 'LEXORA',
    languageLabel: 'Language',
    translatingStatus: 'Translating interface & findings...',
    navWelcome: 'Welcome',
    navDashboard: 'Dashboard',
    navAnalyze: 'Analyze Document',
    navQA: 'Document Q&A',
    navHistory: 'Analysis History',
    navReports: 'Reports',
    navSettings: 'Settings',
    navLanguageVoice: 'Language & Voice Settings',
    navProfile: 'Profile & Privacy',
    navLogin: 'Login / Register',
    navLogout: 'Sign Out',
    welcomeHeading: 'Smarter Analysis.\nSafer Decisions.',
    welcomeDescription:
      'Upload. Analyze. Understand. Discover legal risks, unclear terms and inconsistencies with AI-powered document intelligence.',
    exploreBtn: 'Explore →',
    exploreHeading: 'WHAT WOULD YOU LIKE TO DO?',
    choice1Title: '01 — ANALYZE A DOCUMENT',
    choice1Desc:
      'Upload a PDF or DOCX to identify important terms, potential risks, missing information, contradictions, ambiguous statements, and sensitive personal information.',
    choice1Btn: 'Analyze Document →',
    choice2Title: '02 — ASK YOUR DOCUMENT',
    choice2Desc:
      'Ask questions about your uploaded document and get clear answers supported by its actual content.',
    choice2Btn: 'Ask a Question →',
    closingStatement: 'READ CLEARLY. DECIDE CONFIDENTLY.',
    startAgainBtn: 'Start Again',
    openMainDashboardBtn: 'Open Main Dashboard →',
    dashboardHeading: 'Legal Document Analysis Dashboard',
    dashboardSubtitle:
      'Overview of your analyzed agreements, risk summaries, recent documents, and generated compliance reports.',
    statDocsAnalyzed: 'Documents Analyzed',
    statRisksDetected: 'Potential Risks Flagged',
    statReportsGenerated: 'Generated PDF Reports',
    statActiveLanguage: 'Active Output Language',
    recentDocumentsHeading: 'Recent Documents & Risk Summaries',
    recentAnalysesHeading: 'Recent Analysis History',
    noDocumentsYetTitle: 'No Documents Analyzed Yet',
    noDocumentsYetDesc:
      'Upload a real PDF or DOCX contract to extract important terms, detect contradictions or ambiguities, and generate a downloadable PDF report.',
    uploadFirstDocBtn: 'Upload & Analyze Document →',
    viewAnalysisBtn: 'Open Analysis',
    downloadReportBtn: 'Download PDF Report',
    analyzePageHeading: 'Analyze Legal Document',
    analyzePageSubtitle:
      'Upload a real PDF (.pdf) or Microsoft Word (.docx) document. Text is extracted from paragraphs, tables, and pages with OCR fallback for scanned pages.',
    dropzoneTitle: 'Drag & drop your PDF or DOCX file here, or click to select a file',
    dropzoneSubtitle: 'Supports searchable or scanned .pdf and .docx documents up to 15 MB',
    selectedFileLabel: 'Selected Document',
    fileTypeLabel: 'Type',
    fileSizeLabel: 'Size',
    replaceFileBtn: 'Replace File',
    removeFileBtn: 'Remove File',
    startAnalysisBtn: 'Analyze Document →',
    processingStatus: 'Extracting text and analyzing clauses with AI...',
    ocrFallbackNotice: 'Includes automatic OCR fallback if scanned PDF pages are detected.',
    executiveSummaryHeading: 'Executive Document Summary',
    overallRiskScoreLabel: 'Overall Risk Score',
    overallRiskLevelLabel: 'Overall Risk Level',
    lowRisk: 'Low',
    mediumRisk: 'Medium',
    highRisk: 'High',
    importantTermsHeading: 'Important Terms, Obligations & Conditions',
    importantTermsSub: 'Extracted directly from your uploaded document',
    obligationsLabel: 'Obligations & Responsibilities',
    deadlinesLabel: 'Deadlines & Timelines',
    penaltiesLabel: 'Penalties & Liabilities',
    paymentConditionsLabel: 'Payment Conditions',
    terminationConditionsLabel: 'Termination Conditions',
    potentialRisksHeading: 'Detected Potential Risks',
    reasonLabel: 'Reason for Finding',
    explanationLabel: 'Simple Explanation',
    evidenceLabel: 'Supporting Document Evidence',
    pageRefLabel: 'Page / Section Reference',
    contradictionDetectorHeading: 'Contradiction Detector',
    contradictionDetectorSub:
      'Statements that appear inconsistent with other parts of the same document',
    ambiguityDetectorHeading: 'Ambiguity Detector',
    ambiguityDetectorSub:
      'Unclear wording that could have multiple interpretations',
    missingInfoHeading: 'Missing Information',
    missingInfoSub: 'Important clauses or details omitted from the document',
    recommendationLabel: 'Recommendation',
    sensitiveInfoHeading: 'Sensitive Personal Information Detector',
    sensitiveInfoSub:
      'Checks for Aadhaar numbers, phone numbers, email addresses, residential addresses, PAN, and bank details',
    sensitivePrivacyWarning:
      'Sensitive information detected. Check whether these details are required before uploading this document to another website.',
    externalAiNotice:
      'Privacy Notice: Uploaded documents are processed in memory and analyzed securely by the backend Hugging Face AI & NLP service solely to generate your risk report. Files are never shared with third-party websites.',
    revealSensitiveBtn: 'Reveal Original Passage',
    maskSensitiveBtn: 'Mask Sensitive Values',
    noneFoundText: 'No items detected in the uploaded document for this section.',
    qaPageHeading: 'Document Question Answering (Q&A)',
    qaPageSubtitle:
      'Ask questions about your uploaded document by typing or speaking. Answers are strictly grounded in the uploaded document text.',
    qaSelectDocLabel: 'Active Document',
    qaInputPlaceholder: 'Type or speak your question (e.g., Is there a notice period?)...',
    qaSubmitBtn: 'Ask Question',
    qaSuggestedHeading: 'Suggested Questions',
    qaSuggestedQuestions: [
      'Is there a notice period?',
      'What are the penalties or termination conditions?',
      'What are the payment terms and deadlines?',
      'Are there any conflicting or ambiguous clauses?',
      'How are disputes resolved?',
    ],
    qaSearchingStatus: 'Searching uploaded document and verifying supporting passages...',
    qaEmptyState: 'No questions asked yet for this document. Type a question or tap the microphone.',
    qaNotEnoughInfoMsg: 'The uploaded document does not contain enough information to answer this question.',
    voicePlay: 'Listen',
    voicePause: 'Pause',
    voiceResume: 'Resume',
    voiceStop: 'Stop',
    voiceUnavailableMsg: 'Voice playback for this language is currently using fallback synthesis.',
    voiceMicStart: 'Speak Question',
    voiceMicListening: 'Listening... Tap to stop',
    voiceMicStop: 'Stop Mic',
    voiceMicPermissionDenied:
      'Microphone access was denied. Please allow microphone permission in your browser settings.',
    voiceMicUnsupported:
      'Browser speech recognition is not supported in this browser. Please type your question.',
    voicePrivacyNotice:
      'Voice input uses browser speech recognition so you can review and edit recognized text before submitting.',
    historyPageHeading: 'Analysis History',
    historyPageSubtitle:
      'View previous document analyses, revisit findings, or start a new analysis without deleting saved records.',
    searchPlaceholder: 'Search by document name or type...',
    filterAll: 'All Levels',
    deleteRecordBtn: 'Delete',
    reportsPageHeading: 'Generated PDF Reports',
    reportsPageSubtitle:
      'Download official PDF compliance and risk analysis reports in your selected language.',
    noReportsYet: 'No PDF reports have been generated yet. Download a report from any analyzed document.',
    reportGeneratedOn: 'Generated on',
    settingsPageHeading: 'Application Settings',
    settingsPageSubtitle:
      'Configure your default interface & report language, voice read-aloud behavior, and privacy preferences.',
    preferredLanguageSetting: 'Default Interface & Analysis Language',
    voiceSettingsHeading: 'Voice Input & Read-Aloud Settings',
    autoStopVoiceLabel: 'Automatically stop speech when switching pages or languages (Enabled)',
    privacySettingsHeading: 'Document Processing & External AI Transparency',
    externalServiceExplanation:
      'When you analyze a document or ask a question, the extracted text is processed securely by our backend Hugging Face AI & NLP engine (using HF_TOKEN or local Hugging Face ONNX models). Raw document files are processed in memory and are never exposed publicly.',
    profilePageHeading: 'User Profile & Privacy',
    profilePageSubtitle:
      'Manage your account details, access controls, and saved document privacy.',
    fullNameLabel: 'Full Name',
    emailAddressLabel: 'Email Address',
    organizationLabel: 'College / Organization',
    saveProfileBtn: 'Save Profile Changes',
    profileSavedMsg: 'Profile updated successfully.',
    loginHeading: 'Sign In to Your Account',
    registerHeading: 'Create a New Account',
    passwordLabel: 'Password',
    signInBtn: 'Sign In',
    createAccountBtn: 'Register Account',
    switchToRegister: 'Need an account? Register here',
    switchToLogin: 'Already have an account? Sign in',
    legalDisclaimer:
      'This analysis is for informational purposes only and is not a substitute for professional legal advice.',
  },
  Kannada: {
    appTitle: 'AI ಆಧಾರಿತ ಕಾನೂನು ದಾಖಲೆ ಅಪಾಯ ವಿಶ್ಲೇಷಣಾ ವ್ಯವಸ್ಥೆ',
    appShortTitle: 'LEXORA',
    languageLabel: 'ಭಾಷೆ',
    translatingStatus: 'ಇಂಟರ್ಫೇಸ್ ಮತ್ತು ಫಲಿತಾಂಶಗಳನ್ನು ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...',
    navWelcome: 'ಸ್ವಾಗತ',
    navDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    navAnalyze: 'ದಾಖಲೆ ವಿಶ್ಲೇಷಿಸಿ',
    navQA: 'ದಾಖಲೆ ಪ್ರಶ್ನೋತ್ತರ (Q&A)',
    navHistory: 'ವಿಶ್ಲೇಷಣಾ ಇತಿಹಾಸ',
    navReports: 'ವರದಿಗಳು (Reports)',
    navSettings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    navLanguageVoice: 'ಭಾಷೆ ಮತ್ತು ಧ್ವನಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    navProfile: 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಗೌಪ್ಯತೆ',
    navLogin: 'ಲಾಗಿನ್ / ನೋಂದಣಿ',
    navLogout: 'ಸೈನ್ ಔಟ್',
    welcomeHeading: 'ಸ್ಮಾರ್ಟ್ ವಿಶ್ಲೇಷಣೆ.\nಸುರಕ್ಷಿತ ನಿರ್ಧಾರಗಳು.',
    welcomeDescription:
      'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ವಿಶ್ಲೇಷಿಸಿ. ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. AI ಸಹಾಯದಿಂದ ಕಾನೂನು ಅಪಾಯಗಳು, ಅಸ್ಪಷ್ಟ ನಿಯಮಗಳು ಮತ್ತು ವಿರೋಧಾಭಾಸಗಳನ್ನು ಗುರುತಿಸಿ.',
    exploreBtn: 'ಅನ್ವೇಷಿಸಿ →',
    exploreHeading: 'ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?',
    choice1Title: '01 — ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
    choice1Desc:
      'ಪ್ರಮುಖ ನಿಯಮಗಳು, ಸಂಭಾವ್ಯ ಅಪಾಯಗಳು, ಬಿಟ್ಟುಹೋದ ಮಾಹಿತಿ, ವಿರೋಧಾಭಾಸಗಳು ಮತ್ತು ಸೂಕ್ಷ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಗುರುತಿಸಲು PDF ಅಥವಾ DOCX ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    choice1Btn: 'ದಾಖಲೆ ವಿಶ್ಲೇಷಿಸಿ →',
    choice2Title: '02 — ನಿಮ್ಮ ದಾಖಲೆಯನ್ನು ಪ್ರಶ್ನಿಸಿ',
    choice2Desc:
      'ನಿಮ್ಮ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಸ್ಪಷ್ಟ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.',
    choice2Btn: 'ಪ್ರಶ್ನೆ ಕೇಳಿ →',
    closingStatement: 'ಸ್ಪಷ್ಟವಾಗಿ ಓದಿ. ವಿಶ್ವಾಸದಿಂದ ನಿರ್ಧರಿಸಿ.',
    startAgainBtn: 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ',
    openMainDashboardBtn: 'ಮುಖ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ →',
    dashboardHeading: 'ಕಾನೂನು ದಾಖಲೆ ವಿಶ್ಲೇಷಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    dashboardSubtitle:
      'ನಿಮ್ಮ ವಿಶ್ಲೇಷಿಸಿದ ದಾಖಲೆಗಳು, ಅಪಾಯದ ಸಾರಾಂಶಗಳು ಮತ್ತು ಪಿಡಿಎಫ್ ವರದಿಗಳ ಅವಲೋಕನ.',
    statDocsAnalyzed: 'ವಿಶ್ಲೇಷಿಸಿದ ದಾಖಲೆಗಳು',
    statRisksDetected: 'ಪತ್ತೆಯಾದ ಸಂಭಾವ್ಯ ಅಪಾಯಗಳು',
    statReportsGenerated: 'ರಚಿಸಲಾದ PDF ವರದಿಗಳು',
    statActiveLanguage: 'ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆ',
    recentDocumentsHeading: 'ಇತ್ತೀಚಿನ ದಾಖಲೆಗಳು ಮತ್ತು ಅಪಾಯದ ಸಾರಾಂಶ',
    recentAnalysesHeading: 'ಇತ್ತೀಚಿನ ವಿಶ್ಲೇಷಣಾ ಇತಿಹಾಸ',
    noDocumentsYetTitle: 'ಯಾವುದೇ ದಾಖಲೆಯನ್ನು ಇನ್ನೂ ವಿಶ್ಲೇಷಿಸಲಾಗಿಲ್ಲ',
    noDocumentsYetDesc:
      'ಪ್ರಮುಖ ನಿಯಮಗಳು ಮತ್ತು ಅಪಾಯಗಳನ್ನು ಗುರುತಿಸಲು ನೈಜ PDF ಅಥವಾ DOCX ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    uploadFirstDocBtn: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮತ್ತು ವಿಶ್ಲೇಷಿಸಿ →',
    viewAnalysisBtn: 'ವಿಶ್ಲೇಷಣೆ ನೋಡಿ',
    downloadReportBtn: 'PDF ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    analyzePageHeading: 'ಕಾನೂನು ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
    analyzePageSubtitle:
      'ನೈಜ PDF (.pdf) ಅಥವಾ Word (.docx) ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಪುಟಗಳಿಗೆ OCR ಬೆಂಬಲವಿದೆ.',
    dropzoneTitle: 'PDF ಅಥವಾ DOCX ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    dropzoneSubtitle: '.pdf ಮತ್ತು .docx ದಾಖಲೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 15 MB)',
    selectedFileLabel: 'ಆಯ್ಕೆಮಾಡಿದ ದಾಖಲೆ',
    fileTypeLabel: 'ಪ್ರಕಾರ',
    fileSizeLabel: 'ಗಾತ್ರ',
    replaceFileBtn: 'ಫೈಲ್ ಬದಲಿಸಿ',
    removeFileBtn: 'ಫೈಲ್ ತೆಗೆದುಹಾಕಿ',
    startAnalysisBtn: 'ದಾಖಲೆ ವಿಶ್ಲೇಷಿಸಿ →',
    processingStatus: 'ದಾಖಲೆಯ ಪಠ್ಯವನ್ನು ತೆಗೆದು AI ವಿಶ್ಲೇಷಣೆ ನಡೆಸಲಾಗುತ್ತಿದೆ...',
    ocrFallbackNotice: 'ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ PDF ಪುಟಗಳಿಗೆ ಸ್ವಯಂಚಾಲಿತ OCR ಸೌಲಭ್ಯವಿದೆ.',
    executiveSummaryHeading: 'ದಾಖಲೆ ವಿಶ್ಲೇಷಣಾ ಸಾರಾಂಶ',
    overallRiskScoreLabel: 'ಒಟ್ಟು ಅಪಾಯದ ಅಂಕ',
    overallRiskLevelLabel: 'ಒಟ್ಟು ಅಪಾಯದ ಮಟ್ಟ',
    lowRisk: 'ಕಡಿಮೆ (Low)',
    mediumRisk: 'ಮಧ್ಯಮ (Medium)',
    highRisk: 'ಹೆಚ್ಚು (High)',
    importantTermsHeading: 'ಪ್ರಮುಖ ನಿಯಮಗಳು ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳು',
    importantTermsSub: 'ನಿಮ್ಮ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಯಿಂದ ನೇರವಾಗಿ ತೆಗೆಯಲಾಗಿದೆ',
    obligationsLabel: 'ಜವಾಬ್ದಾರಿಗಳು',
    deadlinesLabel: 'ಗಡುವುಗಳು',
    penaltiesLabel: 'ದಂಡಗಳು',
    paymentConditionsLabel: 'ಪಾವತಿ ಷರತ್ತುಗಳು',
    terminationConditionsLabel: 'ರದ್ದತಿ ಷರತ್ತುಗಳು',
    potentialRisksHeading: 'ಪತ್ತೆಯಾದ ಸಂಭಾವ್ಯ ಅಪಾಯಗಳು',
    reasonLabel: 'ಕಾರಣ',
    explanationLabel: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಣೆ',
    evidenceLabel: 'ದಾಖಲೆಯ ಆಧಾರ ಸಾಕ್ಷ್ಯ',
    pageRefLabel: 'ಪುಟ / ವಿಭಾಗ ಉಲ್ಲೇಖ',
    contradictionDetectorHeading: 'ವಿರೋಧಾಭಾಸ ಪತ್ತೆಗಾರ (Contradiction Detector)',
    contradictionDetectorSub: 'ಒಂದೇ ದಾಖಲೆಯ ವಿವಿಧ ಭಾಗಗಳಲ್ಲಿ ಪರಸ್ಪರ ವಿರುದ್ಧವಾಗಿರುವ ಹೇಳಿಕೆಗಳು',
    ambiguityDetectorHeading: 'ಅಸ್ಪಷ್ಟತೆ ಪತ್ತೆಗಾರ (Ambiguity Detector)',
    ambiguityDetectorSub: 'ಬಹು ಅರ್ಥಗಳನ್ನು ನೀಡಬಹುದಾದ ಅಸ್ಪಷ್ಟ ಪದಗಳು',
    missingInfoHeading: 'ಬಿಟ್ಟುಹೋದ ಮಾಹಿತಿ (Missing Information)',
    missingInfoSub: 'ದಾಖಲೆಯಲ್ಲಿ ಕೈಬಿಡಲಾದ ಪ್ರಮುಖ ನಿಯಮಗಳು',
    recommendationLabel: 'ಶಿಫಾರಸು',
    sensitiveInfoHeading: 'ಸೂಕ್ಷ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಪತ್ತೆಗಾರ',
    sensitiveInfoSub: 'ಆಧಾರ್ ಸಂಖ್ಯೆ, ಫೋನ್ ಸಂಖ್ಯೆ, ಇಮೇಲ್, ವಿಳಾಸ ಮತ್ತು ಬ್ಯಾಂಕ್ ವಿವರಗಳ ತಪಾಸಣೆ',
    sensitivePrivacyWarning:
      'ಸೂಕ್ಷ್ಮ ಮಾಹಿತಿ ಪತ್ತೆಯಾಗಿದೆ. ಈ ದಾಖಲೆಯನ್ನು ಇತರ ವೆಬ್‌ಸೈಟ್‌ಗಳಿಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮೊದಲು ಈ ವಿವರಗಳು ಅಗತ್ಯವಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
    externalAiNotice:
      'ಗೌಪ್ಯತಾ ಸೂಚನೆ: ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳನ್ನು ಕೇವಲ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಸುರಕ್ಷಿತ ಬ್ಯಾಕೆಂಡ್ AI ಸೇವೆಯ ಮೂಲಕ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ.',
    revealSensitiveBtn: 'ಮೂಲ ಪಠ್ಯ ತೋರಿಸಿ',
    maskSensitiveBtn: 'ಮಾಹಿತಿ ಮರೆಮಾಡಿ',
    noneFoundText: 'ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
    qaPageHeading: 'ದಾಖಲೆ ಪ್ರಶ್ನೋತ್ತರ (Document Q&A)',
    qaPageSubtitle:
      'ನಿಮ್ಮ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಯ ಬಗ್ಗೆ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡುವ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
    qaSelectDocLabel: 'ಸಕ್ರಿಯ ದಾಖಲೆ',
    qaInputPlaceholder: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ...',
    qaSubmitBtn: 'ಪ್ರಶ್ನೆ ಕೇಳಿ',
    qaSuggestedHeading: 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು',
    qaSuggestedQuestions: [
      'ಇದರಲ್ಲಿ ನೋಟಿಸ್ ಅವಧಿ ಇದೆಯೇ?',
      'ದಂಡಗಳು ಅಥವಾ ರದ್ದತಿ ಷರತ್ತುಗಳು ಯಾವುವು?',
      'ಪಾವತಿ ನಿಯಮಗಳು ಮತ್ತು ಗಡುವುಗಳು ಯಾವುವು?',
      'ಯಾವುದಾದರೂ ವಿರೋಧಾಭಾಸದ ಅಥವಾ ಅಸ್ಪಷ್ಟ ನಿಯಮಗಳಿವೆಯೇ?',
      'ವಿವಾದಗಳನ್ನು ಹೇಗೆ ಬಗೆಹರಿಸಲಾಗುತ್ತದೆ?',
    ],
    qaSearchingStatus: 'ದಾಖಲೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಆಧಾರಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    qaEmptyState: 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಲಾಗಿಲ್ಲ. ಮೇಲೆ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ.',
    qaNotEnoughInfoMsg: 'ಈ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಯಲ್ಲಿ ಸಾಕಷ್ಟು ಮಾಹಿತಿ ಇಲ್ಲ.',
    voicePlay: 'ಕೇಳಿ (Listen)',
    voicePause: 'ವಿರಾಮ',
    voiceResume: 'ಮುಂದುವರಿಸಿ',
    voiceStop: 'ನಿಲ್ಲಿಸಿ',
    voiceUnavailableMsg: 'ಈ ಭಾಷೆಗೆ ಧ್ವನಿ ಸೌಲಭ್ಯವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ.',
    voiceMicStart: 'ಮಾತನಾಡಿ',
    voiceMicListening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ನಿಲ್ಲಿಸಲು ಒತ್ತಿರಿ',
    voiceMicStop: 'ಮೈಕ್ ನಿಲ್ಲಿಸಿ',
    voiceMicPermissionDenied: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್ ಪರಿಶೀಲಿಸಿ.',
    voiceMicUnsupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.',
    voicePrivacyNotice: 'ನೀವು ಮಾತನಾಡಿದ ಪಠ್ಯವನ್ನು ಸಲ್ಲಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಬಹುದು ಮತ್ತು ತಿದ್ದಬಹುದು.',
    historyPageHeading: 'ವಿಶ್ಲೇಷಣಾ ಇತಿಹಾಸ',
    historyPageSubtitle: 'ಹಿಂದೆ ವಿಶ್ಲೇಷಿಸಿದ ದಾಖಲೆಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳನ್ನು ಇಲ್ಲಿ ವೀಕ್ಷಿಸಿ.',
    searchPlaceholder: 'ದಾಖಲೆಯ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ...',
    filterAll: 'ಎಲ್ಲಾ ಮಟ್ಟಗಳು',
    deleteRecordBtn: 'ಅಳಿಸಿ',
    reportsPageHeading: 'ರಚಿಸಲಾದ PDF ವರದಿಗಳು',
    reportsPageSubtitle: 'ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆಯಲ್ಲಿ ಅಧಿಕೃತ PDF ವರದಿಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
    noReportsYet: 'ಇನ್ನೂ ಯಾವುದೇ PDF ವರದಿಗಳನ್ನು ರಚಿಸಲಾಗಿಲ್ಲ.',
    reportGeneratedOn: 'ರಚಿಸಿದ ದಿನಾಂಕ',
    settingsPageHeading: 'ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    settingsPageSubtitle: 'ಭಾಷೆ, ಧ್ವನಿ ನಿಯಂತ್ರಣ ಮತ್ತು ಗೌಪ್ಯತಾ ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
    preferredLanguageSetting: 'ಡೀಫಾಲ್ಟ್ ಭಾಷೆ',
    voiceSettingsHeading: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಮತ್ತು ಓದುವ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    autoStopVoiceLabel: 'ಪುಟ ಅಥವಾ ಭಾಷೆ ಬದಲಾಯಿಸಿದಾಗ ಧ್ವನಿಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನಿಲ್ಲಿಸಿ',
    privacySettingsHeading: 'ದಾಖಲೆ ಸಂಸ್ಕರಣೆ ಮತ್ತು AI ಗೌಪ್ಯತಾ ಮಾಹಿತಿ',
    externalServiceExplanation:
      'ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುವಾಗ ಪಠ್ಯವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಬ್ಯಾಕೆಂಡ್ AI ಸೇವೆಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಮೂಲ ಫೈಲ್ ಅನ್ನು ಶಾಶ್ವತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ.',
    profilePageHeading: 'ಬಳಕೆದಾರರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಗೌಪ್ಯತೆ',
    profilePageSubtitle: 'ನಿಮ್ಮ ಖಾತೆಯ ವಿವರಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
    fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    emailAddressLabel: 'ಇಮೇಲ್ ವಿಳಾಸ',
    organizationLabel: 'ಕಾಲೇಜು / ಸಂಸ್ಥೆ',
    saveProfileBtn: 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ',
    profileSavedMsg: 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.',
    loginHeading: 'ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    registerHeading: 'ಹೊಸ ಖಾತೆಯನ್ನು ರಚಿಸಿ',
    passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
    signInBtn: 'ಸೈನ್ ಇನ್',
    createAccountBtn: 'ನೋಂದಣಿ ಮಾಡಿ',
    switchToRegister: 'ಹೊಸ ಖಾತೆ ಬೇಕೇ? ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ',
    switchToLogin: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ',
    legalDisclaimer:
      'ಈ ವಿಶ್ಲೇಷಣೆಯು ಕೇವಲ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರವಾಗಿದ್ದು, ವೃತ್ತಿಪರ ಕಾನೂನು ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.',
  },
  Hindi: {
    appTitle: 'एआई-संचालित कानूनी दस्तावेज़ जोखिम विश्लेषण सूट',
    appShortTitle: 'LEXORA',
    languageLabel: 'भाषा',
    translatingStatus: 'इंटरफ़ेस और परिणामों का अनुवाद हो रहा है...',
    navWelcome: 'स्वागत',
    navDashboard: 'डैशबोर्ड',
    navAnalyze: 'दस्तावेज़ विश्लेषण',
    navQA: 'दस्तावेज़ प्रश्नोत्तर (Q&A)',
    navHistory: 'विश्लेषण इतिहास',
    navReports: 'रिपोर्ट्स',
    navSettings: 'सेटिंग्स',
    navLanguageVoice: 'भाषा और वॉइस सेटिंग्स',
    navProfile: 'प्रोफ़ाइल और गोपनीयता',
    navLogin: 'लॉगिन / पंजीकरण',
    navLogout: 'साइन आउट',
    welcomeHeading: 'स्मार्ट विश्लेषण।\nसुरक्षित निर्णय।',
    welcomeDescription:
      'अपलोड करें। विश्लेषण करें। समझें। एआई-संचालित दस्तावेज़ इंटेलिजेंस के साथ कानूनी जोखिमों, अस्पष्ट शर्तों और विसंगतियों को पहचानें।',
    exploreBtn: 'आगे बढ़ें →',
    exploreHeading: 'आप क्या करना चाहेंगे?',
    choice1Title: '01 — दस्तावेज़ का विश्लेषण करें',
    choice1Desc:
      'महत्वपूर्ण शर्तों, संभावित जोखिमों, अनुपलब्ध जानकारी, विरोधाभासों और संवेदनशील व्यक्तिगत जानकारी की पहचान करने के लिए PDF या DOCX अपलोड करें।',
    choice1Btn: 'दस्तावेज़ का विश्लेषण करें →',
    choice2Title: '02 — अपने दस्तावेज़ से प्रश्न पूछें',
    choice2Desc:
      'अपने अपलोड किए गए दस्तावेज़ के बारे में प्रश्न पूछें और उसकी वास्तविक सामग्री के आधार पर उत्तर प्राप्त करें।',
    choice2Btn: 'प्रश्न पूछें →',
    closingStatement: 'स्पष्ट पढ़ें। आत्मविश्वास से निर्णय लें।',
    startAgainBtn: 'फिर से शुरू करें',
    openMainDashboardBtn: 'मुख्य डैशबोर्ड खोलें →',
    dashboardHeading: 'कानूनी दस्तावेज़ विश्लेषण डैशबोर्ड',
    dashboardSubtitle:
      'आपके विश्लेषित दस्तावेज़ों, जोखिम सारांशों और जनरेट की गई पीडीएफ रिपोर्ट्स का विवरण।',
    statDocsAnalyzed: 'विश्लेषित दस्तावेज़',
    statRisksDetected: 'पहचाने गए जोखिम',
    statReportsGenerated: 'पीडीएफ रिपोर्ट्स',
    statActiveLanguage: 'चयनित भाषा',
    recentDocumentsHeading: 'हाल के दस्तावेज़ और जोखिम सारांश',
    recentAnalysesHeading: 'हाल का विश्लेषण इतिहास',
    noDocumentsYetTitle: 'अभी तक किसी दस्तावेज़ का विश्लेषण नहीं किया गया है',
    noDocumentsYetDesc:
      'महत्वपूर्ण शर्तों, विरोधाभासों और जोखिमों की जाँच करने के लिए वास्तविक PDF या DOCX दस्तावेज़ अपलोड करें।',
    uploadFirstDocBtn: 'दस्तावेज़ अपलोड और विश्लेषित करें →',
    viewAnalysisBtn: 'विश्लेषण खोलें',
    downloadReportBtn: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    analyzePageHeading: 'कानूनी दस्तावेज़ का विश्लेषण करें',
    analyzePageSubtitle:
      'वास्तविक PDF (.pdf) या Word (.docx) फ़ाइल अपलोड करें। स्कैन किए गए PDF के लिए OCR सुविधा उपलब्ध है।',
    dropzoneTitle: 'PDF या DOCX फ़ाइल यहाँ ड्रैग और ड्रॉप करें, या चुनने के लिए क्लिक करें',
    dropzoneSubtitle: '.pdf और .docx दस्तावेज़ समर्थित हैं (अधिकतम 15 MB)',
    selectedFileLabel: 'चयनित दस्तावेज़',
    fileTypeLabel: 'प्रकार',
    fileSizeLabel: 'आकार',
    replaceFileBtn: 'फ़ाइल बदलें',
    removeFileBtn: 'फ़ाइल हटाएँ',
    startAnalysisBtn: 'दस्तावेज़ का विश्लेषण करें →',
    processingStatus: 'टेक्स्ट निकाला जा रहा है और एआई जोखिम विश्लेषण चल रहा है...',
    ocrFallbackNotice: 'स्कैन किए गए PDF पृष्ठों के लिए स्वचालित OCR समर्थित है।',
    executiveSummaryHeading: 'कार्यकारी दस्तावेज़ सारांश',
    overallRiskScoreLabel: 'कुल जोखिम स्कोर',
    overallRiskLevelLabel: 'कुल जोखिम स्तर',
    lowRisk: 'Low (कम)',
    mediumRisk: 'Medium (मध्यम)',
    highRisk: 'High (उच्च)',
    importantTermsHeading: 'महत्वपूर्ण शर्तें, दायित्व और नियम',
    importantTermsSub: 'आपके अपलोड किए गए दस्तावेज़ से सीधे निकाले गए तथ्य',
    obligationsLabel: 'दायित्व और जिम्मेदारियाँ',
    deadlinesLabel: 'समय-सीमा (Deadlines)',
    penaltiesLabel: 'दंड और जुर्माना',
    paymentConditionsLabel: 'भुगतान की शर्तें',
    terminationConditionsLabel: 'समाप्ति की शर्तें',
    potentialRisksHeading: 'पहचाने गए संभावित जोखिम',
    reasonLabel: 'कारण',
    explanationLabel: 'सरल भाषा में स्पष्टीकरण',
    evidenceLabel: 'दस्तावेज़ से प्रमाण',
    pageRefLabel: 'पृष्ठ / अनुभाग संदर्भ',
    contradictionDetectorHeading: 'विरोधाभास डिटेक्टर (Contradiction Detector)',
    contradictionDetectorSub: 'एक ही दस्तावेज़ के अन्य भागों के साथ असंगत या विरोधाभासी कथन',
    ambiguityDetectorHeading: 'अस्पष्टता डिटेक्टर (Ambiguity Detector)',
    ambiguityDetectorSub: 'अस्पष्ट शब्द जिनके कई अर्थ निकाले जा सकते हैं',
    missingInfoHeading: 'अनुपलब्ध जानकारी (Missing Information)',
    missingInfoSub: 'दस्तावेज़ में छूटी हुई महत्वपूर्ण शर्तें',
    recommendationLabel: 'सुझाव',
    sensitiveInfoHeading: 'संवेदनशील व्यक्तिगत जानकारी डिटेक्टर',
    sensitiveInfoSub: 'आधार नंबर, फ़ोन नंबर, ईमेल, पता और बैंक खाते के विवरण की जाँच',
    sensitivePrivacyWarning:
      'संवेदनशील जानकारी मिली है। इस दस्तावेज़ को किसी अन्य वेबसाइट पर अपलोड करने से पहले जाँच लें कि क्या ये विवरण आवश्यक हैं।',
    externalAiNotice:
      'गोपनीयता सूचना: अपलोड किए गए दस्तावेज़ों को केवल जोखिम रिपोर्ट बनाने के लिए सुरक्षित बैकएंड एआई सेवा द्वारा संसाधित किया जाता है।',
    revealSensitiveBtn: 'मूल पाठ दिखाएँ',
    maskSensitiveBtn: 'संवेदनशील मान छिपाएँ',
    noneFoundText: 'इस अनुभाग के लिए दस्तावेज़ में कोई मुद्दा नहीं मिला।',
    qaPageHeading: 'दस्तावेज़ प्रश्नोत्तर (Document Q&A)',
    qaPageSubtitle:
      'टाइप करके या बोलकर अपने दस्तावेज़ के बारे में प्रश्न पूछें। उत्तर केवल अपलोड किए गए दस्तावेज़ पर आधारित हैं।',
    qaSelectDocLabel: 'सक्रिय दस्तावेज़',
    qaInputPlaceholder: 'अपना प्रश्न लिखें या माइक दबाकर बोलें (जैसे: क्या कोई नोटिस अवधि है?)...',
    qaSubmitBtn: 'प्रश्न पूछें',
    qaSuggestedHeading: 'सुझाए गए प्रश्न',
    qaSuggestedQuestions: [
      'क्या इसमें कोई नोटिस अवधि है?',
      'दंड या समाप्ति की शर्तें क्या हैं?',
      'भुगतान की शर्तें और समय-सीमा क्या हैं?',
      'क्या कोई विरोधाभासी या अस्पष्ट शर्तें हैं?',
      'विवादों का समाधान कैसे किया जाता है?',
    ],
    qaSearchingStatus: 'दस्तावेज़ की जाँच और प्रमाण खोजा जा रहा है...',
    qaEmptyState: 'अभी तक कोई प्रश्न नहीं पूछा गया है। ऊपर प्रश्न टाइप करें या माइक का उपयोग करें।',
    qaNotEnoughInfoMsg: 'अपलोड किए गए दस्तावेज़ में इस प्रश्न का उत्तर देने के लिए पर्याप्त जानकारी नहीं है।',
    voicePlay: 'सुनें (Listen)',
    voicePause: 'रोकें',
    voiceResume: 'जारी रखें',
    voiceStop: 'बंद करें',
    voiceUnavailableMsg: 'इस भाषा के लिए बैकएंड ऑडियो सिंथेसिस का उपयोग किया जा रहा है।',
    voiceMicStart: 'बोलकर पूछें',
    voiceMicListening: 'सुन रहा है... रोकने के लिए टैप करें',
    voiceMicStop: 'माइक बंद करें',
    voiceMicPermissionDenied: 'माइक्रोफ़ोन अनुमति अस्वीकार कर दी गई। कृपया ब्राउज़र सेटिंग्स जाँचें।',
    voiceMicUnsupported: 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया अपना प्रश्न टाइप करें।',
    voicePrivacyNotice: 'वॉइस इनपुट ब्राउज़र स्पीच रिकग्निशन का उपयोग करता है ताकि आप सबमिट करने से पहले टेक्स्ट देख और संपादित कर सकें।',
    historyPageHeading: 'विश्लेषण इतिहास',
    historyPageSubtitle: 'पूर्व में विश्लेषित दस्तावेज़ों को देखें या बिना पुराना रिकॉर्ड हटाए नया विश्लेषण शुरू करें।',
    searchPlaceholder: 'दस्तावेज़ के नाम से खोजें...',
    filterAll: 'सभी स्तर',
    deleteRecordBtn: 'हटाएँ',
    reportsPageHeading: 'पीडीएफ रिपोर्ट्स (Reports)',
    reportsPageSubtitle: 'अपनी चयनित भाषा में आधिकारिक पीडीएफ विश्लेषण रिपोर्ट डाउनलोड करें।',
    noReportsYet: 'अभी तक कोई पीडीएफ रिपोर्ट जनरेट नहीं की गई है।',
    reportGeneratedOn: 'जनरेट किया गया',
    settingsPageHeading: 'एप्लिकेशन सेटिंग्स',
    settingsPageSubtitle: 'अपनी डिफ़ॉल्ट भाषा, वॉइस रीड-अलाउड और गोपनीयता प्राथमिकताएँ प्रबंधित करें।',
    preferredLanguageSetting: 'डिफ़ॉल्ट इंटरफ़ेस और विश्लेषण भाषा',
    voiceSettingsHeading: 'वॉइस इनपुट और आउटपुट सेटिंग्स',
    autoStopVoiceLabel: 'पेज या भाषा बदलने पर ऑडियो स्वचालित रूप से बंद करें',
    privacySettingsHeading: 'दस्तावेज़ प्रसंस्करण और एआई पारदर्शिता',
    externalServiceExplanation:
      'जब आप किसी दस्तावेज़ का विश्लेषण करते हैं, तो निकाला गया पाठ सुरक्षित रूप से हमारे बैकएंड सर्वर द्वारा Hugging Face AI और NLP मॉडल के माध्यम से संसाधित किया जाता है।',
    profilePageHeading: 'उपयोगकर्ता प्रोफ़ाइल और गोपनीयता',
    profilePageSubtitle: 'अपने खाते का विवरण और गोपनीयता सेटिंग्स प्रबंधित करें।',
    fullNameLabel: 'पूरा नाम',
    emailAddressLabel: 'ईमेल पता',
    organizationLabel: 'कॉलेज / संस्था',
    saveProfileBtn: 'प्रोफ़ाइल सहेजें',
    profileSavedMsg: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।',
    loginHeading: 'अपने खाते में साइन इन करें',
    registerHeading: 'नया खाता बनाएँ',
    passwordLabel: 'पासवर्ड',
    signInBtn: 'साइन इन करें',
    createAccountBtn: 'खाता पंजीकृत करें',
    switchToRegister: 'खाता नहीं है? यहाँ पंजीकरण करें',
    switchToLogin: 'पहले से खाता है? साइन इन करें',
    legalDisclaimer:
      'यह विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है और पेशेवर कानूनी सलाह का विकल्प नहीं है।',
  },
  Telugu: {
    appTitle: 'AI-ఆధారిత లీగల్ డాక్యుమెంట్ రిస్క్ అనాలిసిస్ సూట్',
    appShortTitle: 'LEXORA',
    languageLabel: 'భాష',
    translatingStatus: 'ఇంటర్‌ఫేస్ మరియు ఫలితాలను అనువదిస్తోంది...',
    navWelcome: 'స్వాగతం',
    navDashboard: 'డ్యాష్‌బోర్డ్',
    navAnalyze: 'పత్ర విశ్లేషణ',
    navQA: 'ప్రశ్నలు & సమాధానాలు (Q&A)',
    navHistory: 'విశ్లేషణ చరిత్ర',
    navReports: 'నివేదికలు (Reports)',
    navSettings: 'సెట్టింగ్‌లు',
    navLanguageVoice: 'భాష & వాయిస్ సెట్టింగ్‌లు',
    navProfile: 'ప్రొఫైల్ & గోప్యత',
    navLogin: 'లాగిన్ / రిజిస్టర్',
    navLogout: 'సైన్ అవుట్',
    welcomeHeading: 'స్మార్ట్ విశ్లేషణ.\nసురక్షిత నిర్ణయాలు.',
    welcomeDescription:
      'అప్‌లోడ్ చేయండి. విశ్లేషించండి. అర్థం చేసుకోండి. AI-ఆధారిత డాక్యుమెంట్ ఇంటెలిజెన్స్‌తో చట్టపరమైన ప్రమాదాలు, అస్పష్టమైన నిబంధనలు మరియు వైరుధ్యాలను గుర్తించండి.',
    exploreBtn: 'అన్వేషించండి →',
    exploreHeading: 'మీరు ఏమి చేయాలనుకుంటున్నారు?',
    choice1Title: '01 — పత్రాన్ని విశ్లేషించండి',
    choice1Desc:
      'ముఖ్యమైన నిబంధనలు, సంభావ్య ప్రమాదాలు, లోపించిన సమాచారం, వైరుధ్యాలు మరియు సున్నితమైన వ్యక్తిగత వివరాలను గుర్తించడానికి PDF లేదా DOCX అప్‌లోడ్ చేయండి.',
    choice1Btn: 'పత్రాన్ని విశ్లేషించండి →',
    choice2Title: '02 — మీ పత్రాన్ని ప్రశ్నించండి',
    choice2Desc:
      'మీరు అప్‌లోడ్ చేసిన పత్రం గురించి ప్రశ్నలు అడగండి మరియు దాని వాస్తవ కంటెంట్ ఆధారంగా సమాధానాలు పొందండి.',
    choice2Btn: 'ప్రశ్న అడగండి →',
    closingStatement: 'స్పష్టంగా చదవండి. నమ్మకంగా నిర్ణయించుకోండి.',
    startAgainBtn: 'మళ్లీ ప్రారంభించండి',
    openMainDashboardBtn: 'ప్రధాన డ్యాష్‌బోర్డ్ తెరవండి →',
    dashboardHeading: 'లీగల్ డాక్యుమెంట్ అనాలిసిస్ డ్యాష్‌బోర్డ్',
    dashboardSubtitle:
      'మీ విశ్లేషించిన పత్రాలు, రిస్క్ సారాంశాలు మరియు PDF నివేదికల అవలోకనం.',
    statDocsAnalyzed: 'విశ్లేషించిన పత్రాలు',
    statRisksDetected: 'గుర్తించిన ప్రమాదాలు',
    statReportsGenerated: 'PDF నివేదికలు',
    statActiveLanguage: 'ఎంచుకున్న భాష',
    recentDocumentsHeading: 'ఇటీవలి పత్రాలు & రిస్క్ సారాంశాలు',
    recentAnalysesHeading: 'ఇటీవలి విశ్లేషణ చరిత్ర',
    noDocumentsYetTitle: 'ఇంకా ఎటువంటి పత్రాలు విశ్లేషించబడలేదు',
    noDocumentsYetDesc:
      'ముఖ్యమైన నిబంధనలు, వైరుధ్యాలు మరియు ప్రమాదాలను గుర్తించడానికి నిజమైన PDF లేదా DOCX పత్రాన్ని అప్‌లోడ్ చేయండి.',
    uploadFirstDocBtn: 'పత్రాన్ని అప్‌లోడ్ చేసి విశ్లేషించండి →',
    viewAnalysisBtn: 'విశ్లేషణ తెరవండి',
    downloadReportBtn: 'PDF నివేదిక డౌన్‌లోడ్ చేయండి',
    analyzePageHeading: 'లీగల్ డాక్యుమెంట్‌ను విశ్లేషించండి',
    analyzePageSubtitle:
      'నిజమైన PDF (.pdf) లేదా Word (.docx) ఫైల్‌ను అప్‌లోడ్ చేయండి. స్కాన్ చేసిన PDFల కోసం OCR మద్దతు ఉంది.',
    dropzoneTitle: 'PDF లేదా DOCX ఫైల్‌ను ఇక్కడ డ్రాప్ చేయండి లేదా ఎంచుకోవడానికి క్లిక్ చేయండి',
    dropzoneSubtitle: '.pdf మరియు .docx పత్రాలకు మద్దతు ఇస్తుంది (గరిష్టంగా 15 MB)',
    selectedFileLabel: 'ఎంచుకున్న పత్రం',
    fileTypeLabel: 'రకం',
    fileSizeLabel: 'పరిమాణం',
    replaceFileBtn: 'ఫైల్ మార్చండి',
    removeFileBtn: 'ఫైల్ తొలగించండి',
    startAnalysisBtn: 'పత్రాన్ని విశ్లేషించండి →',
    processingStatus: 'టెక్స్ట్ వెలికితీసి AI విశ్లేషణ నిర్వహిస్తోంది...',
    ocrFallbackNotice: 'స్కాన్ చేసిన PDF పేజీల కోసం ఆటోమేటిక్ OCR మద్దతు ఉంది.',
    executiveSummaryHeading: 'పత్ర విశ్లేషణ సారాంశం',
    overallRiskScoreLabel: 'మొత్తం రిస్క్ స్కోర్',
    overallRiskLevelLabel: 'మొత్తం ప్రమాద స్థాయి',
    lowRisk: 'Low (తక్కువ)',
    mediumRisk: 'Medium (మధ్యస్థం)',
    highRisk: 'High (ఎక్కువ)',
    importantTermsHeading: 'ముఖ్యమైన నిబంధనలు & బాధ్యతలు',
    importantTermsSub: 'మీరు అప్‌లోడ్ చేసిన పత్రం నుండి నేరుగా సేకరించబడింది',
    obligationsLabel: 'బాధ్యతలు',
    deadlinesLabel: 'గడువులు (Deadlines)',
    penaltiesLabel: 'జరిమానాలు (Penalties)',
    paymentConditionsLabel: 'చెల్లింపు నిబంధనలు',
    terminationConditionsLabel: 'రద్దు నిబంధనలు',
    potentialRisksHeading: 'గుర్తించిన సంభావ్య ప్రమాదాలు',
    reasonLabel: 'కారణం',
    explanationLabel: 'సాధారణ భాషలో వివరణ',
    evidenceLabel: 'పత్రం నుండి సాక్ష్యం',
    pageRefLabel: 'పేజీ / విభాగం రిఫరెన్స్',
    contradictionDetectorHeading: 'వైరుధ్య గుర్తింపు (Contradiction Detector)',
    contradictionDetectorSub: 'ఒకే పత్రంలోని ఇతర భాగాలతో విభేదించే ప్రకటనలు',
    ambiguityDetectorHeading: 'అస్పష్టత గుర్తింపు (Ambiguity Detector)',
    ambiguityDetectorSub: 'బహుళ అర్థాలకు దారితీసే అస్పష్టమైన పదాలు',
    missingInfoHeading: 'లోపించిన సమాచారం (Missing Information)',
    missingInfoSub: 'పత్రంలో వదిలివేయబడిన ముఖ్యమైన నిబంధనలు',
    recommendationLabel: 'సిఫార్సు',
    sensitiveInfoHeading: 'సున్నితమైన వ్యక్తిగత సమాచార గుర్తింపు',
    sensitiveInfoSub: 'ఆధార్ నంబర్, ఫోన్ నంబర్, ఇమెయిల్, చిరునామా మరియు బ్యాంక్ వివరాల తనిఖీ',
    sensitivePrivacyWarning:
      'సున్నితమైన సమాచారం గుర్తించబడింది. ఈ పత్రాన్ని మరో వెబ్‌సైట్‌కు అప్‌లోడ్ చేసే ముందు ఈ వివరాలు అవసరమో లేదో తనిఖీ చేయండి.',
    externalAiNotice:
      'గోప్యతా గమనిక: అప్‌లోడ్ చేసిన పత్రాలు కేవలం రిస్క్ రిపోర్ట్ రూపొందించడానికి సురక్షిత బ్యాకెండ్ AI ద్వారా ప్రాసెస్ చేయబడతాయి.',
    revealSensitiveBtn: 'అసలు వాక్యాన్ని చూపించు',
    maskSensitiveBtn: 'వివరాలను దాచు',
    noneFoundText: 'ఈ విభాగంలో ఎటువంటి అంశాలు గుర్తించబడలేదు.',
    qaPageHeading: 'పత్రం ప్రశ్నలు & సమాధానాలు (Document Q&A)',
    qaPageSubtitle:
      'టైప్ చేయడం లేదా మాట్లాడటం ద్వారా మీ పత్రం గురించి ప్రశ్నలు అడగండి.',
    qaSelectDocLabel: 'ప్రస్తుత పత్రం',
    qaInputPlaceholder: 'మీ ప్రశ్నను టైప్ చేయండి లేదా మైక్ నొక్కి మాట్లాడండి...',
    qaSubmitBtn: 'ప్రశ్న అడగండి',
    qaSuggestedHeading: 'సూచించిన ప్రశ్నలు',
    qaSuggestedQuestions: [
      'ఇందులో నోటీసు వ్యవధి ఉందా?',
      'జరిమానాలు లేదా రద్దు నిబంధనలు ఏమిటి?',
      'చెల్లింపు నిబంధనలు మరియు గడువులు ఏమిటి?',
      'ఏవైనా విరుద్ధమైన లేదా అస్పష్టమైన నిబంధనలు ఉన్నాయా?',
      'వివాదాలు ఎలా పరిష్కరించబడతాయి?',
    ],
    qaSearchingStatus: 'పత్రాన్ని తనిఖీ చేసి ఆధారాలను వెతుకుతోంది...',
    qaEmptyState: 'ఇంకా ఎటువంటి ప్రశ్నలు అడగలేదు. పైన ప్రశ్న టైప్ చేయండి లేదా మైక్ ఉపయోగించండి.',
    qaNotEnoughInfoMsg: 'ఈ ప్రశ్నకు సమాధానం ఇవ్వడానికి అప్‌లోడ్ చేసిన పత్రంలో తగినంత సమాచారం లేదు.',
    voicePlay: 'వినండి (Listen)',
    voicePause: 'పాజ్',
    voiceResume: 'కొనసాగించు',
    voiceStop: 'ఆపు',
    voiceUnavailableMsg: 'ఈ భాష కోసం బ్యాకెండ్ ఆడియో సింథసిస్ ఉపయోగించబడుతోంది.',
    voiceMicStart: 'మాట్లాడండి',
    voiceMicListening: 'వింటోంది... ఆపడానికి నొక్కండి',
    voiceMicStop: 'మైక్ ఆపు',
    voiceMicPermissionDenied: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్‌లను తనిఖీ చేయండి.',
    voiceMicUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు. దయచేసి టైప్ చేయండి.',
    voicePrivacyNotice: 'వాయిస్ ఇన్‌పుట్ బ్రౌజర్ స్పీచ్ రికగ్నిషన్‌ను ఉపయోగిస్తుంది, సబ్మిట్ చేసే ముందు మీరు టెక్స్ట్‌ను సరిచూసుకోవచ్చు.',
    historyPageHeading: 'విశ్లేషణ చరిత్ర',
    historyPageSubtitle: 'గతంలో విశ్లేషించిన పత్రాలను చూడండి లేదా పాత రికార్డులను తొలగించకుండా కొత్త విశ్లేషణ ప్రారంభించండి.',
    searchPlaceholder: 'పత్రం పేరుతో వెతకండి...',
    filterAll: 'అన్ని స్థాయిలు',
    deleteRecordBtn: 'తొలగించు',
    reportsPageHeading: 'PDF నివేదికలు (Reports)',
    reportsPageSubtitle: 'మీరు ఎంచుకున్న భాషలో అధికారిక PDF విశ్లేషణ నివేదికలను డౌన్‌లోడ్ చేయండి.',
    noReportsYet: 'ఇంకా ఎటువంటి PDF నివేదికలు రూపొందించబడలేదు.',
    reportGeneratedOn: 'రూపొందించిన తేదీ',
    settingsPageHeading: 'అప్లికేషన్ సెట్టింగ్‌లు',
    settingsPageSubtitle: 'భాష, వాయిస్ రీడ్-అలౌడ్ మరియు గోప్యతా ప్రాధాన్యతలను నిర్వహించండి.',
    preferredLanguageSetting: 'డిఫాల్ట్ భాష',
    voiceSettingsHeading: 'వాయిస్ ఇన్‌పుట్ & అవుట్‌పుట్ సెట్టింగ్‌లు',
    autoStopVoiceLabel: 'పేజీ లేదా భాష మార్చినప్పుడు ఆడియోను స్వయంచాలకంగా ఆపివేయండి',
    privacySettingsHeading: 'డాక్యుమెంట్ ప్రాసెసింగ్ & AI పారదర్శకత',
    externalServiceExplanation:
      'మీరు పత్రాన్ని విశ్లేషించినప్పుడు, టెక్స్ట్ సురక్షితంగా బ్యాకెండ్ సర్వర్ ద్వారా Hugging Face AI & NLP మోడల్స్ ద్వారా ప్రాసెస్ చేయబడుతుంది.',
    profilePageHeading: 'వినియోగదారు ప్రొఫైల్ & గోప్యత',
    profilePageSubtitle: 'మీ ఖాతా వివరాలు మరియు గోప్యతను నిర్వహించండి.',
    fullNameLabel: 'పూర్తి పేరు',
    emailAddressLabel: 'ఇమెయిల్ చిరునామా',
    organizationLabel: 'కళాశాల / సంస్థ',
    saveProfileBtn: 'ప్రొఫైల్ సేవ్ చేయండి',
    profileSavedMsg: 'ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది.',
    loginHeading: 'మీ ఖాతాకు సైన్ ఇన్ చేయండి',
    registerHeading: 'కొత్త ఖాతాను సృష్టించండి',
    passwordLabel: 'పాస్‌వర్డ్',
    signInBtn: 'సైన్ ఇన్',
    createAccountBtn: 'రిజిస్టర్ చేయండి',
    switchToRegister: 'ఖాతా లేదా? ఇక్కడ రిజిస్టర్ చేయండి',
    switchToLogin: 'ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి',
    legalDisclaimer:
      'ఈ విశ్లేషణ కేవలం సమాచార ప్రయోజనాల కోసం మాత్రమే మరియు వృత్తిపరమైన న్యాయ సలహాకు ప్రత్యామ్నాయం కాదు.',
  },
};
