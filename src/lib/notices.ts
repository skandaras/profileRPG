/** What an action tells the player afterwards. Shared by server and browser. */
export interface Notice {
	kind: 'xp' | 'gp' | 'level' | 'stat' | 'pet' | 'egg' | 'item' | 'info' | 'warn';
	text: string;
	icon?: string;
}
