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
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const PORT = Number(process.env.SMOKE_PORT ?? 4319);
const BASE = `http://localhost:${PORT}`;
const OUT = process.env.SMOKE_OUT ?? 'test-results/ui';
const axeSource = process.env.AXE_SOURCE ? readFileSync(process.env.AXE_SOURCE, 'utf8') : null;
const axeReport = {};
const THEMES = ['meadow', 'night', 'sakura', 'ocean', 'ember', 'crystal'];
const dataDir = mkdtempSync(join(tmpdir(), 'levelup-smoke-'));
mkdirSync(OUT, { recursive: true });
for (const file of readdirSync(OUT)) {
	if (/^\d{2}-.+\.png$/.test(file)) rmSync(join(OUT, file));
}

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
let expected404 = false;
let browser;

try {
	await waitForServer();
	browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
	const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
	page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
	page.on('console', (m) => {
		// The error-page check deliberately requests a missing habit.
		if (m.type() === 'error' && !(expected404 && m.text().includes('404'))) errors.push(`console: ${m.text()}`);
	});

	const go = async (path) => {
		await page.goto(BASE + path);
		await page.waitForLoadState('networkidle');
	};
	const shot = async (name) => {
		await page.waitForLoadState('networkidle');
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction(() => [...document.querySelectorAll('.figure')].every((f) => f.style.backgroundImage.startsWith('url(')));
		const rawEmoji = await page.locator('body').evaluate((body) => {
			const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
			const found = [];
			while (walker.nextNode()) {
				const node = walker.currentNode;
				if (!node.parentElement?.closest('script, style') && /\p{Extended_Pictographic}/u.test(node.textContent ?? '')) found.push(node.textContent);
			}
			return found;
		});
		assert.deepEqual(rawEmoji, [], `${name}: built-in emoji use SVG icons`);
		const invalidIconNames = await page.locator('.svg-icon').evaluateAll((nodes) => nodes.filter((node) => !node.closest('[aria-hidden=true]') && !(node.getAttribute('role') === 'img' && node.getAttribute('aria-label'))).map((node) => node.outerHTML));
		assert.deepEqual(invalidIconNames, [], `${name}: SVG icons are decorative or labelled`);
		const iconSizes = await page.locator('.display-icon .svg-icon, .tabbar .svg-icon').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).filter((r) => r.width && r.height && (![16, 24, 32].includes(r.width) || ![16, 24, 32].includes(r.height))));
		assert.deepEqual(iconSizes, [], `${name}: standard SVG icon sizes`);
		assert.equal(await page.locator('h1').count(), 1, `${name}: one h1`);
		assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: horizontal overflow`);
		const headings = await page.locator('main h1, main h2, main h3').evaluateAll((nodes) => nodes.map((n) => Number(n.tagName.slice(1))));
		for (let i = 1; i < headings.length; i++) assert.ok(headings[i] <= headings[i - 1] + 1, `${name}: ordered headings`);
		const smallTargets = await page.locator('a, button, input:not([type=hidden]), select, textarea, summary').evaluateAll((nodes) => nodes.filter((node) => {
			const rect = node.getBoundingClientRect();
			return rect.width && rect.height && (rect.width < 24 || rect.height < 24);
		}).map((node) => node.outerHTML));
		assert.deepEqual(smallTargets, [], `${name}: targets at least 24px`);
		if (axeSource) {
			await page.evaluate(axeSource);
			const result = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
			axeReport[name] = result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
			writeFileSync(`${OUT}/axe.json`, JSON.stringify(axeReport, null, 2));
			assert.deepEqual(axeReport[name], [], `${name}: axe violations`);
		}
		await page.waitForTimeout(150);
		await page.screenshot({ path: `${OUT}/${String(++step).padStart(2, '0')}-${name}.png`, fullPage: !['level-up', 'home-wide'].includes(name), style: ['level-up', 'home-wide'].includes(name) ? undefined : 'body { position: relative; } .tabbar { position: absolute !important; }' });
	};
	const dismissNotices = async () => {
		while (await page.getByRole('button', { name: /^Dismiss notice:/ }).count()) {
			await page.getByRole('button', { name: /^Dismiss notice:/ }).first().click();
		}
	};
	const themeShots = async (name) => {
		await dismissNotices();
		for (const theme of THEMES) {
			await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
			await shot(`${name}-${theme}`);
		}
		await page.evaluate(() => { document.documentElement.dataset.theme = 'meadow'; });
	};
	const expectHeadingFocus = async () => assert.equal(await page.locator('h1').evaluate((h) => h === document.activeElement), true);
	const expectText = async (text) => {
		await page.getByText(text, { exact: false }).first().waitFor({ timeout: 5000 });
	};
	const submit = async (locator) => {
		await locator.click();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(300);
	};

	const checkAvatarChoices = async () => {
		for (const width of [320, 390]) {
			await page.setViewportSize({ width, height: 844 });
			for (const [groupName, count] of [['Skin tone', 2], ['Hair colour', 5], ['Outfit', 4]]) {
				const group = page.getByRole('group', { name: groupName, exact: true });
				assert.equal(await group.getByRole('button').count(), count, `${groupName}: kept options only`);
				for (const button of await group.getByRole('button').all()) {
					await button.focus();
					await page.keyboard.press('Enter');
					assert.equal(await button.getAttribute('aria-pressed'), 'true', 'Enter selects the option');
				}
			}
			assert.equal(await page.getByRole('group', { name: 'Avatar parts', exact: true }).count(), 0);
		}
		await page.getByRole('button', { name: 'Light', exact: true }).click();
		await page.getByRole('button', { name: 'Chestnut', exact: true }).click();
		await page.locator('.parts').getByRole('button', { name: 'Collar and shorts' }).click();
	};

	// Onboarding
	await go('/');
	await expectText('Welcome to LevelUp');
	assert.equal(await page.locator('meta[name=theme-color]').count(), 1);
	const defaultColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
	assert.equal(await page.locator('meta[name=theme-color]').getAttribute('content'), defaultColor);
	const manifest = await (await fetch(`${BASE}/manifest.webmanifest`)).json();
	assert.equal(manifest.theme_color, defaultColor);
	assert.equal(manifest.background_color, defaultColor);
	await page.fill('#name', 'Smokey');
	await shot('onboarding-name');
	await page.locator('#name').press('Enter');
	await expectHeadingFocus();
	await checkAvatarChoices();
	await page.locator('.parts').getByRole('button', { name: 'Jumper and skirt' }).click();
	await shot('onboarding-look');
	await page.locator('.parts').getByRole('button', { name: 'Collar and shorts' }).click();
	await page.click('button:has-text("Next")');
	await expectHeadingFocus();
	await page.click('.starter:has-text("Brambleback")');
	await page.fill('#petname', 'Ember');
	await shot('onboarding-partner');
	await page.click('button:has-text("Next")');
	await expectHeadingFocus();
	await shot('onboarding-habits');
	await page.click('button:has-text("Next")');
	await expectHeadingFocus();
	await shot('onboarding-ready');
	await submit(page.locator('button:has-text("Begin the adventure")'));
	await page.waitForURL(`${BASE}/`);
	await expectText('Today');
	await themeShots('home');
	await page.setViewportSize({ width: 1280, height: 900 });
	await shot('home-wide');
	await page.setViewportSize({ width: 390, height: 844 });

	// Tick and undo must restore both the count and the reward.
	const xpBefore = await page.getByRole('meter', { name: 'Experience to next level' }).getAttribute('aria-valuenow');
	const gpBefore = await page.locator('a.gp').textContent();
	const orderBefore = await page.locator('.habit .name').allTextContents();
	await submit(page.locator('button[aria-label="Tick off Go for a walk"]'));
	await expectText('XP');
	await expectText('1 of 3 done');
	assert.equal(await page.locator('.habit.done').count(), 1);
	assert.deepEqual(await page.locator('.habit .name').allTextContents(), orderBefore);
	assert.ok(Number(await page.getByRole('meter', { name: 'Experience to next level' }).getAttribute('aria-valuenow')) > Number(xpBefore));
	assert.equal(await page.locator('.toast').count(), 1, 'one reward notice for the activity');
	assert.match(await page.locator('.toast .notice').innerText(), /\+\d+ XP · \+\d+ GP/);
	assert.equal(await page.getByRole('region', { name: 'Notices' }).getAttribute('aria-live'), 'polite');
	assert.equal(await page.locator('.toast .notice').getAttribute('aria-atomic'), 'true');
	await shot('home-ticked');
	await submit(page.getByRole('button', { name: 'Undo the last tick of Go for a walk', exact: true }).locator('.undo-label'));
	await expectText('0 of 3 done');
	assert.equal(await page.locator('.habit.done').count(), 0);
	assert.equal(await page.getByRole('meter', { name: 'Experience to next level' }).getAttribute('aria-valuenow'), xpBefore);
	assert.equal(await page.locator('a.gp').textContent(), gpBefore);
	await shot('home-undone');
	await submit(page.getByRole('button', { name: 'Tick off Go for a walk', exact: true }));

	// A custom habit
	await go('/habits/new');
	await shot('habits-new-templates');
	await page.click('button:has-text("Build your own")');
	assert.equal(await page.getByRole('button', { name: 'Build your own' }).getAttribute('aria-pressed'), 'true');
	await page.fill('#title', 'Stretch before bed');
	await page.check('input[name=stats][value=dex]');
	await page.fill('input[name=target]', '20');
	await page.getByRole('button', { name: 'Yoga', exact: true }).click();
	assert.equal(await page.getByRole('button', { name: 'Yoga', exact: true }).getAttribute('aria-pressed'), 'true');
	await shot('habits-new-custom');
	await submit(page.locator('button:has-text("Create")'));
	await page.waitForURL(`${BASE}/habits`);
	await expectText('Stretch before bed');
	await shot('habits');
	await page.getByRole('link', { name: 'Stretch before bed', exact: true }).click();
	await shot('habit-edit');
	assert.equal(await page.locator('input[name=icon]').inputValue(), '🧘', 'saved emoji stays unchanged');
	await page.getByRole('textbox', { name: 'Custom icon or emoji' }).fill('🦄');
	await submit(page.getByRole('button', { name: 'Save', exact: true }));
	await page.reload();
	assert.equal(await page.locator('input[name=icon]').inputValue(), '🦄', 'custom emoji persists');
	assert.ok(await page.locator('.display-icon').filter({ hasText: '🦄' }).count(), 'unknown emoji renders as text');
	await page.getByRole('button', { name: 'Reading', exact: true }).click();
	await submit(page.getByRole('button', { name: 'Save', exact: true }));
	await page.reload();
	assert.equal(await page.locator('input[name=icon]').inputValue(), '📖', 'picker keeps the original text value');
	assert.equal(await page.getByRole('textbox', { name: 'Custom icon or emoji' }).inputValue(), '', 'known emoji uses the preview');
	await page.getByRole('button', { name: 'Delete…', exact: true }).click();
	assert.equal(await page.locator('#delete-confirm').evaluate((n) => n === document.activeElement), true);
	await page.getByRole('button', { name: 'Keep it', exact: true }).click();
	assert.equal(await page.locator('#delete-start').evaluate((n) => n === document.activeElement), true);

	// Pet care
	await go('/pet');
	await submit(page.locator('button:has-text("Forage for berries")'));
	await expectText('Wild berry');
	await submit(page.locator('.food button.tile').first());
	await submit(page.locator('button:has-text("Pat")'));
	await themeShots('pet-care');
	await page.getByRole('button', { name: 'Rename', exact: true }).click();
	assert.equal(await page.locator('#pet-name').evaluate((n) => n === document.activeElement), true);
	await submit(page.getByRole('button', { name: 'Save', exact: true }));
	assert.equal(await page.getByRole('button', { name: 'Rename', exact: true }).evaluate((n) => n === document.activeElement), true);

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
	while (await page.locator('button.mess').count()) {
		await submit(page.locator('button.mess').first());
		assert.equal(await page.locator('.mess, .welcome button').first().evaluate((n) => n === document.activeElement), true);
	}
	await submit(page.locator('button:has-text("a pat")'));
	await shot('welcome-done');
	await expectHeadingFocus();

	for (const [path, text] of [
		['/me', 'Abilities'],
		['/wardrobe', 'Wardrobe'],
		['/shop', 'Snacks'],
		['/party', 'Party news'],
		['/settings', 'Rest mode']
	]) {
		await go(path);
		await expectText(text);
		if (path === '/party') assert.match(await page.locator('.card h2').first().textContent(), /Smokey\s\(you\)/);
		await shot(path.slice(1));
		if (path === '/wardrobe') {
			await checkAvatarChoices();
			await page.getByRole('button', { name: 'Honey blonde', exact: true }).click();
			await shot('wardrobe-hair');
			await page.getByRole('button', { name: 'Deep', exact: true }).click();
			await page.locator('.parts').getByRole('button', { name: 'Starry overall dress' }).click();
			await shot('wardrobe-outfit');
			await submit(page.getByRole('button', { name: 'Save this look', exact: true }));
			await go('/wardrobe');
			const saved = JSON.parse(await page.locator('input[name=avatar]').inputValue());
			assert.equal(saved.parts.hair, 'hair.bob');
			assert.equal(saved.parts.top, 'top.tunic');
			assert.equal(saved.colors.hair, 'honey');
			assert.equal(saved.colors.skin, 'deep');
		}
	}

	// Native modal: focus enters, background cannot receive focus, Tab stays inside,
	// Escape closes and returns to the activity that earned the level.
	await go('/');
	await dismissNotices();
	let opener;
	for (let i = 0; i < 12 && !(await page.locator('dialog[open]').count()); i++) {
		await dismissNotices();
		opener = page.getByRole('button', { name: 'Tick off Stretch before bed', exact: true });
		await submit(opener);
	}
	const modal = page.getByRole('dialog', { name: /Level/ });
	await modal.waitFor();
	const modalBox = await modal.boundingBox();
	assert.ok(modalBox && modalBox.y >= 16 && modalBox.y + modalBox.height <= 828, 'the whole dialog fits in the viewport after scrolling');
	assert.equal(await modal.evaluate((n) => n.contains(document.activeElement)), true);
	await page.locator('main').evaluate((n) => n.focus());
	assert.equal(await modal.evaluate((n) => n.contains(document.activeElement)), true, 'modal makes background inert');
	for (let i = 0; i < 6; i++) {
		await page.keyboard.press('Tab');
		assert.equal(await modal.evaluate((n) => n.contains(document.activeElement)), true, 'Tab stays in dialog');
	}
	for (let i = 0; i < 6; i++) {
		await page.keyboard.press('Shift+Tab');
		assert.equal(await modal.evaluate((n) => n.contains(document.activeElement)), true, 'Shift+Tab stays in dialog');
	}
	await shot('level-up');
	await page.keyboard.press('Escape');
	assert.equal(await page.locator('dialog[open]').count(), 0);
	assert.equal(await opener.evaluate((n) => n === document.activeElement), true, 'Escape returns focus');
	await dismissNotices();

	// Earn a second level to test the dialog's navigation action.
	for (let i = 0; i < 16 && !(await page.locator('dialog[open]').count()); i++) {
		await dismissNotices();
		await submit(page.locator('.habit').filter({ has: page.getByRole('link', { name: 'Stretch before bed', exact: true }) }).locator('button.tick'));
	}
	await modal.waitFor();
	await submit(modal.getByRole('link', { name: 'Spend points', exact: true }));
	await page.waitForURL(`${BASE}/me`);
	assert.equal(await page.locator('dialog[open]').count(), 0);

	// Theme metadata follows a real settings change, including a subsequent SSR load.
	await go('/settings');
	await submit(page.getByRole('button', { name: /Turn rest mode on/ }));
	await expectText('Rest mode is on');
	await dismissNotices();
	await shot('settings-rest');
	await submit(page.getByRole('button', { name: /Turn rest mode off/ }));
	await submit(page.getByRole('button', { name: /Midnight tarot/ }));
	assert.equal(await page.locator('html').getAttribute('data-theme'), 'night');
	assert.equal(await page.locator('meta[name=theme-color]').count(), 1);
	const nightMeta = await page.locator('meta[name=theme-color]').getAttribute('content');
	await page.reload();
	assert.equal(await page.locator('html').getAttribute('data-theme'), 'night');
	assert.equal(await page.locator('meta[name=theme-color]').getAttribute('content'), nightMeta);
	await submit(page.getByRole('button', { name: /Meadow/ }));
	assert.notEqual(await page.locator('meta[name=theme-color]').getAttribute('content'), nightMeta);

	await page.fill('#hn', '');
	await submit(page.getByRole('button', { name: 'Save', exact: true }));
	await page.getByRole('alert').filter({ hasText: 'Your hero needs a name' }).waitFor();
	await shot('form-error');
	await dismissNotices();

	expected404 = true;
	await go('/habits/does-not-exist');
	await expectText('Nothing here');
	await shot('error');
	expected404 = false;

	if (errors.length) throw new Error(`browser reported errors:\n${errors.join('\n')}`);
	console.log(`smoke-ui: ok, ${step} screenshots in ${OUT}`);
} catch (err) {
	failed = true;
	console.error('smoke-ui: FAILED');
	console.error(err);
	if (errors.length) console.error(errors.join('\n'));
} finally {
	await browser?.close();
	server.kill();
	rmSync(dataDir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
