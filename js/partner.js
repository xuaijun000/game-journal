/* ===== 我的伙伴 =====
 * Supabase table (run once in SQL editor):
 *
 * create table pkm_partner (
 *   id uuid primary key default gen_random_uuid(),
 *   user_id uuid references auth.users(id) on delete cascade not null,
 *   pkm_id integer not null,
 *   pkm_name text not null,
 *   nickname text,
 *   level integer default 1,
 *   exp integer default 0,
 *   hunger integer default 80,
 *   mood integer default 75,
 *   energy integer default 80,
 *   bond integer default 0,
 *   last_interaction_at timestamptz default now(),
 *   streak_days integer default 1,
 *   last_checkin_date date default current_date,
 *   inventory jsonb default '{"berry":3,"poffin":1,"cube":0,"drink":0,"toy":0}'::jsonb,
 *   diary jsonb default '[]'::jsonb,
 *   daily_interactions jsonb default '{}'::jsonb,
 *   interaction_counts jsonb default '{"feed":0,"pat":0,"play":0,"train":0,"rest":0,"adventure":0,"total":0}'::jsonb,
 *   achievements jsonb default '[]'::jsonb,
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now(),
 *   unique(user_id)
 * );
 * alter table pkm_partner enable row level security;
 * create policy "Users manage own partner" on pkm_partner
 *   for all using (auth.uid() = user_id);
 */

const PARTNER_ACTIONS = {
  feed:      {hunger:+20, mood:+5,  energy:  0, bond:+1, exp:+3,  label:'喂食', icon:'🍖'},
  pat:       {hunger:  0, mood:+10, energy:  0, bond:+3, exp:+2,  label:'抚摸', icon:'🤝'},
  play:      {hunger: -5, mood:+15, energy:-10, bond:+5, exp:+5,  label:'玩耍', icon:'⚽'},
  train:     {hunger:-10, mood: -5, energy:-20, bond:+2, exp:+15, label:'训练', icon:'💪'},
  rest:      {hunger: -5, mood: +5, energy:+30, bond:+1, exp:+2,  label:'休息', icon:'😴'},
  adventure: {hunger:-10, mood:+10, energy:-15, bond:+8, exp:+10, label:'冒险', icon:'🗺️'}
};

const PARTNER_DAILY_LIMIT = 5;
const PARTNER_ASSET_BASE = 'css/assets/partner';
const PARTNER_TYPE_ZH = {
  normal:'一般',fire:'火',water:'水',electric:'电',grass:'草',ice:'冰',fighting:'格斗',poison:'毒',
  ground:'地面',flying:'飞行',psychic:'超能力',bug:'虫',rock:'岩石',ghost:'幽灵',dragon:'龙',
  dark:'恶',steel:'钢',fairy:'妖精'
};
const PARTNER_ACTION_EFFECT = {
  feed:'food',
  pat:'heart',
  play:'spark',
  train:'levelup',
  rest:'sleep',
  adventure:'bond',
  chat:'note'
};

const BOND_STAGES = [
  {min:0,  max:20,  name:'初次相遇', desc:'它还在观察你。'},
  {min:21, max:40,  name:'熟悉伙伴', desc:'它开始主动靠近你。'},
  {min:41, max:60,  name:'可靠同伴', desc:'它很信任你。'},
  {min:61, max:80,  name:'亲密搭档', desc:'它总是想陪你冒险。'},
  {min:81, max:100, name:'最佳伙伴', desc:'你们已经是最棒的搭档。'}
];

const PARTNER_FEEDBACK = {
  feed:[
    n=>`${n}开心地吃下食物，看起来很满足。`,
    n=>`${n}用爪子拨弄了一下食物，然后大口吃了起来。`,
    n=>`食物一下子就吃完了，${n}还意犹未尽地看着你。`
  ],
  pat:[
    n=>`${n}蹭了蹭你的手，眼神变得温柔。`,
    n=>`${n}发出一声满足的低鸣。`,
    n=>`${n}闭上眼睛，享受你的抚摸。`
  ],
  play:[
    n=>`${n}精神抖擞地和你玩耍起来！`,
    n=>`${n}玩得很开心，跑来跑去。`,
    n=>`${n}追逐着玩具，充满活力。`
  ],
  train:[
    n=>`${n}认真完成了一次训练，经验增加了！`,
    n=>`${n}不服输地重新站了起来，继续练习。`,
    n=>`${n}汗流浃背，但眼神更加坚定。`
  ],
  rest:[
    n=>`${n}蜷缩起来，舒服地打了个盹。`,
    n=>`${n}找了个舒适的角落慢慢休息。`,
    n=>`${n}闭上眼睛，呼吸变得平稳。`
  ],
  adventure:[
    n=>`你和${n}一起踏上了新的冒险！`,
    n=>`${n}好奇地探索着周围的环境。`,
    n=>`${n}紧紧跟在你身边，勇敢地迈步前行。`
  ]
};

const PARTNER_ITEMS = {
  berry: {name:'树果',    icon:'🍇', effect:{hunger:+15},        desc:'饱食度 +15'},
  poffin:{name:'宝芬',    icon:'🍮', effect:{mood:+20},          desc:'心情 +20'},
  cube:  {name:'能量方块', icon:'🧊', effect:{exp:+10},           desc:'经验 +10'},
  drink: {name:'活力饮料', icon:'💧', effect:{energy:+20},        desc:'精力 +20'},
  toy:   {name:'玩具球',   icon:'⚽', effect:{mood:+10,bond:+3},  desc:'心情 +10，亲密 +3'}
};

const PARTNER_ACHIEVEMENTS = [
  {id:'first_meet',  name:'初次相遇',  icon:'🌟'},
  {id:'first_feed',  name:'第一次喂食', icon:'🍖'},
  {id:'bond_50',     name:'可靠搭档',  icon:'🤝'},
  {id:'bond_100',    name:'最佳伙伴',  icon:'💎'},
  {id:'train_10',    name:'训练达人',  icon:'💪'},
  {id:'lv10',        name:'成长之路',  icon:'⭐'},
  {id:'streak_7',    name:'七日相伴',  icon:'📅'},
  {id:'adventure_5', name:'冒险同行',  icon:'🗺️'}
];

const DAILY_TASKS = [
  {id:'interact3',  text:'和伙伴互动 3 次',   reward:'亲密 +3',   check:d=>(d.total||0)>=3},
  {id:'pokedex',    text:'查看 1 只宝可梦',   reward:'树果 ×1',   check:d=>!!d.pokedex_view},
  {id:'game_log',   text:'写一条游戏日志',     reward:'宝芬 ×1',   check:d=>!!d.game_log},
  {id:'battle_use', text:'使用 PVP 分析',     reward:'经验 +10',  check:d=>!!d.battle_analysis},
  {id:'media_add',  text:'收藏动漫或漫画',     reward:'心情 +5',   check:d=>!!d.media_add}
];

function pExpForLevel(lv){return lv<=1?0:Math.floor(lv*lv*12);}
function pLevelFromExp(e){let lv=1;while(lv<30&&pExpForLevel(lv+1)<=e)lv++;return lv;}

let partnerData=null;
let partnerChatHistory=[];
let partnerChatLoading=false;
let partnerTypeCache={};
let partnerConsolePanel='overview';
let _partnerUserId=null;
let _partnerLbDim='level';

/* ===== INIT ===== */
async function initPartner(){
  window._partnerInited=true;
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){
    partnerData=null;
    updatePartnerFloat();
    const container=document.getElementById('partner-container');
    if(container)container.innerHTML=`
      <div class="partner-login-prompt">
        <div class="partner-login-prompt-icon">🎮</div>
        <h3>登录后解锁伙伴功能</h3>
        <p>选择一只宝可梦作为你的专属伙伴，记录每天的互动与成长。</p>
        <button class="btn btn-a" onclick="go('auth',null)" style="margin:0 auto;display:block;padding:10px 28px">前往登录</button>
      </div>`;
    return;
  }
  await loadPartnerData(session.user.id);
}

async function loadPartnerData(userId){
  _partnerUserId=userId;
  const{data,error}=await db.from('pkm_partner').select('*').eq('user_id',userId).single();
  if(error){partnerData=null;renderPartnerSelectPrompt();updatePartnerFloat();return;}
  if(data){partnerData=data;checkPartnerDailyReset();await pEnsurePartnerMeta();renderPartnerPage();updatePartnerFloat();}
  else{renderPartnerSelectPrompt();updatePartnerFloat('partner');}
}


async function savePartnerData(){
  if(!partnerData)return;
  pSyncCurrentPartnerToRoster();
  partnerData.updated_at=new Date().toISOString();
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user)return;
  await db.from('pkm_partner').upsert(pPartnerDbPayload(partnerData,session.user.id),{onConflict:'user_id'});
}

/* ===== DAILY RESET ===== */
function checkPartnerDailyReset(){
  if(!partnerData)return;
  const today=pToday();
  const di=partnerData.daily_interactions||{};
  if(di.date===today)return;
  const lastDate=di.date;
  if(lastDate){
    const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
    partnerData.streak_days=(lastDate===yesterday.toISOString().slice(0,10))?(partnerData.streak_days||1)+1:1;
  }
  applyPartnerStatDecay();
  partnerData.daily_interactions={date:today,total:0};
  partnerData.inventory=partnerData.inventory||{};
  partnerData.inventory.berry=(partnerData.inventory.berry||0)+1;
  if(window.addAffinityProgress)window.addAffinityProgress('daily_login');
}

function pToday(){return new Date().toISOString().slice(0,10);}

