/** Brambleback's long snout, swept horns and folded wing at favicon size. */
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const rows = [
	'................',
	'..........ooo...',
	'........oodo....',
	'.....oooddo..o..',
	'....oPPPoooodo..',
	'...oqwPPPPPoo...',
	'.ooqqkPPppo..o..',
	'oqqqqqPPpo..obo.',
	'oqpqqqPPo..obAo.',
	'.oooooPPo.obAAo.',
	'.....odPPobAAAo.',
	'.....oddPobAao..',
	'....odddPobAo...',
	'....oddPPpoo....',
	'.....oooooo.....',
	'................'
];
const colors = {
	'.': '#f1eadc', o: '#2b1f33', P: '#cd815b', p: '#9b5140', q: '#efbc83',
	d: '#fff2d3', A: '#d9a84e', a: '#9b652d', b: '#f7d998', w: '#fffefd', k: '#1a1322'
};
assert.equal(rows.length, 16);
for (const row of rows) assert.equal(row.length, 16);

const rects = [];
for (let y = 0; y < 16; y++) {
	for (let x = 0; x < 16; x++) {
		const color = colors[rows[y][x]];
		assert.ok(color);
		if (rows[y][x] !== '.') rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`);
	}
}
writeFileSync('static/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" fill="${colors['.']}"/>${rects.join('')}</svg>\n`);
for (const size of [180, 192, 512]) {
	const png = new PNG({ width: size, height: size });
	const scale = Math.floor(size / 16);
	const inset = (size - scale * 16) / 2;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const gx = Math.floor((x - inset) / scale), gy = Math.floor((y - inset) / scale);
			const hex = colors[rows[gy]?.[gx] ?? '.'].slice(1);
			const i = (y * size + x) * 4;
			png.data.set([parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4), 16), 255], i);
		}
	}
	writeFileSync(`static/icon-${size}.png`, PNG.sync.write(png));
}
