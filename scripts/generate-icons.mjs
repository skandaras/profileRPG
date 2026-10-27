/** Export the Garden dragon portrait; the favicon has its own simpler drawing. */
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const source = readFileSync('src/lib/sprites/art/app.svg', 'utf8');
const small = readFileSync('src/lib/sprites/art/app-small.svg', 'utf8');
const body = (svg) => svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'));
const svg = source.replace(body(source), `<style>.small{display:none}@media(max-width:16px){.large{display:none}.small{display:inline}}</style><g class="large">${body(source)}</g><g class="small" transform="scale(2)">${body(small)}</g>`);
writeFileSync('static/icon.svg', svg);
for (const size of [180, 192, 512]) {
	writeFileSync(`static/icon-${size}.png`, new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng());
}
