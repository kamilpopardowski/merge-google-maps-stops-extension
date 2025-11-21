import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const manifestPath = path.join(root, 'manifest.json');
const distManifestPath = path.join(distDir, 'manifest.json');

const base = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const distManifest = {
  ...base,
  action: {
    ...base.action,
    default_popup: './index.html',
  },
  background: {
    ...base.background,
    service_worker: 'background.js',
  },
};

fs.writeFileSync(distManifestPath, JSON.stringify(distManifest, null, 2));
console.log('Wrote dist/manifest.json');