/* ===== STAT DECAY ===== */
function applyPartnerStatDecay(){
  if(!partnerData)return;
  const last=partnerData.last_interaction_at?new Date(partnerData.last_interaction_at):new Date();
  const hrs=Math.floor((Date.now()-last.getTime())/3600000);
  if(hrs<=0)return;
  partnerData.hunger=pClamp(partnerData.hunger-Math.min(hrs*2,30));
  partnerData.energy=pClamp(partnerData.energy+Math.min(hrs*3,20));
  partnerData.mood=pClamp(partnerData.mood-Math.min(hrs,10));
}

function pClamp(v){return Math.max(0,Math.min(100,v));}

async function pEnsurePartnerMeta(){
  if(!partnerData?.pkm_id)return;
  const pkid=partnerData.pkm_id;
  if(Array.isArray(partnerData.types)&&partnerData.types.length&&partnerTypeCache[pkid]?.apiName)return;
  const meta=await pFetchPokemonMeta(pkid).catch(()=>null);
  if(!meta)return;
  partnerData.types=meta.types;
  partnerData.primary_type=meta.types?.[0]||partnerData.primary_type||'normal';
}

async function pFetchPokemonMeta(pkmId){
  if(partnerTypeCache[pkmId]?.apiName)return partnerTypeCache[pkmId];
  const p=await fetch(`https://pokeapi.co/api/v2/pokemon/${pkmId}`).then(r=>r.ok?r.json():null);
  const out={types:(p?.types||[]).map(t=>t.type.name).filter(Boolean),apiName:p?.name||null};
  partnerTypeCache[pkmId]=out;
  return out;
}

function pPartnerTypeBg(type){
  const t=type||'normal';
  return pAssetUrl(`${PARTNER_ASSET_BASE}/types/type-${t}.jpg`);
}

function pPartnerTypeBgDoc(type){
  return pPartnerTypeBg(type);
}

function pPartnerEffectImg(action){
  const key=PARTNER_ACTION_EFFECT[action]||'spark';
  return pAssetUrl(`${PARTNER_ASSET_BASE}/effects/effect-${key}.png`);
}

function pAssetUrl(path){
  try{return new URL(path,document.baseURI).href;}
  catch{return path;}
}

function pPreloadPartnerImage(src){
  if(!src||document.querySelector(`link[data-partner-preload="${src}"]`))return;
  const link=document.createElement('link');
  link.rel='preload';
  link.as='image';
  link.href=src;
  link.dataset.partnerPreload=src;
  document.head.appendChild(link);
}

function pCleanInventory(inv){
  const out={...(inv||{})};
  delete out._partner_roster;
  return out;
}

function pGetStoredRoster(){
  const inv=partnerData?.inventory||{};
  return Array.isArray(inv._partner_roster)?inv._partner_roster:[];
}

function pSetStoredRoster(roster){
  partnerData.inventory={...(partnerData.inventory||{}),_partner_roster:roster.slice(0,12)};
}

function pPartnerSnapshot(d=partnerData){
  if(!d)return null;
  return {
    pkm_id:d.pkm_id,pkm_name:d.pkm_name,nickname:d.nickname||null,
    level:d.level||1,exp:d.exp||0,hunger:d.hunger??80,mood:d.mood??75,energy:d.energy??80,bond:d.bond||0,
    last_interaction_at:d.last_interaction_at||new Date().toISOString(),
    streak_days:d.streak_days||1,last_checkin_date:d.last_checkin_date||pToday(),
    inventory:pCleanInventory(d.inventory),diary:d.diary||[],
    daily_interactions:d.daily_interactions||{date:pToday(),total:0},
    interaction_counts:d.interaction_counts||{feed:0,pat:0,play:0,train:0,rest:0,adventure:0,total:0},
    achievements:d.achievements||[],types:d.types||[],primary_type:d.primary_type||d.types?.[0]||'normal',
    last_action:d.last_action||'',
    saved_at:new Date().toISOString()
  };
}

function pPartnerDbPayload(d,userId){
  return {
    user_id:userId,
    pkm_id:d.pkm_id,pkm_name:d.pkm_name,nickname:d.nickname||null,
    level:d.level||1,exp:d.exp||0,hunger:d.hunger??80,mood:d.mood??75,energy:d.energy??80,bond:d.bond||0,
    last_interaction_at:d.last_interaction_at||new Date().toISOString(),
    streak_days:d.streak_days||1,last_checkin_date:d.last_checkin_date||pToday(),
    inventory:d.inventory||{},diary:d.diary||[],
    daily_interactions:d.daily_interactions||{date:pToday(),total:0},
    interaction_counts:d.interaction_counts||{feed:0,pat:0,play:0,train:0,rest:0,adventure:0,total:0},
    achievements:d.achievements||[],
    created_at:d.created_at,updated_at:d.updated_at||new Date().toISOString()
  };
}

function pUpsertRosterSnapshot(roster,snapshot,activeId){
  if(!snapshot?.pkm_id)return roster||[];
  const next=(roster||[]).filter(x=>Number(x.pkm_id)!==Number(snapshot.pkm_id));
  next.unshift({...snapshot,active:Number(snapshot.pkm_id)===Number(activeId)});
  return next.map(x=>({...x,active:Number(x.pkm_id)===Number(activeId)}));
}

function pSyncCurrentPartnerToRoster(){
  if(!partnerData?.pkm_id)return;
  const roster=pUpsertRosterSnapshot(pGetStoredRoster(),pPartnerSnapshot(partnerData),partnerData.pkm_id);
  pSetStoredRoster(roster);
}

function pPartnerRoster(){
  if(!partnerData)return[];
  return pUpsertRosterSnapshot(pGetStoredRoster(),pPartnerSnapshot(partnerData),partnerData.pkm_id);
}

/* ===== RENDER ===== */
function renderPartnerSelectPrompt(){
  const container=document.getElementById('partner-container');
  if(container)_renderEncounterPrompt(container,_partnerUserId);
}

function renderPartnerPage(){
  if(!partnerData){renderPartnerSelectPrompt();return;}
  const d=partnerData;
  const name=d.nickname||d.pkm_name;
  const moodAnim=d.mood>75?'excited':d.energy<25?'tired':'';
  const moodBadge=d.mood>80?{text:'非常开心',cls:'happy'}:d.energy<25?{text:'想休息',cls:'tired'}:d.hunger<30?{text:'有点饿',cls:''}:{text:'状态良好',cls:''};
  const di=d.daily_interactions||{};
  const totalExp=d.exp||0;
  const lv=pLevelFromExp(totalExp);
  const lvStart=pExpForLevel(lv);
  const lvNext=pExpForLevel(lv+1);
  const expPct=lvNext>lvStart?Math.round((totalExp-lvStart)/(lvNext-lvStart)*100):100;
  const ic=d.interaction_counts||{};
  const spriteUrl=partnerSpriteUrl(d.pkm_id);
  const primaryType=d.primary_type||d.types?.[0]||'normal';
  const typeBg=pPartnerTypeBg(primaryType);
  const action=d.last_action||'';
  const actionCls=action?` action-${action}`:'';
  const effectImg=pPartnerEffectImg(action);
  pPreloadPartnerImage(typeBg);
  if(action)pPreloadPartnerImage(effectImg);

  document.getElementById('partner-container').innerHTML=`
    <div class="partner-layout partner-type-${primaryType}">
      <div class="partner-card">
        <div class="partner-sprite-area" style="--partner-type-bg:url('${typeBg}')">
          <div class="partner-sprite-bg"></div>
          <div class="partner-effect-burst ${actionCls}" style="background-image:url('${effectImg}')"></div>
          <div class="partner-model-stage" id="partner-model-stage">
            <div class="partner-model-shadow"></div>
            <div class="partner-model-object" id="partner-model-object">
              <img id="partner-sprite" class="partner-sprite partner-sprite-3d ${moodAnim}${actionCls}" src="${spriteUrl}" alt="${pEsc(name)}" draggable="false" onerror="this.onerror=null;this.src='${partnerSpriteFallbackUrl(d.pkm_id)}'">
            </div>
          </div>
          <div class="partner-mood-badge ${moodBadge.cls}">${moodBadge.text}</div>
          <div class="partner-type-chip">${PARTNER_TYPE_ZH[primaryType]||primaryType}</div>
        </div>
        <div class="partner-body">
          <div class="partner-identity">
            <div class="partner-nickname">
              <span id="partner-nickname-text">${pEsc(name)}</span>
              <button class="partner-edit-name-btn" onclick="togglePartnerNicknameEdit()">改名</button>
            </div>
            <div id="partner-nickname-edit-wrap" style="display:none" class="partner-nickname-edit">
              <input class="partner-nickname-inp" id="partner-nickname-inp" maxlength="12" placeholder="${pEsc(d.pkm_name)}" value="${pEsc(d.nickname||'')}">
              <button class="btn btn-sm" onclick="savePartnerNickname()">保存</button>
              <button class="btn btn-sm" onclick="togglePartnerNicknameEdit()">取消</button>
            </div>
            <div class="partner-species-row">#${String(d.pkm_id).padStart(4,'0')} · ${pEsc(d.pkm_name)}</div>
            <div class="partner-level-row">
              <span class="partner-level-badge">Lv.${lv}</span>
              <div class="partner-exp-bar"><div class="partner-exp-fill" style="width:${expPct}%"></div></div>
              <span class="partner-exp-label">${totalExp-lvStart}/${lvNext-lvStart}</span>
            </div>
            <div class="partner-status-text">${pGetStatusText()}</div>
          </div>
          <div class="partner-stats">
            ${pStatBar('饱食','hunger',d.hunger,'#F08030')}
            ${pStatBar('心情','mood',d.mood,'#ff80ab')}
            ${pStatBar('精力','energy',d.energy,'#78C850')}
            ${pStatBar('亲密','bond',d.bond,'#A890F0')}
          </div>
          <div class="partner-actions">
            ${Object.entries(PARTNER_ACTIONS).map(([type,cfg])=>{
              const cnt=di[type]||0;
              const rem=PARTNER_DAILY_LIMIT-cnt;
              return`<button class="partner-act-btn" onclick="doPartnerInteraction('${type}')" ${rem<=0?'disabled':''}>
                <span class="act-label">${cfg.icon} ${cfg.label}</span>
                <span class="act-count">${rem}/${PARTNER_DAILY_LIMIT}</span>
              </button>`;
            }).join('')}
          </div>
          <button class="partner-chat-btn" onclick="setPartnerConsolePanel('chat')">⬡ 和${pEsc(name)}聊天</button>
          <button class="partner-change-btn" onclick="openPartnerSelect()">更换伙伴</button>
        </div>
      </div>
      <div class="partner-right">
        ${pRenderPartnerConsole()}
      </div>
    </div>`;
  updatePartnerFloat('partner');
  initPartnerModelDrag();
}

