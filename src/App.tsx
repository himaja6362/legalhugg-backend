import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  History,
  FileCheck,
  Settings,
  User,
  LogIn,
  LogOut,
  Download,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Send,
  Compass,
  Menu,
  X,
  Volume2,
} from 'lucide-react';
import {
  AnalysisRecord,
  SupportedLanguage,
  TranslatedContent,
  RiskLevel,
  ReportRecord,
  UserProfile,
} from './types';
import { TRANSLATIONS } from './i18n/translations';
import { generateLegalReportPDF } from './utils/pdfReportGenerator';
import { VoiceSpeakerButton, stopAllActiveSpeech } from './components/VoiceSpeakerButton';
import { VoiceMicButton } from './components/VoiceMicButton';
import { SpatialNavigationPath } from './components/SpatialNavigationPath';

export type PageRoute =
  | 'welcome'
  | 'dashboard'
  | 'analyze'
  | 'qa'
  | 'history'
  | 'reports'
  | 'settings'
  | 'language-voice'
  | 'profile'
  | 'login';

const VALID_ROUTES: PageRoute[] = [
  'welcome',
  'dashboard',
  'analyze',
  'qa',
  'history',
  'reports',
  'settings',
  'language-voice',
  'profile',
  'login',
];

function getInitialRouteFromLocation(): PageRoute {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#\/?/, '').trim() as PageRoute;
    if (VALID_ROUTES.includes(hash)) {
      return hash;
    }
  }
  return 'welcome';
}

const LANGUAGES: SupportedLanguage[] = ['English', 'Kannada', 'Hindi', 'Telugu'];

const LANGUAGE_NATIVE_LABELS: Record<SupportedLanguage, string> = {
  English: 'English',
  Kannada: 'ಕನ್ನಡ',
  Hindi: 'हिन्दी',
  Telugu: 'తెలుగు',
};

const STORAGE_LANG_KEY = 'legal_suite_preferred_language';
const STORAGE_USER_KEY = 'legal_suite_current_user';

