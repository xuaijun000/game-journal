let discMode='rating',discPF='all',discLoadToken=0,discBoardGroup='modern',discBoardToken=0;
window._gtlProgressContext='';
window._mtlProgressContext='';

function switchDiscTab(el){document.querySelectorAll('.disc-tab').forEach(t=>t.classList.remove('on'));el.classList.add('on');discMode=el.dataset.mode;loadDisc();}
function setDiscPF(pf,el){document.querySelectorAll('.disc-pfchip').forEach(c=>c.classList.remove('on'));el.classList.add('on');discPF=pf;loadDisc();}
function setDiscBoardGroup(group,el){
  discBoardGroup=group;
  document.querySelectorAll('.disc-board-tab').forEach(t=>t.classList.remove('on'));
  if(el)el.classList.add('on');
  loadDiscPlatformBoards();
}
async function loadDisc(){
  const token=++discLoadToken;
  const rl=document.getElementById('rank-list');
  rl.innerHTML='<div class="disc-loading">加载中<span class="disc-loading-dots"><span></span><span></span><span></span></span></div>';
  syncDiscPlatformBoardsVisibility();
  if(discPF==='all')loadDiscPlatformBoards();
  try{
    const res=await fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({igdbRaw:buildDiscQuery(discMode,discPF,30)})});
    if(token!==discLoadToken)return;
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    if(token!==discLoadToken)return;
    if(!Array.isArray(data)||!data.length){rl.innerHTML='<div class="disc-loading">暂无数据</div>';return;}
    renderRankList(data);
  }catch(e){if(token===discLoadToken)rl.innerHTML=`<div class="disc-loading" style="color:var(--danger)">加载失败：${e.message}</div>`;}
}
function buildDiscQuery(mode,pfId='all',limit=30){
  const now=Math.floor(Date.now()/1000);
  const pf=pfId!=='all'?`& platforms = (${pfId})`:'';
  const fields='fields name,cover.url,total_rating,total_rating_count,platforms.id,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,summary,storyline,genres.name,url;';
  const queries={
    rating:`${fields}where total_rating_count > 200 & total_rating != null ${pf};sort total_rating desc; limit ${limit};`,
    recent:`${fields}where first_release_date > ${now-365*24*3600} & first_release_date < ${now} & total_rating_count > 20 ${pf};sort first_release_date desc; limit ${limit};`,
    hype:`fields name,cover.url,hypes,platforms.id,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,summary,storyline,genres.name,url;where first_release_date > ${now} & hypes != null ${pf};sort hypes desc; limit ${limit};`,
    popular:`${fields}where total_rating_count > 50 ${pf};sort total_rating_count desc; limit ${limit};`
  };
  return queries[mode]||queries.rating;
}
let discDataCache=[];
let discBoardCache={};
const DISC_PLATFORM_BOARD_GROUPS={
  modern:[
    {key:'pc',label:'PC',pf:'6'},
    {key:'xbox',label:'Xbox Series / One',pf:'49,169'},
    {key:'ps5',label:'PS5',pf:'167'},
    {key:'switch',label:'Switch',pf:'130'},
    {key:'ps4',label:'PS4',pf:'48'},
    {key:'xbox360',label:'Xbox 360',pf:'12'}
  ],
  retro:[
    {key:'ps-retro',label:'PlayStation 中古',pf:'7,8,9,38,46'},
    {key:'nintendo-home',label:'任天堂家用机',pf:'18,19,4,21,5,41'},
    {key:'nintendo-handheld',label:'任天堂掌机',pf:'33,22,24,20,37'},
    {key:'sega-retro',label:'SEGA 中古',pf:'64,29,32,23'},
    {key:'xbox-retro',label:'Xbox / Xbox 360',pf:'11,12'},
    {key:'arcade-retro',label:'街机 / Neo Geo',pf:'52,80'}
  ]
};
const DISC_MODE_LABEL={rating:'综合评分',recent:'近期新游',hype:'期待新作',popular:'人气热榜'};
function currentDiscBoards(){return DISC_PLATFORM_BOARD_GROUPS[discBoardGroup]||DISC_PLATFORM_BOARD_GROUPS.modern;}
function syncDiscPlatformBoardsVisibility(){
  const wrap=document.querySelector('.disc-platform-wrap');
  if(wrap)wrap.style.display=discPF==='all'?'':'none';
}
function normalizeDiscGame(g){
  const cover=g.cover?.url?g.cover.url.replace('t_thumb','t_cover_big'):null;
  const dev=(g.involved_companies||[]).find(c=>c.developer)?.company?.name||'';
  const year=g.first_release_date?new Date(g.first_release_date*1000).getFullYear():'';
  return{name:g.name,cover,developer:dev,year:year||null,rating:g.total_rating||null,ratingCount:g.total_rating_count||null,hypes:g.hypes||null,platforms:g.platforms||[],genres:normalizeGameGenres(g.genres||[]),summary:g.summary||'',storyline:g.storyline||'',url:g.url||''};
}
function renderRankList(data){
  const rl=document.getElementById('rank-list');
  discDataCache=data.map(normalizeDiscGame);
  const myNames=new Set(games.map(g=>g.name.toLowerCase().trim()));
  rl.innerHTML=data.map((g,i)=>{
    const rank=i+1;
    const numCls=rank===1?'top1':rank===2?'top2':rank===3?'top3':'';
    const cover=g.cover?.url?g.cover.url.replace('t_thumb','t_cover_big'):null;
    let sv='—',sl='评分';
    if((discMode==='rating'||discMode==='recent')&&g.total_rating){sv=Math.round(g.total_rating);sl='综合分';}
    else if(discMode==='hype'&&g.hypes){sv=g.hypes;sl='期待数';}
    else if(discMode==='popular'&&g.total_rating_count){sv=g.total_rating_count>9999?(g.total_rating_count/1000).toFixed(1)+'k':g.total_rating_count;sl='评分人数';}
    const year=g.first_release_date?new Date(g.first_release_date*1000).getFullYear():'';
    const dev=(g.involved_companies||[]).find(c=>c.developer)?.company?.name||'';
    const pft=(g.platforms||[]).slice(0,4).map(p=>{const pid=String(p.id||'');const cls=pid==='6'?'tst':pid==='49'||pid==='169'?'tx':pid==='130'?'tsw':pid==='48'||pid==='167'?'tp':'';return`<span class="tag ${cls}" style="font-size:.65rem;padding:1px 6px">${p.name}</span>`;}).join('');
    const added=myNames.has((g.name||'').toLowerCase().trim());
    const bid=`ab${i}`;
    const gj=JSON.stringify({name:g.name,cover,developer:dev,year:year||null}).replace(/'/g,"&#39;");
    return`<div class="rank-item" style="animation-delay:${Math.min(i*.025,.5)}s;cursor:pointer" onclick="openDiscDetailByIdx(${i})">
      <div class="rank-num ${numCls}">${rank}</div>
      ${cover?`<img class="rank-cover" src="${cover}" alt="" loading="lazy" onerror="this.style.display='none'">`:
              '<div class="rank-cover-ph">🎮</div>'}
      <div class="rank-info"><div class="rank-name" title="${esc(g.name)}">${esc(g.name)}</div>
      <div class="rank-meta">${dev?`<span>${esc(dev)}</span>`:''} ${year?`<span>${year}</span>`:''}</div>
      <div class="rank-pftags">${pft}</div></div>
      <div class="rank-score"><span class="rank-score-val">${sv}</span><span class="rank-score-lbl">${sl}</span></div>
      <button class="rank-add-btn ${added?'added':''}" id="${bid}" onclick="event.stopPropagation();${added?'':  `addFromDisc(${gj},'${bid}')`}">${added?'✓ 已收录':'+ 想玩'}</button>
    </div>`;
  }).join('');
}
async function loadDiscPlatformBoards(){
  const token=++discBoardToken;
  const boards=currentDiscBoards();
  renderDiscBoardShells(boards);
  try{
    const results=await Promise.all(boards.map(async b=>{
      const res=await fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({igdbRaw:buildDiscQuery(discMode,b.pf,6)})});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      return{...b,data:Array.isArray(data)?data:[]};
    }));
    if(token!==discBoardToken)return;
    results.forEach(b=>{
      discBoardCache[b.key]=b.data.map(normalizeDiscGame);
      renderDiscPlatformBoard(b.key,discBoardCache[b.key]);
    });
  }catch(e){
    if(token!==discBoardToken)return;
    boards.forEach(b=>setDiscBoardHTML(b.key,`<div class="disc-board-loading" style="color:var(--danger)">加载失败</div>`));
  }
}
function renderDiscBoardShells(boards){
  const wrap=document.getElementById('disc-platform-boards');
  if(!wrap)return;
  wrap.innerHTML=boards.map(b=>`
    <section class="disc-platform-board">
      <div class="disc-board-head"><h3>${esc(b.label)} 独立榜</h3><span>${esc(DISC_MODE_LABEL[discMode]||'IGDB')}</span></div>
      <div class="disc-board-list" id="disc-board-${esc(b.key)}"><div class="disc-board-loading">加载中…</div></div>
    </section>`).join('');
}
function setDiscBoardHTML(key,html){const el=document.getElementById(`disc-board-${key}`);if(el)el.innerHTML=html;}
function discBoardScore(g){
  if(discMode==='hype')return g.hypes||'—';
  if(discMode==='popular')return g.ratingCount?(g.ratingCount>9999?(g.ratingCount/1000).toFixed(1)+'k':g.ratingCount):'—';
  return g.rating?Math.round(g.rating):'—';
}
function renderDiscPlatformBoard(key,list){
  if(!list.length){setDiscBoardHTML(key,'<div class="disc-board-loading">暂无数据</div>');return;}
  setDiscBoardHTML(key,list.map((g,i)=>`
    <button class="disc-board-item" onclick="openDiscBoardDetail('${key}',${i})">
      <span class="disc-board-rank">${i+1}</span>
      ${g.cover?`<img src="${esc(g.cover)}" alt="" loading="lazy" onerror="this.style.display='none'">`:'<span class="disc-board-ph">🎮</span>'}
      <span class="disc-board-main"><span>${esc(g.name||'未命名')}</span><em>${esc([g.developer,g.year].filter(Boolean).join(' · ')||'IGDB')}</em></span>
      <strong>${esc(String(discBoardScore(g)))}</strong>
    </button>`).join(''));
}
function openDiscBoardDetail(key,idx){const g=discBoardCache[key]?.[idx];if(g)openDiscDetail(g);}
async function addFromDisc(g,bid){
  const btn=document.getElementById(bid);if(!btn||btn.classList.contains('added'))return;
  btn.textContent='添加中…';btn.disabled=true;
  const ng={name:g.name,platforms:[],genres:g.genres||[],styles:[],developer:g.developer||'',year:g.year||null,status:'wishlist',hours:0,completion:'',rating:0,review:'',cover:g.cover||''};
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user){const{data,error}=await db.from('games').insert({...ng,user_id:user.id}).select().single();if(!error&&data)games.unshift(data);}
  else{games.unshift({_id:Date.now().toString(36)+Math.random().toString(36).slice(2),created_at:new Date().toISOString(),...ng});localStorage.setItem('gj',JSON.stringify(games));}
  btn.textContent='✓ 已收录';btn.classList.add('added');btn.disabled=false;
}