function pStatBar(label,key,val,color){
  const c=val>=60?color:val>=30?'var(--warn)':'var(--danger)';
  return`<div class="partner-stat-row">
    <span class="partner-stat-lbl">${label}</span>
    <div class="partner-stat-bar"><div class="partner-stat-fill" style="width:${val}%;background:${c}"></div></div>
    <span class="partner-stat-val">${val}</span>
  </div>`;
}

function setPartnerConsolePanel(panel){
  partnerConsolePanel=panel||'overview';
  renderPartnerPage();
  if(partnerConsolePanel==='chat'&&partnerChatHistory.length===0)setTimeout(autoPartnerGreet,200);
  if(partnerConsolePanel==='encounter')setTimeout(_fillEncounterPanelName,80);
}

function pRenderPartnerConsole(){
  const d=partnerData;
  const di=d.daily_interactions||{};
  const doneCount=DAILY_TASKS.filter(t=>t.check(di)).length;
  const inv=d.inventory||{};
  const itemCount=Object.keys(PARTNER_ITEMS).reduce((s,k)=>s+(inv[k]||0),0);
  const rosterCount=pPartnerRoster().length;
  const diaryCount=(d.diary||[]).length;
  const stage=pGetBondStage();
  const panels=[
    {id:'tasks',title:'今日任务',sub:'Daily Route',metric:`${doneCount}/${DAILY_TASKS.length}`,accent:'#7ecdc4',body:pRenderTasks()},
    {id:'inventory',title:'背包道具',sub:'Inventory',metric:`${itemCount} 件`,accent:'#c89040',body:pRenderInventory()},
    {id:'roster',title:'伙伴清单',sub:'Roster',metric:`${rosterCount}/12`,accent:'#5ab89a',body:pRenderRoster()},
    {id:'diary',title:'伙伴日记',sub:'Memory Log',metric:String(diaryCount),accent:'#9b8cff',body:pRenderDiary()},
    {id:'profile',title:'伙伴档案',sub:'Profile',metric:stage.name,accent:'#ff80ab',body:pRenderProfile()},
    {id:'chat',title:'伙伴通讯',sub:'Talk',metric:'AI',accent:'#7ecdc4',body:pRenderChatHTML(true)},
    {id:'encounter',title:'缘遇探索',sub:'Wild Encounter',metric:'每日邂逅',accent:'#56c97a',body:pRenderEncounterPanel()},
  ];
  const active=panels.find(p=>p.id===partnerConsolePanel)||panels[0];
  const isFlipped=partnerConsolePanel!=='overview';
  const cards=panels.map(p=>`<button class="partner-console-card" style="--pbox-accent:${p.accent}" onclick="setPartnerConsolePanel('${p.id}')">
    <span class="partner-console-kicker">${p.sub}</span>
    <b>${p.title}</b>
    <i>${p.metric}</i>
  </button>`).join('');
  return`<div class="partner-console ${isFlipped?'is-flipped':''}">
    <div class="partner-console-inner">
      <div class="partner-console-face partner-console-front">
        <div class="partner-console-head">
          <span><b>伙伴终端</b><em>选择一个栏目查看详情</em></span>
          <i>${pEsc(d.nickname||d.pkm_name)}</i>
        </div>
        <div class="partner-console-grid">${cards}</div>
      </div>
      <div class="partner-console-face partner-console-back">
        <div class="partner-console-detail-head">
          <button class="partner-console-back-btn" onclick="setPartnerConsolePanel('overview')">返回</button>
          <span><b>${active.title}</b><em>${active.sub}</em></span>
          <i style="--pbox-accent:${active.accent}">${active.metric}</i>
        </div>
        <div class="partner-console-detail">${active.body}</div>
      </div>
    </div>
  </div>`;
}

function pRenderTasks(){
  const di=partnerData.daily_interactions||{};
  const doneCount=DAILY_TASKS.filter(t=>t.check(di)).length;
  const pct=Math.round(doneCount/DAILY_TASKS.length*100);
  const rows=DAILY_TASKS.map(t=>{
    const done=t.check(di);
    return`<div class="partner-task ${done?'done':''}">
      <span class="partner-task-icon">${done?'✓':'○'}</span>
      <span class="partner-task-text">${t.text}</span>
      <span class="partner-task-reward">${done?'已完成':t.reward}</span>
    </div>`;
  }).join('');
  return`<div class="partner-box partner-task-box">
    <div class="partner-box-hdr"><span><b>今日任务</b><em>Daily Route</em></span><i>${doneCount}/${DAILY_TASKS.length}</i></div>
    <div class="partner-section-meter"><div style="width:${pct}%"></div></div>
    <div class="partner-task-list">${rows}</div>
  </div>`;
}

function pRenderInventory(){
  const inv=partnerData.inventory||{};
  const total=Object.keys(PARTNER_ITEMS).reduce((s,k)=>s+(inv[k]||0),0);
  const ownedItems=Object.entries(PARTNER_ITEMS).filter(([key])=>(inv[key]||0)>0);
  const items=ownedItems.length?ownedItems.map(([key,item])=>{
    const cnt=inv[key]||0;
    return`<div class="partner-item" onclick="usePartnerItem('${key}')" title="${item.desc}">
      <span class="partner-item-icon">${item.icon}</span>
      <div class="partner-item-name">${item.name}</div>
      <div class="partner-item-count">×${cnt}</div>
      <div class="partner-item-desc">${item.desc}</div>
    </div>`;
  }).join(''):`<div class="partner-empty-line">背包暂时空着，完成每日任务会获得道具。</div>`;
  return`<div class="partner-box partner-inventory-box">
    <div class="partner-box-hdr"><span><b>背包道具</b><em>Inventory</em></span><i>${total} 件</i></div>
    <div class="partner-bag-grid">${items}</div>
  </div>`;
}

function pRenderDiary(){
  const diary=partnerData.diary||[];
  const recent=[...diary].reverse().slice(0,5);
  const rows=recent.length?recent.map(e=>`
    <div class="partner-diary-entry">
      <div class="partner-diary-date">${e.date||''}</div>
      <div class="partner-diary-text">${pEsc(e.text||'')}</div>
    </div>`).join(''):`<div style="text-align:center;padding:1rem;color:var(--t3);font-size:.77rem">还没有日记，快去互动吧～</div>`;
  return`<div class="partner-box partner-diary-box">
    <div class="partner-box-hdr"><span><b>伙伴日记</b><em>Memory Log</em></span><i>${diary.length}</i></div>
    <div class="partner-diary-list">${rows}</div>
  </div>`;
}

function pRenderRoster(){
  const roster=pPartnerRoster();
  const rows=roster.length?roster.map(r=>{
    const active=Number(r.pkm_id)===Number(partnerData.pkm_id);
    const lv=pLevelFromExp(r.exp||0);
    const type=r.primary_type||r.types?.[0]||'normal';
    return`<div class="partner-roster-item ${active?'active':''}" onclick="${active?'':'switchPartnerFromRoster('+r.pkm_id+')'}">
      <img src="${partnerSpriteUrl(r.pkm_id)}" alt="${pEsc(r.pkm_name)}" onerror="this.onerror=null;this.src='${partnerSpriteFallbackUrl(r.pkm_id)}'">
      <div class="partner-roster-main">
        <div class="partner-roster-name">${pEsc(r.nickname||r.pkm_name)}</div>
        <div class="partner-roster-meta">#${String(r.pkm_id).padStart(4,'0')} · Lv.${lv} · ${PARTNER_TYPE_ZH[type]||type}</div>
      </div>
      <div class="partner-roster-bond">${r.bond||0}</div>
    </div>`;
  }).join(''):`<div class="partner-roster-empty">
    <img src="${PARTNER_ASSET_BASE}/partner-empty-roster.png" alt="">
    <span>还没有历史伙伴</span>
  </div>`;
  return`<div class="partner-box partner-roster-box">
    <div class="partner-box-hdr"><span><b>伙伴清单</b><em>Roster</em></span><i>${roster.length}/12</i></div>
    <div class="partner-roster-list">${rows}</div>
  </div>`;
}