export default function App() {
  // Load persisted language from localStorage
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguage;
      if (saved && LANGUAGES.includes(saved)) return saved;
    } catch (_e) {
      // ignore
    }
    return 'English';
  });

  // Load persisted user profile from localStorage
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_e) {
      // ignore
    }
    return {
      id: 'user-btech-demo',
      name: 'B.Tech Legal Researcher',
      email: 'researcher@college.edu',
      organization: 'Department of Computer Science & Engineering',
      preferredLanguage: 'English',
      createdAt: new Date().toISOString(),
    };
  });

  const [activePage, setActivePage] = useState<PageRoute>(getInitialRouteFromLocation);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [highlightedEvidence, setHighlightedEvidence] = useState<string | null>(null);
  const documentViewerRef = useRef<HTMLDivElement | null>(null);

  // Real Database Collections State
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Document Upload & Processing State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showRawPassagePii, setShowRawPassagePii] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Document Q&A State
  const [qaInput, setQaInput] = useState<string>('');
  const [isAskingQA, setIsAskingQA] = useState<boolean>(false);
  const [qaError, setQaError] = useState<string | null>(null);

  // History Search & Filter
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyRiskFilter, setHistoryRiskFilter] = useState<'ALL' | RiskLevel>('ALL');

  // Login / Registration Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState<string>('');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authOrg, setAuthOrg] = useState<string>('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState<string>(currentUser.name);
  const [profileOrg, setProfileOrg] = useState<string>(currentUser.organization);
  const [profileSavedBanner, setProfileSavedBanner] = useState<boolean>(false);

  // Welcome page section ref
  const welcomeExploreRef = useRef<HTMLDivElement | null>(null);

  const rawApiBase = String((import.meta as any).env?.VITE_API_BASE_URL || '').trim();
  const apiBase = /^https?:\/\//i.test(rawApiBase) ? rawApiBase.replace(/\/+$/, '') : '';
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.English;

  // Safe JSON response parser to prevent "Unexpected end of JSON input" on empty/interrupted responses
  async function safeParseJsonResponse<T = any>(
    res: Response,
    fallbackErrorMessage: string
  ): Promise<T> {
    const rawText = await res.text();
    if (!rawText || !rawText.trim()) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(
          `The AI analysis service or backend server is temporarily busy or restarting (HTTP ${res.status}). Your uploaded document is still selected — please click "Run AI Risk & Consistency Analysis" again.`
        );
      }
      throw new Error(
        res.ok
          ? 'The server returned an empty response. Please try again.'
          : `${fallbackErrorMessage} (HTTP ${res.status})`
      );
    }
    try {
      return JSON.parse(rawText) as T;
    } catch (_parseErr) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(
          `The AI analysis service timed out or is temporarily unavailable (HTTP ${res.status}). Your uploaded document is valid and still selected — please retry.`
        );
      }
      throw new Error(
        res.ok
          ? 'Received an invalid response format from the server. Please try again.'
          : `${fallbackErrorMessage} (HTTP ${res.status})`
      );
    }
  }

  // Fetch initial database records scoped to current user
  useEffect(() => {
    async function fetchRecords() {
      setIsLoadingData(true);
      try {
        const res = await fetch(`${apiBase}/api/analyses?userId=${encodeURIComponent(currentUser.id)}`);
        if (res.ok) {
          const data = await safeParseJsonResponse(res, 'Failed to load analysis history.');
          const list: AnalysisRecord[] = data.analyses || [];
          setAnalyses(list);
          setReports(data.reports || []);
          setCurrentAnalysis(list.length > 0 ? list[0] : null);
        }
      } catch (err) {
        console.error('Failed to load records:', err);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchRecords();
  }, [apiBase, currentUser.id]);

  // Support browser back/forward navigation and direct hash route access
  useEffect(() => {
    function handlePopState() {
      const hashRoute = getInitialRouteFromLocation();
      stopAllActiveSpeech();
      setActivePage(hashRoute);
      setMobileMenuOpen(false);
    }
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Stop any active speech when changing pages and sync URL hash
  function navigateTo(page: PageRoute) {
    stopAllActiveSpeech();
    setActivePage(page);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined' && window.location.hash !== `#${page}`) {
      window.history.pushState(null, '', `#${page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function inspectPassageInDocument(snippet: string) {
    if (!snippet) return;
    setHighlightedEvidence(snippet);
    setTimeout(() => {
      documentViewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  }

  // Handle Language Change & Persist in localStorage + Translate active analysis
  async function handleLanguageChange(lang: SupportedLanguage) {
    stopAllActiveSpeech();
    setSelectedLanguage(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (_e) {
      // ignore
    }

    if (lang === 'English' || !currentAnalysis) return;
    if (currentAnalysis.translations && currentAnalysis.translations[lang]) {
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch(`${apiBase}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: currentAnalysis.id,
          targetLanguage: lang,
        }),
      });
      if (res.ok) {
        const translatedData: TranslatedContent = await safeParseJsonResponse(
          res,
          'Translation request failed.'
        );
        const updated: AnalysisRecord = {
          ...currentAnalysis,
          translations: {
            ...(currentAnalysis.translations || {}),
            [lang]: translatedData,
          },
        };
        setCurrentAnalysis(updated);
        setAnalyses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  }

  // Validate uploaded PDF or DOCX file
  function validateAndSelectFile(file: File) {
    setUploadError(null);
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx')) {
      setUploadError('Unsupported file format. Please upload a valid PDF (.pdf) or DOCX (.docx) file.');
      setSelectedFile(null);
      return;
    }
    if (file.size === 0) {
      setUploadError('The uploaded file is empty (0 bytes). Please select a valid document.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds the 15 MB maximum limit.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }

  // Execute real PDF/DOCX extraction and AI analysis
  async function handleAnalyzeUploadedDocument() {
    if (!selectedFile) {
      setUploadError('Please select a PDF or DOCX document before starting analysis.');
      return;
    }

    stopAllActiveSpeech();
    setIsAnalyzing(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', currentUser.id);
      formData.append('userName', currentUser.name);

      const res = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      const data = await safeParseJsonResponse(
        res,
        'Document analysis failed. Please verify the file is a valid, readable PDF or DOCX document.'
      );
      if (!res.ok) {
        throw new Error(data.error || 'Document analysis failed.');
      }

      // If non-English language is selected, also translate the newly generated analysis
      if (selectedLanguage !== 'English') {
        try {
          const transRes = await fetch(`${apiBase}/api/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisId: data.id,
              targetLanguage: selectedLanguage,
            }),
          });
          if (transRes.ok) {
            const translatedData: TranslatedContent = await safeParseJsonResponse(
              transRes,
              'Translation failed.'
            );
            data.translations = { [selectedLanguage]: translatedData };
          }
        } catch (_e) {
          // fallback to English findings if translation fails
        }
      }

      setCurrentAnalysis(data);
      setAnalyses((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process and analyze document.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Ask question on Document Q&A page
  async function handleAskQuestion(presetQuestion?: string) {
    const qText = (presetQuestion ?? qaInput).trim();
    if (!qText || !currentAnalysis) return;

    stopAllActiveSpeech();
    setIsAskingQA(true);
    setQaError(null);
    if (!presetQuestion) setQaInput('');

    try {
      const res = await fetch(`${apiBase}/api/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: currentAnalysis.id,
          question: qText,
          language: selectedLanguage,
        }),
      });

      const data = await safeParseJsonResponse(res, 'Failed to get answer from document.');
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer from document.');
      }

      const updated: AnalysisRecord = {
        ...currentAnalysis,
        qaHistory: [...(currentAnalysis.qaHistory || []), data],
      };
      setCurrentAnalysis(updated);
      setAnalyses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err: any) {
      setQaError(err.message || 'Unable to process question.');
    } finally {
      setIsAskingQA(false);
    }
  }

  // Generate & Download PDF Report in Selected Language
  async function handleDownloadReport(targetRecord?: AnalysisRecord) {
    const record = targetRecord || currentAnalysis;
    if (!record) return;
    setReportError(null);

    try {
      let translated: TranslatedContent | null = null;
      if (selectedLanguage !== 'English') {
        if (record.translations && record.translations[selectedLanguage]) {
          translated = record.translations[selectedLanguage];
        } else {
          // Fetch translation before generating PDF so the report matches selected language
          setIsTranslating(true);
          const transRes = await fetch(`${apiBase}/api/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisId: record.id,
              targetLanguage: selectedLanguage,
            }),
          });
          setIsTranslating(false);
          if (transRes.ok) {
            translated = await safeParseJsonResponse(transRes, 'Translation failed.');
          }
        }
      }

      generateLegalReportPDF(record, selectedLanguage, translated);

      const res = await fetch(`${apiBase}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: record.id,
          userId: currentUser.id,
          documentName: record.documentName,
          language: selectedLanguage,
          overallRiskScore: record.overallRiskScore,
          riskLevel: record.riskLevel,
        }),
      });
      if (res.ok) {
        const savedReport: ReportRecord = await safeParseJsonResponse(
          res,
          'Failed to log report.'
        );
        setReports((prev) => [savedReport, ...prev]);
      }
    } catch (err: any) {
      setIsTranslating(false);
      setReportError(err.message || 'Failed to generate PDF report.');
    }
  }

  // Delete a specific analysis record from History
  async function handleDeleteAnalysis(id: string) {
    try {
      const res = await fetch(`${apiBase}/api/analyses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = analyses.filter((a) => a.id !== id);
        setAnalyses(remaining);
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(remaining[0] || null);
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  // Handle Login / Registration
  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        authMode === 'login'
          ? { email: authEmail, password: authPassword }
          : {
              name: authName,
              email: authEmail,
              password: authPassword,
              organization: authOrg,
              preferredLanguage: selectedLanguage,
            };

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await safeParseJsonResponse(res, 'Authentication failed.');
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (data.user) {
        setCurrentUser(data.user);
        setProfileName(data.user.name);
        setProfileOrg(data.user.organization || '');
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
        if (data.user.preferredLanguage && LANGUAGES.includes(data.user.preferredLanguage)) {
          handleLanguageChange(data.user.preferredLanguage);
        }
        setAuthMessage(`Signed in as ${data.user.name}`);
        setAuthPassword('');
        navigateTo('dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    }
  }

  // Handle Profile Save
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSavedBanner(false);
    try {
      const res = await fetch(`${apiBase}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name: profileName,
          organization: profileOrg,
          preferredLanguage: selectedLanguage,
        }),
      });
      const data = await res.json();
      const updatedUser: UserProfile = {
        ...currentUser,
        name: data.user?.name || profileName,
        organization: data.user?.organization || profileOrg,
        preferredLanguage: selectedLanguage,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
      setProfileSavedBanner(true);
      setTimeout(() => setProfileSavedBanner(false), 3000);
    } catch (_e) {
      // Fallback local save
      const updatedUser: UserProfile = {
        ...currentUser,
        name: profileName,
        organization: profileOrg,
        preferredLanguage: selectedLanguage,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
      setProfileSavedBanner(true);
    }
  }

  // Helpers for translated analysis content
  const activeTranslation: TranslatedContent | null =
    selectedLanguage !== 'English' && currentAnalysis?.translations?.[selectedLanguage]
      ? currentAnalysis.translations[selectedLanguage]
      : null;

  const displaySummary = activeTranslation ? activeTranslation.summary : currentAnalysis?.summary || '';
  const displayDocumentType = activeTranslation?.documentType || currentAnalysis?.documentType || '';
  const displayInfo = activeTranslation
    ? activeTranslation.importantInformation
    : currentAnalysis?.importantInformation;

  function selectAnalysisRecord(record: AnalysisRecord) {
    setCurrentAnalysis(record);
    if (
      selectedLanguage !== 'English' &&
      (!record.translations || !record.translations[selectedLanguage])
    ) {
      setIsTranslating(true);
      fetch(`${apiBase}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: record.id,
          targetLanguage: selectedLanguage,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const translatedData: TranslatedContent = await safeParseJsonResponse(
              res,
              'Translation request failed.'
            );
            const updated: AnalysisRecord = {
              ...record,
              translations: {
                ...(record.translations || {}),
                [selectedLanguage]: translatedData,
              },
            };
            setCurrentAnalysis(updated);
            setAnalyses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          }
        })
        .catch(() => {})
        .finally(() => setIsTranslating(false));
    }
  }

  function formatSensitiveCategory(cat: string) {
    if (selectedLanguage === 'Kannada') {
      if (cat === 'Aadhaar Number') return 'ಆಧಾರ್ ಸಂಖ್ಯೆ (Aadhaar Number)';
      if (cat === 'Phone Number') return 'ಫೋನ್ ಸಂಖ್ಯೆ (Phone Number)';
      if (cat === 'Email Address') return 'ಇಮೇಲ್ ವಿಳಾಸ (Email Address)';
      if (cat === 'Physical Address') return 'ನಿವಾಸದ ವಿಳಾಸ (Physical Address)';
      if (cat === 'Bank Account / IFSC') return 'ಬ್ಯಾಂಕ್ ಖಾತೆ / IFSC';
      if (cat === 'PAN Number') return 'ಪ್ಯಾನ್ ಸಂಖ್ಯೆ (PAN Number)';
      return 'ಇತರ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ (Other PII)';
    }
    if (selectedLanguage === 'Hindi') {
      if (cat === 'Aadhaar Number') return 'आधार संख्या (Aadhaar Number)';
      if (cat === 'Phone Number') return 'फ़ोन नंबर (Phone Number)';
      if (cat === 'Email Address') return 'ईमेल पता (Email Address)';
      if (cat === 'Physical Address') return 'भौतिक पता (Physical Address)';
      if (cat === 'Bank Account / IFSC') return 'बैंक खाता / IFSC';
      if (cat === 'PAN Number') return 'पैन नंबर (PAN Number)';
      return 'अन्य व्यक्तिगत जानकारी (Other PII)';
    }
    if (selectedLanguage === 'Telugu') {
      if (cat === 'Aadhaar Number') return 'ఆధార్ సంఖ్య (Aadhaar Number)';
      if (cat === 'Phone Number') return 'ఫోన్ నంబర్ (Phone Number)';
      if (cat === 'Email Address') return 'ఇమెయిల్ చిరునామా (Email Address)';
      if (cat === 'Physical Address') return 'చిరునామా (Physical Address)';
      if (cat === 'Bank Account / IFSC') return 'బ్యాంక్ ఖాతా / IFSC';
      if (cat === 'PAN Number') return 'పాన్ నంబర్ (PAN Number)';
      return 'ఇతర వ్యక్తిగత సమాచారం (Other PII)';
    }
    return cat;
  }

  function formatDocumentType(docType: string) {
    const lower = String(docType || '').toLowerCase();
    if (selectedLanguage === 'Kannada') {
      if (lower.includes('employment') || lower.includes('service'))
        return 'ಉದ್ಯೋಗ ಮತ್ತು ಸೇವಾ ಒಪ್ಪಂದ';
      if (lower.includes('lease') || lower.includes('rental'))
        return 'ಬಾಡಿಗೆ / ಗುತ್ತಿಗೆ ಒಪ್ಪಂದ';
      if (lower.includes('non-disclosure') || lower.includes('nda'))
        return 'ಗೌಪ್ಯತಾ ಒಪ್ಪಂದ (NDA)';
      if (lower.includes('vendor') || lower.includes('master services'))
        return 'ವಾಣಿಜ್ಯ ಸೇವಾ ಒಪ್ಪಂದ (MSA)';
      if (lower.includes('affidavit')) return 'ಕಾನೂನು ಪ್ರಮಾಣಪತ್ರ';
      return 'ಕಾನೂನು ಒಪ್ಪಂದದ ದಾಖಲೆ';
    }
    if (selectedLanguage === 'Hindi') {
      if (lower.includes('employment') || lower.includes('service'))
        return 'रोज़गार और सेवा अनुबंध';
      if (lower.includes('lease') || lower.includes('rental'))
        return 'किराया / पट्टा अनुबंध';
      if (lower.includes('non-disclosure') || lower.includes('nda'))
        return 'गोपनीयता अनुबंध (NDA)';
      if (lower.includes('vendor') || lower.includes('master services'))
        return 'वाणिज्यिक सेवा अनुबंध (MSA)';
      if (lower.includes('affidavit')) return 'कानूनी शपथ-पत्र';
      return 'कानूनी अनुबंध दस्तावेज़';
    }
    if (selectedLanguage === 'Telugu') {
      if (lower.includes('employment') || lower.includes('service'))
        return 'ఉద్యోగ మరియు సేవా ఒప్పందం';
      if (lower.includes('lease') || lower.includes('rental'))
        return 'అద్దె / లీజు ఒప్పందం';
      if (lower.includes('non-disclosure') || lower.includes('nda'))
        return 'గోప్యతా ఒప్పందం (NDA)';
      if (lower.includes('vendor') || lower.includes('master services'))
        return 'వాణిజ్య సేవా ఒప్పందం (MSA)';
      if (lower.includes('affidavit')) return 'చట్టపరమైన అఫిడవిట్';
      return 'చట్టపరమైన ఒప్పంద పత్రం';
    }
    return docType;
  }

  function formatPageReference(ref: string) {
    if (!ref || selectedLanguage === 'English') return ref;
    if (selectedLanguage === 'Kannada') {
      return ref
        .replace(/Whole Document \(Omitted Clause\)/gi, 'ಸಂಪೂರ್ಣ ದಾಖಲೆ (ಬಿಟ್ಟುಹೋದ ವಿಧಿ)')
        .replace(/\bPage\b/gi, 'ಪುಟ')
        .replace(/\bClause\b/gi, 'ವಿಧಿ')
        .replace(/\bSection\b/gi, 'ವಿಭಾಗ');
    }
    if (selectedLanguage === 'Hindi') {
      return ref
        .replace(/Whole Document \(Omitted Clause\)/gi, 'संपूर्ण दस्तावेज़ (अनुपलब्ध खंड)')
        .replace(/\bPage\b/gi, 'पृष्ठ')
        .replace(/\bClause\b/gi, 'खंड')
        .replace(/\bSection\b/gi, 'अनुभाग');
    }
    if (selectedLanguage === 'Telugu') {
      return ref
        .replace(/Whole Document \(Omitted Clause\)/gi, 'మొత్తం పత్రం (లోపించిన నిబంధన)')
        .replace(/\bPage\b/gi, 'పేజీ')
        .replace(/\bClause\b/gi, 'క్లాజ్')
        .replace(/\bSection\b/gi, 'విభాగం');
    }
    return ref;
  }

  function getTranslatedRisk(id: string, title: string, reason: string, simple: string) {
    if (!activeTranslation) return { title, reason, simpleExplanation: simple };
    const found = activeTranslation.risks?.find((r) => r.id === id);
    return {
      title: found?.title || title,
      reason: found?.reason || reason,
      simpleExplanation: found?.simpleExplanation || simple,
    };
  }

  function getTranslatedCheck(id: string, title: string, description: string, recommendation: string) {
    if (!activeTranslation) return { title, description, recommendation };
    const found = activeTranslation.documentChecks?.find((c) => c.id === id);
    return {
      title: found?.title || title,
      description: found?.description || description,
      recommendation: found?.recommendation || recommendation,
    };
  }

  function formatRiskLevel(level: RiskLevel) {
    if (level === 'High') return t.highRisk;
    if (level === 'Medium') return t.mediumRisk;
    return t.lowRisk;
  }

  const navItems: Array<{ id: PageRoute; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'welcome', label: t.navWelcome, icon: Compass },
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'analyze', label: t.navAnalyze, icon: Upload },
    { id: 'qa', label: t.navQA, icon: MessageSquare },
    { id: 'history', label: t.navHistory, icon: History },
    { id: 'reports', label: t.navReports, icon: FileCheck },
    { id: 'language-voice', label: t.navLanguageVoice, icon: Volume2 },
    { id: 'settings', label: t.navSettings, icon: Settings },
    { id: 'profile', label: t.navProfile, icon: User },
    { id: 'login', label: t.navLogin, icon: LogIn },
  ];

  const spatialLabels = {
    welcome: t.navWelcome,
    dashboard: t.navDashboard,
    analyze: t.navAnalyze,
    qa: t.navQA,
    history: t.navHistory,
    reports: t.navReports,
    languageVoice: t.navLanguageVoice,
    settingsPrivacy: `${t.navSettings} & ${t.navProfile}`,
    login: t.navLogin,
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-neutral-950 selection:bg-neutral-950 selection:text-white">
      {/* Minimal Architectural Header: Small Project Identifier + Language Controls */}
      <header className="sticky top-0 z-40 bg-[#f6f4ef]/95 backdrop-blur-xs border-b border-neutral-300/80 px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-neutral-700 hover:text-neutral-950 cursor-pointer shrink-0"
            aria-label="Toggle Spatial Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <a
            href="#welcome"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('welcome');
            }}
            className="group flex items-baseline gap-2.5 text-neutral-950 min-w-0"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500 group-hover:text-neutral-950 transition-colors shrink-0">
              [{t.appShortTitle} // 01—09]
            </span>
            <span className="text-sm sm:text-base font-medium tracking-tight text-neutral-950 truncate">
              {t.appTitle}
            </span>
          </a>
        </div>

        {/* Language Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {isTranslating && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-neutral-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t.translatingStatus}</span>
            </span>
          )}

          <div className="flex items-center gap-0.5 border border-neutral-300 p-0.5 bg-[#faf8f4]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 sm:px-2.5 py-1 text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-neutral-950 text-[#f6f4ef]'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {LANGUAGE_NATIVE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Responsive Two-Column Spatial Workspace Container */}
      <div className="flex-1 flex flex-col md:flex-row relative w-full max-w-full overflow-x-hidden">
        {/* Desktop & Tablet Interactive Spatial Navigation Rail (280–320px on desktop, compact on tablet) */}
        {activePage !== 'welcome' && (
          <aside className="hidden md:flex md:w-[260px] lg:w-[300px] xl:w-[320px] shrink-0 border-r border-neutral-300/80 flex-col justify-between py-4 px-4 lg:px-5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="w-full">
              <SpatialNavigationPath
                activePage={activePage}
                onNavigate={navigateTo}
                labels={spatialLabels}
                variant="rail"
              />
            </div>

            <div className="pt-3 border-t border-neutral-300/80 space-y-2 px-1 text-xs">
              {currentAnalysis && (
                <div className="pb-2.5 mb-2 border-b border-neutral-300/60 space-y-0.5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500">
                    {t.qaSelectDocLabel}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('analyze')}
                    className="text-xs font-medium text-neutral-900 hover:underline text-left block truncate w-full cursor-pointer"
                    title={currentAnalysis.documentName}
                  >
                    {currentAnalysis.documentName}
                  </button>
                  <p className="text-[11px] font-mono text-neutral-600">
                    {formatRiskLevel(currentAnalysis.riskLevel)} ({currentAnalysis.overallRiskScore}/100)
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-950 truncate">{currentUser.name}</p>
                  <p className="text-neutral-500 truncate font-mono text-[10px]">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('profile')}
                  className="text-[10px] font-mono uppercase tracking-widest border border-neutral-400 px-2 py-1 hover:border-neutral-950 cursor-pointer shrink-0"
                >
                  {t.navProfile.split(' ')[0]}
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Spatial Drawer Navigation Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-30 bg-[#f6f4ef]/98 backdrop-blur-xs border-r border-neutral-300 px-6 py-5 overflow-y-auto">
            <div className="max-w-xs mx-auto flex flex-col justify-between min-h-full space-y-6">
              <SpatialNavigationPath
                activePage={activePage}
                onNavigate={navigateTo}
                labels={spatialLabels}
                variant="rail"
              />
              <div className="pt-4 border-t border-neutral-300/80 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-950 truncate">{currentUser.name}</p>
                  <p className="text-neutral-500 truncate font-mono text-[10px]">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('profile')}
                  className="text-[10px] font-mono uppercase tracking-widest border border-neutral-400 px-2.5 py-1 hover:border-neutral-950 cursor-pointer shrink-0"
                >
                  {t.navProfile.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Page Viewport: Flexibly occupies all remaining available width */}
        <main className="flex-1 min-w-0 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className={
                activePage === 'welcome'
                  ? 'w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-8 sm:py-12'
                  : 'w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-10'
              }
            >
              {/* =========================================================== */}
              {/* PAGE 1: EXPERIMENTAL SPATIAL WELCOME EXPERIENCE (01)        */}
              {/* =========================================================== */}
              {activePage === 'welcome' && (
                <div className="space-y-24">
                  {/* Asymmetrical Spatial Hero: Left Editorial Headline + Centre Interactive Path */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(100vh-8.5rem)] border-b border-neutral-300/80 pb-14">
                    {/* Left Column: Asymmetrical Editorial Typography */}
                    <div className="lg:col-span-6 space-y-10 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="inline-flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-neutral-950 inline-block" />
                          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-500">
                            NODE 01 // {t.appShortTitle} SPATIAL INDEX
                          </span>
                        </div>

                        <h1 className="font-serif-display text-6xl sm:text-7xl xl:text-8xl font-normal tracking-tight text-neutral-950 leading-[0.94] whitespace-pre-line">
                          {t.welcomeHeading}
                        </h1>

                        <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-xl font-normal">
                          {t.welcomeDescription}
                        </p>
                      </div>

                      <div className="space-y-8 pt-2">
                        <div className="flex flex-wrap items-center gap-4">
                          <button
                            type="button"
                            onClick={() => navigateTo('analyze')}
                            className="px-8 py-4 bg-neutral-950 text-[#f6f4ef] text-xs font-mono uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            03 — {t.navAnalyze} →
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateTo('dashboard')}
                            className="px-6 py-4 border border-neutral-400 hover:border-neutral-950 text-neutral-950 text-xs font-mono uppercase tracking-[0.2em] transition-colors cursor-pointer"
                          >
                            02 — {t.navDashboard}
                          </button>
                        </div>

                        {/* Subtle SCROLL TO EXPLORE indicator */}
                        <button
                          type="button"
                          onClick={() =>
                            welcomeExploreRef.current?.scrollIntoView({ behavior: 'smooth' })
                          }
                          className="group inline-flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.28em] text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
                        >
                          <span className="w-8 h-px bg-neutral-400 group-hover:w-12 group-hover:bg-neutral-950 transition-all" />
                          <span>{t.exploreBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* Centre / Right Column: Interactive Spatial Navigation Path (01 to 09) */}
                    <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
                      <SpatialNavigationPath
                        activePage={activePage}
                        onNavigate={navigateTo}
                        labels={spatialLabels}
                        variant="hero"
                      />
                    </div>
                  </section>

                  {/* Explore Section: Two Typographic Options Without Cards */}
                  <section ref={welcomeExploreRef} className="space-y-12">
                    <h2 className="font-serif-display text-4xl sm:text-5xl text-neutral-950">
                      “{t.exploreHeading}”
                    </h2>

                    <div className="border-t border-neutral-200">
                      <div
                        onClick={() => navigateTo('analyze')}
                        className="group py-12 border-b border-neutral-200 flex flex-col md:flex-row md:items-baseline justify-between gap-6 cursor-pointer hover:bg-neutral-50/70 transition-colors px-2 -mx-2"
                      >
                        <div className="space-y-3 max-w-2xl">
                          <h3 className="text-xl font-mono font-semibold text-neutral-950">
                            {t.choice1Title}
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                            {t.choice1Desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('analyze');
                          }}
                          className="px-6 py-3 border border-neutral-950 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white text-xs font-mono uppercase tracking-widest transition-colors whitespace-nowrap self-start cursor-pointer"
                        >
                          {t.choice1Btn}
                        </button>
                      </div>

                      <div
                        onClick={() => navigateTo('qa')}
                        className="group py-12 border-b border-neutral-200 flex flex-col md:flex-row md:items-baseline justify-between gap-6 cursor-pointer hover:bg-neutral-50/70 transition-colors px-2 -mx-2"
                      >
                        <div className="space-y-3 max-w-2xl">
                          <h3 className="text-xl font-mono font-semibold text-neutral-950">
                            {t.choice2Title}
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                            {t.choice2Desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateTo('qa');
                          }}
                          className="px-6 py-3 border border-neutral-950 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white text-xs font-mono uppercase tracking-widest transition-colors whitespace-nowrap self-start cursor-pointer"
                        >
                          {t.choice2Btn}
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Results Summary if an analysis exists */}
                  {currentAnalysis && (
                    <section className="space-y-8 border-t border-neutral-200 pt-16">
                      <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                            {t.selectedFileLabel}
                          </p>
                          <h3 className="text-2xl font-medium text-neutral-950">
                            {currentAnalysis.documentName}
                          </h3>
                        </div>
                        <p className="text-lg font-mono text-neutral-950">
                          {t.overallRiskLevelLabel}:{' '}
                          <strong>{formatRiskLevel(currentAnalysis.riskLevel)}</strong> (
                          {currentAnalysis.overallRiskScore}/100)
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                            {t.executiveSummaryHeading}
                          </span>
                          <VoiceSpeakerButton
                            text={displaySummary}
                            language={selectedLanguage}
                          />
                        </div>
                        <p className="text-base text-neutral-800 leading-relaxed">
                          {displaySummary}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadReport(currentAnalysis)}
                          className="px-7 py-3.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          {t.downloadReportBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('analyze')}
                          className="px-6 py-3.5 border border-neutral-300 hover:border-neutral-950 text-neutral-950 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          {t.viewAnalysisBtn} →
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            navigateTo('analyze');
                          }}
                          className="px-6 py-3.5 border border-neutral-300 hover:border-neutral-950 text-neutral-950 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          {t.startAgainBtn}
                        </button>
                      </div>
                    </section>
                  )}

                  {/* Closing Statement */}
                  <section className="pt-8 border-t border-neutral-200 space-y-6">
                    <h2 className="font-serif-display text-4xl sm:text-6xl text-neutral-950 leading-tight">
                      “{t.closingStatement}”
                    </h2>
                  </section>
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 2: MAIN ANALYSIS DASHBOARD                             */}
              {/* =========================================================== */}
              {activePage === 'dashboard' && (
                <div className="space-y-14">
                  <div className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-2">
                      <h1 className="font-serif-display text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                        {t.dashboardHeading}
                      </h1>
                      <p className="text-sm text-neutral-600 max-w-2xl">{t.dashboardSubtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('analyze')}
                      className="px-6 py-3 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors whitespace-nowrap self-start cursor-pointer"
                    >
                      + {t.navAnalyze}
                    </button>
                  </div>

                  {/* Real Database Statistics Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-b border-neutral-200 pb-10">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        {t.statDocsAnalyzed}
                      </p>
                      <p className="text-4xl font-mono tabular-nums font-semibold text-neutral-950 mt-2">
                        {analyses.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        {t.statRisksDetected}
                      </p>
                      <p className="text-4xl font-mono tabular-nums font-semibold text-neutral-950 mt-2">
                        {analyses.reduce((sum, a) => sum + (a.risks?.length || 0), 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        {t.statReportsGenerated}
                      </p>
                      <p className="text-4xl font-mono tabular-nums font-semibold text-neutral-950 mt-2">
                        {reports.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        {t.statActiveLanguage}
                      </p>
                      <p className="text-2xl font-serif-display text-neutral-950 mt-3">
                        {LANGUAGE_NATIVE_LABELS[selectedLanguage]} ({selectedLanguage})
                      </p>
                    </div>
                  </div>

                  {/* Recent Documents & Risk Summaries */}
                  {isLoadingData ? (
                    <div className="py-16 flex items-center gap-3 text-sm font-mono text-neutral-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading database records...</span>
                    </div>
                  ) : analyses.length === 0 ? (
                    <div className="py-16 border-b border-neutral-200 space-y-5 max-w-xl">
                      <h2 className="text-xl font-semibold text-neutral-950">
                        {t.noDocumentsYetTitle}
                      </h2>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {t.noDocumentsYetDesc}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigateTo('analyze')}
                        className="px-7 py-3.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        {t.uploadFirstDocBtn}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {/* Active / Latest Document Risk Summary */}
                      {currentAnalysis && (
                        <div className="space-y-6 border-b border-neutral-200 pb-12">
                          <div className="flex flex-wrap items-baseline justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                                {t.recentDocumentsHeading}
                              </p>
                              <h2 className="text-2xl font-semibold text-neutral-950">
                                {currentAnalysis.documentName}
                              </h2>
                              <p className="text-xs font-mono text-neutral-500">
                                {displayDocumentType || formatDocumentType(currentAnalysis.documentType)} · {currentAnalysis.fileType} ·{' '}
                                {currentAnalysis.pageCount} {selectedLanguage === 'Kannada' ? 'ಪುಟಗಳು' : selectedLanguage === 'Hindi' ? 'पृष्ठ' : selectedLanguage === 'Telugu' ? 'పేజీలు' : 'Pages'} ·{' '}
                                {new Date(currentAnalysis.uploadDate).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <VoiceSpeakerButton
                                text={displaySummary}
                                language={selectedLanguage}
                              />
                              <span className="text-sm font-mono text-neutral-950 border border-neutral-950 px-3 py-1">
                                {formatRiskLevel(currentAnalysis.riskLevel)} (
                                {currentAnalysis.overallRiskScore}/100)
                              </span>
                            </div>
                          </div>

                          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                            {displaySummary}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => navigateTo('analyze')}
                              className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                              {t.viewAnalysisBtn} →
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateTo('qa')}
                              className="px-5 py-2.5 border border-neutral-300 hover:border-neutral-950 text-neutral-900 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              {t.navQA}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadReport(currentAnalysis)}
                              className="px-5 py-2.5 border border-neutral-300 hover:border-neutral-950 text-neutral-900 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {t.downloadReportBtn}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Recent Analysis History Table */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                            {t.recentAnalysesHeading} ({analyses.length})
                          </h2>
                          <button
                            type="button"
                            onClick={() => navigateTo('history')}
                            className="text-xs font-mono text-neutral-600 hover:text-neutral-950 underline underline-offset-4 cursor-pointer"
                          >
                            {t.navHistory} →
                          </button>
                        </div>

                        <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                          {analyses.slice(0, 6).map((item) => (
                            <div
                              key={item.id}
                              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    selectAnalysisRecord(item);
                                    navigateTo('analyze');
                                  }}
                                  className="text-sm font-semibold text-neutral-950 hover:underline text-left truncate block cursor-pointer"
                                >
                                  {item.documentName}
                                </button>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-500">
                                  <span>{formatDocumentType(item.documentType)}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>{new Date(item.uploadDate).toLocaleDateString()}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>
                                    {formatRiskLevel(item.riskLevel)} ({item.overallRiskScore}/100)
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    selectAnalysisRecord(item);
                                    navigateTo('analyze');
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-mono border border-neutral-300 hover:border-neutral-950 text-neutral-900 cursor-pointer"
                                >
                                  {t.viewAnalysisBtn}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadReport(item)}
                                  className="px-3.5 py-1.5 text-xs font-mono bg-neutral-950 text-white hover:bg-neutral-800 cursor-pointer"
                                >
                                  PDF
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 3: ANALYZE DOCUMENT (UPLOAD + COMPLETE FINDINGS)       */}
              {/* =========================================================== */}
              {activePage === 'analyze' && (
                <div className="space-y-16">
                  {/* Upload Section */}
                  <section className="space-y-8 border-b border-neutral-200 pb-14">
                    <div className="space-y-2">
                      <h1 className="font-serif-display text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                        {t.analyzePageHeading}
                      </h1>
                      <p className="text-sm text-neutral-600 max-w-2xl">{t.analyzePageSubtitle}</p>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          validateAndSelectFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                      className={`border border-neutral-300 p-10 sm:p-12 text-center transition-colors cursor-pointer ${
                        isDragging
                          ? 'border-neutral-950 bg-neutral-50'
                          : selectedFile
                          ? 'border-neutral-950 bg-neutral-50/40'
                          : 'hover:border-neutral-950 bg-white'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            validateAndSelectFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />

                      <div className="max-w-md mx-auto space-y-3">
                        <Upload className="w-6 h-6 text-neutral-900 mx-auto stroke-[1.5]" />
                        {selectedFile ? (
                          <div className="space-y-2 max-w-xl mx-auto px-2">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                              {t.selectedFileLabel}
                            </p>
                            <p className="text-base sm:text-lg font-semibold text-neutral-950 break-words">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs font-mono text-neutral-600 tabular-nums">
                              {t.fileTypeLabel}:{' '}
                              {selectedFile.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX'} ·{' '}
                              {t.fileSizeLabel}: {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-base font-medium text-neutral-950">
                              {t.dropzoneTitle}
                            </p>
                            <p className="text-xs font-mono text-neutral-500">
                              {t.dropzoneSubtitle}
                            </p>
                            <p className="text-[11px] font-mono text-neutral-400">
                              {t.ocrFallbackNotice}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {uploadError && (
                      <div
                        role="alert"
                        className="border border-red-300 border-l-4 border-l-red-700 bg-red-50/70 px-4 py-3.5 text-sm text-red-800 flex items-start gap-3 leading-relaxed"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                        <span className="break-words">{uploadError}</span>
                      </div>
                    )}

                    {reportError && (
                      <div
                        role="alert"
                        className="border border-red-300 border-l-4 border-l-red-700 bg-red-50/70 px-4 py-3.5 text-sm text-red-800 flex items-start gap-3 leading-relaxed"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                        <span className="break-words">{reportError}</span>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="border border-neutral-200 p-5 bg-neutral-50 flex items-center gap-3 text-sm text-neutral-800">
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-950 shrink-0" />
                        <span>{t.processingStatus}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {selectedFile && !isAnalyzing && (
                          <>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-neutral-950 underline underline-offset-4 cursor-pointer"
                            >
                              {t.replaceFileBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setUploadError(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-red-700 underline underline-offset-4 cursor-pointer"
                            >
                              {t.removeFileBtn}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleAnalyzeUploadedDocument}
                        disabled={!selectedFile || isAnalyzing}
                        className="px-7 py-3.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-30 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t.processingStatus}</span>
                          </>
                        ) : (
                          <span>{t.startAnalysisBtn}</span>
                        )}
                      </button>
                    </div>
                  </section>

                  {/* Active Document Analysis Findings */}
                  {currentAnalysis && (
                    <div className="space-y-16">
                      {/* Header & Executive Summary with Voice Output */}
                      <section className="space-y-8 border-b border-neutral-200 pb-12">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-neutral-200 pb-8">
                          <div className="sm:col-span-2 space-y-1.5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                              {t.selectedFileLabel}
                            </p>
                            <h2 className="text-2xl font-semibold text-neutral-950 break-all">
                              {currentAnalysis.documentName}
                            </h2>
                            <p className="text-xs font-mono text-neutral-500">
                              {displayDocumentType || formatDocumentType(currentAnalysis.documentType)} · {currentAnalysis.fileType} ·{' '}
                              {currentAnalysis.pageCount} {selectedLanguage === 'Kannada' ? 'ಪುಟಗಳು' : selectedLanguage === 'Hindi' ? 'पृष्ठ' : selectedLanguage === 'Telugu' ? 'పేజీలు' : 'Pages'} · {currentAnalysis.wordCount} {selectedLanguage === 'Kannada' ? 'ಪದಗಳು' : selectedLanguage === 'Hindi' ? 'शब्द' : selectedLanguage === 'Telugu' ? 'పదాలు' : 'Words'}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                              {t.overallRiskLevelLabel}
                            </p>
                            <p className="text-3xl font-serif-display text-neutral-950">
                              {formatRiskLevel(currentAnalysis.riskLevel)}{' '}
                              <span className="text-base font-mono tabular-nums text-neutral-500">
                                ({currentAnalysis.overallRiskScore}/100)
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                              {t.executiveSummaryHeading}
                            </h3>
                            <VoiceSpeakerButton
                              text={displaySummary}
                              language={selectedLanguage}
                            />
                          </div>
                          <p className="text-base text-neutral-800 leading-relaxed">
                            {displaySummary}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadReport(currentAnalysis)}
                            className="px-6 py-3 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            {t.downloadReportBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => navigateTo('qa')}
                            className="px-6 py-3 border border-neutral-300 hover:border-neutral-950 text-neutral-950 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            {t.navQA} →
                          </button>
                        </div>
                      </section>

                      {/* 1. Important Findings & Obligations (with Voice Speaker Button) */}
                      {displayInfo && (
                        <section className="space-y-6 border-b border-neutral-200 pb-12">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-semibold text-neutral-950">
                                01. {t.importantTermsHeading}
                              </h3>
                              <p className="text-xs text-neutral-500">{t.importantTermsSub}</p>
                            </div>
                            <VoiceSpeakerButton
                              text={[
                                ...(displayInfo.importantTerms || []),
                                ...(displayInfo.obligations || []),
                                ...(displayInfo.deadlines || []),
                                ...(displayInfo.penalties || []),
                              ].join('. ')}
                              language={selectedLanguage}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
                            {[
                              { label: t.importantTermsHeading, items: displayInfo.importantTerms },
                              { label: t.obligationsLabel, items: displayInfo.obligations },
                              { label: t.deadlinesLabel, items: displayInfo.deadlines },
                              { label: t.penaltiesLabel, items: displayInfo.penalties },
                              { label: t.paymentConditionsLabel, items: displayInfo.paymentConditions },
                              { label: t.terminationConditionsLabel, items: displayInfo.terminationConditions },
                            ].map((group) => (
                              <div key={group.label} className="space-y-2.5">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-2">
                                  {group.label}
                                </h4>
                                {group.items && group.items.length > 0 ? (
                                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-800 leading-relaxed">
                                    {group.items.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-neutral-400 font-mono">—</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-neutral-400 italic">
                                    {t.noneFoundText}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* 2. Potential Risks (Low, Medium, High + Voice Read Aloud per Risk) */}
                      <section className="space-y-6 border-b border-neutral-200 pb-12">
                        <h3 className="text-lg font-semibold text-neutral-950">
                          02. {t.potentialRisksHeading} ({currentAnalysis.risks?.length || 0})
                        </h3>

                        {currentAnalysis.risks && currentAnalysis.risks.length > 0 ? (
                          <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                            {currentAnalysis.risks.map((risk, idx) => {
                              const tr = getTranslatedRisk(
                                risk.id,
                                risk.title,
                                risk.reason,
                                risk.simpleExplanation
                              );
                              return (
                                <div key={risk.id} className="py-6 space-y-3.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h4 className="text-base font-semibold text-neutral-950">
                                      <span className="font-mono text-xs text-neutral-400 mr-2">
                                        {String(idx + 1).padStart(2, '0')}
                                      </span>
                                      {tr.title}
                                    </h4>

                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-mono text-neutral-600">
                                        {formatRiskLevel(risk.riskLevel)} · {formatPageReference(risk.pageOrSection)}
                                      </span>
                                      <VoiceSpeakerButton
                                        text={`${tr.title}. ${tr.simpleExplanation}. ${tr.reason}`}
                                        language={selectedLanguage}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                                    <div>
                                      <p className="text-xs font-mono uppercase text-neutral-400 mb-1">
                                        {t.reasonLabel}
                                      </p>
                                      <p className="text-neutral-700 leading-relaxed">{tr.reason}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-mono uppercase text-neutral-400 mb-1">
                                        {t.explanationLabel}
                                      </p>
                                      <p className="text-neutral-900 leading-relaxed">
                                        {tr.simpleExplanation}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-mono text-neutral-600">
                                      {t.evidenceLabel} ({formatPageReference(risk.pageOrSection)}):{' '}
                                      <span className="italic text-neutral-900">
                                        {risk.supportingEvidence}
                                      </span>
                                    </p>
                                    {risk.supportingEvidence && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          inspectPassageInDocument(risk.supportingEvidence)
                                        }
                                        className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 hover:text-neutral-950 underline underline-offset-4 cursor-pointer shrink-0"
                                      >
                                        Locate Passage ↓
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-500">{t.noneFoundText}</p>
                        )}
                      </section>

                      {/* 3. Contradiction Detector, Ambiguity Detector & Missing Information */}
                      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-b border-neutral-200 pb-12">
                        {/* Contradiction Detector */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-base font-semibold text-neutral-950">
                              03. {t.contradictionDetectorHeading} (
                              {currentAnalysis.conflictingInformation?.length || 0})
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {t.contradictionDetectorSub}
                            </p>
                          </div>

                          {currentAnalysis.conflictingInformation &&
                          currentAnalysis.conflictingInformation.length > 0 ? (
                            <div className="divide-y divide-neutral-200 border-t border-neutral-200">
                              {currentAnalysis.conflictingInformation.map((c) => {
                                const tc = getTranslatedCheck(
                                  c.id,
                                  c.title,
                                  c.description,
                                  c.recommendation
                                );
                                return (
                                  <div key={c.id} className="py-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold text-neutral-950">
                                        {tc.title}
                                      </p>
                                      <VoiceSpeakerButton
                                        text={`${tc.title}. ${tc.description}`}
                                        language={selectedLanguage}
                                      />
                                    </div>
                                    <p className="text-xs text-neutral-700 leading-relaxed">
                                      {tc.description}
                                    </p>
                                    {tc.recommendation && (
                                      <p className="text-xs text-neutral-600">
                                        <strong>{t.recommendationLabel}:</strong> {tc.recommendation}
                                      </p>
                                    )}
                                    <p className="text-xs font-mono text-neutral-500 italic">
                                      {c.evidenceOrContext} ({formatPageReference(c.pageOrSection)})
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-400 italic">{t.noneFoundText}</p>
                          )}
                        </div>

                        {/* Ambiguity Detector */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-base font-semibold text-neutral-950">
                              04. {t.ambiguityDetectorHeading} (
                              {currentAnalysis.ambiguousInformation?.length || 0})
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {t.ambiguityDetectorSub}
                            </p>
                          </div>

                          {currentAnalysis.ambiguousInformation &&
                          currentAnalysis.ambiguousInformation.length > 0 ? (
                            <div className="divide-y divide-neutral-200 border-t border-neutral-200">
                              {currentAnalysis.ambiguousInformation.map((a) => {
                                const ta = getTranslatedCheck(
                                  a.id,
                                  a.title,
                                  a.description,
                                  a.recommendation
                                );
                                return (
                                  <div key={a.id} className="py-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold text-neutral-950">
                                        {ta.title}
                                      </p>
                                      <VoiceSpeakerButton
                                        text={`${ta.title}. ${ta.description}`}
                                        language={selectedLanguage}
                                      />
                                    </div>
                                    <p className="text-xs text-neutral-700 leading-relaxed">
                                      {ta.description}
                                    </p>
                                    {ta.recommendation && (
                                      <p className="text-xs text-neutral-600">
                                        <strong>{t.recommendationLabel}:</strong> {ta.recommendation}
                                      </p>
                                    )}
                                    <p className="text-xs font-mono text-neutral-500 italic">
                                      {a.evidenceOrContext} ({formatPageReference(a.pageOrSection)})
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-400 italic">{t.noneFoundText}</p>
                          )}
                        </div>

                        {/* Missing Information */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-base font-semibold text-neutral-950">
                              05. {t.missingInfoHeading} (
                              {currentAnalysis.missingInformation?.length || 0})
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5">{t.missingInfoSub}</p>
                          </div>

                          {currentAnalysis.missingInformation &&
                          currentAnalysis.missingInformation.length > 0 ? (
                            <div className="divide-y divide-neutral-200 border-t border-neutral-200">
                              {currentAnalysis.missingInformation.map((m) => {
                                const tm = getTranslatedCheck(
                                  m.id,
                                  m.title,
                                  m.description,
                                  m.recommendation
                                );
                                return (
                                  <div key={m.id} className="py-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold text-neutral-950">
                                        {tm.title}
                                      </p>
                                      <VoiceSpeakerButton
                                        text={`${tm.title}. ${tm.description}`}
                                        language={selectedLanguage}
                                      />
                                    </div>
                                    <p className="text-xs text-neutral-700 leading-relaxed">
                                      {tm.description}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                      <strong>{t.recommendationLabel}:</strong> {tm.recommendation}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-400 italic">{t.noneFoundText}</p>
                          )}
                        </div>
                      </section>

                      {/* 4. Sensitive Personal Information Detection */}
                      <section className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-950">
                              06. {t.sensitiveInfoHeading} (
                              {currentAnalysis.sensitiveInformation?.length || 0})
                            </h3>
                            <p className="text-xs text-neutral-500">{t.sensitiveInfoSub}</p>
                          </div>

                          {currentAnalysis.sensitiveInformation &&
                            currentAnalysis.sensitiveInformation.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowRawPassagePii(!showRawPassagePii)}
                                className="text-xs font-mono text-neutral-600 hover:text-neutral-950 flex items-center gap-1.5 cursor-pointer"
                              >
                                {showRawPassagePii ? (
                                  <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    {t.maskSensitiveBtn}
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3.5 h-3.5" />
                                    {t.revealSensitiveBtn}
                                  </>
                                )}
                              </button>
                            )}
                        </div>

                        {currentAnalysis.sensitiveInformation &&
                        currentAnalysis.sensitiveInformation.length > 0 ? (
                          <div className="space-y-4">
                            <p className="border-l-2 border-neutral-950 pl-4 py-1 text-sm font-medium text-neutral-950">
                              “{t.sensitivePrivacyWarning}”
                            </p>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                <thead>
                                  <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-xs">
                                    <th className="py-2.5 pr-4 font-normal">Identifier</th>
                                    <th className="py-2.5 px-4 font-normal">Passage / Value</th>
                                    <th className="py-2.5 px-4 font-normal">Location</th>
                                    <th className="py-2.5 pl-4 font-normal text-right">Severity</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200">
                                  {currentAnalysis.sensitiveInformation.map((s) => (
                                    <tr key={s.id}>
                                      <td className="py-3 pr-4 font-medium text-neutral-950">
                                        {formatSensitiveCategory(s.category)}
                                      </td>
                                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-800">
                                        {showRawPassagePii ? s.originalSnippet : s.maskedValue}
                                      </td>
                                      <td className="py-3 px-4 text-neutral-500">
                                        {formatPageReference(s.pageOrSection)}
                                      </td>
                                      <td className="py-3 pl-4 text-right font-mono text-xs">
                                        {formatRiskLevel(s.severity)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-500">{t.noneFoundText}</p>
                        )}

                        <p className="text-xs font-mono text-neutral-500 pt-2">
                          {t.externalAiNotice}
                        </p>
                      </section>

                      {/* 5. Document Source Workspace & Passage Inspector */}
                      {currentAnalysis.extractedText && (
                        <section
                          ref={documentViewerRef}
                          className="space-y-4 border-t border-neutral-300 pt-12"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-neutral-950">
                                07. Uploaded Document Text & Passage Inspector
                              </h3>
                              <p className="text-xs font-mono text-neutral-500">
                                {currentAnalysis.documentName} · {currentAnalysis.pageCount} Pages ·{' '}
                                {currentAnalysis.wordCount} Words
                              </p>
                            </div>
                            {highlightedEvidence && (
                              <button
                                type="button"
                                onClick={() => setHighlightedEvidence(null)}
                                className="text-xs font-mono uppercase tracking-wider border border-neutral-400 px-3 py-1 hover:border-neutral-950 cursor-pointer"
                              >
                                Clear Highlight
                              </button>
                            )}
                          </div>

                          {highlightedEvidence && (
                            <div className="border-l-2 border-neutral-950 bg-[#faf8f4] px-4 py-3 text-xs font-mono text-neutral-900">
                              <span className="uppercase tracking-widest text-neutral-500 block mb-1">
                                Active Evidence Passage:
                              </span>
                              “{highlightedEvidence}”
                            </div>
                          )}

                          <div className="border border-neutral-300 bg-[#faf8f4] p-6 max-h-96 overflow-y-auto font-mono text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap">
                            {currentAnalysis.extractedText}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 4: DOCUMENT Q&A (VOICE INPUT + VOICE OUTPUT)           */}
              {/* =========================================================== */}
              {activePage === 'qa' && (
                <div className="space-y-10">
                  <div className="border-b border-neutral-200 pb-6 space-y-2">
                    <h1 className="font-serif-display text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                      {t.qaPageHeading}
                    </h1>
                    <p className="text-sm text-neutral-600 max-w-2xl">{t.qaPageSubtitle}</p>
                  </div>

                  {!currentAnalysis ? (
                    <div className="py-16 border-b border-neutral-200 space-y-4 max-w-lg">
                      <h2 className="text-lg font-semibold text-neutral-950">
                        {t.noDocumentsYetTitle}
                      </h2>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {t.noDocumentsYetDesc}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigateTo('analyze')}
                        className="px-6 py-3 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        {t.uploadFirstDocBtn}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Document Context Selector */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-neutral-900" />
                          <span className="text-neutral-400 uppercase">{t.qaSelectDocLabel}:</span>
                          {analyses.length > 1 ? (
                            <select
                              aria-label="Select Document"
                              value={currentAnalysis.id}
                              onChange={(e) => {
                                const found = analyses.find((a) => a.id === e.target.value);
                                if (found) selectAnalysisRecord(found);
                              }}
                              className="font-sans font-semibold text-neutral-950 bg-transparent border-b border-neutral-300 pb-0.5 focus:outline-none cursor-pointer"
                            >
                              {analyses.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                  {doc.documentName}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-sans font-semibold text-neutral-950">
                              {currentAnalysis.documentName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => navigateTo('analyze')}
                            className="text-xs font-mono uppercase tracking-wider text-neutral-700 hover:text-neutral-950 underline underline-offset-4 cursor-pointer"
                          >
                            ← {t.viewAnalysisBtn}
                          </button>
                          <span className="text-neutral-500">
                            {t.languageLabel}: {LANGUAGE_NATIVE_LABELS[selectedLanguage]}
                          </span>
                        </div>
                      </div>

                      {/* Question Input Form with Voice Microphone Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAskQuestion();
                        }}
                        className="space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input
                            type="text"
                            value={qaInput}
                            onChange={(e) => setQaInput(e.target.value)}
                            placeholder={t.qaInputPlaceholder}
                            disabled={isAskingQA}
                            className="flex-1 border border-neutral-300 focus:border-neutral-950 px-4 py-3 text-sm text-neutral-950 focus:outline-none"
                          />

                          <div className="flex items-center gap-2">
                            <VoiceMicButton
                              language={selectedLanguage}
                              onTranscript={(spokenText) => {
                                setQaError(null);
                                setQaInput((prev) =>
                                  prev ? `${prev} ${spokenText}`.trim() : spokenText
                                );
                              }}
                              onError={(errMsg) => setQaError(errMsg)}
                            />

                            <button
                              type="submit"
                              disabled={!qaInput.trim() || isAskingQA}
                              className="px-6 py-3 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-30 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{t.qaSubmitBtn}</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400">
                          {t.voicePrivacyNotice}
                        </p>
                      </form>

                      {/* Suggested Questions */}
                      <div className="space-y-2">
                        <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                          {t.qaSuggestedHeading}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {t.qaSuggestedQuestions.map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => handleAskQuestion(q)}
                              disabled={isAskingQA}
                              className="text-xs text-neutral-700 hover:text-neutral-950 border border-neutral-200 hover:border-neutral-950 px-3 py-1.5 transition-colors cursor-pointer"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>

                      {isAskingQA && (
                        <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-600 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                          <span>{t.qaSearchingStatus}</span>
                        </div>
                      )}

                      {qaError && (
                        <div className="border-l-2 border-neutral-950 pl-3 py-1 text-xs text-red-700">
                          {qaError}
                        </div>
                      )}

                      {/* Q&A Conversation Log with Voice Output Read-Aloud */}
                      <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                        {!currentAnalysis.qaHistory || currentAnalysis.qaHistory.length === 0 ? (
                          <p className="py-12 text-xs font-mono text-neutral-400 text-center">
                            {t.qaEmptyState}
                          </p>
                        ) : (
                          [...currentAnalysis.qaHistory].reverse().map((qa) => (
                            <div key={qa.id} className="py-6 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm sm:text-base font-semibold text-neutral-950">
                                  Q: {qa.question}
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono text-neutral-400">
                                    {qa.language} · {qa.pageOrSection}
                                  </span>
                                  <VoiceSpeakerButton
                                    text={qa.answer}
                                    language={selectedLanguage}
                                  />
                                </div>
                              </div>

                              <p className="text-sm sm:text-base text-neutral-800 leading-relaxed">
                                {qa.answer}
                              </p>

                              {qa.foundInDocument && qa.evidence && (
                                <p className="text-xs font-mono text-neutral-500 italic">
                                  {t.evidenceLabel} ({qa.pageOrSection}): {qa.evidence}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 5: ANALYSIS HISTORY                                    */}
              {/* =========================================================== */}
              {activePage === 'history' && (
                <div className="space-y-10">
                  <div className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-2">
                      <h1 className="font-serif-display text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                        {t.historyPageHeading}
                      </h1>
                      <p className="text-sm text-neutral-600">{t.historyPageSubtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        navigateTo('analyze');
                      }}
                      className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors whitespace-nowrap self-start cursor-pointer"
                    >
                      + {t.startAgainBtn}
                    </button>
                  </div>

                  {/* Search & Risk Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 text-xs border border-neutral-300 focus:border-neutral-950 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1 border border-neutral-200 p-1">
                      {(['ALL', 'High', 'Medium', 'Low'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setHistoryRiskFilter(lvl)}
                          className={`px-3 py-1 text-xs font-mono transition-colors cursor-pointer ${
                            historyRiskFilter === lvl
                              ? 'bg-neutral-950 text-white'
                              : 'text-neutral-600 hover:text-neutral-950'
                          }`}
                        >
                          {lvl === 'ALL' ? t.filterAll : formatRiskLevel(lvl)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {analyses.length === 0 ? (
                    <div className="py-16 border-t border-b border-neutral-200 space-y-4">
                      <p className="text-base font-medium text-neutral-950">
                        {t.noDocumentsYetTitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigateTo('analyze')}
                        className="px-6 py-3 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest cursor-pointer"
                      >
                        {t.uploadFirstDocBtn}
                      </button>
                    </div>
                  ) : (
                    <div className="relative pl-8 border-l border-neutral-950 space-y-10 my-4">
                      {analyses
                        .filter((a) => {
                          const matchesSearch =
                            a.documentName.toLowerCase().includes(historySearch.toLowerCase()) ||
                            a.documentType.toLowerCase().includes(historySearch.toLowerCase());
                          const matchesRisk =
                            historyRiskFilter === 'ALL' || a.riskLevel === historyRiskFilter;
                          return matchesSearch && matchesRisk;
                        })
                        .map((item, idx) => (
                          <div
                            key={item.id}
                            className="relative pb-8 border-b border-neutral-300/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            {/* Spatial Node on the Chronological Trail */}
                            <span
                              aria-hidden="true"
                              className="w-3 h-3 rounded-full bg-[#f6f4ef] border-2 border-neutral-950 absolute -left-[38.5px] top-1.5"
                            />
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                                <span>NODE {String(idx + 1).padStart(2, '0')}</span>
                                <span>//</span>
                                <span>{new Date(item.uploadDate).toLocaleString()}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  selectAnalysisRecord(item);
                                  navigateTo('analyze');
                                }}
                                className="text-lg font-serif-display text-neutral-950 hover:underline text-left truncate block cursor-pointer"
                              >
                                {item.documentName}
                              </button>
                              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-600">
                                <span>{formatDocumentType(item.documentType)}</span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  {formatRiskLevel(item.riskLevel)} ({item.overallRiskScore}/100)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  selectAnalysisRecord(item);
                                  navigateTo('analyze');
                                }}
                                className="px-4 py-2 text-xs font-mono bg-neutral-950 text-white hover:bg-neutral-800 cursor-pointer"
                              >
                                {t.viewAnalysisBtn}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadReport(item)}
                                className="px-3.5 py-2 text-xs font-mono border border-neutral-300 hover:border-neutral-950 text-neutral-900 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAnalysis(item.id)}
                                className="p-2 text-neutral-400 hover:text-red-700 cursor-pointer"
                                title={t.deleteRecordBtn}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 6: GENERATED PDF REPORTS                               */}
              {/* =========================================================== */}
              {activePage === 'reports' && (
                <div className="space-y-10">
                  <div className="border-b border-neutral-200 pb-6 space-y-2">
                    <h1 className="font-serif-display text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                      {t.reportsPageHeading}
                    </h1>
                    <p className="text-sm text-neutral-600">{t.reportsPageSubtitle}</p>
                  </div>

                  {/* Available Documents for Direct PDF Report Generation */}
                  {analyses.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                        {t.statDocsAnalyzed} ({analyses.length})
                      </h2>
                      <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                        {analyses.map((doc) => (
                          <div
                            key={doc.id}
                            className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-neutral-950">
                                {doc.documentName}
                              </p>
                              <p className="text-xs font-mono text-neutral-500">
                                {formatRiskLevel(doc.riskLevel)} ({doc.overallRiskScore}/100) ·{' '}
                                {t.languageLabel}: {selectedLanguage}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadReport(doc)}
                              className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2 self-start cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              {t.downloadReportBtn} ({selectedLanguage})
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated Reports Log */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                      {t.reportsPageHeading} Log ({reports.length})
                    </h2>
                    {reports.length === 0 ? (
                      <p className="text-sm text-neutral-500 py-8 border-t border-b border-neutral-200">
                        {t.noReportsYet}
                      </p>
                    ) : (
                      <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
                        {reports.map((rep) => (
                          <div
                            key={rep.id}
                            className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm"
                          >
                            <div>
                              <p className="font-semibold text-neutral-950">{rep.documentName}</p>
                              <p className="text-xs font-mono text-neutral-500">
                                {t.reportGeneratedOn}: {new Date(rep.generatedAt).toLocaleString()} ·{' '}
                                {rep.language}
                              </p>
                            </div>
                            <span className="font-mono text-xs text-neutral-700">
                              Score: {rep.overallRiskScore}/100 ({rep.riskLevel})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 7: SETTINGS & LANGUAGE / VOICE SETTINGS                */}
              {/* =========================================================== */}
              {(activePage === 'settings' || activePage === 'language-voice') && (
                <div className="space-y-12 max-w-3xl">
                  <div className="border-b border-neutral-200 pb-6 space-y-2">
                    <h1 className="font-serif-display text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                      {activePage === 'language-voice' ? t.navLanguageVoice : t.settingsPageHeading}
                    </h1>
                    <p className="text-sm text-neutral-600">{t.settingsPageSubtitle}</p>
                  </div>

                  {/* Language Preference */}
                  <div className="space-y-4 border-b border-neutral-200 pb-10">
                    <h2 className="text-base font-semibold text-neutral-950">
                      {t.preferredLanguageSetting}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(lang)}
                          className={`py-3.5 px-4 border text-xs font-mono transition-colors cursor-pointer ${
                            selectedLanguage === lang
                              ? 'bg-neutral-950 text-white border-neutral-950 font-semibold'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-950'
                          }`}
                        >
                          {LANGUAGE_NATIVE_LABELS[lang]} ({lang})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Settings */}
                  <div className="space-y-4 border-b border-neutral-200 pb-10">
                    <h2 className="text-base font-semibold text-neutral-950">
                      {t.voiceSettingsHeading}
                    </h2>
                    <p className="text-sm text-neutral-700">{t.autoStopVoiceLabel}</p>
                    <p className="text-xs font-mono text-neutral-500">{t.voicePrivacyNotice}</p>
                  </div>

                  {/* External AI & Privacy Transparency */}
                  <div className="space-y-3">
                    <h2 className="text-base font-semibold text-neutral-950">
                      {t.privacySettingsHeading}
                    </h2>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {t.externalServiceExplanation}
                    </p>
                  </div>
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 8: PROFILE & PRIVACY                                   */}
              {/* =========================================================== */}
              {activePage === 'profile' && (
                <div className="space-y-12 max-w-2xl">
                  <div className="border-b border-neutral-200 pb-6 space-y-2">
                    <h1 className="font-serif-display text-4xl sm:text-5xl text-neutral-950 tracking-tight">
                      {t.profilePageHeading}
                    </h1>
                    <p className="text-sm text-neutral-600">{t.profilePageSubtitle}</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase text-neutral-500">
                        {t.fullNameLabel}
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full border border-neutral-300 focus:border-neutral-950 px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase text-neutral-500">
                        {t.emailAddressLabel}
                      </label>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-mono uppercase text-neutral-500">
                        {t.organizationLabel}
                      </label>
                      <input
                        type="text"
                        value={profileOrg}
                        onChange={(e) => setProfileOrg(e.target.value)}
                        className="w-full border border-neutral-300 focus:border-neutral-950 px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>

                    {profileSavedBanner && (
                      <p className="text-xs font-mono text-emerald-700">{t.profileSavedMsg}</p>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        className="px-7 py-3.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        {t.saveProfileBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('login')}
                        className="px-5 py-3.5 border border-neutral-300 hover:border-neutral-950 text-xs font-mono uppercase tracking-widest flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t.navLogin}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* =========================================================== */}
              {/* PAGE 9: LOGIN & REGISTRATION                                */}
              {/* =========================================================== */}
              {activePage === 'login' && (
                <div className="max-w-md mx-auto py-8 space-y-8">
                  <div className="border-b border-neutral-200 pb-6 space-y-2">
                    <h1 className="font-serif-display text-4xl text-neutral-950">
                      {authMode === 'login' ? t.loginHeading : t.registerHeading}
                    </h1>
                    <p className="text-xs font-mono text-neutral-500">{t.appTitle}</p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-5">
                    {authMode === 'register' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono uppercase text-neutral-500">
                            {t.fullNameLabel}
                          </label>
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full border border-neutral-300 focus:border-neutral-950 px-4 py-3 text-sm focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono uppercase text-neutral-500">
                            {t.organizationLabel}
                          </label>
                          <input
                            type="text"
                            value={authOrg}
                            onChange={(e) => setAuthOrg(e.target.value)}
                            className="w-full border border-neutral-300 focus:border-neutral-950 px-4 py-3 text-sm focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-neutral-500">
                        {t.emailAddressLabel}
                      </label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full border border-neutral-300 focus:border-neutral-950 px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-neutral-500">
                        {t.passwordLabel}
                      </label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full border border-neutral-300 focus:border-neutral-950 px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>

                    {authError && (
                      <p className="text-xs text-red-700 border-l-2 border-neutral-950 pl-3 py-1">
                        {authError}
                      </p>
                    )}

                    {authMessage && (
                      <p className="text-xs text-emerald-700 font-mono">{authMessage}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      {authMode === 'login' ? t.signInBtn : t.createAccountBtn}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthError(null);
                    }}
                    className="text-xs font-mono text-neutral-600 hover:text-neutral-950 underline underline-offset-4 cursor-pointer"
                  >
                    {authMode === 'login' ? t.switchToRegister : t.switchToLogin}
                  </button>
                </div>
              )}

              {/* Legal Disclaimer Footer on Every Page */}
              <div className="mt-20 pt-6 border-t border-neutral-200 text-xs font-mono text-neutral-400">
                {t.legalDisclaimer}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
