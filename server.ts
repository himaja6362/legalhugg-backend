import express, { Request, Response } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { createServer as createViteServer } from 'vite';
import {
  resolveHfConfig,
  runLegalAnalysisWithHuggingFace,
  answerDocumentQuestionWithHf,
  translateAnalysisWithHf,
} from './hf_engine';

const execFileAsync = promisify(execFile);

// Load environment variables from .env, .env.local, and backend_fastapi/.env
// using override: true so settings in .env always take precedence
for (const envFile of ['.env', '.env.local', path.join('backend_fastapi', '.env')]) {
  const fullEnvPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullEnvPath)) {
    dotenv.config({ path: fullEnvPath, override: true });
  }
}
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for local development (Antigravity / VS Code separate frontend & backend terminals)
app.use((req: Request, res: Response, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

// Configure Multer in-memory storage (Protects user data: does not permanently store raw files on disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB max file size
  },
});

// Database Layer: Supports MongoDB Atlas with automatic local JSON fallback
// Collections: Users, Documents, AnalysisResults, Schemes, Reports
let mongoDb: Db | null = null;
const LOCAL_DB_PATH = path.join(process.cwd(), 'data_store.json');

interface DatabaseSchema {
  Users: any[];
  Documents: any[];
  AnalysisResults: any[];
  Schemes: any[];
  Reports: any[];
}

const DEFAULT_SCHEMES = [
  {
    id: 'scheme-emp-01',
    name: 'Indian Employment & Service Agreement Standard',
    category: 'Employment Law',
    description: 'Standard compliance checklist for employment contracts, non-compete clauses (Section 27, Indian Contract Act), notice periods, and IP assignment.',
    mandatoryClauses: [
      'Compensation & CTC Breakdown',
      'Notice Period & Termination Conditions',
      'Confidentiality & Non-Disclosure',
      'Intellectual Property Assignment',
      'Dispute Resolution & Governing Jurisdiction',
    ],
    commonRisks: [
      'Post-termination non-compete restrictions (void under Section 27 of Indian Contract Act, 1872)',
      'Unilateral termination without notice or severance pay',
      'Excessive training bond or liquidated damages penalty',
      'Broad intellectual property claims over personal off-hours work',
    ],
    regulatoryFramework: 'Indian Contract Act, 1872 & Shops and Establishments Act',
  },
  {
    id: 'scheme-lease-02',
    name: 'Residential & Commercial Lease / Rental Agreement',
    category: 'Real Estate & Tenancy',
    description: 'Verification framework for rental agreements, security deposit refund timelines, lock-in periods, maintenance liability, and eviction notice.',
    mandatoryClauses: [
      'Monthly Rent & Escalation Percentage',
      'Refundable Security Deposit Terms',
      'Lock-in Period & Early Termination Penalty',
      'Structural vs. Routine Maintenance Responsibility',
      'Notice Period for Vacating Premises',
    ],
    commonRisks: [
      'Arbitrary security deposit forfeiture without itemized proof of damage',
      'Uncapped annual rent escalation clauses',
      'Unannounced landlord entry without 24-hour prior notice',
      'One-sided lock-in period binding only the tenant',
    ],
    regulatoryFramework: 'Transfer of Property Act, 1882 & Model Tenancy Act',
  },
  {
    id: 'scheme-nda-03',
    name: 'Mutual & Unilateral Non-Disclosure Agreement (NDA)',
    category: 'Corporate & IP',
    description: 'Standard benchmark for evaluating confidentiality scope, exclusions from confidential information, survival period, and injunctive relief.',
    mandatoryClauses: [
      'Definition of Confidential Information',
      'Standard Exclusions (Public Domain, Prior Knowledge)',
      'Obligations of Receiving Party',
      'Term & Survival of Confidentiality',
      'Return or Destruction of Materials',
    ],
    commonRisks: [
      'Perpetual/indefinite confidentiality obligation with no time limit',
      'Missing exclusions for independently developed or publicly available information',
      'Pre-estimated liquidated damages disproportionate to actual breach',
      'Foreign or inconvenient governing law and arbitration venue',
    ],
    regulatoryFramework: 'Indian Contract Act, 1872 & Information Technology Act, 2000',
  },
  {
    id: 'scheme-vendor-04',
    name: 'Master Services Agreement (MSA) & SaaS Vendor Contract',
    category: 'Commercial & IT Services',
    description: 'Evaluation template for software/IT vendor contracts, SLA uptime credits, limitation of liability caps, indemnity, and payment milestones.',
    mandatoryClauses: [
      'Scope of Work (SOW) & Acceptance Criteria',
      'Payment Terms & Late Fee Interest',
      'Limitation of Liability Cap',
      'Indemnification & Third-Party IP Infringement',
      'Data Protection & DPDP Act Compliance',
    ],
    commonRisks: [
      'Uncapped or unlimited indemnification liability for indirect/consequential damages',
      'Auto-renewal clauses with narrow cancellation windows',
      'Payment withholding without clear dispute escalation timelines',
      'Lack of personal data breach notification timeline (DPDP Act, 2023)',
    ],
    regulatoryFramework: 'Indian Contract Act, 1872 & Digital Personal Data Protection Act, 2023',
  },
];

function loadLocalStore(): DatabaseSchema {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        Users: parsed.Users || [],
        Documents: (parsed.Documents || []).filter((d: any) => d.id !== 'doc-sample-101'),
        AnalysisResults: (parsed.AnalysisResults || []).filter((a: any) => a.id !== 'sample-analysis-101'),
        Schemes: parsed.Schemes?.length ? parsed.Schemes : DEFAULT_SCHEMES,
        Reports: parsed.Reports || [],
      };
    }
  } catch (e) {
    console.warn('Could not read local store, initializing default store:', e);
  }
  const initial: DatabaseSchema = {
    Users: [],
    Documents: [],
    AnalysisResults: [],
    Schemes: DEFAULT_SCHEMES,
    Reports: [],
  };
  saveLocalStore(initial);
  return initial;
}

function saveLocalStore(data: DatabaseSchema) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write local store:', e);
  }
}

