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

/* ===== INIT ===== */
async function initPartner(){
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){
    document.getElementById('partner-container').innerHTML=`
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
  const{data,error}=await db.from('pkm_partner').select('*').eq('user_id',userId).single();
  if(error){renderPartnerSelectPrompt();return;}
  if(data){partnerData=data;checkPartnerDailyReset();renderPartnerPage();}
  else renderPartnerSelectPrompt();
}


async function savePartnerData(){
  if(!partnerData)return;
  partnerData.updated_at=new Date().toISOString();
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user)return;
  await db.from('pkm_partner').upsert({...partnerData,user_id:session.user.id});
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

/* ===== RENDER ===== */
function renderPartnerSelectPrompt(){
  document.getElementById('partner-container').innerHTML=`
    <div class="partner-empty-prompt">
      <span class="partner-empty-icon">🥚</span>
      <div class="partner-empty">
        <h3>选择你的第一只伙伴</h3>
        <p>从你捕获或喜欢的宝可梦中，选择一只作为你专属的旅行伙伴。它会陪你记录每一次冒险。</p>
        <button class="btn btn-a" onclick="openPartnerSelect()" style="padding:10px 32px;margin:0 auto;display:block;font-size:.92rem">选择伙伴</button>
      </div>
    </div>`;
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

  document.getElementById('partner-container').innerHTML=`
    <div class="partner-layout">
      <div class="partner-card">
        <div class="partner-sprite-area">
          <div class="partner-sprite-bg" style="background-image:url('${spriteUrl}')"></div>
          <img id="partner-sprite" class="partner-sprite ${moodAnim}" src="${spriteUrl}" alt="${pEsc(name)}" onerror="this.style.opacity='.3'">
          <div class="partner-mood-badge ${moodBadge.cls}">${moodBadge.text}</div>
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
          <button class="partner-chat-btn" onclick="togglePartnerChat()">⬡ 和${pEsc(name)}聊天</button>
          <button class="partner-change-btn" onclick="openPartnerSelect()">更换伙伴</button>
        </div>
      </div>
      <div class="partner-right">
        ${pRenderTasks()}
        ${pRenderInventory()}
        ${pRenderDiary()}
        ${pRenderProfile()}
        ${pRenderChatHTML()}
      </div>
    </div>`;
}

function pStatBar(label,key,val,color){
  const c=val>=60?color:val>=30?'var(--warn)':'var(--danger)';
  return`<div class="partner-stat-row">
    <span class="partner-stat-lbl">${label}</span>
    <div class="partner-stat-bar"><div class="partner-stat-fill" style="width:${val}%;background:${c}"></div></div>
    <span class="partner-stat-val">${val}</span>
  </div>`;
}

function pRenderTasks(){
  const di=partnerData.daily_interactions||{};
  const rows=DAILY_TASKS.map(t=>{
    const done=t.check(di);
    return`<div class="partner-task ${done?'done':''}">
      <span class="partner-task-icon">${done?'✅':'⬜'}</span>
      <span class="partner-task-text">${t.text}</span>
      <span class="partner-task-reward">${done?'已完成':t.reward}</span>
    </div>`;
  }).join('');
  return`<div class="partner-box">
    <div class="partner-box-hdr">📋 今日任务</div>
    <div class="partner-task-list">${rows}</div>
  </div>`;
}

function pRenderInventory(){
  const inv=partnerData.inventory||{};
  const items=Object.entries(PARTNER_ITEMS).map(([key,item])=>{
    const cnt=inv[key]||0;
    return`<div class="partner-item ${cnt===0?'empty':''}" onclick="${cnt>0?`usePartnerItem('${key}')`:''}" title="${item.desc}">
      <span class="partner-item-icon">${item.icon}</span>
      <div class="partner-item-name">${item.name}</div>
      <div class="partner-item-count">×${cnt}</div>
      <div class="partner-item-desc">${item.desc}</div>
    </div>`;
  }).join('');
  return`<div class="partner-box">
    <div class="partner-box-hdr">🎒 背包道具</div>
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
  return`<div class="partner-box">
    <div class="partner-box-hdr">📔 伙伴日记</div>
    <div class="partner-diary-list">${rows}</div>
  </div>`;
}

