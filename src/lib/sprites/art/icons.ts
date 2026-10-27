/**
 * Garden props keep broad highlights and rounded steps at their native size.
 * Channels stay shared with the catalogues so item tints and reference PNGs agree.
 */
import { Pix, type Sprite } from '../grid';
import { ICON, MESS } from '../frames';

const icon = (rows: string[], x = 0, y = 0): Sprite =>
	new Pix(ICON.w, ICON.h).stamp(x, y, rows).outline().toSprite();

export const coin = () => icon([
	'...AAAA...', '..AbbAAA..', '.AbbAAAAa.', 'AbbAaaAAaa',
	'AbAAAbAAaa', 'AAAAAbAAaa', 'AAAAaaAAaa', '.AAAAAAaa.', '..Aaaaaa..', '...aaaa...'
], 3, 3);

export const star = () => icon([
	'.....A.....', '....AbA....', '....AbA....', 'AAAAbbbAAAA',
	'AbbbbbAAAAa', '.AbbbAAAAa.', '..AbAAAaa..', '..AAAAAaa..', '.AAaa.aaaa.', '.Aa.....aa.'
], 2, 3);

export const heart = () => icon([
	'.PPP..PPP.', 'PqqPPPPPPP', 'PqqPPPPPPp', 'PPPPPPPPPp',
	'PPPPPPPPPp', '.PPPPPPPp.', '..PPPPPp..', '...PPPp...', '....pp....'
], 3, 4);

export const drumstick = () => icon([
	'.....SSSS..', '....SttSSS.', '...SttSSSSs', '...SSSSSSSs',
	'....SSSSSs.', '...CCSSss..', '..CdCC.....', '.CdCC......', '.CCC.......'
], 2, 3);

export const sparkle = () => icon([
	'....A......', '....b......', '...AbA.....', '..AbdbA....',
	'AbbdddbbA..', '..AbdbA..A.', '...AbA..AbA', '....A....A.'
], 2, 4);

export const dumbbell = () => icon([
	'.CC......CC.', 'CdCc....CdCc', 'CdCccccccCCc', 'CCCddddddCCc',
	'CCCccccccCcc', '.cc......cc.'
], 2, 5);

export const feather = () => icon([
	'.......PPP', '.....PPqqP', '....PqqqPP', '...PqqPPpp',
	'..PqqPPpp.', '.PqqPPpp..', '.PqPPpp...', '..Ppp.....', '.p........', 'p.........'
], 3, 2);

export const bulb = () => icon([
	'...AAAA...', '..AbbAAA..', '.AbbAAAAa.', '.AbbAAAAa.',
	'.AAAAAAAa.', '..AAAAAa..', '...AAAa...', '...CCCC...', '...cccc...', '....cc....'
], 3, 2);

export const book = () => icon([
	'.PPPPPPPP.', 'PqqPPPPPPp', 'PqCCCCCCPp', 'PqCccCCCPp',
	'PqCCCCCCPp', 'PPCCCCCCPp', 'PPPPPPPPPp', 'PCCCCCCCCp', '.pppppppp.'
], 3, 3);

export const egg = () => icon([
	'...CC...', '..CddC..', '.CddCCC.', '.CdPCCC.', 'CCCCCPCC',
	'CCPPCCCc', 'CCPPCCCc', '.CCCCcc.', '..cccc..'
], 4, 3);

export const chest = () => icon([
	'..PPPPPP..', '.PqqqPPPP.', 'PqqPPPPPPp', 'PqPPPPPPPp',
	'AAAACCAAAA', 'PPPPCAPPPp', 'PPPPaaPPPp', 'PPPPPPPPPp', '.pppppppp.'
], 3, 4);

export const scroll = () => icon([
	'.CCCCCCCC.', 'CdCdCCCCCc', '.CCdCCCCc.', '.CCPPPPCc.',
	'.CCdCCCCc.', '.CCPPPCCc.', '.CCdCCCCc.', 'CdCCCCCCdc', '.cccccccc.'
], 3, 3);

export const bottle = () => icon([
	'...HHHH...', '...Hjjh...', '....CC....', '...CdCC...', '..CddCCC..',
	'.CPqPPPPc.', '.CPqPPPPc.', '.CPPPPPPc.', '.CPPPPPpc.', '..cccccc..'
], 3, 2);

export const bowl = () => icon([
	'..SS..SS..', '.SttSSttS.', 'SSSSsSSSSs', 'CCCCCCCCCC',
	'PqqPPPPPPp', 'PqqPPPPPPp', '.PPPPPPPp.', '..pppppp..'
], 3, 4);

export const berry = () => icon([
	'....H.....', '..HHjHH...', '..HjjH....', '.PPP.PPP..', 'PqqPPPqqP.',
	'PqqPPPPPPp', 'PPPPPPPPPp', '.PPpPPPpp.', '..pp.ppp..'
], 3, 3);

export const cake = () => icon([
	'....PP....', '...PqqP...', '..CCCCCC..', '.CddCCCCc.', 'CCCCCCCCcc',
	'SttSSSSSSs', 'SPPPPPPPps', 'SttSSSSSSs', '.ssssssss.'
], 3, 3);

