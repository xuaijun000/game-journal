/* ===== 动漫/漫画 ===== */
const mediaRankCache={anime:{},manga:{}};
let currentMediaMode={anime:'top',manga:'top'};
let mediaData={anime:[],manga:[]};
let editMediaId=null,currentMediaType='anime',mediaStar=0,mediaSearchT=null;
let mediaChatOpen=false,mediaChatHistory=[],mediaCurrentItem=null;

async function initMediaList(type){
  const{data:{session}}=await db.auth.getSession();
  if(session?.user){const{data}=await db.from(type+'_list').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false});mediaData[type]=data||[];}
  else{try{mediaData[type]=JSON.parse(localStorage.getItem(type+'_list')||'[]');}catch{mediaData[type]=[];}}
  renderMedia(type);
}
function switchMediaTab(type,tab,el){
  document.querySelectorAll(`#pg-${type} .disc-tab-btn`).forEach(b=>{if(b.id===`${type}-tab-list`||b.id===`${type}-tab-rank`)b.classList.remove('on');});
  el.classList.add('on');
  document.getElementById(`${type}-panel-list`).style.display=tab==='list'?'block':'none';
  document.getElementById(`${type}-panel-rank`).style.display=tab==='rank'?'block':'none';
  if(tab==='rank'&&!mediaRankCache[type][currentMediaMode[type]])loadMediaRank(type,currentMediaMode[type]);
}
function setMediaRankMode(type,mode,el){
  const container=el.parentElement;container.querySelectorAll('.disc-tab-btn').forEach(b=>b.classList.remove('on'));el.classList.add('on');
  currentMediaMode[type]=mode;loadMediaRank(type,mode);
}
async function loadMediaRank(type,mode){
  const list=document.getElementById(`${type}-rank-list`);
  if(mediaRankCache[type][mode]){renderMediaRank(type,mediaRankCache[type][mode]);return;}
  list.innerHTML='<div class="disc-loading">加载中<span class="disc-loading-dots"><span></span><span></span><span></span></span></div>';
  try{
    let url='https://api.jikan.moe/v4/';
    if(type==='anime'){if(mode==='top')url+='top/anime?filter=bypopularity';else if(mode==='airing')url+='seasons/now';else if(mode==='upcoming')url+='seasons/upcoming';else if(mode==='movie')url+='top/anime?type=movie';}
    else{if(mode==='top')url+='top/manga?filter=bypopularity';else if(mode==='manga')url+='top/manga?type=manga';else if(mode==='manhwa')url+='top/manga?type=manhwa';else if(mode==='novel')url+='top/manga?type=novel';}
    const res=await fetch(url);const data=await res.json();
    mediaRankCache[type][mode]=data.data.slice(0,25);renderMediaRank(type,mediaRankCache[type][mode]);
  }catch(e){list.innerHTML='<div class="disc-loading" style="color:var(--danger)">加载失败</div>';}
}
let mediaRankDataCache={anime:[],manga:[]};
function renderMediaRank(type,data){
  const list=document.getElementById(`${type}-rank-list`);
  mediaRankDataCache[type]=data;
  const myNames=new Set(mediaData[type].map(x=>x.title.toLowerCase().trim()));
  list.innerHTML='<div class="media-rank-grid">'+data.map((item,i)=>{
    const rank=i+1;const numCls=rank===1?'top1':rank===2?'top2':rank===3?'top3':'';
    const added=myNames.has(item.title.toLowerCase().trim());const bid=`mrank-${type}-${i}`;
    const gj=JSON.stringify({title:item.title,cover:item.images.jpg.image_url,total:item.episodes||item.chapters||0,year:item.year||'',genres:item.genres.map(g=>g.name)}).replace(/'/g,"&#39;");
    return`<div class="media-rank-item" style="cursor:pointer" onclick="openMediaRankDetail('${type}',${i})">
      <div class="media-rank-num ${numCls}">${rank}</div>
      <img class="media-rank-cover" src="${item.images.jpg.image_url}" loading="lazy">
      <div class="media-rank-info">
        <div class="media-rank-title">${esc(item.title)}</div>
        <div class="media-rank-meta"><span>${item.year||'未知年份'}</span><span>${item.score?item.score+'分':'暂无评分'}</span></div>
      </div>
      <button class="media-rank-add ${added?'added':''}" id="${bid}" onclick="event.stopPropagation();${added?'':`addMediaFromRank('${type}',${gj},'${bid}')`}">${added?'✓ 已收录':'+ 想看'}</button>
    </div>`;
  }).join('')+'</div>';
}
function openMediaRankDetail(type,idx){
  const item=mediaRankDataCache[type]?.[idx];if(!item)return;
  const cover=item.images?.jpg?.image_url||'';
  const myNames=new Set(mediaData[type].map(x=>x.title.toLowerCase().trim()));
  const already=myNames.has(item.title.toLowerCase().trim());

  // 用发现页弹窗风格展示
  document.getElementById('disc-hero-bg').style.backgroundImage=cover?`url(${cover})`:'none';
  const dimg=document.getElementById('disc-cover');
  if(cover){dimg.src=cover;dimg.style.display='block';}else dimg.style.display='none';
  document.getElementById('disc-title').textContent=item.title||'';
  document.getElementById('disc-dev').textContent=item.studios?.map(s=>s.name).join(' / ')||item.authors?.map(a=>a.name).join(' / ')||'';
  document.getElementById('disc-year').textContent=item.year||'';
  document.getElementById('disc-score').textContent=item.score?item.score+' 分':'';
  document.getElementById('disc-rcount').textContent=item.scored_by?(item.scored_by>999?(item.scored_by/1000).toFixed(1)+'k':item.scored_by)+' 人评分':'';
  const pftags=(item.genres||[]).slice(0,5).map(g=>`<span class="tag" style="font-size:.68rem">${g.name||g}</span>`).join('');
  document.getElementById('disc-ptags').innerHTML=pftags;
  document.getElementById('disc-summary').textContent=item.synopsis||'暂无简介';
  document.getElementById('disc-storyline').style.display='none';
  document.getElementById('disc-igdb-link').href=item.url||'#';
  document.getElementById('disc-igdb-link').textContent='↗ MAL';

  // 替换加入按钮
  const addBtn=document.getElementById('disc-add-btn');
  addBtn.textContent=already?'✓ 已收录':'+ 加入列表';
  addBtn.classList.toggle('added',already);
  addBtn.disabled=already;
  addBtn.onclick=()=>{
    if(already)return;
    const gj={title:item.title,cover,total:item.episodes||item.chapters||0,year:item.year||'',genres:(item.genres||[]).map(g=>g.name||g)};
    addMediaFromRank(type,gj,'disc-add-btn').then(()=>{addBtn.textContent='✓ 已收录';addBtn.classList.add('added');addBtn.disabled=true;});  };

  // 重置AI聊天
  document.getElementById('disc-chat-area').classList.remove('open');
  document.getElementById('disc-ai-btn').textContent='⬡ 和 AI 聊聊这部作品';
  document.getElementById('disc-chat-msgs').innerHTML='';
  document.getElementById('disc-chat-quick').innerHTML='';

  // 替换AI聊天按钮行为（动漫/漫画用独立context，不污染游戏的discCurrentGame）
  const mediaAiCtx={name:item.title,summary:item.synopsis||'',developer:item.studios?.map(s=>s.name).join('/')||item.authors?.map(a=>a.name).join('/')||'',year:item.year||'',rating:item.score||null,ratingCount:item.scored_by||null,platforms:[],storyline:'',url:item.url||''};
  document.getElementById('disc-ai-btn').textContent='⬡ 和 AI 聊聊这部作品';
  document.getElementById('disc-ai-btn').onclick=(e)=>{
    e.stopPropagation();
    // 临时设置context，打开后再聊
    const prev=discCurrentGame;
    discCurrentGame=mediaAiCtx;
    discChatOpen=false; // 强制重新初始化
    toggleDiscChat();
    // 聊天关闭时还原（监听一次）
  };

  document.getElementById('ov-disc').classList.add('on');
}
async function addMediaFromRank(type,item,bid){
  const btn=document.getElementById(bid);if(!btn)return;btn.textContent='添加中…';btn.disabled=true;
  const newItem={title:item.title,cover:item.cover,episode_total:item.total||0,episode_current:0,status:type==='anime'?'planned':'planned',rating:0,review:'',genres:item.genres||[]};
  const{data:{session}}=await db.auth.getSession();
  if(session?.user){const{data}=await db.from(type+'_list').insert({...newItem,user_id:session.user.id}).select().single();if(data)mediaData[type].unshift(data);}
  else{mediaData[type].unshift({_id:Date.now().toString(36),created_at:new Date().toISOString(),...newItem});localStorage.setItem(type+'_list',JSON.stringify(mediaData[type]));}
  btn.textContent='✓ 已收录';btn.classList.add('added');btn.disabled=false;renderMedia(type);
}
function renderMedia(type){
  const q=document.getElementById(`${type}-q`).value.toLowerCase();
  const fs=document.getElementById(`${type}-fst`).value;const fso=document.getElementById(`${type}-fso`).value;
  let list=mediaData[type].filter(m=>{if(q&&!m.title.toLowerCase().includes(q))return false;if(fs&&m.status!==fs)return false;return true;});
  if(fso==='rating')list.sort((a,b)=>(b.rating||0)-(a.rating||0));else if(fso==='title')list.sort((a,b)=>a.title.localeCompare(b.title,'zh'));else list.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
  const statSt={};mediaData[type].forEach(m=>statSt[m.status]=(statSt[m.status]||0)+1);
  const stMap=type==='anime'?{watching:'观看中',completed:'已看完',planned:'想看'}:{reading:'阅读中',completed:'已读完',planned:'想读'};
  document.getElementById(`${type}-stats`).innerHTML=`<div class="sc" style="--c:var(--acc)"><div class="sn">${mediaData[type].length}</div><div class="sl">总收录</div></div><div class="sc" style="--c:var(--acc)"><div class="sn">${statSt[type==='anime'?'watching':'reading']||0}</div><div class="sl">${stMap[type==='anime'?'watching':'reading']}</div></div><div class="sc" style="--c:var(--acc2)"><div class="sn">${statSt.completed||0}</div><div class="sl">${stMap.completed}</div></div><div class="sc" style="--c:var(--warn)"><div class="sn">${statSt.planned||0}</div><div class="sl">${stMap.planned}</div></div>`;
  const grid=document.getElementById(`${type}-grid`);
  if(!list.length){grid.innerHTML='<div class="empty">没有记录</div>';return;}
  grid.innerHTML=list.map(m=>{
    const progTxt=m.episode_total?`${m.episode_current||0} / ${m.episode_total}`:`${m.episode_current||0} 话/集`;
    const pct=m.episode_total?Math.min(100,((m.episode_current||0)/m.episode_total)*100):0;
    const stCls=`ms-${m.status}`;
    const stText={watching:'观看中',reading:'阅读中',completed:type==='anime'?'已看完':'已读完',planned:type==='anime'?'想看':'想读',paused:'暂停',dropped:'放弃'}[m.status];
    return`<div class="mc" data-status="${m.status||''}" onclick="openMediaEdit('${type}','${m.id||m._id}')">
      ${m.cover
        ?`<div class="mc-cover-wrap"><div class="mc-cover-bg" style="background-image:url('${esc(m.cover)}')"></div><img class="mc-cover" src="${esc(m.cover)}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`
        :`<div class="mc-cover-ph">${type==='anime'?'🎬':'📖'}</div>`}
      <div class="mc-body"><div class="mc-title">${esc(m.title)}</div>
      <div class="prog-wrap"><div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div><div class="prog-txt">${progTxt}</div></div>
      <div class="mc-foot"><div class="stars">${'★'.repeat(m.rating||0)}${'☆'.repeat(5-(m.rating||0))}</div><span class="stxt ${stCls}">${stText}</span></div></div>
      <button class="mc-play-btn" onclick="event.stopPropagation();openPlayMode('${type}','${m.id||m._id}')">▶ ${type==='anime'?'开始观看':'开始阅读'}</button>
      </div>`;
  }).join('');
}
function openMediaAdd(type){
  editMediaId=null;currentMediaType=type;mediaStar=0;
  document.getElementById('media-modal-title').textContent=type==='anime'?'添加动漫':'添加漫画';
  document.getElementById('media-modal-sub').textContent='搜索并添加新记录';
  document.getElementById('media-search-wrap').style.display='block';
  document.getElementById('media-search-inp').value='';document.getElementById('jikan-results').style.display='none';
  document.getElementById('media-status').value=type==='anime'?'watching':'reading';
  document.getElementById('media-current').value='';document.getElementById('media-total').value='';
  document.getElementById('media-review').value='';document.getElementById('media-genre-chips').innerHTML='';
  document.getElementById('media-modal-cover').style.display='none';document.getElementById('media-modal-bg').style.backgroundImage='none';
  document.getElementById('media-chat-wrap').style.display='none';document.getElementById('media-ai-btn').style.display='none';
  document.getElementById('media-sum-box').style.display='none';
  document.getElementById('media-del-btn').style.display='none';
  document.getElementById('media-timeline-slot').innerHTML='';
  setMediaRating(0);document.getElementById('ov-media').classList.add('on');
}
function openMediaEdit(type,id){
  currentMediaType=type;editMediaId=id;
  const m=mediaData[type].find(x=>(x.id||x._id)==id);if(!m)return;
  document.getElementById('media-modal-title').textContent=m.title;document.getElementById('media-modal-sub').textContent='编辑记录';
  document.getElementById('media-search-wrap').style.display='none';
  document.getElementById('media-status').value=m.status;document.getElementById('media-current').value=m.episode_current||'';
  document.getElementById('media-total').value=m.episode_total||'';document.getElementById('media-review').value=m.review||'';
  document.getElementById('media-genre-chips').innerHTML=(m.genres||[]).map(g=>`<span class="genre-chip on">${g}</span>`).join('');
  if(m.cover){document.getElementById('media-modal-cover').src=m.cover;document.getElementById('media-modal-cover').style.display='block';document.getElementById('media-modal-bg').style.backgroundImage=`url(${m.cover})`;}
  setMediaRating(m.rating||0);mediaCurrentItem=m;
  document.getElementById('media-ai-btn').style.display='block';document.getElementById('media-ai-btn').textContent='⬡ 和 AI 聊聊';
  document.getElementById('media-chat-wrap').style.display='none';mediaChatOpen=false;mediaChatHistory=[];
  document.getElementById('media-del-btn').style.display='block';
  // 挂载时间轴
  const tlSlot=document.getElementById('media-timeline-slot');tlSlot.innerHTML='';
  const mtlId='mtl-'+String(id).replace(/[^a-z0-9]/gi,'_');
  const mtlEl=document.createElement('div');mtlEl.id=mtlId;tlSlot.appendChild(mtlEl);
  db.auth.getSession().then(({data:{session}})=>{if(session?.user)renderMediaTimeline(mtlId,m,type,session.user.id);});
  document.getElementById('ov-media').classList.add('on');
}
function setMediaRating(n){mediaStar=n;document.querySelectorAll('.media-star').forEach((b,i)=>b.classList.toggle('on',i<n));document.getElementById('media-rating-lbl').textContent=HINT[n]||'未评分';}
function onMediaSearch(v){
  clearTimeout(mediaSearchT);const res=document.getElementById('jikan-results');
  if(!v.trim()){res.style.display='none';return;}
  mediaSearchT=setTimeout(async()=>{
    res.style.display='block';res.innerHTML='<div class="jikan-msg">搜索中…</div>';
    try{
      const url=`https://api.jikan.moe/v4/${currentMediaType}?q=${encodeURIComponent(v)}&limit=10`;
      const r=await fetch(url);const data=await r.json();
      if(!data.data.length){res.innerHTML='<div class="jikan-msg">未找到结果</div>';return;}
      res.innerHTML=data.data.map(item=>{const gj=JSON.stringify({title:item.title,cover:item.images.jpg.image_url,total:item.episodes||item.chapters||0,year:item.year||'',genres:item.genres.map(g=>g.name)}).replace(/'/g,"&#39;");return`<div class="jikan-item" onclick="fillMedia(${gj.replace(/"/g,'&quot;')})"><img class="jikan-cover" src="${item.images.jpg.image_url}"><div class="jikan-info"><div class="jikan-title">${esc(item.title)}</div><div class="jikan-meta">${item.year||''} · ${item.type||''}</div></div></div>`;}).join('');
    }catch(e){res.innerHTML='<div class="jikan-msg">搜索失败</div>';}
  },600);
}
function fillMedia(item){
  document.getElementById('media-modal-title').textContent=item.title;
  if(item.cover){document.getElementById('media-modal-cover').src=item.cover;document.getElementById('media-modal-cover').style.display='block';document.getElementById('media-modal-bg').style.backgroundImage=`url(${item.cover})`;document.getElementById('media-modal-cover').dataset.url=item.cover;}
  document.getElementById('media-total').value=item.total||'';
  document.getElementById('media-genre-chips').innerHTML=(item.genres||[]).map(g=>`<span class="genre-chip on">${g}</span>`).join('');
  document.getElementById('jikan-results').style.display='none';document.getElementById('media-search-inp').value='';
}
async function saveMedia(){
  const title=document.getElementById('media-modal-title').textContent;
  if(title==='添加动漫'||title==='添加漫画'){alert('请先搜索并选择作品');return;}
  const coverUrl=document.getElementById('media-modal-cover').dataset.url||document.getElementById('media-modal-cover').src;
  const genres=[...document.querySelectorAll('#media-genre-chips .genre-chip')].map(c=>c.textContent);
  const p={title,cover:coverUrl&&coverUrl!==window.location.href?coverUrl:'',status:document.getElementById('media-status').value,episode_current:parseInt(document.getElementById('media-current').value)||0,episode_total:parseInt(document.getElementById('media-total').value)||null,rating:mediaStar,review:document.getElementById('media-review').value.trim(),genres};
  const{data:{session}}=await db.auth.getSession();const user=session?.user;const type=currentMediaType;
  if(user){
    if(editMediaId){const{error}=await db.from(type+'_list').update(p).eq('id',editMediaId).eq('user_id',user.id);if(!error){const i=mediaData[type].findIndex(x=>x.id==editMediaId);if(i>-1)mediaData[type][i]={...mediaData[type][i],...p};}}
    else{const{data,error}=await db.from(type+'_list').insert({...p,user_id:user.id}).select().single();if(error){alert('保存失败：'+error.message);return;}if(data)mediaData[type].unshift(data);}
  }else{
    if(editMediaId){const i=mediaData[type].findIndex(x=>x._id==editMediaId);if(i>-1)mediaData[type][i]={...mediaData[type][i],...p};}
    else{mediaData[type].unshift({_id:Date.now().toString(36),created_at:new Date().toISOString(),...p});}
    localStorage.setItem(type+'_list',JSON.stringify(mediaData[type]));
  }
  if(window.partnerTrackEvent)window.partnerTrackEvent('media_add');
  closeOv('ov-media');renderMedia(type);
}
async function delMedia(){
  if(!editMediaId||!confirm('确认删除这条记录？'))return;
  const type=currentMediaType;
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user){
    await db.from(type+'_list').delete().eq('id',editMediaId).eq('user_id',user.id);
  }
  mediaData[type]=mediaData[type].filter(m=>(m.id||m._id)!=editMediaId);
  if(!user)localStorage.setItem(type+'_list',JSON.stringify(mediaData[type]));
  closeOv('ov-media');renderMedia(type);
}
function toggleMediaChat(){
  mediaChatOpen=!mediaChatOpen;
  document.getElementById('media-chat-wrap').style.display=mediaChatOpen?'block':'none';
  document.getElementById('media-ai-btn').textContent=mediaChatOpen?'收起 AI 对话':'⬡ 和 AI 聊聊';
  if(mediaChatOpen&&document.getElementById('media-chat-msgs').children.length===0){
    document.getElementById('media-chat-title').textContent=mediaCurrentItem.title;
    const greet=`你好！关于《${mediaCurrentItem.title}》的剧情、角色分析或者补番建议，都可以问我哦！`;
    const msgs=document.getElementById('media-chat-msgs');
    msgs.innerHTML=`<div class="cmsg ai-msg"><div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl">${greet}</div></div>`;
    const qs=['这部作品的结局/后续走向是什么？','有哪些隐藏的设定或伏笔？','最打动人的情节是哪一段？'];
    document.getElementById('media-chat-quick').innerHTML=qs.map(q=>`<button class="qq" onclick="document.getElementById('media-chat-inp').value='${q}';sendMediaAIMsg()">${q}</button>`).join('');
  }
}
async function sendMediaAIMsg(){
  const inp=document.getElementById('media-chat-inp');const v=inp.value.trim();if(!v)return;
  inp.value='';const msgs=document.getElementById('media-chat-msgs');
  msgs.innerHTML+=`<div class="cmsg user-msg"><div class="cmsg-av usr-av">我</div><div class="cmsg-bbl">${esc(v)}</div></div>`;
  msgs.scrollTop=msgs.scrollHeight;mediaChatHistory.push({role:'user',parts:[{text:v}]});
  const td=document.createElement('div');td.className='cmsg ai-msg';td.id='media-typing';
  td.innerHTML='<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  msgs.appendChild(td);msgs.scrollTop=msgs.scrollHeight;
  const sys=`你是精通《${mediaCurrentItem.title}》的专属情报员。请用详细丰富的中文回答（400字左右），纯文字不用Markdown。\n${window._mtlProgressContext||''}`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:mediaChatHistory,generationConfig:{maxOutputTokens:1200,temperature:1.15}})});
    if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI 暂时离线）';
    document.getElementById('media-typing')?.remove();
    const div=document.createElement('div');div.className='cmsg ai-msg';div.innerHTML=`<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"></div>`;msgs.appendChild(div);
    const bbl=div.querySelector('.cmsg-bbl');let i=0;const t=()=>{if(i<reply.length){bbl.textContent+=reply[i++];msgs.scrollTop=msgs.scrollHeight;setTimeout(t,20);}};t();
    mediaChatHistory.push({role:'model',parts:[{text:reply}]});
  }catch(e){document.getElementById('media-typing')?.remove();msgs.innerHTML+=`<div class="cmsg ai-msg"><div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl">连接失败：${e.message}</div></div>`;}
}
function generateMediaSummary(){}

