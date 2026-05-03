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
let cQuery='',cOffset=0,fetching=false,hasMore=true;