function pRenderProfile(){
  const d=partnerData;
  const stage=pGetBondStage();
  const ic=d.interaction_counts||{};
  const unlocked=(d.achievements||[]);
  const achHTML=unlocked.length?PARTNER_ACHIEVEMENTS.filter(a=>unlocked.includes(a.id)).map(a=>`<span class="partner-badge">${a.icon} ${a.name}</span>`).join(''):`<span style="font-size:.73rem;color:var(--t3)">暂无成就，继续互动解锁</span>`;
  return`<div class="partner-box partner-profile-box">
    <div class="partner-box-hdr"><span><b>伙伴档案</b><em>Profile</em></span><i>${stage.name}</i></div>
    <div class="partner-profile-grid">
      <div class="partner-profile-stat"><div class="partner-profile-val">${d.streak_days||1}</div><div class="partner-profile-lbl">连续陪伴天</div></div>
      <div class="partner-profile-stat"><div class="partner-profile-val">${ic.total||0}</div><div class="partner-profile-lbl">总互动次数</div></div>
    </div>
    <div class="partner-bond-bar">
      <div class="partner-bond-stage"><span>亲密阶段</span><span class="partner-bond-stage-name">${stage.name}</span></div>
      <div class="partner-bond-bar-wrap"><div class="partner-bond-fill" style="width:${d.bond}%"></div></div>
      <div class="partner-bond-desc">${stage.desc}</div>
    </div>
    <div class="partner-sub-hdr">成就徽章</div>
    <div class="partner-achievements">${achHTML}</div>
  </div>`;
}

function pRenderChatHTML(visible=false){
  const name=partnerData?(partnerData.nickname||partnerData.pkm_name):'伙伴';
  return`<div class="partner-chat-area partner-box" id="partner-chat-area" style="padding:0;display:${visible?'block':'none'}">
    <div class="partner-chat-hdr">
      <div class="partner-chat-title"><div class="ai-pulse"></div>和${pEsc(name)}聊天</div>
      <button class="btn btn-sm" onclick="setPartnerConsolePanel('overview')">✕</button>
    </div>
    <div class="partner-chat-msgs" id="partner-chat-msgs"></div>
    <div class="partner-chat-quick">
      <button class="sum-btn" style="font-size:.68rem;padding:3px 9px" onclick="sendPartnerQuick('今天推荐我做什么？')">今日推荐</button>
      <button class="sum-btn" style="font-size:.68rem;padding:3px 9px" onclick="sendPartnerQuick('你现在心情怎么样？')">问心情</button>
      <button class="sum-btn" style="font-size:.68rem;padding:3px 9px" onclick="sendPartnerQuick('帮我总结今天吧')">今日总结</button>
      <button class="sum-btn" style="font-size:.68rem;padding:3px 9px" onclick="generatePartnerDiary()">生成日记</button>
    </div>
    <div class="partner-chat-inp-row">
      <input class="partner-chat-inp" id="partner-chat-inp" placeholder="和${pEsc(name)}聊聊…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendPartnerChatMsg();}">
      <button class="partner-chat-snd" id="partner-chat-snd" onclick="sendPartnerChatMsg()">发送</button>
    </div>
  </div>`;
}

/* ===== INTERACTIONS ===== */
async function doPartnerInteraction(type){
  if(!partnerData)return;
  const cfg=PARTNER_ACTIONS[type];
  if(!cfg)return;
  const di=partnerData.daily_interactions||{};
  if((di[type]||0)>=PARTNER_DAILY_LIMIT){showPartnerToast('今天这个互动已到上限了～');return;}

  const prevExp=partnerData.exp||0;
  if(cfg.hunger) partnerData.hunger=pClamp(partnerData.hunger+cfg.hunger);
  if(cfg.mood)   partnerData.mood=pClamp(partnerData.mood+cfg.mood);
  if(cfg.energy) partnerData.energy=pClamp(partnerData.energy+cfg.energy);
  if(cfg.bond)   partnerData.bond=pClamp(partnerData.bond+cfg.bond);
  if(cfg.exp)    partnerData.exp=(partnerData.exp||0)+cfg.exp;

  partnerData.daily_interactions={...di,date:pToday(),[type]:(di[type]||0)+1,total:(di.total||0)+1};
  const ic=partnerData.interaction_counts||{};
  partnerData.interaction_counts={...ic,[type]:(ic[type]||0)+1,total:(ic.total||0)+1};
  partnerData.last_interaction_at=new Date().toISOString();
  partnerData.last_action=type;
  if(window.addAffinityProgress)window.addAffinityProgress('interact');

  const newLv=pLevelFromExp(partnerData.exp);
  const oldLv=pLevelFromExp(prevExp);

  const msgs=PARTNER_FEEDBACK[type]||[n=>`${n}完成了${cfg.label}。`];
  const msg=msgs[Math.floor(Math.random()*msgs.length)](partnerData.nickname||partnerData.pkm_name);
  pAddDiary(msg);
  pCheckAchievements();
  pCheckTaskRewards();
  await savePartnerData();
  renderPartnerPage();
  showPartnerToast(`<span class="partner-toast-name">${pEsc(partnerData.nickname||partnerData.pkm_name)}</span>　${msg}`);
  if(newLv>oldLv) setTimeout(()=>showPartnerToast(`🎉 升级了！现在是 Lv.${newLv}！`),1400);
}

/* ===== ITEMS ===== */
async function usePartnerItem(itemType){
  if(!partnerData)return;
  const item=PARTNER_ITEMS[itemType];
  if(!item)return;
  const inv=partnerData.inventory||{};
  if((inv[itemType]||0)<=0)return;
  inv[itemType]--;
  partnerData.inventory=inv;
  if(item.effect.hunger) partnerData.hunger=pClamp(partnerData.hunger+item.effect.hunger);
  if(item.effect.mood)   partnerData.mood=pClamp(partnerData.mood+item.effect.mood);
  if(item.effect.energy) partnerData.energy=pClamp(partnerData.energy+item.effect.energy);
  if(item.effect.bond)   partnerData.bond=pClamp(partnerData.bond+item.effect.bond);
  if(item.effect.exp)    partnerData.exp=(partnerData.exp||0)+item.effect.exp;
  partnerData.last_interaction_at=new Date().toISOString();
  partnerData.last_action=itemType==='toy'?'play':'feed';
  pAddDiary(`使用了${item.name}，${partnerData.nickname||partnerData.pkm_name}感觉不错。`);
  pCheckAchievements();
  await savePartnerData();
  renderPartnerPage();
  showPartnerToast(`使用了 ${item.icon} ${item.name}！${item.desc}`);
}

/* ===== PARTNER SELECTION ===== */
async function openPartnerSelect(){
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){go('auth',null);return;}
  document.getElementById('ov-partner-select').classList.add('on');
  const grid=document.getElementById('partner-select-grid');
  grid.innerHTML='<div style="text-align:center;padding:2rem;color:var(--t3)">加载中…</div>';
  const{data:col}=await db.from('pkm_collection').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false});
  if(!col||col.length===0){
    grid.innerHTML='<div style="text-align:center;padding:2rem;color:var(--t3)">还没有捕获或喜欢的宝可梦，先去宝可梦页面记录一些吧～</div>';
    return;
  }
  const seen=new Set();
  const unique=col.filter(c=>{if(seen.has(c.pkm_id))return false;seen.add(c.pkm_id);return true;});
  const statusLabel={caught:'已捕获',liked:'喜欢',wanted:'想要'};
  grid.innerHTML=unique.map(c=>`
    <div class="partner-select-item" data-id="${c.pkm_id}" data-name="${pEsc(c.pkm_name)}" onclick="selectPartner(${c.pkm_id},this.dataset.name)">
      <img src="${partnerSpriteUrl(c.pkm_id)}" alt="${pEsc(c.pkm_name)}" onerror="this.onerror=null;this.src='${partnerSpriteFallbackUrl(c.pkm_id)}'">
      <div class="partner-select-name">${pEsc(c.pkm_name)}</div>
      <div class="partner-select-num">#${String(c.pkm_id).padStart(4,'0')}</div>
      <div class="partner-select-status">${statusLabel[c.status]||c.status}</div>
    </div>`).join('');
  // 后台校正中文名（统一走官方 JSON，不依赖 PKM_CN_TABLE）
  unique.forEach(async c=>{
    const cn=await pFetchChineseName(c.pkm_id,c.pkm_name);
    if(cn===c.pkm_name)return;
    const el=grid.querySelector(`.partner-select-item[data-id="${c.pkm_id}"]`);
    if(!el)return;
    el.dataset.name=cn;
    const nameEl=el.querySelector('.partner-select-name');
    if(nameEl)nameEl.textContent=cn;
  });
}

async function selectPartner(pkmId,pkmName){
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user)return;
  // 确保用中文名
  const cnName=await pFetchChineseName(pkmId,pkmName);
  const prevRoster=partnerData?pUpsertRosterSnapshot(pGetStoredRoster(),pPartnerSnapshot(partnerData),partnerData.pkm_id):[];
  const saved=prevRoster.find(x=>Number(x.pkm_id)===Number(pkmId));
  const meta=await pFetchPokemonMeta(pkmId).catch(()=>null);
  closeOv('ov-partner-select');
  const today=pToday();
  const base=saved||{};
  const rec={
    user_id:session.user.id,
    pkm_id:pkmId,pkm_name:cnName,nickname:null,
    ...base,
    pkm_id:pkmId,pkm_name:cnName,
    nickname:base.nickname||null,
    level:base.level||1,exp:base.exp||0,hunger:base.hunger??80,mood:base.mood??75,energy:base.energy??80,bond:base.bond||0,
    last_interaction_at:base.last_interaction_at||new Date().toISOString(),
    streak_days:base.streak_days||1,last_checkin_date:base.last_checkin_date||today,
    inventory:{...pCleanInventory(base.inventory||{berry:3,poffin:1,cube:0,drink:0,toy:0}),_partner_roster:prevRoster},
    diary:base.diary||[{date:today,text:`你和${cnName}第一次相遇了！一段新的旅程开始了。`}],
    daily_interactions:base.daily_interactions||{date:today,total:0},
    interaction_counts:base.interaction_counts||{feed:0,pat:0,play:0,train:0,rest:0,adventure:0,total:0},
    achievements:base.achievements||['first_meet'],
    types:meta?.types||base.types||[],
    primary_type:meta?.types?.[0]||base.primary_type||base.types?.[0]||'normal',
    last_action:saved?'bond':'',
    created_at:new Date().toISOString(),updated_at:new Date().toISOString()
  };
  rec.inventory._partner_roster=pUpsertRosterSnapshot(prevRoster,pPartnerSnapshot(rec),pkmId);
  const{data,error}=await db.from('pkm_partner').upsert(pPartnerDbPayload(rec,session.user.id),{onConflict:'user_id'}).select().single();
  if(error){showPartnerToast('保存失败：'+error.message);return;}
  partnerData={...(data||rec),types:rec.types,primary_type:rec.primary_type,last_action:rec.last_action};
  renderPartnerPage();
  showPartnerToast(saved?`${cnName} 回到了伙伴位！`:`🎉 ${cnName} 成为了你的伙伴！`);
}