export const fish = () => icon([
	'.....PP.....', '...PPqqP....', '.PPqqqPPP..P', 'PqPPPPPPPPPP',
	'PPkPPPPPPPPP', '.PPPPPPPp..P', '...ppppp....', '.....pp.....'
], 2, 4);

export const ball = () => icon([
	'...PPPP...', '..PqqPPP..', '.PqqPPCCP.', 'PqqPPCCPPp', 'PPPPCCPPPp',
	'PPPCCPPPPp', 'PPCCPPPPPp', '.CCPPPPPp.', '..PPPPpp..', '...pppp...'
], 3, 3);

export const yarn = () => icon([
	'...PPPP....', '..PqqPPP...', '.PqqpPPqP..', 'PqqpPPqPPp.', 'PPpPPqPPpp.',
	'PpPPqPPpPp.', 'PPqqPPpPPp.', '.PPPPpPPp..', '..pppppp..P', '.......PPPP'
], 2, 3);

// A stitched Brambleback: long muzzle, cream horn, folded wing and trailing tail.
export const plush = () => icon([
	'....CC......', '....CPPP....', '...PqqPkP...', '.PPqqPPPP...', 'PqqPPCCPP.P.',
	'PPPPPCCPPAAP', '.pppPPPPAAPp', '...PqCkPAapp', '...PqCCPPpp.', '..PPp..PPPp.'
], 2, 3);

export const shield = () => icon([
	'..PPPPPP..', 'PPqqPPPPPP', 'PqPPAAPPPp', 'PqPAbbAPPp', 'PPPPAAPPPp',
	'.PPPAAPPp.', '.PPPPPPPp.', '..PPPPPp..', '...PPPp...', '....pp....'
], 3, 3);

export const hourglass = () => icon([
	'SttSSSSSSS', '.CCCCCCCc.', '..CbAAAc..', '...CAAc...', '....Cc....',
	'...Cbbc...', '..CbAAAc..', '.CAAAAAAc.', 'SSSSSSSSss'
], 3, 3);

export const flame = () => icon([
	'.....A....', '....Ab....', '...AbbA...', '...AbbA.A.', '..AbbAAAbA',
	'.AbbbbbAAa', '.AbbdbbAAa', 'AbbdddbbAa', 'AbbdddbbAa', '.AbbbbAAa.', '..Aaaaaa..'
], 3, 2);

export const map = () => icon([
	'..CC......CC', 'CCddCCCCCCdc', 'CdCdCCccCCdc', 'CdCdCCCCCCdc', 'CCCdkCCPPCc',
	'CCCdkCCPPCCc', 'CCCdCkkCCCcc', 'CCddCCCCcc..', 'CC......cc..'
], 2, 4);

export const sword = () => icon([
	'.........CC', '........CdC', '.......CdCc', '......CdCc.', '.....CdCc..',
	'..A.CdCc...', '..bACcc....', '...AAc.....', '..AaAA.....', '.AA..A.....', '.A.........'
], 2, 2);

export const paw = () => icon([
	'..PP....PP..', '.PqqP..PqqP.', '..PP....PP..',
	'PP........PP', 'PqP..PP..PqP', '.P..PqqP..P.',
	'...PqqPPP...', '..PqqPPPPp..', '..PPPPPPPp..', '...pp..pp...'
], 2, 3);

function mess(rows: string[], x: number, y: number): Sprite {
	return new Pix(MESS.w, MESS.h).stamp(x, y, rows).outline().toSprite();
}

export const MESS_SPRITES: Sprite[] = [
	// Connected tufts leave room for a face without speckling the dust.
	mess(['..CC.CC..', '.CddCCCC.', 'CCddCCCCc', 'CCCkCCkCc', '.CCCCCCc.', '..ccccc..'], 1, 4),
	mess(['.SS......', '.ttS..SS.', '..ss..ts.', '....SS...', 'SS..ts...', 'ts.......'], 1, 4),
	mess(['.....HH..', '...HjjH..', '..HjjHH..', '.HjjHHh..', '.HjHHh...', '..Hhh....', '.h.......'], 2, 2),
	mess(['..SS...SS.', '.SttSSSSSs', 'SSSSSSSSss', '.ssssssss.'], 1, 6),
	mess(['...CCCC.', '...Pqqp.', '...PPpp.', '...PPpp.', '.PPPPpp.', 'PqqPPpp.', 'PPPPpp..', '.pppp...'], 2, 2)
];

export function petBed(): Sprite {
	return new Pix(28, 10).stamp(1, 1, [
		'......PPPPPPPPPPPPPP......',
		'...PPPqqqqqqqqqqPPPPPPP...',
		'.PPqqqCCCCCCCCCCCCCCPPppp.',
		'PqqqCCddddddCCCCCCCCCCPPpp',
		'PqqqCCddddCCCCCCCCCCCcPPpp',
		'PPqqPPCCCCCCCCCCCCCCPPpppp',
		'.PPPPPPPPPPPPPPPPPPppppp.',
		'...ppppppppppppppppppp...'
	]).outline().toSprite();
}
