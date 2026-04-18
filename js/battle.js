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
async function loadBattleTeams(){
  try{
    const{data:{session}}=await db.auth.getSession();
    if(session?.user){
      const{data}=await db.from('battle_teams').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false});
      battleTeams=data||[];
    } else {
      try{battleTeams=JSON.parse(localStorage.getItem('battle_teams')||'[]');}catch{battleTeams=[];}
    }
  } catch(e){
    try{battleTeams=JSON.parse(localStorage.getItem('battle_teams')||'[]');}catch{battleTeams=[];}
  }
}

async function saveBattleTeamToServer(team){
  try{
    const{data:{session}}=await db.auth.getSession();
    if(session?.user){
      team.user_id=session.user.id;
      if(team.id && !team.id.startsWith('local_')){
        const{error}=await db.from('battle_teams').update({team_name:team.team_name,pokemon:team.pokemon,updated_at:new Date().toISOString()}).eq('id',team.id);
        if(error)throw error;
      } else {
        delete team.id;
        const{data,error}=await db.from('battle_teams').insert(team).select().single();
        if(error)throw error;
        return data.id;
      }
    } else {
      localStorage.setItem('battle_teams',JSON.stringify(battleTeams));
    }
  } catch(e){
    console.warn('battle save error',e);
    localStorage.setItem('battle_teams',JSON.stringify(battleTeams));
  }
  return team.id;
}

async function deleteBattleTeamFromServer(id){
  try{
    const{data:{session}}=await db.auth.getSession();
    if(session?.user && id && !id.startsWith('local_')){
      await db.from('battle_teams').delete().eq('id',id);
    }
  } catch(e){console.warn(e);}
}

