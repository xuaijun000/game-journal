// ===== 沉浸式游玩模式 =====
let playState = {
  open: false,
  type: 'game',      // 'game' | 'anime' | 'manga'
  id: null,
  item: null,        // 游戏/媒体对象
  sessionStart: null,
  sessionSeconds: 0,
  timerRunning: false,
  timerInterval: null,
  logs: [],          // { id, text, ts }
  sessionId: null    // 本次 play_sessions 记录 id（Supabase）
};

/* ---- 工具函数 ---- */
function _playPad(n){return String(n).padStart(2,'0');}
function _playFmtSec(s){
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
  return h>0?`${_playPad(h)}:${_playPad(m)}:${_playPad(sec)}`:`${_playPad(m)}:${_playPad(sec)}`;
}
function _playFmtMin(s){
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);
  if(h>0)return `${h}h ${m}min`;
  return `${m}min`;
}
function _playNow(){return new Date().toISOString();}
function _playTsLabel(iso){
  const d=new Date(iso),now=new Date();
  const diff=now-d;
  if(diff<60000)return '刚刚';
  if(diff<3600000)return Math.floor(diff/60000)+'分钟前';
  if(diff<86400000)return '今天 '+d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
  return (d.getMonth()+1)+'/'+d.getDate();
}

/* ---- 打开 ---- */
async function openPlayMode(type, id){
  // 找到对应数据
  let item = null;
  if(type==='game'){
    item = games.find(x=>(x.id||x._id)==id);
  } else {
    item = (mediaData[type]||[]).find(x=>(x.id||x._id)==id);
  }
  if(!item) return;

  // 初始化状态
  playState.type = type;
  playState.id = id;
  playState.item = item;
  playState.sessionStart = new Date();
  playState.sessionSeconds = 0;
  playState.timerRunning = true;
  playState.logs = [];
  playState.sessionId = null;
  clearInterval(playState.timerInterval);

  // 填充顶栏
  const name = type==='game' ? item.name : item.title;
  const cover = item.cover || null;
  document.getElementById('play-title').textContent = name;

  // 封面
  const cw = document.getElementById('play-cover-wrap');
  if(cover){
    cw.innerHTML = `<img class="play-cover" src="${esc(cover)}" alt="" onerror="this.outerHTML='<div class=play-cover-ph>${type==='anime'?'🎬':type==='manga'?'📖':'🎮'}</div>'">`;
  } else {
    cw.innerHTML = `<div class="play-cover-ph">${type==='anime'?'🎬':type==='manga'?'📖':'🎮'}</div>`;
  }

  // meta
  let meta = '';
  if(type==='game'){
    const pf = (item.platforms||[]).map(p=>PFMAP[p]||p).join(' · ');
    meta = [pf, item.year].filter(Boolean).join(' · ');
  } else {
    meta = type==='anime'?'动漫':'漫画';
  }
  document.getElementById('play-meta').textContent = meta;

  // 状态徽章
  const stMap = type==='game'
    ? {playing:'游玩中',done:'已通关',wishlist:'想玩',dropped:'放弃'}
    : {watching:'观看中',reading:'阅读中',completed:'已完成',planned:'想看',paused:'暂停',dropped:'放弃'};
  const badge = document.getElementById('play-status-badge');
  badge.textContent = stMap[item.status]||'进行中';

  // 累计时长
  const totalH = type==='game' ? (item.hours||0) : (item.episode_current||0);
  const totalLabel = type==='game' ? `累计总时长：${totalH}h` : `已看/读：${totalH}集`;
  document.getElementById('play-timer-total').textContent = totalLabel;

  // 底部统计
  document.getElementById('play-sum-total').textContent = type==='game' ? `${totalH}h` : `${totalH}集`;
  const cpMap={main:'主线',side:'主+支',full:'全收集',partial:'部分',dropped:'放弃'};
  document.getElementById('play-sum-cp').textContent = type==='game' ? (cpMap[item.completion]||'—') : '—';
  document.getElementById('play-sum-logs').textContent = '0';

  // 最近快照
  document.getElementById('play-snap-inp').value = '';
  // 重置快照图片状态
  _snapImgFile = null; _snapImgUrl = null; _logImgFile = null; _playLogClearImg();
  const _prevEl = document.getElementById('play-snap-img-preview');
  if(_prevEl){ _prevEl.src=''; _prevEl.classList.remove('show'); }
  const _snapBg = document.getElementById('play-snap-bg');
  if(_snapBg){ _snapBg.classList.remove('loaded'); _snapBg.style.backgroundImage=''; }
  const _snapNameEl = document.getElementById('play-snap-img-name');
  if(_snapNameEl) _snapNameEl.textContent='';
  const _snapDelEl = document.getElementById('play-snap-img-del');
  if(_snapDelEl) _snapDelEl.style.display='none';
  const _snapHintEl = document.getElementById('play-snap-hint');
  if(_snapHintEl) _snapHintEl.textContent='截图将作为快照背景';
  await _loadPlaySnapshot();

  // AI 快捷问题
  _initPlayAIChips(type, name);

  // 清空 AI 回复和对话历史
  _playAiHistory = [];
  const resp = document.getElementById('play-ai-resp');
  resp.textContent=''; resp.classList.remove('show');
  document.getElementById('play-ai-loading').classList.remove('show');
  document.getElementById('play-ai-inp').value='';

  // 加载日志
  await _loadPlayLogs();

  // 加载时间线（仅游戏）
  await _loadPlayTimeline();

  // 启动计时器
  document.getElementById('play-timer-display').textContent = '00:00:00';
  document.getElementById('play-timer-toggle').textContent = '暂停';
  document.getElementById('play-pause-btn').textContent = '⏸';
  playState.timerInterval = setInterval(_playTick, 1000);

  // 在 Supabase 创建 session 记录
  _createPlaySession();

  document.getElementById('ov-play').classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closePlayMode(){
  clearInterval(playState.timerInterval);
  playState.timerRunning = false;
  document.getElementById('ov-play').classList.remove('on');
  document.body.style.overflow = '';
  playState.open = false;
}

/* ---- 计时器 ---- */
function _playTick(){
  if(!playState.timerRunning) return;
  playState.sessionSeconds++;
  const s = playState.sessionSeconds;
  document.getElementById('play-timer-display').textContent = _playFmtSec(s);
  // 底部统计同步
  document.getElementById('play-sum-time').textContent = _playFmtMin(s);
}

function togglePlayTimer(){
  playState.timerRunning = !playState.timerRunning;
  const lbl = playState.timerRunning;
  document.getElementById('play-timer-toggle').textContent = lbl ? '暂停' : '继续';
  document.getElementById('play-pause-btn').textContent = lbl ? '⏸' : '▶';
}

/* ---- 结束游玩 ---- */
async function endPlaySession(){
  clearInterval(playState.timerInterval);
  playState.timerRunning = false;
  const secs = playState.sessionSeconds;
  const hrs = parseFloat((secs/3600).toFixed(2));

  // 更新 Supabase play_sessions
  await _endPlaySessionDB(hrs);

  // 如果是游戏，自动累加 hours 到 games 表
  if(playState.type==='game' && hrs>0){
    const g = playState.item;
    const gid = g.id||g._id;
    const newHours = parseFloat(((g.hours||0)+hrs).toFixed(1));
    try{
      const {data:{session}} = await db.auth.getSession();
      if(session?.user){
        await db.from('games').update({hours:newHours}).eq('id',gid).eq('user_id',session.user.id);
        // 本地同步
        const gi = games.findIndex(x=>(x.id||x._id)==gid);
        if(gi>=0) games[gi].hours = newHours;
      }
    }catch(e){}
  }

  const m = Math.round(secs/60);
  const msg = secs<60 ? '本次游玩时间太短，未记录时长。' : `本次游玩 ${_playFmtMin(secs)} 已记录！${playState.type==='game'&&hrs>0?'\n时长已自动累加到游戏记录。':''}`;
  alert(msg);
  closePlayMode();
  render(); // 刷新卡片
}

/* ---- Supabase：会话记录 ---- */
async function _createPlaySession(){
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user) return;
    const uid = session.user.id;
    const payload = {
      user_id: uid,
      ref_type: playState.type,
      ref_id: String(playState.id),
      ref_name: playState.type==='game' ? playState.item.name : playState.item.title,
      started_at: _playNow(),
      ended_at: null,
      duration_hours: null
    };
    const {data,error} = await db.from('play_sessions').insert(payload).select('id').single();
    if(!error && data) playState.sessionId = data.id;
  }catch(e){}
}

