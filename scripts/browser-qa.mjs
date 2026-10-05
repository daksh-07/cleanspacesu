import fs from 'node:fs';
import { chromium, webkit } from 'playwright';

const base = 'http://127.0.0.1:4173';
const outDir = 'qa-artifacts';
fs.mkdirSync(outDir, { recursive: true });

const failures = [];
const reports = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function settlePage(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    for (const img of document.images) img.loading = 'eager';
  });
  await page.waitForTimeout(900);

  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const reveals = [...document.querySelectorAll('.reveal')];
    for (const el of reveals) {
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      await pause(85);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await pause(180);
    window.scrollTo(0, 0);
    await pause(420);
  });

  await page.evaluate(async () => {
    const pending = [...document.images]
      .filter((img) => !img.complete)
      .map((img) => new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }));
    await Promise.race([
      Promise.all(pending),
      new Promise((resolve) => setTimeout(resolve, 4000))
    ]);
  });
  await page.waitForTimeout(250);
}

async function exerciseInteractions(page, label, route, width) {
  if (width <= 430) {
    const menu = page.locator('.menu-btn');
    if (await menu.count()) {
      await menu.click();
      await page.waitForTimeout(120);
      assert(await menu.getAttribute('aria-expanded') === 'true', `${label}: mobile menu did not report open state`);
      assert(await page.locator('.nav-links').evaluate((el) => el.classList.contains('open')), `${label}: mobile menu panel did not open`);
      await menu.click();
      await page.waitForTimeout(120);
      assert(await menu.getAttribute('aria-expanded') === 'false', `${label}: mobile menu did not report closed state`);
    }
  }

  if (route === '/' && width === 390) {
    const opener = page.locator('[data-open-quote]').first();
    await opener.click();
    await page.waitForTimeout(140);
    assert(await page.locator('.quote-drawer').evaluate((el) => el.classList.contains('open')), `${label}: quote drawer did not open`);
    assert(await page.locator('.quote-drawer').getAttribute('aria-hidden') === 'false', `${label}: quote drawer aria state is wrong when open`);
    await page.locator('.quote-close').click();
    await page.waitForTimeout(140);
    assert(await page.locator('.quote-drawer').getAttribute('aria-hidden') === 'true', `${label}: quote drawer aria state is wrong when closed`);
  }

  const slider = page.locator('.ba input[type="range"]').first();
  if (await slider.count()) {
    await slider.evaluate((input) => {
      input.value = '71';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const position = await page.locator('.ba').first().evaluate((el) => el.style.getPropertyValue('--position').trim());
    assert(position === '71%', `${label}: before/after slider did not update (got "${position}")`);
  }
}

async function auditPage(browser, engineName, route, width, height, filename) {
  const label = `${engineName} ${width}px ${route || '/'}`;
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), `${label}: route returned HTTP ${response?.status()}`);

  await exerciseInteractions(page, label, route, width);
  await settlePage(page);

  const audit = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth,
    unrevealed: [...document.querySelectorAll('.reveal:not(.is-visible)')].length,
    brokenImages: [...document.images]
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.getAttribute('src') || img.currentSrc || 'unknown'),
    title: document.title
  }));

  assert(audit.scrollWidth <= audit.innerWidth + 1, `${label}: horizontal overflow ${audit.scrollWidth}px > ${audit.innerWidth}px`);
  assert(audit.unrevealed === 0, `${label}: ${audit.unrevealed} reveal elements never became visible`);
  if (audit.brokenImages.length) {
    failures.push(`${label}: broken images: ${[...new Set(audit.brokenImages)].join(', ')}`);
  }
  for (const message of runtimeErrors) failures.push(`${label}: pageerror: ${message}`);

  await page.addStyleTag({
    content: '.quote-drawer:not(.open){display:none!important}.mobile-sticky-cta{display:none!important}'
  });
  await page.screenshot({ path: `${outDir}/${filename}`, fullPage: true });

  reports.push(`${label}: route OK; overflow ${audit.scrollWidth - audit.innerWidth}px; unrevealed ${audit.unrevealed}; broken images ${audit.brokenImages.length}`);
  await context.close();
}

const webkitBrowser = await webkit.launch();
const chromiumBrowser = await chromium.launch();

try {
  const pages = [
    ['', 'home'],
    ['/services', 'services'],
    ['/work', 'work'],
    ['/about', 'about'],
    ['/contact', 'contact']
  ];

  for (const [route, name] of pages) {
    await auditPage(webkitBrowser, 'webkit', route, 390, 844, `${name}-390-webkit.png`);
    await auditPage(chromiumBrowser, 'chromium', route, 1440, 1000, `${name}-1440-chromium.png`);
  }

  for (const width of [320, 375, 393, 402, 430]) {
    await auditPage(webkitBrowser, 'webkit', '', width, 844, `home-${width}-webkit.png`);
  }

  for (const width of [1280, 1366, 1728, 1920]) {
    await auditPage(chromiumBrowser, 'chromium', '', width, 1000, `home-${width}-chromium.png`);
  }

  const reduced = await webkitBrowser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(base, { waitUntil: 'domcontentloaded' });
  await reducedPage.waitForTimeout(120);
  const reducedAudit = await reducedPage.evaluate(() => ({
    revealOpacity: [...document.querySelectorAll('.reveal')].every((el) => getComputedStyle(el).opacity === '1'),
    horizontalOverflow: document.documentElement.scrollWidth - innerWidth
  }));
  assert(reducedAudit.revealOpacity, 'webkit 390px reduced motion: reveal content is not immediately visible');
  assert(reducedAudit.horizontalOverflow <= 1, `webkit 390px reduced motion: horizontal overflow ${reducedAudit.horizontalOverflow}px`);
  reports.push(`webkit 390px reduced motion: content visible; overflow ${reducedAudit.horizontalOverflow}px`);
  await reduced.close();
} finally {
  await webkitBrowser.close();
  await chromiumBrowser.close();
}

console.log('BROWSER QA REPORT');
for (const report of reports) console.log(`- ${report}`);

if (failures.length) {
  console.error('BROWSER QA FAILURES');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Browser QA passed: ${reports.length} viewport/page checks.`);
