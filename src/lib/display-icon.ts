/** Saved values stay text; only their display is translated to the shared art. */
import type { UiIconName } from '$lib/sprites/ui-icons';

const ICONS: Record<string, UiIconName> = {
	'🏡': 'house', '📋': 'clipboard', '🐾': 'paw', '🗺': 'map', '⭐': 'xp', '🌟': 'xp',
	'👕': 'shirt', '🛍': 'bag', '🎉': 'confetti', '⚙': 'gear',
	'💕': 'joy', '🎾': 'ball', '🧹': 'broom', '🫐': 'berry',
	'💪': 'str', '🏋': 'str', '🍃': 'dex', '💡': 'int', '📚': 'kno', '📖': 'kno',
	'🥚': 'egg', '🪙': 'gp', '🛡': 'shield', '🗝': 'key', '🧭': 'compass',
	'🌼': 'flower', '🌸': 'flower', '📜': 'scroll', '🥋': 'dojo', '🌲': 'pine',
	'💎': 'gem', '🐚': 'shell', '🗼': 'tower', '🐉': 'dragon',
	'🏃': 'runner', '🚶': 'walker', '🧘': 'stretch', '🚴': 'bicycle', '🏊': 'swimmer',
	'💻': 'laptop', '🧩': 'puzzle', '📰': 'newspaper', '🎨': 'palette', '🎸': 'guitar',
	'🗣': 'speech', '💧': 'bottle', '😴': 'rest', '🛌': 'rest', '🥗': 'bowl',
	'🪴': 'plant', '✍': 'writing', '📞': 'phone', '💊': 'pill', '🦷': 'tooth',
	'🐕': 'dog', '🎯': 'target', '🧠': 'brain',
	'🔥': 'flame', '🏆': 'trophy', '🔁': 'repeat', '🔒': 'lock', '⏳': 'hourglass',
	'✅': 'check', '✓': 'check', '✔': 'check', '🩹': 'bandage', '☀': 'sun',
	'⚠': 'warning', '✨': 'tidy', '✦': 'tidy', '✧': 'tidy', '🎁': 'gift', '💝': 'gift',
	'🎒': 'backpack', '😋': 'food', '🐣': 'hatch', '↩': 'undo'
};

export function displayIcon(value: string): UiIconName | undefined {
	const key = value.replace(/[\uFE0E\uFE0F]/g, '');
	return Object.hasOwn(ICONS, key) ? ICONS[key] : undefined;
}