async function _endPlaySessionDB(hrs){
  try{
    if(!playState.sessionId) return;
    await db.from('play_sessions').update({ended_at:_playNow(),duration_hours:hrs}).eq('id',playState.sessionId);
  }catch(e){}
}

/* ---- 快照 ---- */
// 快照图片临时状态
let _snapImgFile = null;
let _snapImgUrl = null;   // 已上传的 publicUrl
let _logImgFile = null;   // 日志待上传图片

async function _loadPlaySnapshot(){
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user) return;
    const {data} = await db.from('play_snapshots')
      .select('snapshot_text,image_url')
      .eq('user_id',session.user.id)
      .eq('ref_type',playState.type)
      .eq('ref_id',String(playState.id))
      .order('created_at',{ascending:false})
      .limit(1)
      .maybeSingle();
    if(data){
      if(data.snapshot_text) document.getElementById('play-snap-inp').value = data.snapshot_text;
      if(data.image_url) _playSnapSetBg(data.image_url, null, false);
    }
  }catch(e){}

  // 如果没有快照图，用封面/IGDB截图做背景
  _playSnapAutoBackground();
}

function _playSnapAutoBackground(){
  const bgEl = document.getElementById('play-snap-bg');
  if(!bgEl) return;
  // 优先用已上传图
  if(_snapImgUrl){ _playSnapSetBg(_snapImgUrl, null, false); return; }
  // 其次用封面
  const cover = playState.item?.cover;
  if(cover){ _playSnapSetBg(cover, null, false); return; }
  // 游戏可尝试 IGDB 截图
  if(playState.type==='game' && playState.item?.name){
    fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({igdbRaw:`fields screenshots.image_id; where name ~ *"${playState.item.name.replace(/"/g,'')}"* & screenshots != null; sort total_rating_count desc; limit 1;`})
    }).then(r=>r.json()).then(d=>{
      const imgId = d?.[0]?.screenshots?.[0]?.image_id;
      if(imgId){
        const url = `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${imgId}.jpg`;
        _playSnapSetBg(url, null, false);
      }
    }).catch(()=>{});
  }
}

