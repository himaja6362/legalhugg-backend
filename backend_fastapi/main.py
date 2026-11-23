"""
AI-Powered Legal Document Risk Analysis Suite
FastAPI + PyMuPDF + python-docx + Gemini API + MongoDB Atlas Backend
Deployable on Render (uvicorn main:app --host 0.0.0.0 --port $PORT)
"""

import os
import re
import json
import time
import base64
from datetime import datetime
from typing import List, Optional, Dict, Any
from io import BytesIO

import fitz  # PyMuPDF for PDF text extraction
import docx  # python-docx for DOCX text extraction
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from google import genai
from google.genai import types

def load_all_env_files():
    root_dir = Path(__file__).resolve().parent.parent
    for env_candidate in [
        root_dir / ".env",
        root_dir / ".env.local",
        Path(__file__).resolve().parent / ".env",
    ]:
        if env_candidate.exists():
            load_dotenv(dotenv_path=env_candidate, override=True)
    load_dotenv()

load_all_env_files()

app = FastAPI(
    title="AI-Powered Legal Document Risk Analysis Suite API",
    description="B.Tech Project Backend: FastAPI, PyMuPDF, python-docx, Gemini OCR & Legal NLP, and MongoDB Atlas",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Atlas Setup (Collections: Users, Documents, AnalysisResults, Schemes, Reports)
MONGODB_URI = os.getenv("MONGODB_URI", "")
db_client: Optional[AsyncIOMotorClient] = None
db = None

if MONGODB_URI and MONGODB_URI.startswith("mongodb") and "<username>" not in MONGODB_URI:
    db_client = AsyncIOMotorClient(MONGODB_URI)
    db = db_client["legal_risk_suite"]

# In-memory fallback store if MONGODB_URI is not configured
MEMORY_STORE: Dict[str, List[Dict[str, Any]]] = {
    "Users": [],
    "Documents": [],
    "AnalysisResults": [],
    "Schemes": [],
    "Reports": [],
}


def resolve_gemini_api_key() -> str:
    load_all_env_files()
    for key_name in ("GEMINI_API_KEY", "GOOGLE_API_KEY", "VITE_GEMINI_API_KEY"):
        val = (os.getenv(key_name) or "").strip().strip('"').strip("'")
        if val and val not in ("MY_GEMINI_API_KEY", "your_gemini_api_key_here") and "<your" not in val:
            return val
    return ""


def get_gemini_client() -> genai.Client:
    api_key = resolve_gemini_api_key()
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable is not configured. In VS Code / Antigravity, open the .env file in the project root and set GEMINI_API_KEY=your_actual_gemini_api_key.",
        )
    return genai.Client(api_key=api_key)


def generate_with_retry(contents, config=None):
    client = get_gemini_client()
    models = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"]
    last_err = None
    for model_name in models:
        for attempt in range(2):
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )
                if resp and resp.text:
                    return resp
            except Exception as e:
                last_err = e
                err_str = str(e)
                if "404" in err_str or "NOT_FOUND" in err_str or "not found" in err_str:
                    break
                time.sleep(0.4 * (attempt + 1))
    raise HTTPException(
        status_code=503,
        detail=f"AI generation failed: {str(last_err)}",
    )