async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.startsWith('mongodb') && !uri.includes('<username>')) {
    try {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      mongoDb = client.db('legal_risk_suite');
      console.log('Connected to MongoDB Atlas (legal_risk_suite)');

      // Ensure Schemes collection is seeded
      const schemesCount = await mongoDb.collection('Schemes').countDocuments();
      if (schemesCount === 0) {
        await mongoDb.collection('Schemes').insertMany(DEFAULT_SCHEMES);
      }
    } catch (err) {
      console.warn('MongoDB Atlas connection failed, using persistent local JSON database fallback:', err);
      mongoDb = null;
    }
  } else {
    loadLocalStore();
  }
}

// Helper to map a character offset in extractedText to its [Page N] marker
function findPageForIndex(text: string, index: number): string {
  const prefix = text.slice(0, Math.max(0, index));
  const matches = [...prefix.matchAll(/\[Page\s+(\d+)\]/gi)];
  if (matches.length > 0) {
    return `Page ${matches[matches.length - 1][1]}`;
  }
  return 'Page 1';
}

// Deterministic NLP Regex Scanner for Sensitive Personal Information (PII) with exact Page mapping
function detectSensitiveInfoRegex(text: string) {
  const detected: Array<{
    id: string;
    category:
      | 'Aadhaar Number'
      | 'Phone Number'
      | 'Email Address'
      | 'Physical Address'
      | 'Bank Account / IFSC'
      | 'PAN Number'
      | 'Other PII';
    maskedValue: string;
    originalSnippet: string;
    pageOrSection: string;
    severity: 'High' | 'Medium';
  }> = [];

  const seen = new Set<string>();

  // 1. Aadhaar Number: 12 digits formatted as XXXX XXXX XXXX or XXXX-XXXX-XXXX
  const aadhaarRegex = /\b([2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4})\b/g;
  let match;
  while ((match = aadhaarRegex.exec(text)) !== null) {
    const val = match[1].trim();
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length === 12 && !seen.has(digitsOnly)) {
      seen.add(digitsOnly);
      detected.push({
        id: `pii-aadhaar-${detected.length + 1}`,
        category: 'Aadhaar Number',
        maskedValue: `XXXX-XXXX-${digitsOnly.slice(-4)}`,
        originalSnippet: val,
        pageOrSection: findPageForIndex(text, match.index),
        severity: 'High',
      });
    }
  }

  // 2. Indian Phone Numbers
  const phoneRegex = /(?:(?:\+|0{0,2})91[\s-]?)?([6789]\d{4}[\s-]?\d{5})\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const fullMatch = match[0].trim();
    const digits = match[1].replace(/\D/g, '');
    if (digits.length === 10 && !seen.has(digits)) {
      seen.add(digits);
      detected.push({
        id: `pii-phone-${detected.length + 1}`,
        category: 'Phone Number',
        maskedValue: `+91 XXXXX ${digits.slice(-5)}`,
        originalSnippet: fullMatch,
        pageOrSection: findPageForIndex(text, match.index),
        severity: 'Medium',
      });
    }
  }

  // 3. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    const email = match[0].trim();
    if (!seen.has(email.toLowerCase())) {
      seen.add(email.toLowerCase());
      const [local, domain] = email.split('@');
      const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : '***';
      detected.push({
        id: `pii-email-${detected.length + 1}`,
        category: 'Email Address',
        maskedValue: `${maskedLocal}@${domain}`,
        originalSnippet: email,
        pageOrSection: findPageForIndex(text, match.index),
        severity: 'Medium',
      });
    }
  }

  // 4. IFSC Code / Bank Account
  const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;
  while ((match = ifscRegex.exec(text)) !== null) {
    const ifsc = match[0].trim();
    if (!seen.has(ifsc)) {
      seen.add(ifsc);
      detected.push({
        id: `pii-ifsc-${detected.length + 1}`,
        category: 'Bank Account / IFSC',
        maskedValue: `IFSC: ${ifsc.slice(0, 4)}0XXXXXX`,
        originalSnippet: ifsc,
        pageOrSection: findPageForIndex(text, match.index),
        severity: 'High',
      });
    }
  }

  // 5. PAN Number
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  while ((match = panRegex.exec(text)) !== null) {
    const pan = match[0].trim();
    if (!seen.has(pan)) {
      seen.add(pan);
      detected.push({
        id: `pii-pan-${detected.length + 1}`,
        category: 'PAN Number',
        maskedValue: `${pan.slice(0, 2)}XXX${pan.slice(5, 9)}X`,
        originalSnippet: pan,
        pageOrSection: findPageForIndex(text, match.index),
        severity: 'High',
      });
    }
  }

  return detected;
}

// Try extracting PDF text via Python PyMuPDF (`fitz`) first when available in the runtime (Linux, macOS, or Windows)
async function tryExtractPdfWithPyMuPDF(buffer: Buffer): Promise<{
  pages: Array<{ num: number; text: string }>;
  total: number;
  encrypted?: boolean;
} | null> {
  const tmpPath = path.join(
    os.tmpdir(),
    `upload-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`
  );
  try {
    fs.writeFileSync(tmpPath, buffer);
    const pyScript = `
import sys, json
import fitz
doc = fitz.open(sys.argv[1])
if doc.is_encrypted:
    print(json.dumps({"encrypted": True}))
    sys.exit(0)
pages = []
for idx in range(len(doc)):
    page = doc.load_page(idx)
    txt = page.get_text("text") or ""
    pages.append({"num": idx + 1, "text": txt.strip()})
print(json.dumps({"encrypted": False, "total": len(doc), "pages": pages}))
`;
    const pythonBins = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
    for (const bin of pythonBins) {
      try {
        const { stdout } = await execFileAsync(bin, ['-c', pyScript, tmpPath], {
          timeout: 15000,
          maxBuffer: 25 * 1024 * 1024,
        });
        const parsed = JSON.parse(stdout.trim());
        if (parsed) return parsed;
      } catch (_binErr) {
        // try next python binary
      }
    }
    return null;
  } catch (_err) {
    return null;
  } finally {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch (_e) {
      // ignore cleanup error
    }
  }
}