function _playSnapSetBg(url, previewEl, isLocal){
  const bgEl = document.getElementById('play-snap-bg');
  if(!bgEl) return;
  if(isLocal){
    // 本地 File 对象，用 FileReader
    const reader = new FileReader();
    reader.onload = e => {
      bgEl.style.backgroundImage = `url('${e.target.result}')`;
      bgEl.classList.add('loaded');
    };
    reader.readAsDataURL(url); // url 此时是 File
  } else {
    bgEl.style.backgroundImage = `url('${url}')`;
    bgEl.classList.add('loaded');
  }
  // 小预览图
  if(previewEl){
    previewEl.src = isLocal ? '' : url;
    if(!isLocal) previewEl.classList.add('show');
  }
}

function _playSnapUpload(){
  const input = document.createElement('input');
  input.type='file'; input.accept='image/*';
  input.onchange = () => {
    const file = input.files?.[0]; if(!file) return;
    _snapImgFile = file;
    _snapImgUrl = null;
    // 本地预览
    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById('play-snap-img-preview');
      prev.src = e.target.result;
      prev.classList.add('show');
      // 背景也立即换
      const bgEl = document.getElementById('play-snap-bg');
      bgEl.style.backgroundImage = `url('${e.target.result}')`;
      bgEl.classList.add('loaded');
    };
    reader.readAsDataURL(file);
    // 文件名
    const name = document.getElementById('play-snap-img-name');
    name.textContent = file.name.length>18 ? file.name.slice(0,16)+'…' : file.name;
    document.getElementById('play-snap-img-del').style.display = '';
    document.getElementById('play-snap-hint').textContent = '截图已选，保存时上传';
  };
  input.click();
}

function _playSnapClearImg(){
  _snapImgFile = null; _snapImgUrl = null; _logImgFile = null; _playLogClearImg();
  const prev = document.getElementById('play-snap-img-preview');
  prev.src=''; prev.classList.remove('show');
  document.getElementById('play-snap-img-name').textContent='';
  document.getElementById('play-snap-img-del').style.display='none';
  document.getElementById('play-snap-hint').textContent='截图将作为快照背景';
  // 恢复自动背景
  const bgEl = document.getElementById('play-snap-bg');
  bgEl.classList.remove('loaded');
  bgEl.style.backgroundImage='';
  setTimeout(_playSnapAutoBackground, 100);
}