/* ──────── 渲染队伍列表 ──────── */
function renderTeamList(){
  const el=document.getElementById('battle-team-list');
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
  if(teamId){
    const found=battleTeams.find(t=>t.id===teamId);
    battleEditTeam=JSON.parse(JSON.stringify(found||{id:teamId,team_name:'我的队伍',pokemon:[]}));
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
      <input class="bpkm-inp-num" id="bpkm-iv-${k}" type="number" min="0" max="31" placeholder="个体" value="${p.iv?.[k]??31}" oninput="onBpkmStatChange()">
      <input class="bpkm-inp-num" id="bpkm-ev-${k}" type="number" min="0" max="252" placeholder="努力" value="${p.ev?.[k]||0}" oninput="onBpkmEvChange()">
      <span class="bpkm-stat-calc" id="bpkm-calc-${k}">${calc||'—'}</span>
    </div>`;
  }).join('');

  const typeOpts=B_TYPES.map(t=>`<option value="${t}"${p.type1===t?' selected':''}>${TYPE_ZH[t]||t}</option>`).join('');
  const typeOpts2=['<option value="">无</option>',...B_TYPES.map(t=>`<option value="${t}"${p.type2===t?' selected':''}>${TYPE_ZH[t]||t}</option>`)].join('');
  const natOpts=['', ...Object.keys(NATURES_ZH)].map(n=>`<option value="${n}"${p.nature===n?' selected':''}>${n||'无'}</option>`).join('');

  const movesHtml=moves.map((m,i)=>`<div class="bpkm-move-card">
    <span class="bpkm-move-num">技能 ${i+1}</span>
    <input class="bpkm-inp" id="bpkm-move${i+1}-name" placeholder="技能名称" value="${esc(m.name||'')}" autocomplete="off">
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
      <input class="bpkm-inp-num" id="bpkm-move${i+1}-ap" type="number" min="1" max="5" placeholder="AP" value="${m.ap||''}" title="Champions AP (1-5)" style="flex:1">
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
      ${spriteUrl?`<div class="bpkm-preview">
        <img src="${esc(spriteUrl)}" alt="" id="bpkm-sprite" onerror="this.style.display='none'">
        <div>
          <div class="bpkm-preview-name" id="bpkm-preview-name">${esc(p.name||'')}</div>
          <div class="bpkm-preview-types" id="bpkm-preview-types">${p.type1?`<span class="coverage-type-tag type-${p.type1}">${TYPE_ZH[p.type1]||p.type1}</span>`:''}${p.type2?`<span class="coverage-type-tag type-${p.type2}">${TYPE_ZH[p.type2]||p.type2}</span>`:''}</div>
        </div>
      </div>`:''}
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
          <input class="bpkm-inp" id="bpkm-ability" placeholder="例：猛火" value="${esc(p.ability||'')}">
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
      <div style="font-size:.62rem;color:var(--t3);font-family:'DM Mono',monospace;margin-bottom:6px">每行依次：种族 / 个体(0-31) / 努力(0-252) → <span style="color:var(--acc2)">实际值</span>　努力值总和上限：<span id="bpkm-ev-total-lbl">0/508</span></div>
      <div class="bpkm-stats-block">${statsBlock}</div>

      <div class="bpkm-section-hdr" style="margin-top:8px">技能（支持 Champions AP 制，AP 1-5 对应技能消耗行动点数）</div>
      <div class="bpkm-moves-grid">${movesHtml}</div>

      <div class="bpkm-inp-group" style="margin-top:6px">
        <span class="bpkm-inp-label">备注</span>
        <textarea class="bpkm-inp" id="bpkm-notes" rows="2" style="height:56px;resize:vertical">${esc(p.notes||'')}</textarea>
      </div>
    </div>`;
  updateEvTotal();
}

/* ──────── 搜索宝可梦 ──────── */
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
    }
  } catch(e){console.warn(e);}
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
  el.textContent=`${total}/508`;
  el.style.color=total>508?'var(--danger)':total===508?'var(--acc2)':'var(--t3)';
}

/* ──────── 能力值公式 ──────── */
function calcActualStatVal(base,iv,ev,nature,statKey,level=50){
  if(!base&&base!==0)return 0;
  iv=Math.max(0,Math.min(31,parseInt(iv)||0));
  ev=Math.max(0,Math.min(252,parseInt(ev)||0));
  base=parseInt(base)||0;
  level=parseInt(level)||50;
  let val;
  if(statKey==='hp'){
    val=Math.floor((2*base+iv+Math.floor(ev/4))*level/100)+level+10;
  } else {
    val=Math.floor((Math.floor((2*base+iv+Math.floor(ev/4))*level/100)+5)*(NATURES_ZH[nature]?.[STAT_KEYS_B.indexOf(statKey)]||1));
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
    p.iv[k]=parseInt(document.getElementById(`bpkm-iv-${k}`)?.value)??31;
    p.ev[k]=parseInt(document.getElementById(`bpkm-ev-${k}`)?.value)||0;
  });
  // 技能
  [1,2,3,4].forEach(i=>{
    p[`move${i}`]={
      name:document.getElementById(`bpkm-move${i}-name`)?.value.trim()||'',
      type:document.getElementById(`bpkm-move${i}-type`)?.value||'',
      cat:document.getElementById(`bpkm-move${i}-cat`)?.value||'',
      power:parseInt(document.getElementById(`bpkm-move${i}-power`)?.value)||0,
      ap:parseInt(document.getElementById(`bpkm-move${i}-ap`)?.value)||3,
    };
  });
  battleEditTeam.pokemon[battleEditSlot]=p;
}

/* ──────── 保存队伍 ──────── */
async function saveBattleTeam(){
  gatherSlotForm();
  battleEditTeam.team_name=document.getElementById('battle-team-name-inp').value.trim()||'我的队伍';
  battleEditTeam.updated_at=new Date().toISOString();
  const existing=battleTeams.findIndex(t=>t.id===battleEditTeam.id);
  if(existing>=0){battleTeams[existing]=battleEditTeam;}else{battleTeams.unshift(battleEditTeam);}
  const newId=await saveBattleTeamToServer(battleEditTeam);
  if(newId&&newId!==battleEditTeam.id){
    battleEditTeam.id=newId;
    const idx=battleTeams.findIndex(t=>t.id===battleEditTeam.id||t.id===('local_'+battleEditTeam.id.replace('local_','')));
    if(idx>=0)battleTeams[idx].id=newId;
  }
  renderTeamList();
  renderBattleTeamSel();
  closeBattleTeamEdit();
  showToast('队伍已保存 ✓');
}

async function confirmDeleteBattleTeam(id){
  if(!confirm('确定要删除这支队伍吗？'))return;
  await deleteBattleTeamFromServer(id);
  battleTeams=battleTeams.filter(t=>t.id!==id);
  renderTeamList();
  renderBattleTeamSel();
  showToast('已删除');
}

async function deleteBattleTeamFromModal(){
  if(!battleEditTeam)return;
  if(!confirm('确定要删除这支队伍吗？'))return;
  await deleteBattleTeamFromServer(battleEditTeam.id);
  battleTeams=battleTeams.filter(t=>t.id!==battleEditTeam.id);
  renderTeamList();
  renderBattleTeamSel();
  closeBattleTeamEdit();
  showToast('已删除');
}

/* ──────── 赛前分析 ──────── */
function renderBattleOppSlots(){
  const el=document.getElementById('battle-opp-slots');
  if(!el)return;
  const typeOpts=B_TYPES.map(t=>`<option value="${t}">${TYPE_ZH[t]||t}</option>`).join('');
  el.innerHTML=[0,1,2,3,4,5].map(i=>`
    <div class="battle-opp-row">
      <span class="battle-opp-num">${i+1}</span>
      <input class="battle-opp-inp" id="bopp-name-${i}" placeholder="宝可梦名称…" oninput="onOppNameInput(${i},this.value)" autocomplete="off">
      <select class="battle-opp-type-sel" id="bopp-t1-${i}" title="属性1">
        <option value="">属性1</option>${typeOpts}
      </select>
      <select class="battle-opp-type-sel" id="bopp-t2-${i}" title="属性2（可选）">
        <option value="">属性2</option>${typeOpts}
      </select>
    </div>`).join('');
}

async function onOppNameInput(i,q){
  if(!q||q.length<1)return;
  // 尝试从中文名表匹配，自动填入属性
  const match=Object.entries(PKM_CN_TABLE).find(([id,cn])=>cn===q.trim());
  if(match){
    try{
      const r=await fetch(`${POKEAPI}/pokemon/${match[0]}`);
      if(r.ok){
        const d=await r.json();
        const t1=d.types[0]?.type?.name||'';
        const t2=d.types[1]?.type?.name||'';
        const s1=document.getElementById(`bopp-t1-${i}`);
        const s2=document.getElementById(`bopp-t2-${i}`);
        if(s1)s1.value=t1;
        if(s2)s2.value=t2;
        battleOppPkm[i]={name:q.trim(),type1:t1,type2:t2};
      }
    } catch(e){}
  } else {
    battleOppPkm[i]={name:q.trim(),type1:document.getElementById(`bopp-t1-${i}`)?.value||'',type2:document.getElementById(`bopp-t2-${i}`)?.value||''};
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
const AP_MOD={1:0.6,2:0.85,3:1.0,4:1.25,5:1.55};
const ITEM_MOD={'讲究头带':1.5,'讲究眼镜':1.5,'讲究围巾':1.5,'生命球':1.3,'火焰宝珠':1.2,'强化道具':1.1};

function calcDamageEst(myPkm, oppPkm, move){
  if(!move||!move.power||move.cat==='status')return null;
  const level=myPkm.level||50;
  const isPhys=move.cat==='physical';
  // 攻防能力值（如果没有录入则用种族值估算）
  const atkStat=isPhys
    ?calcActualStatVal(myPkm.base?.atk||70,myPkm.iv?.atk??31,myPkm.ev?.atk||0,myPkm.nature,'atk',level)
    :calcActualStatVal(myPkm.base?.spa||70,myPkm.iv?.spa??31,myPkm.ev?.spa||0,myPkm.nature,'spa',level);
  const defStat=isPhys
    ?calcActualStatVal(oppPkm.base?.def||70,15,0,'','def',level)
    :calcActualStatVal(oppPkm.base?.spd||70,15,0,'','spd',level);
  const oppHp=calcActualStatVal(oppPkm.base?.hp||70,15,0,'','hp',level);

  let pwr=move.power;
  // AP 修正（Champions专用）
  const apMul=AP_MOD[move.ap]||1.0;
  // 属性相克
  const typeMul=getTypeEff(move.type,oppPkm.type1,oppPkm.type2);
  // 道具修正
  let itemMul=ITEM_MOD[myPkm.item]||1.0;
  // 技能属性与本体属性一致时 STAB 1.5x
  const stab=(move.type===myPkm.type1||move.type===myPkm.type2)?1.5:1.0;
  const baseDmg=Math.floor((Math.floor((2*level/5+2)*pwr*atkStat/defStat/50)+2)*typeMul*stab*itemMul*apMul);
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
