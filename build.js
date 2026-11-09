import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

console.log('Building Atelier Daoudi Architecture platform...');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Files to copy
const filesToCopy = [
  'index.html',
  'style.css',
  'app.js',
  'journal.js',
  'journal.json',
  'favicon.svg',
  'robots.txt',
  'sitemap.xml',
  '_headers'
];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied ${file}`);
  }
}

// Copy assets directory recursively
const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(distDir, 'assets');

if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
  const count = fs.readdirSync(assetsDest).length;
  console.log(`✓ Copied assets folder (${count} files: WebP projects & SVG diagrams)`);
}

// Copy portfolio directory recursively
const portfolioSrc = path.join(__dirname, 'portfolio');
const portfolioDest = path.join(distDir, 'portfolio');

if (fs.existsSync(portfolioSrc)) {
  fs.cpSync(portfolioSrc, portfolioDest, { recursive: true });
  console.log('✓ Copied portfolio/ folder');
}

console.log('Build completed successfully! Output ready in dist/');
