/* ===== 时间轴模块 ===== */
async function callTimelineAI(systemPrompt,userMsg){
  const res=await fetch(`${SB_URL}/functions/v1/gemini-proxy`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`},body:JSON.stringify({system_instruction:{parts:[{text:systemPrompt}]},contents:[{role:'user',parts:[{text:userMsg}]}],generationConfig:{maxOutputTokens:8000,temperature:0.7}})});
  const data=await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'';
}

// 每章/Arc 拉不同图片：动漫用 Jikan pictures，游戏用 IGDB search screenshot
async function fetchJikanPictures(title,arcIndex){
  try{
    // 先搜标题拿 MAL ID
    const sr=await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
    const sd=await sr.json();
    const malId=sd?.data?.[0]?.mal_id;if(!malId)return null;
    // 拉 pictures 列表
    const pr=await fetch(`https://api.jikan.moe/v4/anime/${malId}/pictures`);
    const pd=await pr.json();
    const pics=pd?.data||[];
    if(!pics.length)return null;
    // 按 arcIndex 循环取不同图
    return pics[arcIndex%pics.length]?.jpg?.large_image_url||pics[arcIndex%pics.length]?.jpg?.image_url||null;
  }catch{return null;}
}
async function fetchMangaPictures(title,arcIndex){
  try{
    const sr=await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=1`);
    const sd=await sr.json();
    const malId=sd?.data?.[0]?.mal_id;if(!malId)return null;
    const pr=await fetch(`https://api.jikan.moe/v4/manga/${malId}/pictures`);
    const pd=await pr.json();
    const pics=pd?.data||[];
    if(!pics.length)return null;
    return pics[arcIndex%pics.length]?.jpg?.large_image_url||pics[arcIndex%pics.length]?.jpg?.image_url||null;
  }catch{return null;}
}
// 游戏：用 IGDB 按游戏名搜截图
async function fetchGameScreenshots(gameName,chapterIndex){
  try{
    const res=await fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({igdbRaw:`fields name,screenshots.image_id; where name ~ *"${gameName.replace(/"/g,'')}"* & screenshots != null; sort total_rating_count desc; limit 1;`})
    });
    const data=await res.json();
    const shots=data?.[0]?.screenshots||[];if(!shots.length)return null;
    const shot=shots[chapterIndex%shots.length];
    return shot?.image_id?`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${shot.image_id}.jpg`:null;
  }catch{return null;}
}
async function fetchAniListImages(title,mediaType){
  try{const res=await fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({anilistQuery:{title,mediaType}})});return await res.json();}catch{return null;}
}
async function fetchIGDBGameImages(gameId){
  try{const res=await fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({igdbGameDetail:{gameId}})});return await res.json();}catch{return null;}
}
function getSteamHeader(appid){return appid?`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`:null;}
function getSteamScreenshots(appid,count=3){if(!appid)return[];return Array.from({length:count},(_,i)=>`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/ss_${i+1}.600x338.jpg`);}

function cloneTimelineData(data){
  return data?JSON.parse(JSON.stringify(data)):null;
}
function getCuratedGameTimeline(game){
  const name=String(game?.name||game?.title||game?.id||'').toLowerCase();
  const isFRLG=/(fire\s*red|firered|leaf\s*green|leafgreen|火红|葉綠|叶绿)/i.test(name);
  if(isFRLG&&window.FRLG_STORY_TIMELINE)return cloneTimelineData(window.FRLG_STORY_TIMELINE);
  const storyId=window.getPokemonStorySeriesId?.(name)||'';
  const checkpoints=storyId?window.PKM_STORY_CHECKPOINTS?.[storyId]:null;
  if(checkpoints?.length){
    const chapters=[];
    checkpoints.forEach(cp=>{
      const chapterTitle=cp.chapter||'剧情推进';
      let chapter=chapters.find(c=>c.title===chapterTitle);
      if(!chapter){chapter={title:chapterTitle,coverUrl:null,userImages:[],nodes:[]};chapters.push(chapter);}
      chapter.nodes.push({text:cp.label||'',ep:cp.detail||''});
    });
    return {source:`curated-${storyId}-story-v1`,chapters};
  }
  return null;
}

