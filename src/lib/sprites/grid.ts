/**
 * Palette-indexed sprites, drawn in code.
 *
 * A sprite stores one character per pixel. Most characters name a colour
 * channel and a shade (see CHANNEL_CHARS), so the same hair drawing renders in
 * any hair colour and a shirt takes whichever dye the player picks. The
 * colours themselves live in content/palettes.ts.
 */
export interface Sprite {
	w: number;
	h: number;
	/** Frames sit side by side, so each row is w * frames characters long. */
	frames: number;
	rows: string[];
}

export type Channel = 'skin' | 'hair' | 'eye' | 'primary' | 'secondary' | 'accent';

/** shadow, base, light */
export type Ramp = readonly [string, string, string];
export type PaletteSet = Record<Channel, Ramp>;

/**
 * Character → (channel, shade). Lowercase is the shadow, uppercase the base and
 * the third letter the light, so a drawing reads roughly as shapes even in the
 * raw strings.
 */
export const CHANNEL_CHARS: Record<string, [Channel, 0 | 1 | 2]> = {
	s: ['skin', 0],
	S: ['skin', 1],
	t: ['skin', 2],
	h: ['hair', 0],
	H: ['hair', 1],
	j: ['hair', 2],
	e: ['eye', 0],
	E: ['eye', 1],
	f: ['eye', 2],
	p: ['primary', 0],
	P: ['primary', 1],
	q: ['primary', 2],
	c: ['secondary', 0],
	C: ['secondary', 1],
	d: ['secondary', 2],
	a: ['accent', 0],
	A: ['accent', 1],
	b: ['accent', 2]
};

/** Colours that never change with the player's choices. */
export const FIXED_COLORS: Record<string, string> = {
	o: '#2b1f33',
	k: '#1a1322',
	// Keep fixed white distinct from the secondary highlight in PNG exports.
	w: '#fffefd',
	r: '#f59bb0',
	m: '#a33d55',
	g: '#9a93a8',
	G: '#cfc9d9',
	n: '#5b4a66'
};

export const TRANSPARENT = '.';

/** A mutable pixel canvas with the few primitives the code-drawn art needs. */
export class Pix {
	readonly w: number;
	readonly h: number;
	px: string[];

	constructor(w: number, h: number) {
		this.w = w;
		this.h = h;
		this.px = new Array(w * h).fill(TRANSPARENT);
	}

	static from(sprite: Sprite, frame = 0): Pix {
		const p = new Pix(sprite.w, sprite.h);
		for (let y = 0; y < sprite.h; y++) {
			for (let x = 0; x < sprite.w; x++) {
				p.px[y * p.w + x] = sprite.rows[y]?.[frame * sprite.w + x] ?? TRANSPARENT;
			}
		}
		return p;
	}

	get(x: number, y: number): string {
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return TRANSPARENT;
		return this.px[y * this.w + x];
	}

	set(x: number, y: number, c: string): this {
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
		this.px[y * this.w + x] = c;
		return this;
	}

	/** Set only where something is already drawn, for shading inside a shape. */
	paint(x: number, y: number, c: string): this {
		if (this.get(x, y) !== TRANSPARENT && this.get(x, y) !== 'o') this.set(x, y, c);
		return this;
	}

	rect(x: number, y: number, w: number, h: number, c: string): this {
		for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
		return this;
	}

