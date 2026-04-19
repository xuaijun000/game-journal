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
const MOVES_DATA=[
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
let battleOppPkm=[{},{},{},{},{},{} ];  // 对方6只（{name,type1,type2}）
let battleAnalysisMyTeam=null;

/* ──────── 初始化 ──────── */
async function initBattle(){
  renderBattleOppSlots();
  await loadBattleTeams();
  renderTeamList();
  renderBattleTeamSel();
  renderBattleCalc();
}

/* ──────── 标签切换 ──────── */
function switchBattleTab(tab,btn){
  document.querySelectorAll('.btab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.btab-panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('btab-'+tab).classList.add('on');
  btn.classList.add('on');
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
        <input class="bpkm-search-inp" id="bpkm-name-inp" placeholder="输入宝可梦名称或编号搜索…" value="${esc(p.name||'')}" oninput="onBpkmSearch(this.value)" autocomplete="off">
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
          <input class="bpkm-inp" id="bpkm-item" placeholder="例：讲究头带" value="${esc(p.item||'')}">
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
  const normalizeEn=n=>normalizeBattleMoveKeyword(n.replace(/-/g,' '));
  const learnableSet=new Set(learnableEn.map(normalizeEn));
  // Moves in MOVES_DATA that are learnable
  const inData=MOVES_DATA.map((move,idx)=>{
    if(!learnableSet.has(normalizeEn(move.nameEn)))return null;
    return {idx,move,apiOnly:false};
  }).filter(Boolean);
  // Moves learnable from PokeAPI but absent from MOVES_DATA
  const dataKeys=new Set(MOVES_DATA.map(m=>normalizeEn(m.nameEn)));
  const apiOnlyMoves=learnableEn
    .filter(en=>!dataKeys.has(normalizeEn(en)))
    .map(en=>{
      const displayName=en.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      return {idx:-1,move:{name:displayName,nameEn:en,type:'',cat:'',power:null,pp:null},apiOnly:true};
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
      // 先从中文名表查找
      const cnMatches=Object.entries(PKM_CN_TABLE).filter(([id,cn])=>cn.includes(q)).slice(0,8);
      let results=cnMatches.map(([id,cn])=>({id:parseInt(id),cnName:cn}));
      // 再尝试PokeAPI英文/编号搜索
      if(!results.length&&/^\d+$/.test(q)){results=[{id:parseInt(q),cnName:PKM_CN_TABLE[parseInt(q)]||null}];}
      if(!results.length){
        const r=await fetch(`${POKEAPI}/pokemon/${encodeURIComponent(q.toLowerCase())}`);
        if(r.ok){const d=await r.json();results=[{id:d.id,cnName:PKM_CN_TABLE[d.id]||d.name,name:d.name,types:d.types}];}
      }
      if(!results.length){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">未找到</div>';return;}
      drop.innerHTML=results.map(r=>{
        const sprite=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r.id}.png`;
        return`<div class="bpkm-drop-item" onclick="selectBpkmFromDrop(${r.id},'${esc(r.cnName||r.name||'')}')">
          <img src="${sprite}" alt="" onerror="this.style.display='none'">
          <div class="bpkm-drop-name">${esc(r.cnName||r.name||'')}</div>
          <div class="bpkm-drop-num">#${r.id}</div>
        </div>`;
      }).join('');
    } catch(e){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索出错</div>';}
  },300);
}

async function selectBpkmFromDrop(pkmId, cnName){
  const drop=document.getElementById('bpkm-search-drop');
  drop.classList.remove('open');
  const inp=document.getElementById('bpkm-name-inp');
  if(inp)inp.value=cnName;
  battleEditTeam.pokemon[battleEditSlot].name=cnName;
  // 加载属性 + 精灵图
  try{
    const r=await fetch(`${POKEAPI}/pokemon/${pkmId}`);
    if(r.ok){
      const d=await r.json();
      const t1=d.types[0]?.type?.name||'';
      const t2=d.types[1]?.type?.name||'';
      const s1=document.getElementById('bpkm-type1');
      const s2=document.getElementById('bpkm-type2');
      if(s1)s1.value=t1;
      if(s2)s2.value=t2||'';
      battleEditTeam.pokemon[battleEditSlot].type1=t1;
      battleEditTeam.pokemon[battleEditSlot].type2=t2;
      // 种族值
      const stats={};
      d.stats.forEach(s=>{
        const k={'hp':'hp','attack':'atk','defense':'def','special-attack':'spa','special-defense':'spd','speed':'spe'}[s.stat.name];
        if(k)stats[k]=s.base_stat;
      });
      battleEditTeam.pokemon[battleEditSlot].base=stats;
      STAT_KEYS_B.forEach(k=>{
        const el=document.getElementById(`bpkm-base-${k}`);
        if(el&&stats[k])el.value=stats[k];
      });
      // 特性
      const abilities=d.abilities.map(a=>a.ability.name);
      battleEditTeam.pokemon[battleEditSlot].abilities=abilities;
      const chipsEl=document.getElementById('bpkm-ability-chips');
      if(chipsEl){
        const curAbility=document.getElementById('bpkm-ability')?.value||'';
        chipsEl.innerHTML=abilities.map(a=>`<span class="bpkm-ability-chip${curAbility===a?' active':''}" onclick="selectBpkmAbility('${esc(a)}')">${esc(a)}</span>`).join('');
      }
      // 可学技能列表
      const learnableMovesEn=(d.moves||[]).map(m=>m.move.name);
      battleEditTeam.pokemon[battleEditSlot].learnableMovesEn=learnableMovesEn;
      [1,2,3,4].forEach(i=>{
        const inp=document.getElementById(`bpkm-move${i}-name`);
        if(inp)inp.placeholder='点击选择可学技能…';
      });
      // 精灵图
      const spriteUrl=d.sprites.front_default||`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmId}.png`;
      battleEditSpriteCache[battleEditSlot]=spriteUrl;
      battleEditTeam.pokemon[battleEditSlot]._spriteUrl=spriteUrl;
      // 更新预览
      let prev=document.querySelector('.bpkm-preview');
      if(!prev){
        const wrap=document.getElementById('bpkm-name-inp').parentElement;
        const previewDiv=document.createElement('div');
        previewDiv.className='bpkm-preview';
        previewDiv.id='bpkm-preview-wrap';
        wrap.parentElement.insertBefore(previewDiv,wrap.nextSibling);
        prev=previewDiv;
      }
      prev.innerHTML=`<img src="${esc(spriteUrl)}" alt="" id="bpkm-sprite" onerror="this.style.display='none'">
        <div>
          <div class="bpkm-preview-name">${esc(cnName)}</div>
          <div class="bpkm-preview-types">${t1?`<span class="coverage-type-tag type-${t1}">${TYPE_ZH[t1]||t1}</span>`:''}${t2?`<span class="coverage-type-tag type-${t2}">${TYPE_ZH[t2]||t2}</span>`:''}</div>
        </div>`;
      onBpkmStatChange();
      // 加载全形态（Mega/极巨化/地区形态等）
      loadPkmForms(pkmId, d.name, cnName);
    }
  } catch(e){console.warn(e);}
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
  p.abilities=battleEditTeam.pokemon[battleEditSlot]?.abilities||[];
  battleEditTeam.pokemon[battleEditSlot]=p;
}

/* ──────── 特性选择 ──────── */
function selectBpkmAbility(name){
  const inp=document.getElementById('bpkm-ability');
  if(inp)inp.value=name;
  document.querySelectorAll('.bpkm-ability-chip').forEach(c=>c.classList.toggle('active',c.textContent===name));
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

function renderBattleOppSlots(){
  const el=document.getElementById('battle-opp-slots');
  if(!el)return;
  const typeOpts=B_TYPES.map(t=>`<option value="${t}">${TYPE_ZH[t]||t}</option>`).join('');
  el.innerHTML=[0,1,2,3,4,5].map(i=>`
    <div class="battle-opp-row">
      <span class="battle-opp-num">${i+1}</span>
      <div class="battle-opp-inp-wrap">
        <input class="battle-opp-inp" id="bopp-name-${i}" placeholder="搜索宝可梦…" oninput="onOppNameInput(${i},this.value)" onblur="setTimeout(()=>closeBoppDrop(${i}),200)" autocomplete="off">
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
      const cnMatches=Object.entries(PKM_CN_TABLE).filter(([id,cn])=>cn.includes(q)).slice(0,8);
      let results=cnMatches.map(([id,cn])=>({id:parseInt(id),cnName:cn}));
      if(!results.length&&/^\d+$/.test(q))results=[{id:parseInt(q),cnName:PKM_CN_TABLE[parseInt(q)]||null}];
      if(!results.length){
        const r=await fetch(`${POKEAPI}/pokemon/${encodeURIComponent(q.toLowerCase())}`);
        if(r.ok){const d=await r.json();results=[{id:d.id,cnName:PKM_CN_TABLE[d.id]||d.name}];}
      }
      if(!results.length){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">未找到</div>';return;}
      drop.innerHTML=results.map(r=>{
        const sprite=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r.id}.png`;
        return`<div class="bpkm-drop-item" onclick="selectOppPkmFromDrop(${i},${r.id},'${esc(r.cnName||'')}')">
          <img src="${sprite}" alt="" onerror="this.style.display='none'">
          <div class="bpkm-drop-name">${esc(r.cnName||'')}</div>
          <div class="bpkm-drop-num">#${r.id}</div>
        </div>`;
      }).join('');
    } catch(e){drop.innerHTML='<div style="padding:8px 10px;color:var(--t3);font-size:.78rem">搜索出错</div>';}
  },300);
}

async function selectOppPkmFromDrop(i,pkmId,cnName){
  closeBoppDrop(i);
  const inp=document.getElementById(`bopp-name-${i}`);
  if(inp)inp.value=cnName;
  try{
    const r=await fetch(`${POKEAPI}/pokemon/${pkmId}`);
    if(r.ok){
      const d=await r.json();
      const t1=d.types[0]?.type?.name||'';
      const t2=d.types[1]?.type?.name||'';
      const s1=document.getElementById(`bopp-t1-${i}`);
      const s2=document.getElementById(`bopp-t2-${i}`);
      if(s1)s1.value=t1;
      if(s2)s2.value=t2;
      battleOppPkm[i]={name:cnName,type1:t1,type2:t2};
    }
  } catch(e){}
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

// 获取我方宝可梦使用其最优技能攻击对方的最高倍率
function getBestMoveEff(myPkm, oppPkm){
  const moves=[myPkm.move1,myPkm.move2,myPkm.move3,myPkm.move4].filter(m=>m&&m.type&&m.type!=='status'&&m.power>0);
  if(!moves.length)return getTypeEff(myPkm.type1,oppPkm.type1,oppPkm.type2); // 无技能时用本体属性
  return Math.max(...moves.map(m=>getTypeEff(m.type,oppPkm.type1,oppPkm.type2)));
}

// 对方攻击我方的最高倍率（简化，只算属性相克）
function getOppBestEff(oppPkm, myPkm){
  // 对方信息有限，只能用属性判断
  const att1=getTypeEff(oppPkm.type1,myPkm.type1,myPkm.type2);
  const att2=oppPkm.type2?getTypeEff(oppPkm.type2,myPkm.type1,myPkm.type2):0;
  return Math.max(att1,att2,0.25);
}

/* ── Champions 伤害估算 ──
 * 公式参考标准 Lv.50 格斗：
 *   Damage = Floor( Floor((2*Lv/5+2) * Pwr * A/D / 50) + 2 ) * modifiers
 * Champions AP修正：ap1→×0.6, ap2→×0.85, ap3→×1.0, ap4→×1.25, ap5→×1.55
 * 持有道具修正（简化）：讲究系→×1.5, 生命球→×1.3
 */
// AP_MOD removed — Champions uses PP, not AP action points
const ITEM_MOD={'讲究头带':1.5,'讲究眼镜':1.5,'讲究围巾':1.5,'生命球':1.3,'火焰宝珠':1.2,'强化道具':1.1};

function calcDamageEst(myPkm, oppPkm, move){
  if(!move||!move.power||move.cat==='status')return null;
  const level=myPkm.level||50;
  const isPhys=move.cat==='physical';
  // 攻防能力值（如果没有录入则用种族值估算）
  const atkStat=isPhys
    ?calcActualStatVal(myPkm.base?.atk||70,31,myPkm.ev?.atk||0,myPkm.nature,'atk',level)
    :calcActualStatVal(myPkm.base?.spa||70,31,myPkm.ev?.spa||0,myPkm.nature,'spa',level);
  const defStat=isPhys
    ?calcActualStatVal(oppPkm.base?.def||70,15,0,'','def',level)
    :calcActualStatVal(oppPkm.base?.spd||70,15,0,'','spd',level);
  const oppHp=calcActualStatVal(oppPkm.base?.hp||70,15,0,'','hp',level);

  let pwr=move.power;
  // 属性相克
  const typeMul=getTypeEff(move.type,oppPkm.type1,oppPkm.type2);
  // 道具修正
  let itemMul=ITEM_MOD[myPkm.item]||1.0;
  // 技能属性与本体属性一致时 STAB 1.5x
  const stab=(move.type===myPkm.type1||move.type===myPkm.type2)?1.5:1.0;
  const baseDmg=Math.floor((Math.floor((2*level/5+2)*pwr*atkStat/defStat/50)+2)*typeMul*stab*itemMul);
  const dmgPct=oppHp>0?Math.round(baseDmg/oppHp*100):0;
  return{damage:baseDmg,pct:dmgPct,typeMul};
}

/* ──────── 主分析入口 ──────── */
function analyzeMatchups(){
  // 收集对方数据
  [0,1,2,3,4,5].forEach(i=>{
    battleOppPkm[i]={
      name:document.getElementById(`bopp-name-${i}`)?.value.trim()||'',
      type1:document.getElementById(`bopp-t1-${i}`)?.value||'',
      type2:document.getElementById(`bopp-t2-${i}`)?.value||'',
    };
  });
  const opp=battleOppPkm.filter(p=>p.name||p.type1);
  if(!opp.length){showToast('请至少填入对方一只宝可梦的属性');return;}
  const myTeam=battleTeams.find(t=>t.id===battleMyTeamId);
  if(!myTeam){showToast('请先选择我的队伍');return;}
  const myPkm=(myTeam.pokemon||[]).filter(p=>p.name);
  if(!myPkm.length){showToast('队伍为空，请先录入队伍成员');return;}
  battleAnalysisMyTeam=myTeam;

  const resultBox=document.getElementById('battle-analysis-result');
  resultBox.style.display='block';
  resultBox.innerHTML=`<div class="battle-analyzing">分析中<span class="battle-analyzing-dots"><span>.</span><span>.</span><span>.</span></span></div>`;

  setTimeout(()=>{
    try{
      const matrixHtml=renderBattleMatrix(myPkm,opp);
      const coverageHtml=renderBattleCoverage(myPkm);
      const dmgHtml=renderBattleDamage(myPkm,opp);
      const recHtml=renderBattleRec(myPkm,opp);
      resultBox.innerHTML=`
        <div class="battle-result-box">
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">属性相克矩阵</span><span class="battle-datasrc-note">行=我方用技能攻击，列=对方防御。我→对方倍率</span></div>
            ${matrixHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">技能覆盖分析</span></div>
            ${coverageHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">伤害估算（单发最优技能 vs 对方）</span><span class="battle-datasrc-note">Champions Lv.50 公式 + AP修正</span></div>
            ${dmgHtml}
          </div>
          <div class="battle-result-section">
            <div class="battle-result-hdr"><span class="battle-result-title">推荐出战阵容</span></div>
            ${recHtml}
          </div>
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
      return`<td class="${effClass(eff)}">${effLabel(eff)}</td>`;
    }).join('');
    const dot1=mp.type1?`<span class="bm-type-dot" style="background:${TYPE_COLOR[mp.type1]||'#888'}"></span>`:'';
    return`<tr><th class="row-hdr">${dot1}${esc(mp.name)}</th>${cells}</tr>`;
  }).join('');
  return`<div class="battle-matrix-wrap"><table class="battle-matrix"><tr><th class="row-hdr">我方 ↓ / 对方 →</th>${cols}</tr>${rows}</table></div>`;
}

/* ── 技能覆盖 ── */
function renderBattleCoverage(myPkm){
  const cards=myPkm.map(p=>{
    const moves=[p.move1,p.move2,p.move3,p.move4].filter(m=>m&&m.type&&m.cat!=='status');
    const unique=[...new Set(moves.map(m=>m.type))];
    const tags=unique.map(t=>`<span class="coverage-type-tag type-${t}">${TYPE_ZH[t]||t}</span>`).join('');
    const img=p._spriteUrl?`<img src="${esc(p._spriteUrl)}" alt="" onerror="this.style.display='none'">`:'';
    return`<div class="coverage-card">
      <div class="coverage-card-name">${img}${esc(p.name)}</div>
      <div class="coverage-type-tags">${tags||'<span style="color:var(--t3);font-size:.72rem">无技能数据</span>'}</div>
    </div>`;
  }).join('');
  return`<div class="battle-coverage-grid">${cards}</div>`;
}

/* ── 伤害估算 ── */
function renderBattleDamage(myPkm, opp){
  const rows=myPkm.map(mp=>{
    const oppRows=opp.map(op=>{
      if(!op.name&&!op.type1)return'';
      const moves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
      let bestResult=null;
      moves.forEach(m=>{
        const r=calcDamageEst(mp,op,m);
        if(r&&(!bestResult||r.pct>bestResult.pct))bestResult={...r,moveName:m.name||m.type};
      });
      if(!bestResult){
        // fallback: use type only
        const eff=getBestMoveEff(mp,op);
        const koCls=eff>=2?'dmg-2hko':'dmg-survive';
        const koTxt=eff>=2?'属性克制':'普通';
        return`<div class="battle-dmg-row">
          <span class="battle-dmg-vs">${esc(mp.name)} → ${esc(op.name||'?')}</span>
          <span class="battle-dmg-ko ${koCls}">${koTxt}</span>
        </div>`;
      }
      const koClass=bestResult.pct>=100?'dmg-1hko':bestResult.pct>=50?'dmg-2hko':'dmg-survive';
      const koText=bestResult.pct>=100?'一击KO':bestResult.pct>=50?'两击KO':'无法秒杀';
      return`<div class="battle-dmg-row">
        <span class="battle-dmg-vs">${esc(mp.name)} [${esc(bestResult.moveName)}] → ${esc(op.name||'?')}</span>
        <span class="battle-dmg-pct">${bestResult.pct}%</span>
        <span class="battle-dmg-ko ${koClass}">${koText}</span>
      </div>`;
    }).filter(Boolean).join('');
    return oppRows;
  }).join('');
  return`<div class="battle-dmg-list">${rows||'<div class="battle-analyzing">请填写技能和对方队伍信息以估算伤害</div>'}</div>`;
}

/* ── 推荐出战 ── */
function renderBattleRec(myPkm, opp){
  const scored=myPkm.map(mp=>{
    let offScore=0, defScore=0, koCount=0;
    const reasons=[];
    const oppValid=opp.filter(op=>op.name||op.type1);
    oppValid.forEach(op=>{
      const eff=getBestMoveEff(mp,op);
      offScore+=eff;
      if(eff>=2)reasons.push(`克制${op.name||op.type1}系`);
      const taken=getOppBestEff(op,mp);
      defScore+=taken;
      // 估算KO
      const moves=[mp.move1,mp.move2,mp.move3,mp.move4].filter(m=>m&&m.power>0&&m.cat!=='status');
      let bestPct=0;
      moves.forEach(m=>{const r=calcDamageEst(mp,op,m);if(r&&r.pct>bestPct)bestPct=r.pct;});
      if(bestPct>=100){koCount++;reasons.push(`可一击秒杀${esc(op.name||'?')}`);}
      else if(bestPct>=50)reasons.push(`两击可KO${esc(op.name||'?')}`);
    });
    // 防御弱点数
    const weakTypes=B_TYPES.filter(t=>getTypeEff(t,mp.type1,mp.type2)>=2);
    const resistTypes=B_TYPES.filter(t=>getTypeEff(t,mp.type1,mp.type2)<=0.5);
    if(resistTypes.length)reasons.push(`抗性好（${resistTypes.map(t=>TYPE_ZH[t]).slice(0,3).join('/')}等）`);
    if(weakTypes.length<=2)reasons.push(`弱点少（仅${weakTypes.length}种）`);
    const total=offScore - defScore*0.5 + koCount*3;
    return{pkm:mp,offScore,defScore,koCount,total,reasons:[...new Set(reasons)].slice(0,4)};
  }).sort((a,b)=>b.total-a.total);

  const top3=scored.slice(0,3);
  const rankClass=['rank-1','rank-2','rank-3'];
  const rankLabel=['#1 首选','#2 次选','#3 备选'];
  const rankCls=['r1','r2','r3'];
  return`<div class="battle-rec-list">${top3.map((s,i)=>{
    const img=s.pkm._spriteUrl?`<img src="${esc(s.pkm._spriteUrl)}" alt="" onerror="this.style.display='none'">`:'';
    return`<div class="battle-rec-card ${rankClass[i]}">
      <span class="battle-rec-rank ${rankCls[i]}">${rankLabel[i]}</span>
      <div class="battle-rec-sprite">${img}</div>
      <div class="battle-rec-body">
        <div class="battle-rec-name">${esc(s.pkm.name)}</div>
        <div class="battle-rec-score">进攻+${s.offScore.toFixed(1)} 防御-${s.defScore.toFixed(1)} 综合${s.total.toFixed(1)}</div>
        <div class="battle-rec-reasons">${s.reasons.map(r=>`<div class="battle-rec-reason">${esc(r)}</div>`).join('')}</div>
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
