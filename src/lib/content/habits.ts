/**
 * Ready-made habits to pick from. Every field can be changed when adding one,
 * and a custom habit is the same shape built from scratch.
 */
import type { Schedule } from '$lib/game/schedule';
import type { Difficulty, StatWeights } from './types';

export interface HabitTemplate {
	id: string;
	title: string;
	icon: string;
	blurb: string;
	weights: StatWeights;
	difficulty: Difficulty;
	schedule: Schedule;
	quantity?: number;
	unit?: string;
}

const daily = (target = 1): Schedule => ({ type: 'daily', target });
const weekly = (target: number): Schedule => ({ type: 'weekly', target });

export const HABIT_TEMPLATES: HabitTemplate[] = [
	{ id: 'exercise', title: 'Exercise', icon: '🏃', blurb: 'Get moving for a while.', weights: { str: 1 }, difficulty: 'medium', schedule: daily(), quantity: 20, unit: 'minutes' },
	{ id: 'strength', title: 'Strength training', icon: '🏋️', blurb: 'Weights, bodyweight, resistance bands.', weights: { str: 1 }, difficulty: 'hard', schedule: weekly(3), quantity: 30, unit: 'minutes' },
	{ id: 'walk', title: 'Go for a walk', icon: '🚶', blurb: 'Fresh air counts double.', weights: { str: 0.6, dex: 0.4 }, difficulty: 'easy', schedule: daily(), quantity: 20, unit: 'minutes' },
	{ id: 'yoga', title: 'Yoga or stretching', icon: '🧘', blurb: 'Loosen up and find your balance.', weights: { dex: 1 }, difficulty: 'easy', schedule: daily(), quantity: 10, unit: 'minutes' },
	{ id: 'sport', title: 'Play a sport', icon: '🎾', blurb: 'Tennis, climbing, dance, anything with a ball or a beat.', weights: { dex: 0.7, str: 0.3 }, difficulty: 'medium', schedule: weekly(2) },
	{ id: 'read', title: 'Read a book', icon: '📖', blurb: 'Something that makes you think.', weights: { int: 0.5, kno: 0.5 }, difficulty: 'easy', schedule: daily(), quantity: 10, unit: 'pages' },
	{ id: 'coding', title: 'Work on a project', icon: '💻', blurb: 'Code, build, write: push something forward.', weights: { int: 1 }, difficulty: 'medium', schedule: weekly(3), quantity: 30, unit: 'minutes' },
	{ id: 'puzzle', title: 'Puzzle or brain game', icon: '🧩', blurb: 'Crossword, sudoku, chess, a tricky level.', weights: { int: 0.7, dex: 0.3 }, difficulty: 'easy', schedule: daily() },
	{ id: 'news', title: 'Catch up on the news', icon: '📰', blurb: 'Know what is going on in the world.', weights: { kno: 1 }, difficulty: 'easy', schedule: daily() },
	{ id: 'skill', title: 'Practise a hobby or skill', icon: '🎨', blurb: 'Drawing, an instrument, sewing, cooking: anything new.', weights: { kno: 0.6, dex: 0.4 }, difficulty: 'medium', schedule: weekly(3), quantity: 20, unit: 'minutes' },
	{ id: 'language', title: 'Language practice', icon: '🗣️', blurb: 'A lesson, a podcast, a conversation.', weights: { kno: 0.6, int: 0.4 }, difficulty: 'easy', schedule: daily(), quantity: 10, unit: 'minutes' },
	{ id: 'water', title: 'Drink enough water', icon: '💧', blurb: 'Your body will thank you.', weights: { str: 1 }, difficulty: 'easy', schedule: daily(), quantity: 8, unit: 'glasses' },
	{ id: 'sleep', title: 'In bed on time', icon: '😴', blurb: 'Rest is training too.', weights: { str: 0.5, int: 0.5 }, difficulty: 'medium', schedule: daily() },
	{ id: 'meal', title: 'Cook a healthy meal', icon: '🥗', blurb: 'Something with colour in it.', weights: { str: 0.5, kno: 0.5 }, difficulty: 'medium', schedule: weekly(3) },
	{ id: 'meditate', title: 'Meditate', icon: '🌸', blurb: 'A few quiet minutes.', weights: { int: 0.6, dex: 0.4 }, difficulty: 'easy', schedule: daily(), quantity: 5, unit: 'minutes' },
	{ id: 'tidy', title: 'Tidy up', icon: '🧹', blurb: 'Ten minutes of putting things back.', weights: { dex: 0.6, str: 0.4 }, difficulty: 'easy', schedule: daily(), quantity: 10, unit: 'minutes' }
];

/** Emoji offered when building a custom habit. Any emoji works; these are the quick picks. */
export const HABIT_ICONS = ['⭐', '🏃', '🏋️', '🚶', '🧘', '🎾', '🚴', '🏊', '📖', '💻', '🧩', '📰', '🎨', '🎸', '🗣️', '💧', '😴', '🥗', '🌸', '🧹', '🪴', '✍️', '📞', '💊', '🦷', '🐕', '🎯', '🧠'];