// ===== 快照历史弹窗 =====
let _snapHistData = [];
let _snapAiHistory = [];

async function openSnapHist(){
  const name = playState.type==='game' ? playState.item.name : playState.item.title;
  document.getElementById('snap-hist-title').textContent = name+' · 快照历史';
  document.getElementById('snap-ai-resp').textContent='';
  document.getElementById('snap-ai-resp').classList.remove('show');
  document.getElementById('snap-ai-loading').classList.remove('show');
  document.getElementById('snap-ai-inp').value='';
  _snapAiHistory=[];
  document.getElementById('ov-snap-hist').classList.add('on');
  await _loadSnapHistData();
}

function closeSnapHist(){
  document.getElementById('ov-snap-hist').classList.remove('on');
}

async function _loadSnapHistData(){
  const body = document.getElementById('snap-hist-body');
  body.innerHTML='<div class="snap-hist-empty">加载中…</div>';
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user){body.innerHTML='<div class="snap-hist-empty">请先登录</div>';return;}
    const {data} = await db.from('play_snapshots')
      .select('id,snapshot_text,image_url,created_at')
      .eq('user_id',session.user.id)
      .eq('ref_type',playState.type)
      .eq('ref_id',String(playState.id))
      .order('created_at',{ascending:false})
      .limit(30);
    _snapHistData = data||[];
    _renderSnapHist();
  }catch(e){
    document.getElementById('snap-hist-body').innerHTML='<div class="snap-hist-empty">加载失败</div>';
  }
}

function _renderSnapHist(){
  const body = document.getElementById('snap-hist-body');
  if(!_snapHistData.length){
    body.innerHTML='<div class="snap-hist-empty">还没有快照，去记录第一条吧～</div>';
    return;
  }
  // 用 createElement 避免引号嵌套问题
  body.innerHTML='';
  _snapHistData.forEach(s=>{
    const wrap = document.createElement('div');
    wrap.className='snap-hist-item';
    if(s.image_url){
      const img = document.createElement('img');
      img.className='snap-hist-img'; img.src=s.image_url;
      img.onerror=function(){this.style.display='none';};
      wrap.appendChild(img);
    }
    const contentDiv = document.createElement('div');
    contentDiv.className='snap-hist-content';
    if(s.snapshot_text){
      const textDiv = document.createElement('div');
      textDiv.className='snap-hist-text'; textDiv.textContent=s.snapshot_text;
      contentDiv.appendChild(textDiv);
    }
    const metaDiv = document.createElement('div');
    metaDiv.className='snap-hist-meta';
    const timeSpan = document.createElement('span');
    timeSpan.className='snap-hist-time'; timeSpan.textContent=_playTsLabel(s.created_at);
    const delSpan = document.createElement('span');
    delSpan.className='snap-hist-del'; delSpan.textContent='删除';
    delSpan.addEventListener('click',()=>_deleteSnapHist(s.id));
    metaDiv.appendChild(timeSpan); metaDiv.appendChild(delSpan);
    contentDiv.appendChild(metaDiv);
    wrap.appendChild(contentDiv);
    body.appendChild(wrap);
  });
}

async function _deleteSnapHist(id){
  if(!confirm('删除这条快照？')) return;
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user) return;
    await db.from('play_snapshots').delete().eq('id',id).eq('user_id',session.user.id);
    _snapHistData = _snapHistData.filter(s=>s.id!=id);
    _renderSnapHist();
  }catch(e){}
}

function _buildSnapContext(){
  const name = playState.type==='game' ? playState.item.name : playState.item.title;
  const typeLabel = {game:'游戏',anime:'动漫',manga:'漫画'}[playState.type]||'作品';
  if(!_snapHistData.length) return '（暂无快照记录）';
  const lines = _snapHistData.slice().reverse().map((s,i)=>{
    const t = new Date(s.created_at).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'});
    return (i+1)+'. ['+t+'] '+(s.snapshot_text||'(仅截图)');
  });
  return '《'+name+'》'+typeLabel+'游玩进度快照（时间顺序）：\n'+lines.join('\n');
}