async function generateGameTimeline(gameName){
  const sys=`你是专业游戏攻略作者。根据游戏名称生成【完整】主线剧情时间轴，必须覆盖游戏从序章到最终结局的所有主线章节，绝对不能省略或合并章节。严格输出JSON，不要有任何其他文字或代码块标记。

格式：
{"chapters":[{"title":"章节名称（与游戏内章节名一致）","imageQuery":"英文截图搜索词，格式：'游戏英文名 章节场景关键词 gameplay screenshot'","coverUrl":null,"userImages":[],"nodes":[{"text":"该章节内关键剧情事件，15字内，描述发生了什么但不剧透最终结局","ep":""}]}]}

严格要求：
1. 章节数量必须与游戏实际章节数完全一致，短游戏（<5章）按实际来，长游戏（>15章）每个章节都要列出
2. 每个章节内节点数3-6个，描述该章节内的关键剧情推进事件
3. 节点描述用动词开头，简洁有力，如「抵达海拉鲁王国」「击败甘农多夫」
4. imageQuery必须是英文，包含游戏英文名+该章节最具代表性的场景或事件关键词
5. 绝对不允许用「…」「等」「其他章节」代替实际内容`;
  const raw=await callTimelineAI(sys,`游戏名称：${gameName}\n\n请生成该游戏完整的主线章节时间轴，覆盖所有章节，不要省略任何一章。`);
  const cleaned=raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
  return JSON.parse(cleaned);
}

async function generateMediaTimeline(mediaName,mediaType){
  const typeTxt=mediaType==='ANIME'?'动漫':'漫画';
  const epWord=mediaType==='ANIME'?'EP':'第';
  const epUnit=mediaType==='ANIME'?'集':'话';
  const nodeLabel=mediaType==='ANIME'?'集':'话';

  // 先问 AI 总集数，再决定是否分批
  const countSys=`你是${typeTxt}数据库。只输出一个数字，不要其他任何文字。`;
  const countRaw=await callTimelineAI(countSys,`《${mediaName}》一共有多少${nodeLabel}？只输出数字。`);
  const totalEps=parseInt(countRaw.trim())||0;

  const batchSize=120; // 每批最多120集
  const sys=(startEp,endEp)=>`你是${typeTxt}资深爱好者和剧情分析师。根据作品名称生成指定范围内的剧情时间轴。严格输出JSON，不要有任何其他文字或代码块标记。

格式：
{"arcs":[{"title":"篇章名","epRange":"${epWord}${startEp}-${endEp}${epUnit}","imageQuery":"英文图片搜索词","coverUrl":null,"userImages":[],"nodes":[{"text":"该集核心剧情，15字内，动词开头","ep":"${epWord}N${epUnit}"}]}]}

严格要求：
1. 只生成第${startEp}${nodeLabel}到第${endEp}${nodeLabel}的内容
2. 每一${nodeLabel}必须有且仅有一个节点，ep字段填「${epWord}N${epUnit}」格式
3. 按剧情自然划分Arc，Arc的epRange必须在[${startEp},${endEp}]范围内
4. 节点按集数顺序排列，不能跳过任何一${nodeLabel}
5. imageQuery必须英文`;

  if(!totalEps||totalEps<=batchSize){
    // 集数少或未知，直接一次生成
    const singleSys=`你是${typeTxt}资深爱好者和剧情分析师。根据作品名称生成【完整】剧情时间轴。严格输出JSON，不要有任何其他文字或代码块标记。

格式：
{"arcs":[{"title":"篇章名","epRange":"${epWord}1-24${epUnit}","imageQuery":"英文图片搜索词","coverUrl":null,"userImages":[],"nodes":[{"text":"该集核心剧情，15字内，动词开头","ep":"${epWord}N${epUnit}"}]}]}

严格要求：
1. 每一${nodeLabel}必须有且仅有一个节点，ep字段填「${epWord}N${epUnit}」
2. 按剧情Arc划分篇章，节点按集数顺序不能跳过
3. imageQuery必须英文，包含作品英文名+篇章代表场景`;
    const raw=await callTimelineAI(singleSys,`${typeTxt}名称：${mediaName}\n请生成完整时间轴，每一${nodeLabel}一个节点。`);
    const cleaned=raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
    return JSON.parse(cleaned);
  }

  // 分批生成
  const batches=[];
  for(let start=1;start<=totalEps;start+=batchSize){
    const end=Math.min(start+batchSize-1,totalEps);
    batches.push([start,end]);
  }

  const allArcs=[];
  for(const[start,end] of batches){
    try{
      const raw=await callTimelineAI(sys(start,end),`${typeTxt}名称：${mediaName}\n请生成第${start}${nodeLabel}到第${end}${nodeLabel}的时间轴，每一${nodeLabel}一个节点，不能省略。`);
      const cleaned=raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
      const data=JSON.parse(cleaned);
      allArcs.push(...(data.arcs||[]));
    }catch(e){console.warn(`批次${start}-${end}生成失败`,e);}
  }

  return{arcs:allArcs};
}
function buildProgressContext(timelineData,chapterIdx,nodeIdx,isMedia=false){
  const chapters=isMedia?timelineData.arcs:timelineData.chapters;
  if(!chapters?.length)return'';
  const ch=chapters[chapterIdx];const node=ch?.nodes?.[nodeIdx];
  let totalNodes=0,doneNodes=0;
  chapters.forEach((c,ci)=>c.nodes.forEach((_,ni)=>{totalNodes++;if(ci<chapterIdx||(ci===chapterIdx&&ni<=nodeIdx))doneNodes++;}));
  const pct=Math.round((doneNodes/totalNodes)*100);
  return`\n[玩家进度]\n当前${isMedia?'篇章':'章节'}：${ch?.title||''}\n当前节点：${node?.text||''}\n整体进度：${pct}%（${doneNodes}/${totalNodes}）\n\n[AI规则]\n- 聊天开场白必须包含：「你目前在${ch?.title||''}——${node?.text||''}」\n- 不要主动剧透当前节点之后的内容\n- 如果玩家问「我现在该怎么办」，根据当前节点给出针对性建议`;
}

