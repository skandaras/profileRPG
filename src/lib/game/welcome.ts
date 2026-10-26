/**
 * The daily welcome-back: the first visit of each game day finds a little mess
 * in the pet's room. Tidying it pays a coin per piece, and a pat afterwards
 * pays a bit more. Being away longer means more mess and a bigger greeting,
 * so coming back after a gap feels good rather than guilty.
 */
export const MAX_MESS = 5;
export const MESS_GP = 1;
export const MESS_TIDINESS = 20;
export const GREET_XP = 5;
export const GREET_JOY = 20;
export const MISSED_YOU_DAYS = 3;
export const MISSED_YOU_GP = 10;

export interface Arrival {
	newDay: boolean;
	daysAway: number;
	returnStreak: number;
	mess: number;
}

export function arrive(lastVisitDay: number | null, returnStreak: number, today: number): Arrival {
	if (lastVisitDay === today) return { newDay: false, daysAway: 0, returnStreak, mess: 0 };
	const daysAway = lastVisitDay === null ? 0 : Math.max(0, today - lastVisitDay - 1);
	return {
		newDay: true,
		daysAway,
		returnStreak: lastVisitDay === today - 1 ? returnStreak + 1 : 1,
		mess: Math.min(MAX_MESS, 1 + daysAway)
	};
}

/** Gifts for coming back several days running. */
export const RETURN_MILESTONES: Record<number, { item: string; qty: number; text: string }> = {
	3: { item: 'treat.cake', qty: 1, text: 'Three days running! Here is a honey cake.' },
	7: { item: 'treat.star', qty: 1, text: 'A whole week! Have a star candy.' },
	14: { item: 'treat.star', qty: 2, text: 'Two weeks straight. Two star candies!' },
	30: { item: 'toy.plush', qty: 1, text: 'Thirty days! A pocket plush for your friend.' }
};

export function greetGp(daysAway: number, welcomeMod: number): number {
	return (daysAway >= MISSED_YOU_DAYS ? MISSED_YOU_GP : 0) + Math.max(0, Math.round(welcomeMod));
}