async function snapAISummary(){
  const btn = document.getElementById('snap-ai-sum-btn');
  const loading = document.getElementById('snap-ai-loading');
  const resp = document.getElementById('snap-ai-resp');
  btn.disabled=true; loading.classList.add('show'); resp.classList.remove('show');

  const name = playState.type==='game' ? playState.item.name : playState.item.title;
  const typeLabel = {game:'游戏',anime:'动漫',manga:'漫画'}[playState.type]||'作品';
  const ctx = _buildSnapContext();
  const prompt = '以下是玩家游玩《'+name+'》的进度快照记录：\n\n'+ctx+'\n\n请用100-150字，以第一人称「游玩手记」的风格，帮玩家总结这段游玩历程，写出情感和收获，文字要有《'+name+'》这部'+typeLabel+'的世界观气质，纯文字不用Markdown。';

  _snapAiHistory = [{role:'user',parts:[{text:prompt}]}];
  try{
    const res = await fetch(SB_URL+'/functions/v1/gemini-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},
      body:JSON.stringify({contents:_snapAiHistory,generationConfig:{maxOutputTokens:400,temperature:0.9}})
    });
    const d = await res.json();
    const txt = d?.candidates?.[0]?.content?.parts?.[0]?.text || '生成失败，请重试';
    _snapAiHistory.push({role:'model',parts:[{text:txt}]});
    resp.textContent=txt; resp.classList.add('show');
  }catch(e){ resp.textContent='连接失败'; resp.classList.add('show'); }
  loading.classList.remove('show'); btn.disabled=false;
}

async function snapAIChat(){
  const inp = document.getElementById('snap-ai-inp');
  const q = inp.value.trim(); if(!q) return;
  inp.value='';
  const loading = document.getElementById('snap-ai-loading');
  const resp = document.getElementById('snap-ai-resp');
  loading.classList.add('show'); resp.classList.remove('show');

  const name = playState.type==='game' ? playState.item.name : playState.item.title;
  const typeLabel = {game:'游戏',anime:'动漫',manga:'漫画'}[playState.type]||'作品';

  // 首次对话注入上下文
  if(_snapAiHistory.length===0){
    const ctx = _buildSnapContext();
    const sys = '你是《'+name+'》专属情报员，以下是玩家的游玩快照记录：\n'+ctx+'\n\n根据这些快照回答玩家的问题，语气亲切，回复在200字以内。';
    _snapAiHistory.push({role:'user',parts:[{text:sys+'\n\n玩家问：'+q}]});
  } else {
    _snapAiHistory.push({role:'user',parts:[{text:q}]});
  }
  if(_snapAiHistory.length>12) _snapAiHistory=_snapAiHistory.slice(-12);

  try{
    const res = await fetch(SB_URL+'/functions/v1/gemini-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},
      body:JSON.stringify({contents:_snapAiHistory,generationConfig:{maxOutputTokens:500,temperature:1.0}})
    });
    const d = await res.json();
    const txt = d?.candidates?.[0]?.content?.parts?.[0]?.text || '暂时无法回答';
    _snapAiHistory.push({role:'model',parts:[{text:txt}]});
    resp.textContent=txt; resp.classList.add('show');
  }catch(e){ resp.textContent='连接失败'; resp.classList.add('show'); }
  loading.classList.remove('show');
}

async function savePlaySnapshot(){
  const text = document.getElementById('play-snap-inp').value.trim();
  if(!text && !_snapImgFile){alert('请输入进度文字或选择截图');return;}
  const btn = document.querySelector('.play-btn-save');
  btn.textContent='保存中…'; btn.disabled=true;
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user){alert('请先登录');btn.textContent='保存快照';btn.disabled=false;return;}
    const uid = session.user.id;
    let imgUrl = null;

    // 如果有待上传图片
    if(_snapImgFile){
      const uploadBtn = document.getElementById('play-snap-upload-btn');
      uploadBtn.classList.add('uploading');
      const ext = _snapImgFile.name.split('.').pop();
      const path = `${uid}/snap-${playState.type}-${playState.id}-${Date.now()}.${ext}`;
      const {data:upData, error:upErr} = await db.storage.from('game-screenshots').upload(path, _snapImgFile, {upsert:true});
      if(upErr){alert('图片上传失败：'+upErr.message);btn.textContent='保存快照';btn.disabled=false;uploadBtn.classList.remove('uploading');return;}
      const {data:{publicUrl}} = db.storage.from('game-screenshots').getPublicUrl(path);
      imgUrl = publicUrl;
      _snapImgUrl = imgUrl;
      uploadBtn.classList.remove('uploading');
      // 更新背景为已上传URL
      const bgEl = document.getElementById('play-snap-bg');
      bgEl.style.backgroundImage = `url('${imgUrl}')`;
    }

    await db.from('play_snapshots').insert({
      user_id: uid,
      ref_type: playState.type,
      ref_id: String(playState.id),
      ref_name: playState.type==='game'?playState.item.name:playState.item.title,
      snapshot_text: text||null,
      image_url: imgUrl,
      created_at: _playNow()
    });

    _snapImgFile = null; // 清除待上传文件（已上传）
    btn.textContent='✓ 已保存';
    document.getElementById('play-snap-hint').textContent = imgUrl ? '截图已上传 ✓' : '快照已保存 ✓';
    setTimeout(()=>{btn.textContent='保存快照';btn.disabled=false;},1800);
  }catch(e){
    alert('保存失败：'+e.message);
    btn.textContent='保存快照'; btn.disabled=false;
  }
}