function pRenderProfile(){
  const d=partnerData;
  const stage=pGetBondStage();
  const ic=d.interaction_counts||{};
  const unlocked=(d.achievements||[]);
  const achHTML=unlocked.length?PARTNER_ACHIEVEMENTS.filter(a=>unlocked.includes(a.id)).map(a=>`<span class="partner-badge">${a.icon} ${a.name}</span>`).join(''):`<span style="font-size:.73rem;color:var(--t3)">暂无成就，继续互动解锁</span>`;
  return`<div class="partner-box">
    <div class="partner-box-hdr">👤 伙伴档案</div>
    <div class="partner-profile-grid">
      <div class="partner-profile-stat"><div class="partner-profile-val">${d.streak_days||1}</div><div class="partner-profile-lbl">连续陪伴天</div></div>
      <div class="partner-profile-stat"><div class="partner-profile-val">${ic.total||0}</div><div class="partner-profile-lbl">总互动次数</div></div>
    </div>
    <div class="partner-bond-bar">
      <div class="partner-bond-stage"><span>亲密阶段</span><span class="partner-bond-stage-name">${stage.name}</span></div>
      <div class="partner-bond-bar-wrap"><div class="partner-bond-fill" style="width:${d.bond}%"></div></div>
      <div class="partner-bond-desc">${stage.desc}</div>
    </div>
    <div class="partner-box-hdr" style="margin-top:10px">🏅 成就</div>
    <div class="partner-achievements">${achHTML}</div>
  </div>`;
}

function pRenderChatHTML(){
  const name=partnerData?(partnerData.nickname||partnerData.pkm_name):'伙伴';
  return`<div class="partner-chat-area partner-box" id="partner-chat-area" style="padding:0;display:none">
    <div class="partner-chat-hdr">
      <div class="partner-chat-title"><div class="ai-pulse"></div>和${pEsc(name)}聊天</div>
      <button class="btn btn-sm" onclick="togglePartnerChat()">✕</button>
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
      <img src="${partnerSpriteUrl(c.pkm_id)}" alt="${pEsc(c.pkm_name)}" onerror="this.style.display='none'">
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
  closeOv('ov-partner-select');
  const today=pToday();
  const rec={
    user_id:session.user.id,
    pkm_id:pkmId,pkm_name:cnName,nickname:null,
    level:1,exp:0,hunger:80,mood:75,energy:80,bond:0,
    last_interaction_at:new Date().toISOString(),
    streak_days:1,last_checkin_date:today,
    inventory:{berry:3,poffin:1,cube:0,drink:0,toy:0},
    diary:[{date:today,text:`你和${cnName}第一次相遇了！一段新的旅程开始了。`}],
    daily_interactions:{date:today,total:0},
    interaction_counts:{feed:0,pat:0,play:0,train:0,rest:0,adventure:0,total:0},
    achievements:['first_meet'],
    created_at:new Date().toISOString(),updated_at:new Date().toISOString()
  };
  const{data,error}=await db.from('pkm_partner').upsert(rec,{onConflict:'user_id'}).select().single();
  if(error){showPartnerToast('保存失败：'+error.message);return;}
  partnerData=data||rec;
  renderPartnerPage();
  showPartnerToast(`🎉 ${cnName} 成为了你的伙伴！`);
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

/* ===== AI CHAT ===== */
function togglePartnerChat(){
  const area=document.getElementById('partner-chat-area');
  if(!area)return;
  const isOn=area.style.display!=='none';
  area.style.display=isOn?'none':'block';
  if(!isOn&&partnerChatHistory.length===0) setTimeout(autoPartnerGreet,200);
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

/* ===== UTILS ===== */
function partnerSpriteUrl(pkmId){
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
