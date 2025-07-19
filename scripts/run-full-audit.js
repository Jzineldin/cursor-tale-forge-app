#!/usr/bin/env node
/****************************************************************
 * TaleForge – Full PRD Compliance & QA Audit – Windows Compatible
 * run:  node scripts/run-full-audit.js
 ****************************************************************/
import { execSync as exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const url = process.env.URL || 'http://localhost:8082';
const prdFile = 'TALEFORGE_PRD_2025.md';
const report = `audits/${new Date().toISOString().slice(0, 16)}.report.md`;

fs.mkdirSync('audits', { recursive: true });
let log = '';

// --- helper ---
const go = (cmd, title) => {
  try {
    const out = exec(cmd, { stdio: 'pipe' }).toString();
    log += `## ${title}\n\`\`\`\n${out.trim()}\n\`\`\`\n\n`;
  } catch (e) {
    log += `## ❌ ${title} FAILED\n\`\`\`\n${e.stderr?.toString() || e.message}\n\`\`\`\n\n`;
  }
};

// 1. lint & type
go('npm run lint', 'Linting');
go('npm run build', 'Build');

// 2. lighthouse batch on routes (Windows compatible)
const routes = [
  '/', '/login', '/signup', '/create', '/story/63', '/my-stories',
  '/gallery', '/privacy', '/terms'
];

routes.forEach(r => {
  go(`npx lighthouse "${url}${r}" --output=json --output-path=audits/lighthouse-${r.replace(/\//g, '-')}.json --chrome-flags="--headless=new --disable-gpu"`, `Lighthouse ${r}`);
});

// 3. axe + playwright pass
go('npx playwright test --grep @axe --reporter=line', 'Axe Accessibility');

// 4. match PRD gaps (Windows compatible)
try {
  const prdContent = fs.readFileSync(prdFile, 'utf8');
  const todoMatches = prdContent.match(/- \[ \]/g) || [];
  log += `## Remaining PRD TODOs\n\`\`\`\n${todoMatches.length} TODO items found\n\`\`\`\n\n`;
} catch (e) {
  log += `## ❌ Remaining PRD TODOs FAILED\n\`\`\`\n${e.message}\n\`\`\`\n\n`;
}

// 5. size budgets (Windows compatible)
try {
  const distPath = path.join(process.cwd(), 'dist');
  const getDirSize = (dir) => {
    let size = 0;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stat.size;
      }
    });
    return size;
  };
  const totalSize = getDirSize(distPath);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  log += `## Bundle Size\n\`\`\`\nTotal bundle size: ${sizeMB} MB\n\`\`\`\n\n`;
} catch (e) {
  log += `## ❌ Bundle Size FAILED\n\`\`\`\n${e.message}\n\`\`\`\n\n`;
}

// 6. Changed Files
go('git diff --name-only', 'Changed Files');

fs.writeFileSync(report, log);
console.log(`🧾 Written full report → ${report}`); 