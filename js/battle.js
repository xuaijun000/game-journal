/* ===== 宝可梦对战助手 =====
 * Supabase 建表 SQL（在 Supabase Dashboard > SQL Editor 执行）:
 *
 * CREATE TABLE battle_teams (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id uuid REFERENCES auth.users(id),
 *   team_name text NOT NULL DEFAULT '我的队伍',
 *   pokemon jsonb DEFAULT '[]'::jsonb,
 *   created_at timestamptz DEFAULT now(),
 *   updated_at timestamptz DEFAULT now()
 * );
 * ALTER TABLE battle_teams ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "own_teams" ON battle_teams FOR ALL TO authenticated
 *   USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
 *
 * -- 阵容推荐表（运行 scripts/browser-scrape-teams.js 自动写入）
 * CREATE TABLE IF NOT EXISTS pkm_champions_teams (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   title text DEFAULT '',
 *   player text DEFAULT '',
 *   pokemon jsonb DEFAULT '[]'::jsonb,
 *   tournament text DEFAULT '',
 *   date text DEFAULT '',
 *   record text DEFAULT '',
 *   placement int DEFAULT 0,
 *   votes int DEFAULT 0,
 *   type text DEFAULT 'tournament',
 *   url text DEFAULT '',
 *   created_at timestamptz DEFAULT now()
 * );
 * ALTER TABLE pkm_champions_teams ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "public_read" ON pkm_champions_teams FOR SELECT USING (true);
 * CREATE POLICY "anon_write"  ON pkm_champions_teams FOR INSERT WITH CHECK (true);
 * CREATE POLICY "anon_del"    ON pkm_champions_teams FOR DELETE USING (true);
 * GRANT SELECT, INSERT, DELETE ON TABLE pkm_champions_teams TO anon;
 */

/* ──────── 常量 ──────── */
const B_TYPES=['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
const B_MOVE_CATS_ZH={physical:'物理',special:'特殊',status:'变化'};
const FORM_SUFFIX_ZH={
  'mega':'Mega','mega-x':'Mega X','mega-y':'Mega Y',
  'alola':'阿罗拉','alolan':'阿罗拉',
  'galar':'伽勒尔','galarian':'伽勒尔',
  'hisui':'洗翠','hisuian':'洗翠',
  'paldea':'帕底亚','paldean':'帕底亚',
  'gmax':'极巨化',
  'eternamax':'永极巨化',
  'primal':'原始回归',
  'origin':'起源形态','sky':'天空形态','land':'大地形态',
  'attack':'攻击形态','defense':'防御形态','speed':'速度形态',
  'plant':'植物斗篷','sandy':'沙漠斗篷','trash':'垃圾斗篷',
  'zen':'冥想模式',
  'heat':'暖炉形态','wash':'清洗形态','frost':'冰箱形态','fan':'电扇形态','mow':'割草形态',
  'therian':'灵兽形态','incarnate':'降临形态',
  'black':'黑色形态','white':'白色形态',
  'resolute':'决心形态','ordinary':'普通形态',
  'pirouette':'舞步形态','aria':'歌声形态',
  'complete':'完全形态','core':'50%形态',
  'dusk-mane':'黄昏之鬃','dawn-wings':'黎明之翼',
  'ultra':'究极形态',
  'original':'原始形态',
  'crowned':'王者形态','hero':'英雄形态','single':'单剑形态','rapid':'速攻形态',
  'ice':'冰面形态','noice':'冰面形态',
  'hangry':'饥饿形态','full-belly':'饱腹形态',
  'roaming':'游走形态',
  'family':'家族形态',
  'female':'♀','male':'♂',
};
// 对战数据 — 通过 loadBattleGameData(gameId) 从注册表加载，支持多版本隔离
let MOVES_DATA = [];
let MOVES_BY_SLUG = {};
let PKM_LIST = [];
let PKM_PC_BY_SLUG = {};
let PKM_PC_BY_NUM  = {};
let ITEMS_DATA = [];
let ITEMS_BY_NAME = {};
let ITEMS_BY_SLUG = {};

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
  ITEMS_BY_SLUG = {};
  ITEMS_DATA.forEach(it => { ITEMS_BY_NAME[it.name]=it; ITEMS_BY_SLUG[it.slug]=it; });
}