def detect_sensitive_info_nlp(text: str) -> List[Dict[str, str]]:
    """Deterministic Python NLP / Regex scanner for Aadhaar, Phone, Email, IFSC, PAN."""
    detected = []
    seen = set()

    # 1. Aadhaar Number (12 digits)
    for match in re.finditer(r"\b([2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4})\b", text):
        raw = match.group(1).strip()
        digits = re.sub(r"\D", "", raw)
        if len(digits) == 12 and digits not in seen:
            seen.add(digits)
            detected.append({
                "id": f"pii-aadhaar-{len(detected)+1}",
                "category": "Aadhaar Number",
                "maskedValue": f"XXXX-XXXX-{digits[-4:]}",
                "originalSnippet": raw,
                "pageOrSection": "Detected via Python NLP Scanner",
                "severity": "High",
            })

    # 2. Indian Phone Number
    for match in re.finditer(r"(?:(?:\+|0{0,2})91[\s-]?)?([6789]\d{4}[\s-]?\d{5})\b", text):
        digits = re.sub(r"\D", "", match.group(1))
        if len(digits) == 10 and digits not in seen:
            seen.add(digits)
            detected.append({
                "id": f"pii-phone-{len(detected)+1}",
                "category": "Phone Number",
                "maskedValue": f"+91 XXXXX {digits[-5:]}",
                "originalSnippet": match.group(0).strip(),
                "pageOrSection": "Detected via Python NLP Scanner",
                "severity": "Medium",
            })

    # 3. Email
    for match in re.finditer(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", text):
        email = match.group(0).strip()
        if email.lower() not in seen:
            seen.add(email.lower())
            local, domain = email.split("@", 1)
            masked = f"{local[:2]}***@{domain}" if len(local) > 2 else f"***@{domain}"
            detected.append({
                "id": f"pii-email-{len(detected)+1}",
                "category": "Email Address",
                "maskedValue": masked,
                "originalSnippet": email,
                "pageOrSection": "Detected via Python NLP Scanner",
                "severity": "Medium",
            })

    # 4. IFSC Code
    for match in re.finditer(r"\b[A-Z]{4}0[A-Z0-9]{6}\b", text):
        ifsc = match.group(0).strip()
        if ifsc not in seen:
            seen.add(ifsc)
            detected.append({
                "id": f"pii-ifsc-{len(detected)+1}",
                "category": "Bank Account / IFSC",
                "maskedValue": f"IFSC: {ifsc[:4]}0XXXXXX",
                "originalSnippet": ifsc,
                "pageOrSection": "Detected via Python NLP Scanner",
                "severity": "High",
            })

    # 5. PAN Number
    for match in re.finditer(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b", text):
        pan = match.group(0).strip()
        if pan not in seen:
            seen.add(pan)
            detected.append({
                "id": f"pii-pan-{len(detected)+1}",
                "category": "PAN Number",
                "maskedValue": f"{pan[:2]}XXX{pan[5:9]}X",
                "originalSnippet": pan,
                "pageOrSection": "Detected via Python NLP Scanner",
                "severity": "High",
            })

    return detected


def find_page_for_index(text: str, index: int) -> str:
    prefix = text[: max(0, index)]
    matches = list(re.finditer(r"\[Page\s+(\d+)\]", prefix, flags=re.IGNORECASE))
    if matches:
        return f"Page {matches[-1].group(1)}"
    return "Page 1"


def extract_text_from_upload(filename: str, content: bytes) -> Dict[str, Any]:
    """
    Extracts text from PDF using PyMuPDF (fitz) page by page (preserving paragraphs, headings, tables, and page numbers)
    with Gemini Multimodal OCR fallback for scanned PDFs, or DOCX using python-docx.
    """
    lower = filename.lower()
    if lower.endswith(".pdf"):
        if b"%PDF-" not in content[:1024]:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is corrupted or is not a valid PDF document (missing %PDF header).",
            )
        try:
            pdf_doc = fitz.open(stream=content, filetype="pdf")
            if pdf_doc.is_encrypted:
                raise HTTPException(
                    status_code=400,
                    detail="This PDF file is encrypted or password-protected. Please unlock the PDF before uploading.",
                )
            pages_list = []
            for page_num in range(len(pdf_doc)):
                page = pdf_doc.load_page(page_num)
                page_text = (page.get_text("text", sort=True) or "").strip()

                # Extract structured tables on the page if PyMuPDF find_tables is available
                if hasattr(page, "find_tables"):
                    try:
                        tables = page.find_tables()
                        table_rows = []
                        for tbl in getattr(tables, "tables", []):
                            for row in tbl.extract():
                                clean_cells = [str(c or "").strip().replace("\n", " ") for c in row if str(c or "").strip()]
                                if clean_cells:
                                    table_rows.append(" | ".join(clean_cells))
                        if table_rows:
                            table_block = "\n".join(table_rows)
                            if table_block[:25] not in page_text:
                                page_text = f"{page_text}\n[Table Data]\n{table_block}".strip()
                    except Exception:
                        pass

                pages_list.append({"num": page_num + 1, "text": page_text})

            combined_digital = "\n\n".join(p["text"] for p in pages_list if p["text"]).strip()

            # OCR Fallback for scanned / image-only PDFs using Gemini Multimodal Vision
            if len(re.sub(r"\s+", "", combined_digital)) < 15:
                ocr_response = generate_with_retry(
                    contents=[
                        types.Part.from_bytes(data=content, mime_type="application/pdf"),
                        (
                            "Perform accurate OCR text extraction on this scanned PDF document page by page. "
                            "Format each page starting with '[Page 1]', '[Page 2]', etc., and return all readable text verbatim. "
                            "If the PDF is completely blank and has no readable text, return 'NO_READABLE_TEXT_FOUND'."
                        ),
                    ],
                )
                ocr_text = (ocr_response.text or "").strip()
                if not ocr_text or ocr_text == "NO_READABLE_TEXT_FOUND" or not re.sub(r"\[Page\s*\d+\]", "", ocr_text, flags=re.I).strip():
                    raise HTTPException(
                        status_code=400,
                        detail="This PDF contains no extractable text or readable content even after OCR fallback.",
                    )
                blocks = [b.strip() for b in re.split(r"(?=\[Page\s+\d+\])", ocr_text, flags=re.I) if b.strip()]
                if blocks:
                    pages_list = []
                    for idx, blk in enumerate(blocks):
                        m = re.match(r"^\[Page\s+(\d+)\]\s*", blk, flags=re.I)
                        p_num = int(m.group(1)) if m else idx + 1
                        body = re.sub(r"^\[Page\s+\d+\]\s*", "", blk, flags=re.I).strip()
                        pages_list.append({"num": p_num, "text": body})
                else:
                    pages_list = [{"num": 1, "text": ocr_text}]

            if not any(p["text"].strip() for p in pages_list):
                raise HTTPException(
                    status_code=400,
                    detail="This PDF contains no extractable text or readable content.",
                )

            full_text = "\n\n".join(
                f"[Page {p['num']}]\n{p['text'] or '(No extractable text on this page)'}" for p in pages_list
            ).strip()
            return {"text": full_text, "pages": pages_list, "pageCount": max(len(pdf_doc), len(pages_list)), "fileType": "PDF"}
        except HTTPException:
            raise
        except Exception as e:
            msg = str(e)
            if "password" in msg.lower() or "encrypted" in msg.lower():
                raise HTTPException(status_code=400, detail="This PDF file is encrypted or password-protected. Please unlock the PDF before uploading.")
            raise HTTPException(status_code=400, detail=f"Failed to extract PDF text via PyMuPDF: {msg}")

    elif lower.endswith(".docx"):
        try:
            doc = docx.Document(BytesIO(content))
            parts = []
            for p in doc.paragraphs:
                if p.text.strip():
                    parts.append(p.text.strip())
            for table in doc.tables:
                for row in table.rows:
                    row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_cells:
                        parts.append(" | ".join(row_cells))
            clean_text = "\n".join(parts).strip()
            if not clean_text:
                raise HTTPException(status_code=400, detail="The uploaded DOCX file is empty or contains no readable text.")
            words = clean_text.split()
            pages_list = []
            for i in range(0, len(words), 350):
                pages_list.append({"num": len(pages_list) + 1, "text": " ".join(words[i : i + 350])})
            full_text = "\n\n".join(f"[Page {p['num']}]\n{p['text']}" for p in pages_list)
            return {"text": full_text, "pages": pages_list, "pageCount": max(1, len(pages_list)), "fileType": "DOCX"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract DOCX text via python-docx: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Only PDF (.pdf) and DOCX (.docx) are supported.")


class QARequest(BaseModel):
    analysisId: str
    question: str
    language: str = "English"


class TranslateRequest(BaseModel):
    analysisId: str
    targetLanguage: str


class ReportCreateRequest(BaseModel):
    analysisId: str
    userId: Optional[str] = "user-btech-demo"
    documentName: str
    language: str = "English"
    overallRiskScore: int
    riskLevel: str


class AuthRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    organization: Optional[str] = "LegalTech User"
    preferredLanguage: Optional[str] = "English"


class AuthLoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    id: str
    name: str
    organization: Optional[str] = ""
    preferredLanguage: Optional[str] = "English"


class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "English"


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "engine": "FastAPI + PyMuPDF + python-docx + Gemini OCR & NLP",
        "databaseMode": "MongoDB Atlas" if db is not None else "Persistent Local Fallback",
        "collections": ["Users", "Documents", "AnalysisResults", "Schemes", "Reports"],
        "supportedLanguages": ["English", "Kannada", "Hindi", "Telugu"],
    }


@app.get("/api/analyses")
async def get_analyses(userId: Optional[str] = Query(None)):
    query_filter = {"userId": userId} if userId else {}
    if db is not None:
        analyses = await db["AnalysisResults"].find(query_filter, {"_id": 0}).sort("uploadDate", -1).to_list(50)
        reports = await db["Reports"].find(query_filter, {"_id": 0}).sort("generatedAt", -1).to_list(30)
        schemes = await db["Schemes"].find({}, {"_id": 0}).to_list(20)
        return {"analyses": analyses, "reports": reports, "schemes": schemes}
    else:
        analyses = [
            a for a in MEMORY_STORE["AnalysisResults"]
            if not userId or a.get("userId") == userId
        ]
        reports = [
            r for r in MEMORY_STORE["Reports"]
            if not userId or r.get("userId") == userId
        ]
        return {"analyses": analyses, "reports": reports, "schemes": MEMORY_STORE["Schemes"]}


@app.delete("/api/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str):
    if db is not None:
        await db["AnalysisResults"].delete_one({"id": analysis_id})
    else:
        MEMORY_STORE["AnalysisResults"] = [
            a for a in MEMORY_STORE["AnalysisResults"] if a.get("id") != analysis_id
        ]
    return {"success": True}


@app.post("/api/analyze")
async def analyze_document(
    file: Optional[UploadFile] = File(None),
    userId: Optional[str] = Form("user-btech-demo"),
    userName: Optional[str] = Form("B.Tech User"),
):
    if file is None:
        raise HTTPException(status_code=400, detail="Please upload a valid PDF or DOCX document.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty (0 bytes).")
    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB maximum limit.")

    extraction = extract_text_from_upload(file.filename or "document.pdf", content)
    text = extraction["text"]
    doc_name = file.filename or "document.pdf"
    file_type = extraction["fileType"]
    file_size = len(content)
    page_count = extraction["pageCount"]

    client = get_gemini_client()
    prompt = f"""Analyze the following legal document "{doc_name}" and return JSON with:
documentType, overallRiskScore (0-100), riskLevel (Low/Medium/High), summary,
importantInformation (importantTerms, obligations, deadlines, penalties, paymentConditions, terminationConditions),
risks (title, riskLevel, reason, simpleExplanation, supportingEvidence, pageOrSection, category),
missingInformation (title, description, evidenceOrContext, pageOrSection, recommendation),
conflictingInformation (title, description, evidenceOrContext, pageOrSection, recommendation),
ambiguousInformation (title, description, evidenceOrContext, pageOrSection, recommendation),
sensitiveInformation (category, maskedValue, originalSnippet, pageOrSection, severity).
Do not invent facts. Always cite verbatim quotes and page/section numbers from the document.

Document Text:
{text[:45000]}"""

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.15,
            response_mime_type="application/json",
        ),
    )

    ai_data = json.loads(response.text or "{}")
    regex_pii = detect_sensitive_info_nlp(text)

    combined_pii = list(ai_data.get("sensitiveInformation", []))
    for idx, item in enumerate(combined_pii):
        item["id"] = f"sens-ai-{idx + 1}"
    for r_item in regex_pii:
        if not any(r_item["originalSnippet"] in existing.get("originalSnippet", "") for existing in combined_pii):
            combined_pii.append(r_item)

    now_iso = datetime.utcnow().isoformat() + "Z"
    record = {
        "id": f"analysis-{int(time.time() * 1000)}",
        "userId": userId or "user-btech-demo",
        "userName": userName or "B.Tech User",
        "documentId": f"doc-{int(time.time() * 1000)}",
        "documentName": doc_name,
        "fileType": file_type,
        "fileSize": file_size,
        "pageCount": page_count,
        "wordCount": len(text.split()),
        "uploadDate": now_iso,
        "extractedText": text,
        "documentType": ai_data.get("documentType", "Legal Document"),
        "overallRiskScore": int(ai_data.get("overallRiskScore", 50)),
        "riskLevel": ai_data.get("riskLevel", "Medium"),
        "summary": ai_data.get("summary", ""),
        "importantInformation": ai_data.get("importantInformation", {}),
        "risks": [
            {**r, "id": f"risk-{i+1}"} for i, r in enumerate(ai_data.get("risks", []))
        ],
        "missingInformation": [
            {**m, "id": f"miss-{i+1}", "type": "missing"}
            for i, m in enumerate(ai_data.get("missingInformation", []))
        ],
        "conflictingInformation": [
            {**c, "id": f"conf-{i+1}", "type": "conflicting"}
            for i, c in enumerate(ai_data.get("conflictingInformation", []))
        ],
        "ambiguousInformation": [
            {**a, "id": f"amb-{i+1}", "type": "ambiguous"}
            for i, a in enumerate(ai_data.get("ambiguousInformation", []))
        ],
        "sensitiveInformation": combined_pii,
        "qaHistory": [],
        "translations": {},
    }

    doc_meta = {
        "id": record["documentId"],
        "userId": record["userId"],
        "documentName": doc_name,
        "fileType": file_type,
        "fileSize": file_size,
        "pageCount": page_count,
        "wordCount": record["wordCount"],
        "uploadDate": now_iso,
    }

    if db is not None:
        await db["Documents"].insert_one(dict(doc_meta))
        await db["AnalysisResults"].insert_one(dict(record))
    else:
        MEMORY_STORE["Documents"].insert(0, doc_meta)
        MEMORY_STORE["AnalysisResults"].insert(0, record)

    return record


