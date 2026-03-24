function drawCharts(){
  const stC={playing:0,done:0,wishlist:0,dropped:0},gnC={},pfC={},rtC=[0,0,0,0,0],styC={};
  games.forEach(g=>{
    if(stC[g.status]!==undefined)stC[g.status]++;
    (g.platforms||[]).forEach(p=>{const k=PFMAP[p]||p;pfC[k]=(pfC[k]||0)+1;});
    (g.genres||[]).forEach(gn=>{gnC[gn]=(gnC[gn]||0)+1;});
    (g.styles||[]).forEach(s=>{styC[s]=(styC[s]||0)+1;});
    if(g.rating>=1&&g.rating<=5)rtC[g.rating-1]++;
  });
  const co={responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9a9890',font:{size:11}}}}};
  const pal=['#60a5fa','#38bdf8','#f0b940','#ff6e6e','#8cb4ff','#d68cff','#ff9c69','#6ecfff'];
  function dn(id,labels,data){if(charts[id])charts[id].destroy();charts[id]=new Chart(document.getElementById(id),{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:pal.slice(0,data.length),borderWidth:0}]},options:{...co,cutout:'65%'}});}
  function br(id,labels,data,colors){if(charts[id])charts[id].destroy();charts[id]=new Chart(document.getElementById(id),{type:'bar',data:{labels,datasets:[{data,backgroundColor:colors||pal,borderRadius:5,borderWidth:0}]},options:{...co,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#9a9890'},grid:{color:'rgba(255,255,255,.04)'}},y:{ticks:{color:'#9a9890',stepSize:1},grid:{color:'rgba(255,255,255,.04)'}}}}});}
  dn('ch-st',['游玩中','已通关','想玩','放弃'],Object.values(stC));
  const tGn=Object.entries(gnC).sort((a,b)=>b[1]-a[1]).slice(0,6);dn('ch-gn',tGn.map(x=>x[0]),tGn.map(x=>x[1]));
  const tPf=Object.entries(pfC).sort((a,b)=>b[1]-a[1]);dn('ch-pf',tPf.map(x=>x[0]),tPf.map(x=>x[1]));
  br('ch-rt',['1★','2★','3★','4★','5★'],rtC,['#444','#666','#999','#60a5fa','#38bdf8']);
  const tSty=Object.entries(styC).sort((a,b)=>b[1]-a[1]).slice(0,10);br('ch-sty',tSty.map(x=>x[0]),tSty.map(x=>x[1]));
}
let amd='login';
