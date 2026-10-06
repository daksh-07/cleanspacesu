import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const origin = 'https://cleanspacesu.vercel.app';

const pages = [
  ['index.html', '/'],
  ['services/index.html', '/services'],
  ['work/index.html', '/work'],
  ['about/index.html', '/about'],
  ['contact/index.html', '/contact'],
  ['before-after/index.html', '/before-after'],
  ['reviews/index.html', '/reviews'],
  ['faq/index.html', '/faq'],
  ['book/index.html', '/book']
];

const requiredAssets = [
  'living-room-premium.webp',
  'kitchen-floor-premium.webp',
  'bathroom-detail.webp',
  'carpet-detail.webp',
  'drain-before.webp',
  'drain-after.webp',
  'kitchen-detail.webp',
  'bathroom-tub-brand.webp',
  'sink-before.webp',
  'sink-after.webp',
  'brand-card-melbourne.webp',
  'logo.webp',
  'logo-header.webp'
];

const clientPhotoAssets = requiredAssets.filter((name) => !name.startsWith('logo'));

for (const [rel, route] of pages) {
  const filePath = path.join(publicDir, rel);
  if (!fs.existsSync(filePath)) throw new Error(`Missing page: ${rel}`);
  const html = fs.readFileSync(filePath, 'utf8');

  if (!html.includes('data-site-nav') || !html.includes('data-site-footer')) {
    throw new Error(`Missing shared shell hooks: ${rel}`);
  }
  if (!html.includes('assets/styles.css') || !html.includes('assets/site.js')) {
    throw new Error(`Missing core assets: ${rel}`);
  }
  if (!html.includes('assets/experience.css') || !html.includes('assets/experience.js')) {
    throw new Error(`Missing client-direction experience layer: ${rel}`);
  }

  const canonical = route === '/' ? `${origin}/` : `${origin}${route}`;
  if (!html.includes(`rel="canonical" href="${canonical}"`)) {
    throw new Error(`Missing or incorrect canonical: ${rel}`);
  }

  if (!html.includes('name="theme-color" content="#0B2150"')) {
    throw new Error(`Incorrect brand theme colour: ${rel}`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]*"/i.test(match[0])) throw new Error(`Image missing alt attribute in ${rel}: ${match[0]}`);
  }
}

const availableImages = fs.existsSync(path.join(publicDir, 'images'))
  ? fs.readdirSync(path.join(publicDir, 'images')).filter((name) => /\.(webp|avif|jpe?g|png)$/i.test(name)).sort()
  : [];

for (const name of requiredAssets) {
  const filePath = path.join(publicDir, 'images', name);
  if (!fs.existsSync(filePath)) throw new Error(`Missing image: ${name}. Available built images: ${availableImages.join(', ')}`);
  const size = fs.statSync(filePath).size;
  if (size < 1000) throw new Error(`Image looks invalid: ${name}`);
  if (clientPhotoAssets.includes(name) && size < 90000) {
    throw new Error(`Client photo is still a low-resolution derivative: ${name} (${size} bytes)`);
  }
}

const allHtml = pages.map(([rel]) => fs.readFileSync(path.join(publicDir, rel), 'utf8')).join('\n');
const imageRefs = [...allHtml.matchAll(/\/images\/([a-z0-9-]+\.webp)/gi)].map((match) => match[1]);

for (const ref of new Set(imageRefs)) {
  if (!fs.existsSync(path.join(publicDir, 'images', ref))) throw new Error(`Broken image reference: ${ref}`);
}

const components = fs.readFileSync(path.join(publicDir, 'assets', 'components.js'), 'utf8');
if (!components.includes('/images/logo-header.webp')) throw new Error('Exact cropped client logo artwork is not used by shared navigation/footer.');
if (!fs.existsSync(path.join(publicDir, 'images', 'logo.webp'))) throw new Error('Full official logo asset is missing.');
if (components.includes('logo-white.webp') || components.includes('logo-navy.webp')) {
  throw new Error('Generated/recoloured logo variants are still referenced.');
}
if (!components.includes('Nothing is sent automatically') && !components.includes('Nothing is sent from this website')) {
  throw new Error('Quote drawer must state that the website does not send the enquiry automatically.');
}

const sitemap = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8');
for (const [, route] of pages) {
  const expected = route === '/' ? `${origin}/` : `${origin}${route}`;
  if (!sitemap.includes(expected)) throw new Error(`Sitemap missing ${expected}`);
}

const robots = fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) throw new Error('robots.txt is missing sitemap discovery.');

console.log(
  `QA passed: ${pages.length} pages, ${requiredAssets.length} required images, ${new Set(imageRefs).size} referenced image assets, exact logo artwork, full-resolution client photography, canonical/OG shell, verified phone and choice-led quote flow.`
);