async function renderGameTimeline(containerId,game,userId){
  const root=document.getElementById(containerId);if(!root)return;
  root.innerHTML=`<div class="gtl-panel"><div class="gtl-header"><h3>📅 进度时间轴</h3><span class="gtl-prog-pill" id="gtl-pct-${containerId}">0%</span><button class="gtl-gen-btn" id="gtl-gen-${containerId}">↻ 重新生成</button></div><div class="gtl-loading" id="gtl-body-${containerId}">加载中…</div></div>`;
  const gameId=String(game.id||game._id||game.name);
  const curatedTimeline=getCuratedGameTimeline(game);
  const bodyEl=document.getElementById(`gtl-body-${containerId}`);
  const genBtn=document.getElementById(`gtl-gen-${containerId}`);
  const pctEl=document.getElementById(`gtl-pct-${containerId}`);

  // 静默保存（忽略403等错误）
  const silentSave=async(payload)=>{
    if(!userId)return;
    try{await db.from('game_timelines').upsert(payload,{onConflict:'user_id,game_id'});}catch(e){}
  };

  let saved=null;
  if(userId){try{const r=await db.from('game_timelines').select('*').eq('user_id',userId).eq('game_id',gameId).maybeSingle();saved=r.data;}catch(e){}}
  let tlData=curatedTimeline||saved?.timeline_json||null;
  let chIdx=saved?.current_chapter_index??0;
  let nodeIdx=saved?.current_node_index??0;

  const doGenerate=async()=>{
    if(curatedTimeline){
      bodyEl.innerHTML='<div class="gtl-loading">正在载入本地校订剧情节点…</div>';
      tlData=cloneTimelineData(curatedTimeline);
      chIdx=0;nodeIdx=0;
      await silentSave({user_id:userId,game_id:gameId,game_name:game.name,timeline_json:tlData,current_chapter_index:0,current_node_index:0,updated_at:new Date().toISOString()});
      doRender();
      return;
    }
    bodyEl.innerHTML='<div class="gtl-loading">🤖 AI 正在分析游戏，生成时间轴…</div>';
    try{
      tlData=await generateGameTimeline(game.name);
      // 用 IGDB 搜游戏截图，每章分配不同截图
      bodyEl.innerHTML='<div class="gtl-loading">🖼 正在拉取章节配图…</div>';
      const shotRes=await fetch(IGDB_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({igdbRaw:`fields name,screenshots.image_id,cover.url; where name ~ *"${game.name.replace(/"/g,'')}"* & screenshots != null; sort total_rating_count desc; limit 1;`})
      }).then(r=>r.json()).catch(()=>null);
      const shots=(shotRes?.[0]?.screenshots||[]).map(s=>s.image_id?`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${s.image_id}.jpg`:null).filter(Boolean);
      tlData.chapters.forEach((ch,i)=>{
        if(shots.length>0)ch.coverUrl=shots[i%shots.length];
        else ch.coverUrl=game.cover||null; // fallback 到游戏封面
      });
      chIdx=0;nodeIdx=0;
      await silentSave({user_id:userId,game_id:gameId,game_name:game.name,timeline_json:tlData,current_chapter_index:0,current_node_index:0,updated_at:new Date().toISOString()});
    }catch(e){bodyEl.innerHTML='<div class="gtl-loading">生成失败，请重试</div>';return;}
    doRender();
  };

  const doRender=()=>{
    const{chapters}=tlData;
    if(!chapters?.length){bodyEl.innerHTML='<div class="gtl-loading">暂无时间轴数据</div>';return;}
    chIdx=Math.min(Math.max(chIdx,0),chapters.length-1);
    nodeIdx=Math.min(Math.max(nodeIdx,0),(chapters[chIdx]?.nodes?.length||1)-1);
    let totalNodes=0,doneNodes=0;
    chapters.forEach((c,ci)=>c.nodes.forEach((_,ni)=>{totalNodes++;if(ci<chIdx||(ci===chIdx&&ni<=nodeIdx))doneNodes++;}));
    const pct=Math.round((doneNodes/totalNodes)*100);
    if(pctEl)pctEl.textContent=pct+'%';

    let html='<div class="gtl-scroll-wrap"><div class="gtl-timeline">';
    chapters.forEach((ch,ci)=>{
      const state=ci<chIdx?'done':ci===chIdx?'active':'locked';
      const locked=state==='locked';
      html+=`<div class="gtl-chapter"><div class="gtl-chapter-dot ${state}"></div><div class="gtl-chapter-header"><span class="gtl-chapter-num">第${ci+1}章</span><span class="gtl-chapter-title${locked?' locked':''}">${esc(ch.title)}</span></div>`;
      if(!locked){
        if(ch.coverUrl){html+=`<div class="gtl-thumb"><img src="${ch.coverUrl}" onerror="this.parentElement.innerHTML='<div class=gtl-ph><span>暂无配图</span></div>'"><div class="gtl-thumb-overlay"><span class="gtl-thumb-name">${esc(ch.title)}</span></div><span class="gtl-src-tag">IGDB/Steam</span></div>`;}
        else{html+=`<div class="gtl-thumb"><div class="gtl-ph"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="9" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M2 14l4-4 3 3 3-4 6 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>暂无配图</span><button class="gtl-upload-btn" onclick="gtlUploadImage('${containerId}',${ci},'game','${gameId}','${userId}')">+ 上传截图</button></div></div>`;}
      }else{html+=`<div class="gtl-thumb" style="opacity:.4"><div class="gtl-ph"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="7" y="2" width="6" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M4 10h12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7z" stroke="currentColor" stroke-width="1.2"/></svg><span>未解锁</span></div></div>`;}
      html+='<div class="gtl-nodes">';
      ch.nodes.forEach((node,ni)=>{
        let nState='locked';
        if(ci<chIdx||(ci===chIdx&&ni<nodeIdx))nState='done';
        else if(ci===chIdx&&ni===nodeIdx)nState='active';
        const icon=nState==='done'?'✓':nState==='active'?'★':'○';
        let badge='';
        if(nState==='done')badge=`<button class="gtl-nbadge gtl-nb-mark" data-ci="${ci}" data-ni="${ni}" data-back="1" style="background:rgba(34,197,94,.1);color:#16a34a;border-color:rgba(34,197,94,.3)">↩ 回退</button>`;
        else if(nState==='active')badge=`<span class="gtl-nbadge gtl-nb-active">📍 当前</span>`;
        else badge=`<button class="gtl-nbadge gtl-nb-mark" data-ci="${ci}" data-ni="${ni}">标记到这</button>`;
        html+=`<div class="gtl-node ${nState}"><span class="gtl-node-icon">${icon}</span><span class="gtl-node-text${locked?' locked':''}">${esc(node.text)}</span>${node.ep?`<span class="gtl-node-ep">${node.ep}</span>`:''} ${badge}</div>`;
      });
      html+='</div>';
      if(!locked){
        const userImgs=ch.userImages||[];
        html+='<div class="gtl-img-row">';
        userImgs.forEach(url=>{html+=`<img class="gtl-img-thumb" src="${url}" onerror="this.style.display='none'">`; });
        html+=`<div class="gtl-img-add" onclick="gtlUploadImage('${containerId}',${ci},'game','${gameId}','${userId}')"><span class="plus">+</span>我的截图</div></div>`;
      }
      html+='</div>';
    });
    html+='</div></div>';
    const ch=chapters[chIdx];const node=ch?.nodes?.[nodeIdx];
    if(ch&&node)html+=`<div class="gtl-ai-bar">🤖 <strong>${esc(ch.title)} · ${esc(node.text)}</strong> — 打开 AI 聊天后可问「我现在该怎么办」，后续不会被剧透。</div>`;
    bodyEl.innerHTML=html;
    bodyEl.querySelectorAll('.gtl-nb-mark').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const ci=parseInt(btn.dataset.ci);const ni=parseInt(btn.dataset.ni);
        const isBack=btn.dataset.back==='1';
        // 回退：设为该节点的前一个；标记到这：设为该节点
        if(isBack){
          // 回退到该节点之前：找 (ci,ni) 的上一个节点
          if(ni>0){chIdx=ci;nodeIdx=ni-1;}
          else if(ci>0){chIdx=ci-1;nodeIdx=chapters[ci-1].nodes.length-1;}
          else{chIdx=0;nodeIdx=0;}
        }else{chIdx=ci;nodeIdx=ni;}
        await silentSave({user_id:userId,game_id:gameId,game_name:game.name,timeline_json:tlData,current_chapter_index:chIdx,current_node_index:nodeIdx,updated_at:new Date().toISOString()});
        window._gtlProgressContext=buildProgressContext(tlData,chIdx,nodeIdx);
        doRender();
      });
    });
    window._gtlProgressContext=buildProgressContext(tlData,chIdx,nodeIdx);
  };

  if(curatedTimeline&&genBtn)genBtn.textContent='↻ 恢复校订节点';
  if(!tlData)await doGenerate();else doRender();
  genBtn.addEventListener('click',async()=>{genBtn.disabled=true;genBtn.textContent=curatedTimeline?'恢复中…':'生成中…';await doGenerate();genBtn.disabled=false;genBtn.textContent=curatedTimeline?'↻ 恢复校订节点':'↻ 重新生成';});
}