/* ---- 即时日志 ---- */
async function _loadPlayLogs(){
  const list = document.getElementById('play-log-list');
  list.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:4px 0">加载中…</div>';
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user){list.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:4px 0">登录后可查看历史日志</div>';return;}
    const {data} = await db.from('play_logs')
      .select('*')
      .eq('user_id',session.user.id)
      .eq('ref_type',playState.type)
      .eq('ref_id',String(playState.id))
      .order('created_at',{ascending:false})
      .limit(50);
    playState.logs = data||[];
    _renderPlayLogs();
  }catch(e){list.innerHTML='<div style="font-size:.75rem;color:var(--t3)">加载失败</div>';}
}

function _parseLogText(raw){
  if(!raw) return {text:'',imgUrl:''};
  const sep=raw.indexOf('\n__IMG__:');
  if(sep<0) return {text:raw,imgUrl:''};
  return {text:raw.slice(0,sep),imgUrl:raw.slice(sep+9)};
}

function _renderPlayLogs(){
  const list = document.getElementById('play-log-list');
  if(!playState.logs.length){
    list.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:4px 0">还没有日志，记录第一条吧</div>';
    document.getElementById('play-sum-logs').textContent='0';
    return;
  }
  const todayStr = new Date().toDateString();
  const todayCount = playState.logs.filter(l=>new Date(l.created_at).toDateString()===todayStr).length;
  document.getElementById('play-sum-logs').textContent = String(todayCount);
  document.getElementById('play-log-count').textContent = `共 ${playState.logs.length} 条`;

  list.innerHTML='';
  playState.logs.forEach(l=>{
    const {text,imgUrl}=_parseLogText(l.log_text);
    const item=document.createElement('div');
    item.className='play-log-item';
    let html=`<span class="play-log-del" onclick="_deletePlayLog('${l.id}')">✕</span>`;
    if(text) html+=`<div class="play-log-text">${esc(text)}</div>`;
    if(imgUrl) html+=`<img src="${esc(imgUrl)}" style="max-width:100%;border-radius:6px;margin:4px 0;display:block" onerror="this.style.display='none'">`;
    html+=`<div class="play-log-time">${_playTsLabel(l.created_at)}</div>`;
    item.innerHTML=html;
    list.appendChild(item);
  });
}
function _playLogImgChange(inp){
  const file=inp.files?.[0]; if(!file) return;
  _logImgFile=file;
  const reader=new FileReader();
  reader.onload=e=>{
    const prev=document.getElementById('play-log-img-preview');
    if(prev){prev.src=e.target.result;}
    const row=document.getElementById('play-log-img-preview-row');
    if(row)row.style.display='flex';
    const nm=document.getElementById('play-log-img-name');
    if(nm)nm.textContent=file.name.length>18?file.name.slice(0,16)+'…':file.name;
    const lbl=document.getElementById('play-log-img-lbl');
    if(lbl)lbl.style.color='var(--acc)';
  };
  reader.readAsDataURL(file);
}

function _playLogClearImg(){
  _logImgFile=null;
  const prev=document.getElementById('play-log-img-preview');if(prev){prev.src='';}
  const row=document.getElementById('play-log-img-preview-row');if(row)row.style.display='none';
  const nm=document.getElementById('play-log-img-name');if(nm)nm.textContent='';
  const inp=document.getElementById('play-log-img-inp');if(inp)inp.value='';
  const lbl=document.getElementById('play-log-img-lbl');if(lbl)lbl.style.color='';
}

