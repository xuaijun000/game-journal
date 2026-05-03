let fGenre='all',fRating=0,fCompletion='',libraryViewMode='grid',libraryViews=[];
const RETRO_PLATFORMS=['fc','sfc','n64','gc','wii','wiiu','gb','gba','nds','3ds','ps1','ps2','ps3','psp','vita','md','ss','dc','xbox_orig'];
const LIBRARY_VIEWS_KEY='gj_library_views';

function setPF(p,el){pff=p;document.querySelectorAll('.pfchip[data-p]').forEach(c=>c.classList.remove('on'));if(el)el.classList.add('on');else setActivePlatformChip(p);updateFilterBadge();render();}
function setStatusFilter(status,el){
  const sel=document.getElementById('fst');
  if(sel)sel.value=status;
  document.querySelectorAll('[data-status-tab]').forEach(b=>b.classList.remove('on'));
  if(el)el.classList.add('on');
  render();
}
function setGnFilter(gn,el){fGenre=gn;document.querySelectorAll('[data-gn]').forEach(c=>c.classList.remove('on'));el.classList.add('on');updateFilterBadge();render();}
function setRtFilter(r,el){fRating=r;document.querySelectorAll('[data-rt]').forEach(c=>c.classList.remove('on'));el.classList.add('on');updateFilterBadge();render();}
function setCpFilter(c,el){fCompletion=c;document.querySelectorAll('[data-cp]').forEach(c=>c.classList.remove('on'));el.classList.add('on');updateFilterBadge();render();}
function toggleFilterPanel(){
  const panel=document.getElementById('filter-panel');
  const btn=document.getElementById('filter-toggle-btn');
  const isOpen=panel.style.display!=='none';
  panel.style.display=isOpen?'none':'flex';
  btn.classList.toggle('open',!isOpen);
  document.getElementById('filter-toggle-txt').textContent=isOpen?'＋ 高级筛选':'－ 收起筛选';
}
function clearFilters(){
  pff='all';fGenre='all';fRating=0;fCompletion='';
  const sel=document.getElementById('fst');
  if(sel)sel.value='';
  document.querySelectorAll('[data-status-tab]').forEach(b=>b.classList.toggle('on',b.dataset.statusTab===''));
  document.querySelectorAll('.pfchip[data-p]').forEach(c=>c.classList.toggle('on',c.dataset.p==='all'));
  document.querySelectorAll('[data-gn]').forEach(c=>c.classList.toggle('on',c.dataset.gn==='all'));
  document.querySelectorAll('[data-rt]').forEach(c=>c.classList.toggle('on',c.dataset.rt==='0'));
  document.querySelectorAll('[data-cp]').forEach(c=>c.classList.toggle('on',c.dataset.cp===''));
  updateFilterBadge();render();
}
function updateFilterBadge(){
  const count=(pff!=='all'?1:0)+(fGenre!=='all'?1:0)+(fRating>0?1:0)+(fCompletion?1:0);
  const badge=document.getElementById('filter-active-badge');
  const clearBtn=document.getElementById('filter-clear-btn');
  if(badge){badge.textContent=count;badge.style.display=count?'inline-flex':'none';}
  if(clearBtn)clearBtn.style.display=count?'':'none';
}
function refreshStatsIfVisible(){if(document.getElementById('pg-stats')?.classList.contains('on')&&typeof drawCharts==='function')drawCharts();}
function renderGameGenreControls(){
  const filter=document.getElementById('game-filter-genres');
  if(filter&&!filter.dataset.rendered){
    filter.innerHTML='<div class="pfchip on" data-gn="all" onclick="setGnFilter(\'all\',this)">全部</div>'+
      GAME_GENRE_GROUPS.map(group=>`<span class="chips-grp-label">${esc(group.label)}</span>`+
        group.items.map(([value,label])=>`<div class="pfchip" data-gn="${value}" onclick="setGnFilter('${value}',this)">${esc(label)}</div>`).join('')).join('');
    filter.dataset.rendered='1';
  }
  const edit=document.getElementById('gc');
  if(edit&&!edit.dataset.rendered){
    edit.innerHTML=GAME_GENRE_GROUPS.map(group=>`<div class="chips-grp-label">${esc(group.label)}</div>`+
      group.items.map(([value,label])=>`<div class="chip" data-v="${value}" onclick="tc(this)">${esc(label)}</div>`).join('')).join('');
    edit.dataset.rendered='1';
  }
}
function currentLibraryViewConfig(){
  return {
    q:document.getElementById('q')?.value||'',
    status:document.getElementById('fst')?.value||'',
    sort:document.getElementById('fso')?.value||'date',
    platform:pff,
    genre:fGenre,
    rating:fRating,
    completion:fCompletion,
    mode:libraryViewMode
  };
}
function setActivePlatformChip(platform){
  document.querySelectorAll('.pfchip[data-p]').forEach(c=>c.classList.toggle('on',c.dataset.p===platform));
}
function restoreLibraryViewConfig(config){
  if(!config)return;
  const q=document.getElementById('q'),status=document.getElementById('fst'),sort=document.getElementById('fso');
  if(q)q.value=config.q||'';
  if(status)status.value=config.status||'';
  if(sort)sort.value=config.sort||'date';
  pff=config.platform||'all';
  fGenre=config.genre||'all';
  fRating=parseInt(config.rating)||0;
  fCompletion=config.completion||'';
  setActivePlatformChip(pff);
  document.querySelectorAll('[data-gn]').forEach(c=>c.classList.toggle('on',c.dataset.gn===fGenre));
  document.querySelectorAll('[data-rt]').forEach(c=>c.classList.toggle('on',String(c.dataset.rt)===String(fRating)));
  document.querySelectorAll('[data-cp]').forEach(c=>c.classList.toggle('on',c.dataset.cp===fCompletion));
  updateFilterBadge();
  setLibraryViewMode(config.mode||'grid');
}
function renderLibrarySavedViews(){
  const sel=document.getElementById('library-view-select');
  if(!sel)return;
  const active=sel.value;
  sel.innerHTML='<option value="">我的视图…</option>'+libraryViews.map(v=>`<option value="${v.id}">${esc(v.name)}</option>`).join('');
  if(libraryViews.some(v=>String(v.id)===String(active)))sel.value=active;
}
async function loadLibraryViews(){
  const{data:{session}}=await db.auth.getSession();
  const user=session?.user;
  if(user){
    try{
      const{data,error}=await db.from('game_library_views').select('*').eq('user_id',user.id).order('updated_at',{ascending:false});
      if(error)throw error;
      libraryViews=(data||[]).map(v=>({...v,config:v.config||{}}));
      renderLibrarySavedViews();
      return;
    }catch(e){
      console.warn('game_library_views load failed',e.message);
    }
  }
  try{libraryViews=JSON.parse(localStorage.getItem(LIBRARY_VIEWS_KEY)||'[]');}catch{libraryViews=[];}
  renderLibrarySavedViews();
}
async function saveLibraryView(){
  const sel=document.getElementById('library-view-select');
  const activeId=sel?.value||'';
  const existing=libraryViews.find(v=>String(v.id)===String(activeId));
  const name=prompt(existing?'更新当前视图名称':'给当前筛选视图起个名字',existing?.name||'');
  if(!name||!name.trim())return;
  const config=currentLibraryViewConfig();
  const{data:{session}}=await db.auth.getSession();
  const user=session?.user;
  if(user){
    const payload={name:name.trim(),config,updated_at:new Date().toISOString()};
    const req=existing
      ?db.from('game_library_views').update(payload).eq('id',existing.id).eq('user_id',user.id).select().single()
      :db.from('game_library_views').insert({...payload,user_id:user.id}).select().single();
    const{data,error}=await req;
    if(error){alert('保存失败：请确认 Supabase 已创建 game_library_views 表。\n'+error.message);return;}
    if(existing){
      const idx=libraryViews.findIndex(v=>String(v.id)===String(existing.id));
      if(idx>-1)libraryViews[idx]=data;
    }else libraryViews.unshift(data);
  }else{
    if(existing){
      existing.name=name.trim();existing.config=config;existing.updated_at=new Date().toISOString();
    }else libraryViews.unshift({id:Date.now().toString(36),name:name.trim(),config,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
    localStorage.setItem(LIBRARY_VIEWS_KEY,JSON.stringify(libraryViews));
  }
  renderLibrarySavedViews();
  if(sel)sel.value=String(existing?.id||libraryViews[0].id);
}
function applyLibraryView(id){
  if(!id)return;
  const view=libraryViews.find(v=>String(v.id)===String(id));
  if(!view)return;
  restoreLibraryViewConfig(view.config);
  render();
}
async function deleteLibraryView(){
  const sel=document.getElementById('library-view-select');
  const id=sel?.value;
  if(!id)return;
  const view=libraryViews.find(v=>String(v.id)===String(id));
  if(!view||!confirm(`删除视图「${view.name}」？`))return;
  const{data:{session}}=await db.auth.getSession();
  if(session?.user)await db.from('game_library_views').delete().eq('id',id).eq('user_id',session.user.id);
  libraryViews=libraryViews.filter(v=>String(v.id)!==String(id));
  if(!session?.user)localStorage.setItem(LIBRARY_VIEWS_KEY,JSON.stringify(libraryViews));
  renderLibrarySavedViews();
}
function setLibraryViewMode(mode,el){
  libraryViewMode=mode||'grid';
  document.querySelectorAll('[data-view-mode]').forEach(b=>b.classList.toggle('on',b.dataset.viewMode===libraryViewMode));
  const gg=document.getElementById('gg');
  if(gg){
    gg.classList.toggle('view-dense',libraryViewMode==='dense');
    gg.classList.toggle('view-list',libraryViewMode==='list');
  }
  if(el)el.classList.add('on');
}
function gameId(g){return g.id||g._id;}
function fmtHours(h){return h?`${h}h`:'0h';}
function fmtRating(r){return r?`${'★'.repeat(r)}${'☆'.repeat(5-r)}`:'未评分';}
function firstPlatform(g){const p=(g.platforms||[])[0];return p?PFMAP[p]||p:'未标平台';}
function newestFirst(list){return [...list].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));}
function syncStatusTabs(){
  const status=document.getElementById('fst')?.value||'';
  document.querySelectorAll('[data-status-tab]').forEach(b=>b.classList.toggle('on',b.dataset.statusTab===status));
}
function platformMatches(g,platform){
  const platforms=g.platforms||[];
  if(platform==='all')return true;
  if(platform==='retro')return platforms.some(p=>RETRO_PLATFORMS.includes(p));
  return platforms.includes(platform);
}
function updateGameStats(){
  const total=games.length;
  const playing=games.filter(g=>g.status==='playing').length;
  const done=games.filter(g=>g.status==='done').length;
  const hours=games.reduce((s,g)=>s+(g.hours||0),0);
  const rated=games.filter(g=>g.rating>0);
  const avg=rated.length?(rated.reduce((s,g)=>s+g.rating,0)/rated.length).toFixed(1):'—';
  [['s-total',total],['s-pl',playing],['s-dn',done],['s-hr',hours],['s-av',avg]].forEach(([id,val])=>{
    const el=document.getElementById(id);
    if(el)el.textContent=val;
  });
}
function renderHero(){
  const hero=document.getElementById('library-hero');
  if(!hero)return;
  const featured=newestFirst(games.filter(g=>g.status==='playing'))[0]||newestFirst(games)[0];
  if(!featured){
    hero.innerHTML=`<div class="library-hero-empty">
      <div class="library-kicker">PIXELFISH LIBRARY</div>
      <h1>把你的游戏经历放进同一个收藏馆</h1>
      <p>记录封面、平台、时长、评分和游玩时刻，第一款游戏从这里开始。</p>
      <button class="btn btn-a" onclick="openAdd()">＋ 添加游戏</button>
    </div>`;
    hero.style.removeProperty('--hero-cover');
    return;
  }
  const cover=featured.cover?`url('${esc(featured.cover)}')`:'none';
  hero.style.setProperty('--hero-cover',cover);
  const platforms=(featured.platforms||[]).slice(0,3).map(p=>PFMAP[p]||p).join(' / ')||'未标平台';
  hero.innerHTML=`<div class="library-hero-main">
    <div class="library-kicker">CONTINUE PLAYING</div>
    <h1>${esc(featured.name)}</h1>
    <p>${[STMAP[featured.status],platforms,featured.hours?`${featured.hours} 小时`:null].filter(Boolean).join(' · ')}</p>
    <div class="library-hero-actions">
      <button class="btn btn-a" onclick="openPlayMode('game','${gameId(featured)}')">▶ 开始游玩</button>
      <button class="btn" onclick="openDetail('${gameId(featured)}')">查看档案</button>
    </div>
  </div>
  <button class="library-hero-cover" onclick="openDetail('${gameId(featured)}')" aria-label="查看游戏档案">
    ${featured.cover?`<img src="${esc(featured.cover)}" alt="" loading="lazy">`:'<span>🎮</span>'}
  </button>`;
}
function shelfItem(g){
  return `<button class="shelf-game" onclick="openDetail('${gameId(g)}')" title="${esc(g.name)}">
    <span class="shelf-cover">${g.cover?`<img src="${esc(g.cover)}" alt="" loading="lazy">`:'<em>🎮</em>'}</span>
    <span class="shelf-name">${esc(g.name)}</span>
    <span class="shelf-meta">${[firstPlatform(g),g.hours?`${g.hours}h`:STMAP[g.status]].filter(Boolean).join(' · ')}</span>
  </button>`;
}
function renderShelves(){
  const wrap=document.getElementById('library-shelves');
  if(!wrap)return;
  if(!games.length){wrap.innerHTML='';return;}
  const shelves=[
    ['继续玩','最近正在推进的游戏',newestFirst(games.filter(g=>g.status==='playing')).slice(0,8)],
    ['高分收藏','你给过高评价的作品',[...games].filter(g=>(g.rating||0)>=4).sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,8)],
    ['想玩清单','未来准备打开的世界',newestFirst(games.filter(g=>g.status==='wishlist')).slice(0,8)],
    ['复古主机','老机器和掌机记忆',newestFirst(games.filter(g=>platformMatches(g,'retro'))).slice(0,8)]
  ].filter(s=>s[2].length);
  wrap.innerHTML=shelves.map(([title,sub,items])=>`<section class="game-shelf">
    <div class="shelf-head"><div><span class="library-kicker">SHELF</span><h2>${title}</h2></div><p>${sub}</p></div>
    <div class="shelf-row">${items.map(shelfItem).join('')}</div>
  </section>`).join('');
}
function renderGameCard(g,i){
  const pft=(g.platforms||[]).slice(0,3).map(p=>`<span class="tag ${PTAG[p]||''}">${PFMAP[p]||p}</span>`).join('');
  const gnt=normalizeGameGenres(g.genres||[]).slice(0,2).map(gn=>`<span class="tag">${esc(genreLabel(gn))}</span>`).join('');
  return`<div class="gc" data-status="${g.status||''}" style="animation-delay:${Math.min(i*.025,.18)}s" onclick="openDetail('${gameId(g)}')">
    <div class="gc-art">
      ${g.cover?`<div class="gc-cover-bg" style="background-image:url('${esc(g.cover)}')"></div><img class="gc-cover" src="${esc(g.cover)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('no-cover')">`:'<div class="gc-ph">🎮</div>'}
      <span class="gc-status ${STCLS[g.status]||''}">${STMAP[g.status]||'未记录'}</span>
      <button class="gc-play-btn" onclick="event.stopPropagation();openPlayMode('game','${gameId(g)}')" aria-label="开始游玩">▶</button>
    </div>
    <div class="gc-body">
      <div class="gc-title-row">
        <h3>${esc(g.name)}</h3>
        <span>${g.year||''}</span>
      </div>
      <div class="gc-tags">${pft}${gnt}</div>
      ${g.review?`<p class="gc-rev">${esc(g.review)}</p>`:''}
      <div class="gc-foot">
        <span class="stars">${fmtRating(g.rating||0)}</span>
        <span class="htxt">${fmtHours(g.hours||0)}</span>
      </div>
    </div>
  </div>`;
}
function render(){
  renderGameGenreControls();
  const q=document.getElementById('q').value.toLowerCase();
  const fs=document.getElementById('fst').value,so=document.getElementById('fso').value;
  syncStatusTabs();
  let list=games.filter(g=>{
    if(q&&!g.name.toLowerCase().includes(q))return false;
    if(fs&&g.status!==fs)return false;
    if(!platformMatches(g,pff))return false;
    if(fGenre!=='all'&&!normalizeGameGenres(g.genres||[]).includes(fGenre))return false;
    if(fRating>0&&(g.rating||0)<fRating)return false;
    if(fCompletion&&g.completion!==fCompletion)return false;
    return true;
  });
  if(so==='rating')list.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if(so==='hours')list.sort((a,b)=>(b.hours||0)-(a.hours||0));
  else if(so==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'zh'));
  else list.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
  updateGameStats();
  renderHero();
  renderShelves();
  const gg=document.getElementById('gg');
  setLibraryViewMode(libraryViewMode);
  const hasFilter=q||fs||pff!=='all'||fGenre!=='all'||fRating>0||fCompletion;
  const count=document.getElementById('library-count');
  if(count)count.textContent=`${list.length} 款${hasFilter?' · 已筛选':''}`;
  if(!list.length){gg.innerHTML=`<div class="empty"><img src="css/可达鸭空状态.png" class="empty-psyduck" alt=""><div>${hasFilter?'没有符合条件的游戏':'还没有记录，点击「添加游戏」开始吧！'}</div></div>`;return;}
  gg.innerHTML=list.map(renderGameCard).join('');
}