async function renderMediaTimeline(containerId,mediaItem,mediaType,userId){
  const root=document.getElementById(containerId);if(!root)return;
  root.innerHTML=`<div class="gtl-panel"><div class="gtl-header"><h3>📅 剧情时间轴</h3><span class="gtl-prog-pill" id="mtl-pct-${containerId}">0%</span><button class="gtl-gen-btn" id="mtl-gen-${containerId}">↻ 重新生成</button></div><div class="gtl-loading" id="mtl-body-${containerId}">加载中…</div></div>`;
  const mediaId=String(mediaItem.id||mediaItem._id||mediaItem.title);
  const aniType=mediaType==='anime'?'ANIME':'MANGA';
  const bodyEl=document.getElementById(`mtl-body-${containerId}`);
  const genBtn=document.getElementById(`mtl-gen-${containerId}`);
  const pctEl=document.getElementById(`mtl-pct-${containerId}`);

  const silentSave=async(payload)=>{
    if(!userId)return;
    try{await db.from('media_timelines').upsert(payload,{onConflict:'user_id,media_id,media_type'});}catch(e){}
  };

  let saved=null;
  if(userId){try{const r=await db.from('media_timelines').select('*').eq('user_id',userId).eq('media_id',mediaId).eq('media_type',mediaType).maybeSingle();saved=r.data;}catch(e){}}
  let tlData=saved?.timeline_json||null;
  let arcIdx=saved?.current_arc_index??0;
  let nodeIdx=saved?.current_node_index??0;

  const doGenerate=async()=>{
    bodyEl.innerHTML='<div class="gtl-loading">🤖 AI 正在分析剧情，生成时间轴…</div>';
    try{
      tlData=await generateMediaTimeline(mediaItem.title,aniType);
      const total=tlData.arcs?.reduce((s,a)=>s+a.nodes.length,0)||0;
      bodyEl.innerHTML=`<div class="gtl-loading">🖼 正在拉取篇章配图…（共 ${total} 个节点）</div>`;
      // AniList banner 作基础封面
      const ali=await fetchAniListImages(mediaItem.title,aniType);
      const baseCover=ali?.banner||ali?.cover||mediaItem.cover||null;
      if(ali?.color)tlData.themeColor=ali.color;
      // 用 Jikan pictures 为每个 Arc 分配不同图
      let malId=null;
      try{
        const jikanType=mediaType==='anime'?'anime':'manga';
        const sr=await fetch(`https://api.jikan.moe/v4/${jikanType}?q=${encodeURIComponent(mediaItem.title)}&limit=1`);
        const sd=await sr.json();malId=sd?.data?.[0]?.mal_id;
      }catch{}
      let picPool=[];
      if(malId){
        try{
          const jikanType=mediaType==='anime'?'anime':'manga';
          const pr=await fetch(`https://api.jikan.moe/v4/${jikanType}/${malId}/pictures`);
          const pd=await pr.json();
          picPool=(pd?.data||[]).map(p=>p.jpg?.large_image_url||p.jpg?.image_url).filter(Boolean);
        }catch{}
      }
      tlData.arcs.forEach((arc,i)=>{
        arc.coverUrl=picPool.length>1?picPool[i%picPool.length]:baseCover;
      });
      arcIdx=0;nodeIdx=0;
      await silentSave({user_id:userId,media_id:mediaId,media_name:mediaItem.title,media_type:mediaType,timeline_json:tlData,current_arc_index:0,current_node_index:0,updated_at:new Date().toISOString()});
    }catch(e){bodyEl.innerHTML='<div class="gtl-loading">生成失败，请重试</div>';return;}
    doRender();
  };

  const doRender=()=>{
    const{arcs}=tlData;
    let totalNodes=0,doneNodes=0;
    arcs.forEach((a,ai)=>a.nodes.forEach((_,ni)=>{totalNodes++;if(ai<arcIdx||(ai===arcIdx&&ni<=nodeIdx))doneNodes++;}));
    const pct=Math.round((doneNodes/totalNodes)*100);
    if(pctEl)pctEl.textContent=pct+'%';

    let html='<div class="gtl-scroll-wrap"><div class="gtl-timeline">';
    arcs.forEach((arc,ai)=>{
      const state=ai<arcIdx?'done':ai===arcIdx?'active':'locked';
      const locked=state==='locked';
      html+=`<div class="gtl-chapter"><div class="gtl-chapter-dot ${state}"></div><div class="gtl-chapter-header"><span class="gtl-chapter-num">Arc ${ai+1}</span><span class="gtl-chapter-title${locked?' locked':''}">${esc(arc.title)}</span>${arc.epRange?`<span class="gtl-chapter-eps">${arc.epRange}</span>`:''}</div>`;
      if(!locked){
        if(arc.coverUrl){html+=`<div class="gtl-thumb"><img src="${arc.coverUrl}" onerror="this.parentElement.innerHTML='<div class=gtl-ph><span>暂无配图</span></div>'"><div class="gtl-thumb-overlay"><span class="gtl-thumb-name">${esc(arc.title)}</span>${arc.epRange?`<span class="gtl-thumb-eps">${arc.epRange}</span>`:''}</div><span class="gtl-src-tag">AniList/MAL</span></div>`;}
        else{html+=`<div class="gtl-thumb"><div class="gtl-ph"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="9" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M2 14l4-4 3 3 3-4 6 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>暂无配图</span><button class="gtl-upload-btn" onclick="gtlUploadImage('${containerId}',${ai},'${mediaType}','${mediaId}','${userId}')">+ 上传截图</button></div></div>`;}
      }else{html+=`<div class="gtl-thumb" style="opacity:.4"><div class="gtl-ph"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="7" y="2" width="6" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M4 10h12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7z" stroke="currentColor" stroke-width="1.2"/></svg><span>未解锁</span></div></div>`;}
      html+='<div class="gtl-nodes">';
      arc.nodes.forEach((node,ni)=>{
        let nState='locked';
        if(ai<arcIdx||(ai===arcIdx&&ni<nodeIdx))nState='done';
        else if(ai===arcIdx&&ni===nodeIdx)nState='active';
        const icon=nState==='done'?'✓':nState==='active'?'★':'○';
        let badge='';
        if(nState==='done')badge=`<button class="gtl-nbadge gtl-nb-mark" data-ai="${ai}" data-ni="${ni}" data-back="1" style="background:rgba(34,197,94,.1);color:#16a34a;border-color:rgba(34,197,94,.3)">↩ 回退</button>`;
        else if(nState==='active')badge=`<span class="gtl-nbadge gtl-nb-active">📍 当前</span>`;
        else badge=`<button class="gtl-nbadge gtl-nb-mark" data-ai="${ai}" data-ni="${ni}">标记到这</button>`;
        html+=`<div class="gtl-node ${nState}"><span class="gtl-node-icon">${icon}</span><span class="gtl-node-text${locked?' locked':''}">${esc(node.text)}</span>${node.ep?`<span class="gtl-node-ep">${node.ep}</span>`:''} ${badge}</div>`;
      });
      html+='</div>';
      if(!locked){
        const userImgs=arc.userImages||[];
        html+='<div class="gtl-img-row">';
        userImgs.forEach(url=>{html+=`<img class="gtl-img-thumb" src="${url}" onerror="this.style.display='none'">`; });
        html+=`<div class="gtl-img-add" onclick="gtlUploadImage('${containerId}',${ai},'${mediaType}','${mediaId}','${userId}')"><span class="plus">+</span>我的截图</div></div>`;
      }
      html+='</div>';
    });
    html+='</div></div>';
    const arc=arcs[arcIdx];const node=arc?.nodes?.[nodeIdx];
    if(arc&&node)html+=`<div class="gtl-ai-bar">🤖 <strong>${esc(arc.title)} · ${esc(node.text)}</strong> — 可问「这段剧情我该注意什么」，后续不会被剧透。</div>`;
    bodyEl.innerHTML=html;
    bodyEl.querySelectorAll('.gtl-nb-mark').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const ai=parseInt(btn.dataset.ai);const ni=parseInt(btn.dataset.ni);
        const isBack=btn.dataset.back==='1';
        if(isBack){
          if(ni>0){arcIdx=ai;nodeIdx=ni-1;}
          else if(ai>0){arcIdx=ai-1;nodeIdx=arcs[ai-1].nodes.length-1;}
          else{arcIdx=0;nodeIdx=0;}
        }else{arcIdx=ai;nodeIdx=ni;}
        await silentSave({user_id:userId,media_id:mediaId,media_name:mediaItem.title,media_type:mediaType,timeline_json:tlData,current_arc_index:arcIdx,current_node_index:nodeIdx,updated_at:new Date().toISOString()});
        window._mtlProgressContext=buildProgressContext(tlData,arcIdx,nodeIdx,true);
        doRender();
      });
    });
    window._mtlProgressContext=buildProgressContext(tlData,arcIdx,nodeIdx,true);
  };

  if(!tlData)await doGenerate();else doRender();
  genBtn.addEventListener('click',async()=>{genBtn.disabled=true;genBtn.textContent='生成中…';await doGenerate();genBtn.disabled=false;genBtn.textContent='↻ 重新生成';});
}

async function gtlUploadImage(containerId,chapterIdx,type,mediaId,userId){
  if(!userId){alert('请先登录');return;}
  const input=document.createElement('input');input.type='file';input.accept='image/*';
  input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return;
    const ext=file.name.split('.').pop();
    const path=`${userId}/${type}-${mediaId}-ch${chapterIdx}-${Date.now()}.${ext}`;
    const{data,error}=await db.storage.from('game-screenshots').upload(path,file,{upsert:true});
    if(error){alert('上传失败：'+error.message);return;}
    const{data:{publicUrl}}=db.storage.from('game-screenshots').getPublicUrl(path);
    alert('上传成功！URL：'+publicUrl);
  };
  input.click();
}