async function addPlayLog(){
  const inp = document.getElementById('play-log-inp');
  const text = inp.value.trim();
  if(!text && !_logImgFile) return;
  inp.value='';
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user){alert('请先登录');return;}
    const uid=session.user.id;
    let logText=text;

    if(_logImgFile){
      const ext=_logImgFile.name.split('.').pop();
      const path=`${uid}/log-${playState.type}-${playState.id}-${Date.now()}.${ext}`;
      const {data:upData,error:upErr}=await db.storage.from('game-screenshots').upload(path,_logImgFile,{upsert:true});
      if(!upErr){
        const {data:{publicUrl}}=db.storage.from('game-screenshots').getPublicUrl(path);
        logText=(text?text+'\n':'')+'__IMG__:'+publicUrl;
      }
      _playLogClearImg();
    }

    const {data,error} = await db.from('play_logs').insert({
      user_id: uid,
      ref_type: playState.type,
      ref_id: String(playState.id),
      ref_name: playState.type==='game'?playState.item.name:playState.item.title,
      log_text: logText||text,
      created_at: _playNow()
    }).select('*').single();
    if(!error && data){
      playState.logs.unshift(data);
      _renderPlayLogs();
    }
  }catch(e){inp.value=text;alert('记录失败：'+e.message);}
}

async function _deletePlayLog(lid){
  if(!confirm('删除这条日志？')) return;
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user) return;
    await db.from('play_logs').delete().eq('id',lid).eq('user_id',session.user.id);
    playState.logs = playState.logs.filter(l=>l.id!=lid);
    _renderPlayLogs();
  }catch(e){}
}

/* ---- 时间线（完整版，直接内嵌渲染） ---- */
async function _loadPlayTimeline(){
  const tl = document.getElementById('play-tl');
  tl.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:6px 0">加载时间线…</div>';
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user){tl.innerHTML='<div style="font-size:.75rem;color:var(--t3)">登录后查看时间线</div>';return;}
    const uid = session.user.id;
    const containerId = 'play-tl-inner';
    // 注入挂载容器
    tl.innerHTML = '<div id="play-tl-inner"></div>';
    if(playState.type==='game'){
      await renderGameTimeline(containerId, playState.item, uid);
    } else {
      await renderMediaTimeline(containerId, playState.item, playState.type, uid);
    }
    // 渲染完后自动滚动到当前进度节点
    setTimeout(()=>{
      const active = tl.querySelector('.gtl-chapter-dot.active, .gtl-node.active');
      if(active) active.scrollIntoView({behavior:'smooth', block:'center'});
    }, 300);
  }catch(e){
    console.error('时间线加载失败', e);
    tl.innerHTML='<div style="font-size:.75rem;color:var(--t3)">加载失败，请重试</div>';
  }
}

async function _regenPlayTimeline(){
  const tl = document.getElementById('play-tl');
  tl.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:6px 0">重新生成中…</div>';
  try{
    const {data:{session}} = await db.auth.getSession();
    if(!session?.user) return;
    const containerId = 'play-tl-inner';
    tl.innerHTML = '<div id="play-tl-inner"></div>';
    if(playState.type==='game'){
      // 清除已有时间线数据，触发重新生成
      await db.from('game_timelines').delete().eq('user_id',session.user.id).eq('game_id',String(playState.id));
      await renderGameTimeline(containerId, playState.item, session.user.id);
    } else {
      await db.from('media_timelines').delete().eq('user_id',session.user.id).eq('media_id',String(playState.id)).eq('media_type',playState.type);
      await renderMediaTimeline(containerId, playState.item, playState.type, session.user.id);
    }
  }catch(e){ document.getElementById('play-tl').innerHTML='<div style="font-size:.75rem;color:var(--t3)">生成失败</div>'; }
}

/* ---- AI 快捷 ---- */
function _initPlayAIChips(type, name){
  const chips = type==='game'
    ? ['我卡关了','Boss 弱点','隐藏要素','剧情梳理','收集攻略']
    : type==='anime'
    ? ['剧情总结','下一集讲什么','人物关系','主题解析','彩蛋有哪些']
    : ['剧情总结','人物关系','原著改编了什么','下一话内容','隐藏伏笔'];
  document.getElementById('play-ai-chips').innerHTML = chips.map(c=>
    `<span class="play-chip" onclick="_setPlayAIInput('${c}')">${c}</span>`
  ).join('');
}