/* 详情弹窗 */
let discCurrentGame=null,discChatOpen=false,discChatHistory=[];
const _discZhCache={};
async function translateDiscDesc(g){
  const key=g.name;
  const sumEl=document.getElementById('disc-summary');
  const stEl=document.getElementById('disc-storyline');
  if(_discZhCache[key]){
    const c=_discZhCache[key];
    if(discCurrentGame?.name!==key)return;
    if(c.summary)sumEl.textContent=c.summary;
    if(c.storyline&&stEl){stEl.textContent=c.storyline;stEl.style.display='block';}
    return;
  }
  if(!g.summary&&!g.storyline)return;
  const hint=document.createElement('div');
  hint.id='disc-trans-hint';
  hint.style.cssText='font-size:.66rem;color:var(--t3);margin-top:6px;font-family:"DM Mono",monospace;letter-spacing:.04em';
  hint.textContent='⟳ 翻译中…';
  sumEl.after(hint);
  try{
    let prompt='将以下游戏描述翻译为简体中文，保持原有游戏氛围与语气，直接输出译文：\n\n'+(g.summary||'');
    if(g.storyline)prompt+='\n\n====\n\n'+g.storyline;
    const res=await fetch(`${SB_URL}/functions/v1/gemini-proxy`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:800,temperature:0.2}})});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    const translated=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'';
    if(!translated)throw new Error('empty');
    const parts=translated.split(/={3,}/).map(s=>s.trim());
    _discZhCache[key]={summary:parts[0]||'',storyline:parts[1]||''};
    document.getElementById('disc-trans-hint')?.remove();
    if(discCurrentGame?.name!==key)return;
    if(parts[0])sumEl.textContent=parts[0];
    if(parts[1]&&stEl){stEl.textContent=parts[1];stEl.style.display='block';}
  }catch{document.getElementById('disc-trans-hint')?.remove();}
}
function openDiscDetailByIdx(idx){if(discDataCache[idx])openDiscDetail(discDataCache[idx]);}
function openDiscDetail(g){
  discCurrentGame=g;discChatOpen=false;discChatHistory=[];
  document.getElementById('disc-trans-hint')?.remove();
  const cover=g.cover;
  document.getElementById('disc-hero-bg').style.backgroundImage=cover?`url(${cover})`:'none';
  const img=document.getElementById('disc-cover');
  if(cover){img.src=cover;img.style.display='block';}else img.style.display='none';
  document.getElementById('disc-title').textContent=g.name||'';
  document.getElementById('disc-dev').textContent=g.developer||'';
  document.getElementById('disc-year').textContent=g.year||'';
  document.getElementById('disc-score').textContent=g.rating?Math.round(g.rating)+' 分':'';
  document.getElementById('disc-rcount').textContent=g.ratingCount?(g.ratingCount>999?(g.ratingCount/1000).toFixed(1)+'k':g.ratingCount)+' 人评分':'';
  const pft=(g.platforms||[]).slice(0,5).map(p=>{const pid=String(p.id||'');const cls=pid==='6'?'tst':pid==='49'||pid==='169'?'tx':pid==='130'?'tsw':pid==='48'||pid==='167'?'tp':'';return`<span class="tag ${cls}" style="font-size:.68rem">${p.name}</span>`;}).join('');
  document.getElementById('disc-ptags').innerHTML=pft;
  const sumEl=document.getElementById('disc-summary');
  const stEl=document.getElementById('disc-storyline');
  const cached=_discZhCache[g.name];
  sumEl.textContent=(cached?.summary)||g.summary||'暂无简介';
  if((cached?.storyline)||g.storyline){stEl.textContent=(cached?.storyline)||g.storyline;stEl.style.display='block';}else stEl.style.display='none';
  if(!cached&&(g.summary||g.storyline))translateDiscDesc(g);
  const link=document.getElementById('disc-igdb-link');link.href=g.url||`https://www.igdb.com/search?utf8=✓&q=${encodeURIComponent(g.name)}`;link.textContent='↗ IGDB';
  const myNames=new Set(games.map(x=>x.name.toLowerCase().trim()));
  const addBtn=document.getElementById('disc-add-btn');
  if(myNames.has((g.name||'').toLowerCase().trim())){addBtn.textContent='✓ 已收录';addBtn.classList.add('added');addBtn.disabled=true;}
  else{addBtn.textContent='+ 想玩';addBtn.classList.remove('added');addBtn.disabled=false;addBtn.onclick=()=>discAddGame();}
  // 重置AI聊天区域和按钮
  document.getElementById('disc-chat-area').classList.remove('open');
  document.getElementById('disc-ai-btn').textContent='⬡ 和 AI 聊聊这款游戏';
  document.getElementById('disc-ai-btn').onclick=()=>toggleDiscChat();
  document.getElementById('disc-chat-msgs').innerHTML='';
  document.getElementById('disc-chat-quick').innerHTML='';
  document.getElementById('ov-disc').classList.add('on');
}
async function discAddGame(){
  const g=discCurrentGame;if(!g)return;
  const btn=document.getElementById('disc-add-btn');btn.textContent='添加中…';btn.disabled=true;
  const ng={name:g.name,platforms:[],genres:g.genres||[],styles:[],developer:g.developer||'',year:g.year||null,status:'wishlist',hours:0,completion:'',rating:0,review:'',cover:g.cover||''};
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user){const{data,error}=await db.from('games').insert({...ng,user_id:user.id}).select().single();if(!error&&data)games.unshift(data);}
  else{games.unshift({_id:Date.now().toString(36)+Math.random().toString(36).slice(2),created_at:new Date().toISOString(),...ng});localStorage.setItem('gj',JSON.stringify(games));}
  btn.textContent='✓ 已收录';btn.classList.add('added');
}
function toggleDiscChat(){
  discChatOpen=!discChatOpen;
  document.getElementById('disc-chat-area').classList.toggle('open',discChatOpen);
  document.getElementById('disc-ai-btn').textContent=discChatOpen?'收起 AI 对话':'⬡ 和 AI 聊聊这款游戏';
  if(discChatOpen){
    // 每次打开都重新初始化，确保用的是当前 discCurrentGame
    document.getElementById('disc-chat-msgs').innerHTML='';
    document.getElementById('disc-chat-quick').innerHTML='';
    discChatHistory=[];
    initDiscChat();
  }
  if(discChatOpen)setTimeout(()=>{document.getElementById('disc-chat-msgs').scrollTop=9999;},100);
}
function initDiscChat(){
  const g=discCurrentGame;if(!g)return;
  document.getElementById('disc-chat-name').textContent=g.name;discChatHistory=[];
  const qs=['这款游戏的玩法特色是什么？','剧情或世界观有什么亮点？','适合什么类型的玩家？','有什么需要注意的入坑须知？'];
  document.getElementById('disc-chat-quick').innerHTML=qs.map(q=>`<button class="qq" onclick="sendDiscQuick('${q.replace(/'/g,"&#39;")}')">${q}</button>`).join('');
  const score=g.rating?`综合评分 ${Math.round(g.rating)} 分，${g.ratingCount||0} 人评价`:'';
  const greetText='《'+g.name+'》的情报已就绪。\n\n'+(score?score+'\n\n':'')+(g.summary?g.summary.slice(0,80)+'…\n\n':'')+'想了解什么？玩法、剧情、入坑建议……直接问。';
  addDiscBubble(greetText,'ai',false);
}
function sendDiscQuick(q){document.getElementById('disc-chat-inp').value=q;sendDiscAIMsg();}
function addDiscBubble(text,role,animate){
  const msgs=document.getElementById('disc-chat-msgs');
  const div=document.createElement('div');div.className=`cmsg ${role==='ai'?'ai-msg':'user-msg'}`;
  div.innerHTML=`<div class="cmsg-av ${role==='ai'?'ai-av':'usr-av'}">${role==='ai'?'AI':'我'}</div><div class="cmsg-bbl"></div>`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
  const bbl=div.querySelector('.cmsg-bbl');
  if(animate&&role==='ai'){let i=0;const spd=text.length>400?15:25;const t=()=>{if(i<text.length){bbl.textContent+=text[i++];msgs.scrollTop=msgs.scrollHeight;setTimeout(t,1000/spd);}};t();}
  else{bbl.textContent=text;msgs.scrollTop=msgs.scrollHeight;}
}
async function sendDiscAIMsg(){
  const inp=document.getElementById('disc-chat-inp');const v=inp.value.trim();if(!v)return;
  inp.value='';addDiscBubble(v,'user',false);discChatHistory.push({role:'user',parts:[{text:v}]});
  const snd=document.getElementById('disc-chat-snd');snd.disabled=true;
  const msgs=document.getElementById('disc-chat-msgs');
  const td=document.createElement('div');td.className='cmsg ai-msg';td.id='disc-typing';
  td.innerHTML='<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  msgs.appendChild(td);msgs.scrollTop=msgs.scrollHeight;
  const g=discCurrentGame;
  const reinject=discChatHistory.length>0&&discChatHistory.length%8===0;
  const sys=`你现在是《${g.name}》的专属情报员。先在内心唤起这款游戏的世界——它的氛围、色调、故事内核。从那个世界里说话，不是在介绍它。
【游戏信息】开发商：${g.developer||'未知'}，${g.year||'未知'}年。评分：${g.rating?Math.round(g.rating)+'分':'未知'}。简介：${g.summary||'无'}
【禁止】用"当然！""好的！"开头。禁止说话像客服。
【重要】价格、发售日等现实问题必须直接回答。
${reinject?`【提醒】保持《${g.name}》的世界观气质说话。`:''}
回答要求：中文，400字左右，纯文字不用Markdown符号。`;
  try{
    const res=await fetch(`${SB_URL}/functions/v1/gemini-proxy`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:discChatHistory,generationConfig:{maxOutputTokens:1000,temperature:1.1}})});
    if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err?.error?.message||`HTTP ${res.status}`);}
    const data=await res.json();
    const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI 暂时离线）';
    const t=document.getElementById('disc-typing');if(t)t.remove();
    addDiscBubble(reply,'ai',true);
    discChatHistory.push({role:'model',parts:[{text:reply}]});
    if(discChatHistory.length>30)discChatHistory=discChatHistory.slice(-30);
  }catch(e){const t=document.getElementById('disc-typing');if(t)t.remove();addDiscBubble(`连接失败：${e.message}`,'ai',false);}
  snd.disabled=false;inp.focus();
}