async function switchPartnerFromRoster(pkmId){
  const roster=pPartnerRoster();
  const item=roster.find(x=>Number(x.pkm_id)===Number(pkmId));
  if(!item)return;
  await selectPartner(item.pkm_id,item.pkm_name);
}

async function pFetchChineseName(pkmId,fallback){
  try{
    // 1. 官方图鉴 JSON（pokedex_zh_official.json），与 PKM_CN_TABLE 完全无关
    if(typeof getOfficialDexName==='function'){
      const official=await getOfficialDexName(pkmId);
      if(official)return official;
    }
    // 2. PokeAPI zh-Hans（官方简体）
    const r=await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pkmId}`);
    if(!r.ok)return fallback;
    const sp=await r.json();
    const zh=sp.names?.find(n=>n.language.name==='zh-Hans');
    return zh?.name||fallback;
  }catch{return fallback;}
}

/* ===== NICKNAME ===== */
function togglePartnerNicknameEdit(){
  const wrap=document.getElementById('partner-nickname-edit-wrap');
  if(!wrap)return;
  const visible=wrap.style.display!=='none';
  wrap.style.display=visible?'none':'flex';
  if(!visible)document.getElementById('partner-nickname-inp')?.focus();
}

async function savePartnerNickname(){
  const inp=document.getElementById('partner-nickname-inp');
  if(!inp||!partnerData)return;
  partnerData.nickname=inp.value.trim().slice(0,12)||null;
  await savePartnerData();
  renderPartnerPage();
}

/* ===== STATUS HELPERS ===== */
function pGetBondStage(){
  const bond=partnerData?.bond||0;
  return BOND_STAGES.find(s=>bond>=s.min&&bond<=s.max)||BOND_STAGES[0];
}

function pGetStatusText(){
  if(!partnerData)return'';
  const{hunger,mood,energy,bond}=partnerData;
  const name=partnerData.nickname||partnerData.pkm_name;
  if(hunger<30)return`${name}有点饿了，快喂它吃点东西吧。`;
  if(energy<25)return`${name}看起来有点累，需要休息一下。`;
  if(mood>80)return`${name}非常开心，心情超好！`;
  if(bond>70)return`${name}很信任你，一直待在你身边。`;
  const diff=Date.now()-new Date(partnerData.last_interaction_at||Date.now()).getTime();
  if(diff>3600000*4)return`${name}有点想你了，快来互动吧～`;
  return`${name}状态不错，精力充沛。`;
}

/* ===== DIARY ===== */
function pAddDiary(text){
  if(!partnerData)return;
  const diary=partnerData.diary||[];
  diary.push({date:pToday(),text});
  if(diary.length>30)diary.splice(0,diary.length-30);
  partnerData.diary=diary;
}

/* ===== ACHIEVEMENTS ===== */
function pCheckAchievements(){
  if(!partnerData)return;
  const have=new Set(partnerData.achievements||[]);
  const ic=partnerData.interaction_counts||{};
  if(!have.has('first_feed')&&(ic.feed||0)>=1)have.add('first_feed');
  if(!have.has('bond_50')&&partnerData.bond>=50)have.add('bond_50');
  if(!have.has('bond_100')&&partnerData.bond>=100)have.add('bond_100');
  if(!have.has('train_10')&&(ic.train||0)>=10)have.add('train_10');
  if(!have.has('lv10')&&pLevelFromExp(partnerData.exp||0)>=10)have.add('lv10');
  if(!have.has('streak_7')&&(partnerData.streak_days||1)>=7)have.add('streak_7');
  if(!have.has('adventure_5')&&(ic.adventure||0)>=5)have.add('adventure_5');
  partnerData.achievements=[...have];
}

/* ===== TASK REWARDS ===== */
function pCheckTaskRewards(){
  if(!partnerData)return;
  const di=partnerData.daily_interactions||{};
  if(!di._interact3_rewarded&&(di.total||0)>=3){
    di._interact3_rewarded=true;
    partnerData.bond=pClamp(partnerData.bond+3);
    partnerData.daily_interactions=di;
  }
}

/* ===== EXTERNAL EVENT TRACKING ===== */
window.partnerTrackEvent=function(eventType){
  if(!partnerData)return;
  const di=partnerData.daily_interactions||{};
  if(di.date!==pToday())return;
  let changed=false;
  if(eventType==='pokedex_view'&&!di.pokedex_view){
    di.pokedex_view=true;
    partnerData.inventory=partnerData.inventory||{};
    partnerData.inventory.berry=(partnerData.inventory.berry||0)+1;
    changed=true;
  } else if(eventType==='game_log'&&!di.game_log){
    di.game_log=true;
    partnerData.inventory=partnerData.inventory||{};
    partnerData.inventory.poffin=(partnerData.inventory.poffin||0)+1;
    changed=true;
  } else if(eventType==='battle_analysis'&&!di.battle_analysis){
    di.battle_analysis=true;
    partnerData.exp=(partnerData.exp||0)+10;
    changed=true;
  } else if(eventType==='media_add'&&!di.media_add){
    di.media_add=true;
    partnerData.mood=pClamp(partnerData.mood+5);
    changed=true;
  }
  if(changed){partnerData.daily_interactions=di;savePartnerData();}
};

window.partnerTrackTrainingSession=function(summary){
  if(!partnerData||!summary||!summary.beats)return '';
  const prevExp=partnerData.exp||0;
  const beats=Math.max(0,Number(summary.beats)||0);
  const expGain=Math.min(45,8+Math.floor(beats*1.6));
  const bondGain=Math.min(5,1+Math.floor(beats/8));
  const moodGain=Math.min(8,Math.floor(beats/3));
  const energyCost=Math.min(18,6+Math.floor(beats/3));
  const hungerCost=Math.min(12,4+Math.floor(beats/5));
  const name=partnerData.nickname||partnerData.pkm_name;
  const defeated=(summary.top&&summary.top.length)?summary.top.join('、'):'几只宝可梦';

  partnerData.exp=(partnerData.exp||0)+expGain;
  partnerData.bond=pClamp((partnerData.bond||0)+bondGain);
  partnerData.mood=pClamp((partnerData.mood||0)+moodGain);
  partnerData.energy=pClamp((partnerData.energy||0)-energyCost);
  partnerData.hunger=pClamp((partnerData.hunger||0)-hungerCost);
  partnerData.last_interaction_at=new Date().toISOString();
  partnerData.last_action='train';

  const di=partnerData.daily_interactions||{};
  partnerData.daily_interactions={...di,date:pToday(),train_session:(di.train_session||0)+1,total:(di.total||0)+1};
  const ic=partnerData.interaction_counts||{};
  partnerData.interaction_counts={...ic,train:(ic.train||0)+1,total:(ic.total||0)+1};

  const diary=`${name}陪你完成沉浸式训练：${summary.loc||'训练点'}，${summary.target||'训练对象'}击败${beats}只，打过${defeated}。`;
  pAddDiary(diary.slice(0,180));
  pCheckAchievements();
  pCheckTaskRewards();
  savePartnerData().then(()=>{
    renderPartnerPage();
    updatePartnerFloat();
  });
  const newLv=pLevelFromExp(partnerData.exp);
  const oldLv=pLevelFromExp(prevExp);
  showPartnerToast(`<span class="partner-toast-name">${pEsc(name)}</span> 训练同步：EXP +${expGain}，亲密 +${bondGain}`);
  if(newLv>oldLv) setTimeout(()=>showPartnerToast(`🎉 ${pEsc(name)} 升级了！现在是 Lv.${newLv}！`),1200);
  return `${name} 获得 EXP +${expGain} / 亲密 +${bondGain}`;
};

/* ===== AI CHAT ===== */
function togglePartnerChat(){
  setPartnerConsolePanel(partnerConsolePanel==='chat'?'overview':'chat');
}

async function autoPartnerGreet(){
  if(!partnerData)return;
  const sys=pBuildSysPrompt();
  const name=partnerData.nickname||partnerData.pkm_name;
  const prompt=`用${name}的口吻，根据当前状态（饱食度${partnerData.hunger}，心情${partnerData.mood}，精力${partnerData.energy}），说一句打招呼的话。20字以内，亲切自然，不加任何前缀。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:80,temperature:1.1}})});
    const j=await res.json();
    const reply=j?.candidates?.[0]?.content?.parts?.[0]?.text||'';
    if(reply){addPartnerBubble(reply.trim(),'ai');partnerChatHistory=[{role:'model',parts:[{text:reply}]}];}
  }catch(e){}
}

