import fs from 'node:fs';
import path from 'node:path';
import { constants, gunzipSync } from 'node:zlib';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'images');

fs.mkdirSync(outputDir, { recursive: true });

function writePayload(payload, source) {
  let count = 0;
  for (const [filename, base64] of Object.entries(payload)) {
    if (!/^[a-z0-9-]+\.webp$/i.test(filename)) throw new Error(`Unsafe asset filename: ${filename}`);
    fs.writeFileSync(path.join(outputDir, filename), Buffer.from(base64, 'base64'));
    count += 1;
  }
  if (count) console.log(`Unpacked ${count} image(s) from ${source}.`);
  return count;
}

function readPackParts(dirName) {
  const packDir = path.join(root, dirName);
  if (!fs.existsSync(packDir)) return null;

  const parts = fs.readdirSync(packDir)
    .filter((name) => /^assets\.part\d+[a-z]?\.b64$/.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  if (!parts.length) return null;
  return parts.map((name) => fs.readFileSync(path.join(packDir, name), 'utf8').trim()).join('');
}

function unpackCompletePack(dirName) {
  const encoded = readPackParts(dirName);
  if (!encoded) return 0;

  const payload = JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'));
  return writePayload(payload, dirName);
}

function overlayRecoverableV2() {
  const encoded = readPackParts('asset-pack-v2');
  if (!encoded) return 0;

  const compressed = Buffer.from(encoded, 'base64');

  try {
    const payload = JSON.parse(gunzipSync(compressed).toString('utf8'));
    return writePayload(payload, 'asset-pack-v2');
  } catch (error) {
    // The abandoned experimental branch only contains the first chunk of a
    // larger gzip stream. Z_SYNC_FLUSH lets us recover any fully-complete
    // entries in that chunk without treating the incomplete payload as valid.
    let partialText;
    try {
      partialText = gunzipSync(compressed, { finishFlush: constants.Z_SYNC_FLUSH }).toString('utf8');
    } catch {
      console.warn('High-resolution overlay is incomplete and no safe entries could be recovered.');
      return 0;
    }

    const recovered = {};
    const entryPattern = /"([a-z0-9-]+\.webp)":"([A-Za-z0-9+/=]+)"(?=,|})/gi;
    for (const match of partialText.matchAll(entryPattern)) {
      recovered[match[1]] = match[2];
    }

    if (!Object.keys(recovered).length) {
      console.warn('High-resolution overlay is incomplete and contains no complete image entries.');
      return 0;
    }

    const count = writePayload(recovered, 'recoverable asset-pack-v2 entries');
    console.warn(`asset-pack-v2 is intentionally partial; recovered ${count} complete image(s) and ignored the truncated remainder.`);
    return count;
  }
}

const baseCount = unpackCompletePack('asset-pack');
const clarityCount = overlayRecoverableV2();

if (!baseCount && !clarityCount) {
  console.log('No asset packs found; existing public/images assets are unchanged.');
} else {
  console.log(`Prepared ${baseCount} base image(s) with ${clarityCount} high-resolution overlay(s).`);
}
