/**
 * Static HTML & Link Integrity Validator
 * Scans /dist for broken internal routes, missing assets, and missing image alt tags.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run "node build.mjs" first.');
  process.exit(1);
}

function getFiles(dir, ext = '.html') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, ext));
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getFiles(distDir);
console.log(`Checking ${htmlFiles.length} HTML files in ${distDir}...`);

let errorsCount = 0;

for (const filePath of htmlFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(distDir, filePath).replace(/\\/g, '/');

  // 1. Check internal link hrefs
  const linkMatches = content.matchAll(/href=["'](\/[^"'#?]*)/g);
  for (const match of linkMatches) {
    const target = match[1];
    if (target.startsWith('//') || target === '') continue;

    // Resolve target path in dist
    let resolved = null;
    if (target.endsWith('/')) {
      resolved = path.join(distDir, target, 'index.html');
    } else {
      const direct = path.join(distDir, target);
      if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
        resolved = direct;
      } else {
        resolved = path.join(distDir, target, 'index.html');
      }
    }

    if (!fs.existsSync(resolved)) {
      console.error(`❌ Broken link in ${relPath}: href="${target}" (expected: ${resolved})`);
      errorsCount++;
    }
  }

  // 2. Check internal src references (scripts, images, iframes)
  const srcMatches = content.matchAll(/src=["'](\/[^"'#?]*)/g);
  for (const match of srcMatches) {
    const target = match[1];
    if (target.startsWith('//') || target === '') continue;

    const resolved = path.join(distDir, target);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ Broken asset in ${relPath}: src="${target}"`);
      errorsCount++;
    }
  }

  // 3. Check for missing alt tags on images
  const imgMatches = content.matchAll(/<img\s+([^>]+)>/gi);
  for (const match of imgMatches) {
    const imgAttrs = match[1];
    if (!/alt=["']/i.test(imgAttrs)) {
      console.error(`❌ Missing alt attribute in ${relPath}: <img ${imgAttrs}>`);
      errorsCount++;
    }
  }
}

if (errorsCount > 0) {
  console.error(`\n❌ Found ${errorsCount} validation issue(s).`);
  process.exit(1);
} else {
  console.log('✅ All internal links, assets, and image alt tags verified successfully!');
}
