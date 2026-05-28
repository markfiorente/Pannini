// Playwright script to render the planilla PDF and capture a screenshot
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  // Serve the app directory locally
  await page.goto(`file:///home/user/Pannini/preview-pdf-render.html`);

  // Wait for the PDF iframe to load
  await page.waitForSelector('#pdf-frame', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: '/home/user/Pannini/planilla-preview.png', fullPage: false });
  console.log('Screenshot saved');
  await browser.close();
})();
