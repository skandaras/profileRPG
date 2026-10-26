/**
 * Browser smoke test: build output, real Chromium, phone-sized screen.
 *
 * Starts `node build` against a fresh data directory in dev auth mode, walks a
 * new player through onboarding and a day of play, and fails on any page
 * error, console error or missing expected text. Screenshots of every screen
 * land in test-results/ui/, which is also how to eyeball a change.
 *
 *   npm run build && npm run test:ui
 *
 * Set CHROMIUM_PATH to use a browser other than Playwright's own.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const PORT = Number(process.env.SMOKE_PORT ?? 4319);
const BASE = `http://localhost:${PORT}`;
const OUT = 'test-results/ui';
const dataDir = mkdtempSync(join(tmpdir(), 'levelup-smoke-'));
mkdirSync(OUT, { recursive: true });

const server = spawn('node', ['build'], {
	env: { ...process.env, PORT: String(PORT), AUTH_MODE: 'dev', DEV_USER: 'smoke', DATA_DIR: dataDir, ORIGIN: BASE },
	stdio: ['ignore', 'inherit', 'inherit']
});

async function waitForServer() {
	for (let i = 0; i < 60; i++) {
		try {
			if ((await fetch(`${BASE}/healthz`)).ok) return;
		} catch {
			// not up yet
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error('server did not start');
}

let step = 0;
const errors = [];
let failed = false;

try {
	await waitForServer();
	const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
	page.on('console', (m) => {
		// Google Fonts may be unreachable from CI; that is not the app's failure.
		if (m.type() === 'error' && !m.text().includes('fonts.g')) errors.push(`console: ${m.text()}`);
	});

	const go = async (path) => {
		await page.goto(BASE + path);
		await page.waitForLoadState('networkidle');
	};
	const shot = async (name) => {
		await page.waitForTimeout(400);
		await page.screenshot({ path: `${OUT}/${String(++step).padStart(2, '0')}-${name}.png`, fullPage: true });
	};
	const expectText = async (text) => {
		await page.getByText(text, { exact: false }).first().waitFor({ timeout: 5000 });
	};
	const submit = async (locator) => {
		await locator.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(300);
	};

	// Onboarding
	await go('/');
	await expectText('Welcome to LevelUp');
	await page.fill('#name', 'Smokey');
	await shot('onboarding-name');
	await page.click('button:has-text("Next")');
	await page.click('button[role=tab]:has-text("Hair")');
	await page.click('.parts .tile:has-text("Twin tails")');
	await shot('onboarding-look');
	await page.click('button:has-text("Next")');
	await page.click('.starter:has-text("Emberkit")');
	await page.fill('#petname', 'Ember');
	await page.click('button:has-text("Next")');
	await shot('onboarding-habits');
	await page.click('button:has-text("Next")');
	await submit(page.locator('button:has-text("Begin the adventure")'));
	await page.waitForURL(`${BASE}/`);
	await expectText('Today');
	await shot('home');

	// Tick a habit and see the reward
	await submit(page.locator('button[aria-label="Tick off Go for a walk"]'));
	await expectText('XP');
	await shot('home-ticked');

	// A custom habit
	await go('/habits/new');
	await page.click('button:has-text("Build your own")');
	await page.fill('#title', 'Stretch before bed');
	await page.check('input[name=stats][value=dex]');
	await submit(page.locator('button:has-text("Create")'));
	await page.waitForURL(`${BASE}/habits`);
	await expectText('Stretch before bed');
	await shot('habits');

	// Pet care
	await go('/pet');
	await submit(page.locator('button:has-text("Forage for berries")'));
	await expectText('Wild berry');
	await submit(page.locator('.food button.tile').first());
	await submit(page.locator('button:has-text("Pat")'));
	await shot('pet');

	// A mission, there and back
	await go('/missions');
	await submit(page.locator('form.mission:has-text("Meadow stroll") button.go'));
	await expectText('On the road');
	await shot('missions');
	await go('/dev/skip?hours=1&to=/missions');
	await submit(page.locator('button:has-text("Claim")'));
	await expectText('Recent trips');

	// Next day: the welcome-back ritual and a missed habit
	await go('/dev/skip?hours=48');
	await expectText('While you were away');
	await shot('welcome');
	while (await page.locator('button.mess').count()) await submit(page.locator('button.mess').first());
	await submit(page.locator('button:has-text("a pat")'));
	await shot('welcome-done');

	for (const [path, text] of [
		['/me', 'Abilities'],
		['/wardrobe', 'Wardrobe'],
		['/shop', 'Snacks'],
		['/party', 'Party news'],
		['/settings', 'Rest mode']
	]) {
		await go(path);
		await expectText(text);
		await shot(path.slice(1));
	}

	await browser.close();
	if (errors.length) throw new Error(`browser reported errors:\n${errors.join('\n')}`);
	console.log(`smoke-ui: ok, ${step} screenshots in ${OUT}`);
} catch (err) {
	failed = true;
	console.error('smoke-ui: FAILED');
	console.error(err);
	if (errors.length) console.error(errors.join('\n'));
} finally {
	server.kill();
	rmSync(dataDir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
