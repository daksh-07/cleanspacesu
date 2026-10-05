import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'images');
fs.mkdirSync(outputDir, { recursive: true });

function unpackDir(dirName) {
  const packDir = path.join(root, dirName);
  if (!fs.existsSync(packDir)) return 0;

  const parts = fs.readdirSync(packDir)
    .filter((name) => /^assets\.part\d+[a-z]?\.b64$/.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  if (!parts.length) return 0;

  const encoded = parts.map((name) => fs.readFileSync(path.join(packDir, name), 'utf8').trim()).join('');
  const payload = JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'));

  for (const [filename, base64] of Object.entries(payload)) {
    if (!/^[a-z0-9-]+\.webp$/i.test(filename)) throw new Error(`Unsafe asset filename: ${filename}`);
    fs.writeFileSync(path.join(outputDir, filename), Buffer.from(base64, 'base64'));
  }

  console.log(`Unpacked ${Object.keys(payload).length} image(s) from ${dirName}.`);
  return Object.keys(payload).length;
}

const baseCount = unpackDir('asset-pack');
const clarityCount = unpackDir('asset-pack-v2');

if (!baseCount && !clarityCount) {
  console.log('No asset packs found; existing public/images assets are unchanged.');
} else {
  console.log(`Prepared ${baseCount + clarityCount} asset writes. V2 assets intentionally overwrite matching base filenames.`);
}