async function sendPartnerChatMsg(){
  const inp=document.getElementById('partner-chat-inp');
  const snd=document.getElementById('partner-chat-snd');
  if(!inp||!snd||partnerChatLoading)return;
  const text=inp.value.trim();
  if(!text)return;
  inp.value='';
  addPartnerBubble(text,'user');
  partnerChatHistory.push({role:'user',parts:[{text}]});
  snd.disabled=true;partnerChatLoading=true;
  const thinking=addPartnerBubble('…','ai','partner-chat-thinking');
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({system_instruction:{parts:[{text:pBuildSysPrompt()}]},contents:partnerChatHistory,generationConfig:{maxOutputTokens:300,temperature:1.0}})});
    const j=await res.json();
    const reply=j?.candidates?.[0]?.content?.parts?.[0]?.text||'…（对方好像走神了）';
    thinking?.remove();
    addPartnerBubble(reply.trim(),'ai');
    partnerChatHistory.push({role:'model',parts:[{text:reply}]});
    if(partnerChatHistory.length>20)partnerChatHistory=partnerChatHistory.slice(-20);
  }catch(e){thinking?.remove();addPartnerBubble('连接出错了，稍后再试吧。','ai');}
  snd.disabled=false;partnerChatLoading=false;
}

async function sendPartnerQuick(text){
  const inp=document.getElementById('partner-chat-inp');
  if(inp){inp.value=text;await sendPartnerChatMsg();}
}

async function generatePartnerDiary(){
  if(!partnerData)return;
  const di=partnerData.daily_interactions||{};
  const name=partnerData.nickname||partnerData.pkm_name;
  const prompt=`以宝可梦伙伴${name}的视角，生成今天的日记，约60字。数据：互动${di.total||0}次，心情${partnerData.mood}/100，亲密度${partnerData.bond}/100，查看图鉴${di.pokedex_view?'是':'否'}，写游戏日志${di.game_log?'是':'否'}。中文，温暖自然，不加标题。`;
  const thinking=addPartnerBubble('正在生成今日日记…','ai','partner-chat-thinking');
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:200,temperature:0.9}})});
    const j=await res.json();
    const reply=j?.candidates?.[0]?.content?.parts?.[0]?.text||'';
    thinking?.remove();
    if(reply){addPartnerBubble(reply.trim(),'ai');pAddDiary(reply.trim().slice(0,200));savePartnerData();}
  }catch(e){thinking?.remove();addPartnerBubble('生成失败，稍后再试。','ai');}
}

function pBuildSysPrompt(){
  if(!partnerData)return'';
  const name=partnerData.nickname||partnerData.pkm_name;
  const stage=pGetBondStage();
  const lv=pLevelFromExp(partnerData.exp||0);
  return`你扮演宝可梦${name}（物种：${partnerData.pkm_name}），是用户的电子伙伴。关系阶段："${stage.name}"（亲密度${partnerData.bond}/100）。当前状态：饱食度${partnerData.hunger}/100，心情${partnerData.mood}/100，精力${partnerData.energy}/100，Lv.${lv}。对话要求：用第一人称和宝可梦视角；根据亲密度调整亲密感；不超过80字；中文；偶尔展现物种特性；不加任何前缀标签。`;
}

function addPartnerBubble(text,role,cls=''){
  const msgs=document.getElementById('partner-chat-msgs');
  if(!msgs)return null;
  const div=document.createElement('div');
  div.className=`partner-bubble ${role} ${cls}`;
  div.textContent=text;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
  return div;
}

/* ===== 3D PARTNER STAGE ===== */
function initPartnerModelDrag(){
  const stage=document.getElementById('partner-model-stage');
  if(!stage)return;
  let rotX=-8;
  let rotY=0;
  let dragging=false;
  let lastX=0;
  let lastY=0;
  const apply=()=>{
    stage.style.setProperty('--partner-rot-x',`${rotX}deg`);
    stage.style.setProperty('--partner-rot-y',`${rotY}deg`);
  };
  const endDrag=()=>{
    dragging=false;
    stage.classList.remove('dragging');
  };
  apply();
  stage.addEventListener('pointerdown',e=>{
    dragging=true;
    lastX=e.clientX;
    lastY=e.clientY;
    stage.classList.add('dragging');
    stage.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  });
  stage.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const dx=e.clientX-lastX;
    const dy=e.clientY-lastY;
    lastX=e.clientX;
    lastY=e.clientY;
    rotY+=dx*0.42;
    rotX=pClampModelRot(rotX-dy*0.28,-28,18);
    apply();
  });
  stage.addEventListener('pointerup',endDrag);
  stage.addEventListener('pointercancel',endDrag);
  stage.addEventListener('dblclick',()=>{
    rotX=-8;
    rotY=0;
    apply();
  });
}

function pClampModelRot(v,min,max){
  return Math.max(min,Math.min(max,v));
}

/* ===== UTILS ===== */
function partnerSpriteUrl(pkmId){
  const en=partnerTypeCache[pkmId]?.apiName;
  if(en)return`https://play.pokemonshowdown.com/sprites/ani/${en}.gif`;
  if(pkmId<=649)
    return`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pkmId}.gif`;
  return`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmId}.png`;
}
function partnerSpriteFallbackUrl(pkmId){
  if(pkmId<=649)
    return`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pkmId}.gif`;
  return partnerSpriteStatic(pkmId);
}
function partnerSpriteStatic(pkmId){
  return`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmId}.png`;
}

let _pToastT=null;
function showPartnerToast(html){
  let t=document.getElementById('partner-toast');
  if(!t){t=document.createElement('div');t.id='partner-toast';t.className='partner-toast';document.body.appendChild(t);}
  t.innerHTML=html;t.classList.add('on');
  clearTimeout(_pToastT);_pToastT=setTimeout(()=>t.classList.remove('on'),3200);
}

function pEsc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* ===== FLOATING WIDGET ===== */
function updatePartnerFloat(activePg){
  let w=document.getElementById('pflt');
  if(!partnerData){
    if(w)w.classList.add('hidden');
    return;
  }
  if(!w){
    w=document.createElement('div');
    w.id='pflt';
    w.className='pflt';
    w.title='前往伙伴页';
    w.onclick=()=>{
      const btn=Array.from(document.querySelectorAll('nav button')).find(b=>b.textContent.trim()==='伙伴');
      if(btn)btn.click();
    };
    w.innerHTML=`<div class="pflt-orb"><img class="pflt-spr" id="pflt-spr" src="" alt=""><div class="pflt-dot" id="pflt-dot"></div></div>
      <div class="pflt-info">
        <div class="pflt-top"><span class="pflt-nm" id="pflt-nm"></span><span class="pflt-lv" id="pflt-lv"></span></div>
        <div class="pflt-st" id="pflt-st"></div>
        <div class="pflt-bars">
          <span class="pflt-bar"><i id="pflt-mood"></i></span>
          <span class="pflt-bar"><i id="pflt-energy"></i></span>
          <span class="pflt-bar"><i id="pflt-bond"></i></span>
        </div>
      </div>
      <div class="pflt-go">›</div>`;
    document.body.appendChild(w);
  }
  w.classList.remove('hidden');
  const d=partnerData;
  const spr=document.getElementById('pflt-spr');
  const newSrc=partnerSpriteUrl(d.pkm_id);
  if(spr.getAttribute('data-src')!==newSrc){
    spr.setAttribute('data-src',newSrc);
    spr.src=newSrc;
    spr.onerror=()=>{spr.onerror=null;spr.src=partnerSpriteFallbackUrl(d.pkm_id);};
  }
  const moodCls=d.mood>75?'excited':d.energy<25?'tired':'';
  spr.className='pflt-spr'+(moodCls?' '+moodCls:'');
  document.getElementById('pflt-nm').textContent=d.nickname||d.pkm_name;
  const needsAttn=d.hunger<30||d.mood<30||d.energy<25;
  const neglected=Date.now()-new Date(d.last_interaction_at||Date.now()).getTime()>3600000*4;
  const lv=pLevelFromExp(d.exp||0);
  const stage=pGetBondStage();
  document.getElementById('pflt-lv').textContent=`Lv.${lv}`;
  document.getElementById('pflt-st').textContent=`${stage.name} · ${needsAttn?'需要关注':neglected?'有点想你了':'状态良好'}`;
  const mood=document.getElementById('pflt-mood'),energy=document.getElementById('pflt-energy'),bond=document.getElementById('pflt-bond');
  if(mood)mood.style.width=pClamp(d.mood||0)+'%';
  if(energy)energy.style.width=pClamp(d.energy||0)+'%';
  if(bond)bond.style.width=pClamp(d.bond||0)+'%';
  document.getElementById('pflt-dot').classList.toggle('on',needsAttn||neglected);
}
window.updatePartnerFloat=updatePartnerFloat;

window.clearPartnerSession=function(){
  partnerData=null;
  partnerChatHistory=[];
  _partnerUserId=null;
  const w=document.getElementById('pflt');
  if(w)w.classList.add('hidden');
};

/* ===== ENCOUNTER SYSTEM ===== */

