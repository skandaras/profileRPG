/**
 * 16×16 icons and the small props of the pet's room. Each icon is drawn in
 * channel colours and given its palette by the catalogue entry that uses it,
 * so one bottle drawing serves every dye.
 */
import { Pix, type Sprite } from '../grid';
import { ICON, MESS } from '../frames';

const icon = (rows: string[], x = 0, y = 0): Sprite => {
	const p = new Pix(ICON.w, ICON.h).stamp(x, y, rows);
	return p.outline().toSprite();
};

export const coin = () =>
	icon(['..AAAA..', '.AbbAAA.', 'AbAAAAaA', 'AbAaaAaA', 'AAAaaAaA', 'AAAAAAaA', '.AaaaaA.', '..AAAA..'], 4, 4);

export const star = () =>
	icon(['....A....', '...AbA...', '...AbA...', 'AAAAbAAAA', '.AbbbbbA.', '..AbbbA..', '..AAaAA..', '.AA...AA.', '.A.....A.'], 3, 3);

export const heart = () =>
	icon(['.PP..PP.', 'PqPPPPPP', 'PqPPPPPP', 'PPPPPPPp', '.PPPPPp.', '..PPPp..', '...Pp...'], 4, 5);

export const drumstick = () =>
	icon(['...SSSS.', '..SStSSS', '..StSSSs', '..SSSSSs', '...SSss.', '..ww....', '.wGw....', '.Gw.....'], 4, 4);

export const sparkle = () =>
	icon(['...A....', '...A....', '..AbA...', 'AAbwbAA.', '..AbA..A', '...A..AbA', '...A...A.'], 3, 4);

export const dumbbell = () =>
	icon(['GG......GG', 'Gw......Gw', 'GGggggggGG', 'GwgGGGGgGw', 'GG......GG'].map((r) => r), 3, 6);

export const feather = () =>
	icon(['.......PP', '......PqP', '.....PqPP', '....PqPP.', '...PqPP..', '..PqPP...', '..qPP....', '.n.......', 'n........'], 3, 3);

export const bulb = () =>
	icon(['..AAAA..', '.AbbAAA.', 'AbAAAAAa', 'AbAAAAAa', '.AAAAAa.', '..AAAa..', '..GGGG..', '..gggg..', '...GG...'], 4, 3);

export const book = () =>
	icon(['PPPPPPPP.', 'PwwwwwwPp', 'PwkkkwwPp', 'PwwwwwwPp', 'PwkkkkwPp', 'PwwwwwwPp', 'PPPPPPPPp', '.ppppppp.'], 3, 4);

export const egg = () => icon(['..CC..', '.CPCC.', 'CCCCPC', 'CPCCCC', 'CCCPCc', '.CCCc.', '..cc..'], 5, 5);

export const chest = () =>
	icon(['.PPPPPPPP.', 'PqqqqqqqqP', 'PPPPAAPPPP', 'AAAAbAAAAA', 'PPPPAaPPPP', 'PPPPPPPPPp', 'PpppppPppp'], 3, 5);

export const scroll = () =>
	icon(['.CCCCCCC.', 'CdCCCCCCc', '.CPPPPPC.', '.CCCCCCC.', '.CPPPPC..', '.CCCCCCC.', 'CdCCCCCCc', '.CCCCCCC.'], 3, 4);

export const bottle = () =>
	icon(['...nn...', '...GG...', '..GwwG..', '.GPPPPG.', 'GPqPPPPG', 'GPPPPPpG', 'GPPPPPpG', '.GppppG.'], 4, 4);

export const bowl = () =>
	icon(['.SStSSSS.', 'SSSSSSSSS', 'PPPPPPPPP', 'PqPPPPPPp', '.PPPPPPp.', '..ppppp..'], 3, 6);

export const berry = () => icon(['....HH..', '...HH...', '.PP.PP..', 'PqPPPqP.', 'PPPPPPPp', '.PPpPPp.', '..Ppp...'], 4, 4);

