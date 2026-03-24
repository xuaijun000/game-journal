function openDetail(id){
  const g=games.find(x=>(x.id||x._id)==id);if(!g)return;
  editId=id;
  document.getElementById('dh-bg').style.backgroundImage=g.cover?`url(${g.cover})`:'none';
  document.getElementById('d-cover').src=g.cover||'';
  document.getElementById('d-cover').style.display=g.cover?'block':'none';
  document.getElementById('d-name').textContent=g.name||'';
  document.getElementById('d-meta').textContent=[g.developer,g.year].filter(Boolean).join(' · ');
  document.getElementById('d-tags').innerHTML=(g.platforms||[]).map(p=>`<span class="tag ${PTAG[p]||''}">${PFMAP[p]||p}</span>`).join('')+(g.genres||[]).slice(0,4).map(gn=>`<span class="tag">${gn}</span>`).join('');
  const dc={playing:'var(--acc)',done:'var(--acc2)',wishlist:'var(--warn)',dropped:'var(--t3)'}[g.status]||'var(--t3)';
  document.getElementById('d-st-val').innerHTML=`<span style="color:${dc}">${STMAP[g.status]||'—'}</span>`;
  document.getElementById('d-hr-val').textContent=(g.hours||0)+'h';
  document.getElementById('d-rt-val').innerHTML=g.rating?'★'.repeat(g.rating)+`<span style="color:var(--t3)">${'★'.repeat(5-g.rating)}</span>`:`<span style="color:var(--t3)">暂无</span>`;
  document.getElementById('d-cp-val').textContent=CPMAP[g.completion]||'—';
  const rb=document.getElementById('d-rev-box');
  if(g.review){rb.style.display='block';document.getElementById('d-rev-val').textContent=g.review;}else rb.style.display='none';
  aiCurrentGame=g;aiChatOpen=false;aiChatHistory=[];
  document.getElementById('chat-panel').classList.remove('open');
  document.getElementById('d-ai-btn-txt').textContent='和 AI 聊聊这款游戏';
  document.getElementById('chat-msgs').innerHTML='';
  document.getElementById('chat-quick').innerHTML='';
  loadSummaries(id);
  // 挂载时间轴
  const tlSlot=document.getElementById('game-timeline-slot');
  tlSlot.innerHTML='';
  const tlId='gtl-'+String(id).replace(/[^a-z0-9]/gi,'_');
  const tlEl=document.createElement('div');tlEl.id=tlId;tlSlot.appendChild(tlEl);
  db.auth.getSession().then(({data:{session}})=>{
    if(session?.user)renderGameTimeline(tlId,g,session.user.id);
  });
  document.getElementById('ov-detail').classList.add('on');
  // 加载游戏时刻
  loadGameMoments(g.name);
  // 悬浮面板默认选中当前游戏
  const mSel=document.getElementById('moment-game-select');if(mSel&&g.name)mSel.value=g.name;
}
function openEditFromDetail(){closeOv('ov-detail');openEdit(editId);}
/* ===== AI 聊天室 ===== */
let aiChatOpen=false,aiChatHistory=[],aiCurrentGame=null;
function toggleAIChat(){
  aiChatOpen=!aiChatOpen;
  document.getElementById('chat-panel').classList.toggle('open',aiChatOpen);
  document.getElementById('d-ai-btn-txt').textContent=aiChatOpen?'收起 AI 对话':'和 AI 聊聊这款游戏';
  if(aiChatOpen&&document.getElementById('chat-msgs').children.length===0)initAIChat();
  if(aiChatOpen)setTimeout(()=>{document.getElementById('chat-msgs').scrollTop=9999;},100);
}
function initAIChat(){
  const g=aiCurrentGame;if(!g)return;
  document.getElementById('chat-game-name').textContent=g.name;
  aiChatHistory=[];
  const genres=g.genres||[];const styles=g.styles||[];
  const isSouls=genres.includes('souls')||styles.includes('dark')||styles.includes('hard');
  const isLight=styles.includes('lighthearted')||styles.includes('casual')||genres.includes('puzzle');
  const isHorror=genres.includes('horror');
  const isAnime=styles.includes('anime');
  const qs=[...new Set([
    ...(genres.includes('souls')||genres.includes('action')?['Boss 战有什么破防技巧？']:[]),
    ...(genres.includes('rpg')||genres.includes('open')?['有哪些值得探索的隐藏内容？']:[]),
    ...(genres.includes('visual')||genres.includes('narrative')?['有几条路线/结局？']:[]),
    ...(g.review?['根据我的评测，你觉得我会喜欢什么相似作品？']:[]),
    '这款游戏的剧情有哪些亮点？','有什么值得注意的玩法技巧？','推荐给什么类型的玩家？'
  ])].slice(0,4);
  document.getElementById('chat-quick').innerHTML=qs.map(q=>`<button class="qq" onclick="sendAIQuick('${q.replace(/'/g,"&#39;")}')">${q}</button>`).join('');
  const hours=g.hours||0;
  const st={playing:'正在游玩中',done:'已通关',wishlist:'列在想玩清单里',dropped:'放弃了'}[g.status]||'';
  let dataComment='';
  if(g.status==='dropped'){dataComment='\n\n……所以你放弃了。发生了什么？';}
  else if(hours>=150){dataComment=`\n\n${hours}小时。我不评价，但你确实在这里沉没了。`;}
  else if(hours>=50&&g.rating===5){dataComment=`\n\n${hours}小时，五星。看来你遇到了真命游戏。`;}
  else if(hours>0&&g.rating===1){dataComment=`\n\n玩了${hours}小时还给一星……这是折磨还是执念？`;}
  else if(g.status==='playing'&&hours>=80){dataComment=`\n\n${hours}小时还没通关，你还好吗？`;}
  else if(g.review){dataComment=`\n\n看到你写道："${g.review.slice(0,40)}${g.review.length>40?'……':''}"。`;}
  let greet='';
  if(isHorror)greet=`……你来了。\n\n《${g.name}》的档案已经打开了。${st?`你${st}，`:''}投入了 ${hours} 小时${g.rating?`，评分 ${'★'.repeat(g.rating)}`:''}。${dataComment}\n\n慢慢问。我哪儿也不去。`;
  else if(isSouls)greet=`档案已加载。《${g.name}》。\n\n你${st}，${hours} 小时${g.rating?`，${'★'.repeat(g.rating)}`:''}。${dataComment}\n\n此路艰险。但你既然开口问了，就说吧。`;
  else if(isAnime)greet=`呀，来啦！《${g.name}》的情报全都在这里哦～\n\n你${st}，已经投入了 ${hours} 小时呢${g.rating?`，打了 ${'★'.repeat(g.rating)}`:''}！${dataComment}\n\n想问什么尽管说，我全都知道(｀・ω・´)`;
  else if(isLight)greet=`哟！《${g.name}》，好选择！\n\n你${st}，${hours}小时${g.rating?`，${g.rating}星`:''}，状态不错嘛。${dataComment}\n\n来来来，想聊什么？剧情、彩蛋、隐藏要素……我碎嘴起来可停不住。`;
  else greet=`《${g.name}》档案已加载完毕。\n\n你${st}，${hours} 小时${g.rating?`，评分 ${'★'.repeat(g.rating)}`:''}。${dataComment}\n\n剧情、攻略、世界观、隐藏要素——随便问，我在。`;
  addAIBubble(greet,'ai',false);
}
function sendAIQuick(q){document.getElementById('chat-inp').value=q;sendAIMsg();}
function addAIBubble(text,role,animate){
  const msgs=document.getElementById('chat-msgs');
  const div=document.createElement('div');div.className=`cmsg ${role==='ai'?'ai-msg':'user-msg'}`;
  div.innerHTML=`<div class="cmsg-av ${role==='ai'?'ai-av':'usr-av'}">${role==='ai'?'AI':'我'}</div><div class="cmsg-bbl"></div>`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
  const bbl=div.querySelector('.cmsg-bbl');
  if(animate&&role==='ai'){let i=0;const spd=text.length>400?15:25;const t=()=>{if(i<text.length){bbl.textContent+=text[i++];msgs.scrollTop=msgs.scrollHeight;setTimeout(t,1000/spd);}};t();}
  else{bbl.textContent=text;msgs.scrollTop=msgs.scrollHeight;}
}
function showTyping(){const msgs=document.getElementById('chat-msgs');const d=document.createElement('div');d.className='cmsg ai-msg';d.id='ai-typing';d.innerHTML='<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"><div class="typing-dots"><span></span><span></span><span></span></div></div>';msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
function hideTyping(){const t=document.getElementById('ai-typing');if(t)t.remove();}
async function sendAIMsg(){
  const inp=document.getElementById('chat-inp');const v=inp.value.trim();if(!v)return;
  inp.value='';addAIBubble(v,'user',false);aiChatHistory.push({role:'user',parts:[{text:v}]});
  const snd=document.getElementById('chat-snd');snd.disabled=true;showTyping();
  const g=aiCurrentGame;
  const genres=g.genres||[];const styles=g.styles||[];
  const isSouls=genres.includes('souls')||styles.includes('dark')||styles.includes('hard');
  const isLight=styles.includes('lighthearted')||styles.includes('casual')||genres.includes('puzzle');
  const isHorror=genres.includes('horror');
  const isAnime=styles.includes('anime');
  const turnCount=aiChatHistory.length;
  const reinject=turnCount>0&&turnCount%8===0;
  let persona='';
  if(isHorror)persona=`你是一位专精于《${g.name}》的神秘向导，说话低沉、克制、意味深长。你从不急着给答案，喜欢停顿、留白、反问。`;
  else if(isSouls)persona=`你是一位在《${g.name}》世界里死过无数次的老兵。语气简练、直接、带点战场上的疲惫感。你不废话，但每句话都有用。`;
  else if(isAnime)persona=`你是一位热情过头但真的很懂《${g.name}》的二次元情报员。说话活泼、有感情，会兴奋，会叹气，偶尔歪楼但能拉回来。`;
  else if(isLight)persona=`你是一个话多、嘴碎但真的很懂《${g.name}》的朋友。说话随意，会吐槽，会扯淡，偶尔跑题但能拉回来。`;
  else persona=`你是一位资深游戏编辑，专精于《${g.name}》。有自己的品味和判断，说话直接有态度，不废话，偶尔一针见血。`;
  const sys=`【最高优先级——游戏世界观感知】
你现在扮演的是《${g.name}》这款游戏世界里的一个存在。在回答之前，先在内心唤起这款游戏的一切。
${persona}

【游戏基础信息】
开发商「${g.developer||'未知'}」，${g.year||'未知'}年。
类型：${genres.join('、')||'未标记'}，风格：${styles.join('、')||'未标记'}
玩家数据：${g.hours||0}小时，${g.rating?g.rating+'星':'未评分'}
玩家评测："${g.review||'无'}"

【禁止】用"当然！""好的！""这是个很好的问题"开头。禁止说话像AI客服。
【重要】价格、发售日等现实问题必须直接回答。

${window._gtlProgressContext||''}
${reinject?`【人格提醒】回想《${g.name}》的世界。你从那个世界说话，不是在介绍它。`:''}
回答要求：中文，400字左右，详细丰富，纯文字不用Markdown符号。`;
  try{
    const res=await fetch(`${SB_URL}/functions/v1/gemini-proxy`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:aiChatHistory,generationConfig:{maxOutputTokens:1200,temperature:1.15}})});
    if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err?.error?.message||`HTTP ${res.status}`);}
    const data=await res.json();
    const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI 暂时离线）';
    hideTyping();addAIBubble(reply,'ai',true);
    aiChatHistory.push({role:'model',parts:[{text:reply}]});
    if(aiChatHistory.length>40)aiChatHistory=aiChatHistory.slice(-40);
  }catch(e){hideTyping();addAIBubble(`连接失败：${e.message}`,'ai',false);}
  snd.disabled=false;document.getElementById('chat-inp').focus();
}