const ENCOUNTER_POOLS={
  common:   [25,133,52,54,143,94,37,58,63,66,74,79,81,92,95,100,104,109,116,118,125,126,128,129],
  rare:     [1,4,7,16,19,23,27,35,39,41,43,46,48,50,60,72,77,83,84,86,88,90,113,115,123,131,132,137,138,140],
  ultra:    [3,6,9,26,34,36,45,62,65,68,76,78,80,82,93,97,101,103,106,107,110,112,130,134,135,136,139,141,142,148],
  legendary:[144,145,146,149,150,151,243,244,245,249,250,251]
};
const AFFINITY_THRESHOLD=300;
const AFFINITY_ACTIONS={
  game_log:       {gain:30,dailyLimit:1, label:'游戏日志',icon:'📝'},
  battle_analysis:{gain:25,dailyLimit:2, label:'对战分析',icon:'⚔️'},
  catch_log:      {gain:20,dailyLimit:3, label:'捕捉记录',icon:'🎣'},
  interact:       {gain:10,dailyLimit:5, label:'伙伴互动',icon:'🤝'},
  daily_login:    {gain:50,dailyLimit:1, label:'每日登录', icon:'🌅'}
};
const RARITY_ZH={common:'普通',rare:'稀有',ultra:'超稀有',legendary:'传说'};
const RARITY_CLR={common:'var(--t3)',rare:'#7ecdc4',ultra:'#c89040',legendary:'#ff80ab'};

function _encHash(s){let h=0;for(let i=0;i<s.length;i++){h=(h<<5)-h+s.charCodeAt(i);h|=0;}return Math.abs(h);}
function _encRarity(n){const r=n%100;if(r<60)return'common';if(r<88)return'rare';if(r<98)return'ultra';return'legendary';}
function _getWeekStr(){const d=new Date(),day=d.getDay()||7;d.setDate(d.getDate()+4-day);const y=d.getFullYear(),wk=Math.ceil((((d-new Date(y,0,1))/864e5)+1)/7);return`${y}-W${wk}`;}
function _encK(uid){return`enc_${uid}`;}
function _affK(uid){return`aff_${uid}`;}
function _rerollK(uid){return`enc_reroll_${uid}`;}

function getOrGenerateEncounter(uid){
  const today=pToday(),k=_encK(uid);
  let enc=null;try{enc=JSON.parse(localStorage.getItem(k));}catch{}
  if(enc?.generated_date===today)return enc;
  const seed=_encHash(uid+today);
  const rarity=_encRarity(seed);
  const pool=ENCOUNTER_POOLS[rarity];
  const pkmId=pool[Math.abs((seed>>4)%pool.length)];
  enc={pkm_id:pkmId,rarity,generated_date:today,week:_getWeekStr(),pkm_name:null};
  try{localStorage.setItem(k,JSON.stringify(enc));}catch{}
  return enc;
}

function getAffinityData(uid){
  const today=pToday(),k=_affK(uid);
  let aff=null;try{aff=JSON.parse(localStorage.getItem(k));}catch{}
  if(aff?.date===today)return aff;
  const fresh={date:today,total:aff?.total||0,daily:{}};
  try{localStorage.setItem(k,JSON.stringify(fresh));}catch{}
  return fresh;
}

window.addAffinityProgress=async function(actionType){
  let uid=_partnerUserId;
  if(!uid){const{data:{session}}=await db.auth.getSession().catch(()=>({data:{session:null}}));if(!session?.user)return;uid=session.user.id;}
  const cfg=AFFINITY_ACTIONS[actionType];if(!cfg)return;
  const k=_affK(uid);const aff=getAffinityData(uid);
  const used=aff.daily[actionType]||0;if(used>=cfg.dailyLimit)return;
  aff.daily[actionType]=used+1;aff.total=(aff.total||0)+cfg.gain;
  try{localStorage.setItem(k,JSON.stringify(aff));}catch{}
  showPartnerToast(`💫 邂逅亲密度 +${cfg.gain}（${cfg.label}）`);
  const sec=document.getElementById('encounter-section');
  if(sec){const enc=getOrGenerateEncounter(uid);_fillEncSec(sec,uid,aff,enc);}
};

async function contractEncounterPartner(pkmId,pkmName){
  let uid=_partnerUserId;
  if(!uid){const{data:{session}}=await db.auth.getSession().catch(()=>({data:{session:null}}));if(!session?.user)return;uid=session.user.id;}
  const aff=getAffinityData(uid);
  if((aff.total||0)<AFFINITY_THRESHOLD){showPartnerToast(`亲密度不足 ${AFFINITY_THRESHOLD}，继续活跃吧～`);return;}
  try{localStorage.removeItem(_encK(uid));localStorage.removeItem(_affK(uid));}catch{}
  await selectPartner(pkmId,pkmName||`#${pkmId}`);
}

async function rerollEncounter(){
  let uid=_partnerUserId;
  if(!uid){const{data:{session}}=await db.auth.getSession().catch(()=>({data:{session:null}}));if(!session?.user){showPartnerToast('请先登录');return;}uid=session.user.id;}
  const week=_getWeekStr();
  if(localStorage.getItem(_rerollK(uid))===week){showPartnerToast('本周重置次数已用完，下周再来吧～');return;}
  try{localStorage.setItem(_rerollK(uid),week);localStorage.removeItem(_encK(uid));}catch{}
  showPartnerToast('已重新生成今日遭遇宝可梦！');
  const container=document.getElementById('partner-container');
  if(container&&!partnerData)_renderEncounterPrompt(container,uid);
  const sec=document.getElementById('encounter-section');
  if(sec){const enc=getOrGenerateEncounter(uid);_fillEncSec(sec,uid,getAffinityData(uid),enc);}
  setTimeout(_fillEncounterPanelName,80);
}

async function _renderEncounterPrompt(container,uid){
  if(!uid){
    const{data:{session}}=await db.auth.getSession().catch(()=>({data:{session:null}}));
    if(!session?.user){
      container.innerHTML=`<div class="partner-empty-prompt"><span class="partner-empty-icon">🥚</span><div class="partner-empty"><h3>登录后遇见宝可梦</h3><p>每天会出现随机宝可梦，在应用内活跃可提升亲密度，达到阈值后缔结契约！</p><button class="btn btn-a" onclick="go('auth',null)" style="padding:10px 32px;margin:0 auto;display:block">前往登录</button></div></div>`;
      return;
    }
    uid=session.user.id;
  }
  const enc=getOrGenerateEncounter(uid);
  const aff=getAffinityData(uid);
  const total=aff.total||0,pct=Math.min(100,Math.round(total/AFFINITY_THRESHOLD*100));
  const ready=total>=AFFINITY_THRESHOLD;
  const rerollUsed=localStorage.getItem(_rerollK(uid))===_getWeekStr();
  const rc=RARITY_CLR[enc.rarity];
  const actRows=Object.entries(AFFINITY_ACTIONS).map(([t,c])=>{
    const used=aff.daily[t]||0,done=used>=c.dailyLimit;
    return`<div class="enc-act-row ${done?'done':''}">
      <span class="enc-act-icon">${c.icon}</span>
      <span class="enc-act-label">${c.label} <em>+${c.gain}×${c.dailyLimit}</em></span>
      <span class="enc-act-badge">${done?'✓':used+'/'+c.dailyLimit}</span>
    </div>`;
  }).join('');
  container.innerHTML=`<div class="enc-prompt">
    <div class="enc-header"><span class="enc-header-kicker">Wild Encounter</span><h3>今日遭遇宝可梦</h3></div>
    <div class="enc-pkm-card">
      <div class="enc-pkm-sprite-wrap"><img class="enc-pkm-sprite" src="${partnerSpriteUrl(enc.pkm_id)}" alt="" onerror="this.onerror=null;this.src='${partnerSpriteFallbackUrl(enc.pkm_id)}'"></div>
      <div class="enc-pkm-info">
        <div class="enc-pkm-num">#${String(enc.pkm_id).padStart(4,'0')}</div>
        <div class="enc-pkm-name" id="enc-pkm-name">${enc.pkm_name||'…'}</div>
        <div class="enc-rarity-badge" style="--enc-rarity-c:${rc}">✦ ${RARITY_ZH[enc.rarity]}</div>
      </div>
    </div>
    <div class="enc-affinity-section">
      <div class="enc-affinity-label"><span>邂逅亲密度</span><span class="enc-affinity-val">${total} / ${AFFINITY_THRESHOLD}</span></div>
      <div class="enc-affinity-bar"><div class="enc-affinity-fill" style="width:${pct}%"></div></div>
      ${ready?'<div class="enc-ready-hint">✨ 亲密度已满，可以缔结契约了！</div>':''}
    </div>
    <div class="enc-actions-list">${actRows}</div>
    <div class="enc-btns">
      <button class="enc-contract-btn ${ready?'':'locked'}" onclick="contractEncounterPartner(${enc.pkm_id},document.getElementById('enc-pkm-name')?.textContent)" ${ready?'':'disabled'}>${ready?'🤝 缔结契约':'🔒 亲密度不足'}</button>
      <button class="enc-reroll-btn" onclick="rerollEncounter()" ${rerollUsed?'disabled':''}>${rerollUsed?'本周已重置':'🎲 重新邂逅（每周1次）'}</button>
    </div>
  </div>`;
  setTimeout(_fillEncounterPanelName,80);
}

