/** A printable inventory of the shipped art, using the production compositor. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { OUTFITS, PET_ACCESSORIES } from '$lib/content/cosmetics';
import { PAINT_HAIR, PAINT_SKIN } from '$lib/content/painted-palettes';
import { SPECIES } from '$lib/content/pets';
import { CONSUMABLES } from '$lib/content/items';
import { THEMES } from '$lib/content/themes';
import { REFERENCE_PALETTE } from '$lib/content/palettes';
import { STAGES } from './painted-figures';
import { paintPreview } from './preview-png';
import { bed, messFigures } from './room';
import { ICON_PALETTE, svgDocument } from './svg';
import { UI_ICONS, uiIconFigure } from './ui-icons';
import { encodePng } from './png';
import type { RgbaImage } from './compose';

const esc = (text: string) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fileData = (path: string, mime: string) => `data:${mime};base64,${readFileSync(path).toString('base64')}`;
const pngData = (img: RgbaImage) => `data:image/png;base64,${Buffer.from(encodePng(img)).toString('base64')}`;
const image = (src: string, label: string, cls = '') => `<figure class="${cls}"><img src="${src}" alt="${esc(label)}"><figcaption>${esc(label)}</figcaption></figure>`;

export function writeAssetReview(avatars: RgbaImage[], pets: RgbaImage[]) {
	const root = 'test-results/assets';
	mkdirSync(root, { recursive: true });
	const avatarData = avatars.map(pngData), petData = pets.map(pngData);
	const pages: string[] = [];
	const page = (id: string, title: string, detail: string, content: string, dark = false) => {
		pages.push(`<section class="sheet ${dark ? 'dark' : ''}" id="${id}"><header><p class="eyebrow">LevelUp · Production asset review</p><h1>${esc(title)}</h1><p>${esc(detail)}</p></header>${content}<footer>${pages.length + 1} · Existing production assets · Art contract: docs/ART.md</footer></section>`);
	};
	const avatarLabel = (n: number) => {
		const skin = PAINT_SKIN[Math.floor(n / (OUTFITS.length * PAINT_HAIR.length))];
		const outfit = OUTFITS[Math.floor(n / PAINT_HAIR.length) % OUTFITS.length];
		return `${outfit.name} · ${skin.name} · ${PAINT_HAIR[n % PAINT_HAIR.length].name}`;
	};
	const petRows = (small = false) => `<div class="pet-table ${small ? 'compact' : ''}"><div class="pet-columns"><span>Species</span>${STAGES.map((s) => `<strong>${esc(s)}</strong>`).join('')}</div>${SPECIES.map((s, i) => `<div class="pet-row"><div><strong>${esc(s.name)}</strong><small>${esc(s.id)}<br>${s.starter ? 'Starter' : 'Expedition discovery'}</small></div>${STAGES.map((stage, j) => image(petData[i * STAGES.length + j], `${s.name} · ${stage}`)).join('')}</div>`).join('')}</div>`;
	const chestnut = PAINT_HAIR.findIndex((h) => h.id === 'chestnut');
	const keepers = PAINT_SKIN.flatMap((skin, s) => OUTFITS.map((outfit, o) => {
		const n = (s * OUTFITS.length + o) * PAINT_HAIR.length + chestnut;
		return image(avatarData[n], `${outfit.name} · ${skin.name}`);
	})).join('');
	page('overview', 'The keeper & six familiars', 'Four outfits · two skin tones · five hair colours · six species · four growth stages.',
		`<h2>Complete outfits · chestnut hair sample</h2><div class="keeper-overview">${keepers}</div><h2>Every familiar, from egg to adult</h2>${petRows(true)}<p class="note">Cast, provisions and room artwork share the painted style. Pet accessories remain disabled pending fitted artwork. Dedicated quest-region illustrations have not been added.</p>`);
	for (const dark of [false, true]) {
		for (const [s, skin] of PAINT_SKIN.entries()) {
			const figures = OUTFITS.flatMap((_, o) => PAINT_HAIR.map((__, h) => {
				const n = (s * OUTFITS.length + o) * PAINT_HAIR.length + h;
				return image(avatarData[n], avatarLabel(n));
			})).join('');
			page(`keepers-${skin.id}-${dark ? 'dark' : 'light'}`, `Every keeper look · ${skin.name}`, `Twenty combinations on a ${dark ? 'dark' : 'light'} surface. Rows follow the four outfits; columns follow the five hair colours.`, `<div class="avatar-grid">${figures}</div>`, dark);
		}
		page(`familiars-${dark ? 'dark' : 'light'}`, 'Every familiar & growth stage', `All 24 production cutouts on a ${dark ? 'dark' : 'light'} surface. Names and stage labels match the catalogue.`, petRows(), dark);
		const symbols = Object.entries(UI_ICONS).map(([name, icon]) => {
			if (!('svg' in icon.art)) throw new Error(`Review needs a renderer for UI icon ${name}`);
			return `<figure class="symbol">${svgDocument(icon.art, icon.palette)}<figcaption>${esc(name)}</figcaption></figure>`;
		}).join('');
		page(`symbols-${dark ? 'dark' : 'light'}`, 'Interface symbols', `${Object.keys(UI_ICONS).length} shared icons, with the same ink outlines used in the application.`, `<div class="symbol-grid">${symbols}</div>`, dark);
	}
	const items = CONSUMABLES.map((item) => image(pngData(paintPreview(uiIconFigure({ art: item.icon, palette: { ...ICON_PALETTE, primary: item.tint } }))[0]), `${item.name} · ${item.id}`, 'provision')).join('');
	const props = [{ label: 'Pet bed', figure: bed }, ...messFigures.map((m) => ({ label: m.name, figure: m.figure }))].map((p) => image(pngData(paintPreview(p.figure)[0]), p.label, 'painted-prop')).join('');
	const accessories = PET_ACCESSORIES.map((a) => {
		const img = paintPreview({ w: 12, h: 8, pivot: 0, layers: [{ z: 0, art: a.art, palette: { ...REFERENCE_PALETTE, primary: a.tint, ...(a.accent ? { accent: a.accent } : {}) } }] })[0];
		return image(pngData(img), a.name, 'pixel');
	}).join('');
	const room = fileData('static/painted/study-nook.png', 'image/png');
	page('items-and-props', 'Food, toys & room artwork', 'Provisions, furniture and room scenery painted to match the keeper and familiars.', `<h2>Food & toys · active</h2><div class="item-grid">${items}</div><h2>Small room props · active</h2><div class="prop-grid">${props}</div><h2>Room architecture · active</h2><div class="room-sample"><img src="${room}" alt="Painted fantasy study with an arched window"></div><h2>Saved accessory icons · disabled in the interface</h2><p>These six legacy icons are references only. They are not fitted overlays for the new pet silhouettes.</p><div class="prop-grid">${accessories}</div>`);
	const themes = THEMES.map((t) => `<article class="theme" style="background:${t.tokens.bg};color:${t.tokens.ink};border-color:${t.tokens.line}"><h2>${esc(t.name)}</h2><p>${esc(t.blurb)}</p><div class="swatches">${['bg', 'paper', 'ink', 'accent', 'good', 'xp', 'focus'].map((key) => `<span><i style="background:${t.tokens[key as keyof typeof t.tokens]}"></i>${key}</span>`).join('')}</div><div class="theme-button" style="background:${t.tokens.accent};color:${t.tokens.accentInk}">A little progress</div></article>`).join('');
	const appIcons = [['static/icon.svg', 'image/svg+xml', 'App SVG'], ['static/icon-180.png', 'image/png', '180px touch icon'], ['static/icon-192.png', 'image/png', '192px app icon'], ['static/icon-512.png', 'image/png', '512px app icon'], ['src/lib/sprites/art/app-small.svg', 'image/svg+xml', '16px favicon drawing']].map(([path, mime, label]) => image(fileData(path, mime), label)).join('');
	page('surfaces', 'Themes, typography & app assets', 'Six shipped colour themes, two self-hosted fonts and the application icon exports.', `<div class="theme-grid">${themes}</div><h2>App icons</h2><div class="app-icons">${appIcons}</div><h2>Typography</h2><p class="type-heading">Cormorant Garamond · Small steps count.</p><p>DM Sans · Plan your day, finish a task, and notice the progress you have made.</p><p class="note">Both fonts ship with their OFL licences in static/fonts/.</p><h2>Paper texture</h2><div class="paper-sample" style="background-image:url('${fileData('static/paper.svg', 'image/svg+xml')}')"></div>`);
	const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>LevelUp · Asset review</title><style>
		@font-face{font-family:ReviewHeading;src:url('${fileData('static/fonts/cormorant-garamond.woff2', 'font/woff2')}')}@font-face{font-family:ReviewBody;src:url('${fileData('static/fonts/dm-sans.woff2', 'font/woff2')}')}
		*{box-sizing:border-box}body{margin:0;background:#d8d5ce;font:15px ReviewBody,sans-serif;color:#433722}h1,h2,.type-heading{font-family:ReviewHeading,serif}h1{font-size:42px;margin:4px 0 8px}h2{font-size:28px;margin:18px 0 10px}p{line-height:1.5;margin:8px 0}small{display:block;font-size:11px;font-weight:400;margin-top:5px}figure{margin:0;min-width:0;text-align:center}figcaption{font-size:12px;line-height:1.4;margin:8px 0 10px}img{object-fit:contain;max-width:100%}.sheet{position:relative;width:1030px;height:1490px;margin:24px auto;padding:24px 28px 48px;background:#fff9ed;break-after:page;print-color-adjust:exact;-webkit-print-color-adjust:exact}.sheet:last-child{break-after:auto}.dark{background:#111c31;color:#f8e8c7}header{border-bottom:1px solid currentColor;padding-bottom:12px;margin-bottom:20px}.eyebrow{font-size:11px;letter-spacing:2px;text-transform:uppercase}.note{font-size:12px;border-top:1px solid currentColor;padding-top:12px}footer{position:absolute;bottom:18px;left:28px;font-size:10px}.keeper-overview{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.keeper-overview img{height:195px}.keeper-overview figcaption{margin:2px 0 8px}.avatar-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.avatar-grid img{height:260px}.pet-columns,.pet-row{display:grid;grid-template-columns:130px repeat(4,minmax(0,1fr));gap:8px;align-items:center}.pet-columns{font-size:12px;text-align:center;text-transform:capitalize;padding-bottom:10px}.pet-row{border-top:1px solid currentColor;padding:8px 0}.pet-row img{height:160px;width:100%}.pet-row figcaption{font-size:10px;margin:0}.compact .pet-row{padding:4px 0}.compact .pet-row img{height:83px}.compact .pet-row figcaption{display:none}.symbol-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:12px}.symbol svg{width:52px;height:52px}.symbol svg *{stroke:currentColor;stroke-width:1.7;fill:none}.symbol{padding:10px}.item-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.prop-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}.pixel img{image-rendering:pixelated;width:112px;height:64px}.provision img{height:100px;width:100%}.painted-prop img{height:80px;width:100%}.room-sample{height:230px;width:100%}.room-sample img{height:100%;width:100%;object-fit:contain}.theme-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.theme{padding:18px;border:1px solid;min-height:190px}.theme h2{margin:0 0 8px}.theme p{font-size:12px}.swatches{display:flex;gap:12px;margin:16px 0}.swatches span{font-size:10px;text-align:center}.swatches i{display:block;width:28px;height:28px;border:1px solid currentColor;margin-bottom:4px}.theme-button{display:inline-block;padding:8px 12px;font-size:12px}.app-icons{display:grid;grid-template-columns:repeat(5,1fr)}.app-icons img{height:110px}.type-heading{font-size:36px}.paper-sample{height:100px;background-color:#f5efdf}
		@page{size:A3 portrait;margin:12mm}@media print{body{background:white}.sheet{margin:0}}
	</style></head><body>${pages.join('')}</body></html>`;
	writeFileSync(`${root}/asset-review.html`, html);
	writeFileSync(`${root}/inventory.json`, JSON.stringify({ outfits: OUTFITS.length, skins: PAINT_SKIN.length, hairColours: PAINT_HAIR.length, avatarCombinations: avatars.length, species: SPECIES.length, petStages: pets.length, uiSymbols: Object.keys(UI_ICONS).length, foodAndToys: CONSUMABLES.length, roomProps: messFigures.length + 1, disabledAccessoryIcons: PET_ACCESSORIES.length, themes: THEMES.length, pages: pages.length }, null, 2));
}
