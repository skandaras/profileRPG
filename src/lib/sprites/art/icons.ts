/** Rounded Garden symbols. Geometry stays in a 32-unit square. */
import type { SvgArt } from '../svg';
import { Pix, type Sprite } from '../grid';
import { MESS } from '../frames';

const path = (d: string, fill = 'none') => `<path d="${d}" fill="${fill}"/>`;
const line = (d: string, color = C) => `<path d="${d}" fill="none" stroke-width="4"/><path d="${d}" fill="none" stroke="${color}"/>`;
const circle = (x: number, y: number, r: number, fill = 'none') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const rect = (x: number, y: number, w: number, h: number, fill: string, r = 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
// Shared halves guarantee structural symmetry without separate hand-drawn coordinates.
const mirror = (half: string) => half + `<g transform="translate(32 0) scale(-1 1)">${half}</g>`;
const icon = (svg: string, symmetric = false): SvgArt => ({ svg, symmetric });
const P = '{primary.1}';
const C = '{secondary.1}';
const A = '{accent.1}';
const H = '{hair.1}';
const S = '{skin.1}';

export const coin = () => icon(circle(16, 16, 12, A) + circle(16, 16, 6), true);
export const star = () => icon(path('M16 3L20 11L29 12L22 19L24 28L16 24L8 28L10 19L3 12L12 11Z', P), true);
export const heart = () => icon(path('M16 28C13 25 3 18 3 11.5C3 4 12 2 16 8C20 2 29 4 29 11.5C29 18 19 25 16 28Z', P), true);
export const drumstick = () => icon(path('M12 19L5 26M4 23C1 23 2 28 5 27C5 30 10 29 9 26L16 20', C) + path('M12 18C7 11 15 3 23 5C33 9 25 24 18 22Z', S));
export const sparkle = () => icon(path('M13 3Q15 13 24 15Q15 17 13 27Q11 17 2 15Q11 13 13 3Z', A) + path('M26 22V28M23 25H29'));
export const dumbbell = () => icon(line('M8 16H24') + mirror(rect(3, 8, 6, 16, C)), true);
export const feather = () => icon(path('M6 26C5 14 17 3 27 5C29 15 18 24 6 26Z', P) + path('M4 29L22 11'));
export const bulb = () => icon(path('M11 23C11 19 5 17 5 11A11 9 0 0 1 27 11C27 17 21 19 21 23Z', A) + path('M11 24H21L20 29H12Z', C), true);
export const book = () => icon(rect(5, 4, 23, 24, P) + path('M10 4V25M10 25H27M14 10H23', C));
export const egg = () => icon(path('M16 3C11 3 5 14 5 21C5 32 27 32 27 21C27 14 21 3 16 3Z', C) + path('M16 14L20 19L16 24L12 19Z', P), true);
export const chest = () => icon(path('M4 15V12Q4 5 11 5H21Q28 5 28 12V15Z', P) + rect(4, 15, 24, 13, P) + rect(13, 13, 6, 8, A, 1), true);
export const scroll = () => icon(path('M7 5H26Q30 5 28 10H25V26H6V10H3Q1 5 7 5Z', C) + path('M10 14H20M10 20H17'));
export const bottle = () => icon(path('M12 7V12L6 20V27Q6 29 9 29H23Q26 29 26 27V20L20 12V7Z', C) + path('M7 21H25V27H7Z', P) + rect(11, 3, 10, 5, H, 1), true);
export const bowl = () => icon(mirror(path('M5 13Q3 7 10 8Q11 3 16 5L16 13', S)) + path('M3 14H29L25 27H7Z', P), true);
export const berry = () => icon(path('M16 10C11 4 3 11 5 19Q5 28 16 28Q27 28 27 19C29 11 21 4 16 10Z', P) + path('M16 10Q16 3 23 3Q23 10 16 10Z', H));
export const cake = () => icon(rect(5, 12, 22, 16, S) + path('M4 12Q16 5 28 12V17H4Z', C) + path('M6 23H26', P) + circle(16, 8, 3, P), true);
export const fish = () => icon(path('M3 16Q13 2 23 12L29 8V24L23 20Q13 30 3 16Z', P) + circle(10, 15, 1, '{outline}') + path('M17 12L14 20'));
export const ball = () => icon(circle(16, 16, 12, P) + path('M7 24L24 7', C));
export const yarn = () => icon(circle(14, 14, 11, P) + path('M5 8L21 22M10 4L25 17M15 25Q16 30 28 27'));
export const plush = () => icon(path('M20 9L23 2L15 7', C) + path('M11 9Q18 5 23 12L24 19L29 24Q26 29 21 25L19 29H9L10 22H6Q2 22 3 17L9 15Z', P) + circle(17, 12, 1, '{outline}') + path('M13 25L16 21L20 25', C));
export const shield = () => icon(path('M16 3L28 8V17Q26 25 16 30Q6 25 4 17V8Z', P) + path('M16 10V21M12 15H20'), true);
export const hourglass = () => icon(path('M7 5Q7 11 16 16Q7 21 7 27H25Q25 21 16 16Q25 11 25 5Z', C) + path('M10 26L16 20L22 26Z', A) + path('M5 4H27M5 28H27'), true);
export const flame = () => icon(path('M17 2Q21 10 18 13L25 9Q33 25 22 29Q4 33 4 21Q4 14 11 10L10 18Q17 13 17 2Z', A) + path('M16 18Q8 26 17 28Q25 27 16 18Z', '{accent.2}'));
export const map = () => icon(path('M3 7L12 4L21 7L29 4V25L21 28L12 25L3 28Z', C) + path('M12 5V25M17 20Q24 19 23 12'));
export const sword = () => icon(path('M13 18L24 3L29 3L29 8L17 21Z', C) + path('M9 16L20 26M6 27L13 20', A));
export const paw = () => icon(path('M16 16C10 16 7 23 8 26Q9 30 16 27Q23 30 24 26C25 23 22 16 16 16Z', P) + mirror(circle(11, 8, 3, P) + circle(4, 15, 2.5, P)), true);

function mess(rows: string[], x: number, y: number): Sprite {
	return new Pix(MESS.w, MESS.h).stamp(x, y, rows).outline().toSprite();
}

export const MESS_SPRITES: Sprite[] = [
	mess(['..CCCC..', '.CCCCCC.', 'CCCCCCCC', 'CCkCCkCC', '.CCCCCC.', '..CCCC..'], 2, 4),
	new Pix(MESS.w, MESS.h).rect(1, 2, 3, 2, 'S').rect(8, 3, 2, 2, 'S').rect(4, 8, 3, 2, 'S').outline().toSprite(),
	mess(['.....HH.', '...HHHH.', '..HjjHH.', '.HHjjH..', '.HHHH...', '..HH....', '..H.....'], 2, 2),
	mess(['...SSSS...', '.SSSSSSSS.', 'SSSSSSSSSS', '.ssssssss.'], 1, 6),
	mess(['....CC', '....CC', '....PP', '....PP', '..PPPP', '.PPPPP', 'PPPPPP', '.PPPP.'], 2, 2)
];

export function petBed(): Sprite {
	return new Pix(28, 10).stamp(1, 1, [
		'......PPPPPPPPPPPPPP......',
		'...PPPPPPPPPPPPPPPPPPPP...',
		'.PPPPPCCCCCCCCCCCCCCPPPPP.',
		'PPPPCCCCddddddddddCCCCPPPP',
		'PPPPCCCCCddddddddCCCCCPPPP',
		'PPPPPPCCCCCCCCCCCCCCPPPPPP',
		'.PPPPPPPPPPPPPPPPPPPPPPPP.',
		'...pppppppppppppppppppp...'
	]).outline().toSprite();
}