export const cake = () =>
	icon(['....P....', '...wCw...', '..CCCCC..', '.wwwwwww.', '.SSSStSS.', '.PPPPPPP.', '.SSSSSSs.', '.sssssss.'], 3, 4);

export const fish = () => icon(['....PPP...', '..PPqPPP.P', '.PkPPPPPPP', '.PPPPPPp.P', '..Pppp....'], 3, 6);

export const ball = () => icon(['..PPPP..', '.PqwwPP.', 'PqPwwPPp', 'PPPPPPPp', 'wwwwwwww', 'PPPPPPpp', '.PPPPpp.', '..pppp..'], 4, 4);

export const yarn = () => icon(['..PPPP..', '.PqPqPP.', 'PqPqPqPp', 'PPqPqPPp', 'PqPqPqPp', '.PPqPpp.', '..pppp.P', '.......P'], 4, 4);

export const plush = () => icon(['.CC..CC.', '.CdCCdC.', 'CCCCCCCC', 'CkCCCkCC', 'CCCrrCCc', '.CCCCCc.', 'CC.cc.Cc'], 4, 4);

export const shield = () => icon(['PPPPPPPP', 'PqqqAPPp', 'PqqAbAPp', 'PqPAAPPp', '.PPPPPp.', '.PPPPPp.', '..PPpp..', '...pp...'], 4, 4);

export const hourglass = () =>
	icon(['SSSSSSSS', '.GAAAAG.', '..GAAG..', '...GG...', '...GG...', '..GAAG..', '.GAAAAG.', 'SSSSSSSS'], 4, 4);

export const flame = () => icon(['...A....', '..AA..A.', '..AbA.A.', '.AbbAAA.', '.AbbbbA.', 'AbbwwbbA', 'AbwwwbbA', '.AbbbbA.', '..AAAA..'], 4, 3);

export const map = () =>
	icon(['CCCdCCCdCC', 'CcCCCcCCCc', 'CCkCCCCCCC', 'CCCkkCCPCC', 'CCCCCkCPCC', 'CcCCCcCCCc', 'CCCdCCCdCC'], 3, 5);

export const sword = () => icon(['.......wG', '......wG.', '.....wG..', '....wG...', '.aAwG....', '..aA.....', '.aAaA....', 'A........'], 4, 4);

export const paw = () => icon(['.P...P..', 'PPP.PPP.', '.P.P.P..', '..PPPP..', '.PPPPPP.', '.PPPPPP.', '..PPPP..'], 4, 4);

// ── The pet's room ──────────────────────────────────────────────────────────

function mess(rows: string[], x = 0, y = 0): Sprite {
	return new Pix(MESS.w, MESS.h).stamp(x, y, rows).outline().toSprite();
}

export const MESS_SPRITES: Sprite[] = [
	// dust bunny, with eyes
	mess(['...GGG..', '.GGGGGG.', 'GGkGGkGG', 'GGGGGGGG', '.GgGGgG.'], 2, 4),
	// crumbs
	mess(['S.....', '..S..S', '.S....', '....S.', 'S..S..'], 3, 5),
	// a fallen leaf
	mess(['....HH', '..HHHH', '.HHjHH.', 'HHjHH..', 'nHH....'], 2, 4),
	// a muddy puddle
	mess(['..nnnn..', '.nnSnnn.', 'nnnnnnnn', '.nnnnSn.'], 2, 5),
	// a lost sock
	mess(['..PP', '..wP', '..PP', '.PPP', 'PPPP', 'PPP.'], 4, 3)
];

export function petBed(): Sprite {
	const p = new Pix(28, 10);
	p.ellipse(13.5, 5, 13.5, 4.5, 'P');
	p.ellipse(13.5, 4, 10, 2.5, 'C');
	p.rim('P', 'p', 0, 1);
	return p.outline().toSprite();
}