function _fillEncSec(el,uid,aff,enc){
  const total=aff.total||0,pct=Math.min(100,Math.round(total/AFFINITY_THRESHOLD*100));
  const ready=total>=AFFINITY_THRESHOLD;
  const rerollUsed=localStorage.getItem(_rerollK(uid))===_getWeekStr();
  const rc=RARITY_CLR[enc.rarity];
  el.innerHTML=`<div class="partner-box" id="encounter-section" style="--pbox-accent:#56c97a">
    <div class="partner-box-hdr"><span><b>缘遇探索</b><em>Wild Encounter</em></span><i style="color:#56c97a">${RARITY_ZH[enc.rarity]}</i></div>
    <div class="enc-sec-row">
      <img class="enc-sec-sprite" src="${partnerSpriteUrl(enc.pkm_id)}" alt="" onerror="this.onerror=null;this.src='${partnerSpriteFallbackUrl(enc.pkm_id)}'">
      <div class="enc-sec-info">
        <div class="enc-pkm-num">#${String(enc.pkm_id).padStart(4,'0')}</div>
        <div class="enc-pkm-name" id="enc-pkm-name">${enc.pkm_name||'…'}</div>
        <div class="enc-rarity-badge" style="--enc-rarity-c:${rc}">✦ ${RARITY_ZH[enc.rarity]}</div>
      </div>
    </div>
    <div class="enc-affinity-section" style="margin:8px 0">
      <div class="enc-affinity-label"><span style="font-size:.68rem;color:var(--t3)">邂逅亲密度</span><span class="enc-affinity-val">${total}/${AFFINITY_THRESHOLD}</span></div>
      <div class="enc-affinity-bar"><div class="enc-affinity-fill" style="width:${pct}%"></div></div>
      ${ready?'<div class="enc-ready-hint">✨ 亲密度已满！</div>':''}
    </div>
    <div class="enc-btns" style="gap:6px">
      <button class="enc-contract-btn ${ready?'':'locked'}" style="font-size:.7rem;padding:6px 12px" onclick="contractEncounterPartner(${enc.pkm_id},document.getElementById('enc-pkm-name')?.textContent)" ${ready?'':'disabled'}>${ready?'🤝 缔结':'🔒 未达阈值'}</button>
      <button class="enc-reroll-btn" style="font-size:.7rem;padding:6px 12px" onclick="rerollEncounter()" ${rerollUsed?'disabled':''}>${rerollUsed?'本周已重置':'🎲 重邂逅'}</button>
    </div>
  </div>`;
}

function pRenderEncounterPanel(){
  const uid=_partnerUserId;
  if(!uid)return'<div class="partner-empty-line">请先登录</div>';
  const enc=getOrGenerateEncounter(uid);
  const aff=getAffinityData(uid);
  const total=aff.total||0,pct=Math.min(100,Math.round(total/AFFINITY_THRESHOLD*100));
  const ready=total>=AFFINITY_THRESHOLD;
  const rerollUsed=localStorage.getItem(_rerollK(uid))===_getWeekStr();
  const rc=RARITY_CLR[enc.rarity];
  const actRows=Object.entries(AFFINITY_ACTIONS).map(([t,c])=>{
    const used=aff.daily[t]||0,done=used>=c.dailyLimit;
    return`<div class="enc-act-row ${done?'done':''}">
      <span class="enc-act-icon">${c.icon}</span>
      <span class="enc-act-label">${c.label} <em>+${c.gain}×${c.dailyLimit}</em></span>
      <span class="enc-act-badge">${done?'✓':used+'/'+c.dailyLimit}</span>
    </div>`;
  }).join('');
  return`<div id="encounter-section">
    <div class="enc-sec-row" style="margin-bottom:10px">
      <img class="enc-sec-sprite" src="${partnerSpriteUrl(enc.pkm_id)}" alt="" onerror="this.onerror=null;this.src='${partnerSpriteFallbackUrl(enc.pkm_id)}'">
      <div class="enc-sec-info">
        <div class="enc-pkm-num">#${String(enc.pkm_id).padStart(4,'0')}</div>
        <div class="enc-pkm-name" id="enc-pkm-name">${enc.pkm_name||'…'}</div>
        <div class="enc-rarity-badge" style="--enc-rarity-c:${rc}">✦ ${RARITY_ZH[enc.rarity]}</div>
      </div>
    </div>
    <div class="enc-affinity-section" style="margin-bottom:8px">
      <div class="enc-affinity-label"><span>邂逅亲密度</span><span class="enc-affinity-val">${total} / ${AFFINITY_THRESHOLD}</span></div>
      <div class="enc-affinity-bar"><div class="enc-affinity-fill" style="width:${pct}%"></div></div>
      ${ready?'<div class="enc-ready-hint">✨ 亲密度已满！</div>':''}
    </div>
    <div class="enc-actions-list" style="margin-bottom:10px">${actRows}</div>
    <div class="enc-btns">
      <button class="enc-contract-btn ${ready?'':'locked'}" onclick="contractEncounterPartner(${enc.pkm_id},document.getElementById('enc-pkm-name')?.textContent)" ${ready?'':'disabled'}>${ready?'🤝 缔结契约':'🔒 亲密度不足'}</button>
      <button class="enc-reroll-btn" onclick="rerollEncounter()" ${rerollUsed?'disabled':''}>${rerollUsed?'本周已重置':'🎲 重新邂逅'}</button>
    </div>
  </div>`;
}

async function _fillEncounterPanelName(){
  const uid=_partnerUserId;if(!uid)return;
  const k=_encK(uid);
  let enc=null;try{enc=JSON.parse(localStorage.getItem(k));}catch{}
  if(!enc)return;
  if(!enc.pkm_name){
    const n=await pFetchChineseName(enc.pkm_id,`#${enc.pkm_id}`);
    enc.pkm_name=n;
    try{localStorage.setItem(k,JSON.stringify(enc));}catch{}
  }
  const el=document.getElementById('enc-pkm-name');
  if(el)el.textContent=enc.pkm_name;
}

/* ===== PARTNER LEADERBOARD ===== */

function switchPartnerTab(tab,btn){
  document.querySelectorAll('.partner-tab-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const main=document.getElementById('partner-main-view');
  const lb=document.getElementById('partner-lb-view');
  if(tab==='leaderboard'){
    if(main)main.style.display='none';
    if(lb){lb.style.display='block';loadPartnerLeaderboard(_partnerLbDim);}
    _syncPartnerPublicBtn();
  }else{
    if(main)main.style.display='';
    if(lb)lb.style.display='none';
  }
}

async function loadPartnerLeaderboard(dim){
  _partnerLbDim=dim||'level';
  document.querySelectorAll('.partner-lb-dim-btn').forEach(b=>b.classList.toggle('active',b.dataset.dim===_partnerLbDim));
  const tbody=document.getElementById('partner-lb-rows');
  if(!tbody)return;
  tbody.innerHTML='<tr><td colspan="5" class="partner-lb-loading">加载中…</td></tr>';
  let q=db.from('pkm_partner').select('pkm_id,pkm_name,nickname,exp,streak_days,bond,interaction_counts').eq('is_public',true).limit(20);
  if(dim==='streak')q=q.order('streak_days',{ascending:false});
  else if(dim==='bond')q=q.order('bond',{ascending:false});
  else q=q.order('exp',{ascending:false});
  const{data,error}=await q;
  if(error||!data){tbody.innerHTML=`<tr><td colspan="5" class="partner-lb-loading">${error?'加载失败':'暂无数据'}</td></tr>`;return;}
  const sorted=dim==='active'?[...data].sort((a,b)=>((b.interaction_counts?.total||0)-(a.interaction_counts?.total||0))):data;
  tbody.innerHTML=sorted.map((p,i)=>{
    const lv=pLevelFromExp(p.exp||0);
    const ic=p.interaction_counts||{};
    const title=_getPartnerTitle(p,lv,ic);
    const name=pEsc(p.nickname||p.pkm_name);
    const metric=dim==='level'?`Lv.${lv}`:dim==='streak'?`${p.streak_days||0}天`:dim==='bond'?`${p.bond||0}/100`:`${ic.total||0}次`;
    return`<tr class="partner-lb-row">
      <td class="partner-lb-rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
      <td><img class="partner-lb-sprite" src="${partnerSpriteUrl(p.pkm_id)}" onerror="this.onerror=null;this.src='${partnerSpriteFallbackUrl(p.pkm_id)}'"></td>
      <td class="partner-lb-name"><div>${name}</div>${title?`<div class="partner-title-badge">${title.icon} ${title.name}</div>`:''}</td>
      <td style="font-size:.62rem;color:var(--t3);font-family:'DM Mono',monospace">#${String(p.pkm_id).padStart(4,'0')}</td>
      <td class="partner-lb-metric">${metric}</td>
    </tr>`;
  }).join('')||'<tr><td colspan="5" class="partner-lb-loading">还没有公开数据，成为第一个？</td></tr>';
}

function _getPartnerTitle(p,lv,ic){
  if((lv||pLevelFromExp(p.exp||0))>=100)return{icon:'💎',name:'传说训练家'};
  if((p.bond||0)>=100)return{icon:'👑',name:'羁绊之主'};
  if((p.streak_days||0)>=100)return{icon:'🔥',name:'永不断签'};
  if(((ic||p.interaction_counts||{}).total||0)>=1000)return{icon:'⚡',name:'互动狂人'};
  return null;
}

async function togglePartnerPublic(){
  if(!partnerData)return;
  const{data:{session}}=await db.auth.getSession().catch(()=>({data:{session:null}}));
  if(!session?.user)return;
  const next=!partnerData.is_public;
  const{error}=await db.from('pkm_partner').update({is_public:next}).eq('user_id',session.user.id);
  if(error){showPartnerToast('操作失败：'+error.message);return;}
  partnerData.is_public=next;
  _syncPartnerPublicBtn();
  showPartnerToast(next?'伙伴信息已公开到排行榜！':'已从排行榜隐藏伙伴信息。');
}

function _syncPartnerPublicBtn(){
  const btn=document.getElementById('partner-public-btn');
  if(!btn)return;
  const pub=partnerData?.is_public;
  btn.textContent=pub?'🌐 公开中（点击隐藏）':'🔒 隐藏中（点击公开排行榜）';
  btn.className='btn partner-public-btn'+(pub?' active':'');
}
