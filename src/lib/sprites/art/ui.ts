/** Garden symbols share the prop palette and leave an outline inside the 16px frame. */
import { Pix, type Sprite } from '../grid';

const icon = (rows: string[]): Sprite => {
	const w = Math.max(...rows.map((r) => r.length));
	return new Pix(16, 16).stamp(Math.floor((16 - w) / 2), Math.floor((16 - rows.length) / 2), rows).outline().toSprite();
};

export const house = () => icon([
	'.....PP.....', '....PqqP....', '...PqqPPP...', '..PqqPPPPP..', '.PqqPPPPPPP.',
	'PPPPPPPPPPpp', '.CCCCCCCCcc.', '.CdCCCHHHcc.', '.CdCCCHjHcc.', '.CCCCCHjHcc.', '.ccccchhhcc.'
]);
export const clipboard = () => icon([
	'...HHHH...', '.CCHjjHCC.', 'CddHHHHCCc', 'CdCCCCCCCc', 'CdPPPPPCCc',
	'CdCCCCCCCc', 'CdPPPPPCCc', 'CdCCCCCCCc', 'CdPPPCCCCc', 'CCCCCCCCCc', '.cccccccc.'
]);
export const shirt = () => icon([
	'..PP...PP..', '.PqqCCCqPP.', 'PqqPPCCPPPp', 'PqqPPPPPPPp', 'PPPqPPPPPPP',
	'..PqPPPPp..', '..PqPPPPp..', '..PPPPPPp..', '..PPPPPPp..', '..ppppppp..'
]);
export const bag = () => icon([
	'...HHHH...', '..Hj..Hh..', '..Hj..Hh..', 'PPHHPPHhPP', 'PqqPPPPPPp',
	'PqqPPPPPPp', 'PqqPPPPPPp', 'PqPPPPPPPp', 'PPPPPPPPPp', '.pppppppp.'
]);
export const confetti = () => icon([
	'.PP...AA..CC', '.qq...bb..dd', '............', '...PP...AA..',
	'..PqqP..bb..', '..PqqPP.....', '.PqqPPA.....', '.PqPPAAb....', 'PqPPAAbbA...', 'PPPPAAAAAa..', 'ppppaaaaaa..'
]);
export const gear = () => icon([
	'....CCC....', '.CC.CdC.CC.', '.CdCCdCCdC.', '..CdCCCCc..', 'CCCCCkCCCCC',
	'CdCCkkkCCdc', 'CCCCk.kCCCc', '..CCkkkCc..', '.CdCCCCCdC.', '.CC.CcC.CC.', '....ccc....'
]);
export const flower = () => icon([
	'....PPP....', '...PqqPP...', '.PPPPPPPPP.', 'PqqPPAPPPpp', 'PqqPAbbPPpp',
	'.PPPPAPPPP.', '...PPPPp...', '..HH.HH....', '..HjjHh....', '...HHHh....', '.....hh....'
]);
export const dojo = () => icon([
	'..CC...CC..', '.CddC.CdCC.', 'CddCC.CCCCc', 'CdCCC.CCCCc', 'CCCCCdCCCCc',
	'..CCCdCCc..', '..CCCcCCc..', '..HHHHHHh..', '..CCCHCCc..', '..CCChCCc..', '..ccccccc..'
]);
export const pine = () => icon([
	'.....H.....', '....HjH....', '...HjjHH...', '..HjjHHHh..', '...HjHHh...',
	'..HjjHHHh..', '.HjjHHHHHh.', '..HjHHHHh..', '.HjjHHHHHh.', 'HjjHHHHHHHh', '....SSs....', '....sss....'
]);
export const gem = () => icon([
	'..PPPPPP..', '.PqqCCPPP.', 'PqqCCCCPPP', 'PqPCCPPPPp', 'PPPCCPPPPp',
	'.PPCCPPPp.', '..PCCPPp..', '...CPPp...', '....pp....'
]);
export const shell = () => icon([
	'....CCC....', '..CCddCCC..', '.CddCdCCCC.', 'CddCCdCCCCC', 'CdCCCdCCCCc',
	'CCCCCdCCCCc', '.CCCCdCCCc.', '..CCCcCCc..', '...CCcCc...', '...ccccc...'
]);
export const tower = () => icon([
	'....PP....', '...PqqP...', '..PPPPPP..', '..CCdCCc..', '..CCkCCc..',
	'..CCCCCc..', '..CCdCCc..', '..CCkCCc..', '.CCCdCCCc.', '.CCCHHCCc.', 'CCCCHjHCCc', 'cccchhhccc'
]);
export const dragon = () => icon([
	'....AA......', '....AbA.....', '...PPPPP....', '.PPqqPPkP...', 'PqqPPPPPP...',
	'PPPPCCPPP.P.', '.ppppPPPPAAP', '...PqPCPAAPp', '...PqCCPAapp', '...PPCCPPpp.', '..PPp..PPPp.'
]);
export const key = () => icon([
	'..AAAA......', '.AbbAAA.....', 'Abb..AAa....', 'AbA..AAa....', '.AAAAAAA....',
	'..aaaaAAA...', '.......AAA..', '........AAA.', '.......AA.AA', '........A.Aa'
]);
export const compass = () => icon([
	'....HH....', '..AAAAAA..', '.AbbAAAAa.', 'AbCCCCCAAa', 'AbCCPCCAAa',
	'ACCPPCcAAa', 'ACCPCccAAa', 'ACCCCccAAa', '.AAAAAAaa.', '..aaaaaa..'
]);
export const runner = () => icon([
	'......SS....', '.....SttS...', '......SS....', '....PPP.....', '..PPqqPPSS..',
	'.SS.PPP.....', '....PPP.....', '...CC.CC....', '..CC...CC...', '.CC.....CCHH', 'HH..........'
]);
export const walker = () => icon([
	'.....SS....', '....SttS...', '.....SS....', '....PPP....', '...PqqPP...',
	'..SPqPPPS..', '..SPPPPP.S.', '....CCC....', '...CC.CC...', '..CC...CC..', '.HH....HH..'
]);
export const stretch = () => icon([
	'.....SS.....', '....SttS....', '.....SS.....', '....PPP.....', '..SSPqPPSS..',
	'.SS.PPPP.SS.', '....CCCC....', '..CCCCCCCC..', '.CddCCCCCcc.', '..cccccccc..'
]);
export const laptop = () => icon([
	'.CCCCCCCCCC.', '.CdPPPPPPPc.', '.CdPqqPPPPc.', '.CdPqqPPPPc.', '.CdPPPPPPPc.',
	'.CdPPPPPPPc.', '.CCCCCCCCcc.', 'CCCCCCCCCCCc', 'CdCCccccCCCc', '.cccccccccc.'
]);
export const puzzle = () => icon([
	'....PPP....', '....PqP....', 'PPPPPPP....', 'PqqPPPP....', 'PqPPPPP.PP.',
	'PPPPPPPPPqP', 'PPPPPPPPPPP', 'PPPPPPPPPPp', 'PPP..PPPPPp', 'PPP..pppppp'
]);
export const newspaper = () => icon([
	'.CCCCCCCCCC', '.CdCCCCCCCc', '.CdPPPPPPcc', '.CdCCCCCCCc', '.CdPPPCCPcc',
	'.CdPqPCcCcc', 'CCdPPPCcPcc', 'CCdCCCCCCCc', 'CCdPPPPPPcc', 'CCCCCCCCccc', '.ccccccccc.'
]);
export const palette = () => icon([
	'...SSSSSS...', '.SSttSSSSS..', 'SttPPSSCCSS.', 'SttPPSSCCSSs', 'StSSSSSSSSSs',
	'SSSHHSSS..Ss', 'SSSHHSSS..Ss', '.SSSSPPSSSs.', '..SSSPPSSs..', '...ssssss...'
]);
export const speech = () => icon([
	'..CCCCCCCC..', '.CddCCCCCCc.', 'CddCCCCCCCCc', 'CdCCCCCCCCCc', 'CCkCCkCCkCCc',
	'CCCCCCCCCCCc', '.CCCCCCCCcc.', '..cccCCccc..', '....CCc.....', '...ccc......'
]);
export const bicycle = () => icon([
	'........HH..', '...HH...H...', '....H..H....', '...APPA.....', '.CCP..P.CC..',
	'CdCP..PCddC.', 'C.PCCCP.P.Cc', 'CCP...PCC.Cc', '.CC.....CCc.'
]);
export const swimmer = () => icon([
	'......SS....', '.....SttS...', '......SS....', '..SS.PPP....', '.SSSPqqPP...',
	'....PPPPPS..', '............', 'CC..CCC..CCC', 'CdCCdddCCddc', '..cc...cc...', 'CCC..CCC..CC'
]);
export const guitar = () => icon([
	'........HH.', '.......HjH.', '......HjH..', '.....HjH...', '..PP.HjH...', '.PqqPHH....',
	'.PqPPH.....', 'PPPPPkP....', 'PqqPkkPP...', 'PqPPPAPPp..', '.PPPPPPp...', '..ppppp....'
]);
export const plant = () => icon([
	'.....H.....', '..HH.HjH...', '.HjjHHjH...', '..HHHHh....', '.....H.HHH.',
	'.....HHjjH.', '.....HHHH..', '.SSSSSSSSS.', '..SttSSSs..', '..SttSSSs..', '...sssss...'
]);
export const writing = () => icon([
	'CCCCCCCC....', 'CdCCCCCC...A', 'CdCCCCCc..Ab', 'CdPPPCCc.AbA', 'CdCCCCc.AbA.',
	'CdPPPc.AbA..', 'CdCCCcAbA...', 'CdCCCHHA....', 'CdCCCHHc....', 'CCCCCCCC....', '.ccccccc....'
]);
export const phone = () => icon([
	'.CCCCCC.', 'CdCCCCcc', 'CdHHHHcc', 'CdHjjHcc', 'CdHjjHcc', 'CdHHHHcc',
	'CdHHHHcc', 'CdHHHHcc', 'CCCCCCcc', 'CCCAACcc', '.cccccc.'
]);
export const pill = () => icon([
	'......CCCC..', '.....CddCCC.', '....CddCCCCc', '...CddCCCCcc', '..PPCCCCCcc.',
	'.PqqPCCCcc..', 'PqqPPPccc...', 'PqPPPPpp....', '.PPPPpp.....', '..pppp......'
]);
export const tooth = () => icon([
	'..CCC.CCC..', '.CdddCdCCC.', 'CdddCCCCCCc', 'CddCCCCCCCc', 'CdCCCCCCCCc',
	'.CCCCCCCCc.', '.CCCCCCCCc.', '.CCCccCCCc.', '.CCc..CCCc.', '..Cc...Cc..'
]);
export const dog = () => icon([
	'HHHH...HHHH', 'HjjHPPPHjjH', 'HjHPqqPPHjH', '.HPPqqPPPH.', '.PPPkPPkPP.',
	'.PPCCCCCPP.', '..PCdkCCP..', '..PCCkCCp..', '...PPPPp...', '...ppppp...'
]);
export const target = () => icon([
	'...PPPPPP...', '..PqqCCPPP..', '.PqCCPPCCPp.', 'PqCCPCCPCCPp', 'PCCPCPPCPCCp',
	'PCCPCPPCPCCp', 'PPCCPCCPCCPp', '.PPCCPPCCPp.', '..PPCCCCPp..', '...pppppp...'
]);
export const brain = () => icon([
	'..PPP.PPP..', '.PqqPPqqPP.', 'PqqPqPqPPPP', 'PqPPqPqPPPP', 'PqPPPPPPPpp',
	'PPqPPoPPqPP', '.PPPPoPPPPp', '.PqPPoPPPPp', '..PPP.PPpp.', '...pp.pp...'
]);
export const repeat = () => icon([
	'.........PP.', '..PPPPPPPPPP', '.PqqqqqqqqP.', '.PP......P..', '.PP.........',
	'.........PP.', '..P......PP.', '.PPqqqqqqqP.', 'PPPPPPPPPP..', '.PP.........'
]);
export const trophy = () => icon([
	'..AAAAAA..', 'AAAbbAAAAA', 'AbAbbAAAaA', 'A.AbbAAa.A', '.AAAbAaAA.',
	'...AAAa...', '....Aa....', '....Aa....', '..AAAAAA..', '..aaaaaa..'
]);
export const rest = () => icon([
	'H...........', 'H.CCCC......', 'H.CddC......', 'H.CCCC.PPPPP', 'HHHHHHHqqPPP',
	'HCCCCCCqPPPP', 'HCCCCCCPPPPp', 'HHHHHHHHHHHH', 'Hh........Hh', 'hh........hh'
]);
export const broom = () => icon([
	'........HH..', '.......HjH..', '......HjH...', '.....HjH....', '....HjH.....',
	'...PPH......', '..PqqP......', '..AAAAA.....', '.AbbAAAA....', 'AbbAbAAAa...', 'AAAaAaaa....'
]);
export const check = () => icon([
	'.........PP', '........PqP', '.......PqP.', '......PqP..', 'PP...PqP...',
	'PqP.PqP....', '.PqPqP.....', '..PqP......', '...p.......'
]);
export const bandage = () => icon([
	'.......CCC..', '......CddCC.', '.....CddCCCc', '....CCCCCcc.', '...CCPPCCc..',
	'..CCPkkCc...', '.CCCPkPC....', 'CddCCPC.....', 'CdCCCc......', '.CCCc.......', '..cc........'
]);
export const lock = () => icon([
	'...CCCC...', '..CdCCcc..', '..Cc..Cc..', '..Cc..Cc..', '.AAAAAAAa.',
	'AbbAAAAAAa', 'AbAAkkAAAa', 'AAAAkkAAAa', 'AAAAkAAAAa', 'AAAAAAAAAa', '.aaaaaaaa.'
]);
export const sun = () => icon([
	'.....AA.....', '.A...bb...A.', '..b......b..', '....AAAA....', '...AbbAAA...',
	'AA.AbAAAAaAA', 'bb.AAAAAAabb', '...AAAAAAa..', '....aaaa....', '..A......A..', '.b...AA...b.', '.....bb.....'
]);
export const warning = () => icon([
	'.....AA.....', '....AbbA....', '....AbbA....', '...AAkkAA...', '...AAkkAA...',
	'..AAAkkAAA..', '..AAAkkAAA..', '.AAAAkkAAAA.', '.AAAAAAAAAA.', 'AAAAAkkAAAAa', 'Aaaaaaaaaaaa'
]);
export const undo = () => icon([
	'...PP.......', '..PqP.......', '.PqqPPPPPP..', 'PqqqqqqqqPP.', '.PqqPPPPPPp.',
	'..PqP....PPp', '...PP....PPp', '.........PPp', '.......PPPp.', '.......ppp..'
]);
export const gift = () => icon([
	'..AA..AA..', '.AbbAAbbA.', '..AAAAAA..', 'PPPPAAPPPP', 'PqqPAAPPpp',
	'PPPPAAPPPP', '.PqPAAPPp.', '.PqPAAPPp.', '.PPPAAPPp.', '.pppaappp.'
]);
export const backpack = () => icon([
	'...HHHH...', '..Hj..Hh..', '..PPPPPP..', '.PqqPPPPP.', 'PqqPPPPPPp',
	'PqPPPPPPPp', 'PqPCCCCPPp', 'PqPCddCPPp', 'PPPCccCPPp', 'PPPPPPPPPp', '.pppppppp.'
]);
export const hatch = () => icon([
	'.....AA.....', '....PPPP....', '...PqqPkP...', '..PqqPPPP...', '..PPPCCPP...',
	'.C.PPPPP.C..', '.CC.CCC.CC..', '.CdCCCCCPCc.', '..CCPPCCCc..', '...CCCCcc...', '....cccc....'
]);