@app.post("/api/qa")
async def ask_document_question(req: QARequest):
    record = None
    if db is not None:
        record = await db["AnalysisResults"].find_one({"id": req.analysisId}, {"_id": 0})
    else:
        record = next((a for a in MEMORY_STORE["AnalysisResults"] if a["id"] == req.analysisId), None)

    if not record:
        raise HTTPException(status_code=404, detail="Document analysis record not found.")

    client = get_gemini_client()
    prompt = f"""Answer the user's question using ONLY information explicitly present in the uploaded document text.
If the answer cannot be found in the document, set foundInDocument to false and set answer to "Information not found in the uploaded document."
Provide the answer in {req.language}, and include the exact verbatim quote in evidence and page/section in pageOrSection.

Document Text:
{record["extractedText"][:45000]}

Question: {req.question}"""

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )
    parsed = json.loads(response.text or "{}")
    qa_entry = {
        "id": f"qa-{int(time.time() * 1000)}",
        "question": req.question,
        "answer": parsed.get("answer", "Information not found in the uploaded document."),
        "evidence": parsed.get("evidence", "Not present in document."),
        "pageOrSection": parsed.get("pageOrSection", "N/A"),
        "foundInDocument": bool(parsed.get("foundInDocument", False)),
        "language": req.language,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

    if db is not None:
        await db["AnalysisResults"].update_one(
            {"id": req.analysisId}, {"$push": {"qaHistory": qa_entry}}
        )
    else:
        record.setdefault("qaHistory", []).append(qa_entry)

    return qa_entry


@app.post("/api/translate")
async def translate_analysis(req: TranslateRequest):
    if req.targetLanguage == "English":
        return {"language": "English", "useOriginal": True}

    record = None
    if db is not None:
        record = await db["AnalysisResults"].find_one({"id": req.analysisId}, {"_id": 0})
    else:
        record = next((a for a in MEMORY_STORE["AnalysisResults"] if a["id"] == req.analysisId), None)

    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    if record.get("translations", {}).get(req.targetLanguage):
        return record["translations"][req.targetLanguage]

    payload = {
        "summary": record.get("summary", ""),
        "importantInformation": record.get("importantInformation", {}),
        "risks": [
            {
                "id": r["id"],
                "title": r["title"],
                "reason": r["reason"],
                "simpleExplanation": r["simpleExplanation"],
            }
            for r in record.get("risks", [])
        ],
        "documentChecks": [
            {
                "id": c["id"],
                "title": c["title"],
                "description": c["description"],
                "recommendation": c["recommendation"],
            }
            for c in (
                record.get("missingInformation", [])
                + record.get("conflictingInformation", [])
                + record.get("ambiguousInformation", [])
            )
        ],
    }

    client = get_gemini_client()
    prompt = f"""Translate the following legal document analysis JSON into natural, accurate {req.targetLanguage} (use native script). Keep all IDs unchanged.
Input JSON:
{json.dumps(payload)}"""

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json",
        ),
    )
    translated_data = {"language": req.targetLanguage, **json.loads(response.text or "{}")}

    if db is not None:
        await db["AnalysisResults"].update_one(
            {"id": req.analysisId},
            {"$set": {f"translations.{req.targetLanguage}": translated_data}},
        )
    else:
        record.setdefault("translations", {})[req.targetLanguage] = translated_data

    return translated_data


