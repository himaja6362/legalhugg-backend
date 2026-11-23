# AI-Powered Legal Document Risk Analysis Suite

An end-to-end AI-powered legal document risk & consistency analysis application featuring an experimental spatial-navigation interface (`01` — `09`). It extracts text page-by-page from **PDF** and **DOCX** files (including scanned PDFs via OCR), identifies high/medium/low legal risks, detects cross-page contradictions with dual verbatim quotes, flags ambiguous or missing clauses, masks sensitive personal information (PII), supports grounded Document Q&A, translates findings into **English, Kannada, Hindi, and Telugu**, and generates downloadable PDF reports.

---

## Hugging Face AI & NLP Architecture
<!--  -->
This application uses **Hugging Face** models for all AI/NLP tasks (with zero dependency on `GEMINI_API_KEY`):

1. **Hugging Face Serverless Inference API (`HF_TOKEN` configured)**:
   - **Instruction-Following Legal Reasoning LLM**: `Qwen/Qwen2.5-72B-Instruct` *(automatic fallback to `Qwen/Qwen2.5-7B-Instruct`, `meta-llama/Llama-3.3-70B-Instruct`, `mistralai/Mistral-7B-Instruct-v0.3`)*
2. **Built-In Local Hugging Face ONNX Transformers (`@huggingface/transformers`, `HF_INFERENCE_MODE=auto` / `HF_USE_LOCAL=true`)**:
   - **Instruction-Following Summary Model**: `Xenova/flan-t5-small` (`text2text-generation`)
   - **Named Entity Recognition (Parties, Organizations, PII)**: `Xenova/bert-base-NER` (`token-classification`) + Deterministic Regex PII Scanner (Aadhaar, PAN, IFSC, Phone, Email)
   - **Zero-Shot Legal Clause Risk & Contradiction NLI Classifier**: `Xenova/mobilebert-uncased-mnli` (`zero-shot-classification`)
   - **Extractive Document Question-Answering**: `Xenova/distilbert-base-cased-distilled-squad` (`question-answering`)

---

## Quick Start in Windows PowerShell, VS Code & Antigravity

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Environment Variables (`.env`)
Run the setup helper to create `.env` automatically:
```powershell
npm run setup
```
Or copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

#### Environment Variables in `.env`:
- `HF_INFERENCE_MODE=auto` *(Default: uses Hugging Face Inference API when `HF_TOKEN` is set, and automatically runs local Hugging Face ONNX models when `HF_TOKEN` is empty or rate-limited)*
- `HF_USE_LOCAL=true` *(Enables local CPU inference via `@huggingface/transformers`; model weights are cached in your OS temp directory)*
- `HF_TOKEN=` *(Optional in `auto`/`local` mode; **Required** if `HF_INFERENCE_MODE=api`. Create a free Read/Inference token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))*
- `MONGODB_URI=` *(Optional: MongoDB Atlas URI. If blank, uses the built-in local `data_store.json` database)*
- `PORT=3000`

### 3. Run the Application

- **Single Terminal (Recommended — Backend + Frontend on Port 3000):**
  ```powershell
  npm run dev
  ```
  Open **`http://localhost:3000`**.

- **Separate Backend & Frontend Terminals in VS Code:**
  - **Terminal 1 (Backend on Port 3000):**
    ```powershell
    npm run dev:backend
    ```
  - **Terminal 2 (Frontend on Port 5173):**
    ```powershell
    npm run dev:frontend
    ```
  Open **`http://localhost:5173`**.
