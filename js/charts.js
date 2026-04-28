function drawCharts(){
  renderStatsDashboard();
  const stC={playing:0,done:0,wishlist:0,dropped:0},gnC={},pfC={},rtC=[0,0,0,0,0],styC={};
  games.forEach(g=>{
    if(stC[g.status]!==undefined)stC[g.status]++;
    (g.platforms||[]).forEach(p=>{const k=PFMAP[p]||p;pfC[k]=(pfC[k]||0)+1;});
    (g.genres||[]).forEach(gn=>{gnC[gn]=(gnC[gn]||0)+1;});
    (g.styles||[]).forEach(s=>{styC[s]=(styC[s]||0)+1;});
    if(g.rating>=1&&g.rating<=5)rtC[g.rating-1]++;
  });
  const co={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9a9890',font:{size:11}}}}};
  const pal=['#7ecdc4','#ffb3a3','#8fb8a0','#8aa9ee','#7fbfe8','#d7ba7d','#c58fa3','#9ab3a6'];
  function hasData(data){return data.some(v=>v>0);}
  function chartData(labels,data){return hasData(data)?{labels,data}:{labels:['暂无'],data:[1]};}
  function dn(id,labels,data){
    const cd=chartData(labels,data);
    if(charts[id])charts[id].destroy();
    charts[id]=new Chart(document.getElementById(id),{type:'doughnut',data:{labels:cd.labels,datasets:[{data:cd.data,backgroundColor:pal.slice(0,cd.data.length),borderWidth:0}]},options:{...co,cutout:'65%'}});
  }
  function br(id,labels,data,colors){
    const cd=chartData(labels,data);
    if(charts[id])charts[id].destroy();
    charts[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels:cd.labels,datasets:[{data:cd.data,backgroundColor:colors||pal,borderRadius:5,borderWidth:0}]},options:{...co,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#9a9890'},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#9a9890',stepSize:1},grid:{color:'rgba(255,255,255,.04)'}}}}});
  }
  dn('ch-st',['游玩中','已通关','想玩','放弃'],Object.values(stC));
  const tGn=Object.entries(gnC).sort((a,b)=>b[1]-a[1]).slice(0,6);dn('ch-gn',tGn.map(x=>x[0]),tGn.map(x=>x[1]));
  const tPf=Object.entries(pfC).sort((a,b)=>b[1]-a[1]);dn('ch-pf',tPf.map(x=>x[0]),tPf.map(x=>x[1]));
  br('ch-rt',['1星','2星','3星','4星','5星'],rtC,['#445f61','#5a7374','#7a9fa0','#7ecdc4','#ffb3a3']);
  const tSty=Object.entries(styC).sort((a,b)=>b[1]-a[1]).slice(0,10);br('ch-sty',tSty.map(x=>x[0]),tSty.map(x=>x[1]));
}

function renderStatsDashboard(){
  const total=games.length;
  const rated=games.filter(g=>g.rating>0);
  const totalHours=games.reduce((s,g)=>s+(g.hours||0),0);
  const avgRating=rated.length?(rated.reduce((s,g)=>s+g.rating,0)/rated.length):0;
  setTxt('s-total',total);
  setTxt('s-pl',games.filter(g=>g.status==='playing').length);
  setTxt('s-dn',games.filter(g=>g.status==='done').length);
  setTxt('s-hr',totalHours);
  setTxt('s-av',rated.length?avgRating.toFixed(1):'—');

  const done=games.filter(g=>g.status==='done').length;
  const backlog=games.filter(g=>g.status==='playing'||g.status==='wishlist').length;
  const completeFields=games.reduce((s,g)=>s+['platforms','genres','cover','rating','review'].filter(k=>hasField(g,k)).length,0);
  const fieldTotal=Math.max(total*5,1);
  const dataScore=Math.round(completeFields/fieldTotal*100);
  const fiveStar=games.filter(g=>g.rating===5).length;
  setTxt('stats-density',total?`${totalHours}h / ${total} 款`:'等待第一条记录');
  setHTML('stats-insights',[
    insight('通关率',total?`${Math.round(done/total*100)}%`:'—',`${done}/${total}`),
    insight('积压池',backlog,`${games.filter(g=>g.status==='playing').length} 在玩 · ${games.filter(g=>g.status==='wishlist').length} 想玩`),
    insight('资料完整度',`${dataScore}%`,`${games.filter(g=>!hasField(g,'cover')).length} 款缺封面`),
    insight('五星浓度',total?`${Math.round(fiveStar/total*100)}%`:'—',`${fiveStar} 款满分`)
  ].join(''));

  renderGameList('stats-top-hours',games.filter(g=>(g.hours||0)>0).sort((a,b)=>(b.hours||0)-(a.hours||0)).slice(0,5),g=>`${g.hours||0}h`,g=>[STMAP[g.status],ratingText(g)].filter(Boolean).join(' · '));
  renderGameList('stats-top-rated',games.filter(g=>g.rating>0).sort((a,b)=>(b.rating||0)-(a.rating||0)||(b.hours||0)-(a.hours||0)).slice(0,5),g=>ratingText(g),g=>`${g.hours||0}h · ${STMAP[g.status]||'未标记'}`);
  renderGameList('stats-next-up',games.filter(g=>g.status==='playing'||g.status==='wishlist').sort((a,b)=>statusRank(a)-statusRank(b)||(b.hours||0)-(a.hours||0)).slice(0,5),g=>STMAP[g.status]||'待定',g=>`${g.hours||0}h · ${(g.genres||[]).slice(0,2).join(' / ')||'未标类型'}`);
  renderCleanup();
  renderStatRows('stats-platform-hours',platformHours().slice(0,6),x=>x[0],x=>`${x[1]}h`,x=>`${x[2]} 款`);
  renderStatRows('stats-genre-score',genreScores().slice(0,6),x=>x[0],x=>x[1]?x[1].toFixed(1):'—',x=>`${x[2]} 款 · ${x[3]}h`);
}

function setTxt(id,v){const el=document.getElementById(id);if(el)el.textContent=v;}
function setHTML(id,v){const el=document.getElementById(id);if(el)el.innerHTML=v;}
function hasField(g,k){
  if(k==='platforms'||k==='genres')return (g[k]||[]).length>0;
  if(k==='rating')return (g.rating||0)>0;
  return Boolean(g[k]);
}
function insight(label,value,sub){return `<div class="stats-insight"><div class="stats-insight-v">${esc(String(value))}</div><div class="stats-insight-l">${esc(label)}</div><div class="stats-insight-s">${esc(sub)}</div></div>`;}
function ratingText(g){return g.rating?`${g.rating}星`:'未评分';}
function statusRank(g){return g.status==='playing'?0:g.status==='wishlist'?1:2;}
function qid(g){return String(g.id||g._id||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function gameRow(g,value,meta){
  return `<button class="stats-game-row" onclick="openDetail('${qid(g)}')">
    <span class="stats-game-cover">${g.cover?`<img src="${esc(g.cover)}" alt="" loading="lazy" onerror="this.remove()">`:''}</span>
    <span class="stats-game-main"><span class="stats-game-name">${esc(g.name||'未命名')}</span><span class="stats-game-meta">${esc(meta(g))}</span></span>
    <span class="stats-game-value">${esc(String(value(g)))}</span>
  </button>`;
}
function renderGameList(id,list,value,meta){
  setHTML(id,list.length?list.map(g=>gameRow(g,value,meta)).join(''):'<div class="stats-empty">暂无记录</div>');
}
function cleanupRow(label,list){
  const first=list[0];
  if(first)return `<button class="stats-clean-row" onclick="openDetail('${qid(first)}')"><span>${esc(label)}</span><strong>${list.length}</strong><em>${esc(first.name||'未命名')}</em></button>`;
  return `<div class="stats-clean-row is-clear"><span>${esc(label)}</span><strong>0</strong><em>已整理</em></div>`;
}
function renderCleanup(){
  const rows=[
    cleanupRow('缺封面',games.filter(g=>!g.cover)),
    cleanupRow('未评分',games.filter(g=>(g.hours||0)>0&&!(g.rating>0))),
    cleanupRow('缺类型',games.filter(g=>!(g.genres||[]).length)),
    cleanupRow('缺平台',games.filter(g=>!(g.platforms||[]).length)),
    cleanupRow('高时长无短评',games.filter(g=>(g.hours||0)>=10&&!g.review))
  ];
  setHTML('stats-cleanup',rows.join(''));
}
function platformHours(){
  const map={};
  games.forEach(g=>(g.platforms||[]).forEach(p=>{
    const k=PFMAP[p]||p;
    if(!map[k])map[k]={hours:0,count:0};
    map[k].hours+=g.hours||0;map[k].count++;
  }));
  return Object.entries(map).map(([k,v])=>[k,v.hours,v.count]).sort((a,b)=>b[1]-a[1]);
}
function genreScores(){
  const map={};
  games.forEach(g=>(g.genres||[]).forEach(gn=>{
    if(!map[gn])map[gn]={sum:0,rated:0,count:0,hours:0};
    map[gn].count++;map[gn].hours+=g.hours||0;
    if(g.rating>0){map[gn].sum+=g.rating;map[gn].rated++;}
  }));
  return Object.entries(map).map(([k,v])=>[k,v.rated?v.sum/v.rated:0,v.count,v.hours]).sort((a,b)=>b[1]-a[1]||b[3]-a[3]);
}
function renderStatRows(id,rows,label,value,meta){
  setHTML(id,rows.length?rows.map(r=>`<div class="stats-metric-row"><span>${esc(label(r))}</span><strong>${esc(String(value(r)))}</strong><em>${esc(meta(r))}</em></div>`).join(''):'<div class="stats-empty">暂无记录</div>');
}
let amd='login';
