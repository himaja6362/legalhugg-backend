#!/usr/bin/env node
/**
 * Cross-Platform Local Setup & Hugging Face Configuration Helper for Windows PowerShell, VS Code & Antigravity
 * Usage:
 *   npm run setup
 *   npm run setup -- hf_YOUR_HUGGINGFACE_TOKEN
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

console.log('====================================================================');
console.log(' AI-Powered Legal Document Risk Analysis Suite — Hugging Face Setup');
console.log('====================================================================\n');

// 1. Ensure .env file exists
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('[CREATED] Created .env file from .env.example.');
  } else {
    fs.writeFileSync(
      envPath,
      'HF_INFERENCE_MODE=auto\nHF_USE_LOCAL=true\nHF_TOKEN=\nMONGODB_URI=\nPORT=3000\nVITE_API_BASE_URL=\n',
      'utf-8'
    );
    console.log('[CREATED] Created default .env file.');
  }
}

function saveTokenToEnv(token) {
  const cleanToken = token.trim().replace(/^["']|["']$/g, '');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  if (/^\s*HF_TOKEN\s*=/m.test(envContent)) {
    envContent = envContent.replace(/^\s*HF_TOKEN\s*=.*$/m, `HF_TOKEN=${cleanToken}`);
  } else {
    envContent = `HF_TOKEN=${cleanToken}\n` + envContent;
  }
  fs.writeFileSync(envPath, envContent, 'utf-8');
  console.log('\n[SUCCESS] Saved your HF_TOKEN into .env!');
  console.log('Now start the app by running:\n  npm run dev\n');
}

// 2. Check if user passed token as CLI argument: `npm run setup -- hf_...`
const cliTokenArg = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
if (cliTokenArg && cliTokenArg.startsWith('hf_')) {
  saveTokenToEnv(cliTokenArg);
  process.exit(0);
}

// 3. Check current configuration in .env
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/^\s*HF_TOKEN\s*=\s*(.*)\s*$/m);
const fileToken = match ? match[1].trim().replace(/^["']|["']$/g, '') : '';
const activeToken = process.env.HF_TOKEN || fileToken;

if (activeToken && activeToken.startsWith('hf_')) {
  console.log('[OK] HF_TOKEN is configured in .env (Cloud Hugging Face Inference API + Local ONNX active).');
  console.log('\nStart the application with:\n  npm run dev\n');
  console.log('Then open: http://localhost:3000');
  console.log('====================================================================');
  process.exit(0);
}

console.log('[OK] Local Hugging Face ONNX Inference (HF_INFERENCE_MODE=auto, HF_USE_LOCAL=true) is ready out-of-the-box.');
console.log('     Models used automatically: Xenova/flan-t5-small, Xenova/bert-base-NER, Xenova/mobilebert-uncased-mnli, Xenova/distilbert-base-cased-distilled-squad.');
console.log('     Optional: Set HF_TOKEN=hf_... in .env to also enable Qwen/Qwen2.5-72B-Instruct via Hugging Face Inference API.\n');

if (process.stdin.isTTY) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Optional — Paste your HF_TOKEN (from https://huggingface.co/settings/tokens) or press Enter to use Local Hugging Face mode: ', (answer) => {
    rl.close();
    const trimmed = (answer || '').trim();
    if (trimmed) {
      saveTokenToEnv(trimmed);
    } else {
      console.log('\n[READY] Using Local Hugging Face ONNX Pipeline mode. Start the server with:\n  npm run dev\n');
    }
  });
}