function _setPlayAIInput(text){
  document.getElementById('play-ai-inp').value = text;
  document.getElementById('play-ai-inp').focus();
}

let _playAiHistory = [];

async function sendPlayAI(){
  const inp = document.getElementById('play-ai-inp');
  const q = inp.value.trim();
  if(!q) return;
  inp.value='';
  const loading = document.getElementById('play-ai-loading');
  const resp = document.getElementById('play-ai-resp');
  loading.classList.add('show');
  resp.classList.remove('show');

  const item = playState.item;
  const name = playState.type==='game' ? item.name : item.title;
  const typeLabel = playState.type==='game'?'游戏':playState.type==='anime'?'动漫':'漫画';

  // 构建丰富上下文（与详情馆 AI 保持一致风格）
  let contextLines = [`${typeLabel}名称：${name}`];
  if(playState.type==='game'){
    if(item.developer) contextLines.push(`开发商：${item.developer}`);
    if(item.year) contextLines.push(`发行年份：${item.year}`);
    if(item.platforms?.length) contextLines.push(`平台：${(item.platforms).map(p=>PFMAP[p]||p).join('、')}`);
    if(item.genres?.length) contextLines.push(`类型：${normalizeGameGenres(item.genres).map(genreLabel).join('、')}`);
    if(item.styles?.length) contextLines.push(`风格：${item.styles.join('、')}`);
    if(item.status) contextLines.push(`游玩状态：${{playing:'游玩中',done:'已通关',wishlist:'想玩',dropped:'放弃'}[item.status]||item.status}`);
    if(item.hours) contextLines.push(`已游玩时长：${item.hours}h`);
    if(item.completion) contextLines.push(`完成度：${{main:'主线通关',side:'主线+支线',full:'全收集/铂金',partial:'部分完成',dropped:'中途放弃'}[item.completion]||item.completion}`);
    if(item.review) contextLines.push(`玩家评测：${item.review}`);
  } else {
    if(item.status) contextLines.push(`观看状态：${{watching:'观看中',reading:'阅读中',completed:'已完成',planned:'想看',paused:'暂停',dropped:'放弃'}[item.status]||item.status}`);
    if(item.episode_current) contextLines.push(`当前进度：第${item.episode_current}话`);
    if(item.episode_total) contextLines.push(`总集数：${item.episode_total}话`);
    if(item.review) contextLines.push(`观后感：${item.review}`);
  }
  const gameCtx = contextLines.join('\n');

  const sys = '你是专为游戏旅途 App 服务的 AI 情报员，精通各类'+typeLabel+'内容。\n'
    +'当前用户正在'+(playState.type==='game'?'游玩':'观看/阅读')+'的作品信息如下：\n'
    +gameCtx+'\n\n'
    +'你的职责：\n'
    +'- 提供精准、简洁的游戏/动漫/漫画情报，优先回答用户当前遇到的实际问题\n'
    +'- 攻略类问题（卡关、Boss打法、隐藏要素）：给出具体步骤，不啰嗦\n'
    +'- 剧情类问题：尊重用户进度，主动询问是否需要剧透\n'
    +'- 世界观/设定类：有深度但不过于学术\n'
    +'- 回复保持在 250 字以内，如需要可用简短列表\n'
    +'- 用中文回复，语气专业但亲切，像一个了解这部作品的朋友';

  // 多轮对话历史
  _playAiHistory.push({role:'user',parts:[{text:q}]});
  if(_playAiHistory.length > 10) _playAiHistory = _playAiHistory.slice(-10);

  try{
    const res = await fetch(SB_URL+'/functions/v1/gemini-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},
      body:JSON.stringify({
        system_instruction:{parts:[{text:sys}]},
        contents:_playAiHistory,
        generationConfig:{maxOutputTokens:600,temperature:1.0}
      })
    });
    const d = await res.json();
    const txt = d?.candidates?.[0]?.content?.parts?.[0]?.text || d?.error?.message || '暂时无法回答';
    // 保存 AI 回复进历史
    _playAiHistory.push({role:'model',parts:[{text:txt}]});
    resp.textContent = txt;
    resp.classList.add('show');
  }catch(e){
    _playAiHistory.pop(); // 失败时回滚
    resp.textContent='连接失败，请稍后再试';
    resp.classList.add('show');
  }
  loading.classList.remove('show');
}

// 打开游戏详情时加载时刻
const _origOpenDetail = openDetail;