@app.post("/api/reports")
async def save_report_log(req: ReportCreateRequest):
    entry = {
        "id": f"rep-{int(time.time() * 1000)}",
        "analysisId": req.analysisId,
        "userId": req.userId or "user-btech-demo",
        "documentName": req.documentName,
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "language": req.language,
        "overallRiskScore": req.overallRiskScore,
        "riskLevel": req.riskLevel,
    }
    if db is not None:
        await db["Reports"].insert_one(dict(entry))
    else:
        MEMORY_STORE["Reports"].insert(0, entry)
    return entry


@app.post("/api/auth/register")
async def register_user(req: AuthRegisterRequest):
    clean_email = req.email.strip().lower()
    new_user = {
        "id": f"user-{int(time.time() * 1000)}",
        "name": req.name.strip(),
        "email": clean_email,
        "passwordHash": base64.b64encode(req.password.encode("utf-8")).decode("utf-8"),
        "organization": (req.organization or "LegalTech User").strip(),
        "preferredLanguage": req.preferredLanguage or "English",
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    if db is not None:
        existing = await db["Users"].find_one({"email": clean_email})
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        await db["Users"].insert_one(dict(new_user))
    else:
        if any(u["email"] == clean_email for u in MEMORY_STORE["Users"]):
            raise HTTPException(status_code=400, detail="An account with this email already exists.")
        MEMORY_STORE["Users"].append(new_user)

    safe_user = {k: v for k, v in new_user.items() if k != "passwordHash"}
    return {"user": safe_user}


@app.post("/api/auth/login")
async def login_user(req: AuthLoginRequest):
    clean_email = req.email.strip().lower()
    encoded_pw = base64.b64encode(req.password.encode("utf-8")).decode("utf-8")
    user = None
    if db is not None:
        user = await db["Users"].find_one({"email": clean_email}, {"_id": 0})
    else:
        user = next((u for u in MEMORY_STORE["Users"] if u["email"] == clean_email), None)

    if not user or user.get("passwordHash") != encoded_pw:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    safe_user = {k: v for k, v in user.items() if k != "passwordHash"}
    return {"user": safe_user}


@app.put("/api/auth/profile")
async def update_profile(req: ProfileUpdateRequest):
    if db is not None:
        await db["Users"].update_one(
            {"id": req.id},
            {"$set": {
                "name": req.name,
                "organization": req.organization,
                "preferredLanguage": req.preferredLanguage,
            }},
        )
        updated = await db["Users"].find_one({"id": req.id}, {"_id": 0, "passwordHash": 0})
        return {"user": updated}
    else:
        for u in MEMORY_STORE["Users"]:
            if u["id"] == req.id:
                u["name"] = req.name
                u["organization"] = req.organization
                u["preferredLanguage"] = req.preferredLanguage
                safe_user = {k: v for k, v in u.items() if k != "passwordHash"}
                return {"user": safe_user}
        return {"user": req.dict()}