	/** Pixels inside the ellipse are filled. A centre on .5 keeps an even-width shape symmetric. */
	ellipse(cx: number, cy: number, rx: number, ry: number, c: string, onlyOnDrawn = false): this {
		for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
			for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
				const dx = (x - cx) / rx;
				const dy = (y - cy) / ry;
				if (dx * dx + dy * dy <= 1) {
					if (onlyOnDrawn) this.paint(x, y, c);
					else this.set(x, y, c);
				}
			}
		}
		return this;
	}

	line(x0: number, y0: number, x1: number, y1: number, c: string): this {
		const dx = Math.abs(x1 - x0);
		const dy = -Math.abs(y1 - y0);
		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;
		let err = dx + dy;
		let x = x0;
		let y = y0;
		for (;;) {
			this.set(x, y, c);
			if (x === x1 && y === y1) break;
			const e2 = 2 * err;
			if (e2 >= dy) {
				err += dy;
				x += sx;
			}
			if (e2 <= dx) {
				err += dx;
				y += sy;
			}
		}
		return this;
	}

	/** Draw a list of [x, y] points, or rows of a small stamp at an offset. */
	stamp(x: number, y: number, rows: string[]): this {
		rows.forEach((row, j) => {
			[...row].forEach((c, i) => {
				if (c !== TRANSPARENT && c !== ' ') this.set(x + i, y + j, c);
			});
		});
		return this;
	}

	/** Copy the left half onto the right, so a drawing only has to do one side. */
	mirror(): this {
		const half = Math.floor(this.w / 2);
		for (let y = 0; y < this.h; y++) {
			for (let x = 0; x < half; x++) this.set(this.w - 1 - x, y, this.get(x, y));
		}
		return this;
	}

	replace(from: string, to: string): this {
		this.px = this.px.map((c) => (c === from ? to : c));
		return this;
	}

	/**
	 * Trace an outline into every empty pixel that touches the drawing. Done per
	 * layer, which is what gives layered pixel art its readable edges: a fringe
	 * of hair outlines itself over the forehead it sits on.
	 */
	outline(c = 'o', diagonal = false): this {
		const next = [...this.px];
		const dirs = diagonal
			? [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1],
					[1, 1],
					[-1, -1],
					[1, -1],
					[-1, 1]
				]
			: [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1]
				];
		for (let y = 0; y < this.h; y++) {
			for (let x = 0; x < this.w; x++) {
				if (this.get(x, y) !== TRANSPARENT) continue;
				if (dirs.some(([dx, dy]) => this.isInk(x + dx, y + dy, c))) next[y * this.w + x] = c;
			}
		}
		this.px = next;
		return this;
	}

	private isInk(x: number, y: number, outlineChar: string) {
		const v = this.get(x, y);
		return v !== TRANSPARENT && v !== outlineChar;
	}

	/**
	 * Shade the lower-right of a shape: every drawn `base` pixel whose neighbour
	 * at (dx, dy) is empty becomes `shadow`. One pass gives a one-pixel rim, which
	 * at this size is all the light direction needs.
	 */
	rim(base: string, shadow: string, dx = 1, dy = 1): this {
		const next = [...this.px];
		for (let y = 0; y < this.h; y++) {
			for (let x = 0; x < this.w; x++) {
				if (this.get(x, y) !== base) continue;
				const n = this.get(x + dx, y + dy);
				if (n === TRANSPARENT || n === 'o') next[y * this.w + x] = shadow;
			}
		}
		this.px = next;
		return this;
	}

	/** Lay another canvas over this one; transparent pixels let this one show. */
	over(other: Pix, ox = 0, oy = 0): this {
		for (let y = 0; y < other.h; y++) {
			for (let x = 0; x < other.w; x++) {
				const c = other.get(x, y);
				if (c !== TRANSPARENT) this.set(x + ox, y + oy, c);
			}
		}
		return this;
	}

	clone(): Pix {
		const p = new Pix(this.w, this.h);
		p.px = [...this.px];
		return p;
	}

	toSprite(): Sprite {
		const rows: string[] = [];
		for (let y = 0; y < this.h; y++) rows.push(this.px.slice(y * this.w, (y + 1) * this.w).join(''));
		return { w: this.w, h: this.h, frames: 1, rows };
	}
}

/** Join single-frame sprites of one size into an animation strip. */
export function strip(frames: Sprite[]): Sprite {
	const { w, h } = frames[0];
	const rows = Array.from({ length: h }, (_, y) => frames.map((f) => f.rows[y]).join(''));
	return { w, h, frames: frames.length, rows };
}