// Scanned PDF OCR fallback using PyMuPDF page rendering + Tesseract.js OCR (zero external paid API needed)
async function tryExtractScannedPdfOcr(
  buffer: Buffer
): Promise<Array<{ num: number; text: string }> | null> {
  const tmpDir = path.join(
    os.tmpdir(),
    `ocr-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const tmpPdf = path.join(tmpDir, 'input.pdf');
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(tmpPdf, buffer);

    // Render pages to PNG via PyMuPDF if available
    const pyRenderScript = `
import sys, os, json
import fitz
doc = fitz.open(sys.argv[1])
out_dir = sys.argv[2]
images = []
for idx in range(min(len(doc), 15)):
    page = doc.load_page(idx)
    pix = page.get_pixmap(dpi=150)
    img_path = os.path.join(out_dir, f"page_{idx+1}.png")
    pix.save(img_path)
    images.append({"num": idx + 1, "path": img_path})
print(json.dumps(images))
`;
    const pythonBins = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];
    let renderedPages: Array<{ num: number; path: string }> = [];
    for (const bin of pythonBins) {
      try {
        const { stdout } = await execFileAsync(bin, ['-c', pyRenderScript, tmpPdf, tmpDir], {
          timeout: 25000,
        });
        renderedPages = JSON.parse(stdout.trim());
        if (renderedPages.length > 0) break;
      } catch (_e) {
        // try next binary
      }
    }

    if (renderedPages.length > 0) {
      const { recognize } = await import('tesseract.js');
      const ocrPages: Array<{ num: number; text: string }> = [];
      for (const pg of renderedPages) {
        if (fs.existsSync(pg.path)) {
          const result = await recognize(pg.path, 'eng');
          const txt = String(result?.data?.text || '').trim();
          ocrPages.push({ num: pg.num, text: txt });
        }
      }
      return ocrPages;
    }
    return null;
  } catch (_err) {
    return null;
  } finally {
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch (_e) {
      // ignore cleanup error
    }
  }
}

// Extract text from PDF or DOCX buffer with page-level preservation, table support, and OCR fallback
async function extractDocumentText(file: Express.Multer.File): Promise<{
  text: string;
  pages: Array<{ num: number; text: string }>;
  pageCount: number;
  fileType: 'PDF' | 'DOCX' | 'TXT';
  usedOcr?: boolean;
}> {
  const originalName = (file.originalname || '').toLowerCase();
  const mime = file.mimetype || '';

  if (!file.buffer || file.buffer.length === 0) {
    throw new Error('The uploaded file is empty (0 bytes). Please select a valid document.');
  }

  if (originalName.endsWith('.pdf') || mime === 'application/pdf') {
    // Check PDF magic header (%PDF-)
    const headerSlice = file.buffer.subarray(0, 1024).toString('latin1');
    if (!headerSlice.includes('%PDF-')) {
      throw new Error(
        'The uploaded file is corrupted or is not a valid PDF document (missing %PDF header).'
      );
    }

    let pagesList: Array<{ num: number; text: string }> = [];
    let numPages = 1;
    let usedOcr = false;

    try {
      // 1. Try PyMuPDF (fitz) if installed in Python environment
      const fitzResult = await tryExtractPdfWithPyMuPDF(file.buffer);
      if (fitzResult) {
        if (fitzResult.encrypted) {
          throw new Error('PASSWORD_PROTECTED_PDF');
        }
        pagesList = fitzResult.pages || [];
        numPages = fitzResult.total || pagesList.length || 1;
        } else {
          // 2. Use PDFParse (pdfjs-based page-by-page extractor) with fallback to pdf-parse default function
          const pdfParseModule: any = await import('pdf-parse');
          let extractedViaClass = false;

          if (typeof pdfParseModule.PDFParse === 'function') {
            const parser = new pdfParseModule.PDFParse({
              data: new Uint8Array(file.buffer),
              verbosity: 0,
            });
            try {
              const textResult = await parser.getText();
              let tableResult: any = null;
              if (typeof parser.getTable === 'function') {
                try {
                  tableResult = await parser.getTable();
                } catch (_te) {
                  tableResult = null;
                }
              }

              if (textResult?.pages && Array.isArray(textResult.pages) && textResult.pages.length > 0) {
                pagesList = textResult.pages.map((p: any, i: number) => {
                  const pageNum = p.num || i + 1;
                  let pageText = String(p.text || '').trim();

                  // Append structured table rows if getTable found tables not already represented
                  const pageTables = tableResult?.pages?.find((tp: any) => tp.num === pageNum)?.tables;
                  if (Array.isArray(pageTables) && pageTables.length > 0) {
                    const formattedTables = pageTables
                      .map((tbl: any) =>
                        Array.isArray(tbl)
                          ? tbl
                              .map((row: any) =>
                                Array.isArray(row) ? row.map((c: any) => String(c || '').trim()).join(' | ') : ''
                              )
                              .filter(Boolean)
                              .join('\n')
                          : ''
                      )
                      .filter(Boolean)
                      .join('\n');
                    if (formattedTables && !pageText.includes(formattedTables.slice(0, 25))) {
                      pageText = `${pageText}\n[Table Data]\n${formattedTables}`.trim();
                    }
                  }

                  return { num: pageNum, text: pageText };
                });
                extractedViaClass = pagesList.some((p) => p.text.trim().length > 0);
              } else if (textResult?.text && String(textResult.text).trim().length > 0) {
                const cleaned = String(textResult.text)
                  .replace(/\n\n--\s*\d+\s*of\s*\d+\s*--\n\n/g, '\n\n')
                  .trim();
                pagesList = [{ num: 1, text: cleaned }];
                extractedViaClass = true;
              }
              numPages = textResult?.total || pagesList.length || 1;
            } catch (pdfClassErr: any) {
              console.warn('PDFParse class getText warning, trying fallback:', pdfClassErr?.message);
            } finally {
              if (typeof parser.destroy === 'function') {
                await parser.destroy().catch(() => {});
              }
            }
          }

          if (!extractedViaClass) {
            const pdfParseFn =
              typeof pdfParseModule.default === 'function'
                ? pdfParseModule.default
                : typeof pdfParseModule === 'function'
                ? pdfParseModule
                : null;
            if (pdfParseFn) {
              try {
                const data = await pdfParseFn(file.buffer);
                const cleaned = String(data?.text || '').trim();
                if (cleaned) {
                  numPages = data?.numpages || 1;
                  pagesList = [{ num: 1, text: cleaned }];
                }
              } catch (_legacyErr) {
                // Continue to OCR fallback if digital extraction fails
              }
            }
          }
        }

        // Check how much actual text was extracted across all pages
        const combinedDigitalText = pagesList
          .map((p) => p.text.trim())
          .filter(Boolean)
          .join('\n\n');

        // Detect scanned PDFs or PDFs where digital extraction yielded no/minimal text
        const pagesWithNoText = pagesList.filter((p) => p.text.replace(/\s+/g, '').length < 5).length;
        const needsOcr =
          combinedDigitalText.replace(/\s+/g, '').length < 10 ||
          (pagesList.length > 0 && pagesWithNoText === pagesList.length);

        if (needsOcr) {
          // Scanned PDF OCR fallback: try Python PyMuPDF + pytesseract / rapidocr if available, or extract embedded images with Tesseract.js
          const ocrPages = await tryExtractScannedPdfOcr(file.buffer);
          if (ocrPages && ocrPages.some((p) => p.text.trim().length > 0)) {
            usedOcr = true;
            pagesList = ocrPages;
            numPages = Math.max(numPages, pagesList.length);
          } else {
            throw new Error('NO_EXTRACTABLE_TEXT_PDF');
          }
        }

      const finalPages = pagesList.filter((p) => p.text.trim().length > 0);
      if (finalPages.length === 0) {
        throw new Error('NO_EXTRACTABLE_TEXT_PDF');
      }

      // Do NOT reject valid short documents — any PDF with genuine readable text is accepted
      const formattedFullText = pagesList
        .map((p) => `[Page ${p.num}]\n${p.text.trim() || '(No extractable text on this page)'}`)
        .join('\n\n')
        .trim();

      return {
        text: formattedFullText,
        pages: pagesList,
        pageCount: numPages,
        fileType: 'PDF',
        usedOcr,
      };
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (
        msg === 'PASSWORD_PROTECTED_PDF' ||
        msg.toLowerCase().includes('password') ||
        err?.name === 'PasswordException'
      ) {
        throw new Error(
          'This PDF file is encrypted or password-protected. Please unlock the PDF before uploading.'
        );
      }
      if (msg === 'NO_EXTRACTABLE_TEXT_PDF') {
        throw new Error(
          'This PDF contains no extractable text or readable content (blank or image-only without recognizable text).'
        );
      }
      if (
        err?.name === 'InvalidPDFException' ||
        err?.name === 'FormatError' ||
        msg.toLowerCase().includes('invalid pdf') ||
        msg.toLowerCase().includes('corrupted')
      ) {
        throw new Error(
          'The uploaded PDF file appears to be corrupted or has an invalid PDF structure. Please check the file and try again.'
        );
      }
      throw new Error(msg || 'Failed to extract text from the uploaded PDF file.');
    }
  } else if (
    originalName.endsWith('.docx') ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      const cleanText = (result.value || '').trim();
      if (!cleanText) {
        throw new Error('EMPTY_DOCX');
      }
      const words = cleanText.split(/\s+/);
      const wordsPerPage = 350;
      const pages: Array<{ num: number; text: string }> = [];
      for (let i = 0; i < words.length; i += wordsPerPage) {
        const pageWords = words.slice(i, i + wordsPerPage).join(' ');
        pages.push({ num: pages.length + 1, text: pageWords });
      }
      const formattedText = pages.map((p) => `[Page ${p.num}]\n${p.text}`).join('\n\n');
      return {
        text: formattedText,
        pages,
        pageCount: Math.max(1, pages.length),
        fileType: 'DOCX',
      };
    } catch (err: any) {
      if (err.message === 'EMPTY_DOCX') {
        throw new Error('The uploaded DOCX document is empty or contains no readable text.');
      }
      throw new Error(
        `Failed to extract text from DOCX: ${err.message || 'Corrupted or invalid DOCX file.'}`
      );
    }
  } else if (originalName.endsWith('.txt') || mime === 'text/plain') {
    const cleanText = file.buffer.toString('utf-8').trim();
    if (!cleanText) {
      throw new Error('The uploaded text document is empty.');
    }
    const pages = [{ num: 1, text: cleanText }];
    return {
      text: `[Page 1]\n${cleanText}`,
      pages,
      pageCount: 1,
      fileType: 'TXT',
    };
  } else {
    throw new Error(
      'Unsupported file format. Please upload a valid PDF (.pdf) or Microsoft Word (.docx) document.'
    );
  }
}

// Verify or ground an AI-reported quote against the extracted document text so fabricated quotes are never presented
function verifyEvidenceAgainstDocument(
  quote: string,
  reportedPageOrSection: string,
  fullText: string,
  pages: Array<{ num: number; text: string }>
): { verified: boolean; matchedExcerpt: string; pageOrSection: string } {
  const cleanQuote = String(quote || '').trim();
  if (!cleanQuote || cleanQuote.length < 4) {
    return { verified: false, matchedExcerpt: '', pageOrSection: reportedPageOrSection || 'Document' };
  }

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Check if a quote or its significant segments appear in any page
  const candidateSegments = cleanQuote
    .split(/(?:\s*\.\.\.\s*|\s*…\s*|\s*\|\s*|\s*;\s*)/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6);

  const segmentsToCheck = candidateSegments.length > 0 ? candidateSegments : [cleanQuote];
  const matchedPages: number[] = [];

  for (const seg of segmentsToCheck) {
    const normSeg = normalize(seg);
    if (!normSeg) continue;
    const words = normSeg.split(' ').filter(Boolean);
    const searchProbe = words.slice(0, Math.min(words.length, 8)).join(' ');

    for (const p of pages) {
      const normPage = normalize(p.text);
      if (
        normPage.includes(normSeg) ||
        (searchProbe.length >= 10 && normPage.includes(searchProbe))
      ) {
        if (!matchedPages.includes(p.num)) {
          matchedPages.push(p.num);
        }
      }
    }
  }

  if (matchedPages.length > 0) {
    const pageLabel =
      matchedPages.length === 1
        ? `Page ${matchedPages[0]}`
        : `Pages ${matchedPages.join(', ')}`;
    const hasPageInReported = /page\s*\d+/i.test(reportedPageOrSection || '');
    const resolvedLocation = hasPageInReported
      ? `${reportedPageOrSection} (${pageLabel})`
      : reportedPageOrSection
      ? `${pageLabel} · ${reportedPageOrSection}`
      : pageLabel;
    return {
      verified: true,
      matchedExcerpt: cleanQuote,
      pageOrSection: resolvedLocation,
    };
  }

  // Fallback check against fullText normalized
  const normFull = normalize(fullText);
  const normFullQuote = normalize(cleanQuote);
  const probeWords = normFullQuote.split(' ').slice(0, 7).join(' ');
  if (
    (normFullQuote.length >= 6 && normFull.includes(normFullQuote)) ||
    (probeWords.length >= 12 && normFull.includes(probeWords))
  ) {
    return {
      verified: true,
      matchedExcerpt: cleanQuote,
      pageOrSection: reportedPageOrSection || 'Page 1',
    };
  }

  return { verified: false, matchedExcerpt: cleanQuote, pageOrSection: reportedPageOrSection || '' };
}

// Split a multi-page document into page-preserving chunks when the document is very long
function buildPageAwareChunks(
  pages: Array<{ num: number; text: string }>,
  maxChunkChars = 16000
): Array<{ startPage: number; endPage: number; text: string }> {
  const chunks: Array<{ startPage: number; endPage: number; text: string }> = [];
  let currentPages: Array<{ num: number; text: string }> = [];
  let currentLen = 0;

  for (const page of pages) {
    const formattedPage = `[Page ${page.num}]\n${page.text}\n\n`;
    if (currentLen + formattedPage.length > maxChunkChars && currentPages.length > 0) {
      chunks.push({
        startPage: currentPages[0].num,
        endPage: currentPages[currentPages.length - 1].num,
        text: currentPages.map((p) => `[Page ${p.num}]\n${p.text}`).join('\n\n'),
      });
      // Keep last page as overlap context for cross-page continuity
      const overlapPage = currentPages[currentPages.length - 1];
      currentPages = [overlapPage, page];
      currentLen = `[Page ${overlapPage.num}]\n${overlapPage.text}\n\n`.length + formattedPage.length;
    } else {
      currentPages.push(page);
      currentLen += formattedPage.length;
    }
  }

  if (currentPages.length > 0) {
    chunks.push({
      startPage: currentPages[0].num,
      endPage: currentPages[currentPages.length - 1].num,
      text: currentPages.map((p) => `[Page ${p.num}]\n${p.text}`).join('\n\n'),
    });
  }

  return chunks;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// 1. Health & Database Status
app.get('/api/health', async (_req: Request, res: Response) => {
  const hfConfig = resolveHfConfig();
  res.json({
    status: 'ok',
    aiProvider: 'Hugging Face',
    hfTokenConfigured: hfConfig.hasToken,
    hfInferenceMode: hfConfig.mode,
    models: {
      llmInferenceApi: hfConfig.llmModel,
      localLlmModel: hfConfig.localLlmModel,
      nerModel: hfConfig.nerModel,
      nliClassifierModel: hfConfig.zscModel,
      extractiveQaModel: hfConfig.qaModel,
    },
    databaseMode: mongoDb ? 'MongoDB Atlas' : 'Persistent Local Collection Store (MongoDB Schema Compatible)',
    collections: ['Users', 'Documents', 'AnalysisResults', 'Schemes', 'Reports'],
    supportedLanguages: ['English', 'Kannada', 'Hindi', 'Telugu'],
  });
});

// 2. Get All Analysis History & Database Stats (Private per User)
app.get('/api/analyses', async (req: Request, res: Response) => {
  try {
    const userId = String(req.query.userId || '').trim();
    const filter = userId ? { userId } : {};

    if (mongoDb) {
      const list = await mongoDb
        .collection('AnalysisResults')
        .find(filter)
        .sort({ uploadDate: -1 })
        .limit(50)
        .toArray();
      const schemes = await mongoDb.collection('Schemes').find({}).toArray();
      const reports = await mongoDb
        .collection('Reports')
        .find(filter)
        .sort({ generatedAt: -1 })
        .limit(30)
        .toArray();
      return res.json({ analyses: list, schemes, reports });
    } else {
      const store = loadLocalStore();
      const analyses = userId
        ? store.AnalysisResults.filter((a: any) => a.userId === userId)
        : store.AnalysisResults;
      const reports = userId
        ? store.Reports.filter((r: any) => !r.userId || r.userId === userId)
        : store.Reports;
      return res.json({
        analyses,
        schemes: store.Schemes,
        reports,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Database retrieval error' });
  }
});

// 3. Get Single Analysis by ID
app.get('/api/analyses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (mongoDb) {
      const record = await mongoDb.collection('AnalysisResults').findOne({ id });
      if (!record) return res.status(404).json({ error: 'Analysis record not found.' });
      return res.json(record);
    } else {
      const store = loadLocalStore();
      const record = store.AnalysisResults.find((a) => a.id === id);
      if (!record) return res.status(404).json({ error: 'Analysis record not found.' });
      return res.json(record);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch analysis' });
  }
});

// 4. Delete Analysis by ID
app.delete('/api/analyses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (mongoDb) {
      await mongoDb.collection('AnalysisResults').deleteOne({ id });
      return res.json({ success: true });
    } else {
      const store = loadLocalStore();
      store.AnalysisResults = store.AnalysisResults.filter((a) => a.id !== id);
      saveLocalStore(store);
      return res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete analysis record' });
  }
});

// 5. Upload & Analyze Document (PDF, DOCX, or Sample Text)
app.post('/api/analyze', upload.single('file'), async (req: Request, res: Response) => {
  let extractedText = '';
  let extractedPages: Array<{ num: number; text: string }> = [];
  let documentName = '';
  let fileType: 'PDF' | 'DOCX' | 'TXT' = 'PDF';
  let fileSize = 0;
  let pageCount = 1;
  let wordCount = 0;

  // Stage 1: Validate & Extract Document Text (kept strictly separate from AI service errors)
  try {
    if (req.file) {
      documentName = req.file.originalname;
      fileSize = req.file.size;
      const extraction = await extractDocumentText(req.file);
      extractedText = extraction.text;
      extractedPages = extraction.pages;
      pageCount = extraction.pageCount;
      fileType = extraction.fileType;
    } else if (req.body && req.body.rawText && req.body.documentName) {
      const raw = String(req.body.rawText).trim();
      if (!raw) {
        return res.status(400).json({ error: 'The provided document text is empty.' });
      }
      extractedText = `[Page 1]\n${raw}`;
      extractedPages = [{ num: 1, text: raw }];
      documentName = String(req.body.documentName).trim();
      fileType = 'TXT';
      fileSize = Buffer.byteLength(raw, 'utf-8');
      pageCount = Math.max(1, Math.ceil(raw.split(/\s+/).length / 350));
    } else {
      return res.status(400).json({ error: 'No valid file uploaded. Please select a PDF or DOCX document.' });
    }

    wordCount = extractedText
      .replace(/\[Page\s+\d+\]/gi, '')
      .split(/\s+/)
      .filter(Boolean).length;
  } catch (extractErr: any) {
    console.error('[Document Extraction Error]:', extractErr?.message || extractErr);
    return res.status(400).json({
      stage: 'document_extraction',
      error: extractErr.message || 'Failed to extract text from the uploaded document.',
    });
  }

  // Persist extracted document metadata so the document is never lost even if the AI endpoint is temporarily unavailable
  const documentId = `doc-${Date.now()}`;
  const uploadDate = new Date().toISOString();
  const docMetadata = {
    id: documentId,
    userId: req.body?.userId || 'user-btech-demo',
    documentName,
    fileType,
    fileSize,
    pageCount,
    wordCount,
    uploadDate,
    extractedTextPreview: extractedText.slice(0, 600),
  };

  // Stage 2: Run Hugging Face AI & NLP Risk Analysis (returns clear 503 with exact AI cause if unavailable)
  try {
    const regexPii = detectSensitiveInfoRegex(extractedText);
    const aiResult = await runLegalAnalysisWithHuggingFace(
      documentName,
      extractedText,
      extractedPages,
      buildPageAwareChunks,
      verifyEvidenceAgainstDocument
    );

    // Normalize Risk Level & Score strictly based on actual AI findings (never default 0 to 50)
    const rawScore = Number(aiResult.overallRiskScore);
    let score = Number.isFinite(rawScore)
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : (aiResult.risks?.length || 0) === 0 && (aiResult.conflictingInformation?.length || 0) === 0
      ? 10
      : 45;
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (aiResult.riskLevel === 'Low' || aiResult.riskLevel === 'Medium' || aiResult.riskLevel === 'High') {
      riskLevel = aiResult.riskLevel;
    } else {
      riskLevel = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low';
    }

    // Merge AI-detected PII with deterministic Regex-detected PII (avoiding duplicates)
    const combinedSensitive: any[] = [];
    const seenSnippets = new Set<string>();

    for (const item of aiResult.sensitiveInformation || []) {
      const key = (item.originalSnippet || item.maskedValue || '').toLowerCase();
      if (key && !seenSnippets.has(key)) {
        seenSnippets.add(key);
        combinedSensitive.push({
          id: `sens-ai-${combinedSensitive.length + 1}`,
          category: item.category || 'Other PII',
          maskedValue: item.maskedValue || 'REDACTED',
          originalSnippet: item.originalSnippet || '',
          pageOrSection: item.pageOrSection || 'Document Body',
          severity: item.severity === 'High' ? 'High' : 'Medium',
        });
      }
    }

    for (const item of regexPii) {
      const alreadyPresent = combinedSensitive.some(
        (existing) =>
          existing.originalSnippet.includes(item.originalSnippet) ||
          item.originalSnippet.includes(existing.originalSnippet)
      );
      if (!alreadyPresent) {
        combinedSensitive.push(item);
      }
    }

    const analysisId = `analysis-${Date.now()}`;

    const newRecord = {
      id: analysisId,
      userId: req.body?.userId || 'user-btech-demo',
      userName: req.body?.userName || 'B.Tech User',
      documentId,
      documentName,
      fileType,
      fileSize,
      pageCount,
      wordCount,
      uploadDate,
      overallRiskScore: score,
      riskLevel,
      documentType: aiResult.documentType || 'Legal Agreement',
      summary: aiResult.summary || 'Analysis completed.',
      extractedText,
      importantInformation: {
        importantTerms: aiResult.importantInformation?.importantTerms || [],
        obligations: aiResult.importantInformation?.obligations || [],
        deadlines: aiResult.importantInformation?.deadlines || [],
        penalties: aiResult.importantInformation?.penalties || [],
        paymentConditions: aiResult.importantInformation?.paymentConditions || [],
        terminationConditions: aiResult.importantInformation?.terminationConditions || [],
      },
      risks: (aiResult.risks || []).map((r: any, idx: number) => ({
        id: `risk-${idx + 1}`,
        title: r.title || `Risk Item ${idx + 1}`,
        riskLevel: r.riskLevel === 'High' || r.riskLevel === 'Medium' || r.riskLevel === 'Low' ? r.riskLevel : 'Medium',
        reason: r.reason || '',
        simpleExplanation: r.simpleExplanation || '',
        supportingEvidence: r.supportingEvidence || 'Refer to document text',
        pageOrSection: r.pageOrSection || 'Document Section',
        category: r.category || 'General Clause',
      })),
      missingInformation: (aiResult.missingInformation || []).map((m: any, idx: number) => ({
        id: `miss-${idx + 1}`,
        type: 'missing',
        title: m.title,
        description: m.description,
        evidenceOrContext: m.evidenceOrContext,
        pageOrSection: m.pageOrSection,
        recommendation: m.recommendation,
      })),
      conflictingInformation: (aiResult.conflictingInformation || []).map((c: any, idx: number) => ({
        id: `conf-${idx + 1}`,
        type: 'conflicting',
        title: c.title,
        description: c.description,
        evidenceOrContext: c.evidenceOrContext,
        pageOrSection: c.pageOrSection,
        recommendation: c.recommendation,
      })),
      ambiguousInformation: (aiResult.ambiguousInformation || []).map((a: any, idx: number) => ({
        id: `amb-${idx + 1}`,
        type: 'ambiguous',
        title: a.title,
        description: a.description,
        evidenceOrContext: a.evidenceOrContext,
        pageOrSection: a.pageOrSection,
        recommendation: a.recommendation,
      })),
      sensitiveInformation: combinedSensitive,
      qaHistory: [],
      translations: {} as Record<string, any>,
    };

    const basePayloadToTranslate = {
      documentType: newRecord.documentType,
      summary: newRecord.summary,
      importantInformation: newRecord.importantInformation,
      risks: newRecord.risks.map((r: any) => ({
        id: r.id,
        title: r.title,
        reason: r.reason,
        simpleExplanation: r.simpleExplanation,
      })),
      documentChecks: [
        ...newRecord.missingInformation,
        ...newRecord.conflictingInformation,
        ...newRecord.ambiguousInformation,
      ].map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        recommendation: c.recommendation,
      })),
    };

    try {
      const [knTrans, hiTrans, teTrans] = await Promise.all([
        translateAnalysisWithHf(basePayloadToTranslate, 'Kannada'),
        translateAnalysisWithHf(basePayloadToTranslate, 'Hindi'),
        translateAnalysisWithHf(basePayloadToTranslate, 'Telugu'),
      ]);
      newRecord.translations = {
        Kannada: knTrans,
        Hindi: hiTrans,
        Telugu: teTrans,
      };
    } catch (_transErr) {
      // Keep on-demand /api/translate fallback
    }

    if (mongoDb) {
      await mongoDb.collection('Documents').insertOne(docMetadata);
      await mongoDb.collection('AnalysisResults').insertOne(newRecord);
    } else {
      const store = loadLocalStore();
      store.Documents.unshift(docMetadata);
      store.AnalysisResults.unshift(newRecord);
      saveLocalStore(store);
    }

    return res.json(newRecord);
  } catch (aiErr: any) {
    console.error('[Hugging Face AI Service Error]:', aiErr?.message || aiErr);
    // Save extracted document metadata so extraction succeeded and user can retry AI analysis
    try {
      if (mongoDb) {
        await mongoDb.collection('Documents').insertOne(docMetadata);
      } else {
        const store = loadLocalStore();
        store.Documents.unshift(docMetadata);
        saveLocalStore(store);
      }
    } catch (_dbErr) {
      // ignore
    }

    return res.status(503).json({
      stage: 'ai_analysis',
      extractionSucceeded: true,
      documentName,
      pageCount,
      wordCount,
      error: `Document text was extracted successfully (${pageCount} page(s), ${wordCount} words), but Hugging Face AI analysis failed: ${
        aiErr.message || 'The AI model service is temporarily unavailable.'
      } Your file remains selected so you can retry.`,
    });
  }
});

// 6. Document Q&A Endpoint (Strict Document-Grounded Answering via Hugging Face)
app.post('/api/qa', async (req: Request, res: Response) => {
  try {
    const { analysisId, question, language = 'English' } = req.body;
    if (!analysisId || !question) {
      return res.status(400).json({ error: 'Both analysisId and question are required.' });
    }

    let record: any = null;
    const store = !mongoDb ? loadLocalStore() : null;

    if (mongoDb) {
      record = await mongoDb.collection('AnalysisResults').findOne({ id: analysisId });
    } else if (store) {
      record = store.AnalysisResults.find((a) => a.id === analysisId);
    }

    if (!record) {
      return res.status(404).json({ error: 'Document analysis record not found.' });
    }

    const parsed = await answerDocumentQuestionWithHf(
      record.extractedText || '',
      String(question).trim(),
      language
    );

    const qaEntry = {
      id: `qa-${Date.now()}`,
      question: String(question).trim(),
      answer: parsed.foundInDocument
        ? parsed.answer
        : parsed.answer?.includes('Information not found in the uploaded document')
        ? parsed.answer
        : 'Information not found in the uploaded document.',
      evidence: parsed.foundInDocument ? parsed.evidence || 'No direct quote extracted.' : 'Not present in document.',
      pageOrSection: parsed.foundInDocument ? parsed.pageOrSection || 'Document Body' : 'N/A',
      foundInDocument: Boolean(parsed.foundInDocument),
      language,
      timestamp: new Date().toISOString(),
    };

    // Persist QA message to database
    if (mongoDb) {
      await mongoDb
        .collection('AnalysisResults')
        .updateOne({ id: analysisId }, { $push: { qaHistory: qaEntry } as any });
    } else if (store) {
      record.qaHistory = record.qaHistory || [];
      record.qaHistory.push(qaEntry);
      saveLocalStore(store);
    }

    return res.json(qaEntry);
  } catch (err: any) {
    console.error('[Hugging Face Q&A Error]:', err);
    return res.status(503).json({ error: err.message || 'Failed to answer question from document.' });
  }
});

// 7. Multi-Language Translation Endpoint (English, Kannada, Hindi, Telugu via Hugging Face)
app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const { analysisId, targetLanguage } = req.body;
    if (!analysisId || !targetLanguage) {
      return res.status(400).json({ error: 'analysisId and targetLanguage are required.' });
    }

    if (targetLanguage === 'English') {
      return res.json({ language: 'English', useOriginal: true });
    }

    let record: any = null;
    const store = !mongoDb ? loadLocalStore() : null;

    if (mongoDb) {
      record = await mongoDb.collection('AnalysisResults').findOne({ id: analysisId });
    } else if (store) {
      record = store.AnalysisResults.find((a) => a.id === analysisId);
    }

    if (!record) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }

    // Check cached translation
    if (record.translations && record.translations[targetLanguage]) {
      return res.json(record.translations[targetLanguage]);
    }

    const payloadToTranslate = {
      documentType: record.documentType,
      summary: record.summary,
      importantInformation: record.importantInformation,
      risks: (record.risks || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        reason: r.reason,
        simpleExplanation: r.simpleExplanation,
      })),
      documentChecks: [
        ...(record.missingInformation || []),
        ...(record.conflictingInformation || []),
        ...(record.ambiguousInformation || []),
      ].map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        recommendation: c.recommendation,
      })),
    };

    const translatedData = await translateAnalysisWithHf(payloadToTranslate, targetLanguage);

    // Save cached translation
    if (mongoDb) {
      await mongoDb
        .collection('AnalysisResults')
        .updateOne({ id: analysisId }, { $set: { [`translations.${targetLanguage}`]: translatedData } });
    } else if (store) {
      record.translations = record.translations || {};
      record.translations[targetLanguage] = translatedData;
      saveLocalStore(store);
    }

    return res.json(translatedData);
  } catch (err: any) {
    console.error('[Hugging Face Translation Error]:', err);
    return res.status(503).json({ error: err.message || 'Failed to translate analysis.' });
  }
});

// 8. Log Generated Report into 'Reports' Collection
app.post('/api/reports', async (req: Request, res: Response) => {
  try {
    const { analysisId, userId, documentName, language, overallRiskScore, riskLevel } = req.body;
    const reportEntry = {
      id: `rep-${Date.now()}`,
      analysisId,
      userId: userId || 'user-btech-demo',
      documentName,
      generatedAt: new Date().toISOString(),
      language: language || 'English',
      overallRiskScore,
      riskLevel,
    };

    if (mongoDb) {
      await mongoDb.collection('Reports').insertOne(reportEntry);
    } else {
      const store = loadLocalStore();
      store.Reports.unshift(reportEntry);
      saveLocalStore(store);
    }

    return res.json(reportEntry);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record report.' });
  }
});

// 9. User Registration & Login Endpoints (Users Collection)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, organization, preferredLanguage } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    if (mongoDb) {
      const existing = await mongoDb.collection('Users').findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
      const newUser = {
        id: `user-${Date.now()}`,
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash: Buffer.from(String(password)).toString('base64'),
        organization: String(organization || 'LegalTech User').trim(),
        preferredLanguage: preferredLanguage || 'English',
        createdAt: new Date().toISOString(),
      };
      await mongoDb.collection('Users').insertOne(newUser);
      const { passwordHash: _, ...safeUser } = newUser;
      return res.json({ user: safeUser });
    } else {
      const store = loadLocalStore();
      const existing = store.Users.find((u: any) => String(u.email || '').toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
      const newUser = {
        id: `user-${Date.now()}`,
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash: Buffer.from(String(password)).toString('base64'),
        organization: String(organization || 'LegalTech User').trim(),
        preferredLanguage: preferredLanguage || 'English',
        createdAt: new Date().toISOString(),
      };
      store.Users.push(newUser);
      saveLocalStore(store);
      const { passwordHash: _, ...safeUser } = newUser;
      return res.json({ user: safeUser });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const encodedPass = Buffer.from(String(password)).toString('base64');

    if (mongoDb) {
      const user = await mongoDb.collection('Users').findOne({ email: cleanEmail });
      if (!user || (user.passwordHash && user.passwordHash !== encodedPass)) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const { passwordHash: _, ...safeUser } = user;
      return res.json({ user: safeUser });
    } else {
      const store = loadLocalStore();
      const user = store.Users.find((u: any) => String(u.email || '').toLowerCase() === cleanEmail);
      if (!user || (user.passwordHash && user.passwordHash !== encodedPass)) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const { passwordHash: _, ...safeUser } = user;
      return res.json({ user: safeUser });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

app.put('/api/auth/profile', async (req: Request, res: Response) => {
  try {
    const { id, name, organization, preferredLanguage } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID is required.' });

    if (mongoDb) {
      await mongoDb.collection('Users').updateOne(
        { id },
        { $set: { name, organization, preferredLanguage } }
      );
      const updated = await mongoDb.collection('Users').findOne({ id });
      return res.json({ user: updated });
    } else {
      const store = loadLocalStore();
      const idx = store.Users.findIndex((u: any) => u.id === id);
      if (idx !== -1) {
        store.Users[idx] = {
          ...store.Users[idx],
          name: name || store.Users[idx].name,
          organization: organization ?? store.Users[idx].organization,
          preferredLanguage: preferredLanguage || store.Users[idx].preferredLanguage,
        };
        saveLocalStore(store);
        const { passwordHash: _, ...safeUser } = store.Users[idx];
        return res.json({ user: safeUser });
      }
      return res.json({ user: { id, name, organization, preferredLanguage } });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

// 10. Multilingual Text-to-Speech (TTS) Endpoint (Browser Web Speech API primary; clean JSON fallback)
app.post('/api/tts', async (req: Request, res: Response) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Text is required for speech synthesis.' });
  return res.status(200).json({
    useBrowserSpeechSynthesis: true,
    message: 'Using client-side Web Speech API synthesis.',
  });
});


// Multer file upload error handler
app.use((err: any, _req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum allowed file size is 15 MB.' });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  next(err);
});

async function startServer() {
  await initDatabase();

  const isProduction =
    process.env.NODE_ENV === 'production' || process.argv.includes('--production');

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI-Powered Legal Document Risk Analysis Suite running on http://localhost:${PORT}`);
  });
}

startServer();
