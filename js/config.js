const SB_URL='https://qbzxfwnosacwbdumkvoz.supabase.co';
const SB_KEY='sb_publishable_m-FvqswdlPrigzfyxrBjJA_F9wzPNb2';
const IGDB_PROXY='https://qbzxfwnosacwbdumkvoz.supabase.co/functions/v1/dynamic-worker';
const STEAM_PROXY='https://qbzxfwnosacwbdumkvoz.supabase.co/functions/v1/steam-proxy';
const{createClient}=supabase;
const db=createClient(SB_URL,SB_KEY);
let games=[],editId=null,star=0,pff='all',charts={},srT=null;
const STMAP={playing:'游玩中',done:'已通关',wishlist:'想玩',dropped:'放弃'};
const STCLS={playing:'s-playing',done:'s-done',wishlist:'s-wishlist',dropped:'s-dropped'};
const PFMAP={
  xbox:'Xbox',xbox360:'Xbox 360/One',ps5:'PS5',ps4:'PS4',switch:'Switch',switch2:'Switch 2',steam:'Steam/PC',mobile:'手机',other:'其他',
  fc:'FC/红白机',sfc:'SFC/超任',n64:'N64',gc:'GameCube',wii:'Wii',wiiu:'Wii U',gb:'GB/GBC',gba:'GBA',nds:'NDS','3ds':'3DS',
  ps1:'PS1',ps2:'PS2',ps3:'PS3',psp:'PSP',vita:'PS Vita',
  xbox_orig:'Xbox 原版',
  md:'MD/Genesis',ss:'Saturn',dc:'Dreamcast'
};
const HINT=['','差强人意','一般般','还不错','值得推荐','神作！'];
const PFG={xbox:'xbox',xbox360:'xbox',ps5:'ps',ps4:'ps',switch:'switch',switch2:'switch',steam:'steam',mobile:'other',other:'other'};
const PTAG={
  xbox:'tx',xbox360:'tx',ps5:'tp',ps4:'tp',switch:'tsw',switch2:'tsw',steam:'tst',
  fc:'tsw',sfc:'tsw',n64:'tsw',gc:'tsw',wii:'tsw',wiiu:'tsw',gb:'tsw',gba:'tsw',nds:'tsw','3ds':'tsw',
  ps1:'tp',ps2:'tp',ps3:'tp',psp:'tp',vita:'tp',
  xbox_orig:'tx',
  md:'tsg',ss:'tsg',dc:'tsg'
};
const CPMAP={main:'主线通关',side:'主线+支线',full:'全收集/铂金',partial:'部分完成',dropped:'中途放弃'};
const GAME_GENRE_GROUPS=[
  {label:'核心玩法',items:[
    ['action','动作'],['adventure','冒险'],['indie','独立游戏'],['rpg','RPG'],['jrpg','JRPG'],['arpg','动作 RPG'],['strategy','策略'],['tactics','战棋/战术'],['turnbased','回合制'],['rts','即时战略'],['shooter','射击'],['fps','FPS'],['tps','TPS'],['fighting','格斗'],['beat','清版动作']
  ]},
  {label:'探索与关卡',items:[
    ['open','开放世界'],['sandbox','沙盒'],['survival','生存'],['crafting','建造/制作'],['stealth','潜行'],['platformer','平台跳跃'],['metroid','银河城'],['souls','魂类'],['roguelike','Roguelike'],['dungeon','地下城'],['loot','刷宝/装备驱动']
  ]},
  {label:'叙事与解谜',items:[
    ['narrative','剧情驱动'],['visual','视觉小说'],['interactive','互动电影'],['pointclick','点击解谜'],['puzzle','解谜'],['mystery','悬疑推理'],['horror','恐怖'],['walking','步行模拟'],['detective','侦探']
  ]},
  {label:'模拟与经营',items:[
    ['sim','模拟'],['management','经营管理'],['citybuilder','城市建造'],['automation','自动化'],['farming','农场/生活'],['life','生活模拟'],['vehicle','载具模拟'],['tycoon','大亨']
  ]},
  {label:'竞技与多人',items:[
    ['sports','运动'],['racing','竞速'],['moba','MOBA'],['mmorpg','MMORPG'],['mmo','大型多人'],['coop','合作'],['party','派对'],['battle_royale','大逃杀'],['card','卡牌'],['board','桌游'],['towerdefense','塔防']
  ]},
  {label:'节奏与轻量',items:[
    ['music','音乐节奏'],['casual_game','休闲'],['idle','放置'],['gacha','抽卡/养成'],['education','教育'],['fitness','健身']
  ]}
];
const GAME_GENRES=GAME_GENRE_GROUPS.flatMap(g=>g.items.map(([value,label])=>({value,label,group:g.label})));
const GENRE_LABELS=Object.fromEntries(GAME_GENRES.map(g=>[g.value,g.label]));
const GENRE_ALIASES={
  '动作':'action','冒险':'adventure','角色扮演':'rpg','role-playing':'rpg','role playing':'rpg','rpg':'rpg','jrpg':'jrpg',
  '动作rpg':'arpg','action rpg':'arpg','strategy':'strategy','策略':'strategy','tactical':'tactics','turn-based strategy':'tactics','战术':'tactics','战棋':'tactics',
  'turn-based':'turnbased','回合制':'turnbased','real time strategy':'rts','rts':'rts','shooter':'shooter','射击':'shooter','fps':'fps','first-person shooter':'fps','tps':'tps','third-person shooter':'tps',
  'fighting':'fighting','格斗':'fighting','beat em up':'beat','hack and slash':'action','platform':'platformer','platformer':'platformer','platformer game':'platformer',
  'puzzle':'puzzle','解谜':'puzzle','simulator':'sim','simulation':'sim','模拟':'sim','sport':'sports','sports':'sports','运动':'sports','racing':'racing','竞速':'racing',
  'indie':'indie','独立':'indie','music':'music','rhythm':'music','音乐':'music','visual novel':'visual','视觉小说':'visual','horror':'horror','恐怖':'horror',
  'open world':'open','开放世界':'open','soulslike':'souls','soul-like':'souls','魂类':'souls','metroidvania':'metroid','银河城':'metroid','roguelike':'roguelike','rogue-like':'roguelike','roguelite':'roguelike','rogue-lite':'roguelike',
  'sandbox':'sandbox','沙盒':'sandbox','survival':'survival','生存':'survival','crafting':'crafting','建造':'crafting','stealth':'stealth','潜行':'stealth',
  'narrative':'narrative','剧情':'narrative','interactive movie':'interactive','point-and-click':'pointclick','point & click':'pointclick','mystery':'mystery','detective':'detective',
  'management':'management','经营':'management','city builder':'citybuilder','city-building':'citybuilder','automation':'automation','farming':'farming','life simulation':'life',
  'moba':'moba','mmorpg':'mmorpg','mmo':'mmo','co-op':'coop','cooperative':'coop','party':'party','battle royale':'battle_royale','card':'card','card game':'card','board game':'board','tower defense':'towerdefense',
  'casual':'casual_game','休闲':'casual_game','idle':'idle','放置':'idle','gacha':'gacha','教育':'education','fitness':'fitness'
};
function genreLabel(value){return GENRE_LABELS[value]||value||'未标类型';}
function normalizeGameGenreValue(raw){
  const text=String(raw?.name||raw||'').trim();
  if(!text)return '';
  if(GENRE_LABELS[text])return text;
  const byLabel=GAME_GENRES.find(g=>g.label===text);
  if(byLabel)return byLabel.value;
  return GENRE_ALIASES[text.toLowerCase()]||text;
}
function normalizeGameGenres(list){
  const out=[];
  (list||[]).forEach(x=>{
    const v=normalizeGameGenreValue(x);
    if(v&&!out.includes(v))out.push(v);
  });
  return out;
}
let cQuery='',cOffset=0,fetching=false,hasMore=true;
