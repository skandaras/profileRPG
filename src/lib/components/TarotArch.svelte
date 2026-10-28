<svg class="room-art" viewBox="0 0 240 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
	<path class="pane" d="M12 240V100Q12 15 120 5q108 10 108 95v145Z" />
	<g class="rule">
		<path d="M35 235V104q0-60 85-77 85 17 85 77v131M120 29v116M35 145h170M35 108h170M20 228q95-40 200 0" />
		<circle cx="120" cy="80" r="28" />
		<path d="m120 52 8 19 20 9-20 8-8 20-8-20-20-8 20-9Z" />
	</g>
	<g class="stars"><circle cx="63" cy="63" r="2" /><circle cx="182" cy="63" r="2" /><circle cx="65" cy="125" r="2" /><circle cx="176" cy="125" r="2" /></g>
</svg>

<style>
	.room-art {
		position: absolute;
		inset: 0;
		width: 100%;
		height: calc(100% - 26px);
		pointer-events: none;
	}

	.pane {
		fill: var(--window);
		stroke: var(--line);
		stroke-width: 1.5;
	}

	.rule {
		fill: none;
		stroke: var(--line);
	}

	.stars {
		fill: var(--accent);
	}
</style>
