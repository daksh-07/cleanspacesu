import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const packDir = path.join(root, 'asset-pack');
const outputDir = path.join(root, 'public', 'images');

fs.mkdirSync(outputDir, { recursive: true });
const parts = fs.readdirSync(packDir)
  .filter((name) => /^assets\.part\d+[a-z]?\.b64$/.test(name))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

if (!parts.length) {
  console.log('No asset pack found; existing public/images assets are unchanged.');
  process.exit(0);
}

const encoded = parts.map((name) => fs.readFileSync(path.join(packDir, name), 'utf8').trim()).join('');
const payload = JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'));

for (const [filename, base64] of Object.entries(payload)) {
  if (!/^[a-z0-9-]+\.webp$/i.test(filename)) throw new Error(`Unsafe asset filename: ${filename}`);
  fs.writeFileSync(path.join(outputDir, filename), Buffer.from(base64, 'base64'));
}

console.log(`Unpacked ${Object.keys(payload).length} optimized Clean Space images.`);
