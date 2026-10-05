import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const publicDir=path.join(root,'public');
const requiredPages=['index.html','services/index.html','work/index.html','about/index.html','contact/index.html'];
const requiredAssets=[
  'living-room-detail.webp','kitchen-floor.webp','bathroom-detail.webp','carpet-detail.webp',
  'drain-before.webp','drain-after.webp','kitchen-detail.webp','bathroom-tub-brand.webp',
  'sink-before.webp','sink-after.webp','bathroom-transformation.webp','dusting-before-after.webp',
  'tidying-bath-before-after.webp','bathroom-before-after.webp','brand-card-melbourne.webp',
  'logo-white.webp','logo-navy.webp'
];

for(const rel of requiredPages){
  const p=path.join(publicDir,rel);
  if(!fs.existsSync(p)) throw new Error(`Missing page: ${rel}`);
  const html=fs.readFileSync(p,'utf8');
  if(!html.includes('data-site-nav') || !html.includes('data-site-footer')) throw new Error(`Missing shared shell hooks: ${rel}`);
  if(!html.includes('assets/styles.css') || !html.includes('assets/site.js')) throw new Error(`Missing core assets: ${rel}`);
}

for(const name of requiredAssets){
  const p=path.join(publicDir,'images',name);
  if(!fs.existsSync(p)) throw new Error(`Missing image: ${name}`);
  if(fs.statSync(p).size<1000) throw new Error(`Image looks invalid: ${name}`);
}

const allHtml=requiredPages.map(rel=>fs.readFileSync(path.join(publicDir,rel),'utf8')).join('\n');
const refs=[...allHtml.matchAll(/\/images\/([a-z0-9-]+\.webp)/gi)].map(m=>m[1]);
for(const ref of new Set(refs)){
  if(!fs.existsSync(path.join(publicDir,'images',ref))) throw new Error(`Broken image reference: ${ref}`);
}

console.log(`QA passed: ${requiredPages.length} pages, ${requiredAssets.length} required images, ${new Set(refs).size} referenced image assets.`);