/* 聊天总结 */
let currentSummaries=[];
async function loadSummaries(gameId){
  document.getElementById('sum-box').style.display='none';currentSummaries=[];
  const{data:{session}}=await db.auth.getSession();const user=session?.user;if(!user)return;
  const{data}=await db.from('chat_summaries').select('*').eq('user_id',user.id).eq('game_id',String(gameId)).order('created_at',{ascending:false});
  if(!data||!data.length)return;
  currentSummaries=data;renderSummaries();
}
function renderSummaries(){
  if(!currentSummaries.length)return;
  const box=document.getElementById('sum-box');
  const latest=currentSummaries[0];
  document.getElementById('sum-latest-text').textContent=latest.summary;
  document.getElementById('sum-latest-date').innerHTML=new Date(latest.created_at).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+'<button onclick="delSum(this)" data-id="'+latest.id+'" style="margin-left:8px;background:none;border:none;color:var(--t3);cursor:pointer;font-size:.7rem;padding:0" title="删除">🗑</button>';
  box.style.display='block';
  const oldToggle=document.getElementById('sum-old-toggle');
  const oldList=document.getElementById('sum-old-list');
  if(currentSummaries.length>1){const oldCount=currentSummaries.length-1;oldToggle.style.display='block';oldToggle.textContent='查看更早的 '+oldCount+' 条笔记 ▾';oldList.innerHTML=currentSummaries.slice(1).map(s=>'<div class="sum-old-item"><div class="sum-old-date" style="display:flex;align-items:center;justify-content:space-between"><span>'+new Date(s.created_at).toLocaleDateString('zh-CN',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+'</span><button onclick="delSum(this)" data-id="'+s.id+'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:.7rem;padding:0" title="删除">🗑</button></div><div class="sum-old-text">'+esc(s.summary)+'</div></div>').join('');}
  else{oldToggle.style.display='none';oldList.innerHTML='';}
}
function delSum(el){deleteSummary(el.dataset.id);}
async function deleteSummary(id){
  if(!confirm('删除这条情报存档？'))return;
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  await db.from('chat_summaries').delete().eq('id',id).eq('user_id',session.user.id);
  currentSummaries=currentSummaries.filter(s=>s.id!==id);
  if(currentSummaries.length===0)document.getElementById('sum-box').style.display='none';
  else renderSummaries();
}
function toggleOldSums(){const list=document.getElementById('sum-old-list');const btn=document.getElementById('sum-old-toggle');const isOpen=list.classList.toggle('open');const oldCount=currentSummaries.length-1;btn.textContent=isOpen?'收起 ▴':`查看更早的 ${oldCount} 条笔记 ▾`;}
async function generateSummary(){
  if(aiChatHistory.length<2){alert('至少聊几句再生成总结吧～');return;}
  const btn=document.getElementById('chat-sum-btn');btn.disabled=true;btn.textContent='生成中…';
  const g=aiCurrentGame;
  const historyText=aiChatHistory.map(m=>`${m.role==='user'?'冒险者':'向导'}：${m.parts[0].text}`).join('\n');
  const prompt=`以下是一段关于《${g.name}》的对话记录：\n\n${historyText}\n\n请将这段对话的核心内容写成一则100-150字的"游戏手记"，完全用《${g.name}》的世界观气质来写，像在这个游戏世界里写下的笔记或日志，纯文字不用Markdown。`;
  try{
    const res=await fetch(`${SB_URL}/functions/v1/gemini-proxy`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:300,temperature:0.7}})});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    const summary=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if(!summary)throw new Error('AI 返回为空');
    const{data:{session}}=await db.auth.getSession();const user=session?.user;
    if(!user){alert('请先登录才能保存总结');btn.disabled=false;btn.textContent='⬡ 封存本次情报';return;}
    const gameId=String(editId);
    const{error}=await db.from('chat_summaries').insert({user_id:user.id,game_id:gameId,summary});
    if(error)throw new Error(error.message);
    currentSummaries.unshift({summary,created_at:new Date().toISOString(),game_id:gameId,user_id:user.id});
    renderSummaries();btn.textContent='✓ 情报已封存';
    setTimeout(()=>{btn.disabled=false;btn.textContent='⬡ 封存本次情报';},2000);
  }catch(e){alert('生成失败：'+e.message);btn.disabled=false;btn.textContent='⬡ 封存本次情报';}
}

/* 发现页详情弹窗 */
