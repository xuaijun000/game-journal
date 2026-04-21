/* ===== 瀹濆彲姊﹀鎴樺姪鎵?=====
 * Supabase 寤鸿〃 SQL锛堝湪 Supabase Dashboard > SQL Editor 鎵ц锛?
 *
 * CREATE TABLE battle_teams (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id uuid REFERENCES auth.users(id),
 *   team_name text NOT NULL DEFAULT '鎴戠殑闃熶紞',
 *   pokemon jsonb DEFAULT '[]'::jsonb,
 *   created_at timestamptz DEFAULT now(),
 *   updated_at timestamptz DEFAULT now()
 * );
 * ALTER TABLE battle_teams ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "own_teams" ON battle_teams FOR ALL TO authenticated
 *   USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
 */

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 甯搁噺 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const B_TYPES=['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
const B_MOVE_CATS_ZH={physical:'鐗╃悊',special:'鐗规畩',status:'鍙樺寲'};
const FORM_SUFFIX_ZH={
  'mega':'Mega','mega-x':'Mega X','mega-y':'Mega Y',
  'alola':'闃跨綏鎷?,'alolan':'闃跨綏鎷?,
  'galar':'浼藉嫆灏?,'galarian':'浼藉嫆灏?,
  'hisui':'娲楃繝','hisuian':'娲楃繝',
  'paldea':'甯曞簳浜?,'paldean':'甯曞簳浜?,
  'gmax':'鏋佸法鍖?,
  'eternamax':'姘告瀬宸ㄥ寲',
  'primal':'鍘熷鍥炲綊',
  'origin':'璧锋簮褰㈡€?,'sky':'澶╃┖褰㈡€?,'land':'澶у湴褰㈡€?,
  'attack':'鏀诲嚮褰㈡€?,'defense':'闃插尽褰㈡€?,'speed':'閫熷害褰㈡€?,
  'plant':'妞嶇墿鏂楃','sandy':'娌欐紶鏂楃','trash':'鍨冨溇鏂楃',
  'zen':'鍐ユ兂妯″紡',
  'heat':'鏆栫倝褰㈡€?,'wash':'娓呮礂褰㈡€?,'frost':'鍐扮褰㈡€?,'fan':'鐢垫墖褰㈡€?,'mow':'鍓茶崏褰㈡€?,
  'therian':'鐏靛吔褰㈡€?,'incarnate':'闄嶄复褰㈡€?,
  'black':'榛戣壊褰㈡€?,'white':'鐧借壊褰㈡€?,
  'resolute':'鍐冲績褰㈡€?,'ordinary':'鏅€氬舰鎬?,
  'pirouette':'鑸炴褰㈡€?,'aria':'姝屽０褰㈡€?,
  'complete':'瀹屽叏褰㈡€?,'core':'50%褰㈡€?,
  'dusk-mane':'榛勬槒涔嬮瑑','dawn-wings':'榛庢槑涔嬬考',
  'ultra':'绌舵瀬褰㈡€?,
  'original':'鍘熷褰㈡€?,
  'crowned':'鐜嬭€呭舰鎬?,'hero':'鑻遍泟褰㈡€?,'single':'鍗曞墤褰㈡€?,'rapid':'閫熸敾褰㈡€?,
  'ice':'鍐伴潰褰㈡€?,'noice':'鍐伴潰褰㈡€?,
  'hangry':'楗ラタ褰㈡€?,'full-belly':'楗辫吂褰㈡€?,
  'roaming':'娓歌蛋褰㈡€?,
  'family':'瀹舵棌褰㈡€?,
  'female':'鈾€','male':'鈾?,
};
// 瀵规垬鏁版嵁 鈥?閫氳繃 loadBattleGameData(gameId) 浠庢敞鍐岃〃鍔犺浇锛屾敮鎸佸鐗堟湰闅旂
let MOVES_DATA = [];
let MOVES_BY_SLUG = {};
let PKM_LIST = [];
let PKM_PC_BY_SLUG = {};
let PKM_PC_BY_NUM  = {};
let ITEMS_DATA = [];
let ITEMS_BY_NAME = {};

function loadBattleGameData(gameId) {
  const reg = (window.BATTLE_REGISTRY || {})[gameId] || {};
  MOVES_DATA = reg.moves || [];
  MOVES_BY_SLUG = {};
  MOVES_DATA.forEach(m => { if(m.slug) MOVES_BY_SLUG[m.slug]=m; });
  PKM_LIST = reg.pkm || [];
  PKM_PC_BY_SLUG = {};
  PKM_PC_BY_NUM  = {};
  PKM_LIST.forEach(p => { PKM_PC_BY_SLUG[p.slug]=p; if(p.num) PKM_PC_BY_NUM[p.num]=p; });
  ITEMS_DATA = reg.items || [];
  ITEMS_BY_NAME = {};
  ITEMS_DATA.forEach(it => { ITEMS_BY_NAME[it.name]=it; });
}

// 鈹€鈹€ 浠ヤ笅鏃?MOVES_DATA 纭紪鐮佸凡绉婚櫎锛屼繚鐣欏崰浣嶄互閬垮厤寮曠敤閿欒 鈹€鈹€
const _MOVES_DATA_LEGACY=[
  // A
  {name:'闂博鏀诲嚮',nameEn:'Accelerock',type:'rock',cat:'physical',power:40,acc:100,pp:20},
  {name:'婧跺寲',nameEn:'Acid Armor',type:'poison',cat:'status',power:null,acc:null,pp:20},
  {name:'鑵愯殌娑?,nameEn:'Acid Spray',type:'poison',cat:'special',power:40,acc:100,pp:20},
  {name:'鐗规妧缈婚',nameEn:'Acrobatics',type:'flying',cat:'physical',power:55,acc:100,pp:16},
  {name:'绌翠綅鏀诲嚮',nameEn:'Acupressure',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'椋炵繑绁為€?,nameEn:'Aerial Ace',type:'flying',cat:'physical',power:60,acc:null,pp:20},
  {name:'鍏堢ぜ鍚庡叺',nameEn:'After You',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'楂橀€熺Щ鍔?,nameEn:'Agility',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'澶ф皵鍒?,nameEn:'Air Cutter',type:'flying',cat:'special',power:60,acc:95,pp:20},
  {name:'绌烘皵鏂?,nameEn:'Air Slash',type:'flying',cat:'special',power:75,acc:95,pp:16},
  {name:'寮曡涔嬪０',nameEn:'Alluring Voice',type:'fairy',cat:'special',power:80,acc:100,pp:12},
  {name:'蹇€熻浆鎹?,nameEn:'Ally Switch',type:'psychic',cat:'status',power:null,acc:null,pp:16},
  {name:'蹇樺嵈',nameEn:'Amnesia',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'鍘熷涔嬪姏',nameEn:'Ancient Power',type:'rock',cat:'special',power:60,acc:100,pp:8},
  {name:'鑻规灉閰?,nameEn:'Apple Acid',type:'grass',cat:'special',power:90,acc:100,pp:12},
  {name:'姘存祦鍒?,nameEn:'Aqua Cutter',type:'water',cat:'physical',power:70,acc:100,pp:20},
  {name:'姘存祦鍠峰皠',nameEn:'Aqua Jet',type:'water',cat:'physical',power:40,acc:100,pp:20},
  {name:'姘翠箣鐜?,nameEn:'Aqua Ring',type:'water',cat:'status',power:null,acc:null,pp:20},
  {name:'姘磋垶姝?,nameEn:'Aqua Step',type:'water',cat:'physical',power:80,acc:100,pp:12},
  {name:'姘存祦灏惧嚮',nameEn:'Aqua Tail',type:'water',cat:'physical',power:90,acc:90,pp:12},
  {name:'鐩旂敳鐐嚮',nameEn:'Armor Cannon',type:'fire',cat:'special',power:120,acc:100,pp:8},
  {name:'鑺抽杩烽浘',nameEn:'Aromatic Mist',type:'fairy',cat:'status',power:null,acc:null,pp:20},
  {name:'涓よ倠鎻掑垁',nameEn:'Assurance',type:'dark',cat:'physical',power:60,acc:100,pp:12},
  {name:'杩蜂汉',nameEn:'Attract',type:'normal',cat:'status',power:null,acc:100,pp:16},
  {name:'娉㈠寮?,nameEn:'Aura Sphere',type:'fighting',cat:'special',power:80,acc:null,pp:20},
  {name:'姘斿満杞?,nameEn:'Aura Wheel',type:'electric',cat:'physical',power:110,acc:100,pp:12},
  {name:'鏋佸厜骞?,nameEn:'Aurora Veil',type:'ice',cat:'status',power:null,acc:null,pp:20},
  {name:'闆穿',nameEn:'Avalanche',type:'ice',cat:'physical',power:60,acc:100,pp:12},
  {name:'鏂ц吙韪?,nameEn:'Axe Kick',type:'fighting',cat:'physical',power:120,acc:90,pp:12},
  // B
  {name:'濠村効鐪肩',nameEn:'Baby-Doll Eyes',type:'fairy',cat:'status',power:null,acc:100,pp:20},
  {name:'姣掕洶闃插尽',nameEn:'Baneful Bunker',type:'poison',cat:'status',power:null,acc:null,pp:8},
  {name:'鎺ュ姏妫?,nameEn:'Baton Pass',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鍠欑偖鍑?,nameEn:'Beak Blast',type:'flying',cat:'physical',power:120,acc:100,pp:8},
  {name:'鎵撶兢鏋?,nameEn:'Beat Up',type:'dark',cat:'physical',power:null,acc:100,pp:12},
  {name:'鎵撳棟',nameEn:'Belch',type:'poison',cat:'special',power:120,acc:90,pp:12},
  {name:'鑲氱毊榧?,nameEn:'Belly Drum',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'缁戠揣',nameEn:'Bind',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'鍜綇',nameEn:'Bite',type:'dark',cat:'physical',power:60,acc:100,pp:20},
  {name:'鑻﹀垉',nameEn:'Bitter Blade',type:'fire',cat:'physical',power:90,acc:100,pp:12},
  {name:'鑻︽瘨鎰佸康',nameEn:'Bitter Malice',type:'ghost',cat:'special',power:75,acc:100,pp:12},
  {name:'缁堟瀬鐏劙',nameEn:'Blast Burn',type:'fire',cat:'special',power:150,acc:90,pp:8},
  {name:'鐏値鑴?,nameEn:'Blaze Kick',type:'fire',cat:'physical',power:85,acc:90,pp:12},
  {name:'鏆撮闆?,nameEn:'Blizzard',type:'ice',cat:'special',power:110,acc:70,pp:8},
  {name:'灏侀攣',nameEn:'Block',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'韬綋鍘嬪埗',nameEn:'Body Press',type:'fighting',cat:'physical',power:80,acc:100,pp:12},
  {name:'鐚涘姏鍘?,nameEn:'Body Slam',type:'normal',cat:'physical',power:85,acc:100,pp:16},
  {name:'楠ㄥご杩炲嚮',nameEn:'Bone Rush',type:'ground',cat:'physical',power:30,acc:90,pp:12},
  {name:'楂橀煶鐖嗙偢',nameEn:'Boomburst',type:'normal',cat:'special',power:140,acc:100,pp:12},
  {name:'寮硅烦',nameEn:'Bounce',type:'flying',cat:'physical',power:85,acc:85,pp:8},
  {name:'鍕囬笩鐚涙敾',nameEn:'Brave Bird',type:'flying',cat:'physical',power:120,acc:100,pp:16},
  {name:'鐮寸考鎵嚮',nameEn:'Breaking Swipe',type:'dragon',cat:'physical',power:60,acc:100,pp:16},
  {name:'纰庡博',nameEn:'Brick Break',type:'fighting',cat:'physical',power:75,acc:100,pp:16},
  {name:'娈嬪繊鎸ュ嚮',nameEn:'Brutal Swing',type:'dark',cat:'physical',power:60,acc:100,pp:20},
  {name:'铏挰',nameEn:'Bug Bite',type:'bug',cat:'physical',power:60,acc:100,pp:20},
  {name:'铏福',nameEn:'Bug Buzz',type:'bug',cat:'special',power:90,acc:100,pp:12},
  {name:'鍋ョ編',nameEn:'Bulk Up',type:'fighting',cat:'status',power:null,acc:null,pp:20},
  {name:'鍦扮洏闇囧姩',nameEn:'Bulldoze',type:'ground',cat:'physical',power:60,acc:100,pp:20},
  {name:'瀛愬脊鎷?,nameEn:'Bullet Punch',type:'steel',cat:'physical',power:40,acc:100,pp:20},
  {name:'瀛愬脊绉嶅瓙',nameEn:'Bullet Seed',type:'grass',cat:'physical',power:25,acc:100,pp:20},
  {name:'鐕冪儳娈嗗敖',nameEn:'Burn Up',type:'fire',cat:'special',power:130,acc:100,pp:8},
  {name:'瀚夊鐒氱儳',nameEn:'Burning Jealousy',type:'fire',cat:'special',power:70,acc:100,pp:8},
  // C
  {name:'鍐ユ兂',nameEn:'Calm Mind',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'涓嶅敖涔嬪垉',nameEn:'Ceaseless Edge',type:'dark',cat:'physical',power:65,acc:90,pp:16},
  {name:'钃勭數',nameEn:'Charge',type:'electric',cat:'status',power:null,acc:null,pp:20},
  {name:'鍏呯數鍏夌嚎',nameEn:'Charge Beam',type:'electric',cat:'special',power:50,acc:90,pp:12},
  {name:'鎾掑▏',nameEn:'Charm',type:'fairy',cat:'status',power:null,acc:100,pp:20},
  {name:'瀵掑喎涔嬫按',nameEn:'Chilling Water',type:'water',cat:'special',power:50,acc:100,pp:20},
  {name:'鍐棩鐧诲満',nameEn:'Chilly Reception',type:'ice',cat:'status',power:null,acc:null,pp:12},
  {name:'鎶曟幏鎽?,nameEn:'Circle Throw',type:'fighting',cat:'physical',power:60,acc:90,pp:12},
  {name:'鍒洪碁闊?,nameEn:'Clanging Scales',type:'dragon',cat:'special',power:110,acc:100,pp:8},
  {name:'閽㈤搩涔嬮瓊',nameEn:'Clangorous Soul',type:'dragon',cat:'status',power:null,acc:null,pp:8},
  {name:'娓呮礂鐑熼浘',nameEn:'Clear Smog',type:'poison',cat:'special',power:50,acc:null,pp:16},
  {name:'杩戣韩鎴?,nameEn:'Close Combat',type:'fighting',cat:'physical',power:120,acc:100,pp:8},
  {name:'鎸囧',nameEn:'Coaching',type:'fighting',cat:'status',power:null,acc:null,pp:12},
  {name:'铚风缉',nameEn:'Coil',type:'poison',cat:'status',power:null,acc:null,pp:20},
  {name:'浠ョ墮杩樼墮',nameEn:'Comeuppance',type:'dark',cat:'physical',power:null,acc:100,pp:12},
  {name:'杩峰够鍏夌嚎',nameEn:'Confuse Ray',type:'ghost',cat:'status',power:null,acc:100,pp:12},
  {name:'妯′豢璺熼殢',nameEn:'Copycat',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鑵愯殌姘斾綋',nameEn:'Corrosive Gas',type:'poison',cat:'status',power:null,acc:100,pp:20},
  {name:'瀹囧畽涔嬪姏',nameEn:'Cosmic Power',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'妫夎姳闃插尽',nameEn:'Cotton Guard',type:'grass',cat:'status',power:null,acc:null,pp:12},
  {name:'妫夊瀛?,nameEn:'Cotton Spore',type:'grass',cat:'status',power:null,acc:100,pp:20},
  {name:'鍙嶅嚮',nameEn:'Counter',type:'fighting',cat:'physical',power:null,acc:100,pp:20},
  {name:'璐储',nameEn:'Covet',type:'normal',cat:'physical',power:60,acc:100,pp:20},
  {name:'锜归挸閿ゅ嚮',nameEn:'Crabhammer',type:'water',cat:'physical',power:100,acc:95,pp:12},
  {name:'鍗佸瓧鏂?,nameEn:'Cross Chop',type:'fighting',cat:'physical',power:100,acc:80,pp:8},
  {name:'姣掑崄瀛楁柀',nameEn:'Cross Poison',type:'poison',cat:'physical',power:70,acc:100,pp:20},
  {name:'寮哄姏鍜',nameEn:'Crunch',type:'dark',cat:'physical',power:80,acc:100,pp:16},
  {name:'寮哄姏閽冲嚮',nameEn:'Crush Claw',type:'normal',cat:'physical',power:75,acc:95,pp:12},
  {name:'璇呭拻',nameEn:'Curse',type:'ghost',cat:'status',power:null,acc:null,pp:12},
  // D
  {name:'鎭朵箣娉㈠姩',nameEn:'Dark Pulse',type:'dark',cat:'special',power:80,acc:100,pp:16},
  {name:'鏈€鏆楀ぇ鑳屾憯',nameEn:'Darkest Lariat',type:'dark',cat:'physical',power:85,acc:100,pp:12},
  {name:'榄呮儜涔嬫槦',nameEn:'Dazzling Gleam',type:'fairy',cat:'special',power:80,acc:100,pp:12},
  {name:'瑁呴グ',nameEn:'Decorate',type:'fairy',cat:'status',power:null,acc:null,pp:16},
  {name:'娓呴櫎娴撻浘',nameEn:'Defog',type:'flying',cat:'status',power:null,acc:null,pp:16},
  {name:'鍚屽懡',nameEn:'Destiny Bond',type:'ghost',cat:'status',power:null,acc:null,pp:8},
  {name:'鎰熺煡',nameEn:'Detect',type:'fighting',cat:'status',power:null,acc:null,pp:8},
  {name:'鎸栨礊',nameEn:'Dig',type:'ground',cat:'physical',power:80,acc:100,pp:12},
  {name:'鍘勮繍鐚埅',nameEn:'Dire Claw',type:'poison',cat:'physical',power:80,acc:100,pp:16},
  {name:'灏侀攣鎶€鑳?,nameEn:'Disable',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'鏀剧數',nameEn:'Discharge',type:'electric',cat:'special',power:80,acc:100,pp:16},
  {name:'娼滄按',nameEn:'Dive',type:'water',cat:'physical',power:80,acc:100,pp:12},
  {name:'鍙岄噸鎵撳嚮',nameEn:'Double Hit',type:'normal',cat:'physical',power:35,acc:90,pp:12},
  {name:'娈嬪奖',nameEn:'Double Team',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'鑸嶈韩鍐叉挒',nameEn:'Double-Edge',type:'normal',cat:'physical',power:120,acc:100,pp:16},
  {name:'娴佹槦缇?,nameEn:'Draco Meteor',type:'dragon',cat:'special',power:130,acc:90,pp:8},
  {name:'榫欎箣鎻村０',nameEn:'Dragon Cheer',type:'dragon',cat:'status',power:null,acc:null,pp:16},
  {name:'榫欑埅',nameEn:'Dragon Claw',type:'dragon',cat:'physical',power:80,acc:100,pp:16},
  {name:'榫欒垶',nameEn:'Dragon Dance',type:'dragon',cat:'status',power:null,acc:null,pp:20},
  {name:'榫欎箣闀?,nameEn:'Dragon Darts',type:'dragon',cat:'physical',power:50,acc:100,pp:12},
  {name:'榫欎箣娉㈠姩',nameEn:'Dragon Pulse',type:'dragon',cat:'special',power:85,acc:100,pp:12},
  {name:'榫欏啿鍑?,nameEn:'Dragon Rush',type:'dragon',cat:'physical',power:100,acc:75,pp:12},
  {name:'榫欏熬',nameEn:'Dragon Tail',type:'dragon',cat:'physical',power:60,acc:90,pp:12},
  {name:'鍚稿彇鎷?,nameEn:'Drain Punch',type:'fighting',cat:'physical',power:75,acc:100,pp:12},
  {name:'鍚稿姏涔嬪惢',nameEn:'Draining Kiss',type:'fairy',cat:'special',power:50,acc:100,pp:12},
  {name:'楂橀€熷枡鍑?,nameEn:'Drill Peck',type:'flying',cat:'physical',power:80,acc:100,pp:20},
  {name:'閽诲湴',nameEn:'Drill Run',type:'ground',cat:'physical',power:80,acc:95,pp:12},
  {name:'鍙岀考鍑?,nameEn:'Dual Wingbeat',type:'flying',cat:'physical',power:40,acc:90,pp:12},
  {name:'鐖嗙偢鎷?,nameEn:'Dynamic Punch',type:'fighting',cat:'physical',power:100,acc:50,pp:8},
  // E
  {name:'澶у湴涔嬪姏',nameEn:'Earth Power',type:'ground',cat:'special',power:90,acc:100,pp:12},
  {name:'鍦伴渿',nameEn:'Earthquake',type:'ground',cat:'physical',power:100,acc:100,pp:12},
  {name:'鎬紓鍐插姩',nameEn:'Eerie Impulse',type:'electric',cat:'status',power:null,acc:100,pp:16},
  {name:'鎬紓鍜掕',nameEn:'Eerie Spell',type:'psychic',cat:'special',power:80,acc:100,pp:8},
  {name:'鐢垫皵鍦板舰',nameEn:'Electric Terrain',type:'electric',cat:'status',power:null,acc:null,pp:12},
  {name:'鐢垫皵鍖?,nameEn:'Electrify',type:'electric',cat:'status',power:null,acc:null,pp:20},
  {name:'鐢电悆',nameEn:'Electro Ball',type:'electric',cat:'special',power:null,acc:100,pp:12},
  {name:'鍏呯數鐐?,nameEn:'Electro Shot',type:'electric',cat:'special',power:130,acc:100,pp:12},
  {name:'鏀剧數缃?,nameEn:'Electroweb',type:'electric',cat:'special',power:55,acc:95,pp:16},
  {name:'鍐嶆潵涓€娆?,nameEn:'Encore',type:'normal',cat:'status',power:null,acc:100,pp:8},
  {name:'绔敖鍏ㄥ姏',nameEn:'Endeavor',type:'normal',cat:'physical',power:null,acc:100,pp:8},
  {name:'蹇嶈€?,nameEn:'Endure',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'鑳介噺鐞?,nameEn:'Energy Ball',type:'grass',cat:'special',power:90,acc:100,pp:12},
  {name:'寮曞叆',nameEn:'Entrainment',type:'normal',cat:'status',power:null,acc:100,pp:16},
  {name:'鍠峰彂',nameEn:'Eruption',type:'fire',cat:'special',power:150,acc:100,pp:8},
  {name:'蹇靛姏鐖嗗彂',nameEn:'Expanding Force',type:'psychic',cat:'special',power:80,acc:100,pp:12},
  {name:'澶х垎鐐?,nameEn:'Explosion',type:'normal',cat:'physical',power:250,acc:100,pp:8},
  {name:'瓒呮劅瀹?,nameEn:'Extrasensory',type:'psychic',cat:'special',power:80,acc:100,pp:20},
  {name:'绁為€?,nameEn:'Extreme Speed',type:'normal',cat:'physical',power:80,acc:100,pp:8},
  // F
  {name:'瀹濊礉鑴?,nameEn:'Facade',type:'normal',cat:'physical',power:70,acc:100,pp:20},
  {name:'濡栫簿灏侀攣',nameEn:'Fairy Lock',type:'fairy',cat:'status',power:null,acc:null,pp:12},
  {name:'鐚墜',nameEn:'Fake Out',type:'normal',cat:'physical',power:40,acc:100,pp:12},
  {name:'鍌唱',nameEn:'Fake Tears',type:'dark',cat:'status',power:null,acc:100,pp:20},
  {name:'缇芥瘺鑸?,nameEn:'Feather Dance',type:'flying',cat:'status',power:null,acc:100,pp:16},
  {name:'铏氬紶澹板娍',nameEn:'Feint',type:'normal',cat:'physical',power:30,acc:100,pp:12},
  {name:'鑳滆€呰渹姣掑埡',nameEn:'Fell Stinger',type:'bug',cat:'physical',power:50,acc:100,pp:20},
  {name:'鍙樺够鍏夋潫',nameEn:'Fickle Beam',type:'dragon',cat:'special',power:80,acc:100,pp:8},
  {name:'鐏劙涔嬭垶',nameEn:'Fiery Dance',type:'fire',cat:'special',power:80,acc:100,pp:12},
  {name:'娈婃涓€鎼?,nameEn:'Final Gambit',type:'fighting',cat:'special',power:null,acc:100,pp:8},
  {name:'澶у瓧鐖嗙値',nameEn:'Fire Blast',type:'fire',cat:'special',power:110,acc:85,pp:8},
  {name:'鐏劙鐗?,nameEn:'Fire Fang',type:'fire',cat:'physical',power:65,acc:95,pp:16},
  {name:'鐑堢劙闉墦',nameEn:'Fire Lash',type:'fire',cat:'physical',power:90,acc:100,pp:16},
  {name:'鐏劙鎷?,nameEn:'Fire Punch',type:'fire',cat:'physical',power:75,acc:100,pp:16},
  {name:'鐏劙婕╂丁',nameEn:'Fire Spin',type:'fire',cat:'special',power:35,acc:85,pp:16},
  {name:'鍏堝０澶轰汉',nameEn:'First Impression',type:'bug',cat:'physical',power:100,acc:100,pp:12},
  {name:'瑁傚湴',nameEn:'Fissure',type:'ground',cat:'physical',power:null,acc:30,pp:8},
  {name:'鎶樿吘',nameEn:'Flail',type:'normal',cat:'physical',power:null,acc:100,pp:16},
  {name:'鐏劙鍐查攱',nameEn:'Flame Charge',type:'fire',cat:'physical',power:50,acc:100,pp:20},
  {name:'鍠峰皠鐏劙',nameEn:'Flamethrower',type:'fire',cat:'special',power:90,acc:100,pp:16},
  {name:'闂劙鍐查攱',nameEn:'Flare Blitz',type:'fire',cat:'physical',power:120,acc:100,pp:16},
  {name:'鍏夊瓙鐐?,nameEn:'Flash Cannon',type:'steel',cat:'special',power:80,acc:100,pp:12},
  {name:'鐢滆█铚滆',nameEn:'Flatter',type:'dark',cat:'status',power:null,acc:100,pp:16},
  {name:'鎶曟幏',nameEn:'Fling',type:'dark',cat:'physical',power:null,acc:100,pp:12},
  {name:'缈昏韩鍥炴父',nameEn:'Flip Turn',type:'water',cat:'physical',power:60,acc:100,pp:20},
  {name:'鑺辨牱鎴忔硶',nameEn:'Flower Trick',type:'grass',cat:'physical',power:70,acc:null,pp:12},
  {name:'椋炵繑',nameEn:'Fly',type:'flying',cat:'physical',power:90,acc:95,pp:16},
  {name:'椋炶啙鍘?,nameEn:'Flying Press',type:'fighting',cat:'physical',power:100,acc:95,pp:12},
  {name:'姘斿悎寮?,nameEn:'Focus Blast',type:'fighting',cat:'special',power:120,acc:70,pp:8},
  {name:'鑱氭皵',nameEn:'Focus Energy',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鎰忓康鎷?,nameEn:'Focus Punch',type:'fighting',cat:'physical',power:150,acc:100,pp:20},
  {name:'鍚戞垜鏉?,nameEn:'Follow Me',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'妫灄璇呭拻',nameEn:"Forest's Curse",type:'grass',cat:'status',power:null,acc:100,pp:20},
  {name:'鎭跺姡鎵嬫',nameEn:'Foul Play',type:'dark',cat:'physical',power:95,acc:100,pp:16},
  {name:'鍐峰喕骞茬嚗',nameEn:'Freeze-Dry',type:'ice',cat:'special',power:70,acc:100,pp:20},
  {name:'缁堟瀬鑺辨潫',nameEn:'Frenzy Plant',type:'grass',cat:'special',power:150,acc:90,pp:8},
  {name:'闇滃喕涔嬫伅',nameEn:'Frost Breath',type:'ice',cat:'special',power:60,acc:90,pp:12},
  {name:'鍏堢煡',nameEn:'Future Sight',type:'psychic',cat:'special',power:120,acc:100,pp:12},
  // G
  {name:'鑳冩恫',nameEn:'Gastro Acid',type:'poison',cat:'status',power:null,acc:100,pp:12},
  {name:'缁堟瀬鍚稿彇',nameEn:'Giga Drain',type:'grass',cat:'special',power:75,acc:100,pp:12},
  {name:'缁堟瀬鍐插嚮',nameEn:'Giga Impact',type:'normal',cat:'physical',power:150,acc:90,pp:8},
  {name:'瓒呬嚎鍚ㄩ敜',nameEn:'Gigaton Hammer',type:'steel',cat:'physical',power:160,acc:100,pp:8},
  {name:'澶ц泧鍑濊',nameEn:'Glare',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'鑽夌粨',nameEn:'Grass Knot',type:'grass',cat:'special',power:null,acc:100,pp:20},
  {name:'鑽夊湴鎬ヨ繘',nameEn:'Grassy Glide',type:'grass',cat:'physical',power:55,acc:100,pp:20},
  {name:'闈掕崏鍦板舰',nameEn:'Grassy Terrain',type:'grass',cat:'status',power:null,acc:null,pp:12},
  {name:'閲嶅姏鑻规灉',nameEn:'Grav Apple',type:'grass',cat:'physical',power:90,acc:100,pp:12},
  {name:'閲嶅姏',nameEn:'Gravity',type:'psychic',cat:'status',power:null,acc:null,pp:8},
  {name:'鐢熼暱',nameEn:'Growth',type:'grass',cat:'status',power:null,acc:null,pp:20},
  {name:'闃插尽鍒嗗壊',nameEn:'Guard Split',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'闃插尽浜ゆ崲',nameEn:'Guard Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'鏂ご鍙?,nameEn:'Guillotine',type:'normal',cat:'physical',power:null,acc:30,pp:8},
  {name:'姹℃偿灏勫嚮',nameEn:'Gunk Shot',type:'poison',cat:'physical',power:120,acc:80,pp:8},
  {name:'闄€铻虹悆',nameEn:'Gyro Ball',type:'steel',cat:'physical',power:null,acc:100,pp:8},
  // H
  {name:'閾侀敜鑷傝唨',nameEn:'Hammer Arm',type:'fighting',cat:'physical',power:100,acc:90,pp:12},
  {name:'纭帇',nameEn:'Hard Press',type:'steel',cat:'physical',power:null,acc:100,pp:12},
  {name:'鐑熼浘',nameEn:'Haze',type:'ice',cat:'status',power:null,acc:null,pp:20},
  {name:'纰庡ご',nameEn:'Head Smash',type:'rock',cat:'physical',power:150,acc:80,pp:8},
  {name:'椴佽幗鍐插嚮',nameEn:'Headlong Rush',type:'ground',cat:'physical',power:120,acc:100,pp:8},
  {name:'娌绘剤閾冨０',nameEn:'Heal Bell',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'娌绘剤娉?,nameEn:'Heal Pulse',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'娌绘剤绁堢シ',nameEn:'Healing Wish',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'楂樻俯鍐茶韩',nameEn:'Heat Crash',type:'fire',cat:'physical',power:null,acc:100,pp:12},
  {name:'鐑氮',nameEn:'Heat Wave',type:'fire',cat:'special',power:95,acc:90,pp:12},
  {name:'閲嶅姏鍘嬪埗',nameEn:'Heavy Slam',type:'steel',cat:'physical',power:null,acc:100,pp:12},
  {name:'甯姪',nameEn:'Helping Hand',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鍜掕',nameEn:'Hex',type:'ghost',cat:'special',power:65,acc:100,pp:12},
  {name:'瓒呭己鍔涢┈',nameEn:'High Horsepower',type:'ground',cat:'physical',power:95,acc:95,pp:12},
  {name:'椋炶啙韪?,nameEn:'High Jump Kick',type:'fighting',cat:'physical',power:130,acc:90,pp:12},
  {name:'瑙掗捇',nameEn:'Horn Drill',type:'normal',cat:'physical',power:null,acc:30,pp:8},
  {name:'鍚歌',nameEn:'Horn Leech',type:'grass',cat:'physical',power:75,acc:100,pp:12},
  {name:'鍤庡彨',nameEn:'Howl',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鏆撮',nameEn:'Hurricane',type:'flying',cat:'special',power:110,acc:70,pp:12},
  {name:'绌舵瀬姘寸偖',nameEn:'Hydro Cannon',type:'water',cat:'special',power:150,acc:90,pp:8},
  {name:'姘寸偖',nameEn:'Hydro Pump',type:'water',cat:'special',power:110,acc:80,pp:8},
  {name:'鐮村潖鍏夌嚎',nameEn:'Hyper Beam',type:'normal',cat:'special',power:150,acc:90,pp:8},
  {name:'瓒呴煶娉?,nameEn:'Hyper Voice',type:'normal',cat:'special',power:90,acc:100,pp:12},
  {name:'鍌湢鏈?,nameEn:'Hypnosis',type:'psychic',cat:'status',power:null,acc:60,pp:20},
  // I
  {name:'鍐板喕鍏夋潫',nameEn:'Ice Beam',type:'ice',cat:'special',power:90,acc:100,pp:12},
  {name:'鍐扮墮',nameEn:'Ice Fang',type:'ice',cat:'physical',power:65,acc:95,pp:16},
  {name:'鍐伴敜',nameEn:'Ice Hammer',type:'ice',cat:'physical',power:100,acc:90,pp:12},
  {name:'鍐板喕鎷?,nameEn:'Ice Punch',type:'ice',cat:'physical',power:75,acc:100,pp:16},
  {name:'鍐扮牼',nameEn:'Ice Shard',type:'ice',cat:'physical',power:40,acc:100,pp:20},
  {name:'鏃嬪啺',nameEn:'Ice Spinner',type:'ice',cat:'physical',power:80,acc:100,pp:16},
  {name:'鍐版煴鍧犺惤',nameEn:'Icicle Crash',type:'ice',cat:'physical',power:85,acc:90,pp:12},
  {name:'鍐版煴閽?,nameEn:'Icicle Spear',type:'ice',cat:'physical',power:25,acc:100,pp:20},
  {name:'鍐伴',nameEn:'Icy Wind',type:'ice',cat:'special',power:55,acc:95,pp:16},
  {name:'灏佸嵃',nameEn:'Imprison',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'鎬伀娓歌',nameEn:'Infernal Parade',type:'ghost',cat:'special',power:65,acc:100,pp:16},
  {name:'鐐肩嫳',nameEn:'Inferno',type:'fire',cat:'special',power:100,acc:50,pp:8},
  {name:'瀵勭敓铏?,nameEn:'Infestation',type:'bug',cat:'special',power:20,acc:100,pp:20},
  {name:'鎵庢牴',nameEn:'Ingrain',type:'grass',cat:'status',power:null,acc:null,pp:20},
  {name:'鎸囦护',nameEn:'Instruct',type:'psychic',cat:'status',power:null,acc:null,pp:16},
  {name:'閾佸',nameEn:'Iron Defense',type:'steel',cat:'status',power:null,acc:null,pp:16},
  {name:'閾佸ご',nameEn:'Iron Head',type:'steel',cat:'physical',power:80,acc:100,pp:16},
  {name:'閾佸熬',nameEn:'Iron Tail',type:'steel',cat:'physical',power:100,acc:75,pp:16},
  // J
  {name:'鍠峰皠鎷?,nameEn:'Jet Punch',type:'water',cat:'physical',power:60,acc:100,pp:16},
  // K
  {name:'鐜嬭€呬箣鐩?,nameEn:"King's Shield",type:'steel',cat:'status',power:null,acc:null,pp:8},
  {name:'鎷嶈惤',nameEn:'Knock Off',type:'dark',cat:'physical',power:65,acc:100,pp:20},
  {name:'鍙╁ご鏂?,nameEn:'Kowtow Cleave',type:'dark',cat:'physical',power:85,acc:null,pp:12},
  // L
  {name:'杩佹€?,nameEn:'Lash Out',type:'dark',cat:'physical',power:75,acc:100,pp:8},
  {name:'瀛ゆ敞涓€鎺?,nameEn:'Last Resort',type:'normal',cat:'physical',power:140,acc:100,pp:8},
  {name:'鏈€鍚庢暚鎰?,nameEn:'Last Respects',type:'ghost',cat:'physical',power:50,acc:100,pp:12},
  {name:'鐔斿博椋庢毚',nameEn:'Lava Plume',type:'fire',cat:'special',power:80,acc:100,pp:16},
  {name:'鍙跺垉',nameEn:'Leaf Blade',type:'grass',cat:'physical',power:90,acc:100,pp:16},
  {name:'椋炲彾椋庢毚',nameEn:'Leaf Storm',type:'grass',cat:'special',power:130,acc:90,pp:8},
  {name:'鍚歌',nameEn:'Leech Life',type:'bug',cat:'physical',power:80,acc:100,pp:12},
  {name:'瀵勭敓绉嶅瓙',nameEn:'Leech Seed',type:'grass',cat:'status',power:null,acc:90,pp:12},
  {name:'鐢熷懡涔嬫按',nameEn:'Life Dew',type:'water',cat:'status',power:null,acc:null,pp:12},
  {name:'鍏夊',nameEn:'Light Screen',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'鐮寸伃涔嬪厜',nameEn:'Light of Ruin',type:'fairy',cat:'special',power:140,acc:90,pp:8},
  {name:'姘存祦瑁傜牬',nameEn:'Liquidation',type:'water',cat:'physical',power:85,acc:100,pp:12},
  {name:'閿佸畾',nameEn:'Lock-On',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'浣庤涪',nameEn:'Low Kick',type:'fighting',cat:'physical',power:null,acc:100,pp:20},
  {name:'鎵剼',nameEn:'Low Sweep',type:'fighting',cat:'physical',power:65,acc:100,pp:20},
  {name:'鍏夊瓙宕╁皠',nameEn:'Lumina Crash',type:'psychic',cat:'special',power:80,acc:100,pp:12},
  {name:'寮硅烦鍐插嚮',nameEn:'Lunge',type:'bug',cat:'physical',power:80,acc:100,pp:16},
  // M
  {name:'椹但鎷?,nameEn:'Mach Punch',type:'fighting',cat:'physical',power:40,acc:100,pp:20},
  {name:'榄旀硶绮夋湯',nameEn:'Magic Powder',type:'psychic',cat:'status',power:null,acc:100,pp:20},
  {name:'濂囧紓绌洪棿',nameEn:'Magic Room',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'纾佸姏娴父',nameEn:'Magnet Rise',type:'electric',cat:'status',power:null,acc:null,pp:12},
  {name:'纾佸姏鎵板姩',nameEn:'Magnetic Flux',type:'electric',cat:'status',power:null,acc:null,pp:20},
  {name:'椋炲彾鎶撳彇',nameEn:'Matcha Gotcha',type:'grass',cat:'special',power:80,acc:90,pp:16},
  {name:'鎬紓鐪肩',nameEn:'Mean Look',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'瓒呯骇韪㈠嚮',nameEn:'Mega Kick',type:'normal',cat:'physical',power:120,acc:75,pp:8},
  {name:'澶ц',nameEn:'Megahorn',type:'bug',cat:'physical',power:120,acc:85,pp:12},
  {name:'閬楀織',nameEn:'Memento',type:'dark',cat:'status',power:null,acc:100,pp:12},
  {name:'閲戝睘鐖嗙偢',nameEn:'Metal Burst',type:'steel',cat:'physical',power:null,acc:100,pp:12},
  {name:'閲戝睘闊?,nameEn:'Metal Sound',type:'steel',cat:'status',power:null,acc:85,pp:20},
  {name:'娴佹槦灏勭嚎',nameEn:'Meteor Beam',type:'rock',cat:'special',power:120,acc:90,pp:12},
  {name:'娴佹槦鎷?,nameEn:'Meteor Mash',type:'steel',cat:'physical',power:90,acc:90,pp:12},
  {name:'鐗涘ザ姹插彇',nameEn:'Milk Drink',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'鍙樺皬',nameEn:'Minimize',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'闀滈潰闃插尽',nameEn:'Mirror Coat',type:'psychic',cat:'special',power:null,acc:100,pp:20},
  {name:'杩烽浘鐖嗙偢',nameEn:'Misty Explosion',type:'fairy',cat:'special',power:100,acc:100,pp:8},
  {name:'杩烽浘鍦板舰',nameEn:'Misty Terrain',type:'fairy',cat:'status',power:null,acc:null,pp:12},
  {name:'鏈堜寒涔嬪姏',nameEn:'Moonblast',type:'fairy',cat:'special',power:95,acc:100,pp:16},
  {name:'鏈堝厜',nameEn:'Moonlight',type:'fairy',cat:'status',power:null,acc:null,pp:8},
  {name:'鏈濇棩',nameEn:'Morning Sun',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'鑷村懡鏃嬭浆',nameEn:'Mortal Spin',type:'poison',cat:'physical',power:30,acc:100,pp:16},
  {name:'灞卞箔鐑堥',nameEn:'Mountain Gale',type:'ice',cat:'physical',power:120,acc:85,pp:12},
  {name:'娉ユ碁灏勫嚮',nameEn:'Mud Shot',type:'ground',cat:'special',power:55,acc:95,pp:16},
  {name:'娉ュ反',nameEn:'Mud-Slap',type:'ground',cat:'special',power:20,acc:100,pp:12},
  {name:'姹℃祳涔嬫按',nameEn:'Muddy Water',type:'water',cat:'special',power:90,acc:85,pp:12},
  {name:'绁炵涔嬬伀',nameEn:'Mystical Fire',type:'fire',cat:'special',power:75,acc:100,pp:12},
  // N
  {name:'璇¤',nameEn:'Nasty Plot',type:'dark',cat:'status',power:null,acc:null,pp:20},
  {name:'鏆楀奖椹辨暎',nameEn:'Night Daze',type:'dark',cat:'special',power:90,acc:95,pp:12},
  {name:'澶滀箣鏆楀奖',nameEn:'Night Shade',type:'ghost',cat:'special',power:null,acc:100,pp:16},
  {name:'澶滆',nameEn:'Night Slash',type:'dark',cat:'physical',power:70,acc:100,pp:20},
  {name:'鑻卞媷鎬掑惣',nameEn:'Noble Roar',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'纾ㄨ弓',nameEn:'Nuzzle',type:'electric',cat:'physical',power:20,acc:100,pp:20},
  // O
  {name:'閫嗛碁',nameEn:'Outrage',type:'dragon',cat:'physical',power:120,acc:100,pp:12},
  {name:'杩囩儹',nameEn:'Overheat',type:'fire',cat:'special',power:130,acc:90,pp:8},
  // P
  {name:'鍒嗘媴鐥涜嫤',nameEn:'Pain Split',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鎶涚墿绾垮厖鐢?,nameEn:'Parabolic Charge',type:'electric',cat:'special',power:65,acc:100,pp:20},
  {name:'鎶涗笅鐙犺瘽',nameEn:'Parting Shot',type:'dark',cat:'status',power:null,acc:100,pp:20},
  {name:'浠ユ€ㄦ姤鎬?,nameEn:'Payback',type:'dark',cat:'physical',power:50,acc:100,pp:12},
  {name:'鐏骸涔嬫瓕',nameEn:'Perish Song',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'鑺辩摚椋庢毚',nameEn:'Petal Blizzard',type:'grass',cat:'physical',power:90,acc:100,pp:16},
  {name:'鑺辫垶',nameEn:'Petal Dance',type:'grass',cat:'special',power:120,acc:100,pp:12},
  {name:'铏氱┖鍓奖',nameEn:'Phantom Force',type:'ghost',cat:'physical',power:90,acc:100,pp:12},
  {name:'椋炲埡',nameEn:'Pin Missile',type:'bug',cat:'physical',power:25,acc:95,pp:20},
  {name:'涔辨拻濞?,nameEn:'Play Rough',type:'fairy',cat:'physical',power:90,acc:90,pp:12},
  {name:'鍟勯',nameEn:'Pluck',type:'flying',cat:'physical',power:60,acc:100,pp:20},
  {name:'姣掔墮',nameEn:'Poison Fang',type:'poison',cat:'physical',power:50,acc:100,pp:16},
  {name:'姣掑嚮',nameEn:'Poison Jab',type:'poison',cat:'physical',power:80,acc:100,pp:20},
  {name:'姣掔矇',nameEn:'Poison Powder',type:'poison',cat:'status',power:null,acc:75,pp:20},
  {name:'鑺辩矇鍥?,nameEn:'Pollen Puff',type:'bug',cat:'special',power:90,acc:100,pp:16},
  {name:'楠氱伒',nameEn:'Poltergeist',type:'ghost',cat:'physical',power:110,acc:90,pp:8},
  {name:'浜烘捣鎴樻湳',nameEn:'Population Bomb',type:'normal',cat:'physical',power:20,acc:90,pp:12},
  {name:'铏埅鎵戝嚮',nameEn:'Pounce',type:'bug',cat:'physical',power:50,acc:100,pp:20},
  {name:'瀹濈煶鍏夌嚎',nameEn:'Power Gem',type:'rock',cat:'special',power:80,acc:100,pp:20},
  {name:'鑳藉姏杞Щ',nameEn:'Power Shift',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'鑳藉姏鍒嗗壊',nameEn:'Power Split',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'鑳藉姏浜ゆ崲',nameEn:'Power Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'鑳藉姏浜掓崲',nameEn:'Power Trick',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'鎬掓皵鍊嶅',nameEn:'Power Trip',type:'dark',cat:'physical',power:20,acc:100,pp:12},
  {name:'寮哄姏闉墦',nameEn:'Power Whip',type:'grass',cat:'physical',power:120,acc:85,pp:12},
  {name:'瀹堜綇',nameEn:'Protect',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'妯′豢',nameEn:'Psych Up',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'绮剧寮哄康',nameEn:'Psychic',type:'psychic',cat:'special',power:90,acc:100,pp:12},
  {name:'瓒呰兘姣掔墮',nameEn:'Psychic Fangs',type:'psychic',cat:'physical',power:85,acc:100,pp:12},
  {name:'瓒呰兘鍣煶',nameEn:'Psychic Noise',type:'psychic',cat:'special',power:75,acc:100,pp:12},
  {name:'绮剧鍦板舰',nameEn:'Psychic Terrain',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'蹇靛姏鏂?,nameEn:'Psycho Cut',type:'psychic',cat:'physical',power:70,acc:100,pp:20},
  {name:'蹇靛姏闃叉姢鍐叉挒',nameEn:'Psyshield Bash',type:'psychic',cat:'physical',power:90,acc:90,pp:12},
  {name:'绮剧鍐插嚮',nameEn:'Psyshock',type:'psychic',cat:'special',power:80,acc:100,pp:12},
  // Q
  {name:'鍘嬪埗',nameEn:'Quash',type:'dark',cat:'status',power:null,acc:100,pp:16},
  {name:'鐢靛厜涓€闂?,nameEn:'Quick Attack',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'绁為€熼槻寰?,nameEn:'Quick Guard',type:'fighting',cat:'status',power:null,acc:null,pp:16},
  {name:'铦惰垶',nameEn:'Quiver Dance',type:'bug',cat:'status',power:null,acc:null,pp:20},
  // R
  {name:'鎰ゆ€掔矇',nameEn:'Rage Powder',type:'bug',cat:'status',power:null,acc:null,pp:20},
  {name:'婵€鎬掑叕鐗?,nameEn:'Raging Bull',type:'normal',cat:'physical',power:90,acc:100,pp:12},
  {name:'鏆存€掔儓鐒?,nameEn:'Raging Fury',type:'fire',cat:'physical',power:120,acc:100,pp:12},
  {name:'涓嬮洦',nameEn:'Rain Dance',type:'water',cat:'status',power:null,acc:null,pp:8},
  {name:'楂橀€熸棆杞?,nameEn:'Rapid Spin',type:'normal',cat:'physical',power:50,acc:100,pp:20},
  {name:'璐濆３鍒?,nameEn:'Razor Shell',type:'water',cat:'physical',power:75,acc:95,pp:12},
  {name:'鍥炲',nameEn:'Recover',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'鍥炴敹',nameEn:'Recycle',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'鍙嶅皠澹?,nameEn:'Reflect',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'绫诲瀷杞崲',nameEn:'Reflect Type',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'鐫＄湢',nameEn:'Rest',type:'psychic',cat:'status',power:null,acc:null,pp:8},
  {name:'鎷兼涓€鎼?,nameEn:'Reversal',type:'fighting',cat:'physical',power:null,acc:100,pp:16},
  {name:'鍗囧帇鎵撳嚮',nameEn:'Rising Voltage',type:'electric',cat:'special',power:70,acc:100,pp:20},
  {name:'鎬掑惣',nameEn:'Roar',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'杩炵画宀╃煶',nameEn:'Rock Blast',type:'rock',cat:'physical',power:25,acc:90,pp:12},
  {name:'宀╃煶纾ㄥ厜',nameEn:'Rock Polish',type:'rock',cat:'status',power:null,acc:null,pp:20},
  {name:'宀╁穿',nameEn:'Rock Slide',type:'rock',cat:'physical',power:75,acc:90,pp:12},
  {name:'钀界煶灏佸牭',nameEn:'Rock Tomb',type:'rock',cat:'physical',power:60,acc:95,pp:16},
  {name:'宀╃煶鐐稿脊',nameEn:'Rock Wrecker',type:'rock',cat:'physical',power:150,acc:90,pp:8},
  {name:'瑙掕壊鎵紨',nameEn:'Role Play',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'缇芥爾',nameEn:'Roost',type:'flying',cat:'status',power:null,acc:null,pp:8},
  {name:'鍚堝敱',nameEn:'Round',type:'normal',cat:'special',power:60,acc:100,pp:16},
  // S
  {name:'鍦ｅ墤',nameEn:'Sacred Sword',type:'fighting',cat:'physical',power:90,acc:100,pp:16},
  {name:'绁炵闃叉姢',nameEn:'Safeguard',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鐩愯厡',nameEn:'Salt Cure',type:'rock',cat:'physical',power:40,acc:100,pp:16},
  {name:'娌欏煁',nameEn:'Sand Tomb',type:'ground',cat:'physical',power:35,acc:85,pp:16},
  {name:'娌欐毚',nameEn:'Sandstorm',type:'rock',cat:'status',power:null,acc:null,pp:8},
  {name:'鐑按',nameEn:'Scald',type:'water',cat:'special',power:80,acc:100,pp:16},
  {name:'槌炵墖灏勫嚮',nameEn:'Scale Shot',type:'dragon',cat:'physical',power:25,acc:90,pp:20},
  {name:'鍙€曡〃鎯?,nameEn:'Scary Face',type:'normal',cat:'status',power:null,acc:100,pp:12},
  {name:'婊氱儷娌欏湡',nameEn:'Scorching Sands',type:'ground',cat:'special',power:70,acc:100,pp:12},
  {name:'灏栧彨',nameEn:'Screech',type:'normal',cat:'status',power:null,acc:85,pp:20},
  {name:'绉嶅瓙鏈哄叧鏋?,nameEn:'Seed Bomb',type:'grass',cat:'physical',power:80,acc:100,pp:16},
  {name:'鍦扮悆鎶涙憯',nameEn:'Seismic Toss',type:'fighting',cat:'physical',power:null,acc:100,pp:20},
  {name:'鐜夌煶淇辩',nameEn:'Self-Destruct',type:'normal',cat:'physical',power:200,acc:100,pp:8},
  {name:'鏆楀奖鐞?,nameEn:'Shadow Ball',type:'ghost',cat:'special',power:80,acc:100,pp:16},
  {name:'褰辩埅',nameEn:'Shadow Claw',type:'ghost',cat:'physical',power:70,acc:100,pp:16},
  {name:'鏆楀奖鎷?,nameEn:'Shadow Punch',type:'ghost',cat:'physical',power:60,acc:null,pp:20},
  {name:'鏆楀奖鍋疯',nameEn:'Shadow Sneak',type:'ghost',cat:'physical',power:40,acc:100,pp:20},
  {name:'铔囧熬鍒嗚韩',nameEn:'Shed Tail',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'缁濆闆跺害',nameEn:'Sheer Cold',type:'ice',cat:'special',power:null,acc:30,pp:8},
  {name:'鐢插３渚ц噦鐐?,nameEn:'Shell Side Arm',type:'poison',cat:'special',power:90,acc:100,pp:12},
  {name:'鐮村３',nameEn:'Shell Smash',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'闃叉姢澹?,nameEn:'Shelter',type:'steel',cat:'status',power:null,acc:null,pp:12},
  {name:'鍗曠函鍏夌嚎',nameEn:'Simple Beam',type:'normal',cat:'status',power:null,acc:100,pp:16},
  {name:'姝屽敱',nameEn:'Sing',type:'normal',cat:'status',power:null,acc:55,pp:16},
  {name:'鎶€鑳戒氦鎹?,nameEn:'Skill Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'鎬ヨ鐖?,nameEn:'Skitter Smack',type:'bug',cat:'physical',power:70,acc:90,pp:12},
  {name:'绁為笩鐚涙敾',nameEn:'Sky Attack',type:'flying',cat:'physical',power:140,acc:90,pp:8},
  {name:'鍋锋噿',nameEn:'Slack Off',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'鐪犵矇',nameEn:'Sleep Powder',type:'grass',cat:'status',power:null,acc:75,pp:16},
  {name:'姊﹁瘽',nameEn:'Sleep Talk',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'姹℃偿鐐稿脊',nameEn:'Sludge Bomb',type:'poison',cat:'special',power:90,acc:100,pp:12},
  {name:'姹℃偿娴?,nameEn:'Sludge Wave',type:'poison',cat:'special',power:95,acc:100,pp:12},
  {name:'鎵撹惤',nameEn:'Smack Down',type:'rock',cat:'physical',power:50,acc:100,pp:16},
  {name:'鏅鸿兘閽㈠埡',nameEn:'Smart Strike',type:'steel',cat:'physical',power:70,acc:null,pp:12},
  {name:'閽㈤搧闄烽槺',nameEn:'Snap Trap',type:'steel',cat:'physical',power:35,acc:100,pp:16},
  {name:'鍜嗗摦',nameEn:'Snarl',type:'dark',cat:'special',power:55,acc:95,pp:16},
  {name:'鎵撻季',nameEn:'Snore',type:'normal',cat:'special',power:50,acc:100,pp:16},
  {name:'闆櫙',nameEn:'Snowscape',type:'ice',cat:'status',power:null,acc:null,pp:8},
  {name:'娴搁€?,nameEn:'Soak',type:'water',cat:'status',power:null,acc:100,pp:20},
  {name:'鐢熻泲',nameEn:'Soft-Boiled',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'澶槼鍏夋潫',nameEn:'Solar Beam',type:'grass',cat:'special',power:120,acc:100,pp:12},
  {name:'澶槼涔嬪垉',nameEn:'Solar Blade',type:'grass',cat:'physical',power:125,acc:100,pp:12},
  {name:'闂€€鍜忓徆璋?,nameEn:'Sparkling Aria',type:'water',cat:'special',power:90,acc:100,pp:12},
  {name:'閫熷害浜ゆ崲',nameEn:'Speed Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'杈ｆ鎻愬彇',nameEn:'Spicy Extract',type:'grass',cat:'status',power:null,acc:null,pp:16},
  {name:'鎾掕彵',nameEn:'Spikes',type:'ground',cat:'status',power:null,acc:null,pp:20},
  {name:'灏栧埡闃插尽',nameEn:'Spiky Shield',type:'grass',cat:'status',power:null,acc:null,pp:8},
  {name:'榄備箣鎵撳嚮',nameEn:'Spirit Break',type:'fairy',cat:'physical',power:75,acc:100,pp:16},
  {name:'褰辩紳',nameEn:'Spirit Shackle',type:'ghost',cat:'physical',power:90,acc:100,pp:12},
  {name:'瀛㈠瓙',nameEn:'Spore',type:'grass',cat:'status',power:null,acc:100,pp:16},
  {name:'闅愬舰宀?,nameEn:'Stealth Rock',type:'rock',cat:'status',power:null,acc:null,pp:20},
  {name:'閽㈤搧鍏夋潫',nameEn:'Steel Beam',type:'steel',cat:'special',power:140,acc:95,pp:8},
  {name:'閽㈤搧婊氳疆',nameEn:'Steel Roller',type:'steel',cat:'physical',power:130,acc:100,pp:8},
  {name:'閽㈤搧缈呰唨',nameEn:'Steel Wing',type:'steel',cat:'physical',power:70,acc:90,pp:16},
  {name:'鏆磋簛璺鸿剼',nameEn:'Stomping Tantrum',type:'ground',cat:'physical',power:75,acc:100,pp:12},
  {name:'鐭虫枾',nameEn:'Stone Axe',type:'rock',cat:'physical',power:65,acc:90,pp:12},
  {name:'灏栫煶鏀诲嚮',nameEn:'Stone Edge',type:'rock',cat:'physical',power:100,acc:80,pp:8},
  {name:'鏆撮鎶?,nameEn:'Storm Throw',type:'fighting',cat:'physical',power:60,acc:100,pp:12},
  {name:'鍔涢噺鍌ㄥ',nameEn:'Stored Power',type:'psychic',cat:'special',power:20,acc:100,pp:12},
  {name:'涓濈綉',nameEn:'String Shot',type:'bug',cat:'status',power:null,acc:95,pp:20},
  {name:'铏櫕鍥版壈',nameEn:'Struggle Bug',type:'bug',cat:'special',power:50,acc:100,pp:20},
  {name:'鎶辨憯',nameEn:'Submission',type:'fighting',cat:'physical',power:80,acc:80,pp:12},
  {name:'鏇胯韩',nameEn:'Substitute',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'鏅村ぉ',nameEn:'Sunny Day',type:'fire',cat:'status',power:null,acc:null,pp:8},
  {name:'瓒呭姏',nameEn:'Superpower',type:'fighting',cat:'physical',power:120,acc:100,pp:8},
  {name:'瓒呴煶娉?,nameEn:'Supersonic',type:'normal',cat:'status',power:null,acc:55,pp:20},
  {name:'鍐叉氮',nameEn:'Surf',type:'water',cat:'special',power:90,acc:100,pp:16},
  {name:'澶ц█涓嶆儹',nameEn:'Swagger',type:'normal',cat:'status',power:null,acc:85,pp:16},
  {name:'鐢滆湝涔嬪惢',nameEn:'Sweet Kiss',type:'fairy',cat:'status',power:null,acc:75,pp:12},
  {name:'鐢滅敎棣欐皵',nameEn:'Sweet Scent',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'椋為€熸槦鏄?,nameEn:'Swift',type:'normal',cat:'special',power:60,acc:null,pp:20},
  {name:'鍓戣垶',nameEn:'Swords Dance',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'绯栨祮鐐稿脊',nameEn:'Syrup Bomb',type:'grass',cat:'special',power:60,acc:90,pp:12},
  // T
  {name:'灏炬媿',nameEn:'Tail Slap',type:'normal',cat:'physical',power:25,acc:85,pp:12},
  {name:'鎸戣',nameEn:'Taunt',type:'dark',cat:'status',power:null,acc:100,pp:20},
  {name:'澶櫠鐖嗗彂',nameEn:'Tera Blast',type:'normal',cat:'special',power:80,acc:100,pp:12},
  {name:'鍦板舰鑴夊啿',nameEn:'Terrain Pulse',type:'normal',cat:'special',power:50,acc:100,pp:16},
  {name:'鍠夊嚮',nameEn:'Throat Chop',type:'dark',cat:'physical',power:80,acc:100,pp:16},
  {name:'鎵撻浄',nameEn:'Thunder',type:'electric',cat:'special',power:110,acc:70,pp:12},
  {name:'鐢靛姏鐗?,nameEn:'Thunder Fang',type:'electric',cat:'physical',power:65,acc:95,pp:16},
  {name:'闆风數鎷?,nameEn:'Thunder Punch',type:'electric',cat:'physical',power:75,acc:100,pp:16},
  {name:'鐢电娉?,nameEn:'Thunder Wave',type:'electric',cat:'status',power:null,acc:90,pp:20},
  {name:'鍗佷竾浼忕壒',nameEn:'Thunderbolt',type:'electric',cat:'special',power:90,acc:100,pp:16},
  {name:'鎼旂棐',nameEn:'Tickle',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'楠氭壈',nameEn:'Torment',type:'dark',cat:'status',power:null,acc:100,pp:16},
  {name:'鍓ф瘨',nameEn:'Toxic',type:'poison',cat:'status',power:null,acc:90,pp:12},
  {name:'姣掕彵',nameEn:'Toxic Spikes',type:'poison',cat:'status',power:null,acc:null,pp:20},
  {name:'姣掍笣',nameEn:'Toxic Thread',type:'poison',cat:'status',power:null,acc:100,pp:20},
  {name:'鍏堥攱寮€璺?,nameEn:'Trailblaze',type:'grass',cat:'physical',power:50,acc:100,pp:20},
  {name:'鎴忓紕',nameEn:'Trick',type:'psychic',cat:'status',power:null,acc:100,pp:12},
  {name:'鎴忔硶绌洪棿',nameEn:'Trick Room',type:'psychic',cat:'status',power:null,acc:null,pp:8},
  {name:'涓夐噸杞涪',nameEn:'Triple Axel',type:'ice',cat:'physical',power:20,acc:90,pp:12},
  {name:'涓夎繛鎵戞按',nameEn:'Triple Dive',type:'water',cat:'physical',power:30,acc:95,pp:12},
  {name:'鐑甫韪?,nameEn:'Trop Kick',type:'grass',cat:'physical',power:85,acc:100,pp:16},
  // U
  {name:'鎬ラ€熸姌杩?,nameEn:'U-turn',type:'bug',cat:'physical',power:70,acc:100,pp:20},
  {name:'鍗犲厛鎵?,nameEn:'Upper Hand',type:'fighting',cat:'physical',power:65,acc:100,pp:16},
  {name:'鍠ч椆',nameEn:'Uproar',type:'normal',cat:'special',power:90,acc:100,pp:12},
  // V
  {name:'鐪熺┖娉?,nameEn:'Vacuum Wave',type:'fighting',cat:'special',power:40,acc:100,pp:20},
  {name:'浼忕壒鏇挎崲',nameEn:'Volt Switch',type:'electric',cat:'special',power:70,acc:100,pp:20},
  // W
  {name:'姘翠箣瑾撶害',nameEn:'Water Pledge',type:'water',cat:'special',power:80,acc:100,pp:12},
  {name:'姘存祦杞彔',nameEn:'Water Pulse',type:'water',cat:'special',power:60,acc:100,pp:20},
  {name:'椋炴按鎵嬮噷鍓?,nameEn:'Water Shuriken',type:'water',cat:'special',power:15,acc:100,pp:20},
  {name:'鏀€鐎?,nameEn:'Waterfall',type:'water',cat:'physical',power:80,acc:100,pp:16},
  {name:'娴锋氮鎾炲嚮',nameEn:'Wave Crash',type:'water',cat:'physical',power:120,acc:100,pp:12},
  {name:'澶╂皵鐞?,nameEn:'Weather Ball',type:'normal',cat:'special',power:50,acc:100,pp:12},
  {name:'婕╂丁',nameEn:'Whirlpool',type:'water',cat:'special',power:35,acc:85,pp:16},
  {name:'骞垮煙闃叉姢',nameEn:'Wide Guard',type:'rock',cat:'status',power:null,acc:null,pp:16},
  {name:'楝肩伀',nameEn:'Will-O-Wisp',type:'fire',cat:'status',power:null,acc:85,pp:16},
  {name:'璁告効',nameEn:'Wish',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'鏈ㄦ',nameEn:'Wood Hammer',type:'grass',cat:'physical',power:120,acc:100,pp:16},
  {name:'鏉炰汉蹇уぉ',nameEn:'Worry Seed',type:'grass',cat:'status',power:null,acc:100,pp:16},
  // X
  {name:'鍗佸瓧鍓?,nameEn:'X-Scissor',type:'bug',cat:'physical',power:80,acc:100,pp:16},
  // Y
  {name:'鎵撳搱娆?,nameEn:'Yawn',type:'normal',cat:'status',power:null,acc:null,pp:12},
  // Z
  {name:'绂呮€濆ご妲?,nameEn:'Zen Headbutt',type:'psychic',cat:'physical',power:80,acc:90,pp:16},
  {name:'闂數鐐?,nameEn:'Zap Cannon',type:'electric',cat:'special',power:120,acc:50,pp:8},
  {name:'鍡炲棡鐢靛嚮',nameEn:'Zing Zap',type:'electric',cat:'physical',power:80,acc:100,pp:12},
  // 鈹€鈹€ 琛ュ叏锛氭棫涓栦唬 / 浼犺涓撳睘 / 鍐烽棬鎷涘紡 鈹€鈹€
  // A+
  {name:'鍚稿彇',nameEn:'Absorb',type:'grass',cat:'special',power:20,acc:100,pp:20},
  {name:'寮洪吀',nameEn:'Acid',type:'poison',cat:'special',power:40,acc:100,pp:20},
  {name:'姘斿姛鐐?,nameEn:'Aeroblast',type:'flying',cat:'special',power:100,acc:95,pp:8},
  {name:'鎺ㄦ帹鎵?,nameEn:'Arm Thrust',type:'fighting',cat:'physical',power:15,acc:100,pp:20},
  {name:'鑺抽娌荤枟',nameEn:'Aromatherapy',type:'grass',cat:'status',power:null,acc:null,pp:8},
  {name:'鎻村姪',nameEn:'Assist',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鎯婂悡',nameEn:'Astonish',type:'ghost',cat:'physical',power:30,acc:100,pp:16},
  {name:'鏄熻景杩炲嚮',nameEn:'Astral Barrage',type:'ghost',cat:'special',power:120,acc:100,pp:8},
  {name:'杩涙敾鍛戒护',nameEn:'Attack Order',type:'bug',cat:'physical',power:90,acc:100,pp:16},
  {name:'鏋佸厜绾?,nameEn:'Aurora Beam',type:'ice',cat:'special',power:65,acc:100,pp:20},
  {name:'杞婚噺鍖?,nameEn:'Autotomize',type:'steel',cat:'status',power:null,acc:null,pp:16},
  // B+
  {name:'鍒洪拡杩炲皠',nameEn:'Barb Barrage',type:'poison',cat:'physical',power:60,acc:100,pp:12},
  {name:'杩炵画鍑哄嚮',nameEn:'Barrage',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'澹佸瀿',nameEn:'Barrier',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'璧犻€?,nameEn:'Bestow',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'寰呮満',nameEn:'Bide',type:'normal',cat:'physical',power:null,acc:null,pp:12},
  {name:'鑽掗鏆?,nameEn:'Bleakwind Storm',type:'flying',cat:'special',power:100,acc:80,pp:8},
  {name:'琛€鏈?,nameEn:'Blood Moon',type:'normal',cat:'special',power:140,acc:100,pp:8},
  {name:'钃濈劙鐐?,nameEn:'Blue Flare',type:'fire',cat:'special',power:130,acc:85,pp:8},
  {name:'闂數楦熷枡',nameEn:'Bolt Beak',type:'electric',cat:'physical',power:85,acc:100,pp:12},
  {name:'瓒呯骇闆峰嚮',nameEn:'Bolt Strike',type:'electric',cat:'physical',power:130,acc:85,pp:8},
  {name:'楠ㄦ',nameEn:'Bone Club',type:'ground',cat:'physical',power:65,acc:85,pp:20},
  {name:'鍥炴棆楠?,nameEn:'Bonemerang',type:'ground',cat:'physical',power:50,acc:90,pp:12},
  {name:'鐩愭按',nameEn:'Brine',type:'water',cat:'special',power:65,acc:100,pp:12},
  {name:'姘存场',nameEn:'Bubble',type:'water',cat:'special',power:40,acc:100,pp:20},
  {name:'娉℃场鍏夌嚎',nameEn:'Bubble Beam',type:'water',cat:'special',power:65,acc:100,pp:20},
  {name:'鐐庣啍鐩?,nameEn:'Burning Bulwark',type:'fire',cat:'status',power:null,acc:null,pp:8},
  // C+
  {name:'鍙樿壊浼',nameEn:'Camouflage',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'榄呮儜',nameEn:'Captivate',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'搴嗙',nameEn:'Celebrate',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鍠嬪枊涓嶄紤',nameEn:'Chatter',type:'flying',cat:'special',power:65,acc:100,pp:20},
  {name:'涓嶄紤鏀诲嚮',nameEn:'Chip Away',type:'normal',cat:'physical',power:70,acc:100,pp:20},
  {name:'缁垮寲鐐?,nameEn:'Chloroblast',type:'grass',cat:'special',power:150,acc:95,pp:8},
  {name:'澶瑰嚮',nameEn:'Clamp',type:'water',cat:'physical',power:35,acc:85,pp:16},
  {name:'纰版挒璺嚎',nameEn:'Collision Course',type:'fighting',cat:'physical',power:100,acc:100,pp:8},
  {name:'鎴樻枟鎵煩',nameEn:'Combat Torque',type:'normal',cat:'physical',power:80,acc:100,pp:12},
  {name:'褰楁槦鎷?,nameEn:'Comet Punch',type:'normal',cat:'physical',power:18,acc:85,pp:16},
  {name:'瀹夋叞',nameEn:'Confide',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'蹇靛姏',nameEn:'Confusion',type:'psychic',cat:'special',power:50,acc:100,pp:20},
  {name:'鏉熺細',nameEn:'Constrict',type:'normal',cat:'physical',power:10,acc:100,pp:20},
  {name:'鍙樻崲',nameEn:'Conversion',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鏍稿績鎯╁',nameEn:'Core Enforcer',type:'dragon',cat:'special',power:100,acc:100,pp:8},
  {name:'鍦哄湴浜ゆ崲',nameEn:'Court Change',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'濂囧闃插尽',nameEn:'Crafty Shield',type:'fairy',cat:'status',power:null,acc:null,pp:16},
  {name:'寮哄姏鎻＄',nameEn:'Crush Grip',type:'normal',cat:'physical',power:null,acc:100,pp:8},
  {name:'鍒囧壊',nameEn:'Cut',type:'normal',cat:'physical',power:50,acc:95,pp:20},
  // D+
  {name:'鏆楅粦闄烽槺',nameEn:'Dark Void',type:'dark',cat:'status',power:null,acc:50,pp:8},
  {name:'闃插尽鍛戒护',nameEn:'Defend Order',type:'bug',cat:'status',power:null,acc:null,pp:16},
  {name:'闃插尽铚风缉',nameEn:'Defense Curl',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'閽荤煶椋庢毚',nameEn:'Diamond Storm',type:'rock',cat:'physical',power:100,acc:95,pp:8},
  {name:'瑙ｉ櫎榄呭姏',nameEn:'Disarming Voice',type:'fairy',cat:'special',power:40,acc:null,pp:16},
  {name:'鐪╂檿鎷?,nameEn:'Dizzy Punch',type:'normal',cat:'physical',power:70,acc:100,pp:12},
  {name:'娑傞甫',nameEn:'Doodle',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'鐮寸伃涔嬫効',nameEn:'Doom Desire',type:'steel',cat:'special',power:140,acc:100,pp:8},
  {name:'鍙岄搧澶撮敜',nameEn:'Double Iron Bash',type:'steel',cat:'physical',power:60,acc:100,pp:8},
  {name:'浜岃繛韪?,nameEn:'Double Kick',type:'fighting',cat:'physical',power:30,acc:100,pp:20},
  {name:'鍙岄噸鐢靛嚮',nameEn:'Double Shock',type:'electric',cat:'physical',power:null,acc:100,pp:8},
  {name:'鍙屾帉鍑?,nameEn:'Double Slap',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'澶╅緳褰掓潵',nameEn:'Dragon Ascent',type:'flying',cat:'physical',power:120,acc:100,pp:8},
  {name:'榫欎箣鎭?,nameEn:'Dragon Breath',type:'dragon',cat:'special',power:60,acc:100,pp:20},
  {name:'榫欒兘閲?,nameEn:'Dragon Energy',type:'dragon',cat:'special',power:null,acc:100,pp:8},
  // E+
  {name:'铔嬬偢寮?,nameEn:'Egg Bomb',type:'normal',cat:'physical',power:100,acc:75,pp:12},
  {name:'鐏姳',nameEn:'Ember',type:'fire',cat:'special',power:40,acc:100,pp:20},
  // F+
  {name:'濡栫簿涔嬮',nameEn:'Fairy Wind',type:'fairy',cat:'special',power:40,acc:100,pp:20},
  {name:'鍋囨尌',nameEn:'False Swipe',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'鍋疯',nameEn:'Feint Attack',type:'dark',cat:'physical',power:60,acc:null,pp:20},
  {name:'鎬掔劙',nameEn:'Fiery Wrath',type:'dark',cat:'special',power:90,acc:100,pp:12},
  {name:'鐏箣瑾撶害',nameEn:'Fire Pledge',type:'fire',cat:'special',power:80,acc:100,pp:12},
  {name:'鐏劙杞?,nameEn:'Flame Wheel',type:'fire',cat:'physical',power:60,acc:100,pp:20},
  {name:'鑺辨潫鐐?,nameEn:'Fleur Cannon',type:'fairy',cat:'special',power:130,acc:90,pp:8},
  {name:'闂厜',nameEn:'Flash',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'鑺变箣闃插尽',nameEn:'Flower Shield',type:'fairy',cat:'status',power:null,acc:null,pp:20},
  {name:'鎺屽簳鍔?,nameEn:'Force Palm',type:'fighting',cat:'physical',power:60,acc:100,pp:12},
  {name:'鍐板喕鍑濊',nameEn:'Freezing Glare',type:'psychic',cat:'special',power:90,acc:100,pp:12},
  {name:'娉勬劋',nameEn:'Frustration',type:'normal',cat:'physical',power:null,acc:100,pp:20},
  {name:'杩炵画鏀诲嚮',nameEn:'Fury Attack',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'杩炴柀',nameEn:'Fury Cutter',type:'bug',cat:'physical',power:40,acc:95,pp:20},
  {name:'鐚涙姄',nameEn:'Fury Swipes',type:'normal',cat:'physical',power:18,acc:80,pp:16},
  // G+
  {name:'榻胯疆鍔犻€?,nameEn:'Gear Up',type:'steel',cat:'status',power:null,acc:null,pp:20},
  {name:'鍦扮悊浠欐硶',nameEn:'Geomancy',type:'fairy',cat:'status',power:null,acc:null,pp:12},
  {name:'鍐板埡闀挎灙',nameEn:'Glacial Lance',type:'ice',cat:'physical',power:120,acc:100,pp:8},
  {name:'鍐板喕涓栫晫',nameEn:'Glaciate',type:'ice',cat:'special',power:65,acc:95,pp:12},
  // H+
  {name:'娌绘剤鍛戒护',nameEn:'Heal Order',type:'bug',cat:'status',power:null,acc:null,pp:12},
  {name:'蹇冨績鐩稿嵃',nameEn:'Heart Stamp',type:'psychic',cat:'physical',power:60,acc:100,pp:20},
  {name:'璺熼缈昏韩',nameEn:'Heel Turn',type:'dark',cat:'physical',power:55,acc:100,pp:20},
  {name:'鎵嬩笅鐣欐儏',nameEn:'Hold Back',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'纾ㄧ埅',nameEn:'Hone Claws',type:'dark',cat:'status',power:null,acc:null,pp:16},
  {name:'瑙掓挒鍑?,nameEn:'Horn Attack',type:'normal',cat:'physical',power:65,acc:100,pp:20},
  {name:'瓒呯骇閽诲ご',nameEn:'Hyper Drill',type:'normal',cat:'physical',power:100,acc:100,pp:8},
  {name:'瓒呯骇鍒╅娇',nameEn:'Hyper Fang',type:'normal',cat:'physical',power:80,acc:90,pp:12},
  // I+
  {name:'鍐扮悆',nameEn:'Ice Ball',type:'ice',cat:'physical',power:30,acc:90,pp:20},
  {name:'鐏劙鍚炲櫖',nameEn:'Incinerate',type:'fire',cat:'special',power:60,acc:100,pp:16},
  {name:'绂诲瓙娴?,nameEn:'Ion Deluge',type:'electric',cat:'status',power:null,acc:null,pp:20},
  // J+
  {name:'绁炰箣瀹″垽',nameEn:'Judgment',type:'normal',cat:'special',power:100,acc:100,pp:12},
  {name:'椋炶涪',nameEn:'Jump Kick',type:'fighting',cat:'physical',power:100,acc:95,pp:12},
  // L+
  {name:'鍙舵棆',nameEn:'Leaf Tornado',type:'grass',cat:'special',power:65,acc:90,pp:12},
  {name:'鐬溂',nameEn:'Leer',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'鑸旈',nameEn:'Lick',type:'ghost',cat:'physical',power:30,acc:100,pp:20},
  // M+
  {name:'鐔旂伀婕╂丁',nameEn:'Magma Storm',type:'fire',cat:'special',power:100,acc:75,pp:8},
  {name:'闇囩骇',nameEn:'Magnitude',type:'ground',cat:'physical',power:null,acc:100,pp:20},
  {name:'鎶㈠厛',nameEn:'Me First',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'闀滈潰绉诲姩',nameEn:'Mirror Move',type:'flying',cat:'status',power:null,acc:null,pp:20},
  {name:'钖勯浘',nameEn:'Mist',type:'ice',cat:'status',power:null,acc:null,pp:20},
  {name:'杩烽浘鐞?,nameEn:'Mist Ball',type:'psychic',cat:'special',power:70,acc:100,pp:8},
  {name:'娉ュ湡鐐稿脊',nameEn:'Mud Bomb',type:'ground',cat:'special',power:65,acc:85,pp:12},
  {name:'澶氬睘鎬ф敾鍑?,nameEn:'Multi-Attack',type:'normal',cat:'physical',power:120,acc:100,pp:12},
  {name:'绁炵涔嬪姏',nameEn:'Mystical Power',type:'psychic',cat:'special',power:70,acc:90,pp:12},
  // N+
  {name:'鑷劧涔嬪姏',nameEn:'Nature Power',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'閽堣噦鍒?,nameEn:'Needle Arm',type:'grass',cat:'physical',power:60,acc:100,pp:16},
  {name:'鍣╂ⅵ',nameEn:'Nightmare',type:'ghost',cat:'status',power:null,acc:100,pp:16},
  // O+
  {name:'绔犻奔鍠峰ⅷ',nameEn:'Octazooka',type:'water',cat:'special',power:65,acc:85,pp:12},
  {name:'涓嶈涔嬮',nameEn:'Ominous Wind',type:'ghost',cat:'special',power:60,acc:100,pp:8},
  {name:'寰呭懡鍑哄嚮',nameEn:'Order Up',type:'dragon',cat:'physical',power:80,acc:100,pp:12},
  {name:'鏈簮娉㈠姩',nameEn:'Origin Pulse',type:'water',cat:'special',power:110,acc:85,pp:8},
  {name:'瓒呰浇',nameEn:'Overdrive',type:'electric',cat:'special',power:80,acc:100,pp:12},
  // P+
  {name:'鍏夊瓙闂存瓏娉?,nameEn:'Photon Geyser',type:'psychic',cat:'special',power:100,acc:100,pp:8},
  {name:'绛夌瀛愭嫵',nameEn:'Plasma Fists',type:'electric',cat:'physical',power:100,acc:100,pp:8},
  {name:'寮哄姏鎷?,nameEn:'Power-Up Punch',type:'fighting',cat:'physical',power:40,acc:100,pp:20},
  {name:'鏂礀涔嬪垉',nameEn:'Precipice Blades',type:'ground',cat:'physical',power:120,acc:85,pp:8},
  {name:'妫遍暅婵€鍏?,nameEn:'Prismatic Laser',type:'psychic',cat:'special',power:160,acc:100,pp:8},
  {name:'瓒呰兘閲忕垎鍙?,nameEn:'Psycho Boost',type:'psychic',cat:'special',power:140,acc:90,pp:8},
  {name:'瓒呰兘鍐插嚮',nameEn:'Psystrike',type:'psychic',cat:'special',power:100,acc:100,pp:12},
  {name:'杩芥墦',nameEn:'Pursuit',type:'dark',cat:'physical',power:40,acc:100,pp:20},
  // R+
  {name:'杩滃彜涔嬫瓕',nameEn:'Relic Song',type:'normal',cat:'special',power:75,acc:100,pp:12},
  {name:'澶╁惎鑸?,nameEn:'Revelation Dance',type:'normal',cat:'special',power:90,acc:100,pp:16},
  {name:'鏃堕棿鐨勮桨楦?,nameEn:'Roar of Time',type:'dragon',cat:'special',power:150,acc:90,pp:8},
  // S+
  {name:'鎶撳嚮',nameEn:'Scratch',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'绉樺墤',nameEn:'Secret Sword',type:'fighting',cat:'special',power:85,acc:100,pp:12},
  {name:'闃撮閿?,nameEn:'Shadow Bone',type:'ghost',cat:'physical',power:85,acc:100,pp:12},
  {name:'鏆楀奖鍐插嚮',nameEn:'Shadow Force',type:'ghost',cat:'physical',power:120,acc:100,pp:8},
  {name:'淇″彿鍏夌嚎',nameEn:'Signal Beam',type:'bug',cat:'special',power:75,acc:100,pp:16},
  {name:'閾惰壊鏃嬮',nameEn:'Silver Wind',type:'bug',cat:'special',power:60,acc:100,pp:8},
  {name:'楂樼┖鍧犺惤',nameEn:'Sky Drop',type:'flying',cat:'physical',power:60,acc:100,pp:12},
  {name:'鍥炴棆鍗囬緳鎷?,nameEn:'Sky Uppercut',type:'fighting',cat:'physical',power:85,acc:90,pp:16},
  {name:'鎽旀墦',nameEn:'Slam',type:'normal',cat:'physical',power:80,acc:75,pp:20},
  {name:'鍔堢爫',nameEn:'Slash',type:'normal',cat:'physical',power:70,acc:100,pp:20},
  {name:'鍡呯洂',nameEn:'Smelling Salts',type:'normal',cat:'physical',power:70,acc:100,pp:12},
  {name:'鐑熷箷',nameEn:'Smokescreen',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'绌洪棿瑁傜紳',nameEn:'Spacial Rend',type:'dragon',cat:'special',power:100,acc:95,pp:8},
  {name:'骞界伒鍋风洍',nameEn:'Spectral Thief',type:'ghost',cat:'physical',power:90,acc:100,pp:12},
  {name:'鏃嬭浆鍑哄嚮',nameEn:'Spin Out',type:'steel',cat:'physical',power:100,acc:100,pp:8},
  {name:'鍚愬嚭',nameEn:'Spit Up',type:'normal',cat:'special',power:null,acc:100,pp:12},
  {name:'鎬ㄦ仺',nameEn:'Spite',type:'ghost',cat:'status',power:null,acc:100,pp:12},
  {name:'鑱氬厜鐏?,nameEn:'Spotlight',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'鏄ラ椋庢毚',nameEn:'Springtide Storm',type:'fairy',cat:'special',power:100,acc:80,pp:8},
  {name:'钂告苯鍠峰彂',nameEn:'Steam Eruption',type:'water',cat:'special',power:110,acc:95,pp:8},
  {name:'鍌ㄨ棌',nameEn:'Stockpile',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'鍔涢噺',nameEn:'Strength',type:'normal',cat:'physical',power:80,acc:100,pp:16},
  {name:'澶у垏鐗?,nameEn:'Super Fang',type:'normal',cat:'physical',power:null,acc:90,pp:12},
  {name:'鍚炰笅',nameEn:'Swallow',type:'normal',cat:'status',power:null,acc:null,pp:12},
  // T+
  {name:'鎾炲嚮',nameEn:'Tackle',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'鑸嶈韩鏀诲嚮',nameEn:'Take Down',type:'normal',cat:'physical',power:90,acc:85,pp:20},
  {name:'娉溂',nameEn:'Tearful Look',type:'water',cat:'status',power:null,acc:null,pp:20},
  {name:'绉戞妧鐖嗙偢',nameEn:'Techno Blast',type:'normal',cat:'special',power:120,acc:100,pp:8},
  {name:'蹇靛姩鍔?,nameEn:'Telekinesis',type:'psychic',cat:'status',power:null,acc:null,pp:16},
  {name:'鐬棿绉诲姩',nameEn:'Teleport',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'鍗冪',nameEn:'Thousand Arrows',type:'ground',cat:'physical',power:90,acc:100,pp:12},
  {name:'鍗冩氮',nameEn:'Thousand Waves',type:'ground',cat:'physical',power:90,acc:100,pp:12},
  {name:'澶ч椆涓€鐣?,nameEn:'Thrash',type:'normal',cat:'physical',power:120,acc:100,pp:12},
  {name:'闆风數鍥氱',nameEn:'Thunder Cage',type:'electric',cat:'special',power:80,acc:90,pp:12},
  {name:'闆烽渾韪?,nameEn:'Thunderous Kick',type:'fighting',cat:'physical',power:90,acc:100,pp:12},
  {name:'涓栫晫鍊掔疆',nameEn:'Topsy-Turvy',type:'dark',cat:'status',power:null,acc:null,pp:20},
  {name:'涓夐噸韪?,nameEn:'Triple Kick',type:'fighting',cat:'physical',power:10,acc:90,pp:12},
  // V+
  {name:'姣掓恫鍐插嚮',nameEn:'Venoshock',type:'poison',cat:'special',power:65,acc:100,pp:12},
  {name:'鑳滃埄鑸?,nameEn:'Victory Dance',type:'fighting',cat:'status',power:null,acc:null,pp:12},
  {name:'钘ら灜',nameEn:'Vine Whip',type:'grass',cat:'physical',power:45,acc:100,pp:20},
  {name:'閽冲す',nameEn:'Vise Grip',type:'normal',cat:'physical',power:55,acc:100,pp:20},
  {name:'浼忕壒鍐插嚮',nameEn:'Volt Tackle',type:'electric',cat:'physical',power:120,acc:100,pp:16},
  // W+
  {name:'鍙啋鎺?,nameEn:'Wake-Up Slap',type:'fighting',cat:'physical',power:70,acc:100,pp:12},
  {name:'姘存灙',nameEn:'Water Gun',type:'water',cat:'special',power:40,acc:100,pp:20},
  {name:'鎴忔按',nameEn:'Water Sport',type:'water',cat:'status',power:null,acc:null,pp:16},
  {name:'鏃嬮',nameEn:'Whirlwind',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'閲庢€у啿鐢?,nameEn:'Wild Charge',type:'electric',cat:'physical',power:90,acc:100,pp:16},
  {name:'鎷у共',nameEn:'Wring Out',type:'normal',cat:'special',power:null,acc:100,pp:8},
];
// 鏃ф暟鎹凡琚?MOVES_CHAMPIONS_DATA 鍙栦唬锛屾鏁扮粍涓嶅啀浣跨敤
const BATTLE_MOVE_SEARCH_LIMIT=8;
const battleMoveSearchState={activeIndex:null};
// 鏀诲嚮鏂癸紙琛岋級脳 闃插尽鏂癸紙鍒楋級鐩稿厠鍊嶇巼鐭╅樀 鈥?Gen 9 鏍囧噯
const TYPE_EFF_MATRIX=[
//  nor  fir  wat  ele  grs  ice  fgt  psn  gnd  fly  psy  bug  rck  gst  drg  drk  stl  fry
  [ 1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  .5,   0,   1,   1,  .5,   1], // normal
  [ 1,  .5,  .5,   1,   2,   2,   1,   1,   1,   1,   1,   2,  .5,   1,  .5,   1,   2,   1], // fire
  [ 1,   2,  .5,   1,  .5,   1,   1,   1,   2,   1,   1,   1,   2,   1,  .5,   1,   1,   1], // water
  [ 1,   1,   2,  .5,  .5,   1,   1,   1,   0,   2,   1,   1,   1,   1,  .5,   1,   1,   1], // electric
  [ 1,  .5,   2,   1,  .5,   1,   1,  .5,   2,  .5,   1,  .5,   2,   1,  .5,   1,  .5,   1], // grass
  [ 1,  .5,  .5,   1,   2,  .5,   1,   1,   2,   2,   1,   1,   1,   1,   2,   1,  .5,   1], // ice
  [ 2,   1,   1,   1,   1,   2,   1,  .5,   1,  .5,  .5,  .5,   2,   0,   1,   2,   2,  .5], // fighting
  [ 1,   1,   1,   1,   2,   1,   1,  .5,  .5,   1,   1,   1,  .5,  .5,   1,   1,   0,   2], // poison
  [ 1,   2,   1,   2,  .5,   1,   1,   2,   1,   0,   1,  .5,   2,   1,   1,   1,   2,   1], // ground
  [ 1,   1,   1,  .5,   2,   1,   2,   1,   1,   1,   1,   2,  .5,   1,   1,   1,  .5,   1], // flying
  [ 1,   1,   1,   1,   1,   1,   2,   2,   1,   1,  .5,   1,   1,   1,   1,   0,  .5,   1], // psychic
  [ 1,  .5,   1,   1,   2,   1,  .5,  .5,   1,  .5,   2,   1,   1,  .5,   1,   2,  .5,  .5], // bug
  [ 1,   2,   1,   1,   1,   2,  .5,   1,  .5,   2,   1,   2,   1,   1,   1,   1,  .5,   1], // rock
  [ 0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,   1,   2,   1,  .5,   1,   1], // ghost
  [ 1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,  .5,   0], // dragon
  [ 1,   1,   1,   1,   1,   1,  .5,   1,   1,   1,   2,   1,   1,   2,   1,  .5,   1,  .5], // dark
  [ 1,  .5,  .5,  .5,   1,   2,   1,   1,   1,   1,   1,   1,   2,   1,   1,   1,  .5,   2], // steel
  [ 1,  .5,   1,   1,   1,   1,   2,  .5,   1,   1,   1,   1,   1,   1,   2,   2,  .5,   1], // fairy
];
const B_TYPE_IDX={};B_TYPES.forEach((t,i)=>B_TYPE_IDX[t]=i);

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鐗规€ф暟鎹簱 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
// A绫伙細灞炴€у厤鐤紙鐩存帴鏀瑰彉鐩稿厠鐭╅樀锛?
const ABILITY_TYPE_IMMUNE={
  'levitate':      ['ground'],
  'flash-fire':    ['fire'],
  'water-absorb':  ['water'],
  'dry-skin':      ['water'],
  'volt-absorb':   ['electric'],
  'motor-drive':   ['electric'],
  'lightning-rod': ['electric'],
  'sap-sipper':    ['grass'],
  'earth-eater':   ['ground'],
  'storm-drain':   ['water'],
};
// B绫伙細闃插尽绔激瀹冲噺鍏?
const ABILITY_DEF_MOD={
  'thick-fat':      {types:['fire','ice'],  mul:0.5},
  'heatproof':      {types:['fire'],        mul:0.5},
  'water-bubble':   {types:['fire'],        mul:0.5},
  'purifying-salt': {types:['ghost'],       mul:0.5},
  'solid-rock':     {superEff:0.75},
  'filter':         {superEff:0.75},
  'multiscale':     {fullHp:0.5, note:'婊¤鏃跺彈鍒颁激瀹冲噺鍗?},
  'fur-coat':       {physMul:0.5},
};
// C绫伙細杩涙敾绔骞咃紙鐢ㄤ簬 calcDamageEst锛?
const ABILITY_ATK_MOD={
  'adaptability':  {stabMul:2.0},
  'huge-power':    {atkStatMul:2.0}, 'pure-power':{atkStatMul:2.0},
  'hustle':        {atkStatMul:1.5},
  'sheer-force':   {globalMul:1.3},
  'tough-claws':   {physMul:1.3},
  'technician':    {lowPwrMul:1.5, threshold:60},
  'iron-fist':     {punchMul:1.2},
  'strong-jaw':    {biteMul:1.5},
  'reckless':      {recoilMul:1.2},
  'sharpness':     {sliceMul:1.5},
  'mega-launcher': {pulseMul:1.5},
  'water-bubble':  {typeMul:{water:2.0}},
  'fairy-aura':    {typeMul:{fairy:1.33}},
  'solar-power':   {sunSpaMul:1.5},
  'parental-bond': {globalMul:1.25},
  'protean':       {alwaysStab:true},
  'pixilate':      {normalConvert:'fairy',   convertMul:1.2},
  'refrigerate':   {normalConvert:'ice',     convertMul:1.2},
  'aerilate':      {normalConvert:'flying',  convertMul:1.2},
  'dragonize':     {normalConvert:'dragon',  convertMul:1.0},
  'sand-force':    {sandTypes:['rock','ground','steel'], sandMul:1.3},
  'analytic':      {lastMul:1.3},
};
// 鎶€鑳藉垎绫绘爣绛撅紙鐢ㄤ簬 iron-fist / strong-jaw / sharpness 绛夛級
const MOVE_PUNCH_SET=new Set(['ice-punch','fire-punch','thunder-punch','mach-punch','bullet-punch','shadow-punch','focus-punch','hammer-arm','drain-punch','power-up-punch','sky-uppercut','dizzy-punch','sucker-punch','dynamic-punch','plasma-fists','comet-punch','mega-punch']);
const MOVE_BITE_SET=new Set(['bite','crunch','hyper-fang','super-fang','thunder-fang','ice-fang','fire-fang','poison-fang','psychic-fangs','fishious-rend','jaw-lock']);
const MOVE_SLICE_SET=new Set(['cut','slash','aerial-ace','night-slash','leaf-blade','x-scissor','cross-poison','sacred-sword','secret-sword','razor-shell','solar-blade','ceaseless-edge','kowtow-cleave','fury-cutter','air-slash','psycho-cut']);
const MOVE_PULSE_SET=new Set(['aura-sphere','water-pulse','dark-pulse','dragon-pulse','heal-pulse','origin-pulse','terrain-pulse','tera-blast']);
const MOVE_RECOIL_SET=new Set(['double-edge','flare-blitz','brave-bird','take-down','volt-tackle','head-smash','wild-charge','wood-hammer','head-charge','high-jump-kick','jump-kick']);
// D绫伙細閫熷害淇
const ABILITY_SPD_MOD={
  'swift-swim':  {weather:'rain',  mul:2.0},
  'chlorophyll': {weather:'sun',   mul:2.0},
  'sand-rush':   {weather:'sand',  mul:2.0},
  'slush-rush':  {weather:'snow',  mul:2.0},
  'surge-surfer':{terrain:'electric', mul:2.0},
  'speed-boost': {perTurn:true,    note:'姣忓洖鍚堥€熷害+1妗?},
  'unburden':    {onItemUse:true,  note:'娑堣€楅亾鍏峰悗閫熷害脳2'},
  'quick-feet':  {onStatus:1.5,   note:'寮傚父鐘舵€佹椂閫熷害脳1.5'},
  'quick-draw':  {priority30:true, note:'30%姒傜巼鍏堝埗琛屽姩'},
};
// E绫伙細澶╂皵璁剧疆
const ABILITY_WEATHER_SET={'drought':'sun','drizzle':'rain','sand-stream':'sand','snow-warning':'snow'};
// G绫伙細鐢熷瓨鐗规€э紙褰卞搷OHKO鍒ゆ柇锛?
const ABILITY_SURVIVE={
  'sturdy':   '婊¤鏃跺繀瀹氫互1HP鐢熻繕浠讳綍涓€鍑?,
  'multiscale':'婊¤鏃跺彈鍒颁激瀹冲噺鍗?,
  'disguise': '绗竴鍑诲繀瀹氭牸鎸★紙浼ゅ鏃犳晥锛?,
};
// 鐮存牸绫伙紙鏃犺闃插尽鐗规€э級
const ABILITY_BREAKER=new Set(['mold-breaker','turboblaze','teravolt']);

/* 鈹€鈹€ 鐗规€ц緟鍔╁嚱鏁?鈹€鈹€ */
// 鑾峰彇瀵规柟瀹濆彲姊︽暟鎹簱涓殑鐗规€у垪琛?
function getOppAbilityList(oppPkm){
  return oppPkm.slug?(PKM_PC_BY_SLUG[oppPkm.slug]?.abilities||[]):[];
}
// 鑾峰彇瀵规柟瀹濆彲姊︽渶鍙兘鐨勭壒鎬э細浼樺厛鐢?builds 棰勬祴锛屽叾娆″彇鏁版嵁搴撶涓€涓?
function resolveOppAbility(oppPkm){
  if(oppPkm.predictedAbility?.slug) return oppPkm.predictedAbility.slug;
  const list=getOppAbilityList(oppPkm);
  return list[0]||'';
}
// 瀵规柟瀹濆彲姊︾殑鎵€鏈夌壒鎬т腑锛岃兘鍏嶇柅鍝簺灞炴€?
function getOppPossibleImmunes(oppPkm){
  const list=getOppAbilityList(oppPkm);
  const immunes=new Set();
  list.forEach(a=>(ABILITY_TYPE_IMMUNE[a]||[]).forEach(t=>immunes.add(t)));
  return immunes;
}
// 璁＄畻鏀诲嚮鏂圭壒鎬у鎶€鑳界殑澧炲箙鍊嶇巼
function calcAtkAbilityMul(myPkm, move, activeWeather=''){
  const ability=myPkm.ability||'';
  const mod=ABILITY_ATK_MOD[ability];
  if(!mod)return 1.0;
  const pwr=move.power||0;
  const slug=move.slug||move.nameEn?.toLowerCase().replace(/ /g,'-')||'';
  if(mod.globalMul) return mod.globalMul;
  if(mod.atkStatMul) return 1.0; // handled separately in stat calc
  if(mod.lowPwrMul && pwr>0 && pwr<=mod.threshold) return mod.lowPwrMul;
  if(mod.physMul && move.cat==='physical') return mod.physMul; // tough-claws
  if(mod.punchMul && MOVE_PUNCH_SET.has(slug)) return mod.punchMul;
  if(mod.biteMul  && MOVE_BITE_SET.has(slug))  return mod.biteMul;
  if(mod.sliceMul && MOVE_SLICE_SET.has(slug)) return mod.sliceMul;
  if(mod.pulseMul && MOVE_PULSE_SET.has(slug)) return mod.pulseMul;
  if(mod.recoilMul&& MOVE_RECOIL_SET.has(slug))return mod.recoilMul;
  if(mod.typeMul && mod.typeMul[move.type]) return mod.typeMul[move.type];
  if(mod.sandTypes && mod.sandTypes.includes(move.type) && activeWeather==='sand') return mod.sandMul;
  if(mod.sunSpaMul && move.cat==='special' && activeWeather==='sun') return mod.sunSpaMul;
  if(mod.lastMul) return mod.lastMul; // analytic: approximate
  return 1.0;
}
// 鑾峰彇鏀诲嚮鏂圭壒鎬ц浆鎹㈠悗鐨勬妧鑳藉睘鎬э紙pixilate绛夛級
function getMoveTypeWithAbility(myPkm, move){
  const ability=myPkm.ability||'';
  const mod=ABILITY_ATK_MOD[ability];
  if(mod?.normalConvert && move.type==='normal') return {type:mod.normalConvert, convertMul:mod.convertMul||1.0};
  return {type:move.type, convertMul:1.0};
}
// 妫€娴嬪繁鏂归槦浼嶆椿璺冨ぉ姘旓紙鏈夊ぉ姘旇缃壒鎬х殑瀹濆彲姊︼級
function detectMyWeather(myPkmList){
  for(const p of myPkmList){
    const w=ABILITY_WEATHER_SET[p.ability||''];
    if(w)return w;
  }
  return '';
}
// 妫€娴嬪鏂归槦浼嶅彲鑳借缃殑澶╂皵
function detectOppWeather(oppList){
  const weathers=new Set();
  oppList.forEach(op=>getOppAbilityList(op).forEach(a=>{const w=ABILITY_WEATHER_SET[a];if(w)weathers.add(w);}));
  return [...weathers];
}
// 鍚ぉ姘旂殑鏈夋晥閫熷害
function getEffectiveSpeed(pkm, activeWeather=''){
  const base=pkm.base?.spe||0;
  if(!base)return 0;
  let spe=base;
  // 閬撳叿閫熷害淇锛堜紭鍏堜粠 ITEMS_BY_NAME 璇?spdMul锛屽厹搴曠‖缂栫爜锛?
  const itemD=ITEMS_BY_NAME[pkm.item||''];
  if(itemD?.damageMul?.spdMul) spe=Math.floor(spe*itemD.damageMul.spdMul);
  else if(pkm.item==='璁茬┒鍥村肪') spe=Math.floor(spe*1.5);
  // 鐗规€ч€熷害淇
  const mod=ABILITY_SPD_MOD[pkm.ability||''];
  if(mod?.weather&&mod.weather===activeWeather) spe=Math.floor(spe*mod.mul);
  return spe;
}

// 鎬ф牸淇 鈥?[HP, 鏀诲嚮, 闃插尽, 鐗规敾, 鐗归槻, 閫熷害]
const NATURES_ZH={
  '鍕ゅ':[1,1,1,1,1,1],'娓╅『':[1,1,1,1,1,1],'璁ょ湡':[1,1,1,1,1,1],'瀹崇緸':[1,1,1,1,1,1],'鍙ゆ€?:[1,1,1,1,1,1],
  '瀛ゅ兓':[1,1.1,0.9,1,1,1],'鍕囨暍':[1,1.1,1,1,1,0.9],'鍥烘墽':[1,1.1,1,0.9,1,1],'椤界毊':[1,1.1,1,1,0.9,1],
  '淇濆畧':[1,0.9,1.1,1,1,1],'鏀炬澗':[1,1,1.1,1,1,0.9],'鐨疄':[1,1,1.1,0.9,1,1],'鏁ｆ极':[1,1,1.1,1,0.9,1],
  '鑳嗗皬':[1,0.9,1,1,1,1.1],'鎱屼贡':[1,1,0.9,1,1,1.1],'鐖芥湕':[1,1,1,0.9,1,1.1],'澶╃湡':[1,1,1,1,0.9,1.1],
  '鍐呮暃':[1,0.9,1,1.1,1,1],'娓╁拰':[1,1,0.9,1.1,1,1],'鍐烽潤':[1,1,1,1.1,1,0.9],'娴簛':[1,1,1,1.1,0.9,1],
  '娓╁帤':[1,0.9,1,1,1.1,1],'娓╂煍':[1,1,0.9,1,1.1,1],'鍐锋贰':[1,1,1,1,1.1,0.9],'鎱庨噸':[1,1,1,0.9,1.1,1],
};
const STAT_KEYS_B=['hp','atk','def','spa','spd','spe'];
const STAT_ZH_B={hp:'HP',atk:'鏀诲嚮',def:'闃插尽',spa:'鐗规敾',spd:'鐗归槻',spe:'閫熷害'};

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鐘舵€?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
let battleTeams=[];
let battleEditTeam=null;     // 姝ｅ湪缂栬緫鐨勯槦浼嶏紙瀵硅薄锛?
let battleEditSlot=0;        // 褰撳墠缂栬緫鐨勫疂鍙ⅵ妲戒綅 0-5
let battleEditSpriteCache={}; // slot -> sprite URL
let battleSrchT=null;
let battleMoveDropdownBound=false;
let battleMyTeamId=null;     // 鍒嗘瀽椤甸€変腑鐨勬垜鏂归槦浼?let battleOppPkm=[{},{},{},{},{},{} ];  // 瀵规柟6鍙紙{name,type1,type2}锛?let battleAnalysisMyTeam=null;
let battleCurrentVersion = '';
let battleCurrentFormat  = '';

function showBattleHub() {
  document.querySelectorAll('.battle-subview').forEach(v => v.classList.remove('on'));
  document.getElementById('battle-hub').classList.add('on');
  document.getElementById('battle-mode-label').style.display = 'none';
  battleCurrentVersion = '';
  battleCurrentFormat  = '';
}

function enterBattleVersion(version) {
  if (version === 'pkmc') enterBattleFormat('pkmc', 'singles');
}

function enterBattleFormat(version, format) {
  battleCurrentVersion = version;
  battleCurrentFormat  = format;
  document.querySelectorAll('.battle-subview').forEach(v => v.classList.remove('on'));
  if (format === 'doubles') {
    document.getElementById('battle-doubles').classList.add('on');
    if (!window._battleDoublesInited) {
      window._battleDoublesInited = true;
      if (!window._battlePkmcInited) {
        loadBattleGameData('champions');
        loadBattleTeams().then(() => { renderDTeamList(); renderDTeamSel(); });
      } else {
        renderDTeamList();
        renderDTeamSel();
      }
      renderDOppSlots();
    }
    document.getElementById('battle-mode-label').textContent = 'Pokemon Champions 路 鍙屾墦';
  } else {
    document.getElementById('battle-pkmc').classList.add('on');
    document.getElementById('battle-mode-label').textContent = 'Pokemon Champions 路 鍗曟墦';
  }
  document.getElementById('battle-mode-label').style.display = '';
  if (format === 'singles' && !window._battlePkmcInited) {
    window._battlePkmcInited = true;
    loadBattleGameData('champions');
    renderBattleOppSlots();
    loadBattleTeams().then(() => { renderTeamList(); renderBattleTeamSel(); });
    renderBattleCalc();
  }
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鍒濆鍖?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
async function initBattle(){
  showBattleHub();
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鏍囩鍒囨崲 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function switchBattleTab(tab,btn){
  document.querySelectorAll('.btab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.btab-panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('btab-'+tab).classList.add('on');
  btn.classList.add('on');
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ Supabase 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function loadBattleTeamsFromLocal(){
  try{
    const localTeams=JSON.parse(localStorage.getItem('battle_teams')||'[]');
    battleTeams=Array.isArray(localTeams)
      ?localTeams.map(t=>({...t,id:t.id&&t.id!=='undefined'?t.id:`local_${Date.now()}_${Math.random().toString(36).slice(2)}`}))
      :[];
  } catch(e){
    battleTeams=[];
  }
}

async function loadBattleTeams(){
  try{
    const{data:{session}}=await db.auth.getSession();
    if(session?.user){
      const{data,error}=await db.from('battle_teams').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false});
      if(error)throw error;
      battleTeams=data||[];
    } else {
      loadBattleTeamsFromLocal();
    }
  } catch(e){
    console.warn('battle load error',e);
    loadBattleTeamsFromLocal();
  }
}

async function saveBattleTeamToServer(team){
  const localId=team?.id||`local_${Date.now()}`;
  try{
    const{data:{session}}=await db.auth.getSession();
    if(session?.user){
      const payload={...team,user_id:session.user.id};
      if(payload.id && !payload.id.startsWith('local_')){
        const{error}=await db.from('battle_teams').update({team_name:payload.team_name,pokemon:payload.pokemon,updated_at:new Date().toISOString()}).eq('id',payload.id);
        if(error)throw error;
      } else {
        delete payload.id;
        const{data,error}=await db.from('battle_teams').insert(payload).select().single();
        if(error)throw error;
        return data?.id||localId;
      }
    } else {
      localStorage.setItem('battle_teams',JSON.stringify(battleTeams));
    }
  } catch(e){
    console.warn('battle save error',e);
    localStorage.setItem('battle_teams',JSON.stringify(battleTeams));
  }
  return localId;
}

async function deleteBattleTeamFromServer(id){
  if(!id||id==='undefined'||id==='null')return;
  try{
    const{data:{session}}=await db.auth.getSession();
    if(session?.user && !id.startsWith('local_')){
      const{error}=await db.from('battle_teams').delete().eq('id',id);
      if(error)throw error;
    }
  } catch(e){
    console.warn('battle delete error',e);
  }
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 娓叉煋闃熶紞鍒楄〃 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function renderTeamList(){
  const el=document.getElementById('battle-team-list');
  if(!el)return;
  if(!battleTeams.length){
    el.innerHTML=`<div class="btc-empty"><div class="btc-empty-ico">鈿旓笍</div>杩樻病鏈夐槦浼嶏紝鐐瑰嚮銆屾柊寤洪槦浼嶃€嶅紑濮嬪惂锛?/div>`;
    return;
  }
  el.innerHTML=battleTeams.map(t=>{
    const pkm=Array.isArray(t.pokemon)?t.pokemon:[];
    const sprites=pkm.map((p,i)=>{
      const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">`:'<span style="font-size:1.4rem;color:var(--b2)">路</span>';
      const dots=(p.type1?`<div class="btc-type-dot" style="background:${TYPE_COLOR[p.type1]||'#888'}"></div>`:'')+(p.type2?`<div class="btc-type-dot" style="background:${TYPE_COLOR[p.type2]||'#888'}"></div>`:'');
      return`<div class="btc-pkm" onclick="event.stopPropagation();openBattleTeamEdit('${t.id}',${i})" title="${esc(p.name||'绌轰綅')}">
        ${img}
        <div class="btc-pkm-name">${esc(p.name||'鈥?)}</div>
        <div class="btc-pkm-types">${dots}</div>
      </div>`;
    });
    while(sprites.length<6)sprites.push(`<div class="btc-pkm"><span style="font-size:1.4rem;color:var(--b2)">+</span><div class="btc-pkm-name" style="color:var(--t3)">绌?/div></div>`);
    return`<div class="battle-team-card">
      <div class="btc-header">
        <div class="btc-name">${esc(t.team_name||'鎴戠殑闃熶紞')}</div>
        <div class="btc-meta">${pkm.filter(p=>p.name).length}/6 宸插綍鍏?/div>
        <div class="btc-actions">
          <button class="btn btn-sm" onclick="openBattleTeamEdit('${t.id}',0)">鉁忥笍 缂栬緫</button>
          <button class="btn btn-sm btn-d" onclick="confirmDeleteBattleTeam('${t.id}')">鍒犻櫎</button>
        </div>
      </div>
      <div class="btc-sprites">${sprites.join('')}</div>
    </div>`;
  }).join('');
}

function renderBattleTeamSel(){
  const sel=document.getElementById('battle-my-team-sel');
  if(!sel)return;
  sel.innerHTML=`<option value="">閫夋嫨鎴戠殑闃熶紞鈥?/option>`+battleTeams.map(t=>`<option value="${t.id}">${esc(t.team_name||'鎴戠殑闃熶紞')}</option>`).join('');
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鎵撳紑缂栬緫 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function openBattleTeamEdit(teamId, slotIndex=0){
  if(teamId&&teamId!=='undefined'){
    const found=battleTeams.find(t=>t.id===teamId);
    if(!found){showToast('闃熶紞鏁版嵁鏈壘鍒帮紝璇峰埛鏂伴〉闈?);return;}
    battleEditTeam=JSON.parse(JSON.stringify(found));
  } else {
    battleEditTeam={id:'local_'+Date.now(),team_name:'鎴戠殑闃熶紞',pokemon:[]};
  }
  // 纭繚 6 涓Ы浣?
  while(battleEditTeam.pokemon.length<6)battleEditTeam.pokemon.push({});
  battleEditSlot=slotIndex;
  battleEditSpriteCache={};
  // 棰勫～绮剧伒鍥?URL
  battleEditTeam.pokemon.forEach((p,i)=>{
    if(p._spriteUrl)battleEditSpriteCache[i]=p._spriteUrl;
  });
  document.getElementById('battle-team-name-inp').value=battleEditTeam.team_name||'';
  document.getElementById('battle-team-del-btn').style.display=teamId?'block':'none';
  renderBattleSlotTabs();
  renderBattleSlotForm();
  document.getElementById('ov-battle-team').classList.add('on');
}

function closeBattleTeamEdit(){
  document.getElementById('ov-battle-team').classList.remove('on');
  battleEditTeam=null;
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 妲戒綅鏍囩 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function renderBattleSlotTabs(){
  const tabs=document.getElementById('battle-slot-tabs');
  tabs.innerHTML=battleEditTeam.pokemon.map((p,i)=>{
    const img=battleEditSpriteCache[i]?`<img src="${battleEditSpriteCache[i]}" alt="" onerror="this.src=''">`:
      `<div class="bslot-empty-ico">+</div>`;
    const name=p.name||`绗?{i+1}鍙猔;
    return`<button class="bslot-btn${i===battleEditSlot?' on':''}" onclick="selectBattleSlot(${i})" title="${esc(name)}">
      ${img}
      <span class="bslot-btn-num">#${i+1}</span>
      <span class="bslot-btn-name">${esc(p.name||'绌轰綅')}</span>
    </button>`;
  }).join('');
}

function selectBattleSlot(i){
  // 淇濆瓨褰撳墠琛ㄥ崟鍒?editTeam
  gatherSlotForm();
  battleEditSlot=i;
  renderBattleSlotTabs();
  renderBattleSlotForm();
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 娓叉煋鍗曞彧瀹濆彲姊﹁〃鍗?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function renderBattleSlotForm(){
  const p=battleEditTeam.pokemon[battleEditSlot]||{};
  const moves=[p.move1||{},p.move2||{},p.move3||{},p.move4||{}];
  const statsBlock=['hp','atk','def','spa','spd','spe'].map(k=>{
    const calc=calcActualStatVal(p.base?.[k]||0,p.iv?.[k]??31,p.ev?.[k]||0,(p.nature||'鍥烘墽'),k);
    return`<div class="bpkm-stat-col">
      <span class="bpkm-stat-lbl">${STAT_ZH_B[k]}</span>
      <input class="bpkm-inp-num" id="bpkm-base-${k}" type="number" min="0" max="255" placeholder="绉嶆棌" value="${p.base?.[k]||''}" oninput="onBpkmStatChange()">
      <input class="bpkm-inp-num" id="bpkm-iv-${k}" type="number" value="31" readonly style="opacity:.45;pointer-events:none">
      <input class="bpkm-inp-num" id="bpkm-ev-${k}" type="number" min="0" max="32" placeholder="SP" value="${p.ev?.[k]||0}" oninput="onBpkmEvChange()">
      <span class="bpkm-stat-calc" id="bpkm-calc-${k}">${calc||'鈥?}</span>
    </div>`;
  }).join('');

  const typeOpts=B_TYPES.map(t=>`<option value="${t}"${p.type1===t?' selected':''}>${TYPE_ZH[t]||t}</option>`).join('');
  const typeOpts2=['<option value="">鏃?/option>',...B_TYPES.map(t=>`<option value="${t}"${p.type2===t?' selected':''}>${TYPE_ZH[t]||t}</option>`)].join('');
  const natOpts=['', ...Object.keys(NATURES_ZH)].map(n=>`<option value="${n}"${p.nature===n?' selected':''}>${n||'鏃?}</option>`).join('');

  const hasLearnables=(p.learnableMovesEn||[]).length>0;
  const movePlaceholder=hasLearnables?'鐐瑰嚮閫夋嫨鍙鎶€鑳解€?:'鎶€鑳藉悕绉帮紙鍙悳绱級';
  const movesHtml=moves.map((m,i)=>`<div class="bpkm-move-card">
    <span class="bpkm-move-num">鎶€鑳?${i+1}</span>
    <div class="bpkm-move-search-wrap">
      <input class="bpkm-inp" id="bpkm-move${i+1}-name" placeholder="${movePlaceholder}" value="${esc(m.name||'')}" autocomplete="off" oninput="onBattleMoveNameInput(${i+1},this.value)" onfocus="onBattleMoveNameInput(${i+1},this.value)">
      <div class="bpkm-search-drop bpkm-move-search-drop" id="bpkm-move${i+1}-drop"></div>
    </div>
    <div class="bpkm-move-row">
      <select class="bpkm-inp" id="bpkm-move${i+1}-type" style="flex:1;padding:5px 8px">
        <option value="">灞炴€?/option>${B_TYPES.map(t=>`<option value="${t}"${m.type===t?' selected':''}>${TYPE_ZH[t]||t}</option>`).join('')}
      </select>
      <select class="bpkm-inp" id="bpkm-move${i+1}-cat" style="flex:1;padding:5px 8px">
        <option value="">绫诲瀷</option>
        <option value="physical"${m.cat==='physical'?' selected':''}>鐗╃悊</option>
        <option value="special"${m.cat==='special'?' selected':''}>鐗规畩</option>
        <option value="status"${m.cat==='status'?' selected':''}>鍙樺寲</option>
      </select>
    </div>
    <div class="bpkm-move-row">
      <input class="bpkm-inp-num" id="bpkm-move${i+1}-power" type="number" min="0" max="999" placeholder="濞佸姏" value="${m.power||''}" style="flex:1">
      <input class="bpkm-inp-num" id="bpkm-move${i+1}-pp" type="number" min="1" max="64" placeholder="PP" value="${m.pp||''}" style="flex:1">
    </div>
  </div>`).join('');

  const spriteUrl=battleEditSpriteCache[battleEditSlot]||'';
  document.getElementById('battle-pokemon-form').innerHTML=`
    <div class="bpkm-form">
      <div class="bpkm-search-wrap">
        <span class="bpkm-search-ico">馃攳</span>
        <input class="bpkm-search-inp" id="bpkm-name-inp" placeholder="杈撳叆瀹濆彲姊﹀悕绉版垨缂栧彿鎼滅储鈥? value="${esc(p.name||'')}"
          oninput="if(!window._bpkmComposing)onBpkmSearch(this.value)"
          oncompositionstart="window._bpkmComposing=true"
          oncompositionend="window._bpkmComposing=false;onBpkmSearch(this.value)"
          autocomplete="off">
        <div class="bpkm-search-drop" id="bpkm-search-drop"></div>
      </div>
      ${spriteUrl?`<div class="bpkm-preview" id="bpkm-preview-wrap">
        <img src="${esc(spriteUrl)}" alt="" id="bpkm-sprite" onerror="this.style.display='none'">
        <div>
          <div class="bpkm-preview-name" id="bpkm-preview-name">${esc(p.name||'')}</div>
          <div class="bpkm-preview-types" id="bpkm-preview-types">${p.type1?`<span class="coverage-type-tag type-${p.type1}">${TYPE_ZH[p.type1]||p.type1}</span>`:''}${p.type2?`<span class="coverage-type-tag type-${p.type2}">${TYPE_ZH[p.type2]||p.type2}</span>`:''}</div>
        </div>
      </div>
      ${(p.varieties||[]).length>1?`<div class="bpkm-form-chips" id="bpkm-form-chips">${(p.varieties).map(v=>`<button class="bpkm-form-chip${v.name===(p.currentVariety||p.basePkmName)?' active':''}" onclick="selectBpkmForm('${esc(v.name)}')">${esc(v.displayName)}</button>`).join('')}</div>`:''}`:''}
      <div class="bpkm-form-grid">
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">灞炴€?</span>
          <select class="bpkm-inp" id="bpkm-type1">${typeOpts}</select>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">灞炴€?锛堣嫢鏈夛級</span>
          <select class="bpkm-inp" id="bpkm-type2">${typeOpts2}</select>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">鐗规€?/span>
          <div style="position:relative">
            <input class="bpkm-inp" id="bpkm-ability" placeholder="杈撳叆鎴栫偣鍑讳笅鏂圭壒鎬? value="${esc(p.ability||'')}" autocomplete="off">
            <div id="bpkm-ability-chips" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${(p.abilities||[]).map(a=>`<span class="bpkm-ability-chip${p.ability===a?' active':''}" onclick="selectBpkmAbility('${esc(a)}')">${esc(a)}</span>`).join('')}</div>
          </div>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">鎸佹湁閬撳叿</span>
          <div style="position:relative">
            <input class="bpkm-inp" id="bpkm-item" placeholder="鎼滅储閬撳叿鍚嶇О鈥? value="${esc(p.item||'')}"
              autocomplete="off" oninput="onBpkmItemInput()" onfocus="onBpkmItemInput()" onblur="setTimeout(()=>hideBpkmItemDrop(),180)">
            <div id="bpkm-item-drop" class="bpkm-drop" style="display:none"></div>
          </div>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">鎬ф牸</span>
          <select class="bpkm-inp" id="bpkm-nature">${natOpts}</select>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">绛夌骇锛圕hampions榛樿50锛?/span>
          <input class="bpkm-inp-num" id="bpkm-level" type="number" min="1" max="100" value="${p.level||50}" style="width:100%" oninput="onBpkmStatChange()">
        </div>
      </div>

      <div class="bpkm-section-hdr">绉嶆棌鍊?/ 涓綋鍊?/ 鍔姏鍊?鈫?瀹為檯鑳藉姏鍊?/div>
      <div style="font-size:.62rem;color:var(--t3);font-family:'DM Mono',monospace;margin-bottom:6px">姣忚渚濇锛氱鏃?/ 涓綋<span style="opacity:.5">锛堝浐瀹?1锛?/span> / SP(0-32) 鈫?<span style="color:var(--acc2)">瀹為檯鍊?/span>銆€SP鎬诲拰涓婇檺锛?span id="bpkm-ev-total-lbl">0/66</span></div>
      <div class="bpkm-stats-block">${statsBlock}</div>

      <div class="bpkm-section-hdr" style="margin-top:8px">鎶€鑳斤紙鏀寔 Champions AP 鍒讹紝AP 1-5 瀵瑰簲鎶€鑳芥秷鑰楄鍔ㄧ偣鏁帮級</div>
      <div class="bpkm-moves-grid">${movesHtml}</div>

      <div class="bpkm-inp-group" style="margin-top:6px">
        <span class="bpkm-inp-label">澶囨敞</span>
        <textarea class="bpkm-inp" id="bpkm-notes" rows="2" style="height:56px;resize:vertical">${esc(p.notes||'')}</textarea>
      </div>
    </div>`;
  updateEvTotal();
  ensureBattleMoveDropdownBinding();
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鎼滅储瀹濆彲姊?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function ensureBattleMoveDropdownBinding(){
  if(battleMoveDropdownBound)return;
  document.addEventListener('click',e=>{
    if(e.target.closest('.bpkm-move-search-wrap')||e.target.closest('.bpkm-search-wrap'))return;
    closeBattleMoveSuggestions();
  });
  battleMoveDropdownBound=true;
}

function normalizeBattleMoveKeyword(v){
  return String(v||'').trim().toLowerCase().replace(/[\s\-_'.]/g,'');
}

function getBattleMoveSuggestions(query){
  const raw=String(query||'').trim();
  if(!raw)return [];
  const keyword=normalizeBattleMoveKeyword(raw);
  return MOVES_DATA.map((move,idx)=>{
    const nameNorm=normalizeBattleMoveKeyword(move.name);
    const enNorm=normalizeBattleMoveKeyword(move.nameEn);
    let score=-1;
    if(move.name===raw||move.nameEn.toLowerCase()===raw.toLowerCase())score=0;
    else if(nameNorm.startsWith(keyword)||enNorm.startsWith(keyword))score=1;
    else if(nameNorm.includes(keyword)||enNorm.includes(keyword))score=2;
    if(score<0)return null;
    return {idx,move,score};
  }).filter(Boolean).sort((a,b)=>{
    if(a.score!==b.score)return a.score-b.score;
    return a.move.name.localeCompare(b.move.name,'zh-CN');
  }).slice(0,BATTLE_MOVE_SEARCH_LIMIT);
}

function getLearnableMoveSuggestions(query){
  const p=battleEditTeam?.pokemon[battleEditSlot];
  const learnableEn=p?.learnableMovesEn;
  if(!learnableEn||!learnableEn.length)return null;
  // learnableEn 瀛樼殑鏄?slug锛堝 "dragon-dance"锛夛紝MOVES_DATA 涔熸湁 slug 瀛楁锛岀洿鎺ュ尮閰?
  const learnableSet=new Set(learnableEn);
  const inData=MOVES_DATA.map((move,idx)=>{
    const slug=move.slug||normalizeBattleMoveKeyword(move.nameEn);
    if(!learnableSet.has(slug))return null;
    return {idx,move,apiOnly:false};
  }).filter(Boolean);
  // learnset 閲屾湁浣?MOVES_DATA 鎵句笉鍒扮殑锛堟瀬灏戯級
  const dataSlugSet=new Set(MOVES_DATA.map(m=>m.slug||normalizeBattleMoveKeyword(m.nameEn)));
  const apiOnlyMoves=learnableEn
    .filter(slug=>!dataSlugSet.has(slug))
    .map(slug=>{
      const displayName=slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      return {idx:-1,move:{name:displayName,nameEn:slug,type:'',cat:'',power:null,pp:null},apiOnly:true};
    });
  const all=[...inData.sort((a,b)=>a.move.name.localeCompare(b.move.name,'zh-CN')),
             ...apiOnlyMoves.sort((a,b)=>a.move.nameEn.localeCompare(b.move.nameEn))];
  if(!String(query||'').trim())return all;
  const keyword=normalizeBattleMoveKeyword(query);
  return all.filter(({move})=>
    normalizeBattleMoveKeyword(move.name).includes(keyword)||
    normalizeBattleMoveKeyword(move.nameEn).includes(keyword)
  );
}

function renderBattleMoveSuggestions(moveIndex,query){
  const drop=document.getElementById(`bpkm-move${moveIndex}-drop`);
  if(!drop)return;
  const learnableItems=getLearnableMoveSuggestions(query);
  const hasLearnables=learnableItems!==null;
  const queryTrimmed=String(query||'').trim();
  let items=hasLearnables?learnableItems:getBattleMoveSuggestions(query);
  let fallback=false;
  if(hasLearnables&&queryTrimmed&&!items.length){
    items=getBattleMoveSuggestions(query);
    fallback=true;
  }
  if(!items.length){
    drop.classList.remove('open');
    drop.innerHTML='';
    if(battleMoveSearchState.activeIndex===moveIndex)battleMoveSearchState.activeIndex=null;
    return;
  }
  let header='';
  if(hasLearnables&&!queryTrimmed)header=`<div style="padding:4px 10px;font-size:.68rem;color:var(--t3);border-bottom:1px solid var(--b2)">鍏?${items.length} 涓彲瀛︽妧鑳?/div>`;
  else if(fallback)header=`<div style="padding:4px 10px;font-size:.68rem;color:var(--acc2);border-bottom:1px solid var(--b2)">鍙鎶€鑳戒腑鏃犲尮閰嶏紝鏄剧ず鍏ㄥ簱缁撴灉</div>`;
  drop.innerHTML=header+items.map(({idx,move,apiOnly})=>{
    if(apiOnly){
      return `<div class="bpkm-drop-item bpkm-move-drop-item" onclick="selectBattleMoveName(${moveIndex},'${move.nameEn.replace(/'/g,"\\'")}','${move.name.replace(/'/g,"\\'")}')">
        <div class="bpkm-move-drop-main">
          <div class="bpkm-drop-name">${esc(move.name)}</div>
          <div class="bpkm-move-drop-en" style="color:var(--t3);font-size:.65rem">鏆傛棤璇︾粏鏁版嵁</div>
        </div>
      </div>`;
    }
    const powerLabel=move.cat==='status'||!move.power?'鈥?:move.power;
    return `<div class="bpkm-drop-item bpkm-move-drop-item" onclick="selectBattleMoveSuggestion(${moveIndex},${idx})">
      <div class="bpkm-move-drop-main">
        <div class="bpkm-drop-name">${esc(move.name)}</div>
        <div class="bpkm-move-drop-en">${esc(move.nameEn)}</div>
      </div>
      <span class="coverage-type-tag type-${move.type}">${TYPE_ZH[move.type]||move.type}</span>
      <span class="bpkm-move-drop-meta">${B_MOVE_CATS_ZH[move.cat]||move.cat}</span>
      <span class="bpkm-move-drop-power">${powerLabel}</span>
    </div>`;
  }).join('');
  closeBattleMoveSuggestions(moveIndex);
  drop.classList.add('open');
  battleMoveSearchState.activeIndex=moveIndex;
}

function closeBattleMoveSuggestions(keepIndex=null){
  [1,2,3,4].forEach(i=>{
    if(i===keepIndex)return;
    const drop=document.getElementById(`bpkm-move${i}-drop`);
    if(!drop)return;
    drop.classList.remove('open');
    if(keepIndex===null)drop.innerHTML='';
  });
  if(keepIndex===null)battleMoveSearchState.activeIndex=null;
}

function onBattleMoveNameInput(moveIndex,query){
  const hasLearnables=(battleEditTeam?.pokemon[battleEditSlot]?.learnableMovesEn||[]).length>0;
  if(!String(query||'').trim()){
    if(hasLearnables){
      renderBattleMoveSuggestions(moveIndex,'');
    } else {
      const drop=document.getElementById(`bpkm-move${moveIndex}-drop`);
      if(drop){drop.classList.remove('open');drop.innerHTML='';}
      if(battleMoveSearchState.activeIndex===moveIndex)battleMoveSearchState.activeIndex=null;
    }
    return;
  }
  renderBattleMoveSuggestions(moveIndex,query);
}

function selectBattleMoveSuggestion(moveIndex,dataIndex){
  const move=MOVES_DATA[dataIndex];
  if(!move)return;
  const nameInput=document.getElementById(`bpkm-move${moveIndex}-name`);
  const typeInput=document.getElementById(`bpkm-move${moveIndex}-type`);
  const catInput=document.getElementById(`bpkm-move${moveIndex}-cat`);
  const powerInput=document.getElementById(`bpkm-move${moveIndex}-power`);
  const apInput=document.getElementById(`bpkm-move${moveIndex}-pp`);
  if(nameInput)nameInput.value=move.name;
  if(typeInput)typeInput.value=move.type||'';
  if(catInput)catInput.value=move.cat||'';
  if(powerInput)powerInput.value=move.cat==='status'||!move.power?'':move.power;
  if(apInput && move.pp)apInput.value=move.pp;
  closeBattleMoveSuggestions();
}

function selectBattleMoveName(moveIndex,moveNameEn,moveDisplay){
  const nameInput=document.getElementById(`bpkm-move${moveIndex}-name`);
  if(nameInput)nameInput.value=moveDisplay||moveNameEn;
  closeBattleMoveSuggestions();
}

function onBpkmSearch(q){
  clearTimeout(battleSrchT);
  const drop=document.getElementById('bpkm-search-drop');
  if(!q||q.length<1){drop.classList.remove('open');return;}
  battleSrchT=setTimeout(async()=>{
    drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">鎼滅储涓€?/div>';
    drop.classList.add('open');
    try{
      // 鍏堜粠 Pokemon Champions 鏁版嵁鎼滅储涓枃鍚?
      let results=PKM_LIST.filter(p=>p.name.includes(q)).slice(0,8).map(p=>({id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}));
      // 缂栧彿鎼滅储
      if(!results.length&&/^\d+$/.test(q)){
        const p=PKM_PC_BY_NUM[parseInt(q)];
        results=p?[{id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}]:[{id:parseInt(q),cnName:PKM_CN_TABLE[parseInt(q)]||null,slug:'',spriteUrl:''}];
      }
      // 鑻辨枃/PokeAPI 鎼滅储鍏滃簳锛堣烦杩囦腑鏂囥€佹嫾闊虫拠鍙风瓑鏃犳晥鏌ヨ锛?
      if(!results.length&&!/[\u4e00-\u9fff\u3040-\u30ff\u31f0-\u31ff']/.test(q)){
        const r=await fetch(`${POKEAPI}/pokemon/${encodeURIComponent(q.toLowerCase())}`);
        if(r.ok){const d=await r.json();const lp=PKM_PC_BY_SLUG[q.toLowerCase()]||PKM_PC_BY_NUM[d.id];results=[{id:d.id,cnName:lp?.name||PKM_CN_TABLE[d.id]||d.name,slug:lp?.slug||'',spriteUrl:lp?.spriteUrl||d.sprites?.front_default||''}];}
      }
      if(!results.length){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">鏈壘鍒?/div>';return;}
      drop.innerHTML=results.map(r=>{
        const sprite=getSearchSprite(r);
        return`<div class="bpkm-drop-item" onclick="selectBpkmFromDrop(${r.id},'${esc(r.cnName||'')}','${r.slug||''}')">
          <img src="${sprite}" alt="" onerror="this.style.display='none'">
          <div class="bpkm-drop-name">${esc(r.cnName||'')}</div>
          <div class="bpkm-drop-num">#${r.id}</div>
        </div>`;
      }).join('');
    } catch(e){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">鎼滅储鍑洪敊</div>';}
  },300);
}

async function selectBpkmFromDrop(pkmId, cnName, slug=''){
  const drop=document.getElementById('bpkm-search-drop');
  drop.classList.remove('open');
  const inp=document.getElementById('bpkm-name-inp');
  if(inp)inp.value=cnName;
  battleEditTeam.pokemon[battleEditSlot].name=cnName;

  // 浼樺厛浣跨敤鏈湴 PKM_CHAMPIONS_DATA锛屾棤闇€ API 璋冪敤
  const localPkm=PKM_PC_BY_SLUG[slug]||PKM_PC_BY_NUM[pkmId];

  const applyPkmData=(t1,t2,stats,abilities,learnableSlugs,spriteUrl)=>{
    const s1=document.getElementById('bpkm-type1');
    const s2=document.getElementById('bpkm-type2');
    if(s1)s1.value=t1;
    if(s2)s2.value=t2||'';
    battleEditTeam.pokemon[battleEditSlot].type1=t1;
    battleEditTeam.pokemon[battleEditSlot].type2=t2;
    battleEditTeam.pokemon[battleEditSlot].base=stats;
    STAT_KEYS_B.forEach(k=>{
      const el=document.getElementById(`bpkm-base-${k}`);
      if(el&&stats[k])el.value=stats[k];
    });
    battleEditTeam.pokemon[battleEditSlot].abilities=abilities;
    const chipsEl=document.getElementById('bpkm-ability-chips');
    if(chipsEl){
      const curAbility=document.getElementById('bpkm-ability')?.value||'';
      chipsEl.innerHTML=abilities.map(a=>`<span class="bpkm-ability-chip${curAbility===a?' active':''}" onclick="selectBpkmAbility('${esc(a)}')">${esc(a)}</span>`).join('');
    }
    battleEditTeam.pokemon[battleEditSlot].learnableMovesEn=learnableSlugs;
    [1,2,3,4].forEach(i=>{ const inp=document.getElementById(`bpkm-move${i}-name`); if(inp)inp.placeholder='鐐瑰嚮閫夋嫨鍙鎶€鑳解€?; });
    const url=spriteUrl||`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmId}.png`;
    battleEditSpriteCache[battleEditSlot]=url;
    battleEditTeam.pokemon[battleEditSlot]._spriteUrl=url;
    let prev=document.querySelector('.bpkm-preview');
    if(!prev){
      const wrap=document.getElementById('bpkm-name-inp').parentElement;
      const d2=document.createElement('div');
      d2.className='bpkm-preview';d2.id='bpkm-preview-wrap';
      wrap.parentElement.insertBefore(d2,wrap.nextSibling);
      prev=d2;
    }
    prev.innerHTML=`<img src="${esc(url)}" alt="" id="bpkm-sprite" onerror="this.style.display='none'">
      <div>
        <div class="bpkm-preview-name">${esc(cnName)}</div>
        <div class="bpkm-preview-types">${t1?`<span class="coverage-type-tag type-${t1}">${TYPE_ZH[t1]||t1}</span>`:''}${t2?`<span class="coverage-type-tag type-${t2}">${TYPE_ZH[t2]||t2}</span>`:''}</div>
      </div>`;
    onBpkmStatChange();
  };

  if(localPkm){
    // 鏈湴鏁版嵁鐩存帴浣跨敤锛屾棤闇€缃戠粶璇锋眰
    applyPkmData(
      localPkm.types[0]||'', localPkm.types[1]||'',
      localPkm.stats||{}, localPkm.abilities||[],
      localPkm.learnset||[], localPkm.spriteUrl||''
    );
    // 褰㈡€侊細PKM_CHAMPIONS_DATA 涓悓涓€瀹濆彲姊︾殑涓嶅悓褰㈡€佺洿鎺ュ垪鍑?
    const baseName=localPkm.slug.replace(/^mega-/,'').replace(/-(mega|alolan|galarian|hisuian|paldean|x|y)$/,'');
    const varieties=PKM_LIST
      .filter(p=>p.slug===localPkm.slug||p.slug.startsWith(baseName+'-')||p.slug===baseName)
      .map(p=>({is_default:p.slug===baseName||p.slug===localPkm.slug,pokemon:{name:p.slug}}));
    if(varieties.length>1){
      const p2=battleEditTeam.pokemon[battleEditSlot];
      p2.varieties=varieties;
      renderBpkmFormChips(p2, cnName);
    }
  } else {
    // PokeAPI 鍏滃簳锛堥潪 Champions 瀹濆彲姊︼級
    try{
      const r=await fetch(`${POKEAPI}/pokemon/${pkmId}`);
      if(r.ok){
        const d=await r.json();
        const stats={};
        d.stats.forEach(s=>{
          const k={'hp':'hp','attack':'atk','defense':'def','special-attack':'spa','special-defense':'spd','speed':'spe'}[s.stat.name];
          if(k)stats[k]=s.base_stat;
        });
        applyPkmData(
          d.types[0]?.type?.name||'', d.types[1]?.type?.name||'',
          stats, d.abilities.map(a=>a.ability.name),
          (d.moves||[]).map(m=>m.move.name),
          d.sprites.front_default||''
        );
        loadPkmForms(pkmId, d.name, cnName);
      }
    } catch(e){console.warn(e);}
  }
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 瀹濆彲姊﹀舰鎬?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function getFormDisplayName(baseName,varietyName){
  if(!varietyName||varietyName===baseName)return '鏍囧噯';
  const suffix=varietyName.startsWith(baseName+'-')?varietyName.slice(baseName.length+1):varietyName;
  if(FORM_SUFFIX_ZH[suffix])return FORM_SUFFIX_ZH[suffix];
  const parts=suffix.split('-');
  for(let i=parts.length;i>0;i--){
    const key=parts.slice(0,i).join('-');
    if(FORM_SUFFIX_ZH[key])return FORM_SUFFIX_ZH[key]+(parts.slice(i).length?' '+parts.slice(i).join(' '):'');
  }
  return suffix.replace(/-/g,' ');
}

async function loadPkmForms(pkmId,baseName,cnName){
  try{
    const sr=await fetch(`${POKEAPI}/pokemon-species/${pkmId}`);
    if(!sr.ok)return;
    const species=await sr.json();
    const varieties=species.varieties||[];
    if(varieties.length<=1)return;
    const forms=varieties.map(v=>({name:v.pokemon.name,displayName:getFormDisplayName(baseName,v.pokemon.name),isDefault:v.is_default}));
    const p=battleEditTeam?.pokemon[battleEditSlot];
    if(!p)return;
    p.varieties=forms;
    p.currentVariety=baseName;
    p.basePkmName=baseName;
    renderBpkmFormChips();
  }catch(e){console.warn('loadPkmForms error',e);}
}

function renderBpkmFormChips(){
  const p=battleEditTeam?.pokemon[battleEditSlot];
  if(!p||(p.varieties||[]).length<=1)return;
  let el=document.getElementById('bpkm-form-chips');
  if(!el){
    el=document.createElement('div');
    el.id='bpkm-form-chips';
    el.className='bpkm-form-chips';
    const prev=document.getElementById('bpkm-preview-wrap')||document.querySelector('.bpkm-preview');
    if(!prev)return;
    prev.insertAdjacentElement('afterend',el);
  }
  el.innerHTML=p.varieties.map(v=>`<button class="bpkm-form-chip${v.name===(p.currentVariety||p.basePkmName)?' active':''}" onclick="selectBpkmForm('${esc(v.name)}')">${esc(v.displayName)}</button>`).join('');
}

async function selectBpkmForm(varietyName){
  if(!battleEditTeam)return;
  const p=battleEditTeam.pokemon[battleEditSlot];
  if(!p)return;
  try{
    const r=await fetch(`${POKEAPI}/pokemon/${varietyName}`);
    if(!r.ok)return;
    const d=await r.json();
    const spriteUrl=d.sprites.front_default||'';
    battleEditSpriteCache[battleEditSlot]=spriteUrl;
    p._spriteUrl=spriteUrl;
    const spriteEl=document.getElementById('bpkm-sprite');
    if(spriteEl&&spriteUrl)spriteEl.src=spriteUrl;
    const t1=d.types[0]?.type?.name||'';
    const t2=d.types[1]?.type?.name||'';
    p.type1=t1;p.type2=t2;
    const s1=document.getElementById('bpkm-type1');
    const s2=document.getElementById('bpkm-type2');
    if(s1)s1.value=t1;if(s2)s2.value=t2||'';
    const stats={};
    d.stats.forEach(s=>{
      const k={'hp':'hp','attack':'atk','defense':'def','special-attack':'spa','special-defense':'spd','speed':'spe'}[s.stat.name];
      if(k)stats[k]=s.base_stat;
    });
    p.base=stats;
    STAT_KEYS_B.forEach(k=>{const el=document.getElementById(`bpkm-base-${k}`);if(el&&stats[k]!==undefined)el.value=stats[k];});
    const abilities=d.abilities.map(a=>a.ability.name);
    p.abilities=abilities;
    const abChips=document.getElementById('bpkm-ability-chips');
    if(abChips){
      const cur=document.getElementById('bpkm-ability')?.value||'';
      abChips.innerHTML=abilities.map(a=>`<span class="bpkm-ability-chip${cur===a?' active':''}" onclick="selectBpkmAbility('${esc(a)}')">${esc(a)}</span>`).join('');
    }
    const typesEl=document.getElementById('bpkm-preview-types');
    if(typesEl)typesEl.innerHTML=(t1?`<span class="coverage-type-tag type-${t1}">${TYPE_ZH[t1]||t1}</span>`:'')+
      (t2?`<span class="coverage-type-tag type-${t2}">${TYPE_ZH[t2]||t2}</span>`:'');
    p.currentVariety=varietyName;
    renderBpkmFormChips();
    onBpkmStatChange();
  }catch(e){console.warn('selectBpkmForm error',e);}
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鑳藉姏鍊煎疄鏃惰绠?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function onBpkmStatChange(){
  const level=parseInt(document.getElementById('bpkm-level')?.value)||50;
  const nat=document.getElementById('bpkm-nature')?.value||'';
  STAT_KEYS_B.forEach(k=>{
    const base=parseInt(document.getElementById(`bpkm-base-${k}`)?.value)||0;
    const iv=parseInt(document.getElementById(`bpkm-iv-${k}`)?.value)??31;
    const ev=parseInt(document.getElementById(`bpkm-ev-${k}`)?.value)||0;
    const val=calcActualStatVal(base,iv,ev,nat,k,level);
    const el=document.getElementById(`bpkm-calc-${k}`);
    if(el)el.textContent=val||'鈥?;
  });
}
function onBpkmEvChange(){onBpkmStatChange();updateEvTotal();}
function updateEvTotal(){
  let total=0;
  STAT_KEYS_B.forEach(k=>{total+=parseInt(document.getElementById(`bpkm-ev-${k}`)?.value)||0;});
  const el=document.getElementById('bpkm-ev-total-lbl');
  if(!el)return;
  el.textContent=`${total}/66`;
  el.style.color=total>66?'var(--danger)':total===66?'var(--acc2)':'var(--t3)';
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鑳藉姏鍊煎叕寮忥紙Champions锛欼V鍥哄畾31锛孍V鈫扴P 0-32锛宻pBonus=2sp-1锛?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function calcActualStatVal(base,_iv,sp,nature,statKey,level=50){
  if(!base&&base!==0)return 0;
  const iv=31;
  sp=Math.max(0,Math.min(32,parseInt(sp)||0));
  base=parseInt(base)||0;
  level=parseInt(level)||50;
  const spBonus=sp>0?2*sp-1:0;
  let val;
  if(statKey==='hp'){
    val=Math.floor((2*base+iv+spBonus)*level/100)+level+10;
  } else {
    val=Math.floor((Math.floor((2*base+iv+spBonus)*level/100)+5)*(NATURES_ZH[nature]?.[STAT_KEYS_B.indexOf(statKey)]||1));
  }
  return val;
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鏀堕泦琛ㄥ崟鏁版嵁 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function gatherSlotForm(){
  if(!battleEditTeam)return;
  const p={};
  p.name=document.getElementById('bpkm-name-inp')?.value.trim()||battleEditTeam.pokemon[battleEditSlot]?.name||'';
  p.type1=document.getElementById('bpkm-type1')?.value||battleEditTeam.pokemon[battleEditSlot]?.type1||'';
  p.type2=document.getElementById('bpkm-type2')?.value||battleEditTeam.pokemon[battleEditSlot]?.type2||'';
  p.ability=document.getElementById('bpkm-ability')?.value.trim()||'';
  p.item=document.getElementById('bpkm-item')?.value.trim()||'';
  p.nature=document.getElementById('bpkm-nature')?.value||'';
  p.level=parseInt(document.getElementById('bpkm-level')?.value)||50;
  p.notes=document.getElementById('bpkm-notes')?.value||'';
  p._spriteUrl=battleEditSpriteCache[battleEditSlot]||battleEditTeam.pokemon[battleEditSlot]?._spriteUrl||'';
  // 绉嶆棌/涓綋/鍔姏鍊?
  p.base={};p.iv={};p.ev={};
  STAT_KEYS_B.forEach(k=>{
    p.base[k]=parseInt(document.getElementById(`bpkm-base-${k}`)?.value)||0;
    p.iv[k]=31;
    p.ev[k]=Math.min(32,parseInt(document.getElementById(`bpkm-ev-${k}`)?.value)||0);
  });
  // 鎶€鑳?
  [1,2,3,4].forEach(i=>{
    p[`move${i}`]={
      name:document.getElementById(`bpkm-move${i}-name`)?.value.trim()||'',
      type:document.getElementById(`bpkm-move${i}-type`)?.value||'',
      cat:document.getElementById(`bpkm-move${i}-cat`)?.value||'',
      power:parseInt(document.getElementById(`bpkm-move${i}-power`)?.value)||0,
      pp:parseInt(document.getElementById(`bpkm-move${i}-pp`)?.value)||null,
    };
  });
  p.abilities=battleEditTeam.pokemon[battleEditSlot]?.abilities||[];
  battleEditTeam.pokemon[battleEditSlot]=p;
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鐗规€ч€夋嫨 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function selectBpkmAbility(name){
  const inp=document.getElementById('bpkm-ability');
  if(inp)inp.value=name;
  document.querySelectorAll('.bpkm-ability-chip').forEach(c=>c.classList.toggle('active',c.textContent===name));
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 閬撳叿鎼滅储涓嬫媺 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const ITEM_CAT_ZH={hold:'鎼哄甫閬撳叿', mega:'瓒呯骇杩涘寲鐭?, berry:'鏍戞灉'};
function onBpkmItemInput(){
  const inp=document.getElementById('bpkm-item');
  const drop=document.getElementById('bpkm-item-drop');
  if(!inp||!drop)return;
  const query=(inp.value||'').trim().toLowerCase();
  // 杩囨护锛氫腑鏂囧悕/鑻辨枃鍚?slug 鍧囧彲妫€绱?
  let results=ITEMS_DATA.filter(it=>
    it.name.includes(query)||
    it.nameEn.toLowerCase().includes(query)||
    it.slug.includes(query)
  );
  if(!query){
    // 鏃犺緭鍏ユ椂锛氫紭鍏堝睍绀烘惡甯﹂亾鍏凤紝鍐嶈秴杩涘寲鐭筹紝鍐嶆爲鏋滐紙鏈€澶?0鏉★級
    const order={hold:0,mega:1,berry:2};
    results=[...results].sort((a,b)=>order[a.category]-order[b.category]).slice(0,30);
  } else {
    results=results.slice(0,20);
  }
  if(!results.length){drop.style.display='none';return;}
  // 鎸夌被鍒垎缁勬覆鏌?
  let lastCat='';
  const html=results.map(it=>{
    let header='';
    if(it.category!==lastCat){
      lastCat=it.category;
      header=`<div class="bpkm-item-drop-cat">${ITEM_CAT_ZH[it.category]||it.category}</div>`;
    }
    return header+`<div class="bpkm-drop-item bpkm-item-drop-item" onclick="selectBpkmItem('${esc(it.name)}')">
      <span class="bpkm-item-name">${esc(it.name)}</span>
      <span class="bpkm-item-en">${esc(it.nameEn)}</span>
      <span class="bpkm-item-eff">${esc(it.effect)}</span>
    </div>`;
  }).join('');
  drop.innerHTML=html;
  drop.style.display='block';
}
function selectBpkmItem(name){
  const inp=document.getElementById('bpkm-item');
  if(inp){inp.value=name;}
  hideBpkmItemDrop();
}
function hideBpkmItemDrop(){
  const drop=document.getElementById('bpkm-item-drop');
  if(drop)drop.style.display='none';
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 淇濆瓨闃熶紞 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
async function saveBattleTeam(){
  if(!battleEditTeam)return;
  try{
    gatherSlotForm();
    battleEditTeam.team_name=document.getElementById('battle-team-name-inp').value.trim()||'鎴戠殑闃熶紞';
    battleEditTeam.updated_at=new Date().toISOString();
    const prevId=battleEditTeam.id||`local_${Date.now()}`;
    battleEditTeam.id=prevId;
    const existing=battleTeams.findIndex(t=>t.id===battleEditTeam.id);
    if(existing>=0){battleTeams[existing]=battleEditTeam;}else{battleTeams.unshift(battleEditTeam);}
    const newId=await saveBattleTeamToServer(battleEditTeam);
    if(newId&&newId!==prevId){
      if(battleEditTeam)battleEditTeam.id=newId;
      const idx=battleTeams.findIndex(t=>t.id===prevId);
      if(idx>=0)battleTeams[idx].id=newId;
    }
    renderTeamList();
    if (window._battleDoublesInited) { renderDTeamList(); renderDTeamSel(); }
    renderBattleTeamSel();
    closeBattleTeamEdit();
    showToast('闃熶紞宸蹭繚瀛?鉁?);
  }catch(e){
    console.error('saveBattleTeam error',e);
    showToast('淇濆瓨澶辫触锛岃閲嶈瘯');
  }
}

async function confirmDeleteBattleTeam(id){
  if(!confirm('纭畾瑕佸垹闄よ繖鏀槦浼嶅悧锛?))return;
  try{
    await deleteBattleTeamFromServer(id);
    battleTeams=battleTeams.filter(t=>t.id!==id);
    try{localStorage.setItem('battle_teams',JSON.stringify(battleTeams));}catch{}
    renderTeamList();
    if (window._battleDoublesInited) { renderDTeamList(); renderDTeamSel(); }
    renderBattleTeamSel();
    showToast('宸插垹闄?);
  }catch(e){
    console.error('confirmDeleteBattleTeam error',e);
    showToast('鍒犻櫎澶辫触锛岃閲嶈瘯');
  }
}

async function deleteBattleTeamFromModal(){
  if(!battleEditTeam)return;
  if(!confirm('纭畾瑕佸垹闄よ繖鏀槦浼嶅悧锛?))return;
  try{
    await deleteBattleTeamFromServer(battleEditTeam.id);
    battleTeams=battleTeams.filter(t=>t.id!==battleEditTeam.id);
    try{localStorage.setItem('battle_teams',JSON.stringify(battleTeams));}catch{}
    renderTeamList();
    if (window._battleDoublesInited) { renderDTeamList(); renderDTeamSel(); }
    renderBattleTeamSel();
    closeBattleTeamEdit();
    showToast('宸插垹闄?);
  }catch(e){
    console.error('deleteBattleTeamFromModal error',e);
    showToast('鍒犻櫎澶辫触锛岃閲嶈瘯');
  }
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 璧涘墠鍒嗘瀽 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
const boppSearchTimers={};

// 鎼滅储缁撴灉鍥剧墖锛氫紭鍏堢敤鏁版嵁閲岀殑 spriteUrl锛岃秴绾у舰鎬佹病鍥炬椂鐢ㄥ熀纭€褰㈡€佸浘锛屽厹搴曠敤 PokeAPI 鍏ㄥ浗鍥鹃壌缂栧彿
function getSearchSprite(r){
  if(r.spriteUrl) return r.spriteUrl;
  // mega / regional 褰㈡€侊細鎵惧熀纭€褰㈡€?
  if(r.slug){
    const base=r.slug.replace(/^mega-/,'').replace(/-(hisui|alolan|galarian|paldean|heat|wash|frost|fan|mow|x|y)$/,'');
    if(base!==r.slug){
      const bp=PKM_PC_BY_SLUG[base];
      if(bp?.spriteUrl) return bp.spriteUrl;
    }
  }
  return '';
}
const boppComposing={};

function renderBattleOppSlots(){
  const el=document.getElementById('battle-opp-slots');
  if(!el)return;
  const typeOpts=B_TYPES.map(t=>`<option value="${t}">${TYPE_ZH[t]||t}</option>`).join('');
  el.innerHTML=[0,1,2,3,4,5].map(i=>`
    <div class="battle-opp-row">
      <span class="battle-opp-num">${i+1}</span>
      <div class="battle-opp-inp-wrap">
        <input class="battle-opp-inp" id="bopp-name-${i}" placeholder="鎼滅储瀹濆彲姊︹€?
          oninput="if(!boppComposing[${i}])onOppNameInput(${i},this.value)"
          oncompositionstart="boppComposing[${i}]=true"
          oncompositionend="boppComposing[${i}]=false;onOppNameInput(${i},this.value)"
          onblur="setTimeout(()=>closeBoppDrop(${i}),350)" autocomplete="off">
        <div class="bpkm-search-drop" id="bopp-drop-${i}"></div>
      </div>
      <select class="battle-opp-type-sel" id="bopp-t1-${i}" title="灞炴€?">
        <option value="">灞炴€?</option>${typeOpts}
      </select>
      <select class="battle-opp-type-sel" id="bopp-t2-${i}" title="灞炴€?锛堝彲閫夛級">
        <option value="">灞炴€?</option>${typeOpts}
      </select>
    </div>`).join('');
}

function closeBoppDrop(i){
  const d=document.getElementById(`bopp-drop-${i}`);
  if(d){d.classList.remove('open');d.innerHTML='';}
}

function onOppNameInput(i,q){
  clearTimeout(boppSearchTimers[i]);
  const drop=document.getElementById(`bopp-drop-${i}`);
  if(!drop)return;
  if(!q||q.length<1){drop.classList.remove('open');drop.innerHTML='';return;}
  drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">鎼滅储涓€?/div>';
  drop.classList.add('open');
  boppSearchTimers[i]=setTimeout(async()=>{
    try{
      let results=PKM_LIST.filter(p=>p.name.includes(q)).slice(0,8).map(p=>({id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}));
      if(!results.length&&/^\d+$/.test(q)){const p=PKM_PC_BY_NUM[parseInt(q)];results=p?[{id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}]:[];}
      if(!results.length&&!/[\u4e00-\u9fff\u3040-\u30ff\u31f0-\u31ff']/.test(q)){
        const r=await fetch(`${POKEAPI}/pokemon/${encodeURIComponent(q.toLowerCase())}`);
        if(r.ok){const d=await r.json();const lp=PKM_PC_BY_SLUG[q.toLowerCase()]||PKM_PC_BY_NUM[d.id];results=[{id:d.id,cnName:lp?.name||PKM_CN_TABLE[d.id]||d.name,slug:lp?.slug||'',spriteUrl:lp?.spriteUrl||d.sprites?.front_default||''}];}
      }
      if(!results.length){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">鏈壘鍒?/div>';return;}
      drop.innerHTML=results.map(r=>{
        const sprite=getSearchSprite(r);
        return`<div class="bpkm-drop-item" onclick="selectOppPkmFromDrop(${i},${r.id},'${esc(r.cnName||'')}','${r.slug||''}')">
          <img src="${sprite}" alt="" onerror="this.style.display='none'">
          <div class="bpkm-drop-name">${esc(r.cnName||'')}</div>
          <div class="bpkm-drop-num">#${r.id}</div>
        </div>`;
      }).join('');
    } catch(e){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">鎼滅储鍑洪敊</div>';}
  },300);
}

function selectOppPkmFromDrop(i,pkmId,cnName,slug=''){
  closeBoppDrop(i);
  const inp=document.getElementById(`bopp-name-${i}`);
  if(inp)inp.value=cnName;
  const localPkm=PKM_PC_BY_SLUG[slug]||PKM_PC_BY_NUM[pkmId];
  if(localPkm){
    const t1=localPkm.types[0]||'';
    const t2=localPkm.types[1]||'';
    const s1=document.getElementById(`bopp-t1-${i}`);
    const s2=document.getElementById(`bopp-t2-${i}`);
    if(s1)s1.value=t1;
    if(s2)s2.value=t2;
    const builds=window.PKM_CHAMPIONS_BUILDS?.[slug]||null;
    battleOppPkm[i]={
      name:cnName,type1:t1,type2:t2,slug,
      predictedMoves: builds?.moves||[],
      predictedItem:  builds?.item||null,
      predictedAbility: builds?.ability||null,
      predictedTeammates: builds?.teammates||[],
    };
  } else {
    // fallback for non-Champions Pokemon
    fetch(`${POKEAPI}/pokemon/${pkmId}`).then(r=>r.ok?r.json():null).then(d=>{
      if(!d)return;
      const t1=d.types[0]?.type?.name||'';
      const t2=d.types[1]?.type?.name||'';
      const s1=document.getElementById(`bopp-t1-${i}`);
      const s2=document.getElementById(`bopp-t2-${i}`);
      if(s1)s1.value=t1;
      if(s2)s2.value=t2;
      battleOppPkm[i]={name:cnName,type1:t1,type2:t2};
    }).catch(()=>{});
  }
}

function onMyTeamSelect(teamId){
  battleMyTeamId=teamId;
  const team=battleTeams.find(t=>t.id===teamId);
  const preview=document.getElementById('battle-my-preview');
  if(!team||!preview)return;
  const pkm=Array.isArray(team.pokemon)?team.pokemon.filter(p=>p.name):[];
  preview.innerHTML=pkm.map(p=>{
    const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">`:' ';
    return`<div class="battle-my-pkm-chip">${img}${esc(p.name)}</div>`;
  }).join('');
}

/* 鈹€鈹€ 灞炴€х浉鍏嬭绠?鈹€鈹€ */
function getTypeEff(atkType, defType1, defType2){
  const ai=B_TYPE_IDX[atkType];
  if(ai===undefined)return 1;
  const di1=B_TYPE_IDX[defType1]??-1;
  const di2=B_TYPE_IDX[defType2]??-1;
  let m=di1>=0?TYPE_EFF_MATRIX[ai][di1]:1;
  if(di2>=0)m*=TYPE_EFF_MATRIX[ai][di2];
  return m;
}

// 璁＄畻鏀诲嚮鏌愬睘鎬у闃插尽鏂癸紙鍚壒鎬у厤鐤級鐨勬湁鏁堝€嶇巼
function getTypeEffWithAbility(atkType, oppPkm, atkAbility=''){
  // 鐮存牸鐗规€э細鏃犺闃插尽鏂圭壒鎬?
  if(ABILITY_BREAKER.has(atkAbility)){
    return getTypeEff(atkType, oppPkm.type1, oppPkm.type2);
  }
  // 浣跨敤瀵规柟"鏈€鍙兘"鐨勭壒鎬э紙棣栦釜鐗规€э級鍒ゆ柇鍏嶇柅
  const defAbility=oppPkm.ability||resolveOppAbility(oppPkm);
  if((ABILITY_TYPE_IMMUNE[defAbility]||[]).includes(atkType)) return 0;
  return getTypeEff(atkType, oppPkm.type1, oppPkm.type2);
}

// 鑾峰彇鎴戞柟瀹濆彲姊︿娇鐢ㄥ叾鏈€浼樻妧鑳芥敾鍑诲鏂圭殑鏈€楂樺€嶇巼锛堝惈鐗规€т慨姝ｏ級锛涘鏂瑰睘鎬ф湭鐭ユ椂杩斿洖 null
function getBestMoveEff(myPkm, oppPkm){
  if(!oppPkm.type1&&!oppPkm.type2)return null;
  const atkAbility=myPkm.ability||'';
  const atkMod=ABILITY_ATK_MOD[atkAbility]||{};
  const moves=[myPkm.move1,myPkm.move2,myPkm.move3,myPkm.move4].filter(m=>m&&m.type&&m.type!=='status'&&m.power>0);
  if(!moves.length){
    // 鐢ㄦ湰浣撳睘鎬т及绠?
    return getTypeEffWithAbility(myPkm.type1, oppPkm, atkAbility);
  }
  return Math.max(...moves.map(m=>{
    // 灞炴€ц浆鎹㈢壒鎬э紙鍍忕礌绮剧伒绛夛級
    const {type:moveType}=getMoveTypeWithAbility(myPkm, m);
    return getTypeEffWithAbility(moveType, oppPkm, atkAbility);
  }));
}

// 瀵规柟鏀诲嚮鎴戞柟鐨勬渶楂樺€嶇巼锛堝惈鎴戞柟鐗规€у厤鐤級
function getOppBestEff(oppPkm, myPkm){
  const myAbility=myPkm.ability||'';
  const myImmune=ABILITY_TYPE_IMMUNE[myAbility]||[];
  const getEff=(atkType)=>{
    if(!atkType)return 0;
    if(myImmune.includes(atkType))return 0;
    return getTypeEff(atkType, myPkm.type1, myPkm.type2);
  };
  const att1=getEff(oppPkm.type1);
  const att2=oppPkm.type2?getEff(oppPkm.type2):0;
  return Math.max(att1, att2, 0.25);
}

/* 鈹€鈹€ Champions 浼ゅ浼扮畻 鈹€鈹€
 * 鍏紡鍙傝€冩爣鍑?Lv.50 鏍兼枟锛?
 *   Damage = Floor( Floor((2*Lv/5+2) * Pwr * A/D / 50) + 2 ) * modifiers
 * Champions AP淇锛歛p1鈫捗?.6, ap2鈫捗?.85, ap3鈫捗?.0, ap4鈫捗?.25, ap5鈫捗?.55
 * 鎸佹湁閬撳叿淇锛堢畝鍖栵級锛氳绌剁郴鈫捗?.5, 鐢熷懡鐞冣啋脳1.3
 */
// AP_MOD removed 鈥?Champions uses PP, not AP action points
// 鍏煎鏃ф牸寮忥紙鍏ㄥ眬鍊嶇巼锛夛紝浼樺厛鐢?calcItemDamageMul
const ITEM_MOD={'璁茬┒澶村甫':1.5,'璁茬┒鐪奸暅':1.5,'璁茬┒鍥村肪':1.5,'鐢熷懡鐞?:1.3,'鐏劙瀹濈彔':1.2,'寮哄寲閬撳叿':1.1};
// 璁＄畻鎸佹湁閬撳叿瀵逛激瀹崇殑鍊嶇巼锛堟敮鎸佸睘鎬ч檺瀹?鐗╃悊鐗规畩闄愬畾锛?
function calcItemDamageMul(itemName, moveType, moveCat){
  if(!itemName)return 1.0;
  // 浼樺厛浠?ITEMS_DATA 鏌?
  const it=ITEMS_BY_NAME[itemName];
  if(it?.damageMul){
    const m=it.damageMul;
    if(m.typeMul && m.typeMul[moveType]) return m.typeMul[moveType];
    if(m.globalMul) return m.globalMul;
    if(m.physMul && moveCat==='physical') return m.physMul;
    if(m.specMul && moveCat==='special')  return m.specMul;
    return 1.0;
  }
  // 鍥為€€鏃?ITEM_MOD锛堣绌跺ご甯︽寜鐗╃悊/鐗规畩鍒嗙被锛?
  if(itemName==='璁茬┒澶村甫'  && moveCat==='physical') return 1.5;
  if(itemName==='璁茬┒鐪奸暅'  && moveCat==='special')  return 1.5;
  if(itemName==='璁茬┒鍥村肪')  return 1.0; // 浠呭姞閫燂紝涓嶅姞浼ゅ
  return ITEM_MOD[itemName]||1.0;
}

function calcDamageEst(myPkm, oppPkm, move, activeWeather=''){
  if(!move||!move.power||move.cat==='status')return null;
  const level=myPkm.level||50;
  const isPhys=move.cat==='physical';
  const atkAbility=myPkm.ability||'';
  const defAbility=oppPkm.ability||resolveOppAbility(oppPkm);
  const atkMod=ABILITY_ATK_MOD[atkAbility]||{};

  // 鈹€鈹€ 鏀婚槻鑳藉姏鍊?鈹€鈹€
  let rawAtk=isPhys
    ?calcActualStatVal(myPkm.base?.atk||70,31,myPkm.ev?.atk||0,myPkm.nature,'atk',level)
    :calcActualStatVal(myPkm.base?.spa||70,31,myPkm.ev?.spa||0,myPkm.nature,'spa',level);
  // C绫伙細鏀诲嚮鑳藉姏鍊煎€嶇巼锛堝ぇ鍔涘＋/绾姏/娲绘臣锛?
  if(atkMod.atkStatMul && isPhys) rawAtk=Math.floor(rawAtk*atkMod.atkStatMul);
  if(atkMod.atkStatMul && !isPhys) rawAtk=Math.floor(rawAtk*atkMod.atkStatMul); // pure-power only phys, but simplify

  let defStat=isPhys
    ?calcActualStatVal(oppPkm.base?.def||70,15,0,'','def',level)
    :calcActualStatVal(oppPkm.base?.spd||70,15,0,'','spd',level);
  // B绫伙細姣涚毊澶ц。鈫掔墿鐞嗛槻寰∶?锛堢瓑鏁堜激瀹趁?.5锛?
  const defMod=ABILITY_DEF_MOD[defAbility];
  if(defMod?.physMul && isPhys) defStat=Math.floor(defStat/defMod.physMul);

  const oppHp=calcActualStatVal(oppPkm.base?.hp||70,15,0,'','hp',level);

  // 鈹€鈹€ 鎶€鑳藉睘鎬э紙鍚浆鎹㈢壒鎬э級鈹€鈹€
  const {type:moveType, convertMul}=getMoveTypeWithAbility(myPkm, move);
  let pwr=move.power;

  // 鈹€鈹€ 灞炴€х浉鍏嬶紙鍚厤鐤壒鎬э級鈹€鈹€
  const typeMul=getTypeEffWithAbility(moveType, oppPkm, atkAbility);
  if(typeMul===0) return{damage:0,pct:0,typeMul:0};

  // 鈹€鈹€ B绫伙細闃插尽鐗规€у噺鍏?鈹€鈹€
  let defAbilMul=1.0;
  if(defMod){
    if(defMod.types?.includes(moveType)) defAbilMul*=defMod.mul;
    if(defMod.superEff && typeMul>=2) defAbilMul*=defMod.superEff;
  }

  // 鈹€鈹€ 瀵规柟鎸佹湁閬撳叿鐨勯槻寰′慨姝?鈹€鈹€
  const oppItemSlug=oppPkm.predictedItem?.slug||'';
  let oppItemDefMul=1.0;
  if(oppItemSlug==='assault-vest'&&!isPhys) oppItemDefMul=1/1.5;      // 绐佸嚮鑳屽績锛氱壒闃裁?.5
  else if(oppItemSlug==='eviolite')         oppItemDefMul=1/1.5;       // 杩涘寲濂囩煶锛氶槻寰＄壒闃裁?.5
  else if(oppItemSlug==='rocky-helmet'||oppItemSlug==='iron-barbs') {} // 浠呭弽浼わ紝涓嶅奖鍝嶅彈浼?
  else if(oppItemSlug==='life-orb'&&false)  {}                         // 鏀诲嚮鏂归亾鍏凤紝涓嶅湪姝ゅ鐞?

  // 鈹€鈹€ 鏀诲嚮鏂归亾鍏蜂慨姝?鈹€鈹€
  const itemMul=calcItemDamageMul(myPkm.item, moveType, move.cat);

  // 鈹€鈹€ STAB锛堝惈閫傚簲鍔?鍙樺够鑷锛夆攢鈹€
  const isStabType=(moveType===myPkm.type1||moveType===myPkm.type2);
  const hasStab=isStabType||(atkMod.alwaysStab);
  const stabMul=hasStab?(atkMod.stabMul||1.5):1.0;

  // 鈹€鈹€ C绫伙細鎶€鑳藉骞呭€嶇巼 鈹€鈹€
  const atkAbilMul=calcAtkAbilityMul(myPkm, {...move, type:moveType}, activeWeather);
  // 灞炴€ц浆鎹㈤檮鍔犲€嶇巼锛坧ixilate绛夛級
  const finalConvertMul=(atkMod.normalConvert&&move.type==='normal')?convertMul:1.0;

  const baseDmg=Math.floor((Math.floor((2*level/5+2)*pwr*rawAtk/defStat/50)+2)
    *typeMul*stabMul*itemMul*atkAbilMul*finalConvertMul*defAbilMul*oppItemDefMul);
  const dmgPct=oppHp>0?Math.round(baseDmg/oppHp*100):0;

  // G绫荤敓瀛樻爣娉?
  const surviveNote=ABILITY_SURVIVE[defAbility]||'';

  return{damage:baseDmg,pct:dmgPct,typeMul,surviveNote};
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 涓诲垎鏋愬叆鍙?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function analyzeMatchups(){
  // 鏀堕泦瀵规柟鏁版嵁锛堝惈绉嶆棌鍊硷紝鐢ㄤ簬閫熷害瀵规瘮锛?
  [0,1,2,3,4,5].forEach(i=>{
    const name=document.getElementById(`bopp-name-${i}`)?.value.trim()||'';
    const type1=document.getElementById(`bopp-t1-${i}`)?.value||'';
    const type2=document.getElementById(`bopp-t2-${i}`)?.value||'';
    const lp=name?PKM_LIST.find(p=>p.name===name):null;
    const sl=lp?.slug||battleOppPkm[i]?.slug||'';
    const builds=window.PKM_CHAMPIONS_BUILDS?.[sl]||null;
    // 淇濈暀浠庝笅鎷夐€夋嫨鏃跺凡瀛樺叆鐨?predicted 瀛楁锛屽娌℃湁鍒欎粠 builds 琛ュ厖
    const prev=battleOppPkm[i]||{};
    battleOppPkm[i]={
      name,type1,type2,base:lp?.stats||{},slug:sl,
      predictedMoves:    prev.predictedMoves    || builds?.moves    || [],
      predictedItem:     prev.predictedItem     ?? builds?.item     ?? null,
      predictedAbility:  prev.predictedAbility  ?? builds?.ability  ?? null,
      predictedTeammates:prev.predictedTeammates|| builds?.teammates|| [],
    };
  });
  const opp=battleOppPkm.filter(p=>p.name||p.type1);
  if(!opp.length){showToast('璇疯嚦灏戝～鍏ュ鏂逛竴鍙疂鍙ⅵ鐨勫睘鎬?);return;}
  const myTeam=battleTeams.find(t=>t.id===battleMyTeamId);
  if(!myTeam){showToast('璇峰厛閫夋嫨鎴戠殑闃熶紞');return;}
  const myPkm=(myTeam.pokemon||[]).filter(p=>p.name);
  if(!myPkm.length){showToast('闃熶紞涓虹┖锛岃鍏堝綍鍏ラ槦浼嶆垚鍛?);return;}
  battleAnalysisMyTeam=myTeam;

  const resultBox=document.getElementById('battle-analysis-result');
  resultBox.style.display='block';
  resultBox.innerHTML=`<div class="battle-analyzing">鍒嗘瀽涓?span class="battle-analyzing-dots"><span>.</span><span>.</span><span>.</span></span></div>`;

  setTimeout(()=>{
    try{
      const activeWeather=detectMyWeather(myPkm);
      // 鈹€鈹€ 鍗氬紙鏍稿績锛氬厛棰勬祴瀵规柟鍑烘垬3鍙紝鍐嶉拡瀵规€ф帹鑽愭垜鏂?鈹€鈹€
      const oppValid=opp.filter(op=>op.name||op.type1);
      const predResult=predictOppBestCombo(oppValid,myPkm);
      const targetOpp=predResult.combo.length>=2?predResult.combo:oppValid;
      const scored=scorePkmForBattle(myPkm,targetOpp,activeWeather);
      const matrixHtml=renderBattleMatrix(myPkm,opp);
      const coverageHtml=renderBattleCoverage(myPkm,opp);
      const dmgHtml=renderBattleDamage(myPkm,opp,activeWeather);
      const oppDmgHtml=renderOppDamage(opp,myPkm,activeWeather);
      const recHtml=renderBattleRec(scored,targetOpp);
      const weakHtml=renderTeamWeaknessWarning(scored);
      const speedHtml=renderSpeedAnalysis(scored,opp);
      const oppPredHtml=renderOppTeamPrediction(oppValid,predResult);
      const recSubtitle=targetOpp.length<oppValid.length
        ?`閽堝棰勬祴鍑烘垬闃靛锛?{targetOpp.map(op=>esc(op.name||'?')).join('銆?)}锛塦
        :'閽堝宸茬煡瀵规柟闃靛';
      resultBox.innerHTML=`
        <div class="battle-result-box">
          ${oppPredHtml?`<div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">馃敭 瀵规柟鍑烘垬棰勬祴</span><span class="battle-datasrc-note">闃熷弸鍗忓悓 30% + 鍏嬪埗鎴戞柟 70% 路 鐐瑰嚮棣栧彂鍙娴嬪悗缁?/span></div>
            ${oppPredHtml}
          </div>`:''}
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">鎺ㄨ崘鍑烘垬闃靛</span><span class="battle-datasrc-note">${recSubtitle}</span></div>
            ${recHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">鈿?闃熶紞鑴嗗急鎬ч璀?/span></div>
            ${weakHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">閫熷害妗ｄ綅</span><span class="battle-datasrc-note">浠呭熀纭€閫熷害锛涘樊鍊?lt;20鏃跺厛鍚庢墜鍙楀姫鍔涘€煎奖鍝?/span></div>
            ${speedHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">灞炴€х浉鍏嬬煩闃?/span><span class="battle-datasrc-note">琛?鎴戞柟鐢ㄦ妧鑳芥敾鍑伙紝鍒?瀵规柟闃插尽</span></div>
            ${matrixHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">鎶€鑳借鐩栧垎鏋?/span></div>
            ${coverageHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">浼ゅ浼扮畻锛堟垜鏂?鈫?瀵规柟锛?/span><span class="battle-datasrc-note">Champions Lv.50 鍏紡</span></div>
            ${dmgHtml}
          </div>
          ${oppDmgHtml?`<div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">瀵规柟鐑棬鎶€鑳?鈫?鎴戞柟浼ゅ</span><span class="battle-datasrc-note">鍩轰簬閿︽爣璧涗娇鐢ㄧ巼 top4 鎶€鑳?/span></div>
            ${oppDmgHtml}
          </div>`:''}
        </div>`;
    } catch(e){
      resultBox.innerHTML=`<div class="battle-analyzing">鍒嗘瀽鍑洪敊锛?{esc(e.message)}</div>`;
    }
  },80);
}

/* 鈹€鈹€ 鐩稿厠鐭╅樀 鈹€鈹€ */
function renderBattleMatrix(myPkm, opp){
  const effClass=m=>m>=4?'bm-x4':m>=2?'bm-x2':m>=1?'bm-x1':m>=0.5?'bm-x05':m>0?'bm-x025':'bm-x0';
  const effLabel=m=>m===0?'脳0':m===0.25?'录':m===0.5?'陆':m===1?'1':m===2?'2脳':m===4?'4脳':m+'脳';
  const cols=opp.map(p=>{
    const dot1=p.type1?`<span class="bm-type-dot" style="background:${TYPE_COLOR[p.type1]||'#888'}"></span>`:'';
    const dot2=p.type2?`<span class="bm-type-dot" style="background:${TYPE_COLOR[p.type2]||'#888'}"></span>`:'';
    return`<th>${dot1}${dot2}<br>${esc(p.name||'?')}</th>`;
  }).join('');
  const rows=myPkm.map(mp=>{
    const cells=opp.map(op=>{
      const eff=getBestMoveEff(mp,op);
      if(eff===null)return`<td class="bm-x1" style="color:var(--t3)">?</td>`;
      return`<td class="${effClass(eff)}">${effLabel(eff)}</td>`;
    }).join('');
    const dot1=mp.type1?`<span class="bm-type-dot" style="background:${TYPE_COLOR[mp.type1]||'#888'}"></span>`:'';
    return`<tr><th class="row-hdr">${dot1}${esc(mp.name)}</th>${cells}</tr>`;
  }).join('');
  return`<div class="battle-matrix-wrap"><table class="battle-matrix"><tr><th class="row-hdr">鎴戞柟 鈫?/ 瀵规柟 鈫?/th>${cols}</tr>${rows}</table></div>`;
}

/* 鈹€鈹€ 鎶€鑳借鐩?鈹€鈹€ */
function renderBattleCoverage(myPkm, opp=[]){
  const oppValid=opp.filter(op=>op.name||op.type1);
  const cards=myPkm.map(p=>{
    const moves=[p.move1,p.move2,p.move3,p.move4].filter(m=>m&&m.type&&m.cat!=='status');
    const unique=[...new Set(moves.map(m=>m.type))];
    const typeTags=unique.map(t=>`<span class="coverage-type-tag type-${t}">${TYPE_ZH[t]||t}</span>`).join('');
    const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" class="cov-sprite" alt="" onerror="this.style.display='none'">`:'';

    // 瀵规柟瑕嗙洊寰界珷锛氭瘡鍙鏂?鈫?鏈€楂樻晥鏋滃€嶇巼
    let oppBadges='';
    if(oppValid.length){
      const atkAbility=p.ability||'';
      oppBadges=oppValid.map(op=>{
        if(!op.name&&!op.type1)return'';
        const eff=getBestMoveEff(p,op);
        if(eff===null)return'';
        const oppSprite=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
        const cls=eff>=4?'cov-badge-x4':eff>=2?'cov-badge-x2':eff===1?'cov-badge-x1':eff<=0?'cov-badge-immune':'cov-badge-resist';
        const label=eff===0?'脳0':eff===0.25?'录脳':eff===0.5?'陆脳':eff===1?'1脳':eff===2?'2脳':eff===4?'4脳':`${eff}脳`;
        return`<div class="cov-opp-badge ${cls}">
          ${oppSprite?`<img src="${esc(oppSprite)}" class="cov-opp-sprite" alt="" onerror="this.style.display='none'">`:''}
          <span class="cov-badge-name">${esc(op.name||'?')}</span>
          <span class="cov-badge-eff">${label}</span>
        </div>`;
      }).filter(Boolean).join('');
    }

    return`<div class="coverage-card">
      <div class="coverage-card-name">${img}${esc(p.name)}</div>
      ${typeTags?`<div class="coverage-type-tags">${typeTags}</div>`:'<div class="coverage-type-tags" style="color:var(--t3);font-size:.66rem">鏃犳妧鑳芥暟鎹?/div>'}
      ${oppBadges?`<div class="cov-opp-row">${oppBadges}</div>`:''}
    </div>`;
  }).join('');
  return`<div class="battle-coverage-grid">${cards}</div>`;
}

/* 鈹€鈹€ 浼ゅ浼扮畻锛堢儹鍔涚煩闃碉級 鈹€鈹€ */
function renderBattleDamage(myPkm, opp, activeWeather=''){
  const oppValid=opp.filter(op=>op.name||op.type1);
  if(!oppValid.length)return`<div class="battle-analyzing">璇峰～鍐欏鏂归槦浼嶄俊鎭?/div>`;

  // 鍒楁爣棰橈紙瀵规柟瀹濆彲姊︼級
  const colHeaders=oppValid.map(op=>{
    const sprite=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
    const t1=op.type1?`<span class="bm-type-dot" style="background:${TYPE_COLOR[op.type1]||'#888'}"></span>`:'';
    const t2=op.type2?`<span class="bm-type-dot" style="background:${TYPE_COLOR[op.type2]||'#888'}"></span>`:'';
    return`<th class="bdmg-col-hdr">
      ${sprite?`<img src="${esc(sprite)}" class="bdmg-hdr-sprite" alt="" onerror="this.style.display='none'">`:'<div class="bdmg-hdr-sprite"></div>'}
      <div class="bdmg-hdr-name">${t1}${t2}${esc(op.name||'?')}</div>
    </th>`;
  }).join('');

  const tableRows=myPkm.map(mp=>{
    const mySprite=mp._spriteUrl?`<img src="${esc(mp._spriteUrl)}" class="bdmg-hdr-sprite" alt="" onerror="this.style.display='none'">`:'';
    const moves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.type&&m.cat!=='status');
    const moveTags=[...new Set(moves.map(m=>m.type))].map(t=>`<span class="coverage-type-tag type-${t}">${TYPE_ZH[t]||t}</span>`).join('');

    const cells=oppValid.map(op=>{
      if(!op.name&&!op.type1)return`<td class="bdmg-cell bdmg-unknown">鈥?/td>`;
      const dmgMoves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
      let best=null;
      dmgMoves.forEach(m=>{
        const r=calcDamageEst(mp,op,m,activeWeather);
        if(r&&(!best||r.pct>best.pct))best={...r,moveName:m.name||''};
      });
      if(!best){
        const eff=getBestMoveEff(mp,op);
        if(eff===null)return`<td class="bdmg-cell bdmg-unknown"><div class="bdmg-pct-num">?</div></td>`;
        if(eff===0)return`<td class="bdmg-cell bdmg-immune"><div class="bdmg-pct-num">鍏嶇柅</div></td>`;
        const cls=eff>=2?'bdmg-resist':'bdmg-nodata';
        return`<td class="bdmg-cell ${cls}"><div class="bdmg-pct-num">${eff>=2?'鍏嬪埗':'鈥?}</div></td>`;
      }
      const cls=best.pct>=100?'bdmg-ohko':best.pct>=50?'bdmg-2hko':best.pct>=25?'bdmg-mid':'bdmg-low';
      const koLabel=best.pct>=100?'1KO':best.pct>=50?'2KO':'';
      const barW=Math.min(best.pct,100);
      const surviveTip=best.surviveNote?` title="${esc(best.surviveNote)}"`:'' ;
      return`<td class="bdmg-cell ${cls}"${surviveTip}>
        <div class="bdmg-pct-row">
          <span class="bdmg-pct-num">${best.pct}%</span>
          ${koLabel?`<span class="bdmg-ko-badge">${koLabel}</span>`:''}
          ${best.surviveNote?`<span class="bdmg-survive-dot" title="${esc(best.surviveNote)}">鈿?/span>`:''}
        </div>
        <div class="bdmg-bar"><div class="bdmg-bar-fill" style="width:${barW}%"></div></div>
        <div class="bdmg-move-name">${esc(best.moveName)}</div>
      </td>`;
    }).join('');

    return`<tr>
      <td class="bdmg-row-hdr">
        ${mySprite}
        <div class="bdmg-row-info">
          <div class="bdmg-row-name">${esc(mp.name)}</div>
          <div class="bdmg-row-types">${moveTags||'<span style="color:var(--t3);font-size:.6rem">鏃犳妧鑳?/span>'}</div>
        </div>
      </td>
      ${cells}
    </tr>`;
  }).join('');

  return`<div class="bdmg-wrap"><table class="bdmg-table">
    <thead><tr><th class="bdmg-corner">鎴戞柟 鈫?/ 瀵规柟 鈫?/th>${colHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table></div>`;
}

/* 鈹€鈹€ 璇勫垎鏍稿績锛堜緵澶氫釜娓叉煋鍑芥暟鍏辩敤锛?鈹€鈹€ */
function scorePkmForBattle(myPkm, opp, activeWeather=''){
  const oppValid=opp.filter(op=>op.name||op.type1);
  const rawScored=myPkm.map(mp=>{
    let offScore=0, defScore=0, koScore=0;
    const reasons=[];
    const mySpd=getEffectiveSpeed(mp, activeWeather);
    oppValid.forEach(op=>{
      const eff=getBestMoveEff(mp,op);
      if(eff===null)return;
      offScore+=eff;
      if(eff>=2)reasons.push(`鍏嬪埗${op.name||op.type1}绯籤);
      const taken=getOppBestEff(op,mp);
      defScore+=taken;
      const moves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
      let bestPct=0;
      moves.forEach(m=>{const r=calcDamageEst(mp,op,m,activeWeather);if(r&&r.pct>bestPct)bestPct=r.pct;});
      // 閫熷害鍔犳潈锛氬厛鎵婳HKO浠峰€济?.5锛堢‘淇濊兘鍦ㄦ尐鎵撳墠绉掓潃锛夛紝鍚庢墜脳0.7
      const oppSpd=getEffectiveSpeed(op, activeWeather);
      const isFaster=mySpd>0&&oppSpd>0&&mySpd>oppSpd;
      const speedMul=(mySpd>0&&oppSpd>0)?(isFaster?1.5:0.7):1.0;
      if(bestPct>=100){
        koScore+=speedMul;
        reasons.push(`鍙竴鍑荤鏉€${esc(op.name||'?')}${isFaster?' 鈿″厛鎵?:oppSpd&&mySpd?' 馃悽鍚庢墜':''}`);
      } else if(bestPct>=50){
        reasons.push(`涓ゅ嚮鍙疜O${esc(op.name||'?')}`);
      }
    });
    // 鐗规€х浉鍏冲姞鍒嗭細鍏嶇柅鏌愮被鍨?
    const myAbility=mp.ability||'';
    const immuneTypes=ABILITY_TYPE_IMMUNE[myAbility]||[];
    if(immuneTypes.length) reasons.push(`鐗规€у厤鐤?{immuneTypes.map(t=>TYPE_ZH[t]).join('/')}绯籤);
    const weakTypes=B_TYPES.filter(t=>getTypeEff(t,mp.type1,mp.type2)>=2&&!immuneTypes.includes(t));
    const resistTypes=B_TYPES.filter(t=>getTypeEff(t,mp.type1,mp.type2)<=0.5);
    if(resistTypes.length)reasons.push(`鎶楁€уソ锛?{resistTypes.map(t=>TYPE_ZH[t]).slice(0,3).join('/')}绛夛級`);
    if(weakTypes.length<=2)reasons.push(`寮辩偣灏戯紙浠?{weakTypes.length}绉嶏級`);

    // defTypeBonus锛氬鏂归娴嬫妧鑳藉睘鎬х殑鎶楁€у姞鍒?
    let defTypeBonus=0;
    const oppMoveTypes=[];
    oppValid.forEach(op=>{
      (op.predictedMoves||[]).forEach(m=>{
        const mv=MOVES_BY_SLUG?.[m.slug];
        if(mv&&mv.type&&mv.cat!=='status') oppMoveTypes.push({type:mv.type,pct:m.pct});
      });
    });
    oppMoveTypes.forEach(({type,pct})=>{
      const eff=getTypeEff(type,mp.type1,mp.type2);
      const immune=immuneTypes.includes(type);
      if(immune)          defTypeBonus+=2*(pct/100);
      else if(eff<=0.5)   defTypeBonus+=1*(pct/100);
      else if(eff>=2)     defTypeBonus-=1*(pct/100);
    });
    if(oppMoveTypes.length&&defTypeBonus>1)
      reasons.push(`鑳芥姉瀵规柟甯哥敤鎶€鑳絗);

    // 鈹€鈹€ 鎴戞柟鎼哄甫閬撳叿鍔犳垚 鈹€鈹€
    let myItemBonus=0;
    const myItem=mp.item||'';
    if(myItem==='绐佸嚮鑳屽績'){
      // 瀵规柟鏈夌壒娈婃嫑寮忔椂锛岀壒闃裁?.5鐩稿綋浜庨檷浣庡彈浼ゆ晥鐜?
      const hasOppSpec=oppValid.some(op=>(op.predictedMoves||[]).some(m=>MOVES_BY_SLUG?.[m.slug]?.cat==='special'));
      if(hasOppSpec){myItemBonus+=1.5;reasons.push('绐佸嚮鑳屽績瀵规姉瀵规柟鐗规敾');}
    } else if(myItem==='姘斿娍鎶甫'){
      myItemBonus+=1.0;reasons.push('姘斿娍鎶甫鍙拺杩囦竴鍑?);
    } else if(myItem==='鍚冨墿鐨勪笢瑗?){
      myItemBonus+=0.5;reasons.push('鍚冨墿鐨勪笢瑗挎寔缁洖琛€');
    } else if(myItem==='鏂囨煔鏋?){
      myItemBonus+=0.3;
    } else if(myItem==='璁茬┒鍥村肪'){
      reasons.push('璁茬┒鍥村肪閫熷害脳1.5');
    } else if(myItem==='璁茬┒澶村甫'){
      reasons.push('璁茬┒澶村甫鐗╂敾脳1.5');
    } else if(myItem==='璁茬┒鐪奸暅'){
      reasons.push('璁茬┒鐪奸暅鐗规敾脳1.5');
    } else if(myItem==='鐢熷懡鐞?){
      reasons.push('鐢熷懡鐞冧激瀹趁?.3');
    }
    // 鎶楁€ф爲鏋滐細瀵规柟鏈夊搴斿睘鎬ф嫑寮忔椂棰濆鍔犲垎
    const BERRY_RESIST={'鑽夎殨鏋?:'rock','妫辩摐鏋?:'flying','鍒鸿€虫灉':'dark','鑾茶挷鏋?:'fighting',
      '鑾撴Υ鏋?:'dragon','浣涙煈鏋?:'ghost','閫氶€氭灉':'poison','宸у彲鏋?:'fire',
      '鍗冮鏋?:'water','绂忕鏋?:'psychic','闇归湽鏋?:'steel','鐏祮鏋?:'normal'};
    if(BERRY_RESIST[myItem]){
      const rType=BERRY_RESIST[myItem];
      const threatPct=oppMoveTypes.filter(({type})=>type===rType).reduce((s,{pct})=>s+pct,0);
      if(threatPct>40){myItemBonus+=1.0;reasons.push(`${myItem}鍑忓急瀵规柟${TYPE_ZH[rType]||rType}绯绘嫑寮廯);}
    }

    const total=offScore - defScore*0.5 + koScore*3 + defTypeBonus + myItemBonus;
    return{pkm:mp,offScore,defScore,koCount:Math.round(koScore),koScore,defTypeBonus:+defTypeBonus.toFixed(2),myItemBonus:+myItemBonus.toFixed(2),total,reasons:[...new Set(reasons)].slice(0,5)};
  }).sort((a,b)=>b.total-a.total);
  return selectSynergisticTop3(rawScored);
}

/* 鈹€鈹€ 鍗忓悓鎬op3閫夋嫨锛?2/#3 琛ュ己鍓嶉潰瀹濆彲姊︾殑寮辩偣灞炴€?鈹€鈹€ */
function selectSynergisticTop3(scored){
  if(scored.length<=3)return scored;
  const first=scored[0];
  const pool1=scored.slice(1);
  const weakOf=p=>{
    const immune=ABILITY_TYPE_IMMUNE[p.ability||'']||[];
    return B_TYPES.filter(t=>getTypeEff(t,p.type1,p.type2)>=2&&!immune.includes(t));
  };
  const firstWeak=weakOf(first.pkm);
  // 閫?2锛氬師璇勫垎 + 姣忔姷鎶椾竴涓?1鐨勫急鐐?2鍒?
  const second=pool1.map(s=>({s,syn:s.total+firstWeak.filter(t=>getTypeEff(t,s.pkm.type1,s.pkm.type2)<=0.5).length*2}))
    .sort((a,b)=>b.syn-a.syn)[0].s;
  const pool2=pool1.filter(s=>s!==second);
  const secondWeak=weakOf(second.pkm);
  const combinedWeak=[...new Set([...firstWeak,...secondWeak])];
  // 閫?3锛氳ˉ寮轰袱鑰呭叡鍚屽急鐐?
  const third=pool2.map(s=>({s,syn:s.total+combinedWeak.filter(t=>getTypeEff(t,s.pkm.type1,s.pkm.type2)<=0.5).length*2}))
    .sort((a,b)=>b.syn-a.syn)[0].s;
  const top3=new Set([first,second,third]);
  return[first,second,third,...scored.filter(s=>!top3.has(s))];
}

/* 鈹€鈹€ 瑙掕壊璇嗗埆 鈹€鈹€ */
function classifyRole(pkm){
  const moves=[pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(m=>m&&m.name);
  const statusMoves=moves.filter(m=>m.cat==='status');
  const physMoves=moves.filter(m=>m.cat==='physical'&&m.power>0);
  const specMoves=moves.filter(m=>m.cat==='special'&&m.power>0);
  const base=pkm.base||{};
  const atk=base.atk||0, spa=base.spa||0;
  const hp=base.hp||0, def=base.def||0, spd=base.spd||0;
  if(moves.length>0&&physMoves.length===0&&specMoves.length===0)
    return{label:'杈呭姪',cls:'role-support'};
  if(statusMoves.length>=2)return{label:'杈呭姪',cls:'role-support'};
  if(atk+spa>0&&(hp+def+spd)/(atk+spa)>1.8&&statusMoves.length>=1)
    return{label:'鐩剧墝',cls:'role-wall'};
  if(physMoves.length>specMoves.length&&atk>=spa)
    return{label:'鐗╃悊杈撳嚭',cls:'role-phys'};
  if(specMoves.length>physMoves.length&&spa>atk)
    return{label:'鐗规敾杈撳嚭',cls:'role-spec'};
  if(physMoves.length>0&&specMoves.length>0)return{label:'娣峰悎杈撳嚭',cls:'role-mixed'};
  return{label:'缁煎悎鍨?,cls:'role-mixed'};
}

/* 鈹€鈹€ 闃熶紞鑴嗗急鎬ч璀?鈹€鈹€ */
function renderTeamWeaknessWarning(scored){
  const top3=scored.slice(0,3).map(s=>s.pkm).filter(p=>p.type1);
  if(!top3.length)return`<div class="battle-warn-ok">灞炴€ф暟鎹笉瓒筹紝鏃犳硶鍒嗘瀽</div>`;
  const warnings=[];
  B_TYPES.forEach(t=>{
    const hits=top3.filter(p=>getTypeEff(t,p.type1,p.type2)>=2);
    if(hits.length>=2)
      warnings.push(`<b>${TYPE_ZH[t]||t}绯?/b>鍙厠鍒?${hits.map(p=>esc(p.name)).join('銆?)}锛?{hits.length}/3鍙級`);
  });
  // 娌℃湁浠讳綍瀹濆彲姊﹀鏌愬睘鎬ф姉鎬х殑绫诲瀷
  const noResist=B_TYPES.filter(t=>top3.every(p=>getTypeEff(t,p.type1,p.type2)>=1));
  if(!warnings.length)
    return`<div class="battle-warn-ok">鉁?鍑烘垬涓夊彧瀵瑰悇灞炴€ф棤鏄庢樉闆嗕綋寮辩偣</div>`;
  return`<div class="battle-warn-list">${warnings.map(w=>`<div class="battle-warn-item">鈿?${w}</div>`).join('')}</div>`;
}

/* 鈹€鈹€ 閫熷害妗ｄ綅瀵规瘮锛堝惈澶╂皵/鐗规€ч€熷害淇锛夆攢鈹€ */
function renderSpeedAnalysis(scored, opp){
  const myPkmAll=scored.map(s=>s.pkm);
  const oppWithSpd=opp.filter(op=>(op.name||op.type1)&&op.base?.spe);
  if(!oppWithSpd.length)
    return`<div style="color:var(--t3);font-size:.78rem">闇€閫氳繃鎼滅储閫夋嫨瀵规柟瀹濆彲姊︽墠鑳借幏鍙栫鏃忓€硷紝鎵嬪姩濉叆灞炴€ф椂鏃犳硶璁＄畻閫熷害</div>`;

  const myWeather=detectMyWeather(myPkmAll);
  const oppWeathers=detectOppWeather(oppWithSpd);
  const activeWeather=myWeather||'';
  const weatherZH={'sun':'鏅村ぉ','rain':'闆ㄥぉ','sand':'娌欐毚','snow':'鍐伴洩'};
  const weatherNote=myWeather?`<div class="spd-weather-note">鈽€ 宸辨柟澶╂皵锛?{weatherZH[myWeather]||myWeather}</div>`:
    oppWeathers.length?`<div class="spd-weather-note">鈿?瀵规柟鍙兘璁剧疆锛?{oppWeathers.map(w=>weatherZH[w]||w).join('/')} 澶╂皵</div>`:'';

  // 鏀堕泦鎵€鏈夐€熷害鏉＄洰
  const entries=[];
  myPkmAll.forEach((pkm,ri)=>{
    const base=pkm.base?.spe||0;
    if(!base)return;
    const eff=getEffectiveSpeed(pkm,activeWeather);
    const spdMod=ABILITY_SPD_MOD[pkm.ability||''];
    const note=eff!==base?`脳鐗规€:spdMod?.perTurn?'姣忓洖鍚堚啈':spdMod?.onItemUse?'閬撳叿鍚幟?':'';
    entries.push({team:'my',name:pkm.name,sprite:pkm._spriteUrl||'',base,eff,note,rank:ri});
  });
  oppWithSpd.forEach(op=>{
    const oppAbilityList=getOppAbilityList(op);
    const oppSpdMod=oppAbilityList.map(a=>ABILITY_SPD_MOD[a]).find(m=>m?.weather);
    const eff=oppSpdMod&&oppWeathers.includes(oppSpdMod.weather)?Math.round(op.base.spe*oppSpdMod.mul):op.base.spe;
    const note=eff!==op.base.spe?`脳鐗规€:'';
    const sprite=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
    entries.push({team:'opp',name:op.name||'?',sprite,base:op.base.spe,eff,note});
  });
  entries.sort((a,b)=>b.eff-a.eff||b.base-a.base);

  const maxEff=entries[0]?.eff||1;
  const myEffSpeeds=myPkmAll.map(pkm=>getEffectiveSpeed(pkm,activeWeather));

  const bars=entries.map(e=>{
    const barW=Math.round((e.eff/maxEff)*100);
    const isMy=e.team==='my';
    // 涓庡鏂规瘮杈冿細璁＄畻鍏堟墜/鍚庢墜鏁伴噺
    let vsTag='';
    if(isMy){
      const wins=oppWithSpd.filter(op=>{
        const oppAbl=getOppAbilityList(op);
        const oppMod=oppAbl.map(a=>ABILITY_SPD_MOD[a]).find(m=>m?.weather);
        const oppEff=oppMod&&oppWeathers.includes(oppMod.weather)?Math.round(op.base.spe*oppMod.mul):op.base.spe;
        return e.eff-oppEff>=20;
      }).length;
      const lose=oppWithSpd.filter(op=>{
        const oppAbl=getOppAbilityList(op);
        const oppMod=oppAbl.map(a=>ABILITY_SPD_MOD[a]).find(m=>m?.weather);
        const oppEff=oppMod&&oppWeathers.includes(oppMod.weather)?Math.round(op.base.spe*oppMod.mul):op.base.spe;
        return oppEff-e.eff>=20;
      }).length;
      const parts=[];
      if(wins)parts.push(`<span class="spd-vs-win">鍏堟墜脳${wins}</span>`);
      if(lose)parts.push(`<span class="spd-vs-lose">鍚庢墜脳${lose}</span>`);
      if(oppWithSpd.length-wins-lose>0)parts.push(`<span class="spd-vs-unclear">卤${oppWithSpd.length-wins-lose}</span>`);
      vsTag=parts.join('');
    } else {
      // 瀵规柟鏉＄洰锛氭樉绀烘垜鏂逛腑澶氬皯鍙瘮瀹冨揩
      const myFaster=myEffSpeeds.filter(ms=>ms-e.eff>=20).length;
      const mySlower=myEffSpeeds.filter(ms=>e.eff-ms>=20).length;
      const parts=[];
      if(myFaster)parts.push(`<span class="spd-vs-win">琚?{myFaster}鍙厛鎵?/span>`);
      if(mySlower)parts.push(`<span class="spd-vs-lose">鍘嬪埗脳${mySlower}鍙?/span>`);
      vsTag=parts.join('');
    }
    const noteTag=e.note?`<span class="spd-ability-tag">${e.note}</span>`:'';
    const rankDot=isMy&&e.rank<3?`<span class="spd-rank-dot spd-rank-${e.rank}"></span>`:'';
    return`<div class="spd-bar-row ${isMy?'spd-row-my':'spd-row-opp'}">
      <div class="spd-bar-left">
        ${e.sprite?`<img src="${esc(e.sprite)}" class="spd-sprite" alt="" onerror="this.style.display='none'">`:'<div class="spd-sprite-ph"></div>'}
        <div class="spd-bar-meta">
          <div class="spd-bar-name">${rankDot}${esc(e.name)}${noteTag}</div>
          <div class="spd-bar-track"><div class="spd-bar-fill ${isMy?'spd-fill-my':'spd-fill-opp'}" style="width:${barW}%"></div></div>
        </div>
      </div>
      <div class="spd-bar-right">
        <span class="spd-val">${e.eff}${e.eff!==e.base?`<span class="spd-base-tiny">(${e.base})</span>`:''}</span>
        <div class="spd-vs-tags">${vsTag}</div>
      </div>
    </div>`;
  }).join('');

  return`<div class="battle-speed-visual">${weatherNote}<div class="spd-legend"><span class="spd-legend-my">鎴戞柟</span><span class="spd-legend-opp">瀵规柟</span></div>${bars}</div>`;
}

/* 鈹€鈹€ 瀵规柟鐑棬鎶€鑳芥墦鎴戞柟鐨勪激瀹充及绠?鈹€鈹€ */
function renderOppDamage(opp, myPkm, activeWeather=''){
  const oppValid=opp.filter(op=>(op.name||op.type1)&&op.predictedMoves?.length);
  if(!oppValid.length) return '';

  const rows=oppValid.map(op=>{
    const oppAbility=resolveOppAbility(op);
    const oppItemSlug=op.predictedItem?.slug||'';
    // 鏋勯€犲鏂瑰疂鍙ⅵ鐨?鏀诲嚮鏂?瀵硅薄
    const oppAsAtk={
      name:op.name, type1:op.type1, type2:op.type2,
      base:op.base||{}, ability:oppAbility, item:oppItemSlug,
      level:50,
      move1:null,move2:null,move3:null,move4:null,
    };
    // 鎶?predictedMoves 杞垚鎶€鑳藉璞?
    const moves=op.predictedMoves.map(m=>MOVES_BY_SLUG[m.slug]).filter(Boolean)
      .filter(m=>m.power>0&&m.cat!=='status');
    if(!moves.length) return '';

    const role=classifyOppRole(op);
    const roleTag=`<span class="opp-dmg-role ${role.cls}">${role.label}</span>`;
    const abilityTag=oppAbility?`<span class="opp-dmg-ability">${oppAbility}</span>`:'';
    const itemTag=oppItemSlug?`<span class="opp-dmg-item">${oppItemSlug.replace(/-/g,' ')}</span>`:'';

    const myPkmCols=myPkm.map(mp=>{
      let bestPct=0, bestMove='';
      moves.forEach(mv=>{
        const res=calcDamageEst(oppAsAtk, mp, mv, activeWeather);
        if(res&&res.pct>bestPct){ bestPct=res.pct; bestMove=mv.name||mv.nameEn||''; }
      });
      const cls=bestPct>=100?'opp-dmg-ohko':bestPct>=50?'opp-dmg-heavy':bestPct>=25?'opp-dmg-mid':'opp-dmg-low';
      return`<td class="${cls}">${bestPct>0?bestPct+'%':'-'}${bestMove?`<br><span class="opp-dmg-move">${esc(bestMove)}</span>`:''}`;
    }).join('');

    return`<tr><td class="opp-dmg-name">${esc(op.name||'?')}${roleTag}${abilityTag}${itemTag}</td>${myPkmCols}</tr>`;
  }).filter(Boolean).join('');

  if(!rows) return '';
  const header=myPkm.map(mp=>`<th>${esc(mp.name||'?')}</th>`).join('');
  return`<div class="opp-dmg-wrap"><table class="opp-dmg-table"><tr><th>瀵规柟鈫?/ 鎴戞柟鈫?/th>${header}</tr>${rows}</table></div>`;
}

/* 鈹€鈹€ 瀵规柟瀹濆彲姊﹁鑹茶瘑鍒紙鍩轰簬 predictedMoves锛夆攢鈹€ */
function classifyOppRole(op){
  const moves=(op.predictedMoves||[]).map(m=>MOVES_BY_SLUG[m.slug]).filter(Boolean);
  const phys=moves.filter(m=>m.cat==='physical'&&m.power>0);
  const spec=moves.filter(m=>m.cat==='special'&&m.power>0);
  const status=moves.filter(m=>m.cat==='status');
  if(!phys.length&&!spec.length) return{label:'杈呭姪',cls:'role-support'};
  if(status.length>=2)           return{label:'杈呭姪',cls:'role-support'};
  if(phys.length>spec.length)    return{label:'鐗╃悊杈撳嚭',cls:'role-phys'};
  if(spec.length>phys.length)    return{label:'鐗规敾杈撳嚭',cls:'role-spec'};
  return{label:'娣峰悎杈撳嚭',cls:'role-mixed'};
}

/* 鈹€鈹€ 瀵规柟鍗曞彧瀵规垜鏂瑰崟鍙殑濞佽儊鍒嗭紙鍩轰簬棰勬祴鎶€鑳藉睘鎬х浉鍏嬶級 鈹€鈹€ */
function oppThreatScore(op, mp){
  const myAbility=mp.ability||'';
  const myImmune=ABILITY_TYPE_IMMUNE[myAbility]||[];
  const predMoves=op.predictedMoves||[];
  if(predMoves.length){
    let best=0;
    predMoves.forEach(m=>{
      const mv=MOVES_BY_SLUG?.[m.slug];
      if(!mv||mv.cat==='status'||!mv.type)return;
      if(myImmune.includes(mv.type))return;
      const eff=getTypeEff(mv.type,mp.type1,mp.type2);
      if(eff>best)best=eff;
    });
    if(best>0)return best;
  }
  return getOppBestEff(op,mp);
}

/* 鈹€鈹€ 棰勬祴瀵规柟鏈€浼樺嚭鎴?鍙細闃熷弸鍗忓悓30% + 鍏嬪埗鎴戞柟70% 鈹€鈹€ */
function predictOppBestCombo(valid, myPkm){
  if(!valid.length)return{combo:[],synergyScore:0,antiScore:0,threatMap:{}};
  if(valid.length<=3)return{combo:valid,synergyScore:0,antiScore:0,threatMap:buildThreatMap(valid,myPkm)};

  // 闃熷弸鍗忓悓鍒?
  const synergyScore=(combo)=>{
    let s=0;
    for(let a=0;a<combo.length;a++){
      const mapA={};
      (combo[a].predictedTeammates||[]).forEach(t=>{mapA[t.slug]=t.pct;});
      for(let b=a+1;b<combo.length;b++){
        const mapB={};
        (combo[b].predictedTeammates||[]).forEach(t=>{mapB[t.slug]=t.pct;});
        s+=(mapA[combo[b].slug||'']||0)+(mapB[combo[a].slug||'']||0);
      }
    }
    return s;
  };

  // 鍏嬪埗鎴戞柟鍒嗭細瀵规瘡鍙垜鏂瑰疂鍙ⅵ锛屽彇combo涓渶楂樺▉鑳佸€?
  const antiScore=(combo)=>{
    if(!myPkm.length)return 0;
    let total=0;
    myPkm.forEach(mp=>{
      const best=combo.reduce((m,op)=>Math.max(m,oppThreatScore(op,mp)),0);
      total+=best;
    });
    return total;
  };

  // 鏋氫妇鎵€鏈?C(n,3)锛岃褰曞師濮嬪垎
  const allCombos=[];
  for(let a=0;a<valid.length-2;a++)
    for(let b=a+1;b<valid.length-1;b++)
      for(let c=b+1;c<valid.length;c++)
        allCombos.push([valid[a],valid[b],valid[c]]);

  const raw=allCombos.map(combo=>({combo,syn:synergyScore(combo),anti:antiScore(combo)}));
  const maxSyn=Math.max(...raw.map(r=>r.syn),1);
  const maxAnti=Math.max(...raw.map(r=>r.anti),1);

  let best=raw[0],bestBlend=-1;
  raw.forEach(r=>{
    const blend=(r.syn/maxSyn)*0.3+(r.anti/maxAnti)*0.7;
    if(blend>bestBlend){bestBlend=blend;best=r;}
  });

  return{combo:best.combo,synergyScore:best.syn,antiScore:best.anti,threatMap:buildThreatMap(best.combo,myPkm)};
}

function buildThreatMap(combo,myPkm){
  const map={};
  combo.forEach(op=>{
    const threats=myPkm
      .map(mp=>({name:mp.name,eff:oppThreatScore(op,mp)}))
      .filter(t=>t.eff>=2)
      .sort((a,b)=>b.eff-a.eff)
      .slice(0,2)
      .map(t=>t.name);
    map[op.slug||op.name||'']=threats;
  });
  return map;
}

/* 鈹€鈹€ 娓叉煋瀵规柟鍑烘垬棰勬祴锛堜娇鐢ㄩ璁＄畻缁撴灉锛?鈹€鈹€ */
function renderOppTeamPrediction(valid, predResult){
  if(!valid.length)return '';
  const{combo,threatMap}=predResult;
  const comboSlugs=new Set(combo.map(op=>op.slug||op.name||''));

  const validJson=JSON.stringify(valid.map(op=>({name:op.name,slug:op.slug||'',type1:op.type1})));

  const makePkmEl=(op,isPredicted)=>{
    const img=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
    const slugAttr=esc(op.slug||'');
    const threats=isPredicted?(threatMap[op.slug||op.name||'']||[]):[];
    const threatTag=threats.length?`<span class="opp-pred-threat">鍏嬪埗 ${threats.map(n=>esc(n)).join('銆?)}</span>`:'';
    const dimCls=isPredicted?'':'opp-pred-dim';
    return`<div class="battle-opp-pred-item ${dimCls}" data-slug="${slugAttr}" onclick="onOppLeadClick('${slugAttr}',this)" title="鐐瑰嚮纭鍑哄満锛屽啀鐐瑰彇娑?>
      ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">`:''}
      <span class="battle-opp-pred-name">${esc(op.name||op.type1||'?')}</span>
      ${threatTag}
    </div>`;
  };

  const predictedHtml=combo.map(op=>makePkmEl(op,true)).join('');
  const restHtml=valid.filter(op=>!comboSlugs.has(op.slug||op.name||'')).map(op=>makePkmEl(op,false)).join('');

  return`<div class="battle-opp-pred-wrap" id="opp-pred-wrap" data-valid='${validJson.replace(/'/g,"&#39;")}'>
    <div class="opp-pred-row-label">棰勬祴鍑烘垬</div>
    <div class="opp-pred-combo">${predictedHtml}</div>
    ${restHtml?`<div class="opp-pred-row-label opp-pred-row-label--rest">鍏朵綑澶囬€夛紙鐐瑰嚮鍙娴嬪悗缁級</div>
    <div class="opp-pred-combo">${restHtml}</div>`:''}
    <div id="opp-lead-result" class="opp-lead-result"></div>
  </div>`;
}

/* 鈹€鈹€ 璁板綍鐐瑰嚮椤哄簭锛堟寜鍑哄満椤哄簭锛屼笉鏄?DOM 椤哄簭锛夆攢鈹€ */
const _oppConfirmedOrder=[];   // [{slug,wrapId}]

function onOppLeadClick(leadSlug, el){
  const wrap=el.closest('#opp-pred-wrap');
  const wrapId=wrap?.id||'opp-pred-wrap';

  // 宸插湪鍒楄〃涓?鈫?鍙栨秷纭锛屼粠椤哄簭鏁扮粍绉婚櫎
  const idx=_oppConfirmedOrder.findIndex(x=>x.slug===leadSlug&&x.wrapId===wrapId);
  if(idx!==-1){
    _oppConfirmedOrder.splice(idx,1);
    el.classList.remove('pred-confirmed');
  } else {
    _oppConfirmedOrder.push({slug:leadSlug,wrapId});
    el.classList.add('pred-confirmed');
  }

  const valid=JSON.parse(wrap.dataset.valid||'[]');
  // 鎸夊嚭鍦洪『搴忔帓鍒楀凡纭 slug
  const confirmed=_oppConfirmedOrder.filter(x=>x.wrapId===wrapId).map(x=>x.slug);

  const resultEl=wrap.querySelector('#opp-lead-result');
  if(!resultEl)return;
  if(!confirmed.length){resultEl.innerHTML='';return;}

  const numPredict=Math.max(0,3-confirmed.length);
  const remaining=valid.filter(op=>!confirmed.includes(op.slug||''));

  // 鍚堝苟鎵€鏈夊凡鍑哄満瀹濆彲姊︾殑闃熷弸鐜?
  const combinedRates={};
  confirmed.forEach(confSlug=>{
    const builds=window.PKM_CHAMPIONS_BUILDS?.[confSlug];
    (builds?.teammates||[]).forEach(t=>{
      combinedRates[t.slug]=(combinedRates[t.slug]||0)+t.pct;
    });
  });

  const ranked=remaining
    .map(op=>({...op,rate:combinedRates[op.slug||'']||0}))
    .sort((a,b)=>b.rate-a.rate)
    .slice(0,numPredict);

  // 鏍囩锛氶鍙?A 鈫?绗?涓?B 鈫?棰勬祴绗?鍙?
  const orderLabels=['棣栧彂','绗?涓嚭鍦?,'绗?涓嚭鍦?];
  const confirmedParts=confirmed.map((s,i)=>{
    const name=valid.find(op=>op.slug===s)?.name||s;
    return`${orderLabels[i]||`绗?{i+1}涓猔} <b>${esc(name)}</b>`;
  });
  const labelHtml=confirmedParts.join(' 鈫?');

  if(numPredict===0){
    resultEl.innerHTML=`<div class="opp-lead-label">${labelHtml}锛?鍙凡鍏ㄩ儴鍑哄満锛?/div>`;
    return;
  }

  const backlineHtml=ranked.map(op=>{
    const img=PKM_PC_BY_SLUG[op.slug]?.spriteUrl||'';
    const pct=op.rate>0?`<span class="pred-rate">${op.rate.toFixed(0)}%</span>`:'';
    return`<div class="battle-opp-pred-item">
      ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">`:''}
      <span class="battle-opp-pred-name">${esc(op.name||op.slug)}</span>${pct}
    </div>`;
  }).join('');

  resultEl.innerHTML=`<div class="opp-lead-label">${labelHtml} 鈫?棰勬祴绗?{confirmed.length+1}鍙細</div>`
    +(backlineHtml?`<div class="opp-pred-combo">${backlineHtml}</div>`:'<div class="opp-lead-label">鏆傛棤闃熷弸鏁版嵁</div>');
}

/* 鈹€鈹€ 鎺ㄨ崘鍑烘垬 鈹€鈹€ */
function renderBattleRec(scored, opp){
  const top3=scored.slice(0,3);
  const rankClass=['rank-1','rank-2','rank-3'];
  const rankLabel=['#1 棣栭€?,'#2 娆￠€?,'#3 澶囬€?];
  const rankCls=['r1','r2','r3'];
  // 妫€娴嬪鏂规槸鍚︽湁鎭愬悡
  const oppHasIntimidate=opp.some(op=>getOppAbilityList(op).includes('intimidate'));
  return`<div class="battle-rec-list">${top3.map((s,i)=>{
    const pkm=s.pkm;
    const img=pkm._spriteUrl?`<img src="${esc(pkm._spriteUrl)}" alt="" onerror="this.style.display='none'">`:'';
    const role=classifyRole(pkm);
    // 鐗规€у窘绔?
    const ability=pkm.ability||'';
    const abilityZH=PKM_LIST.find(p=>p.slug===pkm.slug)?.abilities?.indexOf(ability)>=0?ability:'';
    const abilityLabel=ability?(()=>{
      if(ABILITY_TYPE_IMMUNE[ability]) return{txt:'灞炴€у厤鐤?,cls:'ab-immune'};
      if(ABILITY_WEATHER_SET[ability]) return{txt:'澶╂皵璁剧疆',cls:'ab-weather'};
      if(ABILITY_SPD_MOD[ability]) return{txt:'閫熷害鐗规€?,cls:'ab-speed'};
      if(ABILITY_SURVIVE[ability]) return{txt:'鐢熷瓨鐗规€?,cls:'ab-survive'};
      if(ABILITY_ATK_MOD[ability]) return{txt:'杩涙敾鐗规€?,cls:'ab-atk'};
      return null;
    })():null;
    const abilityTag=abilityLabel?`<span class="battle-ability-tag ${abilityLabel.cls}" title="${esc(ability)}">${abilityLabel.txt}</span>`:'';
    // 鎭愬悡璀﹀憡锛氬鏂规湁鎭愬悡 涓?鎴戞柟鏄墿鐞嗘敾鍑绘墜
    const physRole=role.cls==='role-phys'||role.cls==='role-mixed';
    const intimidateWarn=oppHasIntimidate&&physRole?`<div class="battle-rec-reason warn-intimidate">鈿?瀵规柟鏈夋亹鍚擄紝鐗╂敾瀹炴晥绾﹂檷33%</div>`:'';
    // 鐢熷瓨鐗规€ф爣娉?
    const surviveWarn=ABILITY_SURVIVE[ability]?`<div class="battle-rec-reason">${ABILITY_SURVIVE[ability]}</div>`:'';
    // 閫熷害鍏堝悗鎵嬪揩閫熸爣娉紙棰嗗厛20+鎵嶅湪鍗＄墖閲屾樉绀猴級
    const mySpd=pkm.base?.spe||0;
    const spdNotes=mySpd?opp.filter(op=>op.base?.spe).map(op=>{
      const diff=mySpd-op.base.spe;
      if(diff>=20)return`鈿?鍏堟墜 vs ${esc(op.name||'?')}锛?${diff}锛塦;
      if(diff<=-20)return`馃悽 鍚庢墜 vs ${esc(op.name||'?')}锛?{diff}锛塦;
      return null;
    }).filter(Boolean):[];
    const allReasons=[...s.reasons,...spdNotes].slice(0,5);
    return`<div class="battle-rec-card ${rankClass[i]}">
      <span class="battle-rec-rank ${rankCls[i]}">${rankLabel[i]}</span>
      <div class="battle-rec-sprite">${img}</div>
      <div class="battle-rec-body">
        <div class="battle-rec-name">${esc(pkm.name)}<span class="battle-role-tag ${role.cls}">${role.label}</span>${abilityTag}</div>
        <div class="battle-rec-score">杩涙敾+${s.offScore.toFixed(1)} 闃插尽-${s.defScore.toFixed(1)} 缁煎悎${s.total.toFixed(1)}</div>
        <div class="battle-rec-reasons">
          ${allReasons.map(r=>`<div class="battle-rec-reason">${r}</div>`).join('')}
          ${surviveWarn}${intimidateWarn}
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

/* 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ 鏁板€艰绠楀櫒 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ */
function renderBattleCalc(){
  const el=document.getElementById('btab-calc');
  if(!el)return;
  const natOpts=['', ...Object.keys(NATURES_ZH)].map(n=>`<option value="${n}">${n||'鏃?涓€?}</option>`).join('');
  const statsRows=STAT_KEYS_B.map(k=>`
    <div class="battle-calc-col">
      <span class="bpkm-stat-lbl">${STAT_ZH_B[k]}</span>
      <input class="bpkm-inp-num" id="calc-base-${k}" type="number" min="0" max="255" placeholder="绉嶆棌" value="" oninput="calcAllStats()" style="width:52px">
      <input class="bpkm-inp-num" id="calc-iv-${k}" type="number" min="0" max="31" placeholder="涓綋" value="31" oninput="calcAllStats()" style="width:52px">
      <input class="bpkm-inp-num" id="calc-ev-${k}" type="number" min="0" max="252" placeholder="鍔姏" value="0" oninput="calcAllStats()" style="width:52px">
    </div>`).join('');
  el.innerHTML=`
    <div class="battle-calc-layout">
      <div class="battle-calc-section">
        <div class="battle-side-hdr">杈撳叆鍙傛暟</div>
        <div class="bpkm-form-grid" style="margin-bottom:10px">
          <div class="bpkm-inp-group">
            <span class="bpkm-inp-label">绛夌骇</span>
            <input class="bpkm-inp" id="calc-level" type="number" min="1" max="100" value="50" oninput="calcAllStats()">
          </div>
          <div class="bpkm-inp-group">
            <span class="bpkm-inp-label">鎬ф牸</span>
            <select class="bpkm-inp" id="calc-nature" onchange="calcAllStats()">${natOpts}</select>
          </div>
        </div>
        <div class="bpkm-section-hdr" style="margin-bottom:8px">绉嶆棌鍊?/ 涓綋鍊?/ 鍔姏鍊?/div>
        <div class="bpkm-stats-block" style="gap:8px">${statsRows}</div>
        <div class="battle-datasrc-note" style="margin-top:10px">
          鈥?Champions 鏍煎紡榛樿 Lv.50锛屽叕寮忓悓瀹樻柟銆?br>
          鐗规€у浐瀹氬€嶇巼锛堢寷鐏?.5绛夛級椤诲湪鍒嗘瀽椤点€屾寔鏈夐亾鍏枫€嶆爮鎵嬪姩鏍囨敞鎴栧娉ㄨ鏄庛€?
        </div>
      </div>
      <div class="battle-calc-section">
        <div class="battle-side-hdr">璁＄畻缁撴灉</div>
        <div id="calc-result">
          <div style="color:var(--t3);font-size:.82rem;padding:.8rem 0">濉啓宸︿晶鏁版嵁鍚庤嚜鍔ㄨ绠?/div>
        </div>
      </div>
    </div>`;
}

function calcAllStats(){
  const level=parseInt(document.getElementById('calc-level')?.value)||50;
  const nature=document.getElementById('calc-nature')?.value||'';
  const results=STAT_KEYS_B.map(k=>{
    const base=parseInt(document.getElementById(`calc-base-${k}`)?.value)||0;
    const iv=parseInt(document.getElementById(`calc-iv-${k}`)?.value)??31;
    const ev=parseInt(document.getElementById(`calc-ev-${k}`)?.value)||0;
    const val=calcActualStatVal(base,iv,ev,nature,k,level);
    const natIdx=STAT_KEYS_B.indexOf(k);
    const natMul=NATURES_ZH[nature]?.[natIdx]||1;
    const color=natMul>1?'var(--danger)':natMul<1?'var(--acc2)':'var(--t)';
    const natMark=natMul>1?'鈫?:natMul<1?'鈫?:'';
    return{k,val,base,color,natMark};
  });
  const el=document.getElementById('calc-result');
  if(!el)return;
  if(!results.some(r=>r.base>0)){el.innerHTML='<div style="color:var(--t3);font-size:.82rem;padding:.8rem 0">濉啓宸︿晶鏁版嵁鍚庤嚜鍔ㄨ绠?/div>';return;}
  const maxStat=Math.max(...results.map(r=>r.val),1);
  el.innerHTML=`<div class="battle-calc-result">
    <div class="battle-calc-result-hdr">Lv.${level} 瀹為檯鑳藉姏鍊?/div>
    ${results.map(r=>{
      const pct=Math.round(r.val/maxStat*100);
      const barColor=r.val>=120?'var(--acc2)':r.val>=80?'var(--acc)':'var(--warn)';
      return`<div class="battle-calc-result-row">
        <span class="battle-calc-stat-name">${STAT_ZH_B[r.k]}</span>
        <div class="battle-calc-stat-bar"><div class="battle-calc-stat-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="battle-calc-stat-val" style="color:${r.color}">${r.val}${r.natMark}</span>
      </div>`;
    }).join('')}
  </div>`;
}


/* ═══════════════════════════════════════
   双打模块
   ═══════════════════════════════════════ */

/* ── 状态 ── */
let bdMyTeamId = null;
let bdOppPkm = [{},{},{},{},{},{}];
const bdOppComposing = {};
const bdOppSearchTimers = {};

/* ── Tab 切换 ── */
function switchDTab(tab, btn) {
  document.querySelectorAll('#battle-doubles .btab').forEach(b => b.classList.remove('on'));
  document.querySelectorAll('#battle-doubles .btab-panel').forEach(p => p.classList.remove('on'));
  document.getElementById('bdtab-' + tab).classList.add('on');
  btn.classList.add('on');
  if (tab === 'calc') renderDCalc();
}

/* ── 初始化 ── */
function initDoubles() {
  renderDTeamList();
  renderDTeamSel();
  renderDOppSlots();
}

/* ── 队伍列表（共用 battleTeams，渲染到 #bd-team-list） ── */
function renderDTeamList() {
  const el = document.getElementById('bd-team-list');
  if (!el) return;
  if (!battleTeams.length) {
    el.innerHTML = `<div class="btc-empty"><div class="btc-empty-ico">⚔️ </div>还没有队伍，点击「新建阵容」开始吧！</div>`;
    return;
  }
  el.innerHTML = battleTeams.map(t => {
    const pkm = Array.isArray(t.pokemon) ? t.pokemon : [];
    const sprites = pkm.map((p, i) => {
      const img = p._spriteUrl ? `<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">` : '<span style="font-size:1.4rem;color:var(--b2)">·</span>';
      const dots = (p.type1 ? `<div class="btc-type-dot" style="background:${TYPE_COLOR[p.type1]||'#888'}"></div>` : '') + (p.type2 ? `<div class="btc-type-dot" style="background:${TYPE_COLOR[p.type2]||'#888'}"></div>` : '');
      return `<div class="btc-pkm" onclick="event.stopPropagation();openBattleTeamEdit('${t.id}',${i})" title="${esc(p.name||'空位')}">${img}<div class="btc-pkm-name">${esc(p.name||'—')}</div><div class="btc-pkm-types">${dots}</div></div>`;
    });
    while (sprites.length < 6) sprites.push(`<div class="btc-pkm"><span style="font-size:1.4rem;color:var(--b2)">+</span><div class="btc-pkm-name" style="color:var(--t3)">空</div></div>`);
    return `<div class="battle-team-card"><div class="btc-header"><div class="btc-name">${esc(t.team_name||'我的队伍')}</div><div class="btc-meta">${pkm.filter(p=>p.name).length}/6 已录入</div><div class="btc-actions"><button class="btn btn-sm" onclick="openBattleTeamEdit('${t.id}',0)">✏️ 编辑</button><button class="btn btn-sm btn-d" onclick="confirmDeleteBattleTeam('${t.id}')">删除</button></div></div><div class="btc-sprites">${sprites.join('')}</div></div>`;
  }).join('');
}

function renderDTeamSel() {
  const sel = document.getElementById('bd-my-team-sel');
  if (!sel) return;
  sel.innerHTML = `<option value="">选择阵容…</option>` + battleTeams.map(t => `<option value="${t.id}">${esc(t.team_name||'我的队伍')}</option>`).join('');
}

function onDMyTeamSelect(teamId) {
  bdMyTeamId = teamId;
  const team = battleTeams.find(t => t.id === teamId);
  const preview = document.getElementById('bd-my-preview');
  if (!team || !preview) return;
  preview.innerHTML = (Array.isArray(team.pokemon) ? team.pokemon.filter(p => p.name) : []).map(p => {
    const img = p._spriteUrl ? `<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">` : '';
    return `<div class="battle-my-pkm-chip">${img}${esc(p.name)}</div>`;
  }).join('');
}

/* ── 对方6槽输入（前缀 bdopp-，独立于单打） ── */
function renderDOppSlots() {
  const el = document.getElementById('bd-opp-slots');
  if (!el) return;
  const typeOpts = B_TYPES.map(t => `<option value="${t}">${TYPE_ZH[t]||t}</option>`).join('');
  el.innerHTML = [0,1,2,3,4,5].map(i => `
    <div class="battle-opp-row">
      <span class="battle-opp-num">${i+1}</span>
      <div class="battle-opp-inp-wrap">
        <input class="battle-opp-inp" id="bdopp-name-${i}" placeholder="搜索宝可梦…"
          oninput="if(!bdOppComposing[${i}])onDOppInput(${i},this.value)"
          oncompositionstart="bdOppComposing[${i}]=true"
          oncompositionend="bdOppComposing[${i}]=false;onDOppInput(${i},this.value)"
          onblur="setTimeout(()=>closeDOppDrop(${i}),350)" autocomplete="off">
        <div class="bpkm-search-drop" id="bdopp-drop-${i}"></div>
      </div>
      <select class="battle-opp-type-sel" id="bdopp-t1-${i}" title="属性1">
        <option value="">属性1</option>${typeOpts}
      </select>
      <select class="battle-opp-type-sel" id="bdopp-t2-${i}" title="属性2（可选）">
        <option value="">属性2</option>${typeOpts}
      </select>
    </div>`).join('');
}

function closeDOppDrop(i) {
  const d = document.getElementById(`bdopp-drop-${i}`);
  if (d) { d.classList.remove('open'); d.innerHTML = ''; }
}

function onDOppInput(i, q) {
  clearTimeout(bdOppSearchTimers[i]);
  const drop = document.getElementById(`bdopp-drop-${i}`);
  if (!drop) return;
  if (!q || q.length < 1) { drop.classList.remove('open'); drop.innerHTML = ''; return; }
  drop.innerHTML = '<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索中…</div>';
  drop.classList.add('open');
  bdOppSearchTimers[i] = setTimeout(async () => {
    try {
      let results = PKM_LIST.filter(p => p.name.includes(q)).slice(0, 8).map(p => ({id:p.num, cnName:p.name, slug:p.slug, spriteUrl:p.spriteUrl||''}));
      if (!results.length && /^\d+$/.test(q)) { const p = PKM_PC_BY_NUM[parseInt(q)]; results = p ? [{id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}] : []; }
      if (!results.length) { drop.innerHTML = '<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">未找到</div>'; return; }
      drop.innerHTML = results.map(r => `<div class="bpkm-drop-item" onclick="selectDOpp(${i},${r.id},'${esc(r.cnName||'')}','${r.slug||''}')">
        <img src="${r.spriteUrl||''}" alt="" onerror="this.style.display='none'">
        <div class="bpkm-drop-name">${esc(r.cnName||'')}</div>
        <div class="bpkm-drop-num">#${r.id}</div>
      </div>`).join('');
    } catch(e) { drop.innerHTML = '<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索出错</div>'; }
  }, 300);
}

function selectDOpp(i, pkmId, cnName, slug='') {
  closeDOppDrop(i);
  const inp = document.getElementById(`bdopp-name-${i}`);
  if (inp) inp.value = cnName;
  const lp = PKM_PC_BY_SLUG[slug] || PKM_PC_BY_NUM[pkmId];
  const builds = window.PKM_CHAMPIONS_BUILDS?.[slug] || null;
  if (lp) {
    document.getElementById(`bdopp-t1-${i}`)?.setAttribute('value', lp.type1||'');
    document.getElementById(`bdopp-t2-${i}`)?.setAttribute('value', lp.type2||'');
    const s1 = document.getElementById(`bdopp-t1-${i}`); if(s1) s1.value = lp.type1||'';
    const s2 = document.getElementById(`bdopp-t2-${i}`); if(s2) s2.value = lp.type2||'';
    bdOppPkm[i] = { name:cnName, slug, type1:lp.type1||'', type2:lp.type2||'', base:lp.stats||{},
      predictedMoves:builds?.moves||[], predictedItem:builds?.item||null,
      predictedAbility:builds?.ability||null, predictedTeammates:builds?.teammates||[] };
  } else {
    bdOppPkm[i] = { name:cnName, slug, type1:'', type2:'', base:{} };
    fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(slug||cnName.toLowerCase())}`)
      .then(r => r.ok ? r.json() : null).then(d => {
        if (!d) return;
        const t1 = d.types[0]?.type?.name||'', t2 = d.types[1]?.type?.name||'';
        const s1 = document.getElementById(`bdopp-t1-${i}`); if(s1) s1.value = t1;
        const s2 = document.getElementById(`bdopp-t2-${i}`); if(s2) s2.value = t2;
        bdOppPkm[i] = {...bdOppPkm[i], type1:t1, type2:t2};
      }).catch(()=>{});
  }
}

/* ── 双打支援角色识别 ── */
const BD_SUPPORT_SLUGS = {
  'fake-out':'假哭', 'tailwind':'顺风', 'trick-room':'奇异空间',
  'follow-me':'引导', 'rage-powder':'引导', 'helping-hand':'鼓气加油',
  'icy-wind':'速控', 'electroweb':'速控', 'bulldoze':'速控',
  'rain-dance':'天气', 'sunny-day':'天气', 'sandstorm':'天气', 'snowscape':'天气',
};
const BD_SPREAD_SLUGS = new Set([
  'earthquake','magnitude','surf','muddy-water','discharge','lava-plume',
  'heat-wave','blizzard','hyper-voice','dazzling-gleam','rock-slide',
  'icy-wind','bulldoze','electroweb','snarl','breaking-swipe',
]);

function detectDSupportRoles(pkm) {
  const roles = new Set();
  [pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(Boolean).forEach(m => {
    const slug = m.slug||'';
    if (BD_SUPPORT_SLUGS[slug]) roles.add(BD_SUPPORT_SLUGS[slug]);
    if (BD_SPREAD_SLUGS.has(slug)) roles.add('范围技');
  });
  const ab = pkm.ability||'';
  if (ABILITY_WEATHER_SET[ab]) roles.add('天气');
  if (ab === 'intimidate') roles.add('恐吓');
  if (ab === 'prankster') roles.add('恶作剧之心');
  return [...roles];
}

function detectDOppSupportRoles(op) {
  const roles = new Set();
  (op.predictedMoves||[]).forEach(m => {
    const slug = m.slug||'';
    if (BD_SUPPORT_SLUGS[slug]) roles.add(BD_SUPPORT_SLUGS[slug]);
    if (BD_SPREAD_SLUGS.has(slug)) roles.add('范围技');
  });
  const ab = (op.predictedAbility?.slug)||'';
  if (ABILITY_WEATHER_SET[ab]) roles.add('天气');
  if (ab === 'intimidate') roles.add('恐吓');
  return [...roles];
}

/* ── 先发2只搭档协同评分 ── */
function pairSynergyScore(a, b) {
  let score = 0;
  const rolesA = detectDSupportRoles(a), rolesB = detectDSupportRoles(b);
  const roleA = classifyRole(a), roleB = classifyRole(b);
  const aIsSupport = roleA.cls==='role-support' || rolesA.length>0;
  const bIsSupport = roleB.cls==='role-support' || rolesB.length>0;
  if (aIsSupport !== bIsSupport) score += 4;
  if (rolesA.includes('假哭') || rolesB.includes('假哭')) score += 3;
  if ((rolesA.includes('顺风')||rolesB.includes('顺风')) && Math.abs((a.base?.spe||0)-(b.base?.spe||0))>40) score += 2;
  const getWeaks = p => { const im=ABILITY_TYPE_IMMUNE[p.ability||'']||[]; return B_TYPES.filter(t=>getTypeEff(t,p.type1,p.type2)>=2&&!im.includes(t)); };
  score -= getWeaks(a).filter(t=>getWeaks(b).includes(t)).length * 0.8;
  if ((a.base?.spe||0)>0&&(b.base?.spe||0)>0&&Math.abs((a.base.spe||0)-(b.base.spe||0))>30) score += 1;
  if (roleA.cls===roleB.cls&&roleA.cls!=='role-support') score -= 1;
  return score;
}

/* ── 从4只中选最佳先发2只 ── */
function selectBestLeadPair(top4, oppLead) {
  if (top4.length <= 2) return top4;
  let best = null, bestScore = -Infinity;
  for (let a = 0; a < top4.length-1; a++) {
    for (let b = a+1; b < top4.length; b++) {
      const pa = top4[a].pkm, pb = top4[b].pkm;
      const syn = pairSynergyScore(pa, pb);
      let threat = 0;
      (oppLead||[]).slice(0,2).forEach(op => { threat += oppThreatScore(op,pa)+oppThreatScore(op,pb); });
      const total = syn*1.5 + threat;
      if (total > bestScore) { bestScore=total; best=[top4[a],top4[b]]; }
    }
  }
  return best || top4.slice(0,2);
}

/* ── 协同Top4选择 ── */
function selectSynTop4(scored) {
  if (scored.length <= 4) return scored;
  const getWeaks = p => { const im=ABILITY_TYPE_IMMUNE[p.ability||'']||[]; return B_TYPES.filter(t=>getTypeEff(t,p.type1,p.type2)>=2&&!im.includes(t)); };
  const first = scored[0];
  const fw = getWeaks(first.pkm);
  const second = scored.slice(1).map(s=>({s,syn:s.total+fw.filter(t=>getTypeEff(t,s.pkm.type1,s.pkm.type2)<=0.5).length*2})).sort((a,b)=>b.syn-a.syn)[0].s;
  const pool2 = scored.slice(1).filter(s=>s!==second);
  const cw12 = [...new Set([...fw,...getWeaks(second.pkm)])];
  const third = pool2.map(s=>({s,syn:s.total+cw12.filter(t=>getTypeEff(t,s.pkm.type1,s.pkm.type2)<=0.5).length*2})).sort((a,b)=>b.syn-a.syn)[0].s;
  const pool3 = pool2.filter(s=>s!==third);
  const cw123 = [...new Set([...cw12,...getWeaks(third.pkm)])];
  const fourth = pool3.map(s=>({s,syn:s.total+cw123.filter(t=>getTypeEff(t,s.pkm.type1,s.pkm.type2)<=0.5).length*2+(detectDSupportRoles(s.pkm).length>0?3:0)})).sort((a,b)=>b.syn-a.syn)[0].s;
  const top4set = new Set([first,second,third,fourth]);
  return [first,second,third,fourth,...scored.filter(s=>!top4set.has(s))];
}

/* ── 预测对方最优出战4只 + 先发2只（C(n,4) + 角色标签） ── */
function predictOppDoubles(valid, myPkm) {
  if (!valid.length) return {combo4:[],leadPair:[],threatMap:{},spreadWarn:[]};
  if (valid.length <= 4) {
    const lp = selectBestLeadPair(valid.map(p=>({pkm:p})), myPkm).map(s=>s.pkm||s);
    return {combo4:valid, leadPair:lp, threatMap:buildThreatMap(valid,myPkm), spreadWarn:collectSpreadWarn(valid)};
  }
  const synScore = combo => {
    let s=0;
    for(let a=0;a<combo.length;a++){
      const ma={}; (combo[a].predictedTeammates||[]).forEach(t=>{ma[t.slug]=t.pct;});
      for(let b=a+1;b<combo.length;b++){
        const mb={}; (combo[b].predictedTeammates||[]).forEach(t=>{mb[t.slug]=t.pct;});
        s+=(ma[combo[b].slug||'']||0)+(mb[combo[a].slug||'']||0);
      }
    }
    return s;
  };
  const antiScore = combo => { if(!myPkm.length)return 0; let t=0; myPkm.forEach(mp=>{t+=combo.reduce((m,op)=>Math.max(m,oppThreatScore(op,mp)),0);}); return t; };
  const all=[];
  for(let a=0;a<valid.length-3;a++) for(let b=a+1;b<valid.length-2;b++) for(let c=b+1;c<valid.length-1;c++) for(let d=c+1;d<valid.length;d++) all.push([valid[a],valid[b],valid[c],valid[d]]);
  const raw=all.map(combo=>({combo,syn:synScore(combo),anti:antiScore(combo)}));
  const mxS=Math.max(...raw.map(r=>r.syn),1), mxA=Math.max(...raw.map(r=>r.anti),1);
  let best=raw[0],bv=-1;
  raw.forEach(r=>{const v=(r.syn/mxS)*0.4+(r.anti/mxA)*0.6; if(v>bv){bv=v;best=r;}});
  const combo4=best.combo;
  const leadPair=selectBestLeadPair(combo4.map(p=>({pkm:p})),myPkm.slice(0,2)).map(s=>s.pkm||s);
  return {combo4, leadPair, threatMap:buildThreatMap(combo4,myPkm), spreadWarn:collectSpreadWarn(combo4)};
}

/* ── 收集对方范围技警告 ── */
function collectSpreadWarn(combo) {
  const warns=[];
  combo.forEach(op=>{
    const spreadMoves=(op.predictedMoves||[]).filter(m=>BD_SPREAD_SLUGS.has(m.slug||''));
    spreadMoves.forEach(m=>{
      const mv=MOVES_BY_SLUG?.[m.slug];
      if(mv) warns.push({pkmName:op.name||'?', moveName:mv.name||m.slug, type:mv.type||''});
    });
  });
  return warns;
}

/* ── 渲染对方出战预测（双打） ── */
function renderDOppPrediction(valid, predResult) {
  if (!valid.length) return '';
  const {combo4, leadPair, threatMap, spreadWarn} = predResult;
  const c4slugs = new Set(combo4.map(op=>op.slug||op.name||''));
  const leadSlugs = new Set(leadPair.map(op=>op.slug||op.name||''));

  const makePkmEl = (op, isCombo) => {
    const img = op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
    const isLead = leadSlugs.has(op.slug||op.name||'');
    const roles = detectDOppSupportRoles(op);
    const threats = isCombo?(threatMap[op.slug||op.name||'']||[]):[];
    const threatTag = threats.length?`<span class="opp-pred-threat">克制 ${threats.map(n=>esc(n)).join('、')}</span>`:'';
    const leadTag = isLead&&isCombo?`<span class="bd-lead-tag">先发</span>`:'';
    const roleTags = roles.filter(r=>r!=='范围技').map(r=>`<span class="bd-role-tag-opp">${r}</span>`).join('');
    const spreadTag = roles.includes('范围技')?`<span class="bd-spread-tag">范围技</span>`:'';
    return `<div class="battle-opp-pred-item ${isCombo?'':'opp-pred-dim'}">
      ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">` :''}
      <span class="battle-opp-pred-name">${esc(op.name||'?')}</span>
      ${leadTag}${roleTags}${spreadTag}${threatTag}
    </div>`;
  };

  const c4Html = combo4.map(op=>makePkmEl(op,true)).join('');
  const restHtml = valid.filter(op=>!c4slugs.has(op.slug||op.name||'')).map(op=>makePkmEl(op,false)).join('');

  const leadHtml = leadPair.length>=2?`
    <div class="bd-opp-lead-wrap">
      <div class="opp-pred-row-label">预测先发搭档</div>
      <div class="bd-opp-lead-row">
        ${leadPair.map(op=>{
          const img=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
          const roles=detectDOppSupportRoles(op).filter(r=>r!=='范围技');
          return `<div class="bd-opp-lead-pkm">
            ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">` :''}
            <div class="bd-opp-lead-name">${esc(op.name||'?')}</div>
            ${roles.map(r=>`<span class="bd-role-tag-opp">${r}</span>`).join('')}
          </div>`;
        }).join('<div class="bd-lead-plus">+</div>')}
      </div>
    </div>`:'' ;

  const spreadWarnHtml = spreadWarn.length?`
    <div class="bd-spread-warn">
      ⚠ 范围技注意：${spreadWarn.map(w=>`${esc(w.pkmName)} 的 ${esc(w.moveName)}`).join('、')}
    </div>`:'' ;

  return `<div class="battle-opp-pred-wrap">
    <div class="opp-pred-row-label">预测出战4只</div>
    <div class="opp-pred-combo">${c4Html}</div>
    ${restHtml?`<div class="opp-pred-row-label opp-pred-row-label--rest">备选</div><div class="opp-pred-combo">${restHtml}</div>`:''}
    ${leadHtml}
    ${spreadWarnHtml}
  </div>`;
}

/* ── 渲染我方推荐（4只 + 先发搭档） ── */
function renderDoublesRec(top4, leadPairScored, targetOpp) {
  const oppHasIntimidate = targetOpp.some(op=>getOppAbilityList(op).includes('intimidate'));
  const leadSet = new Set(leadPairScored.map(s=>s.pkm?.name||''));
  const rankLabel = ['#1 首选','#2 次选','#3 三选','#4 四选'];
  const rankClass = ['rank-1','rank-2','rank-3','rank-4'];

  const leadHtml = leadPairScored.length>=2?`
    <div class="bd-lead-pair-card">
      <div class="bd-lead-pair-label">推荐先发搭档</div>
      <div class="bd-lead-pair-row">
        ${leadPairScored.map(s=>{
          const p=s.pkm;
          const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">` :'';
          const roles=detectDSupportRoles(p).filter(r=>r!=='范围技');
          return `<div class="bd-lead-pkm">
            <div class="bd-lead-sprite">${img}</div>
            <div class="bd-lead-name">${esc(p.name)}</div>
            ${roles.map(r=>`<span class="bd-role-tag">${r}</span>`).join('')}
          </div>`;
        }).join('<div class="bd-lead-plus">+</div>')}
      </div>
    </div>`:'' ;

  const cardsHtml = top4.map((s,i)=>{
    const pkm=s.pkm;
    const img=pkm._spriteUrl?`<img src="${esc(pkm._spriteUrl)}" alt="" onerror="this.style.display='none'">` :'';
    const role=classifyRole(pkm);
    const isLead=leadSet.has(pkm.name);
    const leadBadge=isLead?`<span class="bd-lead-badge">先发</span>`:'';
    const sRoles=detectDSupportRoles(pkm).filter(r=>r!=='范围技');
    const spreadRoles=detectDSupportRoles(pkm).filter(r=>r==='范围技');
    const supportTag=sRoles.length?`<span class="battle-ability-tag ab-speed">${sRoles[0]}</span>`:'';
    const spreadTag=spreadRoles.length?`<span class="battle-ability-tag ab-weather">范围技</span>`:'';
    const intimidateWarn=oppHasIntimidate&&(role.cls==='role-phys'||role.cls==='role-mixed')?`<div class="battle-rec-reason warn-intimidate">⚠ 对方有恐吓，物攻约降33%</div>`:'';
    return `<div class="battle-rec-card ${rankClass[i]||''}">
      <span class="battle-rec-rank">${rankLabel[i]||''}</span>${leadBadge}
      <div class="battle-rec-sprite">${img}</div>
      <div class="battle-rec-body">
        <div class="battle-rec-name">${esc(pkm.name)}<span class="battle-role-tag ${role.cls}">${role.label}</span>${supportTag}${spreadTag}</div>
        <div class="battle-rec-score">进攻+${s.offScore.toFixed(1)} 防御-${s.defScore.toFixed(1)} 综合${s.total.toFixed(1)}</div>
        <div class="battle-rec-reasons">${s.reasons.map(r=>`<div class="battle-rec-reason">${r}</div>`).join('')}${intimidateWarn}</div>
      </div>
    </div>`;
  }).join('');

  return leadHtml+`<div class="battle-rec-list">${cardsHtml}</div>`;
}

/* ── 主分析入口 ── */
function analyzeDoubles() {
  [0,1,2,3,4,5].forEach(i=>{
    const name=document.getElementById(`bdopp-name-${i}`)?.value.trim()||'';
    const type1=document.getElementById(`bdopp-t1-${i}`)?.value||'';
    const type2=document.getElementById(`bdopp-t2-${i}`)?.value||'';
    const lp=name?PKM_LIST.find(p=>p.name===name):null;
    const sl=lp?.slug||bdOppPkm[i]?.slug||'';
    const builds=window.PKM_CHAMPIONS_BUILDS?.[sl]||null;
    const prev=bdOppPkm[i]||{};
    bdOppPkm[i]={name,type1,type2,base:lp?.stats||{},slug:sl,
      predictedMoves:prev.predictedMoves||builds?.moves||[],
      predictedItem:prev.predictedItem??builds?.item??null,
      predictedAbility:prev.predictedAbility??builds?.ability??null,
      predictedTeammates:prev.predictedTeammates||builds?.teammates||[]};
  });
  const opp=bdOppPkm.filter(p=>p.name||p.type1);
  if(!opp.length){showToast('请至少填入对方一只宝可梦的属性');return;}
  const myTeam=battleTeams.find(t=>t.id===bdMyTeamId);
  if(!myTeam){showToast('请先选择我的阵容');return;}
  const myPkm=(myTeam.pokemon||[]).filter(p=>p.name);
  if(!myPkm.length){showToast('阵容为空，请先录入队伍成员');return;}

  const resultBox=document.getElementById('bd-analysis-result');
  resultBox.style.display='block';
  resultBox.innerHTML=`<div class="battle-analyzing">分析中<span class="battle-analyzing-dots"><span>.</span><span>.</span><span>.</span></span></div>`;

  setTimeout(()=>{
    try{
      const activeWeather=detectMyWeather(myPkm);
      const oppValid=opp.filter(op=>op.name||op.type1);
      const predResult=predictOppDoubles(oppValid,myPkm);
      const targetOpp=predResult.combo4.length>=2?predResult.combo4:oppValid;
      const rawScored=scorePkmForBattle(myPkm,targetOpp,activeWeather);
      const top4scored=selectSynTop4(rawScored);
      const top4=top4scored.slice(0,4);
      const leadPairScored=selectBestLeadPair(top4,predResult.leadPair);
      const oppPredHtml=renderDOppPrediction(oppValid,predResult);
      const myRecHtml=renderDoublesRec(top4,leadPairScored,targetOpp);
      const matrixHtml=renderBattleMatrix(myPkm,opp);
      const speedHtml=renderSpeedAnalysis(rawScored,opp);
      const weakHtml=renderTeamWeaknessWarning(rawScored);
      resultBox.innerHTML=`<div class="battle-result-box">
        ${oppPredHtml?`<div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">🔮 对方出战预测</span><span class="battle-datasrc-note">协同40%+克制我方60% · 先发另行预测</span></div>
          ${oppPredHtml}</div>`:''}
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">推荐出战阵容（双打 6选4）</span></div>
          ${myRecHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">⚠ 队伍脆弱性预警</span></div>
          ${weakHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">速度档位</span></div>
          ${speedHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">属性相克矩阵</span></div>
          ${matrixHtml}</div>
      </div>`;
    }catch(e){
      resultBox.innerHTML=`<div class="battle-analyzing">分析出错：${esc(e.message)}</div>`;
    }
  },80);
}

/* ── 数值工具（双打独立实例，前缀 bdcalc-） ── */
function renderDCalc() {
  const el=document.getElementById('bdtab-calc');
  if(!el||el.dataset.rendered)return;
  el.dataset.rendered='1';
  const natOpts=['', ...Object.keys(NATURES_ZH)].map(n=>`<option value="${n}">${n||'无/中性'}</option>`).join('');
  const statsRows=STAT_KEYS_B.map(k=>`
    <div class="battle-calc-col">
      <span class="bpkm-stat-lbl">${STAT_ZH_B[k]}</span>
      <input class="bpkm-inp-num" id="bdcalc-base-${k}" type="number" min="0" max="255" placeholder="种族" oninput="calcDAllStats()" style="width:52px">
      <input class="bpkm-inp-num" id="bdcalc-iv-${k}" type="number" min="0" max="31" placeholder="个体" value="31" oninput="calcDAllStats()" style="width:52px">
      <input class="bpkm-inp-num" id="bdcalc-ev-${k}" type="number" min="0" max="252" placeholder="努力" value="0" oninput="calcDAllStats()" style="width:52px">
    </div>`).join('');
  el.innerHTML=`<div class="battle-calc-layout">
    <div class="battle-calc-section">
      <div class="battle-side-hdr">输入参数</div>
      <div class="bpkm-form-grid" style="margin-bottom:10px">
        <div class="bpkm-inp-group"><span class="bpkm-inp-label">等级</span><input class="bpkm-inp" id="bdcalc-level" type="number" min="1" max="100" value="50" oninput="calcDAllStats()"></div>
        <div class="bpkm-inp-group"><span class="bpkm-inp-label">性格</span><select class="bpkm-inp" id="bdcalc-nature" onchange="calcDAllStats()">${natOpts}</select></div>
      </div>
      <div class="bpkm-section-hdr" style="margin-bottom:8px">种族值 / 个体值 / 努力值</div>
      <div class="bpkm-stats-block" style="gap:8px">${statsRows}</div>
      <div class="battle-datasrc-note" style="margin-top:10px">※ Champions 格式默认 Lv.50，公式同官方。</div>
    </div>
    <div class="battle-calc-section">
      <div class="battle-side-hdr">计算结果</div>
      <div id="bdcalc-result"><div style="color:var(--t3);font-size:.82rem;padding:.8rem 0">填写左侧数据后自动计算</div></div>
    </div>
  </div>`;
}

function calcDAllStats() {
  const level=parseInt(document.getElementById('bdcalc-level')?.value)||50;
  const nature=document.getElementById('bdcalc-nature')?.value||'';
  const results=STAT_KEYS_B.map(k=>{
    const base=parseInt(document.getElementById(`bdcalc-base-${k}`)?.value)||0;
    const iv=parseInt(document.getElementById(`bdcalc-iv-${k}`)?.value)??31;
    const ev=parseInt(document.getElementById(`bdcalc-ev-${k}`)?.value)||0;
    return {k, val:calcActualStatVal(base,iv,ev,nature,k,level)};
  });
  const el=document.getElementById('bdcalc-result');
  if(!el)return;
  if(!results.some(r=>r.val>0)){el.innerHTML='<div style="color:var(--t3);font-size:.82rem;padding:.8rem 0">填写左侧数据后自动计算</div>';return;}
  const maxV=Math.max(...results.map(r=>r.val),1);
  el.innerHTML=`<div class="battle-calc-result">${results.map(r=>{
    const pct=Math.round(r.val/maxV*100);
    const barColor=r.val>=120?'var(--acc2)':r.val>=80?'var(--acc)':'var(--warn)';
    return `<div class="battle-calc-result-row">
      <span class="battle-calc-stat-name">${STAT_ZH_B[r.k]}</span>
      <div class="battle-calc-stat-bar"><div class="battle-calc-stat-fill" style="width:${pct}%;background:${barColor}"></div></div>
      <span class="battle-calc-stat-val">${r.val}</span>
    </div>`;
  }).join('')}</div>`;
}
