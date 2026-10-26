/**
 * A ticking "now" for countdowns, corrected by the server's clock so a dev
 * time-skip (or a phone with the wrong time) still counts down to the right
 * moment.
 */
export function ticker(serverNow: () => number) {
	const offset = $derived(serverNow() - Date.now());
	let local = $state(Date.now());
	$effect(() => {
		const t = setInterval(() => (local = Date.now()), 1000);
		return () => clearInterval(t);
	});
	return {
		get now() {
			return local + offset;
		}
	};
}

export function countdown(ms: number): string {
	if (ms <= 0) return 'Done!';
	const s = Math.ceil(ms / 1000);
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(sec).padStart(2, '0')}`;
}

export function duration(ms: number): string {
	const m = Math.round(ms / 60_000);
	if (m < 60) return `${m} min`;
	const h = m / 60;
	return Number.isInteger(h) ? `${h} h` : `${h.toFixed(1)} h`;
}