// ── 以下旧 MOVES_DATA 硬编码已移除，保留占位以避免引用错误 ──
const _MOVES_DATA_LEGACY=[
  // A
  {name:'闪岩攻击',nameEn:'Accelerock',type:'rock',cat:'physical',power:40,acc:100,pp:20},
  {name:'溶化',nameEn:'Acid Armor',type:'poison',cat:'status',power:null,acc:null,pp:20},
  {name:'腐蚀液',nameEn:'Acid Spray',type:'poison',cat:'special',power:40,acc:100,pp:20},
  {name:'特技翻飞',nameEn:'Acrobatics',type:'flying',cat:'physical',power:55,acc:100,pp:16},
  {name:'穴位攻击',nameEn:'Acupressure',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'飞翔神速',nameEn:'Aerial Ace',type:'flying',cat:'physical',power:60,acc:null,pp:20},
  {name:'先礼后兵',nameEn:'After You',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'高速移动',nameEn:'Agility',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'大气切',nameEn:'Air Cutter',type:'flying',cat:'special',power:60,acc:95,pp:20},
  {name:'空气斩',nameEn:'Air Slash',type:'flying',cat:'special',power:75,acc:95,pp:16},
  {name:'引诱之声',nameEn:'Alluring Voice',type:'fairy',cat:'special',power:80,acc:100,pp:12},
  {name:'快速转换',nameEn:'Ally Switch',type:'psychic',cat:'status',power:null,acc:null,pp:16},
  {name:'忘却',nameEn:'Amnesia',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'原始之力',nameEn:'Ancient Power',type:'rock',cat:'special',power:60,acc:100,pp:8},
  {name:'苹果酸',nameEn:'Apple Acid',type:'grass',cat:'special',power:90,acc:100,pp:12},
  {name:'水流切',nameEn:'Aqua Cutter',type:'water',cat:'physical',power:70,acc:100,pp:20},
  {name:'水流喷射',nameEn:'Aqua Jet',type:'water',cat:'physical',power:40,acc:100,pp:20},
  {name:'水之环',nameEn:'Aqua Ring',type:'water',cat:'status',power:null,acc:null,pp:20},
  {name:'水舞步',nameEn:'Aqua Step',type:'water',cat:'physical',power:80,acc:100,pp:12},
  {name:'水流尾击',nameEn:'Aqua Tail',type:'water',cat:'physical',power:90,acc:90,pp:12},
  {name:'盔甲炮击',nameEn:'Armor Cannon',type:'fire',cat:'special',power:120,acc:100,pp:8},
  {name:'芳香迷雾',nameEn:'Aromatic Mist',type:'fairy',cat:'status',power:null,acc:null,pp:20},
  {name:'两肋插刀',nameEn:'Assurance',type:'dark',cat:'physical',power:60,acc:100,pp:12},
  {name:'迷人',nameEn:'Attract',type:'normal',cat:'status',power:null,acc:100,pp:16},
  {name:'波导弹',nameEn:'Aura Sphere',type:'fighting',cat:'special',power:80,acc:null,pp:20},
  {name:'气场轮',nameEn:'Aura Wheel',type:'electric',cat:'physical',power:110,acc:100,pp:12},
  {name:'极光幕',nameEn:'Aurora Veil',type:'ice',cat:'status',power:null,acc:null,pp:20},
  {name:'雪崩',nameEn:'Avalanche',type:'ice',cat:'physical',power:60,acc:100,pp:12},
  {name:'斧腿踢',nameEn:'Axe Kick',type:'fighting',cat:'physical',power:120,acc:90,pp:12},
  // B
  {name:'婴儿眼神',nameEn:'Baby-Doll Eyes',type:'fairy',cat:'status',power:null,acc:100,pp:20},
  {name:'毒蛰防御',nameEn:'Baneful Bunker',type:'poison',cat:'status',power:null,acc:null,pp:8},
  {name:'接力棒',nameEn:'Baton Pass',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'喙炮击',nameEn:'Beak Blast',type:'flying',cat:'physical',power:120,acc:100,pp:8},
  {name:'打群架',nameEn:'Beat Up',type:'dark',cat:'physical',power:null,acc:100,pp:12},
  {name:'打嗝',nameEn:'Belch',type:'poison',cat:'special',power:120,acc:90,pp:12},
  {name:'肚皮鼓',nameEn:'Belly Drum',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'绑紧',nameEn:'Bind',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'咬住',nameEn:'Bite',type:'dark',cat:'physical',power:60,acc:100,pp:20},
  {name:'苦刃',nameEn:'Bitter Blade',type:'fire',cat:'physical',power:90,acc:100,pp:12},
  {name:'苦毒愁念',nameEn:'Bitter Malice',type:'ghost',cat:'special',power:75,acc:100,pp:12},
  {name:'终极火焰',nameEn:'Blast Burn',type:'fire',cat:'special',power:150,acc:90,pp:8},
  {name:'火炎脚',nameEn:'Blaze Kick',type:'fire',cat:'physical',power:85,acc:90,pp:12},
  {name:'暴风雪',nameEn:'Blizzard',type:'ice',cat:'special',power:110,acc:70,pp:8},
  {name:'封锁',nameEn:'Block',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'身体压制',nameEn:'Body Press',type:'fighting',cat:'physical',power:80,acc:100,pp:12},
  {name:'猛力压',nameEn:'Body Slam',type:'normal',cat:'physical',power:85,acc:100,pp:16},
  {name:'骨头连击',nameEn:'Bone Rush',type:'ground',cat:'physical',power:30,acc:90,pp:12},
  {name:'高音爆炸',nameEn:'Boomburst',type:'normal',cat:'special',power:140,acc:100,pp:12},
  {name:'弹跳',nameEn:'Bounce',type:'flying',cat:'physical',power:85,acc:85,pp:8},
  {name:'勇鸟猛攻',nameEn:'Brave Bird',type:'flying',cat:'physical',power:120,acc:100,pp:16},
  {name:'破翼扫击',nameEn:'Breaking Swipe',type:'dragon',cat:'physical',power:60,acc:100,pp:16},
  {name:'碎岩',nameEn:'Brick Break',type:'fighting',cat:'physical',power:75,acc:100,pp:16},
  {name:'残忍挥击',nameEn:'Brutal Swing',type:'dark',cat:'physical',power:60,acc:100,pp:20},
  {name:'虫咬',nameEn:'Bug Bite',type:'bug',cat:'physical',power:60,acc:100,pp:20},
  {name:'虫鸣',nameEn:'Bug Buzz',type:'bug',cat:'special',power:90,acc:100,pp:12},
  {name:'健美',nameEn:'Bulk Up',type:'fighting',cat:'status',power:null,acc:null,pp:20},
  {name:'地盘震动',nameEn:'Bulldoze',type:'ground',cat:'physical',power:60,acc:100,pp:20},
  {name:'子弹拳',nameEn:'Bullet Punch',type:'steel',cat:'physical',power:40,acc:100,pp:20},
  {name:'子弹种子',nameEn:'Bullet Seed',type:'grass',cat:'physical',power:25,acc:100,pp:20},
  {name:'燃烧殆尽',nameEn:'Burn Up',type:'fire',cat:'special',power:130,acc:100,pp:8},
  {name:'嫉妒焚烧',nameEn:'Burning Jealousy',type:'fire',cat:'special',power:70,acc:100,pp:8},
  // C
  {name:'冥想',nameEn:'Calm Mind',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'不尽之刃',nameEn:'Ceaseless Edge',type:'dark',cat:'physical',power:65,acc:90,pp:16},
  {name:'蓄电',nameEn:'Charge',type:'electric',cat:'status',power:null,acc:null,pp:20},
  {name:'充电光线',nameEn:'Charge Beam',type:'electric',cat:'special',power:50,acc:90,pp:12},
  {name:'撒娇',nameEn:'Charm',type:'fairy',cat:'status',power:null,acc:100,pp:20},
  {name:'寒冷之水',nameEn:'Chilling Water',type:'water',cat:'special',power:50,acc:100,pp:20},
  {name:'冬日登场',nameEn:'Chilly Reception',type:'ice',cat:'status',power:null,acc:null,pp:12},
  {name:'投掷摔',nameEn:'Circle Throw',type:'fighting',cat:'physical',power:60,acc:90,pp:12},
  {name:'刺鳞音',nameEn:'Clanging Scales',type:'dragon',cat:'special',power:110,acc:100,pp:8},
  {name:'钢铃之魂',nameEn:'Clangorous Soul',type:'dragon',cat:'status',power:null,acc:null,pp:8},
  {name:'清洗烟雾',nameEn:'Clear Smog',type:'poison',cat:'special',power:50,acc:null,pp:16},
  {name:'近身战',nameEn:'Close Combat',type:'fighting',cat:'physical',power:120,acc:100,pp:8},
  {name:'指导',nameEn:'Coaching',type:'fighting',cat:'status',power:null,acc:null,pp:12},
  {name:'蜷缩',nameEn:'Coil',type:'poison',cat:'status',power:null,acc:null,pp:20},
  {name:'以牙还牙',nameEn:'Comeuppance',type:'dark',cat:'physical',power:null,acc:100,pp:12},
  {name:'迷幻光线',nameEn:'Confuse Ray',type:'ghost',cat:'status',power:null,acc:100,pp:12},
  {name:'模仿跟随',nameEn:'Copycat',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'腐蚀气体',nameEn:'Corrosive Gas',type:'poison',cat:'status',power:null,acc:100,pp:20},
  {name:'宇宙之力',nameEn:'Cosmic Power',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'棉花防御',nameEn:'Cotton Guard',type:'grass',cat:'status',power:null,acc:null,pp:12},
  {name:'棉孢子',nameEn:'Cotton Spore',type:'grass',cat:'status',power:null,acc:100,pp:20},
  {name:'反击',nameEn:'Counter',type:'fighting',cat:'physical',power:null,acc:100,pp:20},
  {name:'贪财',nameEn:'Covet',type:'normal',cat:'physical',power:60,acc:100,pp:20},
  {name:'蟹钳锤击',nameEn:'Crabhammer',type:'water',cat:'physical',power:100,acc:95,pp:12},
  {name:'十字斩',nameEn:'Cross Chop',type:'fighting',cat:'physical',power:100,acc:80,pp:8},
  {name:'毒十字斩',nameEn:'Cross Poison',type:'poison',cat:'physical',power:70,acc:100,pp:20},
  {name:'强力咬碎',nameEn:'Crunch',type:'dark',cat:'physical',power:80,acc:100,pp:16},
  {name:'强力钳击',nameEn:'Crush Claw',type:'normal',cat:'physical',power:75,acc:95,pp:12},
  {name:'诅咒',nameEn:'Curse',type:'ghost',cat:'status',power:null,acc:null,pp:12},
  // D
  {name:'恶之波动',nameEn:'Dark Pulse',type:'dark',cat:'special',power:80,acc:100,pp:16},
  {name:'最暗大背摔',nameEn:'Darkest Lariat',type:'dark',cat:'physical',power:85,acc:100,pp:12},
  {name:'魅惑之星',nameEn:'Dazzling Gleam',type:'fairy',cat:'special',power:80,acc:100,pp:12},
  {name:'装饰',nameEn:'Decorate',type:'fairy',cat:'status',power:null,acc:null,pp:16},
  {name:'清除浓雾',nameEn:'Defog',type:'flying',cat:'status',power:null,acc:null,pp:16},
  {name:'同命',nameEn:'Destiny Bond',type:'ghost',cat:'status',power:null,acc:null,pp:8},
  {name:'感知',nameEn:'Detect',type:'fighting',cat:'status',power:null,acc:null,pp:8},
  {name:'挖洞',nameEn:'Dig',type:'ground',cat:'physical',power:80,acc:100,pp:12},
  {name:'厄运猫爪',nameEn:'Dire Claw',type:'poison',cat:'physical',power:80,acc:100,pp:16},
  {name:'封锁技能',nameEn:'Disable',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'放电',nameEn:'Discharge',type:'electric',cat:'special',power:80,acc:100,pp:16},
  {name:'潜水',nameEn:'Dive',type:'water',cat:'physical',power:80,acc:100,pp:12},
  {name:'双重打击',nameEn:'Double Hit',type:'normal',cat:'physical',power:35,acc:90,pp:12},
  {name:'残影',nameEn:'Double Team',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'舍身冲撞',nameEn:'Double-Edge',type:'normal',cat:'physical',power:120,acc:100,pp:16},
  {name:'流星群',nameEn:'Draco Meteor',type:'dragon',cat:'special',power:130,acc:90,pp:8},
  {name:'龙之援声',nameEn:'Dragon Cheer',type:'dragon',cat:'status',power:null,acc:null,pp:16},
  {name:'龙爪',nameEn:'Dragon Claw',type:'dragon',cat:'physical',power:80,acc:100,pp:16},
  {name:'龙舞',nameEn:'Dragon Dance',type:'dragon',cat:'status',power:null,acc:null,pp:20},
  {name:'龙之镖',nameEn:'Dragon Darts',type:'dragon',cat:'physical',power:50,acc:100,pp:12},
  {name:'龙之波动',nameEn:'Dragon Pulse',type:'dragon',cat:'special',power:85,acc:100,pp:12},
  {name:'龙冲击',nameEn:'Dragon Rush',type:'dragon',cat:'physical',power:100,acc:75,pp:12},
  {name:'龙尾',nameEn:'Dragon Tail',type:'dragon',cat:'physical',power:60,acc:90,pp:12},
  {name:'吸取拳',nameEn:'Drain Punch',type:'fighting',cat:'physical',power:75,acc:100,pp:12},
  {name:'吸力之吻',nameEn:'Draining Kiss',type:'fairy',cat:'special',power:50,acc:100,pp:12},
  {name:'高速喙击',nameEn:'Drill Peck',type:'flying',cat:'physical',power:80,acc:100,pp:20},
  {name:'钻地',nameEn:'Drill Run',type:'ground',cat:'physical',power:80,acc:95,pp:12},
  {name:'双翼击',nameEn:'Dual Wingbeat',type:'flying',cat:'physical',power:40,acc:90,pp:12},
  {name:'爆炸拳',nameEn:'Dynamic Punch',type:'fighting',cat:'physical',power:100,acc:50,pp:8},
  // E
  {name:'大地之力',nameEn:'Earth Power',type:'ground',cat:'special',power:90,acc:100,pp:12},
  {name:'地震',nameEn:'Earthquake',type:'ground',cat:'physical',power:100,acc:100,pp:12},
  {name:'怪异冲动',nameEn:'Eerie Impulse',type:'electric',cat:'status',power:null,acc:100,pp:16},
  {name:'怪异咒语',nameEn:'Eerie Spell',type:'psychic',cat:'special',power:80,acc:100,pp:8},
  {name:'电气地形',nameEn:'Electric Terrain',type:'electric',cat:'status',power:null,acc:null,pp:12},
  {name:'电气化',nameEn:'Electrify',type:'electric',cat:'status',power:null,acc:null,pp:20},
  {name:'电球',nameEn:'Electro Ball',type:'electric',cat:'special',power:null,acc:100,pp:12},
  {name:'充电炮',nameEn:'Electro Shot',type:'electric',cat:'special',power:130,acc:100,pp:12},
  {name:'放电网',nameEn:'Electroweb',type:'electric',cat:'special',power:55,acc:95,pp:16},
  {name:'再来一次',nameEn:'Encore',type:'normal',cat:'status',power:null,acc:100,pp:8},
  {name:'竭尽全力',nameEn:'Endeavor',type:'normal',cat:'physical',power:null,acc:100,pp:8},
  {name:'忍耐',nameEn:'Endure',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'能量球',nameEn:'Energy Ball',type:'grass',cat:'special',power:90,acc:100,pp:12},
  {name:'引入',nameEn:'Entrainment',type:'normal',cat:'status',power:null,acc:100,pp:16},
  {name:'喷发',nameEn:'Eruption',type:'fire',cat:'special',power:150,acc:100,pp:8},
  {name:'念力爆发',nameEn:'Expanding Force',type:'psychic',cat:'special',power:80,acc:100,pp:12},
  {name:'大爆炸',nameEn:'Explosion',type:'normal',cat:'physical',power:250,acc:100,pp:8},
  {name:'超感官',nameEn:'Extrasensory',type:'psychic',cat:'special',power:80,acc:100,pp:20},
  {name:'神速',nameEn:'Extreme Speed',type:'normal',cat:'physical',power:80,acc:100,pp:8},
  // F
  {name:'宝贝脸',nameEn:'Facade',type:'normal',cat:'physical',power:70,acc:100,pp:20},
  {name:'妖精封锁',nameEn:'Fairy Lock',type:'fairy',cat:'status',power:null,acc:null,pp:12},
  {name:'猫手',nameEn:'Fake Out',type:'normal',cat:'physical',power:40,acc:100,pp:12},
  {name:'催泪',nameEn:'Fake Tears',type:'dark',cat:'status',power:null,acc:100,pp:20},
  {name:'羽毛舞',nameEn:'Feather Dance',type:'flying',cat:'status',power:null,acc:100,pp:16},
  {name:'虚张声势',nameEn:'Feint',type:'normal',cat:'physical',power:30,acc:100,pp:12},
  {name:'胜者蜂毒刺',nameEn:'Fell Stinger',type:'bug',cat:'physical',power:50,acc:100,pp:20},
  {name:'变幻光束',nameEn:'Fickle Beam',type:'dragon',cat:'special',power:80,acc:100,pp:8},
  {name:'火焰之舞',nameEn:'Fiery Dance',type:'fire',cat:'special',power:80,acc:100,pp:12},
  {name:'殊死一搏',nameEn:'Final Gambit',type:'fighting',cat:'special',power:null,acc:100,pp:8},
  {name:'大字爆炎',nameEn:'Fire Blast',type:'fire',cat:'special',power:110,acc:85,pp:8},
  {name:'火焰牙',nameEn:'Fire Fang',type:'fire',cat:'physical',power:65,acc:95,pp:16},
  {name:'烈焰鞭打',nameEn:'Fire Lash',type:'fire',cat:'physical',power:90,acc:100,pp:16},
  {name:'火焰拳',nameEn:'Fire Punch',type:'fire',cat:'physical',power:75,acc:100,pp:16},
  {name:'火焰漩涡',nameEn:'Fire Spin',type:'fire',cat:'special',power:35,acc:85,pp:16},
  {name:'先声夺人',nameEn:'First Impression',type:'bug',cat:'physical',power:100,acc:100,pp:12},
  {name:'裂地',nameEn:'Fissure',type:'ground',cat:'physical',power:null,acc:30,pp:8},
  {name:'折腾',nameEn:'Flail',type:'normal',cat:'physical',power:null,acc:100,pp:16},
  {name:'火焰冲锋',nameEn:'Flame Charge',type:'fire',cat:'physical',power:50,acc:100,pp:20},
  {name:'喷射火焰',nameEn:'Flamethrower',type:'fire',cat:'special',power:90,acc:100,pp:16},
  {name:'闪焰冲锋',nameEn:'Flare Blitz',type:'fire',cat:'physical',power:120,acc:100,pp:16},
  {name:'光子炮',nameEn:'Flash Cannon',type:'steel',cat:'special',power:80,acc:100,pp:12},
  {name:'甜言蜜语',nameEn:'Flatter',type:'dark',cat:'status',power:null,acc:100,pp:16},
  {name:'投掷',nameEn:'Fling',type:'dark',cat:'physical',power:null,acc:100,pp:12},
  {name:'翻身回游',nameEn:'Flip Turn',type:'water',cat:'physical',power:60,acc:100,pp:20},
  {name:'花样戏法',nameEn:'Flower Trick',type:'grass',cat:'physical',power:70,acc:null,pp:12},
  {name:'飞翔',nameEn:'Fly',type:'flying',cat:'physical',power:90,acc:95,pp:16},
  {name:'飞膝压',nameEn:'Flying Press',type:'fighting',cat:'physical',power:100,acc:95,pp:12},
  {name:'气合弹',nameEn:'Focus Blast',type:'fighting',cat:'special',power:120,acc:70,pp:8},
  {name:'聚气',nameEn:'Focus Energy',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'意念拳',nameEn:'Focus Punch',type:'fighting',cat:'physical',power:150,acc:100,pp:20},
  {name:'向我来',nameEn:'Follow Me',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'森林诅咒',nameEn:"Forest's Curse",type:'grass',cat:'status',power:null,acc:100,pp:20},
  {name:'恶劣手段',nameEn:'Foul Play',type:'dark',cat:'physical',power:95,acc:100,pp:16},
  {name:'冷冻干燥',nameEn:'Freeze-Dry',type:'ice',cat:'special',power:70,acc:100,pp:20},
  {name:'终极花束',nameEn:'Frenzy Plant',type:'grass',cat:'special',power:150,acc:90,pp:8},
  {name:'霜冻之息',nameEn:'Frost Breath',type:'ice',cat:'special',power:60,acc:90,pp:12},
  {name:'先知',nameEn:'Future Sight',type:'psychic',cat:'special',power:120,acc:100,pp:12},
  // G
  {name:'胃液',nameEn:'Gastro Acid',type:'poison',cat:'status',power:null,acc:100,pp:12},
  {name:'终极吸取',nameEn:'Giga Drain',type:'grass',cat:'special',power:75,acc:100,pp:12},
  {name:'终极冲击',nameEn:'Giga Impact',type:'normal',cat:'physical',power:150,acc:90,pp:8},
  {name:'超亿吨锤',nameEn:'Gigaton Hammer',type:'steel',cat:'physical',power:160,acc:100,pp:8},
  {name:'大蛇凝视',nameEn:'Glare',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'草结',nameEn:'Grass Knot',type:'grass',cat:'special',power:null,acc:100,pp:20},
  {name:'草地急进',nameEn:'Grassy Glide',type:'grass',cat:'physical',power:55,acc:100,pp:20},
  {name:'青草地形',nameEn:'Grassy Terrain',type:'grass',cat:'status',power:null,acc:null,pp:12},
  {name:'重力苹果',nameEn:'Grav Apple',type:'grass',cat:'physical',power:90,acc:100,pp:12},
  {name:'重力',nameEn:'Gravity',type:'psychic',cat:'status',power:null,acc:null,pp:8},
  {name:'生长',nameEn:'Growth',type:'grass',cat:'status',power:null,acc:null,pp:20},
  {name:'防御分割',nameEn:'Guard Split',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'防御交换',nameEn:'Guard Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'断头台',nameEn:'Guillotine',type:'normal',cat:'physical',power:null,acc:30,pp:8},
  {name:'污泥射击',nameEn:'Gunk Shot',type:'poison',cat:'physical',power:120,acc:80,pp:8},
  {name:'陀螺球',nameEn:'Gyro Ball',type:'steel',cat:'physical',power:null,acc:100,pp:8},
  // H
  {name:'铁锤臂膀',nameEn:'Hammer Arm',type:'fighting',cat:'physical',power:100,acc:90,pp:12},
  {name:'硬压',nameEn:'Hard Press',type:'steel',cat:'physical',power:null,acc:100,pp:12},
  {name:'烟雾',nameEn:'Haze',type:'ice',cat:'status',power:null,acc:null,pp:20},
  {name:'碎头',nameEn:'Head Smash',type:'rock',cat:'physical',power:150,acc:80,pp:8},
  {name:'鲁莽冲击',nameEn:'Headlong Rush',type:'ground',cat:'physical',power:120,acc:100,pp:8},
  {name:'治愈铃声',nameEn:'Heal Bell',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'治愈波',nameEn:'Heal Pulse',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'治愈祈祷',nameEn:'Healing Wish',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'高温冲身',nameEn:'Heat Crash',type:'fire',cat:'physical',power:null,acc:100,pp:12},
  {name:'热浪',nameEn:'Heat Wave',type:'fire',cat:'special',power:95,acc:90,pp:12},
  {name:'重力压制',nameEn:'Heavy Slam',type:'steel',cat:'physical',power:null,acc:100,pp:12},
  {name:'帮助',nameEn:'Helping Hand',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'咒语',nameEn:'Hex',type:'ghost',cat:'special',power:65,acc:100,pp:12},
  {name:'超强力马',nameEn:'High Horsepower',type:'ground',cat:'physical',power:95,acc:95,pp:12},
  {name:'飞膝踢',nameEn:'High Jump Kick',type:'fighting',cat:'physical',power:130,acc:90,pp:12},
  {name:'角钻',nameEn:'Horn Drill',type:'normal',cat:'physical',power:null,acc:30,pp:8},
  {name:'吸角',nameEn:'Horn Leech',type:'grass',cat:'physical',power:75,acc:100,pp:12},
  {name:'嚎叫',nameEn:'Howl',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'暴风',nameEn:'Hurricane',type:'flying',cat:'special',power:110,acc:70,pp:12},
  {name:'究极水炮',nameEn:'Hydro Cannon',type:'water',cat:'special',power:150,acc:90,pp:8},
  {name:'水炮',nameEn:'Hydro Pump',type:'water',cat:'special',power:110,acc:80,pp:8},
  {name:'破坏光线',nameEn:'Hyper Beam',type:'normal',cat:'special',power:150,acc:90,pp:8},
  {name:'超音波',nameEn:'Hyper Voice',type:'normal',cat:'special',power:90,acc:100,pp:12},
  {name:'催眠术',nameEn:'Hypnosis',type:'psychic',cat:'status',power:null,acc:60,pp:20},
  // I
  {name:'冰冻光束',nameEn:'Ice Beam',type:'ice',cat:'special',power:90,acc:100,pp:12},
  {name:'冰牙',nameEn:'Ice Fang',type:'ice',cat:'physical',power:65,acc:95,pp:16},
  {name:'冰锤',nameEn:'Ice Hammer',type:'ice',cat:'physical',power:100,acc:90,pp:12},
  {name:'冰冻拳',nameEn:'Ice Punch',type:'ice',cat:'physical',power:75,acc:100,pp:16},
  {name:'冰砾',nameEn:'Ice Shard',type:'ice',cat:'physical',power:40,acc:100,pp:20},
  {name:'旋冰',nameEn:'Ice Spinner',type:'ice',cat:'physical',power:80,acc:100,pp:16},
  {name:'冰柱坠落',nameEn:'Icicle Crash',type:'ice',cat:'physical',power:85,acc:90,pp:12},
  {name:'冰柱针',nameEn:'Icicle Spear',type:'ice',cat:'physical',power:25,acc:100,pp:20},
  {name:'冰风',nameEn:'Icy Wind',type:'ice',cat:'special',power:55,acc:95,pp:16},
  {name:'封印',nameEn:'Imprison',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'怪火游行',nameEn:'Infernal Parade',type:'ghost',cat:'special',power:65,acc:100,pp:16},
  {name:'炼狱',nameEn:'Inferno',type:'fire',cat:'special',power:100,acc:50,pp:8},
  {name:'寄生虫',nameEn:'Infestation',type:'bug',cat:'special',power:20,acc:100,pp:20},
  {name:'扎根',nameEn:'Ingrain',type:'grass',cat:'status',power:null,acc:null,pp:20},
  {name:'指令',nameEn:'Instruct',type:'psychic',cat:'status',power:null,acc:null,pp:16},
  {name:'铁壁',nameEn:'Iron Defense',type:'steel',cat:'status',power:null,acc:null,pp:16},
  {name:'铁头',nameEn:'Iron Head',type:'steel',cat:'physical',power:80,acc:100,pp:16},
  {name:'铁尾',nameEn:'Iron Tail',type:'steel',cat:'physical',power:100,acc:75,pp:16},
  // J
  {name:'喷射拳',nameEn:'Jet Punch',type:'water',cat:'physical',power:60,acc:100,pp:16},
  // K
  {name:'王者之盾',nameEn:"King's Shield",type:'steel',cat:'status',power:null,acc:null,pp:8},
  {name:'拍落',nameEn:'Knock Off',type:'dark',cat:'physical',power:65,acc:100,pp:20},
  {name:'叩头斩',nameEn:'Kowtow Cleave',type:'dark',cat:'physical',power:85,acc:null,pp:12},
  // L
  {name:'迁怒',nameEn:'Lash Out',type:'dark',cat:'physical',power:75,acc:100,pp:8},
  {name:'孤注一掷',nameEn:'Last Resort',type:'normal',cat:'physical',power:140,acc:100,pp:8},
  {name:'最后敬意',nameEn:'Last Respects',type:'ghost',cat:'physical',power:50,acc:100,pp:12},
  {name:'熔岩风暴',nameEn:'Lava Plume',type:'fire',cat:'special',power:80,acc:100,pp:16},
  {name:'叶刃',nameEn:'Leaf Blade',type:'grass',cat:'physical',power:90,acc:100,pp:16},
  {name:'飞叶风暴',nameEn:'Leaf Storm',type:'grass',cat:'special',power:130,acc:90,pp:8},
  {name:'吸血',nameEn:'Leech Life',type:'bug',cat:'physical',power:80,acc:100,pp:12},
  {name:'寄生种子',nameEn:'Leech Seed',type:'grass',cat:'status',power:null,acc:90,pp:12},
  {name:'生命之水',nameEn:'Life Dew',type:'water',cat:'status',power:null,acc:null,pp:12},
  {name:'光墙',nameEn:'Light Screen',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'破灭之光',nameEn:'Light of Ruin',type:'fairy',cat:'special',power:140,acc:90,pp:8},
  {name:'水流裂破',nameEn:'Liquidation',type:'water',cat:'physical',power:85,acc:100,pp:12},
  {name:'锁定',nameEn:'Lock-On',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'低踢',nameEn:'Low Kick',type:'fighting',cat:'physical',power:null,acc:100,pp:20},
  {name:'扫脚',nameEn:'Low Sweep',type:'fighting',cat:'physical',power:65,acc:100,pp:20},
  {name:'光子崩射',nameEn:'Lumina Crash',type:'psychic',cat:'special',power:80,acc:100,pp:12},
  {name:'弹跳冲击',nameEn:'Lunge',type:'bug',cat:'physical',power:80,acc:100,pp:16},
  // M
  {name:'马赫拳',nameEn:'Mach Punch',type:'fighting',cat:'physical',power:40,acc:100,pp:20},
  {name:'魔法粉末',nameEn:'Magic Powder',type:'psychic',cat:'status',power:null,acc:100,pp:20},
  {name:'奇异空间',nameEn:'Magic Room',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'磁力浮游',nameEn:'Magnet Rise',type:'electric',cat:'status',power:null,acc:null,pp:12},
  {name:'磁力扰动',nameEn:'Magnetic Flux',type:'electric',cat:'status',power:null,acc:null,pp:20},
  {name:'飞叶抓取',nameEn:'Matcha Gotcha',type:'grass',cat:'special',power:80,acc:90,pp:16},
  {name:'怪异眼神',nameEn:'Mean Look',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'超级踢击',nameEn:'Mega Kick',type:'normal',cat:'physical',power:120,acc:75,pp:8},
  {name:'大角',nameEn:'Megahorn',type:'bug',cat:'physical',power:120,acc:85,pp:12},
  {name:'遗志',nameEn:'Memento',type:'dark',cat:'status',power:null,acc:100,pp:12},
  {name:'金属爆炸',nameEn:'Metal Burst',type:'steel',cat:'physical',power:null,acc:100,pp:12},
  {name:'金属音',nameEn:'Metal Sound',type:'steel',cat:'status',power:null,acc:85,pp:20},
  {name:'流星射线',nameEn:'Meteor Beam',type:'rock',cat:'special',power:120,acc:90,pp:12},
  {name:'流星拳',nameEn:'Meteor Mash',type:'steel',cat:'physical',power:90,acc:90,pp:12},
  {name:'牛奶汲取',nameEn:'Milk Drink',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'变小',nameEn:'Minimize',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'镜面防御',nameEn:'Mirror Coat',type:'psychic',cat:'special',power:null,acc:100,pp:20},
  {name:'迷雾爆炸',nameEn:'Misty Explosion',type:'fairy',cat:'special',power:100,acc:100,pp:8},
  {name:'迷雾地形',nameEn:'Misty Terrain',type:'fairy',cat:'status',power:null,acc:null,pp:12},
  {name:'月亮之力',nameEn:'Moonblast',type:'fairy',cat:'special',power:95,acc:100,pp:16},
  {name:'月光',nameEn:'Moonlight',type:'fairy',cat:'status',power:null,acc:null,pp:8},
  {name:'朝日',nameEn:'Morning Sun',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'致命旋转',nameEn:'Mortal Spin',type:'poison',cat:'physical',power:30,acc:100,pp:16},
  {name:'山岭烈风',nameEn:'Mountain Gale',type:'ice',cat:'physical',power:120,acc:85,pp:12},
  {name:'泥泞射击',nameEn:'Mud Shot',type:'ground',cat:'special',power:55,acc:95,pp:16},
  {name:'泥巴',nameEn:'Mud-Slap',type:'ground',cat:'special',power:20,acc:100,pp:12},
  {name:'污浊之水',nameEn:'Muddy Water',type:'water',cat:'special',power:90,acc:85,pp:12},
  {name:'神秘之火',nameEn:'Mystical Fire',type:'fire',cat:'special',power:75,acc:100,pp:12},
  // N
  {name:'诡计',nameEn:'Nasty Plot',type:'dark',cat:'status',power:null,acc:null,pp:20},
  {name:'暗影驱散',nameEn:'Night Daze',type:'dark',cat:'special',power:90,acc:95,pp:12},
  {name:'夜之暗影',nameEn:'Night Shade',type:'ghost',cat:'special',power:null,acc:100,pp:16},
  {name:'夜袭',nameEn:'Night Slash',type:'dark',cat:'physical',power:70,acc:100,pp:20},
  {name:'英勇怒吼',nameEn:'Noble Roar',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'磨蹭',nameEn:'Nuzzle',type:'electric',cat:'physical',power:20,acc:100,pp:20},
  // O
  {name:'逆鳞',nameEn:'Outrage',type:'dragon',cat:'physical',power:120,acc:100,pp:12},
  {name:'过热',nameEn:'Overheat',type:'fire',cat:'special',power:130,acc:90,pp:8},
  // P
  {name:'分担痛苦',nameEn:'Pain Split',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'抛物线充电',nameEn:'Parabolic Charge',type:'electric',cat:'special',power:65,acc:100,pp:20},
  {name:'抛下狠话',nameEn:'Parting Shot',type:'dark',cat:'status',power:null,acc:100,pp:20},
  {name:'以怨报怨',nameEn:'Payback',type:'dark',cat:'physical',power:50,acc:100,pp:12},
  {name:'灭亡之歌',nameEn:'Perish Song',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'花瓣风暴',nameEn:'Petal Blizzard',type:'grass',cat:'physical',power:90,acc:100,pp:16},
  {name:'花舞',nameEn:'Petal Dance',type:'grass',cat:'special',power:120,acc:100,pp:12},
  {name:'虚空剪影',nameEn:'Phantom Force',type:'ghost',cat:'physical',power:90,acc:100,pp:12},
  {name:'飞刺',nameEn:'Pin Missile',type:'bug',cat:'physical',power:25,acc:95,pp:20},
  {name:'乱撒娇',nameEn:'Play Rough',type:'fairy',cat:'physical',power:90,acc:90,pp:12},
  {name:'啄食',nameEn:'Pluck',type:'flying',cat:'physical',power:60,acc:100,pp:20},
  {name:'毒牙',nameEn:'Poison Fang',type:'poison',cat:'physical',power:50,acc:100,pp:16},
  {name:'毒击',nameEn:'Poison Jab',type:'poison',cat:'physical',power:80,acc:100,pp:20},
  {name:'毒粉',nameEn:'Poison Powder',type:'poison',cat:'status',power:null,acc:75,pp:20},
  {name:'花粉团',nameEn:'Pollen Puff',type:'bug',cat:'special',power:90,acc:100,pp:16},
  {name:'骚灵',nameEn:'Poltergeist',type:'ghost',cat:'physical',power:110,acc:90,pp:8},
  {name:'人海战术',nameEn:'Population Bomb',type:'normal',cat:'physical',power:20,acc:90,pp:12},
  {name:'虫爪扑击',nameEn:'Pounce',type:'bug',cat:'physical',power:50,acc:100,pp:20},
  {name:'宝石光线',nameEn:'Power Gem',type:'rock',cat:'special',power:80,acc:100,pp:20},
  {name:'能力转移',nameEn:'Power Shift',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'能力分割',nameEn:'Power Split',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'能力交换',nameEn:'Power Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'能力互换',nameEn:'Power Trick',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'怒气倍增',nameEn:'Power Trip',type:'dark',cat:'physical',power:20,acc:100,pp:12},
  {name:'强力鞭打',nameEn:'Power Whip',type:'grass',cat:'physical',power:120,acc:85,pp:12},
  {name:'守住',nameEn:'Protect',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'模仿',nameEn:'Psych Up',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'精神强念',nameEn:'Psychic',type:'psychic',cat:'special',power:90,acc:100,pp:12},
  {name:'超能毒牙',nameEn:'Psychic Fangs',type:'psychic',cat:'physical',power:85,acc:100,pp:12},
  {name:'超能噪音',nameEn:'Psychic Noise',type:'psychic',cat:'special',power:75,acc:100,pp:12},
  {name:'精神地形',nameEn:'Psychic Terrain',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'念力斩',nameEn:'Psycho Cut',type:'psychic',cat:'physical',power:70,acc:100,pp:20},
  {name:'念力防护冲撞',nameEn:'Psyshield Bash',type:'psychic',cat:'physical',power:90,acc:90,pp:12},
  {name:'精神冲击',nameEn:'Psyshock',type:'psychic',cat:'special',power:80,acc:100,pp:12},
  // Q
  {name:'压制',nameEn:'Quash',type:'dark',cat:'status',power:null,acc:100,pp:16},
  {name:'电光一闪',nameEn:'Quick Attack',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'神速防御',nameEn:'Quick Guard',type:'fighting',cat:'status',power:null,acc:null,pp:16},
  {name:'蝶舞',nameEn:'Quiver Dance',type:'bug',cat:'status',power:null,acc:null,pp:20},
  // R
  {name:'愤怒粉',nameEn:'Rage Powder',type:'bug',cat:'status',power:null,acc:null,pp:20},
  {name:'激怒公牛',nameEn:'Raging Bull',type:'normal',cat:'physical',power:90,acc:100,pp:12},
  {name:'暴怒烈焰',nameEn:'Raging Fury',type:'fire',cat:'physical',power:120,acc:100,pp:12},
  {name:'下雨',nameEn:'Rain Dance',type:'water',cat:'status',power:null,acc:null,pp:8},
  {name:'高速旋转',nameEn:'Rapid Spin',type:'normal',cat:'physical',power:50,acc:100,pp:20},
  {name:'贝壳刃',nameEn:'Razor Shell',type:'water',cat:'physical',power:75,acc:95,pp:12},
  {name:'回复',nameEn:'Recover',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'回收',nameEn:'Recycle',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'反射壁',nameEn:'Reflect',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'类型转换',nameEn:'Reflect Type',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'睡眠',nameEn:'Rest',type:'psychic',cat:'status',power:null,acc:null,pp:8},
  {name:'拼死一搏',nameEn:'Reversal',type:'fighting',cat:'physical',power:null,acc:100,pp:16},
  {name:'升压打击',nameEn:'Rising Voltage',type:'electric',cat:'special',power:70,acc:100,pp:20},
  {name:'怒吼',nameEn:'Roar',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'连续岩石',nameEn:'Rock Blast',type:'rock',cat:'physical',power:25,acc:90,pp:12},
  {name:'岩石磨光',nameEn:'Rock Polish',type:'rock',cat:'status',power:null,acc:null,pp:20},
  {name:'岩崩',nameEn:'Rock Slide',type:'rock',cat:'physical',power:75,acc:90,pp:12},
  {name:'落石封堵',nameEn:'Rock Tomb',type:'rock',cat:'physical',power:60,acc:95,pp:16},
  {name:'岩石炸弹',nameEn:'Rock Wrecker',type:'rock',cat:'physical',power:150,acc:90,pp:8},
  {name:'角色扮演',nameEn:'Role Play',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'羽栖',nameEn:'Roost',type:'flying',cat:'status',power:null,acc:null,pp:8},
  {name:'合唱',nameEn:'Round',type:'normal',cat:'special',power:60,acc:100,pp:16},
  // S
  {name:'圣剑',nameEn:'Sacred Sword',type:'fighting',cat:'physical',power:90,acc:100,pp:16},
  {name:'神秘防护',nameEn:'Safeguard',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'盐腌',nameEn:'Salt Cure',type:'rock',cat:'physical',power:40,acc:100,pp:16},
  {name:'沙埋',nameEn:'Sand Tomb',type:'ground',cat:'physical',power:35,acc:85,pp:16},
  {name:'沙暴',nameEn:'Sandstorm',type:'rock',cat:'status',power:null,acc:null,pp:8},
  {name:'热水',nameEn:'Scald',type:'water',cat:'special',power:80,acc:100,pp:16},
  {name:'鳞片射击',nameEn:'Scale Shot',type:'dragon',cat:'physical',power:25,acc:90,pp:20},
  {name:'可怕表情',nameEn:'Scary Face',type:'normal',cat:'status',power:null,acc:100,pp:12},
  {name:'滚烫沙土',nameEn:'Scorching Sands',type:'ground',cat:'special',power:70,acc:100,pp:12},
  {name:'尖叫',nameEn:'Screech',type:'normal',cat:'status',power:null,acc:85,pp:20},
  {name:'种子机关枪',nameEn:'Seed Bomb',type:'grass',cat:'physical',power:80,acc:100,pp:16},
  {name:'地球抛摔',nameEn:'Seismic Toss',type:'fighting',cat:'physical',power:null,acc:100,pp:20},
  {name:'玉石俱碎',nameEn:'Self-Destruct',type:'normal',cat:'physical',power:200,acc:100,pp:8},
  {name:'暗影球',nameEn:'Shadow Ball',type:'ghost',cat:'special',power:80,acc:100,pp:16},
  {name:'影爪',nameEn:'Shadow Claw',type:'ghost',cat:'physical',power:70,acc:100,pp:16},
  {name:'暗影拳',nameEn:'Shadow Punch',type:'ghost',cat:'physical',power:60,acc:null,pp:20},
  {name:'暗影偷袭',nameEn:'Shadow Sneak',type:'ghost',cat:'physical',power:40,acc:100,pp:20},
  {name:'蛇尾分身',nameEn:'Shed Tail',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'绝对零度',nameEn:'Sheer Cold',type:'ice',cat:'special',power:null,acc:30,pp:8},
  {name:'甲壳侧臂炮',nameEn:'Shell Side Arm',type:'poison',cat:'special',power:90,acc:100,pp:12},
  {name:'破壳',nameEn:'Shell Smash',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'防护壳',nameEn:'Shelter',type:'steel',cat:'status',power:null,acc:null,pp:12},
  {name:'单纯光线',nameEn:'Simple Beam',type:'normal',cat:'status',power:null,acc:100,pp:16},
  {name:'歌唱',nameEn:'Sing',type:'normal',cat:'status',power:null,acc:55,pp:16},
  {name:'技能交换',nameEn:'Skill Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'急袭爪',nameEn:'Skitter Smack',type:'bug',cat:'physical',power:70,acc:90,pp:12},
  {name:'神鸟猛攻',nameEn:'Sky Attack',type:'flying',cat:'physical',power:140,acc:90,pp:8},
  {name:'偷懒',nameEn:'Slack Off',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'眠粉',nameEn:'Sleep Powder',type:'grass',cat:'status',power:null,acc:75,pp:16},
  {name:'梦话',nameEn:'Sleep Talk',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'污泥炸弹',nameEn:'Sludge Bomb',type:'poison',cat:'special',power:90,acc:100,pp:12},
  {name:'污泥浪',nameEn:'Sludge Wave',type:'poison',cat:'special',power:95,acc:100,pp:12},
  {name:'打落',nameEn:'Smack Down',type:'rock',cat:'physical',power:50,acc:100,pp:16},
  {name:'智能钢刺',nameEn:'Smart Strike',type:'steel',cat:'physical',power:70,acc:null,pp:12},
  {name:'钢铁陷阱',nameEn:'Snap Trap',type:'steel',cat:'physical',power:35,acc:100,pp:16},
  {name:'咆哮',nameEn:'Snarl',type:'dark',cat:'special',power:55,acc:95,pp:16},
  {name:'打鼾',nameEn:'Snore',type:'normal',cat:'special',power:50,acc:100,pp:16},
  {name:'雪景',nameEn:'Snowscape',type:'ice',cat:'status',power:null,acc:null,pp:8},
  {name:'浸透',nameEn:'Soak',type:'water',cat:'status',power:null,acc:100,pp:20},
  {name:'生蛋',nameEn:'Soft-Boiled',type:'normal',cat:'status',power:null,acc:null,pp:8},
  {name:'太阳光束',nameEn:'Solar Beam',type:'grass',cat:'special',power:120,acc:100,pp:12},
  {name:'太阳之刃',nameEn:'Solar Blade',type:'grass',cat:'physical',power:125,acc:100,pp:12},
  {name:'闪耀咏叹调',nameEn:'Sparkling Aria',type:'water',cat:'special',power:90,acc:100,pp:12},
  {name:'速度交换',nameEn:'Speed Swap',type:'psychic',cat:'status',power:null,acc:null,pp:12},
  {name:'辣椒提取',nameEn:'Spicy Extract',type:'grass',cat:'status',power:null,acc:null,pp:16},
  {name:'撒菱',nameEn:'Spikes',type:'ground',cat:'status',power:null,acc:null,pp:20},
  {name:'尖刺防御',nameEn:'Spiky Shield',type:'grass',cat:'status',power:null,acc:null,pp:8},
  {name:'魂之打击',nameEn:'Spirit Break',type:'fairy',cat:'physical',power:75,acc:100,pp:16},
  {name:'影缝',nameEn:'Spirit Shackle',type:'ghost',cat:'physical',power:90,acc:100,pp:12},
  {name:'孢子',nameEn:'Spore',type:'grass',cat:'status',power:null,acc:100,pp:16},
  {name:'隐形岩',nameEn:'Stealth Rock',type:'rock',cat:'status',power:null,acc:null,pp:20},
  {name:'钢铁光束',nameEn:'Steel Beam',type:'steel',cat:'special',power:140,acc:95,pp:8},
  {name:'钢铁滚轮',nameEn:'Steel Roller',type:'steel',cat:'physical',power:130,acc:100,pp:8},
  {name:'钢铁翅膀',nameEn:'Steel Wing',type:'steel',cat:'physical',power:70,acc:90,pp:16},
  {name:'暴躁跺脚',nameEn:'Stomping Tantrum',type:'ground',cat:'physical',power:75,acc:100,pp:12},
  {name:'石斧',nameEn:'Stone Axe',type:'rock',cat:'physical',power:65,acc:90,pp:12},
  {name:'尖石攻击',nameEn:'Stone Edge',type:'rock',cat:'physical',power:100,acc:80,pp:8},
  {name:'暴风投',nameEn:'Storm Throw',type:'fighting',cat:'physical',power:60,acc:100,pp:12},
  {name:'力量储备',nameEn:'Stored Power',type:'psychic',cat:'special',power:20,acc:100,pp:12},
  {name:'丝网',nameEn:'String Shot',type:'bug',cat:'status',power:null,acc:95,pp:20},
  {name:'虫虫困扰',nameEn:'Struggle Bug',type:'bug',cat:'special',power:50,acc:100,pp:20},
  {name:'抱摔',nameEn:'Submission',type:'fighting',cat:'physical',power:80,acc:80,pp:12},
  {name:'替身',nameEn:'Substitute',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'晴天',nameEn:'Sunny Day',type:'fire',cat:'status',power:null,acc:null,pp:8},
  {name:'超力',nameEn:'Superpower',type:'fighting',cat:'physical',power:120,acc:100,pp:8},
  {name:'超音波',nameEn:'Supersonic',type:'normal',cat:'status',power:null,acc:55,pp:20},
  {name:'冲浪',nameEn:'Surf',type:'water',cat:'special',power:90,acc:100,pp:16},
  {name:'大言不惭',nameEn:'Swagger',type:'normal',cat:'status',power:null,acc:85,pp:16},
  {name:'甜蜜之吻',nameEn:'Sweet Kiss',type:'fairy',cat:'status',power:null,acc:75,pp:12},
  {name:'甜甜香气',nameEn:'Sweet Scent',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'飞速星星',nameEn:'Swift',type:'normal',cat:'special',power:60,acc:null,pp:20},
  {name:'剑舞',nameEn:'Swords Dance',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'糖浆炸弹',nameEn:'Syrup Bomb',type:'grass',cat:'special',power:60,acc:90,pp:12},
  // T
  {name:'尾拍',nameEn:'Tail Slap',type:'normal',cat:'physical',power:25,acc:85,pp:12},
  {name:'挑衅',nameEn:'Taunt',type:'dark',cat:'status',power:null,acc:100,pp:20},
  {name:'太晶爆发',nameEn:'Tera Blast',type:'normal',cat:'special',power:80,acc:100,pp:12},
  {name:'地形脉冲',nameEn:'Terrain Pulse',type:'normal',cat:'special',power:50,acc:100,pp:16},
  {name:'喉击',nameEn:'Throat Chop',type:'dark',cat:'physical',power:80,acc:100,pp:16},
  {name:'打雷',nameEn:'Thunder',type:'electric',cat:'special',power:110,acc:70,pp:12},
  {name:'电力牙',nameEn:'Thunder Fang',type:'electric',cat:'physical',power:65,acc:95,pp:16},
  {name:'雷电拳',nameEn:'Thunder Punch',type:'electric',cat:'physical',power:75,acc:100,pp:16},
  {name:'电磁波',nameEn:'Thunder Wave',type:'electric',cat:'status',power:null,acc:90,pp:20},
  {name:'十万伏特',nameEn:'Thunderbolt',type:'electric',cat:'special',power:90,acc:100,pp:16},
  {name:'搔痒',nameEn:'Tickle',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'骚扰',nameEn:'Torment',type:'dark',cat:'status',power:null,acc:100,pp:16},
  {name:'剧毒',nameEn:'Toxic',type:'poison',cat:'status',power:null,acc:90,pp:12},
  {name:'毒菱',nameEn:'Toxic Spikes',type:'poison',cat:'status',power:null,acc:null,pp:20},
  {name:'毒丝',nameEn:'Toxic Thread',type:'poison',cat:'status',power:null,acc:100,pp:20},
  {name:'先锋开路',nameEn:'Trailblaze',type:'grass',cat:'physical',power:50,acc:100,pp:20},
  {name:'戏弄',nameEn:'Trick',type:'psychic',cat:'status',power:null,acc:100,pp:12},
  {name:'戏法空间',nameEn:'Trick Room',type:'psychic',cat:'status',power:null,acc:null,pp:8},
  {name:'三重转踢',nameEn:'Triple Axel',type:'ice',cat:'physical',power:20,acc:90,pp:12},
  {name:'三连扑水',nameEn:'Triple Dive',type:'water',cat:'physical',power:30,acc:95,pp:12},
  {name:'热带踢',nameEn:'Trop Kick',type:'grass',cat:'physical',power:85,acc:100,pp:16},
  // U
  {name:'急速折返',nameEn:'U-turn',type:'bug',cat:'physical',power:70,acc:100,pp:20},
  {name:'占先手',nameEn:'Upper Hand',type:'fighting',cat:'physical',power:65,acc:100,pp:16},
  {name:'喧闹',nameEn:'Uproar',type:'normal',cat:'special',power:90,acc:100,pp:12},
  // V
  {name:'真空波',nameEn:'Vacuum Wave',type:'fighting',cat:'special',power:40,acc:100,pp:20},
  {name:'伏特替换',nameEn:'Volt Switch',type:'electric',cat:'special',power:70,acc:100,pp:20},
  // W
  {name:'水之誓约',nameEn:'Water Pledge',type:'water',cat:'special',power:80,acc:100,pp:12},
  {name:'水流转珠',nameEn:'Water Pulse',type:'water',cat:'special',power:60,acc:100,pp:20},
  {name:'飞水手里剑',nameEn:'Water Shuriken',type:'water',cat:'special',power:15,acc:100,pp:20},
  {name:'攀瀑',nameEn:'Waterfall',type:'water',cat:'physical',power:80,acc:100,pp:16},
  {name:'海浪撞击',nameEn:'Wave Crash',type:'water',cat:'physical',power:120,acc:100,pp:12},
  {name:'天气球',nameEn:'Weather Ball',type:'normal',cat:'special',power:50,acc:100,pp:12},
  {name:'漩涡',nameEn:'Whirlpool',type:'water',cat:'special',power:35,acc:85,pp:16},
  {name:'广域防护',nameEn:'Wide Guard',type:'rock',cat:'status',power:null,acc:null,pp:16},
  {name:'鬼火',nameEn:'Will-O-Wisp',type:'fire',cat:'status',power:null,acc:85,pp:16},
  {name:'许愿',nameEn:'Wish',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'木槌',nameEn:'Wood Hammer',type:'grass',cat:'physical',power:120,acc:100,pp:16},
  {name:'杞人忧天',nameEn:'Worry Seed',type:'grass',cat:'status',power:null,acc:100,pp:16},
  // X
  {name:'十字剪',nameEn:'X-Scissor',type:'bug',cat:'physical',power:80,acc:100,pp:16},
  // Y
  {name:'打哈欠',nameEn:'Yawn',type:'normal',cat:'status',power:null,acc:null,pp:12},
  // Z
  {name:'禅思头槌',nameEn:'Zen Headbutt',type:'psychic',cat:'physical',power:80,acc:90,pp:16},
  {name:'闪电炮',nameEn:'Zap Cannon',type:'electric',cat:'special',power:120,acc:50,pp:8},
  {name:'嗞嗞电击',nameEn:'Zing Zap',type:'electric',cat:'physical',power:80,acc:100,pp:12},
  // ── 补全：旧世代 / 传说专属 / 冷门招式 ──
  // A+
  {name:'吸取',nameEn:'Absorb',type:'grass',cat:'special',power:20,acc:100,pp:20},
  {name:'强酸',nameEn:'Acid',type:'poison',cat:'special',power:40,acc:100,pp:20},
  {name:'气功炮',nameEn:'Aeroblast',type:'flying',cat:'special',power:100,acc:95,pp:8},
  {name:'推推手',nameEn:'Arm Thrust',type:'fighting',cat:'physical',power:15,acc:100,pp:20},
  {name:'芳香治疗',nameEn:'Aromatherapy',type:'grass',cat:'status',power:null,acc:null,pp:8},
  {name:'援助',nameEn:'Assist',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'惊吓',nameEn:'Astonish',type:'ghost',cat:'physical',power:30,acc:100,pp:16},
  {name:'星辰连击',nameEn:'Astral Barrage',type:'ghost',cat:'special',power:120,acc:100,pp:8},
  {name:'进攻命令',nameEn:'Attack Order',type:'bug',cat:'physical',power:90,acc:100,pp:16},
  {name:'极光线',nameEn:'Aurora Beam',type:'ice',cat:'special',power:65,acc:100,pp:20},
  {name:'轻量化',nameEn:'Autotomize',type:'steel',cat:'status',power:null,acc:null,pp:16},
  // B+
  {name:'刺针连射',nameEn:'Barb Barrage',type:'poison',cat:'physical',power:60,acc:100,pp:12},
  {name:'连续出击',nameEn:'Barrage',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'壁垒',nameEn:'Barrier',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'赠送',nameEn:'Bestow',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'待机',nameEn:'Bide',type:'normal',cat:'physical',power:null,acc:null,pp:12},
  {name:'荒风暴',nameEn:'Bleakwind Storm',type:'flying',cat:'special',power:100,acc:80,pp:8},
  {name:'血月',nameEn:'Blood Moon',type:'normal',cat:'special',power:140,acc:100,pp:8},
  {name:'蓝焰炮',nameEn:'Blue Flare',type:'fire',cat:'special',power:130,acc:85,pp:8},
  {name:'闪电鸟喙',nameEn:'Bolt Beak',type:'electric',cat:'physical',power:85,acc:100,pp:12},
  {name:'超级雷击',nameEn:'Bolt Strike',type:'electric',cat:'physical',power:130,acc:85,pp:8},
  {name:'骨棒',nameEn:'Bone Club',type:'ground',cat:'physical',power:65,acc:85,pp:20},
  {name:'回旋骨',nameEn:'Bonemerang',type:'ground',cat:'physical',power:50,acc:90,pp:12},
  {name:'盐水',nameEn:'Brine',type:'water',cat:'special',power:65,acc:100,pp:12},
  {name:'水泡',nameEn:'Bubble',type:'water',cat:'special',power:40,acc:100,pp:20},
  {name:'泡泡光线',nameEn:'Bubble Beam',type:'water',cat:'special',power:65,acc:100,pp:20},
  {name:'炎熔盾',nameEn:'Burning Bulwark',type:'fire',cat:'status',power:null,acc:null,pp:8},
  // C+
  {name:'变色伪装',nameEn:'Camouflage',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'魅惑',nameEn:'Captivate',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'庆祝',nameEn:'Celebrate',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'喋喋不休',nameEn:'Chatter',type:'flying',cat:'special',power:65,acc:100,pp:20},
  {name:'不休攻击',nameEn:'Chip Away',type:'normal',cat:'physical',power:70,acc:100,pp:20},
  {name:'绿化炮',nameEn:'Chloroblast',type:'grass',cat:'special',power:150,acc:95,pp:8},
  {name:'夹击',nameEn:'Clamp',type:'water',cat:'physical',power:35,acc:85,pp:16},
  {name:'碰撞路线',nameEn:'Collision Course',type:'fighting',cat:'physical',power:100,acc:100,pp:8},
  {name:'战斗扭矩',nameEn:'Combat Torque',type:'normal',cat:'physical',power:80,acc:100,pp:12},
  {name:'彗星拳',nameEn:'Comet Punch',type:'normal',cat:'physical',power:18,acc:85,pp:16},
  {name:'安慰',nameEn:'Confide',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'念力',nameEn:'Confusion',type:'psychic',cat:'special',power:50,acc:100,pp:20},
  {name:'束缚',nameEn:'Constrict',type:'normal',cat:'physical',power:10,acc:100,pp:20},
  {name:'变换',nameEn:'Conversion',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'核心惩处',nameEn:'Core Enforcer',type:'dragon',cat:'special',power:100,acc:100,pp:8},
  {name:'场地交换',nameEn:'Court Change',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'奇妙防御',nameEn:'Crafty Shield',type:'fairy',cat:'status',power:null,acc:null,pp:16},
  {name:'强力握碎',nameEn:'Crush Grip',type:'normal',cat:'physical',power:null,acc:100,pp:8},
  {name:'切割',nameEn:'Cut',type:'normal',cat:'physical',power:50,acc:95,pp:20},
  // D+
  {name:'暗黑陷阱',nameEn:'Dark Void',type:'dark',cat:'status',power:null,acc:50,pp:8},
  {name:'防御命令',nameEn:'Defend Order',type:'bug',cat:'status',power:null,acc:null,pp:16},
  {name:'防御蜷缩',nameEn:'Defense Curl',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'钻石风暴',nameEn:'Diamond Storm',type:'rock',cat:'physical',power:100,acc:95,pp:8},
  {name:'解除魅力',nameEn:'Disarming Voice',type:'fairy',cat:'special',power:40,acc:null,pp:16},
  {name:'眩晕拳',nameEn:'Dizzy Punch',type:'normal',cat:'physical',power:70,acc:100,pp:12},
  {name:'涂鸦',nameEn:'Doodle',type:'normal',cat:'status',power:null,acc:null,pp:12},
  {name:'破灭之愿',nameEn:'Doom Desire',type:'steel',cat:'special',power:140,acc:100,pp:8},
  {name:'双铁头锤',nameEn:'Double Iron Bash',type:'steel',cat:'physical',power:60,acc:100,pp:8},
  {name:'二连踢',nameEn:'Double Kick',type:'fighting',cat:'physical',power:30,acc:100,pp:20},
  {name:'双重电击',nameEn:'Double Shock',type:'electric',cat:'physical',power:null,acc:100,pp:8},
  {name:'双掌击',nameEn:'Double Slap',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'天龙归来',nameEn:'Dragon Ascent',type:'flying',cat:'physical',power:120,acc:100,pp:8},
  {name:'龙之息',nameEn:'Dragon Breath',type:'dragon',cat:'special',power:60,acc:100,pp:20},
  {name:'龙能量',nameEn:'Dragon Energy',type:'dragon',cat:'special',power:null,acc:100,pp:8},
  // E+
  {name:'蛋炸弹',nameEn:'Egg Bomb',type:'normal',cat:'physical',power:100,acc:75,pp:12},
  {name:'火花',nameEn:'Ember',type:'fire',cat:'special',power:40,acc:100,pp:20},
  // F+
  {name:'妖精之风',nameEn:'Fairy Wind',type:'fairy',cat:'special',power:40,acc:100,pp:20},
  {name:'假挥',nameEn:'False Swipe',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'偷袭',nameEn:'Feint Attack',type:'dark',cat:'physical',power:60,acc:null,pp:20},
  {name:'怒焰',nameEn:'Fiery Wrath',type:'dark',cat:'special',power:90,acc:100,pp:12},
  {name:'火之誓约',nameEn:'Fire Pledge',type:'fire',cat:'special',power:80,acc:100,pp:12},
  {name:'火焰轮',nameEn:'Flame Wheel',type:'fire',cat:'physical',power:60,acc:100,pp:20},
  {name:'花束炮',nameEn:'Fleur Cannon',type:'fairy',cat:'special',power:130,acc:90,pp:8},
  {name:'闪光',nameEn:'Flash',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'花之防御',nameEn:'Flower Shield',type:'fairy',cat:'status',power:null,acc:null,pp:20},
  {name:'掌底力',nameEn:'Force Palm',type:'fighting',cat:'physical',power:60,acc:100,pp:12},
  {name:'冰冻凝视',nameEn:'Freezing Glare',type:'psychic',cat:'special',power:90,acc:100,pp:12},
  {name:'泄愤',nameEn:'Frustration',type:'normal',cat:'physical',power:null,acc:100,pp:20},
  {name:'连续攻击',nameEn:'Fury Attack',type:'normal',cat:'physical',power:15,acc:85,pp:20},
  {name:'连斩',nameEn:'Fury Cutter',type:'bug',cat:'physical',power:40,acc:95,pp:20},
  {name:'猛抓',nameEn:'Fury Swipes',type:'normal',cat:'physical',power:18,acc:80,pp:16},
  // G+
  {name:'齿轮加速',nameEn:'Gear Up',type:'steel',cat:'status',power:null,acc:null,pp:20},
  {name:'地理仙法',nameEn:'Geomancy',type:'fairy',cat:'status',power:null,acc:null,pp:12},
  {name:'冰刺长枪',nameEn:'Glacial Lance',type:'ice',cat:'physical',power:120,acc:100,pp:8},
  {name:'冰冻世界',nameEn:'Glaciate',type:'ice',cat:'special',power:65,acc:95,pp:12},
  // H+
  {name:'治愈命令',nameEn:'Heal Order',type:'bug',cat:'status',power:null,acc:null,pp:12},
  {name:'心心相印',nameEn:'Heart Stamp',type:'psychic',cat:'physical',power:60,acc:100,pp:20},
  {name:'跟骨翻身',nameEn:'Heel Turn',type:'dark',cat:'physical',power:55,acc:100,pp:20},
  {name:'手下留情',nameEn:'Hold Back',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'磨爪',nameEn:'Hone Claws',type:'dark',cat:'status',power:null,acc:null,pp:16},
  {name:'角撞击',nameEn:'Horn Attack',type:'normal',cat:'physical',power:65,acc:100,pp:20},
  {name:'超级钻头',nameEn:'Hyper Drill',type:'normal',cat:'physical',power:100,acc:100,pp:8},
  {name:'超级利齿',nameEn:'Hyper Fang',type:'normal',cat:'physical',power:80,acc:90,pp:12},
  // I+
  {name:'冰球',nameEn:'Ice Ball',type:'ice',cat:'physical',power:30,acc:90,pp:20},
  {name:'火焰吞噬',nameEn:'Incinerate',type:'fire',cat:'special',power:60,acc:100,pp:16},
  {name:'离子流',nameEn:'Ion Deluge',type:'electric',cat:'status',power:null,acc:null,pp:20},
  // J+
  {name:'神之审判',nameEn:'Judgment',type:'normal',cat:'special',power:100,acc:100,pp:12},
  {name:'飞踢',nameEn:'Jump Kick',type:'fighting',cat:'physical',power:100,acc:95,pp:12},
  // L+
  {name:'叶旋',nameEn:'Leaf Tornado',type:'grass',cat:'special',power:65,acc:90,pp:12},
  {name:'瞪眼',nameEn:'Leer',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'舔食',nameEn:'Lick',type:'ghost',cat:'physical',power:30,acc:100,pp:20},
  // M+
  {name:'熔火漩涡',nameEn:'Magma Storm',type:'fire',cat:'special',power:100,acc:75,pp:8},
  {name:'震级',nameEn:'Magnitude',type:'ground',cat:'physical',power:null,acc:100,pp:20},
  {name:'抢先',nameEn:'Me First',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'镜面移动',nameEn:'Mirror Move',type:'flying',cat:'status',power:null,acc:null,pp:20},
  {name:'薄雾',nameEn:'Mist',type:'ice',cat:'status',power:null,acc:null,pp:20},
  {name:'迷雾球',nameEn:'Mist Ball',type:'psychic',cat:'special',power:70,acc:100,pp:8},
  {name:'泥土炸弹',nameEn:'Mud Bomb',type:'ground',cat:'special',power:65,acc:85,pp:12},
  {name:'多属性攻击',nameEn:'Multi-Attack',type:'normal',cat:'physical',power:120,acc:100,pp:12},
  {name:'神秘之力',nameEn:'Mystical Power',type:'psychic',cat:'special',power:70,acc:90,pp:12},
  // N+
  {name:'自然之力',nameEn:'Nature Power',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'针臂刺',nameEn:'Needle Arm',type:'grass',cat:'physical',power:60,acc:100,pp:16},
  {name:'噩梦',nameEn:'Nightmare',type:'ghost',cat:'status',power:null,acc:100,pp:16},
  // O+
  {name:'章鱼喷墨',nameEn:'Octazooka',type:'water',cat:'special',power:65,acc:85,pp:12},
  {name:'不详之风',nameEn:'Ominous Wind',type:'ghost',cat:'special',power:60,acc:100,pp:8},
  {name:'待命出击',nameEn:'Order Up',type:'dragon',cat:'physical',power:80,acc:100,pp:12},
  {name:'本源波动',nameEn:'Origin Pulse',type:'water',cat:'special',power:110,acc:85,pp:8},
  {name:'超载',nameEn:'Overdrive',type:'electric',cat:'special',power:80,acc:100,pp:12},
  // P+
  {name:'光子间歇泉',nameEn:'Photon Geyser',type:'psychic',cat:'special',power:100,acc:100,pp:8},
  {name:'等离子拳',nameEn:'Plasma Fists',type:'electric',cat:'physical',power:100,acc:100,pp:8},
  {name:'强力拳',nameEn:'Power-Up Punch',type:'fighting',cat:'physical',power:40,acc:100,pp:20},
  {name:'断崖之刃',nameEn:'Precipice Blades',type:'ground',cat:'physical',power:120,acc:85,pp:8},
  {name:'棱镜激光',nameEn:'Prismatic Laser',type:'psychic',cat:'special',power:160,acc:100,pp:8},
  {name:'超能量爆发',nameEn:'Psycho Boost',type:'psychic',cat:'special',power:140,acc:90,pp:8},
  {name:'超能冲击',nameEn:'Psystrike',type:'psychic',cat:'special',power:100,acc:100,pp:12},
  {name:'追打',nameEn:'Pursuit',type:'dark',cat:'physical',power:40,acc:100,pp:20},
  // R+
  {name:'远古之歌',nameEn:'Relic Song',type:'normal',cat:'special',power:75,acc:100,pp:12},
  {name:'天启舞',nameEn:'Revelation Dance',type:'normal',cat:'special',power:90,acc:100,pp:16},
  {name:'时间的轰鸣',nameEn:'Roar of Time',type:'dragon',cat:'special',power:150,acc:90,pp:8},
  // S+
  {name:'抓击',nameEn:'Scratch',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'秘剑',nameEn:'Secret Sword',type:'fighting',cat:'special',power:85,acc:100,pp:12},
  {name:'阴骨锤',nameEn:'Shadow Bone',type:'ghost',cat:'physical',power:85,acc:100,pp:12},
  {name:'暗影冲击',nameEn:'Shadow Force',type:'ghost',cat:'physical',power:120,acc:100,pp:8},
  {name:'信号光线',nameEn:'Signal Beam',type:'bug',cat:'special',power:75,acc:100,pp:16},
  {name:'银色旋风',nameEn:'Silver Wind',type:'bug',cat:'special',power:60,acc:100,pp:8},
  {name:'高空坠落',nameEn:'Sky Drop',type:'flying',cat:'physical',power:60,acc:100,pp:12},
  {name:'回旋升龙拳',nameEn:'Sky Uppercut',type:'fighting',cat:'physical',power:85,acc:90,pp:16},
  {name:'摔打',nameEn:'Slam',type:'normal',cat:'physical',power:80,acc:75,pp:20},
  {name:'劈砍',nameEn:'Slash',type:'normal',cat:'physical',power:70,acc:100,pp:20},
  {name:'嗅盐',nameEn:'Smelling Salts',type:'normal',cat:'physical',power:70,acc:100,pp:12},
  {name:'烟幕',nameEn:'Smokescreen',type:'normal',cat:'status',power:null,acc:100,pp:20},
  {name:'空间裂缝',nameEn:'Spacial Rend',type:'dragon',cat:'special',power:100,acc:95,pp:8},
  {name:'幽灵偷盗',nameEn:'Spectral Thief',type:'ghost',cat:'physical',power:90,acc:100,pp:12},
  {name:'旋转出击',nameEn:'Spin Out',type:'steel',cat:'physical',power:100,acc:100,pp:8},
  {name:'吐出',nameEn:'Spit Up',type:'normal',cat:'special',power:null,acc:100,pp:12},
  {name:'怨恨',nameEn:'Spite',type:'ghost',cat:'status',power:null,acc:100,pp:12},
  {name:'聚光灯',nameEn:'Spotlight',type:'normal',cat:'status',power:null,acc:null,pp:16},
  {name:'春风风暴',nameEn:'Springtide Storm',type:'fairy',cat:'special',power:100,acc:80,pp:8},
  {name:'蒸汽喷发',nameEn:'Steam Eruption',type:'water',cat:'special',power:110,acc:95,pp:8},
  {name:'储藏',nameEn:'Stockpile',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'力量',nameEn:'Strength',type:'normal',cat:'physical',power:80,acc:100,pp:16},
  {name:'大切牙',nameEn:'Super Fang',type:'normal',cat:'physical',power:null,acc:90,pp:12},
  {name:'吞下',nameEn:'Swallow',type:'normal',cat:'status',power:null,acc:null,pp:12},
  // T+
  {name:'撞击',nameEn:'Tackle',type:'normal',cat:'physical',power:40,acc:100,pp:20},
  {name:'舍身攻击',nameEn:'Take Down',type:'normal',cat:'physical',power:90,acc:85,pp:20},
  {name:'泪眼',nameEn:'Tearful Look',type:'water',cat:'status',power:null,acc:null,pp:20},
  {name:'科技爆炸',nameEn:'Techno Blast',type:'normal',cat:'special',power:120,acc:100,pp:8},
  {name:'念动力',nameEn:'Telekinesis',type:'psychic',cat:'status',power:null,acc:null,pp:16},
  {name:'瞬间移动',nameEn:'Teleport',type:'psychic',cat:'status',power:null,acc:null,pp:20},
  {name:'千箭',nameEn:'Thousand Arrows',type:'ground',cat:'physical',power:90,acc:100,pp:12},
  {name:'千浪',nameEn:'Thousand Waves',type:'ground',cat:'physical',power:90,acc:100,pp:12},
  {name:'大闹一番',nameEn:'Thrash',type:'normal',cat:'physical',power:120,acc:100,pp:12},
  {name:'雷电囚笼',nameEn:'Thunder Cage',type:'electric',cat:'special',power:80,acc:90,pp:12},
  {name:'雷霆踢',nameEn:'Thunderous Kick',type:'fighting',cat:'physical',power:90,acc:100,pp:12},
  {name:'世界倒置',nameEn:'Topsy-Turvy',type:'dark',cat:'status',power:null,acc:null,pp:20},
  {name:'三重踢',nameEn:'Triple Kick',type:'fighting',cat:'physical',power:10,acc:90,pp:12},
  // V+
  {name:'毒液冲击',nameEn:'Venoshock',type:'poison',cat:'special',power:65,acc:100,pp:12},
  {name:'胜利舞',nameEn:'Victory Dance',type:'fighting',cat:'status',power:null,acc:null,pp:12},
  {name:'藤鞭',nameEn:'Vine Whip',type:'grass',cat:'physical',power:45,acc:100,pp:20},
  {name:'钳夹',nameEn:'Vise Grip',type:'normal',cat:'physical',power:55,acc:100,pp:20},
  {name:'伏特冲击',nameEn:'Volt Tackle',type:'electric',cat:'physical',power:120,acc:100,pp:16},
  // W+
  {name:'叫醒掌',nameEn:'Wake-Up Slap',type:'fighting',cat:'physical',power:70,acc:100,pp:12},
  {name:'水枪',nameEn:'Water Gun',type:'water',cat:'special',power:40,acc:100,pp:20},
  {name:'戏水',nameEn:'Water Sport',type:'water',cat:'status',power:null,acc:null,pp:16},
  {name:'旋风',nameEn:'Whirlwind',type:'normal',cat:'status',power:null,acc:null,pp:20},
  {name:'野性冲电',nameEn:'Wild Charge',type:'electric',cat:'physical',power:90,acc:100,pp:16},
  {name:'拧干',nameEn:'Wring Out',type:'normal',cat:'special',power:null,acc:100,pp:8},
];
// 旧数据已被 MOVES_CHAMPIONS_DATA 取代，此数组不再使用
const BATTLE_MOVE_SEARCH_LIMIT=8;
const battleMoveSearchState={activeIndex:null};
// 攻击方（行）× 防御方（列）相克倍率矩阵 — Gen 9 标准
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

/* ──────── 特性数据库 ──────── */
// A类：属性免疫（直接改变相克矩阵）
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
// B类：防御端伤害减免
const ABILITY_DEF_MOD={
  'thick-fat':      {types:['fire','ice'],  mul:0.5},
  'heatproof':      {types:['fire'],        mul:0.5},
  'water-bubble':   {types:['fire'],        mul:0.5},
  'purifying-salt': {types:['ghost'],       mul:0.5},
  'solid-rock':     {superEff:0.75},
  'filter':         {superEff:0.75},
  'multiscale':     {fullHp:0.5, note:'满血时受到伤害减半'},
  'fur-coat':       {physMul:0.5},
};
// C类：进攻端增幅（用于 calcDamageEst）
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
// 技能分类标签（用于 iron-fist / strong-jaw / sharpness 等）
const MOVE_PUNCH_SET=new Set(['ice-punch','fire-punch','thunder-punch','mach-punch','bullet-punch','shadow-punch','focus-punch','hammer-arm','drain-punch','power-up-punch','sky-uppercut','dizzy-punch','sucker-punch','dynamic-punch','plasma-fists','comet-punch','mega-punch']);
const MOVE_BITE_SET=new Set(['bite','crunch','hyper-fang','super-fang','thunder-fang','ice-fang','fire-fang','poison-fang','psychic-fangs','fishious-rend','jaw-lock']);
const MOVE_SLICE_SET=new Set(['cut','slash','aerial-ace','night-slash','leaf-blade','x-scissor','cross-poison','sacred-sword','secret-sword','razor-shell','solar-blade','ceaseless-edge','kowtow-cleave','fury-cutter','air-slash','psycho-cut']);
const MOVE_PULSE_SET=new Set(['aura-sphere','water-pulse','dark-pulse','dragon-pulse','heal-pulse','origin-pulse','terrain-pulse','tera-blast']);
const MOVE_RECOIL_SET=new Set(['double-edge','flare-blitz','brave-bird','take-down','volt-tackle','head-smash','wild-charge','wood-hammer','head-charge','high-jump-kick','jump-kick']);
// D类：速度修正
const ABILITY_SPD_MOD={
  'swift-swim':  {weather:'rain',  mul:2.0},
  'chlorophyll': {weather:'sun',   mul:2.0},
  'sand-rush':   {weather:'sand',  mul:2.0},
  'slush-rush':  {weather:'snow',  mul:2.0},
  'surge-surfer':{terrain:'electric', mul:2.0},
  'speed-boost': {perTurn:true,    note:'每回合速度+1档'},
  'unburden':    {onItemUse:true,  note:'消耗道具后速度×2'},
  'quick-feet':  {onStatus:1.5,   note:'异常状态时速度×1.5'},
  'quick-draw':  {priority30:true, note:'30%概率先制行动'},
};
// E类：天气设置
const ABILITY_WEATHER_SET={'drought':'sun','drizzle':'rain','sand-stream':'sand','snow-warning':'snow'};
// G类：生存特性（影响OHKO判断）
const ABILITY_SURVIVE={
  'sturdy':   '满血时必定以1HP生还任何一击',
  'multiscale':'满血时受到伤害减半',
  'disguise': '第一击必定格挡（伤害无效）',
};
// 破格类（无视防御特性）
const ABILITY_BREAKER=new Set(['mold-breaker','turboblaze','teravolt']);

/* ── 特性辅助函数 ── */
// 获取对方宝可梦数据库中的特性列表
function getOppAbilityList(oppPkm){
  return oppPkm.slug?(PKM_PC_BY_SLUG[oppPkm.slug]?.abilities||[]):[];
}
// 获取对方宝可梦最可能的特性：优先用 builds 预测，其次取数据库第一个
function resolveOppAbility(oppPkm){
  if(oppPkm.predictedAbility?.slug) return oppPkm.predictedAbility.slug;
  const list=getOppAbilityList(oppPkm);
  return list[0]||'';
}
// 对方宝可梦的所有特性中，能免疫哪些属性
function getOppPossibleImmunes(oppPkm){
  const list=getOppAbilityList(oppPkm);
  const immunes=new Set();
  list.forEach(a=>(ABILITY_TYPE_IMMUNE[a]||[]).forEach(t=>immunes.add(t)));
  return immunes;
}
// 计算攻击方特性对技能的增幅倍率
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
// 获取攻击方特性转换后的技能属性（pixilate等）
function getMoveTypeWithAbility(myPkm, move){
  const ability=myPkm.ability||'';
  const mod=ABILITY_ATK_MOD[ability];
  if(mod?.normalConvert && move.type==='normal') return {type:mod.normalConvert, convertMul:mod.convertMul||1.0};
  return {type:move.type, convertMul:1.0};
}
// 检测己方队伍活跃天气（有天气设置特性的宝可梦）
function detectMyWeather(myPkmList){
  for(const p of myPkmList){
    const w=ABILITY_WEATHER_SET[p.ability||''];
    if(w)return w;
  }
  return '';
}
// 检测对方队伍可能设置的天气
function detectOppWeather(oppList){
  const weathers=new Set();
  oppList.forEach(op=>getOppAbilityList(op).forEach(a=>{const w=ABILITY_WEATHER_SET[a];if(w)weathers.add(w);}));
  return [...weathers];
}
// 含天气的有效速度
function getEffectiveSpeed(pkm, activeWeather=''){
  const base=pkm.base?.spe||0;
  if(!base)return 0;
  let spe=base;
  // 道具速度修正（优先从 ITEMS_BY_NAME 读 spdMul，兜底硬编码）
  const itemD=getBattleItemData(pkm.item||'');
  if(itemD?.damageMul?.spdMul) spe=Math.floor(spe*itemD.damageMul.spdMul);
  else if(pkm.item==='讲究围巾') spe=Math.floor(spe*1.5);
  // 特性速度修正
  const mod=ABILITY_SPD_MOD[pkm.ability||''];
  if(mod?.weather&&mod.weather===activeWeather) spe=Math.floor(spe*mod.mul);
  return spe;
}

// 性格修正 — [HP, 攻击, 防御, 特攻, 特防, 速度]
const NATURES_ZH={
  '勤奋':[1,1,1,1,1,1],'温顺':[1,1,1,1,1,1],'认真':[1,1,1,1,1,1],'害羞':[1,1,1,1,1,1],'古怪':[1,1,1,1,1,1],
  '孤僻':[1,1.1,0.9,1,1,1],'勇敢':[1,1.1,1,1,1,0.9],'固执':[1,1.1,1,0.9,1,1],'顽皮':[1,1.1,1,1,0.9,1],
  '保守':[1,0.9,1.1,1,1,1],'放松':[1,1,1.1,1,1,0.9],'皮实':[1,1,1.1,0.9,1,1],'散漫':[1,1,1.1,1,0.9,1],
  '胆小':[1,0.9,1,1,1,1.1],'慌乱':[1,1,0.9,1,1,1.1],'爽朗':[1,1,1,0.9,1,1.1],'天真':[1,1,1,1,0.9,1.1],
  '内敛':[1,0.9,1,1.1,1,1],'温和':[1,1,0.9,1.1,1,1],'冷静':[1,1,1,1.1,1,0.9],'浮躁':[1,1,1,1.1,0.9,1],
  '温厚':[1,0.9,1,1,1.1,1],'温柔':[1,1,0.9,1,1.1,1],'冷淡':[1,1,1,1,1.1,0.9],'慎重':[1,1,1,0.9,1.1,1],
};
const STAT_KEYS_B=['hp','atk','def','spa','spd','spe'];
const STAT_ZH_B={hp:'HP',atk:'攻击',def:'防御',spa:'特攻',spd:'特防',spe:'速度'};

/* ──────── 状态 ──────── */
let battleTeams=[];
let battleEditTeam=null;     // 正在编辑的队伍（对象）
let battleEditSlot=0;        // 当前编辑的宝可梦槽位 0-5
let battleEditSpriteCache={}; // slot -> sprite URL
let battleSrchT=null;
let battleMoveDropdownBound=false;
let battleMyTeamId=null;     // 分析页选中的我方队伍
let battleSelectedMegaKey='auto'; // auto=自动推荐；none=本场不 Mega；slot:N=指定 Mega
let battleOppPkm=[{},{},{},{},{},{} ];  // 对方6只（{name,type1,type2}）
let battleAnalysisMyTeam=null;
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
    document.getElementById('battle-mode-label').textContent = 'Pokemon Champions · 双打';
  } else {
    document.getElementById('battle-pkmc').classList.add('on');
    document.getElementById('battle-mode-label').textContent = 'Pokemon Champions · 单打';
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

/* ──────── 初始化 ──────── */
async function initBattle(){
  showBattleHub();
}

/* ──────── 标签切换 ──────── */
function switchBattleTab(tab,btn){
  document.querySelectorAll('#battle-pkmc .btab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('#battle-pkmc .btab-panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('btab-'+tab).classList.add('on');
  btn.classList.add('on');
  if(tab==='plaza'&&window.onEnterCommunity)onEnterCommunity();
}

/* ──────── Supabase ──────── */
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

/* ──────── 渲染队伍列表 ──────── */
function renderTeamList(){
  const el=document.getElementById('battle-team-list');
  if(!el)return;
  if(!battleTeams.length){
    el.innerHTML=`<div class="btc-empty"><div class="btc-empty-ico">⚔️</div>还没有队伍，点击「新建队伍」开始吧！</div>`;
    return;
  }
  el.innerHTML=battleTeams.map(t=>{
    const pkm=Array.isArray(t.pokemon)?t.pokemon:[];
    const sprites=pkm.map((p,i)=>{
      const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">`:'<span style="font-size:1.4rem;color:var(--b2)">·</span>';
      const dots=(p.type1?`<div class="btc-type-dot" style="background:${TYPE_COLOR[p.type1]||'#888'}"></div>`:'')+(p.type2?`<div class="btc-type-dot" style="background:${TYPE_COLOR[p.type2]||'#888'}"></div>`:'');
      return`<div class="btc-pkm" onclick="event.stopPropagation();openBattleTeamEdit('${t.id}',${i})" title="${esc(p.name||'空位')}">
        ${img}
        <div class="btc-pkm-name">${esc(p.name||'—')}</div>
        <div class="btc-pkm-types">${dots}</div>
      </div>`;
    });
    while(sprites.length<6)sprites.push(`<div class="btc-pkm"><span style="font-size:1.4rem;color:var(--b2)">+</span><div class="btc-pkm-name" style="color:var(--t3)">空</div></div>`);
    return`<div class="battle-team-card">
      <div class="btc-header">
        <div class="btc-name">${esc(t.team_name||'我的队伍')}</div>
        <div class="btc-meta">${pkm.filter(p=>p.name).length}/6 已录入</div>
        <div class="btc-actions">
          <button class="btn btn-sm" onclick="openBattleTeamEdit('${t.id}',0)">✏️ 编辑</button>
          <button class="btc-share-btn${t.is_public?' shared':''}" onclick="event.stopPropagation();toggleShareTeam('${t.id}','singles')" title="${t.is_public?'取消分享':'分享到社区'}">${t.is_public?'已分享':'分享'}</button>
          <button class="btn btn-sm btn-d" onclick="confirmDeleteBattleTeam('${t.id}')">删除</button>
        </div>
      </div>
      <div class="btc-sprites">${sprites.join('')}</div>
    </div>`;
  }).join('');
}

function renderBattleTeamSel(){
  const sel=document.getElementById('battle-my-team-sel');
  if(!sel)return;
  sel.innerHTML=`<option value="">选择我的队伍…</option>`+battleTeams.map(t=>`<option value="${t.id}">${esc(t.team_name||'我的队伍')}</option>`).join('');
}

/* ──────── 打开编辑 ──────── */
function openBattleTeamEdit(teamId, slotIndex=0){
  if(teamId&&teamId!=='undefined'){
    const found=battleTeams.find(t=>t.id===teamId);
    if(!found){showToast('队伍数据未找到，请刷新页面');return;}
    battleEditTeam=JSON.parse(JSON.stringify(found));
  } else {
    battleEditTeam={id:'local_'+Date.now(),team_name:'我的队伍',pokemon:[]};
  }
  // 确保 6 个槽位
  while(battleEditTeam.pokemon.length<6)battleEditTeam.pokemon.push({});
  battleEditSlot=slotIndex;
  battleEditSpriteCache={};
  // 预填精灵图 URL
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

/* ──────── 槽位标签 ──────── */
function renderBattleSlotTabs(){
  const tabs=document.getElementById('battle-slot-tabs');
  tabs.innerHTML=battleEditTeam.pokemon.map((p,i)=>{
    const img=battleEditSpriteCache[i]?`<img src="${battleEditSpriteCache[i]}" alt="" onerror="this.src=''">`:
      `<div class="bslot-empty-ico">+</div>`;
    const name=p.name||`第${i+1}只`;
    return`<button class="bslot-btn${i===battleEditSlot?' on':''}" onclick="selectBattleSlot(${i})" title="${esc(name)}">
      ${img}
      <span class="bslot-btn-num">#${i+1}</span>
      <span class="bslot-btn-name">${esc(p.name||'空位')}</span>
    </button>`;
  }).join('');
}

function selectBattleSlot(i){
  // 保存当前表单到 editTeam
  gatherSlotForm();
  battleEditSlot=i;
  renderBattleSlotTabs();
  renderBattleSlotForm();
}

/* ──────── 渲染单只宝可梦表单 ──────── */
function renderBattleSlotForm(){
  const p=battleEditTeam.pokemon[battleEditSlot]||{};
  const moves=[p.move1||{},p.move2||{},p.move3||{},p.move4||{}];
  const statsBlock=['hp','atk','def','spa','spd','spe'].map(k=>{
    const calc=calcActualStatVal(p.base?.[k]||0,p.iv?.[k]??31,p.ev?.[k]||0,(p.nature||'固执'),k);
    return`<div class="bpkm-stat-col">
      <span class="bpkm-stat-lbl">${STAT_ZH_B[k]}</span>
      <input class="bpkm-inp-num" id="bpkm-base-${k}" type="number" min="0" max="255" placeholder="种族" value="${p.base?.[k]||''}" oninput="onBpkmStatChange()">
      <input class="bpkm-inp-num" id="bpkm-iv-${k}" type="number" value="31" readonly style="opacity:.45;pointer-events:none">
      <input class="bpkm-inp-num" id="bpkm-ev-${k}" type="number" min="0" max="32" placeholder="SP" value="${p.ev?.[k]||0}" oninput="onBpkmEvChange()">
      <span class="bpkm-stat-calc" id="bpkm-calc-${k}">${calc||'—'}</span>
    </div>`;
  }).join('');

  const typeOpts=B_TYPES.map(t=>`<option value="${t}"${p.type1===t?' selected':''}>${TYPE_ZH[t]||t}</option>`).join('');
  const typeOpts2=['<option value="">无</option>',...B_TYPES.map(t=>`<option value="${t}"${p.type2===t?' selected':''}>${TYPE_ZH[t]||t}</option>`)].join('');
  const natOpts=['', ...Object.keys(NATURES_ZH)].map(n=>`<option value="${n}"${p.nature===n?' selected':''}>${n||'无'}</option>`).join('');

  const hasLearnables=(p.learnableMovesEn||[]).length>0;
  const movePlaceholder=hasLearnables?'点击选择可学技能…':'技能名称（可搜索）';
  const movesHtml=moves.map((m,i)=>`<div class="bpkm-move-card">
    <span class="bpkm-move-num">技能 ${i+1}</span>
    <div class="bpkm-move-search-wrap">
      <input class="bpkm-inp" id="bpkm-move${i+1}-name" placeholder="${movePlaceholder}" value="${esc(m.name||'')}" autocomplete="off" oninput="onBattleMoveNameInput(${i+1},this.value)" onfocus="onBattleMoveNameInput(${i+1},this.value)">
      <div class="bpkm-search-drop bpkm-move-search-drop" id="bpkm-move${i+1}-drop"></div>
    </div>
    <div class="bpkm-move-row">
      <select class="bpkm-inp" id="bpkm-move${i+1}-type" style="flex:1;padding:5px 8px">
        <option value="">属性</option>${B_TYPES.map(t=>`<option value="${t}"${m.type===t?' selected':''}>${TYPE_ZH[t]||t}</option>`).join('')}
      </select>
      <select class="bpkm-inp" id="bpkm-move${i+1}-cat" style="flex:1;padding:5px 8px">
        <option value="">类型</option>
        <option value="physical"${m.cat==='physical'?' selected':''}>物理</option>
        <option value="special"${m.cat==='special'?' selected':''}>特殊</option>
        <option value="status"${m.cat==='status'?' selected':''}>变化</option>
      </select>
    </div>
    <div class="bpkm-move-row">
      <input class="bpkm-inp-num" id="bpkm-move${i+1}-power" type="number" min="0" max="999" placeholder="威力" value="${m.power||''}" style="flex:1">
      <input class="bpkm-inp-num" id="bpkm-move${i+1}-pp" type="number" min="1" max="64" placeholder="PP" value="${m.pp||''}" style="flex:1">
    </div>
  </div>`).join('');

  const spriteUrl=battleEditSpriteCache[battleEditSlot]||'';
  document.getElementById('battle-pokemon-form').innerHTML=`
    <div class="bpkm-form">
      <div class="bpkm-search-wrap">
        <span class="bpkm-search-ico">🔍</span>
        <input class="bpkm-search-inp" id="bpkm-name-inp" placeholder="输入宝可梦名称或编号搜索…" value="${esc(p.name||'')}"
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
          <span class="bpkm-inp-label">属性1</span>
          <select class="bpkm-inp" id="bpkm-type1">${typeOpts}</select>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">属性2（若有）</span>
          <select class="bpkm-inp" id="bpkm-type2">${typeOpts2}</select>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">特性</span>
          <div style="position:relative">
            <input class="bpkm-inp" id="bpkm-ability" placeholder="输入或点击下方特性" value="${esc(p.ability||'')}" autocomplete="off">
            <div id="bpkm-ability-chips" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${(p.abilities||[]).map(a=>`<span class="bpkm-ability-chip${p.ability===a?' active':''}" onclick="selectBpkmAbility('${esc(a)}')">${esc(a)}</span>`).join('')}</div>
          </div>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">持有道具</span>
          <div style="position:relative">
            <input class="bpkm-inp" id="bpkm-item" placeholder="搜索道具名称…" value="${esc(p.item||'')}"
              autocomplete="off" oninput="onBpkmItemInput()" onfocus="onBpkmItemInput()" onblur="setTimeout(()=>hideBpkmItemDrop(),180)">
            <div id="bpkm-item-drop" class="bpkm-drop" style="display:none"></div>
          </div>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">性格</span>
          <select class="bpkm-inp" id="bpkm-nature">${natOpts}</select>
        </div>
        <div class="bpkm-inp-group">
          <span class="bpkm-inp-label">等级（Champions默认50）</span>
          <input class="bpkm-inp-num" id="bpkm-level" type="number" min="1" max="100" value="${p.level||50}" style="width:100%" oninput="onBpkmStatChange()">
        </div>
      </div>

      <div class="bpkm-section-hdr">种族值 / 个体值 / 努力值 → 实际能力值</div>
      <div style="font-size:.62rem;color:var(--t3);font-family:'DM Mono',monospace;margin-bottom:6px">每行依次：种族 / 个体<span style="opacity:.5">（固定31）</span> / SP(0-32) → <span style="color:var(--acc2)">实际值</span>　SP总和上限：<span id="bpkm-ev-total-lbl">0/66</span></div>
      <div class="bpkm-stats-block">${statsBlock}</div>

      <div class="bpkm-section-hdr" style="margin-top:8px">技能（支持 Champions AP 制，AP 1-5 对应技能消耗行动点数）</div>
      <div class="bpkm-moves-grid">${movesHtml}</div>

      <div class="bpkm-inp-group" style="margin-top:6px">
        <span class="bpkm-inp-label">备注</span>
        <textarea class="bpkm-inp" id="bpkm-notes" rows="2" style="height:56px;resize:vertical">${esc(p.notes||'')}</textarea>
      </div>
    </div>`;
  updateEvTotal();
  ensureBattleMoveDropdownBinding();
}

/* ──────── 搜索宝可梦 ──────── */
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
  // learnableEn 存的是 slug（如 "dragon-dance"），MOVES_DATA 也有 slug 字段，直接匹配
  const learnableSet=new Set(learnableEn);
  const inData=MOVES_DATA.map((move,idx)=>{
    const slug=move.slug||normalizeBattleMoveKeyword(move.nameEn);
    if(!learnableSet.has(slug))return null;
    return {idx,move,apiOnly:false};
  }).filter(Boolean);
  // learnset 里有但 MOVES_DATA 找不到的（极少）
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
  if(hasLearnables&&!queryTrimmed)header=`<div style="padding:4px 10px;font-size:.68rem;color:var(--t3);border-bottom:1px solid var(--b2)">共 ${items.length} 个可学技能</div>`;
  else if(fallback)header=`<div style="padding:4px 10px;font-size:.68rem;color:var(--acc2);border-bottom:1px solid var(--b2)">可学技能中无匹配，显示全库结果</div>`;
  drop.innerHTML=header+items.map(({idx,move,apiOnly})=>{
    if(apiOnly){
      return `<div class="bpkm-drop-item bpkm-move-drop-item" onclick="selectBattleMoveName(${moveIndex},'${move.nameEn.replace(/'/g,"\\'")}','${move.name.replace(/'/g,"\\'")}')">
        <div class="bpkm-move-drop-main">
          <div class="bpkm-drop-name">${esc(move.name)}</div>
          <div class="bpkm-move-drop-en" style="color:var(--t3);font-size:.65rem">暂无详细数据</div>
        </div>
      </div>`;
    }
    const powerLabel=move.cat==='status'||!move.power?'—':move.power;
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
    drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索中…</div>';
    drop.classList.add('open');
    try{
      // 先从 Pokemon Champions 数据搜索中文名
      let results=PKM_LIST.filter(p=>p.name.includes(q)).slice(0,8).map(p=>({id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}));
      // 编号搜索
      if(!results.length&&/^\d+$/.test(q)){
        const p=PKM_PC_BY_NUM[parseInt(q)];
        results=p?[{id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}]:[{id:parseInt(q),cnName:PKM_CN_TABLE[parseInt(q)]||null,slug:'',spriteUrl:''}];
      }
      // 英文/PokeAPI 搜索兜底（跳过中文、拼音撇号等无效查询）
      if(!results.length&&!/[\u4e00-\u9fff\u3040-\u30ff\u31f0-\u31ff']/.test(q)){
        const r=await fetch(`${POKEAPI}/pokemon/${encodeURIComponent(q.toLowerCase())}`);
        if(r.ok){const d=await r.json();const lp=PKM_PC_BY_SLUG[q.toLowerCase()]||PKM_PC_BY_NUM[d.id];results=[{id:d.id,cnName:lp?.name||PKM_CN_TABLE[d.id]||d.name,slug:lp?.slug||'',spriteUrl:lp?.spriteUrl||d.sprites?.front_default||''}];}
      }
      if(!results.length){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">未找到</div>';return;}
      drop.innerHTML=results.map(r=>{
        const sprite=getSearchSprite(r);
        return`<div class="bpkm-drop-item" onclick="selectBpkmFromDrop(${r.id},'${esc(r.cnName||'')}','${r.slug||''}')">
          <img src="${sprite}" alt="" onerror="this.style.display='none'">
          <div class="bpkm-drop-name">${esc(r.cnName||'')}</div>
          <div class="bpkm-drop-num">#${r.id}</div>
        </div>`;
      }).join('');
    } catch(e){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索出错</div>';}
  },300);
}

async function selectBpkmFromDrop(pkmId, cnName, slug=''){
  const drop=document.getElementById('bpkm-search-drop');
  drop.classList.remove('open');
  const inp=document.getElementById('bpkm-name-inp');
  if(inp)inp.value=cnName;
  battleEditTeam.pokemon[battleEditSlot].name=cnName;

  // 优先使用本地 PKM_CHAMPIONS_DATA，无需 API 调用
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
    [1,2,3,4].forEach(i=>{ const inp=document.getElementById(`bpkm-move${i}-name`); if(inp)inp.placeholder='点击选择可学技能…'; });
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
    const curP=battleEditTeam.pokemon[battleEditSlot];
    curP.slug=localPkm.slug;
    curP.currentVariety=localPkm.slug;
    curP.basePkmName=baseSlugFromMega(localPkm.slug)||localPkm.slug;
    // 本地数据直接使用，无需网络请求
    applyPkmData(
      localPkm.types[0]||'', localPkm.types[1]||'',
      localPkm.stats||{}, localPkm.abilities||[],
      localPkm.learnset||[], localPkm.spriteUrl||''
    );
    // 形态：PKM_CHAMPIONS_DATA 中同一宝可梦的不同形态直接列出
    const baseName=localPkm.slug.replace(/^mega-/,'').replace(/-(mega|alolan|galarian|hisuian|paldean|x|y)$/,'');
    const varieties=PKM_LIST
      .filter(p=>p.slug===localPkm.slug||p.slug.startsWith(baseName+'-')||p.slug===baseName)
      .map(p=>({name:p.slug,displayName:getFormDisplayName(baseName,p.slug),isDefault:p.slug===baseName||p.slug===localPkm.slug,pokemon:{name:p.slug}}));
    if(varieties.length>1){
      const p2=battleEditTeam.pokemon[battleEditSlot];
      p2.varieties=varieties;
      renderBpkmFormChips(p2, cnName);
    }
  } else {
    // PokeAPI 兜底（非 Champions 宝可梦）
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

/* ──────── 宝可梦形态 ──────── */
function getFormDisplayName(baseName,varietyName){
  if(!varietyName||varietyName===baseName)return '标准';
  const suffix=varietyName.startsWith(baseName+'-')?varietyName.slice(baseName.length+1):varietyName;
  if(FORM_SUFFIX_ZH[suffix])return FORM_SUFFIX_ZH[suffix];
  const parts=suffix.split('-');
  for(let i=parts.length;i>0;i--){
    const key=parts.slice(0,i).join('-');
    if(FORM_SUFFIX_ZH[key])return FORM_SUFFIX_ZH[key]+(parts.slice(i).length?' '+parts.slice(i).join(' '):'');
  }
  return suffix.replace(/-/g,' ');
}

/* ──────── Mega 出战规则 ──────── */
function isMegaSlug(slug){
  return /^mega-/.test(slug||'')||/-(mega|mega-x|mega-y)$/.test(slug||'');
}

function baseSlugFromMega(slug){
  if(!slug)return '';
  const raw=String(slug).replace(/^mega-/,'').replace(/-(mega|mega-x|mega-y)$/,'');
  const candidates=[raw, raw.replace(/-(x|y)$/,'')];
  return candidates.find(s=>PKM_PC_BY_SLUG[s])||candidates[0]||raw;
}

function inferBattlePkmSlug(pkm){
  if(pkm?.slug)return pkm.slug;
  if(pkm?.currentVariety)return pkm.currentVariety;
  const byName=PKM_LIST.find(x=>x.name===pkm?.name);
  return byName?.slug||'';
}

function getMegaFormsForBattlePkm(pkm){
  const slug=inferBattlePkmSlug(pkm);
  const base=isMegaSlug(slug)?baseSlugFromMega(slug):slug;
  if(!base)return [];
  return PKM_LIST.filter(x=>isMegaSlug(x.slug)&&baseSlugFromMega(x.slug)===base);
}

function hasBattleMegaStone(pkm){
  const item=pkm?.item||'';
  const data=ITEMS_BY_NAME[item]||ITEMS_BY_SLUG[item];
  return data?.category==='mega'||/进化石|Mega Stone/i.test(item);
}

function getBattleMegaCandidates(teamPkm){
  return (teamPkm||[])
    .map((p,idx)=>({p,slot:p._slotIndex??idx,slug:inferBattlePkmSlug(p)}))
    .filter(x=>x.p?.name&&isMegaSlug(x.slug));
}

function applyBattleDexDataToPkm(pkm,dex,tag){
  if(!dex)return pkm;
  const next={...pkm};
  next.name=dex.name||next.name;
  next.slug=dex.slug||next.slug;
  next.type1=dex.types?.[0]||next.type1||'';
  next.type2=dex.types?.[1]||'';
  next.base=dex.stats?{...dex.stats}:next.base;
  next.abilities=Array.isArray(dex.abilities)?[...dex.abilities]:(next.abilities||[]);
  if(next.abilities.length&&!next.abilities.includes(next.ability))next.ability=next.abilities[0];
  if(dex.learnset)next.learnableMovesEn=[...dex.learnset];
  if(dex.spriteUrl)next._spriteUrl=dex.spriteUrl;
  next.currentVariety=dex.slug||next.currentVariety;
  next._megaState=tag||'';
  return next;
}

function resolveBattleMegaForm(pkm){
  const slug=inferBattlePkmSlug(pkm);
  if(isMegaSlug(slug))return PKM_PC_BY_SLUG[slug]||null;
  const forms=getMegaFormsForBattlePkm(pkm);
  if(!forms.length)return null;
  const item=String(pkm?.item||'').toLowerCase();
  if(item.includes(' x')||item.includes('x')||item.includes('Ｘ'))return forms.find(f=>/-x$/.test(f.slug))||forms[0];
  if(item.includes(' y')||item.includes('y')||item.includes('Ｙ'))return forms.find(f=>/-y$/.test(f.slug))||forms[0];
  return forms[0];
}

function resolveBattleBaseForm(pkm){
  const slug=inferBattlePkmSlug(pkm);
  const baseSlug=isMegaSlug(slug)?baseSlugFromMega(slug):slug;
  return PKM_PC_BY_SLUG[baseSlug]||PKM_LIST.find(x=>x.name===pkm?.name&&!isMegaSlug(x.slug))||null;
}

function cloneBattleTeamForMegaRule(myPkm, selectedMegaKey='none'){
  return (myPkm||[]).map((p,idx)=>{
    const slot=p._slotIndex??idx;
    const isChosen=selectedMegaKey===`slot:${slot}`;
    const candidate=isMegaSlug(inferBattlePkmSlug(p));
    if(!candidate)return {...p,_slotIndex:slot,_megaState:''};
    if(isChosen){
      const mega=resolveBattleMegaForm(p);
      return applyBattleDexDataToPkm({...p,_slotIndex:slot},mega,'mega');
    }
    const base=resolveBattleBaseForm(p);
    return applyBattleDexDataToPkm({...p,_slotIndex:slot},base,'base');
  });
}

function chooseBestBattleMegaKey(myPkm, opp, activeWeather, pickCount){
  const candidates=getBattleMegaCandidates(myPkm);
  if(!candidates.length)return 'none';
  const keys=candidates.map(c=>`slot:${c.slot}`);
  let bestKey=keys[0]||'none',bestScore=-Infinity;
  keys.forEach(key=>{
    const team=cloneBattleTeamForMegaRule(myPkm,key);
    const scored=scorePkmForBattle(team,opp,activeWeather);
    const total=scored.slice(0,pickCount).reduce((s,x)=>s+(x.total||0),0);
    if(total>bestScore){bestScore=total;bestKey=key;}
  });
  return bestKey;
}

function prepareBattleTeamForMegaRule(myPkm, opp, activeWeather, format='singles'){
  const pickCount=format==='doubles'?4:3;
  const baseTeam=(myPkm||[]).map((p,idx)=>({...p,_slotIndex:p._slotIndex??idx}));
  const selectedKey=(format==='doubles'?bdSelectedMegaKey:battleSelectedMegaKey)||'auto';
  const megaKey=selectedKey==='auto'?chooseBestBattleMegaKey(baseTeam,opp,activeWeather,pickCount):selectedKey;
  const team=cloneBattleTeamForMegaRule(baseTeam,megaKey);
  return{team,megaKey};
}

function renderBattleMegaSelect(team, selectedKey, onChangeName){
  const pkm=Array.isArray(team?.pokemon)?team.pokemon.map((p,slot)=>({...p,_slotIndex:slot})).filter(p=>p.name):[];
  const candidates=getBattleMegaCandidates(pkm);
  if(!candidates.length)return '';
  const opts=[
    `<option value="auto"${selectedKey==='auto'?' selected':''}>自动推荐本场 Mega</option>`,
    `<option value="none"${selectedKey==='none'?' selected':''}>本场不 Mega</option>`,
    ...candidates.map(({p,slot})=>`<option value="slot:${slot}"${selectedKey===`slot:${slot}`?' selected':''}>${esc(p.name)}${p.item?` · ${esc(p.item)}`:''}</option>`)
  ].join('');
  return `<div class="battle-mega-select-wrap">
    <span class="battle-mega-select-label">本场 Mega</span>
    <select class="bpkm-inp battle-mega-select" onchange="${onChangeName}(this.value)">${opts}</select>
  </div>`;
}

function describeBattleMegaPlan(myPkm, megaKey){
  const chosen=myPkm.find(p=>p._megaState==='mega');
  const reverted=myPkm.filter(p=>p._megaState==='base');
  if(!chosen&&!reverted.length)return '';
  const chosenText=chosen?`本场 Mega：${esc(chosen.name)}`:'本场不 Mega';
  const revertedText=reverted.length?`；${reverted.map(p=>esc(p.name)).join('、')} 按普通形态/普通特性计算`:'';
  return `<div class="battle-mega-plan">${chosenText}${revertedText}</div>`;
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
    const local=PKM_PC_BY_SLUG[varietyName];
    if(local){
      p.name=local.name||p.name;
      p.slug=local.slug;
      p.currentVariety=local.slug;
      p.basePkmName=baseSlugFromMega(local.slug)||local.slug;
      p.type1=local.types?.[0]||'';
      p.type2=local.types?.[1]||'';
      p.base={...(local.stats||{})};
      p.abilities=[...(local.abilities||[])];
      if(p.abilities.length&&!p.abilities.includes(p.ability))p.ability=p.abilities[0];
      p.learnableMovesEn=[...(local.learnset||[])];
      battleEditSpriteCache[battleEditSlot]=local.spriteUrl||'';
      p._spriteUrl=local.spriteUrl||p._spriteUrl||'';
      const nameInput=document.getElementById('bpkm-name-inp');
      if(nameInput)nameInput.value=p.name;
      const nameEl=document.getElementById('bpkm-preview-name')||document.querySelector('.bpkm-preview-name');
      if(nameEl)nameEl.textContent=p.name;
      const spriteEl=document.getElementById('bpkm-sprite');
      if(spriteEl&&p._spriteUrl)spriteEl.src=p._spriteUrl;
      const s1=document.getElementById('bpkm-type1');
      const s2=document.getElementById('bpkm-type2');
      if(s1)s1.value=p.type1;if(s2)s2.value=p.type2||'';
      STAT_KEYS_B.forEach(k=>{const el=document.getElementById(`bpkm-base-${k}`);if(el&&p.base[k]!==undefined)el.value=p.base[k];});
      const abInp=document.getElementById('bpkm-ability');
      if(abInp)abInp.value=p.ability||'';
      const abChips=document.getElementById('bpkm-ability-chips');
      if(abChips)abChips.innerHTML=p.abilities.map(a=>`<span class="bpkm-ability-chip${p.ability===a?' active':''}" onclick="selectBpkmAbility('${esc(a)}')">${esc(a)}</span>`).join('');
      const typesEl=document.getElementById('bpkm-preview-types');
      if(typesEl)typesEl.innerHTML=(p.type1?`<span class="coverage-type-tag type-${p.type1}">${TYPE_ZH[p.type1]||p.type1}</span>`:'')+
        (p.type2?`<span class="coverage-type-tag type-${p.type2}">${TYPE_ZH[p.type2]||p.type2}</span>`:'');
      renderBpkmFormChips();
      onBpkmStatChange();
      return;
    }
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
    p.slug=varietyName;
    p.basePkmName=baseSlugFromMega(varietyName)||p.basePkmName;
    renderBpkmFormChips();
    onBpkmStatChange();
  }catch(e){console.warn('selectBpkmForm error',e);}
}

/* ──────── 能力值实时计算 ──────── */
function onBpkmStatChange(){
  const level=parseInt(document.getElementById('bpkm-level')?.value)||50;
  const nat=document.getElementById('bpkm-nature')?.value||'';
  STAT_KEYS_B.forEach(k=>{
    const base=parseInt(document.getElementById(`bpkm-base-${k}`)?.value)||0;
    const iv=parseInt(document.getElementById(`bpkm-iv-${k}`)?.value)??31;
    const ev=parseInt(document.getElementById(`bpkm-ev-${k}`)?.value)||0;
    const val=calcActualStatVal(base,iv,ev,nat,k,level);
    const el=document.getElementById(`bpkm-calc-${k}`);
    if(el)el.textContent=val||'—';
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

/* ──────── 能力值公式（Champions：IV固定31，EV→SP 0-32，spBonus=2sp-1） ──────── */
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

/* ──────── 收集表单数据 ──────── */
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
  // 种族/个体/努力值
  p.base={};p.iv={};p.ev={};
  STAT_KEYS_B.forEach(k=>{
    p.base[k]=parseInt(document.getElementById(`bpkm-base-${k}`)?.value)||0;
    p.iv[k]=31;
    p.ev[k]=Math.min(32,parseInt(document.getElementById(`bpkm-ev-${k}`)?.value)||0);
  });
  // 技能
  [1,2,3,4].forEach(i=>{
    p[`move${i}`]={
      name:document.getElementById(`bpkm-move${i}-name`)?.value.trim()||'',
      type:document.getElementById(`bpkm-move${i}-type`)?.value||'',
      cat:document.getElementById(`bpkm-move${i}-cat`)?.value||'',
      power:parseInt(document.getElementById(`bpkm-move${i}-power`)?.value)||0,
      pp:parseInt(document.getElementById(`bpkm-move${i}-pp`)?.value)||null,
    };
  });
  const prev=battleEditTeam.pokemon[battleEditSlot]||{};
  p.abilities=prev.abilities||[];
  p.learnableMovesEn=prev.learnableMovesEn||[];
  p.varieties=prev.varieties||[];
  p.slug=prev.slug||prev.currentVariety||'';
  p.currentVariety=prev.currentVariety||p.slug||'';
  p.basePkmName=prev.basePkmName||baseSlugFromMega(p.slug)||p.slug||'';
  battleEditTeam.pokemon[battleEditSlot]=p;
}

/* ──────── 特性选择 ──────── */
function selectBpkmAbility(name){
  const inp=document.getElementById('bpkm-ability');
  if(inp)inp.value=name;
  document.querySelectorAll('.bpkm-ability-chip').forEach(c=>c.classList.toggle('active',c.textContent===name));
}

/* ──────── 道具搜索下拉 ──────── */
const ITEM_CAT_ZH={hold:'携带道具', mega:'超级进化石', berry:'树果'};
function onBpkmItemInput(){
  const inp=document.getElementById('bpkm-item');
  const drop=document.getElementById('bpkm-item-drop');
  if(!inp||!drop)return;
  const query=(inp.value||'').trim().toLowerCase();
  // 过滤：中文名/英文名/slug 均可检索
  let results=ITEMS_DATA.filter(it=>
    it.name.includes(query)||
    it.nameEn.toLowerCase().includes(query)||
    it.slug.includes(query)
  );
  if(!query){
    // 无输入时：优先展示携带道具，再超进化石，再树果（最多30条）
    const order={hold:0,mega:1,berry:2};
    results=[...results].sort((a,b)=>order[a.category]-order[b.category]).slice(0,30);
  } else {
    results=results.slice(0,20);
  }
  if(!results.length){drop.style.display='none';return;}
  // 按类别分组渲染
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

/* ──────── 保存队伍 ──────── */
async function saveBattleTeam(){
  if(!battleEditTeam)return;
  try{
    gatherSlotForm();
    battleEditTeam.team_name=document.getElementById('battle-team-name-inp').value.trim()||'我的队伍';
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
    showToast('队伍已保存 ✓');
  }catch(e){
    console.error('saveBattleTeam error',e);
    showToast('保存失败，请重试');
  }
}

async function confirmDeleteBattleTeam(id){
  if(!confirm('确定要删除这支队伍吗？'))return;
  try{
    await deleteBattleTeamFromServer(id);
    battleTeams=battleTeams.filter(t=>t.id!==id);
    try{localStorage.setItem('battle_teams',JSON.stringify(battleTeams));}catch{}
    renderTeamList();
    if (window._battleDoublesInited) { renderDTeamList(); renderDTeamSel(); }
    renderBattleTeamSel();
    showToast('已删除');
  }catch(e){
    console.error('confirmDeleteBattleTeam error',e);
    showToast('删除失败，请重试');
  }
}

async function deleteBattleTeamFromModal(){
  if(!battleEditTeam)return;
  if(!confirm('确定要删除这支队伍吗？'))return;
  try{
    await deleteBattleTeamFromServer(battleEditTeam.id);
    battleTeams=battleTeams.filter(t=>t.id!==battleEditTeam.id);
    try{localStorage.setItem('battle_teams',JSON.stringify(battleTeams));}catch{}
    renderTeamList();
    if (window._battleDoublesInited) { renderDTeamList(); renderDTeamSel(); }
    renderBattleTeamSel();
    closeBattleTeamEdit();
    showToast('已删除');
  }catch(e){
    console.error('deleteBattleTeamFromModal error',e);
    showToast('删除失败，请重试');
  }
}

/* ──────── 赛前分析 ──────── */
const boppSearchTimers={};

// 搜索结果图片：优先用数据里的 spriteUrl，超级形态没图时用基础形态图，兜底用 PokeAPI 全国图鉴编号
function getSearchSprite(r){
  if(r.spriteUrl) return r.spriteUrl;
  // mega / regional 形态：找基础形态
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
        <input class="battle-opp-inp" id="bopp-name-${i}" placeholder="搜索宝可梦…"
          oninput="if(!boppComposing[${i}])onOppNameInput(${i},this.value)"
          oncompositionstart="boppComposing[${i}]=true"
          oncompositionend="boppComposing[${i}]=false;onOppNameInput(${i},this.value)"
          onblur="setTimeout(()=>closeBoppDrop(${i}),350)" autocomplete="off">
        <div class="bpkm-search-drop" id="bopp-drop-${i}"></div>
      </div>
      <select class="battle-opp-type-sel" id="bopp-t1-${i}" title="属性1">
        <option value="">属性1</option>${typeOpts}
      </select>
      <select class="battle-opp-type-sel" id="bopp-t2-${i}" title="属性2（可选）">
        <option value="">属性2</option>${typeOpts}
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
  drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索中…</div>';
  drop.classList.add('open');
  boppSearchTimers[i]=setTimeout(async()=>{
    try{
      let results=PKM_LIST.filter(p=>p.name.includes(q)).slice(0,8).map(p=>({id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}));
      if(!results.length&&/^\d+$/.test(q)){const p=PKM_PC_BY_NUM[parseInt(q)];results=p?[{id:p.num,cnName:p.name,slug:p.slug,spriteUrl:p.spriteUrl||''}]:[];}
      if(!results.length&&!/[\u4e00-\u9fff\u3040-\u30ff\u31f0-\u31ff']/.test(q)){
        const r=await fetch(`${POKEAPI}/pokemon/${encodeURIComponent(q.toLowerCase())}`);
        if(r.ok){const d=await r.json();const lp=PKM_PC_BY_SLUG[q.toLowerCase()]||PKM_PC_BY_NUM[d.id];results=[{id:d.id,cnName:lp?.name||PKM_CN_TABLE[d.id]||d.name,slug:lp?.slug||'',spriteUrl:lp?.spriteUrl||d.sprites?.front_default||''}];}
      }
      if(!results.length){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">未找到</div>';return;}
      drop.innerHTML=results.map(r=>{
        const sprite=getSearchSprite(r);
        return`<div class="bpkm-drop-item" onclick="selectOppPkmFromDrop(${i},${r.id},'${esc(r.cnName||'')}','${r.slug||''}')">
          <img src="${sprite}" alt="" onerror="this.style.display='none'">
          <div class="bpkm-drop-name">${esc(r.cnName||'')}</div>
          <div class="bpkm-drop-num">#${r.id}</div>
        </div>`;
      }).join('');
    } catch(e){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索出错</div>';}
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
  battleSelectedMegaKey='auto';
  const team=battleTeams.find(t=>t.id===teamId);
  const preview=document.getElementById('battle-my-preview');
  if(!team||!preview)return;
  const pkm=Array.isArray(team.pokemon)?team.pokemon.filter(p=>p.name):[];
  const chips=pkm.map(p=>{
    const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">`:' ';
    return`<div class="battle-my-pkm-chip">${img}${esc(p.name)}</div>`;
  }).join('');
  preview.innerHTML=chips+renderBattleMegaSelect(team,battleSelectedMegaKey,'onBattleMegaSelect');
}

function onBattleMegaSelect(value){
  battleSelectedMegaKey=value||'auto';
}

/* ── 属性相克计算 ── */
function getTypeEff(atkType, defType1, defType2){
  const ai=B_TYPE_IDX[atkType];
  if(ai===undefined)return 1;
  const di1=B_TYPE_IDX[defType1]??-1;
  const di2=B_TYPE_IDX[defType2]??-1;
  let m=di1>=0?TYPE_EFF_MATRIX[ai][di1]:1;
  if(di2>=0)m*=TYPE_EFF_MATRIX[ai][di2];
  return m;
}

// 计算攻击某属性对防御方（含特性免疫）的有效倍率
function getTypeEffWithAbility(atkType, oppPkm, atkAbility=''){
  // 破格特性：无视防御方特性
  if(ABILITY_BREAKER.has(atkAbility)){
    return getTypeEff(atkType, oppPkm.type1, oppPkm.type2);
  }
  // 使用对方"最可能"的特性（首个特性）判断免疫
  const defAbility=oppPkm.ability||resolveOppAbility(oppPkm);
  if((ABILITY_TYPE_IMMUNE[defAbility]||[]).includes(atkType)) return 0;
  return getTypeEff(atkType, oppPkm.type1, oppPkm.type2);
}

// 获取我方宝可梦使用其最优技能攻击对方的最高倍率（含特性修正）；对方属性未知时返回 null
function getBestMoveEff(myPkm, oppPkm){
  if(!oppPkm.type1&&!oppPkm.type2)return null;
  const atkAbility=myPkm.ability||'';
  const atkMod=ABILITY_ATK_MOD[atkAbility]||{};
  const moves=[myPkm.move1,myPkm.move2,myPkm.move3,myPkm.move4].filter(m=>m&&m.type&&m.type!=='status'&&m.power>0);
  if(!moves.length){
    // 用本体属性估算
    return getTypeEffWithAbility(myPkm.type1, oppPkm, atkAbility);
  }
  return Math.max(...moves.map(m=>{
    // 属性转换特性（像素精灵等）
    const {type:moveType}=getMoveTypeWithAbility(myPkm, m);
    return getTypeEffWithAbility(moveType, oppPkm, atkAbility);
  }));
}

// 对方攻击我方的最高倍率（含我方特性免疫）
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

/* ── Champions 伤害估算 ──
 * 公式参考标准 Lv.50 格斗：
 *   Damage = Floor( Floor((2*Lv/5+2) * Pwr * A/D / 50) + 2 ) * modifiers
 * Champions AP修正：ap1→×0.6, ap2→×0.85, ap3→×1.0, ap4→×1.25, ap5→×1.55
 * 持有道具修正（简化）：讲究系→×1.5, 生命球→×1.3
 */
// AP_MOD removed — Champions uses PP, not AP action points
// 兼容旧格式（全局倍率），优先用 calcItemDamageMul
const ITEM_MOD={'讲究头带':1.5,'讲究眼镜':1.5,'讲究围巾':1.5,'生命球':1.3,'火焰宝珠':1.2,'强化道具':1.1};
const ITEM_RESIST_BERRY_TYPE={
  'charti-berry':'rock','草蚕果':'rock',
  'coba-berry':'flying','棱瓜果':'flying',
  'colbur-berry':'dark','刺耳果':'dark',
  'chople-berry':'fighting','莲蒲果':'fighting',
  'haban-berry':'dragon','莓榴果':'dragon',
  'kasib-berry':'ghost','佛柑果':'ghost',
  'kebia-berry':'poison','通通果':'poison',
  'occa-berry':'fire','巧可果':'fire',
  'passho-berry':'water','千香果':'water',
  'payapa-berry':'psychic','福禄果':'psychic',
  'babiri-berry':'steel','霹霹果':'steel',
  'chilan-berry':'normal','灯浆果':'normal',
  'rindo-berry':'grass','罗子果':'grass',
  'roseli-berry':'fairy','洛玫果':'fairy',
  'shuca-berry':'ground','腰木果':'ground',
  'tanga-berry':'bug','扁樱果':'bug',
  'wacan-berry':'electric','烛木果':'electric',
  'yache-berry':'ice','番荔果':'ice',
};

function getBattleItemData(item){
  if(!item)return null;
  if(typeof item==='object')return item;
  const raw=String(item).trim();
  if(!raw)return null;
  const lower=raw.toLowerCase();
  return ITEMS_BY_NAME[raw]||ITEMS_BY_SLUG[raw]||ITEMS_BY_SLUG[lower]||
    ITEMS_DATA.find(it=>it.nameEn?.toLowerCase()===lower)||null;
}

function getBattleItemSlug(item){
  if(!item)return '';
  if(typeof item==='object')return item.slug||'';
  const data=getBattleItemData(item);
  return data?.slug||String(item).trim().toLowerCase();
}

// 计算持有道具对伤害的倍率（支持属性限定/物理特殊限定）
function calcItemDamageMul(itemName, moveType, moveCat){
  if(!itemName)return 1.0;
  // 优先从 ITEMS_DATA 查
  const it=getBattleItemData(itemName);
  if(it?.damageMul){
    const m=it.damageMul;
    if(m.typeMul && m.typeMul[moveType]) return m.typeMul[moveType];
    if(m.globalMul) return m.globalMul;
    if(m.physMul && moveCat==='physical') return m.physMul;
    if(m.specMul && moveCat==='special')  return m.specMul;
    return 1.0;
  }
  // 回退旧 ITEM_MOD（讲究头带按物理/特殊分类）
  const slug=getBattleItemSlug(itemName);
  if((itemName==='讲究头带'||slug==='choice-band')  && moveCat==='physical') return 1.5;
  if((itemName==='讲究眼镜'||slug==='choice-specs') && moveCat==='special')  return 1.5;
  if(itemName==='讲究围巾'||slug==='choice-scarf')  return 1.0; // 仅加速，不加伤害
  if(itemName==='生命球'||slug==='life-orb')return 1.3;
  return ITEM_MOD[itemName]||1.0;
}

function calcDefenderItemDamageMul(defPkm, moveType, moveCat, typeMul=1){
  const item=defPkm?.predictedItem||defPkm?.item||'';
  const slug=getBattleItemSlug(item);
  if(!slug)return{mul:1.0,note:''};
  if((slug==='assault-vest'||item==='突击背心')&&moveCat==='special')return{mul:1/1.5,note:'突击背心'};
  if(slug==='eviolite'||item==='进化奇石')return{mul:1/1.5,note:'进化奇石'};
  const berryType=ITEM_RESIST_BERRY_TYPE[slug]||ITEM_RESIST_BERRY_TYPE[item];
  if(berryType&&berryType===moveType&&typeMul>=2)return{mul:0.5,note:`${TYPE_ZH[berryType]||berryType}抗性树果`};
  return{mul:1.0,note:''};
}

function getSurvivalItemNote(defPkm, pct){
  const item=defPkm?.item||defPkm?.predictedItem||'';
  const slug=getBattleItemSlug(item);
  if((slug==='focus-sash'||item==='气势披带')&&pct>=100)return'气势披带：满血可1HP撑过';
  if((slug==='focus-band'||item==='气势头带')&&pct>=100)return'气势头带：有概率撑过致命伤';
  return '';
}

function calcDamageEst(myPkm, oppPkm, move, activeWeather=''){
  if(!move||!move.power||move.cat==='status')return null;
  const level=myPkm.level||50;
  const isPhys=move.cat==='physical';
  const atkAbility=myPkm.ability||'';
  const defAbility=oppPkm.ability||resolveOppAbility(oppPkm);
  const atkMod=ABILITY_ATK_MOD[atkAbility]||{};

  // ── 攻防能力值 ──
  let rawAtk=isPhys
    ?calcActualStatVal(myPkm.base?.atk||70,31,myPkm.ev?.atk||0,myPkm.nature,'atk',level)
    :calcActualStatVal(myPkm.base?.spa||70,31,myPkm.ev?.spa||0,myPkm.nature,'spa',level);
  // C类：攻击能力值倍率（大力士/纯力/活泼）
  if(atkMod.atkStatMul && isPhys) rawAtk=Math.floor(rawAtk*atkMod.atkStatMul);
  if(atkMod.atkStatMul && !isPhys) rawAtk=Math.floor(rawAtk*atkMod.atkStatMul); // pure-power only phys, but simplify

  let defStat=isPhys
    ?calcActualStatVal(oppPkm.base?.def||70,15,0,'','def',level)
    :calcActualStatVal(oppPkm.base?.spd||70,15,0,'','spd',level);
  // B类：毛皮大衣→物理防御×2（等效伤害×0.5）
  const defMod=ABILITY_DEF_MOD[defAbility];
  if(defMod?.physMul && isPhys) defStat=Math.floor(defStat/defMod.physMul);

  const oppHp=calcActualStatVal(oppPkm.base?.hp||70,15,0,'','hp',level);

  // ── 技能属性（含转换特性）──
  const {type:moveType, convertMul}=getMoveTypeWithAbility(myPkm, move);
  let pwr=move.power;

  // ── 属性相克（含免疫特性）──
  const typeMul=getTypeEffWithAbility(moveType, oppPkm, atkAbility);
  if(typeMul===0) return{damage:0,pct:0,typeMul:0};

  // ── B类：防御特性减免 ──
  let defAbilMul=1.0;
  if(defMod){
    if(defMod.types?.includes(moveType)) defAbilMul*=defMod.mul;
    if(defMod.superEff && typeMul>=2) defAbilMul*=defMod.superEff;
  }

  // ── 防御方持有道具修正（我方/对方共用） ──
  const defItem=calcDefenderItemDamageMul(oppPkm, moveType, move.cat, typeMul);

  // ── 攻击方道具修正 ──
  const itemMul=calcItemDamageMul(myPkm.item, moveType, move.cat);

  // ── STAB（含适应力/变幻自如）──
  const isStabType=(moveType===myPkm.type1||moveType===myPkm.type2);
  const hasStab=isStabType||(atkMod.alwaysStab);
  const stabMul=hasStab?(atkMod.stabMul||1.5):1.0;

  // ── C类：技能增幅倍率 ──
  const atkAbilMul=calcAtkAbilityMul(myPkm, {...move, type:moveType}, activeWeather);
  // 属性转换附加倍率（pixilate等）
  const finalConvertMul=(atkMod.normalConvert&&move.type==='normal')?convertMul:1.0;

  const baseDmg=Math.floor((Math.floor((2*level/5+2)*pwr*rawAtk/defStat/50)+2)
    *typeMul*stabMul*itemMul*atkAbilMul*finalConvertMul*defAbilMul*defItem.mul);
  let dmgPct=oppHp>0?Math.round(baseDmg/oppHp*100):0;

  // G类生存标注
  const itemSurviveNote=getSurvivalItemNote(oppPkm,dmgPct);
  const surviveNote=[ABILITY_SURVIVE[defAbility]||'',defItem.note,itemSurviveNote].filter(Boolean).join('；');
  if(itemSurviveNote&&dmgPct>=100)dmgPct=99;

  return{damage:baseDmg,pct:dmgPct,typeMul,surviveNote};
}

/* ──────── 主分析入口 ──────── */
function analyzeMatchups(){
  if(window.partnerTrackEvent)window.partnerTrackEvent('battle_analysis');
  if(window.addAffinityProgress)window.addAffinityProgress('battle_analysis');
  // 收集对方数据（含种族值，用于速度对比）
  [0,1,2,3,4,5].forEach(i=>{
    const name=document.getElementById(`bopp-name-${i}`)?.value.trim()||'';
    const type1=document.getElementById(`bopp-t1-${i}`)?.value||'';
    const type2=document.getElementById(`bopp-t2-${i}`)?.value||'';
    const lp=name?PKM_LIST.find(p=>p.name===name):null;
    const sl=lp?.slug||battleOppPkm[i]?.slug||'';
    const builds=window.PKM_CHAMPIONS_BUILDS?.[sl]||null;
    // 保留从下拉选择时已存入的 predicted 字段，如没有则从 builds 补充
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
  if(!opp.length){showToast('请至少填入对方一只宝可梦的属性');return;}
  const myTeam=battleTeams.find(t=>t.id===battleMyTeamId);
  if(!myTeam){showToast('请先选择我的队伍');return;}
  const rawMyPkm=(myTeam.pokemon||[]).map((p,idx)=>({...p,_slotIndex:idx})).filter(p=>p.name);
  if(!rawMyPkm.length){showToast('队伍为空，请先录入队伍成员');return;}
  battleAnalysisMyTeam=myTeam;

  const resultBox=document.getElementById('battle-analysis-result');
  resultBox.style.display='block';
  resultBox.innerHTML=`<div class="battle-analyzing">分析中<span class="battle-analyzing-dots"><span>.</span><span>.</span><span>.</span></span></div>`;

  setTimeout(()=>{
    try{
      const rawWeather=detectMyWeather(rawMyPkm);
      // ── 预测只作参考；实际推荐和分析按对方全队评分，避免预测错误时信息缺口 ──
      const oppValid=opp.filter(op=>op.name||op.type1);
      const predResult=predictOppBestCombo(oppValid,rawMyPkm,rawWeather);
      const analysisOpp=oppValid;
      const megaPrep=prepareBattleTeamForMegaRule(rawMyPkm,analysisOpp,rawWeather,'singles');
      const myPkm=megaPrep.team;
      const activeWeather=detectMyWeather(myPkm)||rawWeather;
      const scored=scorePkmForBattle(myPkm,analysisOpp,activeWeather);
      const matrixHtml=renderBattleMatrix(myPkm,opp);
      const coverageHtml=renderBattleCoverage(myPkm,opp);
      const dmgHtml=renderBattleDamage(myPkm,opp,activeWeather);
      const oppDmgHtml=renderOppDamage(opp,myPkm,activeWeather);
      const recHtml=renderBattleRec(scored,analysisOpp);
      const weakHtml=renderTeamWeaknessWarning(scored);
      const speedHtml=renderSpeedAnalysis(scored,opp);
      const oppPredHtml=renderOppTeamPrediction(oppValid,predResult);
      const quickHtml=renderQuickDecisionPanel({scored,myPkm,opp:oppValid,activeWeather,format:'singles'});
      const megaPlanHtml=describeBattleMegaPlan(myPkm,megaPrep.megaKey);
      const recSubtitle='针对对方全部已知成员';
      resultBox.innerHTML=`
        <div class="battle-result-box">
          ${quickHtml}
          ${oppPredHtml?`<div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">🔮 对方出战预测</span><span class="battle-datasrc-note">仅作参考；推荐、伤害、速度按对方全队计算 · 点击首发可预测后续</span></div>
            ${oppPredHtml}
          </div>`:''}
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">推荐出战阵容</span><span class="battle-datasrc-note">${recSubtitle}</span></div>
            ${megaPlanHtml}
            ${recHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">⚠ 队伍脆弱性预警</span></div>
            ${weakHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">速度档位</span><span class="battle-datasrc-note">仅基础速度；差值&lt;20时先后手受努力值影响</span></div>
            ${speedHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">属性相克矩阵</span><span class="battle-datasrc-note">行=我方用技能攻击，列=对方防御</span></div>
            ${matrixHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">技能覆盖分析</span></div>
            ${coverageHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">伤害估算（我方 → 对方）</span><span class="battle-datasrc-note">Champions Lv.50 公式</span></div>
            ${dmgHtml}
          </div>
          ${oppDmgHtml?`<div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">对方热门技能 → 我方伤害</span><span class="battle-datasrc-note">基于锦标赛使用率 top4 技能</span></div>
            ${oppDmgHtml}
          </div>`:''}
        </div>`;
    } catch(e){
      resultBox.innerHTML=`<div class="battle-analyzing">分析出错：${esc(e.message)}</div>`;
    }
  },80);
}

/* ── 相克矩阵 ── */
function renderBattleMatrix(myPkm, opp){
  const effClass=m=>m>=4?'bm-x4':m>=2?'bm-x2':m>=1?'bm-x1':m>=0.5?'bm-x05':m>0?'bm-x025':'bm-x0';
  const effLabel=m=>m===0?'×0':m===0.25?'¼':m===0.5?'½':m===1?'1':m===2?'2×':m===4?'4×':m+'×';
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
  return`<div class="battle-matrix-wrap"><table class="battle-matrix"><tr><th class="row-hdr">我方 ↓ / 对方 →</th>${cols}</tr>${rows}</table></div>`;
}

/* ── 技能覆盖 ── */
function renderBattleCoverage(myPkm, opp=[]){
  const oppValid=opp.filter(op=>op.name||op.type1);
  const cards=myPkm.map(p=>{
    const moves=[p.move1,p.move2,p.move3,p.move4].filter(m=>m&&m.type&&m.cat!=='status');
    const unique=[...new Set(moves.map(m=>m.type))];
    const typeTags=unique.map(t=>`<span class="coverage-type-tag type-${t}">${TYPE_ZH[t]||t}</span>`).join('');
    const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" class="cov-sprite" alt="" onerror="this.style.display='none'">`:'';

    // 对方覆盖徽章：每只对方 → 最高效果倍率
    let oppBadges='';
    if(oppValid.length){
      const atkAbility=p.ability||'';
      oppBadges=oppValid.map(op=>{
        if(!op.name&&!op.type1)return'';
        const eff=getBestMoveEff(p,op);
        if(eff===null)return'';
        const oppSprite=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
        const cls=eff>=4?'cov-badge-x4':eff>=2?'cov-badge-x2':eff===1?'cov-badge-x1':eff<=0?'cov-badge-immune':'cov-badge-resist';
        const label=eff===0?'×0':eff===0.25?'¼×':eff===0.5?'½×':eff===1?'1×':eff===2?'2×':eff===4?'4×':`${eff}×`;
        return`<div class="cov-opp-badge ${cls}">
          ${oppSprite?`<img src="${esc(oppSprite)}" class="cov-opp-sprite" alt="" onerror="this.style.display='none'">`:''}
          <span class="cov-badge-name">${esc(op.name||'?')}</span>
          <span class="cov-badge-eff">${label}</span>
        </div>`;
      }).filter(Boolean).join('');
    }

    return`<div class="coverage-card">
      <div class="coverage-card-name">${img}${esc(p.name)}</div>
      ${typeTags?`<div class="coverage-type-tags">${typeTags}</div>`:'<div class="coverage-type-tags" style="color:var(--t3);font-size:.66rem">无技能数据</div>'}
      ${oppBadges?`<div class="cov-opp-row">${oppBadges}</div>`:''}
    </div>`;
  }).join('');
  return`<div class="battle-coverage-grid">${cards}</div>`;
}

/* ── 伤害估算（热力矩阵） ── */
function renderBattleDamage(myPkm, opp, activeWeather=''){
  const oppValid=opp.filter(op=>op.name||op.type1);
  if(!oppValid.length)return`<div class="battle-analyzing">请填写对方队伍信息</div>`;

  // 列标题（对方宝可梦）
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
      if(!op.name&&!op.type1)return`<td class="bdmg-cell bdmg-unknown">—</td>`;
      const dmgMoves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
      let best=null;
      dmgMoves.forEach(m=>{
        const r=calcDamageEst(mp,op,m,activeWeather);
        if(r&&(!best||r.pct>best.pct))best={...r,moveName:m.name||''};
      });
      if(!best){
        const eff=getBestMoveEff(mp,op);
        if(eff===null)return`<td class="bdmg-cell bdmg-unknown"><div class="bdmg-pct-num">?</div></td>`;
        if(eff===0)return`<td class="bdmg-cell bdmg-immune"><div class="bdmg-pct-num">免疫</div></td>`;
        const cls=eff>=2?'bdmg-resist':'bdmg-nodata';
        return`<td class="bdmg-cell ${cls}"><div class="bdmg-pct-num">${eff>=2?'克制':'—'}</div></td>`;
      }
      const cls=best.pct>=100?'bdmg-ohko':best.pct>=50?'bdmg-2hko':best.pct>=25?'bdmg-mid':'bdmg-low';
      const koLabel=best.pct>=100?'1KO':best.pct>=50?'2KO':'';
      const barW=Math.min(best.pct,100);
      const surviveTip=best.surviveNote?` title="${esc(best.surviveNote)}"`:'' ;
      return`<td class="bdmg-cell ${cls}"${surviveTip}>
        <div class="bdmg-pct-row">
          <span class="bdmg-pct-num">${best.pct}%</span>
          ${koLabel?`<span class="bdmg-ko-badge">${koLabel}</span>`:''}
          ${best.surviveNote?`<span class="bdmg-survive-dot" title="${esc(best.surviveNote)}">⚑</span>`:''}
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
          <div class="bdmg-row-types">${moveTags||'<span style="color:var(--t3);font-size:.6rem">无技能</span>'}</div>
        </div>
      </td>
      ${cells}
    </tr>`;
  }).join('');

  return`<div class="bdmg-wrap"><table class="bdmg-table">
    <thead><tr><th class="bdmg-corner">我方 ↓ / 对方 →</th>${colHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table></div>`;
}

/* ── 评分核心（供多个渲染函数共用） ── */
function scorePkmForBattle(myPkm, opp, activeWeather='', options={}){
  const oppValid=opp.filter(op=>op.name||op.type1);
  const rawScored=myPkm.map(mp=>{
    let offScore=0, defScore=0, koScore=0;
    const reasons=[];
    const mySpd=getEffectiveSpeed(mp, activeWeather);
    oppValid.forEach(op=>{
      const eff=getBestMoveEff(mp,op);
      if(eff===null)return;
      offScore+=eff;
      if(eff>=2)reasons.push(`克制${op.name||op.type1}系`);
      const taken=getOppBestEff(op,mp);
      defScore+=taken;
      const moves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
      let bestPct=0;
      moves.forEach(m=>{const r=calcDamageEst(mp,op,m,activeWeather);if(r&&r.pct>bestPct)bestPct=r.pct;});
      const oppSpd=getEffectiveSpeed(op, activeWeather);
      const isFaster=mySpd>0&&oppSpd>0&&mySpd>oppSpd;
      const speedMul=(mySpd>0&&oppSpd>0)?(isFaster?1.5:0.7):1.0;
      if(bestPct>=100){
        koScore+=speedMul;
        reasons.push(`可一击秒杀${esc(op.name||'?')}${isFaster?' ⚡先手':oppSpd&&mySpd?' 🐢后手':''}`);
      } else if(bestPct>=50){
        // 2HKO 也享有速度加成，权重较小
        koScore+=(mySpd>0&&oppSpd>0)?(isFaster?0.4:0.2):0.25;
        reasons.push(`两击可KO${esc(op.name||'?')}${isFaster?' ⚡先手':''}`);
      }
    });
    // 特性相关加分：免疫某类型
    const myAbility=mp.ability||'';
    const immuneTypes=ABILITY_TYPE_IMMUNE[myAbility]||[];
    if(immuneTypes.length) reasons.push(`特性免疫${immuneTypes.map(t=>TYPE_ZH[t]).join('/')}系`);
    const weakTypes=B_TYPES.filter(t=>getTypeEff(t,mp.type1,mp.type2)>=2&&!immuneTypes.includes(t));
    const resistTypes=B_TYPES.filter(t=>getTypeEff(t,mp.type1,mp.type2)<=0.5);
    if(resistTypes.length)reasons.push(`抗性好（${resistTypes.map(t=>TYPE_ZH[t]).slice(0,3).join('/')}等）`);
    if(weakTypes.length<=2)reasons.push(`弱点少（仅${weakTypes.length}种）`);

    // defTypeBonus：对方预测技能属性的抗性加分
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
      reasons.push(`能抗对方常用技能`);

    // ── 我方携带道具加成 ──
    let myItemBonus=0;
    const myItem=mp.item||'';
    const myItemData=getBattleItemData(myItem);
    const myItemSlug=getBattleItemSlug(myItem);
    const myItemLabel=myItemData?.name||myItem;
    const myMoves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
    const bestItemAtkMul=myMoves.reduce((best,m)=>{
      const {type}=getMoveTypeWithAbility(mp,m);
      return Math.max(best,calcItemDamageMul(myItem,type,m.cat));
    },1);
    if(bestItemAtkMul>1.01){
      myItemBonus+=(bestItemAtkMul-1)*2;
      reasons.push(`${myItemLabel}提升有效输出×${bestItemAtkMul.toFixed(1)}`);
    }
    let maxIncomingPct=0;
    oppValid.forEach(op=>{
      const oppAbility=resolveOppAbility(op);
      const oppItemSlug=op.predictedItem?.slug||'';
      const oppAsAtk={name:op.name,type1:op.type1,type2:op.type2,base:op.base||{},ability:oppAbility,item:oppItemSlug,level:50};
      (op.predictedMoves||[]).forEach(pm=>{
        const mv=MOVES_BY_SLUG?.[pm.slug];
        if(!mv||!mv.power||mv.cat==='status')return;
        const res=calcDamageEst(oppAsAtk,mp,mv,activeWeather);
        if(res&&res.pct>maxIncomingPct)maxIncomingPct=res.pct;
      });
    });
    if(myItem==='突击背心'||myItemSlug==='assault-vest'){
      // 对方有特殊招式时，特防×1.5相当于降低受伤效率
      const hasOppSpec=oppValid.some(op=>(op.predictedMoves||[]).some(m=>MOVES_BY_SLUG?.[m.slug]?.cat==='special'));
      if(hasOppSpec){myItemBonus+=1.5;reasons.push('突击背心对抗对方特攻');}
    } else if(myItem==='气势披带'||myItemSlug==='focus-sash'){
      myItemBonus+=maxIncomingPct>=80?1.4:0.8;reasons.push('气势披带可撑过一击');
    } else if(myItem==='气势头带'||myItemSlug==='focus-band'){
      myItemBonus+=maxIncomingPct>=80?0.6:0.3;reasons.push('气势头带有概率撑过致命伤');
    } else if(myItem==='吃剩的东西'||myItemSlug==='leftovers'){
      myItemBonus+=0.5;reasons.push('吃剩的东西持续回血');
    } else if(myItem==='文柚果'||myItemSlug==='sitrus-berry'){
      myItemBonus+=0.5;reasons.push('文柚果可回复约1/4 HP');
    } else if(myItem==='讲究围巾'||myItemSlug==='choice-scarf'){
      reasons.push('讲究围巾速度×1.5');
    } else if(myItem==='讲究头带'||myItemSlug==='choice-band'){
      reasons.push('讲究头带物攻×1.5');
    } else if(myItem==='讲究眼镜'||myItemSlug==='choice-specs'){
      reasons.push('讲究眼镜特攻×1.5');
    } else if(myItem==='生命球'||myItemSlug==='life-orb'){
      reasons.push('生命球伤害×1.3');
    }
    // 抗性树果：对方有对应属性招式时额外加分
    const rType=ITEM_RESIST_BERRY_TYPE[myItemSlug]||ITEM_RESIST_BERRY_TYPE[myItem];
    if(rType){
      const threatPct=oppMoveTypes.filter(({type})=>type===rType).reduce((s,{pct})=>s+pct,0);
      if(threatPct>40){myItemBonus+=1.0;reasons.push(`${myItemLabel}减弱对方${TYPE_ZH[rType]||rType}系招式`);}
    }

    const total=offScore - defScore*0.5 + koScore*3 + defTypeBonus + myItemBonus;
    return{pkm:mp,offScore,defScore,koCount:Math.round(koScore),koScore,defTypeBonus:+defTypeBonus.toFixed(2),myItemBonus:+myItemBonus.toFixed(2),total,reasons:[...new Set(reasons)].slice(0,5)};
  }).sort((a,b)=>b.total-a.total);
  if(options.raw)return rawScored;
  return selectSynergisticTop3(rawScored);
}

/* ── 单打首发鲁棒性筛选：在Top3中选最坏对局下限最高的首发 ── */
function selectSinglesLead(top3, oppPool, activeWeather){
  if(!top3.length)return null;
  if(!oppPool.length||top3.length===1)return top3[0];

  const withRobust=top3.map(s=>{
    const mp=s.pkm;
    const mySpd=getEffectiveSpeed(mp,activeWeather);
    let worstExposure=0, bestThreat=0;
    oppPool.forEach(op=>{
      const taken=getOppBestEff(op,mp);
      if(taken>worstExposure)worstExposure=taken;
      const eff=getBestMoveEff(mp,op);
      if(eff!==null&&eff>bestThreat)bestThreat=eff;
    });
    // floor：能威胁至少一只 且 不被单方面克死
    const floor=bestThreat-worstExposure*0.6;
    return{s,floor};
  });

  const floors=withRobust.map(x=>x.floor);
  const minFloor=Math.min(...floors), maxFloor=Math.max(...floors);
  const floorRange=Math.max(maxFloor-minFloor,0.001);
  const totals=top3.map(s=>s.total);
  const minTotal=Math.min(...totals), maxTotal=Math.max(...totals);
  const totalRange=Math.max(maxTotal-minTotal,0.001);

  return withRobust
    .map(x=>({...x,leadScore:(x.s.total-minTotal)/totalRange*0.65+(x.floor-minFloor)/floorRange*0.35}))
    .sort((a,b)=>b.leadScore-a.leadScore)[0].s;
}

/* ── 协同性Top3选择：#2/#3 补强前面宝可梦的弱点属性 ── */
function selectSynergisticTop3(scored){
  if(scored.length<=3)return scored;
  const first=scored[0];
  const pool1=scored.slice(1);
  const weakOf=p=>{
    const immune=ABILITY_TYPE_IMMUNE[p.ability||'']||[];
    return B_TYPES.filter(t=>getTypeEff(t,p.type1,p.type2)>=2&&!immune.includes(t));
  };
  const firstWeak=weakOf(first.pkm);
  // 选#2：原评分 + 每抵抗一个#1的弱点+2分
  const second=pool1.map(s=>({s,syn:s.total+firstWeak.filter(t=>getTypeEff(t,s.pkm.type1,s.pkm.type2)<=0.5).length*2}))
    .sort((a,b)=>b.syn-a.syn)[0].s;
  const pool2=pool1.filter(s=>s!==second);
  const secondWeak=weakOf(second.pkm);
  const combinedWeak=[...new Set([...firstWeak,...secondWeak])];
  // 选#3：补强两者共同弱点
  const third=pool2.map(s=>({s,syn:s.total+combinedWeak.filter(t=>getTypeEff(t,s.pkm.type1,s.pkm.type2)<=0.5).length*2}))
    .sort((a,b)=>b.syn-a.syn)[0].s;
  const top3=new Set([first,second,third]);
  return[first,second,third,...scored.filter(s=>!top3.has(s))];
}

/* ── 角色识别 ── */
function classifyRole(pkm){
  const moves=[pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(m=>m&&m.name);
  const statusMoves=moves.filter(m=>m.cat==='status');
  const physMoves=moves.filter(m=>m.cat==='physical'&&m.power>0);
  const specMoves=moves.filter(m=>m.cat==='special'&&m.power>0);
  const base=pkm.base||{};
  const atk=base.atk||0, spa=base.spa||0;
  const hp=base.hp||0, def=base.def||0, spd=base.spd||0;
  if(moves.length>0&&physMoves.length===0&&specMoves.length===0)
    return{label:'辅助',cls:'role-support'};
  if(statusMoves.length>=2)return{label:'辅助',cls:'role-support'};
  if(atk+spa>0&&(hp+def+spd)/(atk+spa)>1.8&&statusMoves.length>=1)
    return{label:'盾牌',cls:'role-wall'};
  if(physMoves.length>specMoves.length&&atk>=spa)
    return{label:'物理输出',cls:'role-phys'};
  if(specMoves.length>physMoves.length&&spa>atk)
    return{label:'特攻输出',cls:'role-spec'};
  if(physMoves.length>0&&specMoves.length>0)return{label:'混合输出',cls:'role-mixed'};
  return{label:'综合型',cls:'role-mixed'};
}

/* ── 队伍脆弱性预警 ── */
function renderTeamWeaknessWarning(scored){
  const top3=scored.slice(0,3).map(s=>s.pkm).filter(p=>p.type1);
  if(!top3.length)return`<div class="battle-warn-ok">属性数据不足，无法分析</div>`;
  const warnings=[];
  B_TYPES.forEach(t=>{
    const hits=top3.filter(p=>getTypeEff(t,p.type1,p.type2)>=2);
    if(hits.length>=2)
      warnings.push(`<b>${TYPE_ZH[t]||t}系</b>可克制 ${hits.map(p=>esc(p.name)).join('、')}（${hits.length}/3只）`);
  });
  // 没有任何宝可梦对某属性抗性的类型
  const noResist=B_TYPES.filter(t=>top3.every(p=>getTypeEff(t,p.type1,p.type2)>=1));
  if(!warnings.length)
    return`<div class="battle-warn-ok">✓ 出战三只对各属性无明显集体弱点</div>`;
  return`<div class="battle-warn-list">${warnings.map(w=>`<div class="battle-warn-item">⚠ ${w}</div>`).join('')}</div>`;
}

function renderTeamWeaknessWarningD(scored4){
  const top4=scored4.slice(0,4).map(s=>s.pkm).filter(p=>p.type1);
  if(!top4.length)return`<div class="battle-warn-ok">属性数据不足，无法分析</div>`;
  const warnings=[];
  B_TYPES.forEach(t=>{
    const hits=top4.filter(p=>getTypeEff(t,p.type1,p.type2)>=2);
    if(hits.length>=3)
      warnings.push(`<b>${TYPE_ZH[t]||t}系</b>可克制 ${hits.map(p=>esc(p.name)).join('、')}（${hits.length}/4只）`);
  });
  if(!warnings.length)
    return`<div class="battle-warn-ok">✓ 出战四只对各属性无明显集体弱点</div>`;
  return`<div class="battle-warn-list">${warnings.map(w=>`<div class="battle-warn-item">⚠ ${w}</div>`).join('')}</div>`;
}

/* ── 速度档位对比（含天气/特性速度修正）── */
function renderSpeedAnalysis(scored, opp){
  const myPkmAll=scored.map(s=>s.pkm);
  const oppWithSpd=opp.filter(op=>(op.name||op.type1)&&op.base?.spe);
  if(!oppWithSpd.length)
    return`<div style="color:var(--t3);font-size:.78rem">需通过搜索选择对方宝可梦才能获取种族值，手动填入属性时无法计算速度</div>`;

  const myWeather=detectMyWeather(myPkmAll);
  const oppWeathers=detectOppWeather(oppWithSpd);
  const activeWeather=myWeather||'';
  const weatherZH={'sun':'晴天','rain':'雨天','sand':'沙暴','snow':'冰雪'};
  const weatherNote=myWeather?`<div class="spd-weather-note">☀ 己方天气：${weatherZH[myWeather]||myWeather}</div>`:
    oppWeathers.length?`<div class="spd-weather-note">⚠ 对方可能设置：${oppWeathers.map(w=>weatherZH[w]||w).join('/')} 天气</div>`:'';

  // 收集所有速度条目
  const entries=[];
  myPkmAll.forEach((pkm,ri)=>{
    const base=pkm.base?.spe||0;
    if(!base)return;
    const eff=getEffectiveSpeed(pkm,activeWeather);
    const spdMod=ABILITY_SPD_MOD[pkm.ability||''];
    const note=eff!==base?`×特性`:spdMod?.perTurn?'每回合↑':spdMod?.onItemUse?'道具后×2':'';
    entries.push({team:'my',name:pkm.name,sprite:pkm._spriteUrl||'',base,eff,note,rank:ri});
  });
  oppWithSpd.forEach(op=>{
    const oppAbilityList=getOppAbilityList(op);
    const oppSpdMod=oppAbilityList.map(a=>ABILITY_SPD_MOD[a]).find(m=>m?.weather);
    const eff=oppSpdMod&&oppWeathers.includes(oppSpdMod.weather)?Math.round(op.base.spe*oppSpdMod.mul):op.base.spe;
    const note=eff!==op.base.spe?`×特性`:'';
    const sprite=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
    entries.push({team:'opp',name:op.name||'?',sprite,base:op.base.spe,eff,note});
  });
  entries.sort((a,b)=>b.eff-a.eff||b.base-a.base);

  const maxEff=entries[0]?.eff||1;
  const myEffSpeeds=myPkmAll.map(pkm=>getEffectiveSpeed(pkm,activeWeather));

  const bars=entries.map(e=>{
    const barW=Math.round((e.eff/maxEff)*100);
    const isMy=e.team==='my';
    // 与对方比较：计算先手/后手数量
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
      if(wins)parts.push(`<span class="spd-vs-win">先手×${wins}</span>`);
      if(lose)parts.push(`<span class="spd-vs-lose">后手×${lose}</span>`);
      if(oppWithSpd.length-wins-lose>0)parts.push(`<span class="spd-vs-unclear">±${oppWithSpd.length-wins-lose}</span>`);
      vsTag=parts.join('');
    } else {
      // 对方条目：显示我方中多少只比它快
      const myFaster=myEffSpeeds.filter(ms=>ms-e.eff>=20).length;
      const mySlower=myEffSpeeds.filter(ms=>e.eff-ms>=20).length;
      const parts=[];
      if(myFaster)parts.push(`<span class="spd-vs-win">被×${myFaster}只先手</span>`);
      if(mySlower)parts.push(`<span class="spd-vs-lose">压制×${mySlower}只</span>`);
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

  return`<div class="battle-speed-visual">${weatherNote}<div class="spd-legend"><span class="spd-legend-my">我方</span><span class="spd-legend-opp">对方</span></div>${bars}</div>`;
}

/* ── 对方热门技能打我方的伤害估算 ── */
function renderOppDamage(opp, myPkm, activeWeather=''){
  const oppValid=opp.filter(op=>(op.name||op.type1)&&op.predictedMoves?.length);
  if(!oppValid.length) return '';

  const rows=oppValid.map(op=>{
    const oppAbility=resolveOppAbility(op);
    const oppItemSlug=op.predictedItem?.slug||'';
    // 构造对方宝可梦的"攻击方"对象
    const oppAsAtk={
      name:op.name, type1:op.type1, type2:op.type2,
      base:op.base||{}, ability:oppAbility, item:oppItemSlug,
      level:50,
      move1:null,move2:null,move3:null,move4:null,
    };
    // 把 predictedMoves 转成技能对象
    const moves=op.predictedMoves.map(m=>MOVES_BY_SLUG[m.slug]).filter(Boolean)
      .filter(m=>m.power>0&&m.cat!=='status');
    if(!moves.length) return '';

    const role=classifyOppRole(op);
    const roleTag=`<span class="opp-dmg-role ${role.cls}">${role.label}</span>`;
    const abilityTag=oppAbility?`<span class="opp-dmg-ability">${oppAbility}</span>`:'';
    const itemTag=oppItemSlug?`<span class="opp-dmg-item">${oppItemSlug.replace(/-/g,' ')}</span>`:'';

    const myPkmCols=myPkm.map(mp=>{
      let bestPct=0, bestMove='', bestNote='';
      moves.forEach(mv=>{
        const res=calcDamageEst(oppAsAtk, mp, mv, activeWeather);
        if(res&&res.pct>bestPct){ bestPct=res.pct; bestMove=mv.name||mv.nameEn||''; bestNote=res.surviveNote||''; }
      });
      const cls=bestPct>=100?'opp-dmg-ohko':bestPct>=50?'opp-dmg-heavy':bestPct>=25?'opp-dmg-mid':'opp-dmg-low';
      const note=bestNote?`<br><span class="opp-dmg-move">${esc(bestNote)}</span>`:'';
      return`<td class="${cls}">${bestPct>0?bestPct+'%':'-'}${bestMove?`<br><span class="opp-dmg-move">${esc(bestMove)}</span>`:''}${note}</td>`;
    }).join('');

    return`<tr><td class="opp-dmg-name">${esc(op.name||'?')}${roleTag}${abilityTag}${itemTag}</td>${myPkmCols}</tr>`;
  }).filter(Boolean).join('');

  if(!rows) return '';
  const header=myPkm.map(mp=>`<th>${esc(mp.name||'?')}</th>`).join('');
  return`<div class="opp-dmg-wrap"><table class="opp-dmg-table"><tr><th>对方↓ / 我方→</th>${header}</tr>${rows}</table></div>`;
}

/* ── 快速决策看板 ── */
function quickSprite(pkm, isOpp=false){
  if(!pkm)return '';
  if(!isOpp&&pkm._spriteUrl)return pkm._spriteUrl;
  if(pkm.spriteUrl)return pkm.spriteUrl;
  if(pkm.slug&&PKM_PC_BY_SLUG[pkm.slug]?.spriteUrl)return PKM_PC_BY_SLUG[pkm.slug].spriteUrl;
  return '';
}

function quickTypeEff(atkType, defPkm){
  if(!atkType||!defPkm)return 1;
  const immune=ABILITY_TYPE_IMMUNE[defPkm.ability||'']||[];
  if(immune.includes(atkType))return 0;
  return getTypeEff(atkType, defPkm.type1, defPkm.type2);
}

function quickEffText(eff){
  if(eff===0)return '免疫';
  if(eff===0.25)return '1/4';
  if(eff===0.5)return '1/2';
  if(eff===1)return '1倍';
  return `${eff}倍`;
}

function collectQuickOppAttackTypes(opp){
  const map=new Map();
  const add=(type, weight, source)=>{
    if(!type)return;
    const cur=map.get(type)||{type,weight:0,sources:new Set()};
    cur.weight+=Number(weight)||0;
    if(source)cur.sources.add(source);
    map.set(type,cur);
  };
  (opp||[]).forEach(op=>{
    let usedMoves=false;
    (op.predictedMoves||[]).forEach(pm=>{
      const mv=MOVES_BY_SLUG?.[pm.slug];
      if(!mv||!mv.type||mv.cat==='status'||!mv.power)return;
      usedMoves=true;
      add(mv.type, pm.pct||30, op.name||op.type1||'?');
    });
    if(!usedMoves){
      add(op.type1, 45, op.name||op.type1||'?');
      add(op.type2, 28, op.name||op.type2||'?');
    }
  });
  return [...map.values()].sort((a,b)=>b.weight-a.weight);
}

function getQuickIncomingThreats(selected, opp, activeWeather='', limit=4){
  const threats=[];
  (selected||[]).forEach(mp=>{
    (opp||[]).forEach(op=>{
      const oppAbility=resolveOppAbility(op);
      const oppItemSlug=op.predictedItem?.slug||'';
      const oppAsAtk={
        name:op.name,type1:op.type1,type2:op.type2,base:op.base||{},
        ability:oppAbility,item:oppItemSlug,level:50,
        move1:null,move2:null,move3:null,move4:null,
      };
      let best=null;
      (op.predictedMoves||[]).forEach(pm=>{
        const mv=MOVES_BY_SLUG?.[pm.slug];
        if(!mv||!mv.power||mv.cat==='status')return;
        const res=calcDamageEst(oppAsAtk,mp,mv,activeWeather);
        if(res&&(!best||res.pct>best.pct))best={pct:res.pct,move:mv.name||mv.nameEn||'',type:mv.type,op,mp};
      });
      if(best){
        threats.push(best);
        return;
      }
      const typeRows=[op.type1,op.type2].filter(Boolean).map(t=>({type:t,eff:quickTypeEff(t,mp)}));
      const worst=typeRows.sort((a,b)=>b.eff-a.eff)[0];
      if(worst&&worst.eff>=2)threats.push({pct:0,eff:worst.eff,move:TYPE_ZH[worst.type]||worst.type,type:worst.type,op,mp});
    });
  });
  return threats
    .filter(t=>t.pct>=35||t.eff>=2)
    .sort((a,b)=>(b.pct||0)-(a.pct||0)||(b.eff||0)-(a.eff||0))
    .slice(0,limit);
}

function getQuickBreakthroughs(selectedScores, opp, activeWeather='', limit=3){
  const rows=[];
  (selectedScores||[]).forEach(s=>{
    const mp=s.pkm;
    (opp||[]).forEach(op=>{
      let best=null;
      [mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status').forEach(mv=>{
        const res=calcDamageEst(mp,op,mv,activeWeather);
        if(res&&(!best||res.pct>best.pct))best={pct:res.pct,move:mv.name||mv.nameEn||'',typeMul:res.typeMul,mp,op};
      });
      if(best){
        rows.push(best);
        return;
      }
      const eff=getBestMoveEff(mp,op);
      if(eff&&eff>=2)rows.push({pct:0,typeMul:eff,move:'属性克制',mp,op});
    });
  });
  return rows
    .filter(r=>r.pct>=35||r.typeMul>=2)
    .sort((a,b)=>(b.pct||0)-(a.pct||0)||(b.typeMul||0)-(a.typeMul||0))
    .slice(0,limit);
}

function getQuickSafeSwitchRows(selected, allMyPkm, opp, limit=3){
  const selectedSet=new Set((selected||[]).map(p=>p.name));
  return collectQuickOppAttackTypes(opp).slice(0,6).map(row=>{
    const safe=(selected||[]).filter(p=>quickTypeEff(row.type,p)<=0.5);
    const exposed=(selected||[]).filter(p=>quickTypeEff(row.type,p)>=2);
    const bench=(allMyPkm||[]).filter(p=>!selectedSet.has(p.name)&&quickTypeEff(row.type,p)<=0.5);
    return{...row,safe,exposed,bench,risk:exposed.length*2+(safe.length?0:1)+(row.weight/100)};
  }).filter(r=>r.exposed.length||!r.safe.length)
    .sort((a,b)=>b.risk-a.risk)
    .slice(0,limit);
}

function renderQuickPkmChip(pkm, note='', isOpp=false){
  const img=quickSprite(pkm,isOpp);
  return`<div class="bqd-pkm-chip">
    ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">`:''}
    <span>${esc(pkm?.name||'?')}</span>
    ${note?`<em>${esc(note)}</em>`:''}
  </div>`;
}

function renderQuickDecisionPanel({scored=[],myPkm=[],opp=[],targetOpp=[],activeWeather='',format='singles',leadPairScored=[]}={}){
  const pickCount=format==='doubles'?4:3;
  const selectedScores=scored.slice(0,pickCount);
  const selected=selectedScores.map(s=>s.pkm).filter(Boolean);
  if(!selected.length)return '';
  const globalOppPool=(opp&&opp.length?opp:targetOpp).filter(op=>op.name||op.type1);
  const leadScores=format==='doubles'&&leadPairScored.length
    ?leadPairScored
    :format==='singles'
      ?[selectSinglesLead(selectedScores,globalOppPool,activeWeather)].filter(Boolean)
      :selectedScores.slice(0,2);
  const pickHtml=selectedScores.map((s,i)=>renderQuickPkmChip(s.pkm,`#${i+1}`)).join('');
  const leadHtml=leadScores.map(s=>renderQuickPkmChip(s.pkm,'先发')).join('');

  const threats=getQuickIncomingThreats(selected,globalOppPool,activeWeather,4);
  const threatHtml=threats.length?threats.map(t=>{
    const pct=t.pct?`${t.pct}%`:`${quickEffText(t.eff)}`;
    return`<div class="bqd-line bqd-line-danger">
      <span class="bqd-line-main">${esc(t.op?.name||'?')} -> ${esc(t.mp?.name||'?')}</span>
      <span class="bqd-line-meta">${esc(t.move||'威胁')} · ${pct}</span>
    </div>`;
  }).join(''):`<div class="bqd-empty">暂无明显高危打点</div>`;

  const breaks=getQuickBreakthroughs(selectedScores,globalOppPool,activeWeather,3);
  const breakHtml=breaks.length?breaks.map(r=>{
    const value=r.pct?`${r.pct}%`:`${quickEffText(r.typeMul)}`;
    return`<div class="bqd-line bqd-line-good">
      <span class="bqd-line-main">${esc(r.mp?.name||'?')} -> ${esc(r.op?.name||'?')}</span>
      <span class="bqd-line-meta">${esc(r.move||'突破')} · ${value}</span>
    </div>`;
  }).join(''):`<div class="bqd-empty">没有稳定高压突破口</div>`;

  const switchRows=getQuickSafeSwitchRows(selected,myPkm,globalOppPool,3);
  const switchHtml=switchRows.length?switchRows.map(r=>{
    const typeTag=`<span class="coverage-type-tag type-${r.type}">${TYPE_ZH[r.type]||r.type}</span>`;
    const safeNames=r.safe.length?r.safe.map(p=>esc(p.name)).join('、'):(r.bench.length?`候补 ${r.bench.slice(0,2).map(p=>esc(p.name)).join('、')}`:'无人稳定抗');
    const exposed=r.exposed.length?`危险：${r.exposed.map(p=>esc(p.name)).join('、')}`:'';
    return`<div class="bqd-switch-row">
      <div>${typeTag}<span class="bqd-switch-safe">${safeNames}</span></div>
      ${exposed?`<span class="bqd-switch-risk">${exposed}</span>`:''}
    </div>`;
  }).join(''):`<div class="bqd-empty">当前选择没有突出的集体弱点</div>`;

  return`<div class="battle-result-section bqd-panel">
    <div class="battle-result-hdr">
      <span class="battle-result-title">快速决策看板</span>
      <span class="battle-datasrc-note">全局扫描对方已填写${globalOppPool.length}只，包含未预测出战成员</span>
    </div>
    <div class="bqd-grid">
      <div class="bqd-card bqd-card-primary">
        <div class="bqd-label">${format==='doubles'?'推荐4只':'推荐3只'}</div>
        <div class="bqd-pkm-rail">${pickHtml}</div>
        ${leadHtml?`<div class="bqd-lead"><span>开局</span>${leadHtml}</div>`:''}
      </div>
      <div class="bqd-card">
        <div class="bqd-label">全局最大危险</div>
        ${threatHtml}
      </div>
      <div class="bqd-card">
        <div class="bqd-label">全局优先突破</div>
        ${breakHtml}
      </div>
      <div class="bqd-card">
        <div class="bqd-label">全局安全换入</div>
        ${switchHtml}
      </div>
    </div>
  </div>`;
}

/* ── 对方宝可梦角色识别（基于 predictedMoves）── */
function classifyOppRole(op){
  const moves=(op.predictedMoves||[]).map(m=>MOVES_BY_SLUG[m.slug]).filter(Boolean);
  const phys=moves.filter(m=>m.cat==='physical'&&m.power>0);
  const spec=moves.filter(m=>m.cat==='special'&&m.power>0);
  const status=moves.filter(m=>m.cat==='status');
  if(!phys.length&&!spec.length) return{label:'辅助',cls:'role-support'};
  if(status.length>=2)           return{label:'辅助',cls:'role-support'};
  if(phys.length>spec.length)    return{label:'物理输出',cls:'role-phys'};
  if(spec.length>phys.length)    return{label:'特攻输出',cls:'role-spec'};
  return{label:'混合输出',cls:'role-mixed'};
}

/* ── 对方单只对我方单只的威胁分（优先用预测技能/特性/道具伤害） ── */
function oppThreatScore(op, mp, activeWeather=''){
  const myAbility=mp.ability||'';
  const myImmune=ABILITY_TYPE_IMMUNE[myAbility]||[];
  const predMoves=op.predictedMoves||[];
  if(predMoves.length){
    const oppAsAtk={
      name:op.name,type1:op.type1,type2:op.type2,base:op.base||{},
      ability:resolveOppAbility(op),
      item:getBattleItemSlug(op.predictedItem||op.item||''),
      level:50,
    };
    let best=0;
    predMoves.forEach(m=>{
      const mv=MOVES_BY_SLUG?.[m.slug];
      if(!mv||mv.cat==='status'||!mv.type)return;
      if(myImmune.includes(mv.type))return;
      const eff=getTypeEff(mv.type,mp.type1,mp.type2);
      const res=mv.power?calcDamageEst(oppAsAtk,mp,mv,activeWeather):null;
      const dmgScore=res?Math.min(4.5,Math.max(0.25,res.pct/25)):0;
      const score=Math.max(eff,dmgScore);
      if(score>best)best=score;
    });
    if(best>0)return best;
  }
  return getOppBestEff(op,mp);
}

/* ── 预测对方最优出战3只：队友协同30% + 克制我方70% ── */
function predictOppBestCombo(valid, myPkm, activeWeather=''){
  if(!valid.length)return{combo:[],synergyScore:0,antiScore:0,threatMap:{}};
  if(valid.length<=3)return{combo:valid,synergyScore:0,antiScore:0,threatMap:buildThreatMap(valid,myPkm,activeWeather)};

  // 队友协同分：两两共现率之和
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

  // 克制我方分：对方组合中每只对每只我方的威胁全部累加
  // （原"对每只我方取最高威胁"只奖励存在克星，改为累加可更好区分广度覆盖）
  const antiScore=(combo)=>{
    if(!myPkm.length)return 0;
    let total=0;
    combo.forEach(op=>{
      myPkm.forEach(mp=>{total+=oppThreatScore(op,mp,activeWeather);});
    });
    return total;
  };

  // 枚举所有 C(n,3)
  const allCombos=[];
  for(let a=0;a<valid.length-2;a++)
    for(let b=a+1;b<valid.length-1;b++)
      for(let c=b+1;c<valid.length;c++)
        allCombos.push([valid[a],valid[b],valid[c]]);

  const raw=allCombos.map(combo=>({combo,syn:synergyScore(combo),anti:antiScore(combo)}));

  // 使用范围归一化（max-min），避免指标方差低时放大噪声
  const minSyn=Math.min(...raw.map(r=>r.syn));
  const maxSyn=Math.max(...raw.map(r=>r.syn));
  const minAnti=Math.min(...raw.map(r=>r.anti));
  const maxAnti=Math.max(...raw.map(r=>r.anti));
  const synRange=Math.max(maxSyn-minSyn,0.001);
  const antiRange=Math.max(maxAnti-minAnti,0.001);

  let best=raw[0],bestBlend=-1;
  raw.forEach(r=>{
    const blend=((r.syn-minSyn)/synRange)*0.3+((r.anti-minAnti)/antiRange)*0.7;
    if(blend>bestBlend){bestBlend=blend;best=r;}
  });

  return{combo:best.combo,synergyScore:best.syn,antiScore:best.anti,threatMap:buildThreatMap(best.combo,myPkm,activeWeather)};
}

function buildThreatMap(combo,myPkm,activeWeather=''){
  const map={};
  combo.forEach(op=>{
    const threats=myPkm
      .map(mp=>({name:mp.name,eff:oppThreatScore(op,mp,activeWeather)}))
      .filter(t=>t.eff>=2)
      .sort((a,b)=>b.eff-a.eff)
      .slice(0,2)
      .map(t=>t.name);
    map[op.slug||op.name||'']=threats;
  });
  return map;
}

/* ── 渲染对方出战预测（使用预计算结果） ── */
function renderOppTeamPrediction(valid, predResult){
  if(!valid.length)return '';
  const{combo,threatMap}=predResult;
  const comboSlugs=new Set(combo.map(op=>op.slug||op.name||''));

  const validJson=JSON.stringify(valid.map(op=>({name:op.name,slug:op.slug||'',type1:op.type1})));
  const comboJson=JSON.stringify(combo.map(op=>({slug:op.slug||'',name:op.name||''})));

  const makePkmEl=(op,isPredicted)=>{
    const img=op.slug?(PKM_PC_BY_SLUG[op.slug]?.spriteUrl||''):'';
    const slugAttr=esc(op.slug||'');
    const threats=isPredicted?(threatMap[op.slug||op.name||'']||[]):[];
    const threatTag=threats.length?`<span class="opp-pred-threat">克制 ${threats.map(n=>esc(n)).join('、')}</span>`:'';
    const dimCls=isPredicted?'':'opp-pred-dim';
    return`<div class="battle-opp-pred-item ${dimCls}" data-slug="${slugAttr}" onclick="onOppLeadClick('${slugAttr}',this)" title="点击确认出场，再点取消">
      ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">`:''}
      <span class="battle-opp-pred-name">${esc(op.name||op.type1||'?')}</span>
      ${threatTag}
    </div>`;
  };

  const predictedHtml=combo.map(op=>makePkmEl(op,true)).join('');
  const restHtml=valid.filter(op=>!comboSlugs.has(op.slug||op.name||'')).map(op=>makePkmEl(op,false)).join('');

  return`<div class="battle-opp-pred-wrap" id="opp-pred-wrap" data-valid='${validJson.replace(/'/g,"&#39;")}' data-pred-combo='${comboJson.replace(/'/g,"&#39;")}'>
    <div class="opp-pred-row-label">预测出战</div>
    <div class="opp-pred-combo">${predictedHtml}</div>
    ${restHtml?`<div class="opp-pred-row-label opp-pred-row-label--rest">其余备选（点击可预测后续）</div>
    <div class="opp-pred-combo">${restHtml}</div>`:''}
    <div id="opp-lead-result" class="opp-lead-result"></div>
  </div>`;
}

/* ── 记录点击顺序（按出场顺序，不是 DOM 顺序）── */
const _oppConfirmedOrder=[];   // [{slug,wrapId}]

function onOppLeadClick(leadSlug, el){
  const wrap=el.closest('#opp-pred-wrap');
  const wrapId=wrap?.id||'opp-pred-wrap';

  const idx=_oppConfirmedOrder.findIndex(x=>x.slug===leadSlug&&x.wrapId===wrapId);
  if(idx!==-1){
    _oppConfirmedOrder.splice(idx,1);
    el.classList.remove('pred-confirmed');
  } else {
    _oppConfirmedOrder.push({slug:leadSlug,wrapId});
    el.classList.add('pred-confirmed');
  }

  const valid=JSON.parse(wrap.dataset.valid||'[]');
  const predCombo=JSON.parse(wrap.dataset.predCombo||'[]'); // 原始预测组合
  const confirmed=_oppConfirmedOrder.filter(x=>x.wrapId===wrapId).map(x=>x.slug);

  const resultEl=wrap.querySelector('#opp-lead-result');
  if(!resultEl)return;
  if(!confirmed.length){resultEl.innerHTML='';return;}

  const orderLabels=['首发','第2个出场','第3个出场'];
  const confirmedParts=confirmed.map((s,i)=>{
    const name=valid.find(op=>op.slug===s)?.name||s;
    return`${orderLabels[i]||`第${i+1}个`} <b>${esc(name)}</b>`;
  });
  const labelHtml=confirmedParts.join(' → ');

  const numPredict=Math.max(0,3-confirmed.length);
  if(numPredict===0){
    resultEl.innerHTML=`<div class="opp-lead-label">${labelHtml}（3只已全部出场）</div>`;
    return;
  }

  const remaining=valid.filter(op=>!confirmed.includes(op.slug||''));

  // 各确认宝可梦的队友率取平均（而非累加），保留概率含义
  const rateMap={};
  confirmed.forEach(confSlug=>{
    const builds=window.PKM_CHAMPIONS_BUILDS?.[confSlug];
    (builds?.teammates||[]).forEach(t=>{
      if(!rateMap[t.slug])rateMap[t.slug]=[];
      rateMap[t.slug].push(t.pct);
    });
  });
  const avgRates={};
  Object.entries(rateMap).forEach(([slug,rates])=>{
    avgRates[slug]=rates.reduce((a,b)=>a+b,0)/confirmed.length;
  });

  // 原始预测中未被确认的成员额外加权（它们已经过更严格的组合搜索）
  remaining.forEach(op=>{
    const slug=op.slug||'';
    if(predCombo.some(p=>p.slug===slug))
      avgRates[slug]=(avgRates[slug]||0)+25;
  });

  const makePredItem=(op,rate)=>{
    const img=PKM_PC_BY_SLUG[op.slug]?.spriteUrl||'';
    const pct=rate>0?`<span class="pred-rate">${Math.min(rate,100).toFixed(0)}%</span>`:'';
    return`<div class="battle-opp-pred-item">
      ${img?`<img src="${esc(img)}" alt="" onerror="this.style.display='none'">`:''}
      <span class="battle-opp-pred-name">${esc(op.name||op.slug)}</span>${pct}
    </div>`;
  };

  let backlineHtml='';
  if(numPredict>=2&&remaining.length>=2){
    // 剩余2格：枚举所有二元组合，选得分最高的配对
    let bestPair=null,bestScore=-1;
    for(let a=0;a<remaining.length-1;a++){
      for(let b=a+1;b<remaining.length;b++){
        const opA=remaining[a],opB=remaining[b];
        const slugA=opA.slug||'',slugB=opB.slug||'';
        const rA=avgRates[slugA]||0, rB=avgRates[slugB]||0;
        // 互为队友的额外加成
        const buildsA=window.PKM_CHAMPIONS_BUILDS?.[slugA];
        const buildsB=window.PKM_CHAMPIONS_BUILDS?.[slugB];
        const mutual=
          ((buildsA?.teammates||[]).find(t=>t.slug===slugB)?.pct||0)+
          ((buildsB?.teammates||[]).find(t=>t.slug===slugA)?.pct||0);
        const score=rA+rB+mutual*0.5;
        if(score>bestScore){bestScore=score;bestPair=[opA,opB];}
      }
    }
    backlineHtml=(bestPair||[]).map(op=>makePredItem(op,avgRates[op.slug||'']||0)).join('');
    resultEl.innerHTML=`<div class="opp-lead-label">${labelHtml} → 预测剩余2只：</div>`
      +(backlineHtml?`<div class="opp-pred-combo">${backlineHtml}</div>`:'<div class="opp-lead-label">暂无队友数据</div>');
  } else {
    // 剩余1格：直接取最高平均队友率
    const top=remaining
      .map(op=>({op,rate:avgRates[op.slug||'']||0}))
      .sort((a,b)=>b.rate-a.rate)[0];
    backlineHtml=top?makePredItem(top.op,top.rate):'';
    resultEl.innerHTML=`<div class="opp-lead-label">${labelHtml} → 预测第${confirmed.length+1}只：</div>`
      +(backlineHtml?`<div class="opp-pred-combo">${backlineHtml}</div>`:'<div class="opp-lead-label">暂无队友数据</div>');
  }
}

/* ── 推荐出战 ── */
function renderBattleRec(scored, opp){
  const top3=scored.slice(0,3);
  const rankClass=['rank-1','rank-2','rank-3'];
  const rankLabel=['#1 首选','#2 次选','#3 备选'];
  const rankCls=['r1','r2','r3'];
  // 检测对方是否有恐吓
  const oppHasIntimidate=opp.some(op=>getOppAbilityList(op).includes('intimidate'));
  return`<div class="battle-rec-list">${top3.map((s,i)=>{
    const pkm=s.pkm;
    const img=pkm._spriteUrl?`<img src="${esc(pkm._spriteUrl)}" alt="" onerror="this.style.display='none'">`:'';
    const role=classifyRole(pkm);
    // 特性徽章
    const ability=pkm.ability||'';
    const abilityZH=PKM_LIST.find(p=>p.slug===pkm.slug)?.abilities?.indexOf(ability)>=0?ability:'';
    const abilityLabel=ability?(()=>{
      if(ABILITY_TYPE_IMMUNE[ability]) return{txt:'属性免疫',cls:'ab-immune'};
      if(ABILITY_WEATHER_SET[ability]) return{txt:'天气设置',cls:'ab-weather'};
      if(ABILITY_SPD_MOD[ability]) return{txt:'速度特性',cls:'ab-speed'};
      if(ABILITY_SURVIVE[ability]) return{txt:'生存特性',cls:'ab-survive'};
      if(ABILITY_ATK_MOD[ability]) return{txt:'进攻特性',cls:'ab-atk'};
      return null;
    })():null;
    const abilityTag=abilityLabel?`<span class="battle-ability-tag ${abilityLabel.cls}" title="${esc(ability)}">${abilityLabel.txt}</span>`:'';
    const megaTag=pkm._megaState==='mega'
      ?`<span class="battle-mega-tag is-mega">本场 Mega</span>`
      :pkm._megaState==='base'
        ?`<span class="battle-mega-tag is-base">普通形态</span>`
        :'';
    // 恐吓警告：对方有恐吓 且 我方是物理攻击手
    const physRole=role.cls==='role-phys'||role.cls==='role-mixed';
    const intimidateWarn=oppHasIntimidate&&physRole?`<div class="battle-rec-reason warn-intimidate">⚠ 对方有恐吓，物攻实效约降33%</div>`:'';
    // 生存特性标注
    const surviveWarn=ABILITY_SURVIVE[ability]?`<div class="battle-rec-reason">${ABILITY_SURVIVE[ability]}</div>`:'';
    // 速度先后手快速标注（领先20+才在卡片里显示）
    const mySpd=pkm.base?.spe||0;
    const spdNotes=mySpd?opp.filter(op=>op.base?.spe).map(op=>{
      const diff=mySpd-op.base.spe;
      if(diff>=20)return`⚡ 先手 vs ${esc(op.name||'?')}（+${diff}）`;
      if(diff<=-20)return`🐢 后手 vs ${esc(op.name||'?')}（${diff}）`;
      return null;
    }).filter(Boolean):[];
    const allReasons=[...s.reasons,...spdNotes].slice(0,5);
    return`<div class="battle-rec-card ${rankClass[i]}">
      <span class="battle-rec-rank ${rankCls[i]}">${rankLabel[i]}</span>
      <div class="battle-rec-sprite">${img}</div>
      <div class="battle-rec-body">
        <div class="battle-rec-name">${esc(pkm.name)}<span class="battle-role-tag ${role.cls}">${role.label}</span>${abilityTag}${megaTag}</div>
        <div class="battle-rec-score">进攻+${s.offScore.toFixed(1)} 防御-${s.defScore.toFixed(1)}${s.myItemBonus?` 道具+${s.myItemBonus.toFixed(1)}`:''} 综合${s.total.toFixed(1)}</div>
        <div class="battle-rec-reasons">
          ${allReasons.map(r=>`<div class="battle-rec-reason">${r}</div>`).join('')}
          ${surviveWarn}${intimidateWarn}
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

/* ──────── 数值计算器 ──────── */
function renderBattleCalc(){
  const el=document.getElementById('btab-calc');
  if(!el)return;
  const natOpts=['', ...Object.keys(NATURES_ZH)].map(n=>`<option value="${n}">${n||'无/中性'}</option>`).join('');
  const statsRows=STAT_KEYS_B.map(k=>`
    <div class="battle-calc-col">
      <span class="bpkm-stat-lbl">${STAT_ZH_B[k]}</span>
      <input class="bpkm-inp-num" id="calc-base-${k}" type="number" min="0" max="255" placeholder="种族" value="" oninput="calcAllStats()" style="width:52px">
      <input class="bpkm-inp-num" id="calc-iv-${k}" type="number" min="0" max="31" placeholder="个体" value="31" oninput="calcAllStats()" style="width:52px">
      <input class="bpkm-inp-num" id="calc-ev-${k}" type="number" min="0" max="252" placeholder="努力" value="0" oninput="calcAllStats()" style="width:52px">
    </div>`).join('');
  el.innerHTML=`
    <div class="battle-calc-layout">
      <div class="battle-calc-section">
        <div class="battle-side-hdr">输入参数</div>
        <div class="bpkm-form-grid" style="margin-bottom:10px">
          <div class="bpkm-inp-group">
            <span class="bpkm-inp-label">等级</span>
            <input class="bpkm-inp" id="calc-level" type="number" min="1" max="100" value="50" oninput="calcAllStats()">
          </div>
          <div class="bpkm-inp-group">
            <span class="bpkm-inp-label">性格</span>
            <select class="bpkm-inp" id="calc-nature" onchange="calcAllStats()">${natOpts}</select>
          </div>
        </div>
        <div class="bpkm-section-hdr" style="margin-bottom:8px">种族值 / 个体值 / 努力值</div>
        <div class="bpkm-stats-block" style="gap:8px">${statsRows}</div>
        <div class="battle-datasrc-note" style="margin-top:10px">
          ※ Champions 格式默认 Lv.50，公式同官方。<br>
          特性固定倍率（猛火×1.5等）须在分析页「持有道具」栏手动标注或备注说明。
        </div>
      </div>
      <div class="battle-calc-section">
        <div class="battle-side-hdr">计算结果</div>
        <div id="calc-result">
          <div style="color:var(--t3);font-size:.82rem;padding:.8rem 0">填写左侧数据后自动计算</div>
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
    const natMark=natMul>1?'↑':natMul<1?'↓':'';
    return{k,val,base,color,natMark};
  });
  const el=document.getElementById('calc-result');
  if(!el)return;
  if(!results.some(r=>r.base>0)){el.innerHTML='<div style="color:var(--t3);font-size:.82rem;padding:.8rem 0">填写左侧数据后自动计算</div>';return;}
  const maxStat=Math.max(...results.map(r=>r.val),1);
  el.innerHTML=`<div class="battle-calc-result">
    <div class="battle-calc-result-hdr">Lv.${level} 实际能力值</div>
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
let bdSelectedMegaKey = 'auto';
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
    return `<div class="battle-team-card"><div class="btc-header"><div class="btc-name">${esc(t.team_name||'我的队伍')}</div><div class="btc-meta">${pkm.filter(p=>p.name).length}/6 已录入</div><div class="btc-actions"><button class="btn btn-sm" onclick="openBattleTeamEdit('${t.id}',0)">✏️ 编辑</button><button class="btc-share-btn${t.is_public?' shared':''}" onclick="event.stopPropagation();toggleShareTeam('${t.id}','doubles')" title="${t.is_public?'取消分享':'分享到社区'}">${t.is_public?'已分享':'分享'}</button><button class="btn btn-sm btn-d" onclick="confirmDeleteBattleTeam('${t.id}')">删除</button></div></div><div class="btc-sprites">${sprites.join('')}</div></div>`;
  }).join('');
}

function renderDTeamSel() {
  const sel = document.getElementById('bd-my-team-sel');
  if (!sel) return;
  sel.innerHTML = `<option value="">选择阵容…</option>` + battleTeams.map(t => `<option value="${t.id}">${esc(t.team_name||'我的队伍')}</option>`).join('');
}

function onDMyTeamSelect(teamId) {
  bdMyTeamId = teamId;
  bdSelectedMegaKey = 'auto';
  const team = battleTeams.find(t => t.id === teamId);
  const preview = document.getElementById('bd-my-preview');
  if (!team || !preview) return;
  const chips = (Array.isArray(team.pokemon) ? team.pokemon.filter(p => p.name) : []).map(p => {
    const img = p._spriteUrl ? `<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">` : '';
    return `<div class="battle-my-pkm-chip">${img}${esc(p.name)}</div>`;
  }).join('');
  preview.innerHTML = chips + renderBattleMegaSelect(team,bdSelectedMegaKey,'onDBattleMegaSelect');
}

function onDBattleMegaSelect(value) {
  bdSelectedMegaKey = value || 'auto';
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
    const t1 = lp.types?.[0] || lp.type1 || '';
    const t2 = lp.types?.[1] || lp.type2 || '';
    const s1 = document.getElementById(`bdopp-t1-${i}`); if(s1) s1.value = t1;
    const s2 = document.getElementById(`bdopp-t2-${i}`); if(s2) s2.value = t2;
    bdOppPkm[i] = { name:cnName, slug, type1:t1, type2:t2, base:lp.stats||{},
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
  'fake-out':'击掌奇袭', 'fake-tears':'假哭', 'tailwind':'顺风', 'trick-room':'奇异空间',
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

function bdMoveSlugs(pkm) {
  return [pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(Boolean).map(m=>m.slug||'').filter(Boolean);
}

function bdCountBy(list, test) {
  return list.filter(test).length;
}

function bdIsAttacker(pkm) {
  const role=classifyRole(pkm);
  return role.cls==='role-phys'||role.cls==='role-spec'||role.cls==='role-mixed';
}

function bdWeatherAbuseScore(pkm, weather) {
  const slugs=bdMoveSlugs(pkm);
  const ability=pkm.ability||'';
  const moves=[pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
  let score=0;
  const spdMod=ABILITY_SPD_MOD[ability];
  if(spdMod?.weather&&(!weather||spdMod.weather===weather))score+=2.5;
  if(weather==='sun'||slugs.includes('sunny-day')){
    if(moves.some(m=>getMoveTypeWithAbility(pkm,m).type==='fire'))score+=1;
    if(ability==='chlorophyll'||ability==='solar-power')score+=2;
  }
  if(weather==='rain'||slugs.includes('rain-dance')){
    if(moves.some(m=>getMoveTypeWithAbility(pkm,m).type==='water'))score+=1;
    if(ability==='swift-swim')score+=2;
  }
  if(weather==='sand'||slugs.includes('sandstorm')){
    if(['sand-rush','sand-force','sand-veil'].includes(ability))score+=2;
  }
  if(weather==='snow'||slugs.includes('snowscape')){
    if(['slush-rush','snow-cloak'].includes(ability))score+=2;
    if(pkm.type1==='ice'||pkm.type2==='ice')score+=0.6;
  }
  return score;
}

function bdDetectPlannedWeather(myPkm, activeWeather='') {
  if(activeWeather)return activeWeather;
  for(const pkm of myPkm){
    const abilityWeather=ABILITY_WEATHER_SET[pkm.ability||''];
    if(abilityWeather)return abilityWeather;
  }
  const weatherMoves={rain:'rain-dance',sun:'sunny-day',sand:'sandstorm',snow:'snowscape'};
  for(const [weather,slug] of Object.entries(weatherMoves)){
    if(myPkm.some(pkm=>bdMoveSlugs(pkm).includes(slug)))return weather;
  }
  return '';
}

function analyzeDoublesTeamPlan(myPkm, oppValid=[], activeWeather='') {
  const plannedWeather=bdDetectPlannedWeather(myPkm,activeWeather);
  const profiles=myPkm.map(pkm=>{
    const slugs=bdMoveSlugs(pkm);
    const roles=detectDSupportRoles(pkm);
    const role=classifyRole(pkm);
    const speed=getEffectiveSpeed(pkm,activeWeather)||pkm.base?.spe||0;
    const attacks=[pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
    return {
      pkm, slugs, roles, role, speed,
      attacker:bdIsAttacker(pkm),
      support:role.cls==='role-support'||roles.length>0,
      spread:roles.includes('范围技'),
      protect:slugs.includes('protect')||slugs.includes('detect'),
      fakeOut:slugs.includes('fake-out'),
      redirection:slugs.includes('follow-me')||slugs.includes('rage-powder'),
      tailwind:slugs.includes('tailwind'),
      trickRoom:slugs.includes('trick-room'),
      weather:Boolean(ABILITY_WEATHER_SET[pkm.ability||''])||slugs.some(s=>['rain-dance','sunny-day','sandstorm','snowscape'].includes(s)),
      intimidate:(pkm.ability||'')==='intimidate',
      slow:speed>0&&speed<=70,
      fast:speed>=100,
      weatherAbuse:bdWeatherAbuseScore(pkm,plannedWeather),
      attackCount:attacks.length,
    };
  });
  const counts={
    attackers:bdCountBy(profiles,p=>p.attacker),
    supports:bdCountBy(profiles,p=>p.support),
    spread:bdCountBy(profiles,p=>p.spread),
    protect:bdCountBy(profiles,p=>p.protect),
    fakeOut:bdCountBy(profiles,p=>p.fakeOut),
    redirection:bdCountBy(profiles,p=>p.redirection),
    tailwind:bdCountBy(profiles,p=>p.tailwind),
    trickRoom:bdCountBy(profiles,p=>p.trickRoom),
    weather:bdCountBy(profiles,p=>p.weather),
    intimidate:bdCountBy(profiles,p=>p.intimidate),
    slow:bdCountBy(profiles,p=>p.slow),
    fast:bdCountBy(profiles,p=>p.fast),
    weatherAbuse:profiles.reduce((s,p)=>s+p.weatherAbuse,0),
  };
  const oppFast=bdCountBy(oppValid,op=>(op.base?.spe||0)>=100);
  const candidates=[
    {
      key:'tailwind',
      label:'顺风压制',
      score:counts.tailwind*4+counts.fast*1.1+counts.spread*1.2+counts.fakeOut*.8+oppFast*.25-counts.slow*.25,
      summary:'用顺风抢先手，搭配范围技或高速输出压低对方血线。',
      priorities:['先发带顺风或击掌保护顺风','后排保留高速/范围输出','避免把低速核心塞满4选'],
    },
    {
      key:'trick-room',
      label:'空间展开',
      score:counts.trickRoom*4+counts.slow*1.25+counts.redirection*1+counts.fakeOut*.8+oppFast*.4-counts.fast*.35,
      summary:'通过奇异空间反转速度，低速高火力在中盘连续出手。',
      priorities:['首发空间手需要击掌/引导保护','后排优先低速高压输出','高速手只保留必要补盲'],
    },
    {
      key:'weather',
      label:'天气轴',
      score:counts.weather*3.5+counts.weatherAbuse+counts.spread*.7+counts.protect*.25,
      summary:'围绕天气启动输出或速度优势，选出要保证天气手和受益打手同时在场。',
      priorities:['4选必须包含天气来源','先发可天气手+受益打手或保护手','后排补抗性和天气外兜底'],
    },
    {
      key:'control-balance',
      label:'控制平衡',
      score:counts.fakeOut*1.5+counts.redirection*1.5+counts.intimidate*1.2+counts.protect*.45+counts.supports*.5+counts.attackers*.35,
      summary:'靠击掌、引导、威吓和守住换节奏，再让核心输出找到安全回合。',
      priorities:['先发一控一攻最稳','后排保留抗性换入点','不要只选四个输出手'],
    },
    {
      key:'spread-offense',
      label:'范围压血',
      score:counts.spread*2+counts.attackers*.8+counts.fast*.55+counts.tailwind*.8-counts.redirection*.25,
      summary:'用范围技同时压两只，对方换人或守住也会被持续削血。',
      priorities:['先发至少一只范围输出','搭档要能免疫/吸收队友范围技','后排补单点收割'],
    },
  ].sort((a,b)=>b.score-a.score);
  const best=candidates[0]||candidates.find(c=>c.key==='control-balance');
  const second=candidates[1];
  const confidence=second?Math.min(Math.max((best.score-second.score)/Math.max(Math.abs(best.score),1),0),1):1;
  const tags=[
    counts.tailwind?`顺风×${counts.tailwind}`:'',
    counts.trickRoom?`空间×${counts.trickRoom}`:'',
    counts.fakeOut?`击掌×${counts.fakeOut}`:'',
    counts.redirection?`引导×${counts.redirection}`:'',
    counts.spread?`范围技×${counts.spread}`:'',
    counts.weather?`天气×${counts.weather}`:'',
    counts.intimidate?`威吓×${counts.intimidate}`:'',
  ].filter(Boolean);
  return {...best, confidence, counts, profiles, tags, candidates};
}

function scoreDoublesComboForPlan(combo, teamPlan, rawScoreMap, oppValid, activeWeather) {
  const scored=combo.map(p=>rawScoreMap.get(p)||{pkm:p,total:0,offScore:0,defScore:0,reasons:[]});
  const base=scored.reduce((s,x)=>s+x.total,0);
  const profiles=combo.map(p=>teamPlan.profiles.find(pr=>pr.pkm===p)).filter(Boolean);
  const has=pred=>profiles.some(pred);
  const count=pred=>bdCountBy(profiles,pred);
  const attackers=count(p=>p.attacker);
  const supports=count(p=>p.support);
  const spread=count(p=>p.spread);
  const protect=count(p=>p.protect);
  const defensiveCover=bdDoublesCoverScore(combo);
  let planBonus=0;
  const reasons=[];

  if(teamPlan.key==='tailwind'){
    if(has(p=>p.tailwind)){planBonus+=5;reasons.push('保留顺风启动');}
    planBonus+=count(p=>p.fast||p.spread)*1.2;
    if(!has(p=>p.tailwind))planBonus-=4;
  }else if(teamPlan.key==='trick-room'){
    if(has(p=>p.trickRoom)){planBonus+=5;reasons.push('保留空间启动');}
    planBonus+=count(p=>p.slow&&p.attacker)*1.6;
    if(has(p=>p.redirection||p.fakeOut)){planBonus+=1.6;reasons.push('有保护空间展开的手段');}
    if(!has(p=>p.trickRoom))planBonus-=4;
  }else if(teamPlan.key==='weather'){
    if(has(p=>p.weather)){planBonus+=4.5;reasons.push('保留天气来源');}
    planBonus+=profiles.reduce((s,p)=>s+p.weatherAbuse,0)*1.1;
    if(!has(p=>p.weather))planBonus-=3.5;
  }else if(teamPlan.key==='spread-offense'){
    planBonus+=spread*2+attackers*.7;
    if(has(p=>p.tailwind||p.fakeOut))planBonus+=1.5;
    if(spread)reasons.push('范围技压血效率高');
  }else{
    planBonus+=count(p=>p.fakeOut||p.redirection||p.intimidate)*1.5+protect*.35;
    if(attackers>=2&&supports>=1)reasons.push('控制与输出比例稳定');
  }
  if(attackers<2)planBonus-=2.5;
  if(supports>2&&teamPlan.key!=='control-balance')planBonus-=1.5;
  if(protect>=2)planBonus+=.8;
  return {
    combo,
    scored:scored.sort((a,b)=>b.total-a.total),
    total:base+planBonus+defensiveCover,
    planBonus,
    defensiveCover,
    reasons,
  };
}

function bdDoublesCoverScore(combo) {
  let score=0;
  const weakOf=p=>{
    const immune=ABILITY_TYPE_IMMUNE[p.ability||'']||[];
    return B_TYPES.filter(t=>getTypeEff(t,p.type1,p.type2)>=2&&!immune.includes(t));
  };
  combo.forEach((p,i)=>{
    weakOf(p).forEach(t=>{
      const covered=combo.some((other,j)=>j!==i&&getTypeEff(t,other.type1,other.type2)<=0.5);
      if(covered)score+=.35;
    });
  });
  B_TYPES.forEach(t=>{
    const hits=combo.filter(p=>getTypeEff(t,p.type1,p.type2)>=2).length;
    if(hits>=3)score-=1.5;
  });
  return score;
}

function selectBestDoublesFour(rawScored, teamPlan, oppValid, activeWeather) {
  const valid=rawScored.map(s=>s.pkm).filter(Boolean);
  if(valid.length<=4){
    const map=new Map(rawScored.map(s=>[s.pkm,s]));
    return scoreDoublesComboForPlan(valid,teamPlan,map,oppValid,activeWeather);
  }
  const rawScoreMap=new Map(rawScored.map(s=>[s.pkm,s]));
  const all=[];
  for(let a=0;a<valid.length-3;a++)
    for(let b=a+1;b<valid.length-2;b++)
      for(let c=b+1;c<valid.length-1;c++)
        for(let d=c+1;d<valid.length;d++)
          all.push(scoreDoublesComboForPlan([valid[a],valid[b],valid[c],valid[d]],teamPlan,rawScoreMap,oppValid,activeWeather));
  return all.sort((a,b)=>b.total-a.total)[0];
}

function renderDTeamPlan(teamPlan, comboResult) {
  const tags=teamPlan.tags.length?teamPlan.tags.map(t=>`<span class="bd-plan-tag">${esc(t)}</span>`).join(''):'<span class="bd-plan-tag">基础平衡</span>';
  const picks=comboResult?.combo?.length
    ?comboResult.combo.map(p=>{
      const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">`:'';
      return `<div class="battle-my-pkm-chip">${img}${esc(p.name||'?')}</div>`;
    }).join('')
    :'';
  const priorities=(teamPlan.priorities||[]).map(x=>`<div class="bd-plan-line">${esc(x)}</div>`).join('');
  const comboReasons=(comboResult?.reasons||[]).map(x=>`<div class="bd-plan-line is-good">${esc(x)}</div>`).join('');
  return `<div class="bd-plan-box">
    <div class="bd-plan-head">
      <div>
        <div class="bd-plan-kicker">阵容打法识别</div>
        <div class="bd-plan-title">${esc(teamPlan.label)} <span>${Math.round(teamPlan.confidence*100)}%</span></div>
      </div>
      <div class="bd-plan-tags">${tags}</div>
    </div>
    <div class="bd-plan-summary">${esc(teamPlan.summary)}</div>
    ${picks?`<div class="bd-plan-picks">${picks}</div>`:''}
    <div class="bd-plan-lines">${priorities}${comboReasons}</div>
  </div>`;
}

/* ── 先发2只搭档协同评分 ── */
function pairSynergyScore(a, b) {
  let score = 0;
  const rolesA = detectDSupportRoles(a), rolesB = detectDSupportRoles(b);
  const roleA = classifyRole(a), roleB = classifyRole(b);
  const aIsSupport = roleA.cls==='role-support' || rolesA.length>0;
  const bIsSupport = roleB.cls==='role-support' || rolesB.length>0;
  if (aIsSupport !== bIsSupport) score += 4;
  if (rolesA.includes('击掌奇袭') || rolesB.includes('击掌奇袭')) score += 3;
  // 顺风价值在于全队加速，只要搭档中有顺风使用者即加分
  if (rolesA.includes('顺风')||rolesB.includes('顺风')) score += 2;
  const getWeaks = p => { const im=ABILITY_TYPE_IMMUNE[p.ability||'']||[]; return B_TYPES.filter(t=>getTypeEff(t,p.type1,p.type2)>=2&&!im.includes(t)); };
  score -= getWeaks(a).filter(t=>getWeaks(b).includes(t)).length * 0.8;
  if ((a.base?.spe||0)>0&&(b.base?.spe||0)>0&&Math.abs((a.base.spe||0)-(b.base.spe||0))>30) score += 1;
  if (roleA.cls===roleB.cls&&roleA.cls!=='role-support') score -= 1;
  return score;
}

/* ── 从4只中选最佳先发2只 ── */
/* ── 从top4中选最鲁棒先发2只：对对方所有可能先发搭档求期望威胁 ── */
function bdLeadPairPlanBonus(pair, teamPlan) {
  if(!teamPlan||pair.length<2)return 0;
  const profiles=pair.map(s=>teamPlan.profiles.find(p=>p.pkm===s.pkm)).filter(Boolean);
  const has=pred=>profiles.some(pred);
  const count=pred=>bdCountBy(profiles,pred);
  let bonus=0;
  if(teamPlan.key==='tailwind'){
    if(has(p=>p.tailwind)&&has(p=>p.fakeOut||p.redirection||p.attacker))bonus+=4;
    if(has(p=>p.tailwind)&&count(p=>p.attacker)>=1)bonus+=1.2;
  }else if(teamPlan.key==='trick-room'){
    if(has(p=>p.trickRoom)&&has(p=>p.fakeOut||p.redirection))bonus+=4.5;
    if(has(p=>p.trickRoom)&&has(p=>p.slow&&p.attacker))bonus+=1.5;
  }else if(teamPlan.key==='weather'){
    if(has(p=>p.weather)&&has(p=>p.weatherAbuse>0||p.attacker))bonus+=3.5;
    bonus+=profiles.reduce((s,p)=>s+p.weatherAbuse,0)*.7;
  }else if(teamPlan.key==='spread-offense'){
    if(has(p=>p.spread)&&has(p=>p.tailwind||p.fakeOut||p.redirection||p.protect))bonus+=3;
    if(count(p=>p.attacker)>=2)bonus+=1;
  }else{
    if(count(p=>p.attacker)>=1&&has(p=>p.fakeOut||p.redirection||p.intimidate))bonus+=3;
    if(count(p=>p.attacker)===1&&count(p=>p.support)>=1)bonus+=1;
  }
  return bonus;
}

function selectBestLeadPair(top4, oppValid, teamPlan=null, activeWeather='') {
  if (top4.length <= 2) return top4;
  const oppPool = (oppValid||[]).filter(op => op.name||op.type1);

  // 无对方信息时退化为纯协同
  if (!oppPool.length) {
    let best = null, bv = -Infinity;
    for (let a = 0; a < top4.length-1; a++)
      for (let b = a+1; b < top4.length; b++) {
        const pair=[top4[a],top4[b]];
        const s = pairSynergyScore(top4[a].pkm, top4[b].pkm)+bdLeadPairPlanBonus(pair,teamPlan);
        if (s > bv) { bv = s; best = [top4[a], top4[b]]; }
      }
    return best || top4.slice(0,2);
  }

  // 枚举对方所有可能先发搭档，按协同+压制力算原始权重
  const oppCandidates = [];
  for (let a = 0; a < oppPool.length-1; a++)
    for (let b = a+1; b < oppPool.length; b++) {
      const oa = oppPool[a], ob = oppPool[b];
      const syn = pairSynergyScore(oa, ob);
      // 双打两只同时上场，威胁应累加而非取最高
      const pressure = top4.reduce((s, t) =>
        s + oppThreatScore(oa, t.pkm, activeWeather) + oppThreatScore(ob, t.pkm, activeWeather), 0);
      oppCandidates.push({ oa, ob, raw: syn * 1.2 + pressure });
    }

  // 线性归一化，最低保留 0.1 底权，使低概率先发不被完全忽视
  const minRaw = Math.min(...oppCandidates.map(c => c.raw));
  const maxRaw = Math.max(...oppCandidates.map(c => c.raw), minRaw + 0.01);
  oppCandidates.forEach(c => { c.w = (c.raw - minRaw) / (maxRaw - minRaw) + 0.1; });
  const totalW = oppCandidates.reduce((s, c) => s + c.w, 0);
  oppCandidates.forEach(c => { c.w /= totalW; });

  // 对我方每种先发搭档，计算期望威胁
  let best = null, bestScore = -Infinity;
  for (let a = 0; a < top4.length-1; a++)
    for (let b = a+1; b < top4.length; b++) {
      const pa = top4[a].pkm, pb = top4[b].pkm;
      const syn = pairSynergyScore(pa, pb);
      const expectedThreat = oppCandidates.reduce((s, { oa, ob, w }) =>
        s + w * (oppThreatScore(oa, pa, activeWeather) + oppThreatScore(oa, pb, activeWeather) +
                 oppThreatScore(ob, pa, activeWeather) + oppThreatScore(ob, pb, activeWeather)), 0);
      const pair=[top4[a],top4[b]];
      const total = syn * 1.5 - expectedThreat + bdLeadPairPlanBonus(pair,teamPlan);
      if (total > bestScore) { bestScore = total; best = [top4[a], top4[b]]; }
    }
  return best || top4.slice(0,2);
}

/* ── 预测对方先发2只：对方搭档协同 + 对我方全队压制 ── */
function selectBestOppLeadPair(combo4, myPkm, activeWeather='') {
  if (combo4.length <= 2) return combo4;
  let best = null, bestScore = -Infinity;
  for (let a = 0; a < combo4.length-1; a++) {
    for (let b = a+1; b < combo4.length; b++) {
      const pa = combo4[a], pb = combo4[b];
      const syn = pairSynergyScore(pa, pb);
      let pressure = 0;
      (myPkm||[]).forEach(mp => {
        // 双打两只同时在场，威胁累加
        pressure += oppThreatScore(pa, mp, activeWeather) + oppThreatScore(pb, mp, activeWeather);
      });
      const total = syn*1.2 + pressure;
      if (total > bestScore) { bestScore=total; best=[pa,pb]; }
    }
  }
  return best || combo4.slice(0,2);
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
function predictOppDoubles(valid, myPkm, activeWeather='') {
  if (!valid.length) return {combo4:[],leadPair:[],threatMap:{},spreadWarn:[],confidence:0};
  if (valid.length <= 4) {
    const lp = selectBestOppLeadPair(valid, myPkm, activeWeather);
    return {combo4:valid, leadPair:lp, threatMap:buildThreatMap(valid,myPkm,activeWeather), spreadWarn:collectSpreadWarn(valid), confidence:1};
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
  // 全体累加：双打4只都会上场，每只对每只我方的威胁全部计入
  const antiScore = combo => { if(!myPkm.length)return 0; let t=0; combo.forEach(op=>{myPkm.forEach(mp=>{t+=oppThreatScore(op,mp,activeWeather);});}); return t; };
  const all=[];
  for(let a=0;a<valid.length-3;a++) for(let b=a+1;b<valid.length-2;b++) for(let c=b+1;c<valid.length-1;c++) for(let d=c+1;d<valid.length;d++) all.push([valid[a],valid[b],valid[c],valid[d]]);
  const raw=all.map(combo=>({combo,syn:synScore(combo),anti:antiScore(combo)}));
  // 范围归一化，防止低方差指标放大噪声
  const minSyn=Math.min(...raw.map(r=>r.syn)),maxSyn=Math.max(...raw.map(r=>r.syn));
  const minAnti=Math.min(...raw.map(r=>r.anti)),maxAnti=Math.max(...raw.map(r=>r.anti));
  const synRange=Math.max(maxSyn-minSyn,0.001),antiRange=Math.max(maxAnti-minAnti,0.001);
  const ranked=raw.map(r=>({...r,v:((r.syn-minSyn)/synRange)*0.4+((r.anti-minAnti)/antiRange)*0.6})).sort((a,b)=>b.v-a.v);
  const confidence=ranked.length>=2?Math.min((ranked[0].v-ranked[1].v)/Math.max(ranked[0].v,0.01),1):1;
  const combo4=ranked[0].combo;
  const leadPair=selectBestOppLeadPair(combo4,myPkm,activeWeather);
  return {combo4, leadPair, threatMap:buildThreatMap(combo4,myPkm,activeWeather), spreadWarn:collectSpreadWarn(combo4), confidence};
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
    const megaTag=pkm._megaState==='mega'
      ?`<span class="battle-mega-tag is-mega">本场 Mega</span>`
      :pkm._megaState==='base'
        ?`<span class="battle-mega-tag is-base">普通形态</span>`
        :'';
    const intimidateWarn=oppHasIntimidate&&(role.cls==='role-phys'||role.cls==='role-mixed')?`<div class="battle-rec-reason warn-intimidate">⚠ 对方有恐吓，物攻约降33%</div>`:'';
    return `<div class="battle-rec-card ${rankClass[i]||''}">
      <span class="battle-rec-rank">${rankLabel[i]||''}</span>${leadBadge}
      <div class="battle-rec-sprite">${img}</div>
      <div class="battle-rec-body">
        <div class="battle-rec-name">${esc(pkm.name)}<span class="battle-role-tag ${role.cls}">${role.label}</span>${supportTag}${spreadTag}${megaTag}</div>
        <div class="battle-rec-score">进攻+${s.offScore.toFixed(1)} 防御-${s.defScore.toFixed(1)}${s.myItemBonus?` 道具+${s.myItemBonus.toFixed(1)}`:''} 综合${s.total.toFixed(1)}</div>
        <div class="battle-rec-reasons">${s.reasons.map(r=>`<div class="battle-rec-reason">${r}</div>`).join('')}${intimidateWarn}</div>
      </div>
    </div>`;
  }).join('');

  return leadHtml+`<div class="battle-rec-list">${cardsHtml}</div>`;
}

function renderDFieldControl(myPkm, oppValid) {
  const terrainMoves = new Set(['electric-terrain','grassy-terrain','misty-terrain','psychic-terrain']);
  const weatherMoves = new Set(['rain-dance','sunny-day','sandstorm','snowscape']);
  const sharedControlRows = [
    { label:'顺风', has:(slugs)=>slugs.includes('tailwind') },
    { label:'奇异空间', has:(slugs)=>slugs.includes('trick-room') },
    { label:'击掌奇袭/引导', has:(slugs)=>slugs.includes('fake-out') || slugs.includes('follow-me') || slugs.includes('rage-powder') },
    { label:'鼓气加油', has:(slugs)=>slugs.includes('helping-hand') },
    { label:'天气', has:(slugs, pkm, fromMoves)=>Boolean(ABILITY_WEATHER_SET[pkm.ability||'']) || fromMoves.some(s=>weatherMoves.has(s)) },
    { label:'地形', has:(slugs, pkm, fromMoves)=>fromMoves.some(s=>terrainMoves.has(s)) },
  ];
  const getMyControl = (pkm) => {
    const slugs = [pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(Boolean).map(m=>m.slug||'').filter(Boolean);
    return sharedControlRows.filter(row => row.has(slugs, pkm, slugs)).map(row => row.label);
  };
  const getOppControl = (pkm) => {
    const slugs = (pkm.predictedMoves||[]).map(m=>m.slug||'').filter(Boolean);
    return sharedControlRows.filter(row => row.has(slugs, pkm, slugs)).map(row => row.label);
  };
  const spriteFor = (pkm, isOpp=false) => {
    if (!isOpp && pkm._spriteUrl) return pkm._spriteUrl;
    if (isOpp && pkm.spriteUrl) return pkm.spriteUrl;
    if (pkm.slug && PKM_PC_BY_SLUG[pkm.slug]?.spriteUrl) return PKM_PC_BY_SLUG[pkm.slug].spriteUrl;
    return '';
  };
  const renderSide = (rows, emptyText, isOpp=false) => {
    const map = new Map();
    rows.forEach(pkm => {
      const labels = isOpp ? getOppControl(pkm) : getMyControl(pkm);
      labels.forEach(label => {
        if (!map.has(label)) map.set(label, []);
        map.get(label).push(pkm);
      });
    });
    if (!map.size) return `<div style="color:var(--t3);font-size:.78rem">${emptyText}</div>`;
    return sharedControlRows.map(row => {
      const holders = map.get(row.label) || [];
      if (!holders.length) return '';
      const chips = holders.map(pkm => {
        const sprite = spriteFor(pkm, isOpp);
        return `<div class="battle-my-pkm-chip">${sprite?`<img src="${esc(sprite)}" alt="" onerror="this.style.display='none'">`:''}${esc(pkm.name||'?')}</div>`;
      }).join('');
      return `<div style="margin-bottom:10px"><div class="opp-pred-row-label">${row.label}</div><div class="battle-my-preview">${chips}</div></div>`;
    }).join('');
  };
  return `<div class="battle-analysis-layout" style="margin-top:4px">
    <div class="battle-side-card">
      <div class="battle-side-hdr">我方</div>
      ${renderSide(myPkm, '我方无场控手段')}
    </div>
    <div class="battle-side-card">
      <div class="battle-side-hdr">对方</div>
      ${renderSide(oppValid, '对方未识别到场控手段', true)}
    </div>
  </div>`;
}

function renderDSpreadRisk(myPkm) {
  const rows = [];
  const getMoveObjs = pkm => [pkm.move1,pkm.move2,pkm.move3,pkm.move4].filter(m => m?.slug && BD_SPREAD_SLUGS.has(m.slug));
  myPkm.forEach(pkm => {
    getMoveObjs(pkm).forEach(move => {
      const teammates = myPkm.filter(other => other !== pkm);
      let note = '注意队友站位';
      if (move.slug === 'earthquake' || move.slug === 'magnitude') {
        const allImmune = teammates.length > 0 && teammates.every(tm => tm.type1 === 'flying' || tm.type2 === 'flying' || tm.ability === 'levitate');
        note = allImmune ? '无自伤风险' : '注意地面免疫搭档';
      } else if (move.slug === 'surf') {
        note = teammates.some(tm => tm.ability === 'water-absorb' || tm.ability === 'storm-drain') ? '队友吸收' : '注意波及队友';
      } else if (move.slug === 'discharge') {
        note = teammates.some(tm => tm.ability === 'lightning-rod' || tm.ability === 'volt-absorb') ? '队友吸收' : '注意波及队友';
      }
      const mv = MOVES_BY_SLUG?.[move.slug];
      rows.push(`<div class="battle-warn-item">${esc(pkm.name)} 的 ${esc(mv?.name||move.name||move.slug)}：${esc(note)}</div>`);
    });
  });
  if (!rows.length) return `<div class="battle-warn-ok">出战阵容无范围技</div>`;
  return `<div class="battle-warn-list">${rows.join('')}</div>`;
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
  const rawMyPkm=(myTeam.pokemon||[]).map((p,idx)=>({...p,_slotIndex:idx})).filter(p=>p.name);
  if(!rawMyPkm.length){showToast('阵容为空，请先录入队伍成员');return;}

  const resultBox=document.getElementById('bd-analysis-result');
  resultBox.style.display='block';
  resultBox.innerHTML=`<div class="battle-analyzing">分析中<span class="battle-analyzing-dots"><span>.</span><span>.</span><span>.</span></span></div>`;

  setTimeout(()=>{
    try{
      const rawWeather=detectMyWeather(rawMyPkm);
      const oppValid=opp.filter(op=>op.name||op.type1);
      const predResult=predictOppDoubles(oppValid,rawMyPkm,rawWeather);
      // 预测只作参考；实际推荐和分析按对方全队评分，避免预测偏差单向传播
      const analysisOpp=oppValid;
      const megaPrep=prepareBattleTeamForMegaRule(rawMyPkm,analysisOpp,rawWeather,'doubles');
      const myPkm=megaPrep.team;
      const activeWeather=detectMyWeather(myPkm)||rawWeather;
      const rawScored=scorePkmForBattle(myPkm,analysisOpp,activeWeather,{raw:true});
      const teamPlan=analyzeDoublesTeamPlan(myPkm,analysisOpp,activeWeather);
      const comboResult=selectBestDoublesFour(rawScored,teamPlan,oppValid,activeWeather);
      const top4=comboResult.scored.slice(0,4);
      const selectedSet=new Set(top4.map(s=>s.pkm));
      const top4scored=[...top4,...rawScored.filter(s=>!selectedSet.has(s.pkm))];
      // 先发推荐对对方所有可能先发搭档求期望，并服从我方阵容打法
      const leadPairScored=selectBestLeadPair(top4,oppValid,teamPlan,activeWeather);
      const oppPredHtml=renderDOppPrediction(oppValid,predResult);
      const myRecHtml=renderDoublesRec(top4,leadPairScored,analysisOpp);
      const megaPlanHtml=describeBattleMegaPlan(myPkm,megaPrep.megaKey);
      const teamPlanHtml=renderDTeamPlan(teamPlan,comboResult);
      const quickHtml=renderQuickDecisionPanel({scored:top4scored,myPkm,opp:oppValid,activeWeather,format:'doubles',leadPairScored});
      const fieldCtrlHtml=renderDFieldControl(myPkm, oppValid);
      const spreadRiskHtml=renderDSpreadRisk(top4.map(s=>s.pkm));
      const matrixHtml=renderBattleMatrix(myPkm,opp);
      const speedHtml=renderSpeedAnalysis(rawScored,opp);
      const weakHtml=renderTeamWeaknessWarningD(top4scored);
      const coverageHtml=renderBattleCoverage(myPkm, opp);
      const dmgHtml=renderBattleDamage(myPkm, opp, activeWeather);
      const oppDmgHtml=renderOppDamage(opp, myPkm, activeWeather);
      resultBox.innerHTML=`<div class="battle-result-box">
        ${quickHtml}
        ${oppPredHtml?`<div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">🔮 对方出战预测</span><span class="battle-datasrc-note">协同40%+克制我方60% · 仅作参考，推荐按全队评分${oppValid.length>4?` · 置信度${Math.round(predResult.confidence*100)}%`:''}</span></div>
          ${oppPredHtml}</div>`:''}
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">我的阵容打法</span><span class="battle-datasrc-note">先识别打法，再决定4选和先发</span></div>
          ${teamPlanHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">推荐出战阵容（双打 6选4）</span><span class="battle-datasrc-note">针对全部已知对方成员</span></div>
          ${megaPlanHtml}
          ${myRecHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">场地控制分析</span></div>
          ${fieldCtrlHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">范围技自伤提示</span></div>
          ${spreadRiskHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">⚠ 队伍脆弱性预警</span></div>
          ${weakHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">速度档位</span></div>
          ${speedHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">属性相克矩阵</span></div>
          ${matrixHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">技能覆盖分析</span></div>
          ${coverageHtml}</div>
        <div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">伤害估算（我方 → 对方）</span><span class="battle-datasrc-note">Champions Lv.50 公式</span></div>
          ${dmgHtml}</div>
        ${oppDmgHtml?`<div class="battle-result-section">
          <div class="battle-result-hdr"><span class="battle-result-title">对方热门技能 → 我方伤害</span><span class="battle-datasrc-note">基于锦标赛使用率 top4 技能</span></div>
          ${oppDmgHtml}</div>`:''}
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
