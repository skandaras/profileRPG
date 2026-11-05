/** Export the generated production inventory as a printable PDF and review images. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const out = resolve('test-results/assets');
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
	const page = await browser.newPage({ viewport: { width: 1100, height: 1600 }, deviceScaleFactor: 1.5 });
	await page.setContent(readFileSync(resolve(out, 'asset-review.html'), 'utf8'));
	await page.evaluate(() => document.fonts.ready);
	await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
	const overflow = await page.locator('.sheet').evaluateAll((sheets) => sheets.filter((sheet) => sheet.scrollHeight > sheet.clientHeight + 1).map((sheet) => sheet.id));
	assert.deepEqual(overflow, [], 'every sheet must fit on its printed page');
	for (const sheet of await page.locator('.sheet').all()) {
		await sheet.screenshot({ path: resolve(out, `${await sheet.getAttribute('id')}.png`) });
	}
	await page.pdf({ path: resolve(out, 'asset-review.pdf'), preferCSSPageSize: true, printBackground: true });
	console.log(`asset review: ${await page.locator('.sheet').count()} sheets exported to ${out}`);
} finally {
	await browser.close();
}
