/**
 * The code-drawn avatar parts, all on one 32×40 frame (see frames.ts).
 *
 * Landmarks every part is drawn against:
 *   head   ellipse centred (15.5, 18), rows 11–24
 *   eyes   rows 18–21, x 10–12 and 19–21
 *   torso  rows 26–32, x 11–20; arms x 9–10 / 21–22
 *   legs   rows 33–36; feet rows 37–38
 * Shapes are drawn on the left and mirrored where the part is symmetric.
 */
import * as Garden from './garden-avatar';

// ── Bodies ──────────────────────────────────────────────────────────────────

export const bodyHuman = () => Garden.body('human');
export const bodyElf = () => Garden.body('elf');
export const bodyBeast = () => Garden.body('beast');
export const catEars = Garden.catEars;
export const catTail = Garden.catTail;
export const bunnyEars = Garden.bunnyEars;

// ── Faces ───────────────────────────────────────────────────────────────────

export const faceBright = () => Garden.face('bright');
export const faceCheery = () => Garden.face('cheery');
export const faceCalm = () => Garden.face('calm');
export const faceDetermined = () => Garden.face('determined');
export const faceSleepy = () => Garden.face('sleepy');
export const faceSparkle = () => Garden.face('sparkle');

// ── Hair ────────────────────────────────────────────────────────────────────

export const hairShort = () => Garden.hair('short');
export const hairShortBack = () => Garden.hairBack('short');
export const hairSpiky = () => Garden.hair('spiky');
export const hairSpikyBack = () => Garden.hairBack('spiky');
export const hairBob = () => Garden.hair('bob');
export const hairBobBack = () => Garden.hairBack('bob');
export const hairLongFront = () => Garden.hair('long');
export const hairLongBack = () => Garden.hairBack('long');
export const hairTwinTails = () => Garden.hair('twintails');
export const hairTwinTailsBack = () => Garden.hairBack('twintails');
export const hairPonytail = () => Garden.hair('ponytail');
export const hairPonytailBack = () => Garden.hairBack('ponytail');
export const hairBun = () => Garden.hair('bun');
export const hairBunBack = () => Garden.hairBack('bun');
export const hairCurly = () => Garden.hair('curly');
export const hairCurlyBack = () => Garden.hairBack('curly');

// The first outfit and the remaining wardrobe share the Garden drawing rules.
export const topTee = Garden.top;
export const bottomShorts = Garden.bottom;
export const shoesSneakers = Garden.shoes;
export * from './garden-wardrobe';