/* 发现页 */
function openAdd(){
  renderGameGenreControls();
  editId=null;star=0;
  document.getElementById('m-title').textContent='添加游戏';
  document.getElementById('bdel').style.display='none';
  ['fn','fdev','fyr','frev','fcv','gs'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('fst2').value='playing';
  document.getElementById('fhr').value=0;document.getElementById('fhrv').textContent='0h';
  document.getElementById('fcp').value='';rcl('pc');rcl('gc');rcl('sc');setStar(0);
  document.getElementById('sr').style.display='none';
  document.getElementById('ov-edit').classList.add('on');
}
function openEdit(id){
  renderGameGenreControls();
  const g=games.find(x=>(x.id||x._id)==id);if(!g)return;
  editId=id;star=g.rating||0;
  document.getElementById('m-title').textContent='编辑记录';
  document.getElementById('bdel').style.display='none';
  document.getElementById('fn').value=g.name||'';document.getElementById('fdev').value=g.developer||'';
  document.getElementById('fyr').value=g.year||'';document.getElementById('fst2').value=g.status||'playing';
  document.getElementById('fhr').value=g.hours||0;document.getElementById('fhrv').textContent=(g.hours||0)+'h';
  document.getElementById('fcp').value=g.completion||'';document.getElementById('frev').value=g.review||'';
  document.getElementById('fcv').value=g.cover||'';document.getElementById('gs').value='';
  document.getElementById('sr').style.display='none';
  rcl('pc');(g.platforms||[]).forEach(p=>{const c=document.querySelector(`#pc [data-v="${p}"]`);if(c){const m={x:'onx',p:'onp',sw:'onsw',st:'onst',sg:'onsg'};const pm={xbox:'x',xbox360:'x',ps5:'p',ps4:'p',ps1:'p',ps2:'p',ps3:'p',psp:'p',vita:'p',switch:'sw',switch2:'sw',fc:'sw',sfc:'sw',n64:'sw',gc:'sw',wii:'sw',wiiu:'sw',gb:'sw',gba:'sw',nds:'sw','3ds':'sw',steam:'st',md:'sg',ss:'sg',dc:'sg',xbox_orig:'x'};c.classList.add(m[pm[p]]||'on');}});
  rcl('gc');normalizeGameGenres(g.genres||[]).forEach(gn=>{const c=document.querySelector(`#gc [data-v="${gn}"]`);if(c)c.classList.add('on');});
  rcl('sc');(g.styles||[]).forEach(s=>{const c=document.querySelector(`#sc [data-v="${s}"]`);if(c)c.classList.add('on');});
  setStar(g.rating||0);document.getElementById('ov-edit').classList.add('on');
}
function rcl(id){document.querySelectorAll(`#${id} .chip`).forEach(c=>{c.className='chip';});}
function tc(el,pfx){const cls=pfx?{'x':'onx','p':'onp','sw':'onsw','st':'onst','sg':'onsg'}[pfx]||'on':'on';if([...el.classList].some(c=>c.startsWith('on'))){el.className='chip';}else el.classList.add(cls);}
function setStar(n){star=n;document.querySelectorAll('.sb').forEach((b,i)=>b.classList.toggle('on',i<n));document.getElementById('shint').textContent=HINT[n]||'未评分';}
function onSrch(v){
  clearTimeout(srT);const sr=document.getElementById('sr');
  if(!v.trim()){sr.style.display='none';return;}
  srT=setTimeout(()=>{cQuery=v.trim();cOffset=0;hasMore=true;doSrch(true);},400);
}
async function doSrch(isNew=false){
  const sr=document.getElementById('sr');
  if(isNew){sr.style.display='block';sr.innerHTML='<div class="sr-msg">搜索中…</div>';sr.scrollTop=0;}
  else sr.insertAdjacentHTML('beforeend','<div class="sr-msg load-more">加载更多中…</div>');
  fetching=true;
  try{
    const res=await fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:cQuery,offset:cOffset})});
    const data=await res.json();
    const ldr=sr.querySelector('.load-more');if(ldr)ldr.remove();
    if(!data||!data.length){if(isNew)sr.innerHTML='<div class="sr-msg">未找到相关游戏</div>';else sr.insertAdjacentHTML('beforeend','<div class="sr-msg">没有更多了</div>');hasMore=false;fetching=false;return;}
    if(data.length<50)hasMore=false;
    const html=data.map(g=>`<div class="sri" onclick='fillG(${JSON.stringify(g).replace(/'/g,"&#39;")})'>
      ${g.cover?`<img class="sri-cv" src="${g.cover}" alt="">`:''}<div class="sri-info"><div class="sri-name">${esc(g.name)}</div><div class="sri-meta">${[g.year,g.platforms?.join(' / ')].filter(Boolean).join(' · ')}</div></div></div>`).join('');
    if(isNew)sr.innerHTML=html;else sr.insertAdjacentHTML('beforeend',html);
    cOffset+=50;fetching=false;
  }catch{const ldr=sr.querySelector('.load-more');if(ldr)ldr.remove();if(isNew)sr.innerHTML='<div class="sr-msg" style="color:var(--danger)">搜索失败</div>';fetching=false;}
}
document.getElementById('sr').addEventListener('scroll',function(){if(fetching||!hasMore)return;if(this.scrollHeight-this.scrollTop-this.clientHeight<30)doSrch(false);});
function fillG(g){
  document.getElementById('fn').value=g.name||'';document.getElementById('fdev').value=g.developer||'';
  document.getElementById('fyr').value=g.year||'';document.getElementById('fcv').value=g.cover||'';
  rcl('pc');(g.platforms||[]).forEach(p=>{const pv=p.toLowerCase().includes('xbox')?'xbox':p.toLowerCase().includes('playstation')||p.includes('PS')?'ps5':p.toLowerCase().includes('switch')?'switch':p.toLowerCase().includes('pc')||p.toLowerCase().includes('windows')?'steam':null;if(pv){const c=document.querySelector(`#pc [data-v="${pv}"]`);if(c){const m={xbox:'onx',ps5:'onp',switch:'onsw',steam:'onst'};c.classList.add(m[pv]||'on');}}});
  rcl('gc');normalizeGameGenres(g.genres||[]).forEach(gn=>{const c=document.querySelector(`#gc [data-v="${gn}"]`);if(c)c.classList.add('on');});
  document.getElementById('sr').style.display='none';document.getElementById('gs').value='';
}
async function saveGame(){
  const name=document.getElementById('fn').value.trim();if(!name){document.getElementById('fn').focus();return;}
  const pls=[...document.querySelectorAll('#pc .chip')].filter(c=>c.className!=='chip').map(c=>c.dataset.v).filter(Boolean);
  const gns=[...document.querySelectorAll('#gc .chip')].filter(c=>c.className!=='chip').map(c=>c.dataset.v).filter(Boolean);
  const sts=[...document.querySelectorAll('#sc .chip')].filter(c=>c.className!=='chip').map(c=>c.dataset.v).filter(Boolean);
  const p={name,platforms:pls,genres:gns,styles:sts,developer:document.getElementById('fdev').value.trim(),year:parseInt(document.getElementById('fyr').value)||null,status:document.getElementById('fst2').value,hours:parseInt(document.getElementById('fhr').value)||0,completion:document.getElementById('fcp').value,rating:star,review:document.getElementById('frev').value.trim(),cover:document.getElementById('fcv').value.trim()};
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user){
    if(editId){const{error}=await db.from('games').update(p).eq('id',editId).eq('user_id',user.id);if(error){alert('更新失败：'+error.message);return;}const i=games.findIndex(g=>g.id==editId);if(i>-1)games[i]={...games[i],...p};}
    else{const{data,error}=await db.from('games').insert({...p,user_id:user.id}).select().single();if(error){alert('添加失败：'+error.message);return;}if(data)games.unshift(data);}
  }else{
    if(editId){const i=games.findIndex(g=>g._id==editId);if(i>-1)games[i]={...games[i],...p};}
    else games.unshift({_id:Date.now().toString(36)+Math.random().toString(36).slice(2),created_at:new Date().toISOString(),...p});
    localStorage.setItem('gj',JSON.stringify(games));
  }
  if(window.partnerTrackEvent)window.partnerTrackEvent('game_log');
  closeOv('ov-edit');render();refreshStatsIfVisible();
}
async function delGame(){
  if(!editId||!confirm('确认删除这款游戏？'))return;
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user)await db.from('games').delete().eq('id',editId).eq('user_id',user.id);
  games=games.filter(g=>(g.id||g._id)!=editId);
  if(!user)localStorage.setItem('gj',JSON.stringify(games));
  document.querySelectorAll('.ov').forEach(o=>o.classList.remove('on'));render();refreshStatsIfVisible();
}
function go(pg,btn){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));
  document.getElementById('pg-'+pg).classList.add('on');
  if(btn)btn.classList.add('on');
  if(pg==='stats')drawCharts();
  if(pg==='disc'&&document.getElementById('rank-list').children.length<=1)loadDisc();
  if(pg==='pkm'){
    if(!window._pkmInited){window._pkmInited=true;initPkm();}
    else{loadTodayPkm(true);} // 每次切回来都换一只
  }
  if(pg==='anime'&&!window._animeInited){window._animeInited=true;initMediaList('anime');}
  if(pg==='manga'&&!window._mangaInited){window._mangaInited=true;initMediaList('manga');}
  if(pg==='battle'&&!window._battleInited){window._battleInited=true;initBattle();}
  if(pg==='partner'&&!window._partnerInited){window._partnerInited=true;initPartner();}
  if(window.updatePartnerFloat)window.updatePartnerFloat(pg);
  if(window.updateHeaderChromeState)window.updateHeaderChromeState();
}
function openSteamModal(){
  const saved=localStorage.getItem('steamId');
  const inp=document.getElementById('steam-modal-inp');
  if(saved)inp.value=saved;
  document.getElementById('steam-modal-msg').textContent='';
  document.getElementById('ov-steam').classList.add('on');
  setTimeout(()=>inp.focus(),80);
}
async function syncSteam(){
  const sid=document.getElementById('steam-modal-inp').value.trim();
  const msg=document.getElementById('steam-modal-msg'),btn=document.getElementById('steam-modal-btn');
  if(!sid){msg.style.color='var(--danger)';msg.textContent='请先填写 Steam ID';return;}
  localStorage.setItem('steamId',sid);btn.disabled=true;btn.textContent='同步中…';
  msg.style.color='var(--t3)';msg.textContent='正在读取 Steam 库…';
  try{
    const res=await fetch(STEAM_PROXY,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`},body:JSON.stringify({steamId:sid})});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const{games:sg}=await res.json();
    if(!sg?.length){msg.style.color='var(--warn)';msg.textContent='未找到游戏，请确认库已设为公开';return;}
    const{data:{session}}=await db.auth.getSession();const user=session?.user;
    let added=0,updated=0;
    for(const g of sg){
      const ex=games.find(x=>x.name.toLowerCase().trim()===g.name.toLowerCase().trim());
      if(ex){if(g.hours>(ex.hours||0)){const nd={hours:g.hours};if(user)await db.from('games').update(nd).eq('id',ex.id).eq('user_id',user.id);const i=games.findIndex(x=>(x.id||x._id)===(ex.id||ex._id));if(i>-1)games[i]={...games[i],...nd};updated++;}}
      else if(g.hours>0){
        const ng={name:g.name,platforms:['steam'],genres:[],styles:[],developer:'',year:null,status:g.hours>=10?'playing':'wishlist',hours:g.hours,completion:'',rating:0,review:'',cover:g.cover};
        if(user){const{data,error}=await db.from('games').insert({...ng,user_id:user.id}).select().single();if(!error&&data)games.unshift(data);}
        else{games.unshift({_id:Date.now().toString(36)+Math.random().toString(36).slice(2),created_at:new Date().toISOString(),...ng});localStorage.setItem('gj',JSON.stringify(games));}
        added++;
      }
    }
    msg.style.color='var(--acc2)';msg.textContent=`✓ 新增 ${added} 款，更新 ${updated} 款时长`;
    render();refreshStatsIfVisible();
  }catch(e){msg.style.color='var(--danger)';msg.textContent=`同步失败：${e.message}`;}
  finally{btn.disabled=false;btn.textContent='↓ 开始同步';}
}

