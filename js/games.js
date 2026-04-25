function setPF(p,el){pff=p;document.querySelectorAll('.pfchip').forEach(c=>c.classList.remove('on'));el.classList.add('on');render();}
function render(){
  const q=document.getElementById('q').value.toLowerCase();
  const fs=document.getElementById('fst').value,so=document.getElementById('fso').value;
  let list=games.filter(g=>{
    if(q&&!g.name.toLowerCase().includes(q))return false;
    if(fs&&g.status!==fs)return false;
    if(pff!=='all'&&!(g.platforms||[]).some(p=>PFG[p]===pff))return false;
    return true;
  });
  if(so==='rating')list.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if(so==='hours')list.sort((a,b)=>(b.hours||0)-(a.hours||0));
  else if(so==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'zh'));
  else list.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
  document.getElementById('s-total').textContent=games.length;
  document.getElementById('s-pl').textContent=games.filter(g=>g.status==='playing').length;
  document.getElementById('s-dn').textContent=games.filter(g=>g.status==='done').length;
  document.getElementById('s-hr').textContent=games.reduce((s,g)=>s+(g.hours||0),0);
  const rated=games.filter(g=>g.rating>0);
  document.getElementById('s-av').textContent=rated.length?(rated.reduce((s,g)=>s+g.rating,0)/rated.length).toFixed(1):'—';
  const gg=document.getElementById('gg');
  if(!list.length){gg.innerHTML=`<div class="empty"><img src="css/可达鸭空状态.png" class="empty-psyduck" alt=""><div>${q||fs||pff!=='all'?'没有符合条件的游戏':'还没有记录，点击「添加游戏」开始吧！'}</div></div>`;return;}
  gg.innerHTML=list.map((g,i)=>{
    const pft=(g.platforms||[]).map(p=>`<span class="tag ${PTAG[p]||''}">${PFMAP[p]||p}</span>`).join('');
    const gnt=(g.genres||[]).slice(0,2).map(gn=>`<span class="tag">${gn}</span>`).join('');
    const dc={playing:'var(--acc)',done:'var(--acc2)',wishlist:'var(--warn)',dropped:'var(--t3)'}[g.status]||'var(--t3)';
    return`<div class="gc" data-status="${g.status||''}" style="animation-delay:${Math.min(i*.03,.2)}s;display:flex;flex-direction:column" onclick="openDetail('${g.id||g._id}')">
      ${g.cover?`<div class="gc-cover-wrap"><div class="gc-cover-bg" style="background-image:url('${esc(g.cover)}')"></div><img class="gc-cover" src="${esc(g.cover)}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`:''}
      <div class="gc-ph" style="${g.cover?'display:none':''}">🎮</div>
      <div style="padding:.9rem;flex:1;display:flex;flex-direction:column">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px">
          <div style="font-size:.92rem;font-weight:500;line-height:1.3;flex:1">${esc(g.name)}</div>
          <div style="width:7px;height:7px;border-radius:50%;background:${dc};margin-top:5px;flex-shrink:0;margin-left:8px"></div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">${pft}${gnt}</div>
        ${g.review?`<div class="gc-rev">${esc(g.review)}</div>`:''}
        <div style="flex:1"></div>
        <div class="gc-foot"><div class="stars">${'★'.repeat(g.rating||0)}${'☆'.repeat(5-(g.rating||0))}</div><div style="display:flex;align-items:center;gap:10px">${g.hours?`<span class="htxt">${g.hours}h</span>`:''}<span class="stxt ${STCLS[g.status]||''}">${STMAP[g.status]||''}</span></div></div>
      </div>
      <button class="gc-play-btn" onclick="event.stopPropagation();openPlayMode('game','${g.id||g._id}')">▶ 开始游玩</button>
    </div>`;
  }).join('');
}

/* 发现页 */
function openAdd(){
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
  rcl('pc');(g.platforms||[]).forEach(p=>{const c=document.querySelector(`#pc [data-v="${p}"]`);if(c){const m={x:'onx',p:'onp',sw:'onsw',st:'onst'};const pm={xbox:'x',xbox360:'x',ps5:'p',ps4:'p',switch:'sw',switch2:'sw',steam:'st'};c.classList.add(m[pm[p]]||'on');}});
  rcl('gc');(g.genres||[]).forEach(gn=>{const c=document.querySelector(`#gc [data-v="${gn}"]`);if(c)c.classList.add('on');});
  rcl('sc');(g.styles||[]).forEach(s=>{const c=document.querySelector(`#sc [data-v="${s}"]`);if(c)c.classList.add('on');});
  setStar(g.rating||0);document.getElementById('ov-edit').classList.add('on');
}
function rcl(id){document.querySelectorAll(`#${id} .chip`).forEach(c=>{c.className='chip';});}
function tc(el,pfx){const cls=pfx?{'x':'onx','p':'onp','sw':'onsw','st':'onst'}[pfx]||'on':'on';if([...el.classList].some(c=>c.startsWith('on'))){el.className='chip';}else el.classList.add(cls);}
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
  rcl('gc');(g.genres||[]).forEach(gn=>{const c=document.querySelector(`#gc [data-v="${gn}"]`);if(c)c.classList.add('on');});
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
  closeOv('ov-edit');render();
}
async function delGame(){
  if(!editId||!confirm('确认删除这款游戏？'))return;
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user)await db.from('games').delete().eq('id',editId).eq('user_id',user.id);
  games=games.filter(g=>(g.id||g._id)!=editId);
  if(!user)localStorage.setItem('gj',JSON.stringify(games));
  document.querySelectorAll('.ov').forEach(o=>o.classList.remove('on'));render();
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
}
async function syncSteam(){
  const sid=document.getElementById('steam-id-inp').value.trim();
  const msg=document.getElementById('steam-msg'),btn=document.getElementById('steam-sync-btn');
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
    msg.style.color='var(--acc2)';msg.textContent=`✓ 新增 ${added} 款，更新 ${updated} 款时长`;render();
  }catch(e){msg.style.color='var(--danger)';msg.textContent=`同步失败：${e.message}`;}
  finally{btn.disabled=false;btn.textContent='↓ 同步 Steam 库';}
}

