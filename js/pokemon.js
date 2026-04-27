/* ===== 宝可梦背景 ===== */
(function(){
  const canvas=document.getElementById('pkm-canvas');const ctx=canvas.getContext('2d');let W,H;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  window.addEventListener('resize',resize);resize();
  const ID_POOL=[1,4,7,25,39,52,54,94,131,133,143,147,150,151,152,155,158,175,179,196,197,202,212,245,249,250,251,255,258,261,280,300,333,349,350,351,371,380,381,384,385,386,387,390,393,403,417,427,443,448,459,468,470,471,479,480,481,482,483,484,487,491,493,494,495,498,501,509,519,527,543,551,570,572,574,577,585,592,599,605,610,613,622,627,635,643,644,646,647,648,649,650,653,656,661,664,669,672,674,677,679,682,684,686,688,690,692,694,696,698,700,701,702,706,708,710,712,714,722,725,728,731,734,736,739,741,744,746,749,751,753,755,757,759,761,764,766,769,771,774,777,779,782,785,788,789,791,792,800,810,813,816,819,821,824,827,829,831,833,837,840,843,845,848,850,852,854,856,859,862,863,864,865,866,868,870,875,877,882,888,889,890,906,909,912,914,917,919,921,924,927,929,931,933,935,937,939,941,943,945,947,949,951,953,955,957,959,963,965,967,969,971,975,977,979];
  const COUNT=16;const sprites=[];const imgCache={};
  async function loadImg(id){if(imgCache[id])return imgCache[id];return new Promise(resolve=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{imgCache[id]=img;resolve(img);};img.onerror=()=>resolve(null);img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;});}
  function randId(){return ID_POOL[Math.floor(Math.random()*ID_POOL.length)];}
  async function initSprites(){const ids=Array.from({length:COUNT},()=>randId());await Promise.all(ids.map(async(id,i)=>{const img=await loadImg(id);sprites.push({id,img,x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,scale:1.5+Math.random()*2,phase:Math.random()*Math.PI*2,bobAmp:8+Math.random()*12,bobSpeed:.003+Math.random()*.005,alpha:.55+Math.random()*.35,swapTimer:300+Math.floor(Math.random()*400),swapCount:0});}));loop();}
  function loop(){ctx.clearRect(0,0,W,H);for(const sp of sprites){sp.phase+=sp.bobSpeed;const bobY=Math.sin(sp.phase)*sp.bobAmp;sp.x+=sp.vx;sp.y+=sp.vy;const sz=96*sp.scale/3;if(sp.x>W+sz)sp.x=-sz;if(sp.x<-sz)sp.x=W+sz;if(sp.y>H+sz)sp.y=-sz;if(sp.y<-sz)sp.y=H+sz;sp.swapCount++;if(sp.swapCount>=sp.swapTimer){sp.swapCount=0;sp.swapTimer=300+Math.floor(Math.random()*400);const newId=randId();loadImg(newId).then(img=>{sp.id=newId;sp.img=img;});}if(sp.img){const drawW=sp.img.width*sp.scale;const drawH=sp.img.height*sp.scale;ctx.save();ctx.globalAlpha=sp.alpha;ctx.imageSmoothingEnabled=false;ctx.drawImage(sp.img,Math.round(sp.x),Math.round(sp.y+bobY),drawW,drawH);ctx.restore();}}requestAnimationFrame(loop);}
  initSprites();
})();

/* ===== 宝可梦专栏 ===== */
const POKEAPI='https://pokeapi.co/api/v2';
const TYPE_COLOR={normal:'#A8A878',fire:'#F08030',water:'#6890F0',electric:'#F8D030',grass:'#78C850',ice:'#98D8D8',fighting:'#C03028',poison:'#A040A0',ground:'#E0C068',flying:'#A890F0',psychic:'#F85888',bug:'#A8B820',rock:'#B8A038',ghost:'#705898',dragon:'#7038F8',dark:'#705848',steel:'#B8B8D0',fairy:'#EE99AC'};
const TYPE_ZH={normal:'一般',fire:'火',water:'水',electric:'电',grass:'草',ice:'冰',fighting:'格斗',poison:'毒',ground:'地面',flying:'飞行',psychic:'超能力',bug:'虫',rock:'岩石',ghost:'幽灵',dragon:'龙',dark:'恶',steel:'钢',fairy:'妖精'};
const STAT_ZH={hp:'HP',attack:'攻击',defense:'防御','special-attack':'特攻','special-defense':'特防',speed:'速度'};
const GEN_RANGE={1:[1,151],2:[152,251],3:[252,386],4:[387,493],5:[494,649],6:[650,721],7:[722,809],8:[810,905],9:[906,1010]};
const PKM_SERIES=[{id:'red-blue',name:'红/蓝',year:1996},{id:'yellow',name:'黄',year:1998},{id:'gold-silver',name:'金/银',year:1999},{id:'crystal',name:'水晶',year:2000},{id:'ruby-sapphire',name:'红宝石/蓝宝石',year:2002},{id:'firered-leafgreen',name:'火红/叶绿',year:2004},{id:'emerald',name:'绿宝石',year:2004},{id:'diamond-pearl',name:'钻石/珍珠',year:2006},{id:'platinum',name:'白金',year:2008},{id:'heartgold-soulsilver',name:'心金/魂银',year:2009},{id:'black-white',name:'黑/白',year:2010},{id:'black2-white2',name:'黑2/白2',year:2012},{id:'x-y',name:'X/Y',year:2013},{id:'oras',name:'始源红/蓝',year:2014},{id:'sun-moon',name:'太阳/月亮',year:2016},{id:'usum',name:'究极日月',year:2017},{id:'sword-shield',name:'剑/盾',year:2019},{id:'bdsp',name:'晶灿钻石/明亮珍珠',year:2021},{id:'legends-arceus',name:'传说:阿尔宙斯',year:2022},{id:'scarlet-violet',name:'朱/紫',year:2022},{id:'legends-za',name:'传说:Z-A',year:2025}];

let pkmCollection={},todayPkm=null,pkmChatHistory=[],currentChatPkm=null,pkmChatFromModal=false;
let pkmSearchT=null,genCache={};
const pkmCNCache={};
const pkmDescTransCache={}; // 图鉴翻译缓存 {pkmId: '已翻译文字'}
let pkmOfficialDexCache=null;
let pkmOfficialDexPromise=null;
let pkmOfficialVariantDataCache=null;
let pkmOfficialVariantDataPromise=null;
const pkmDetailFormsCache={};
let currentDetailPkmId=null;
const _52pokeInfoCache={}; // 52poke 精灵信息缓存 {cnName: {abilities,hiddenAbility,evYields}}

function typeTag(t){const c=TYPE_COLOR[t]||'#888';return`<span class="pkm-type" style="background:${c}22;color:${c};border:1px solid ${c}44">${TYPE_ZH[t]||t}</span>`;}
function statBar(name,val){const pct=Math.min(100,Math.round(val/255*100));const c=val>=100?'var(--acc2)':val>=60?'var(--acc)':'var(--warn)';return`<div class="pkm-stat-row"><span class="pkm-stat-lbl">${STAT_ZH[name]||name}</span><div class="pkm-stat-bar"><div class="pkm-stat-fill" style="width:${pct}%;background:${c}"></div></div><span class="pkm-stat-val">${val}</span></div>`;}
async function fetchPkm(idOrName){const r=await fetch(`${POKEAPI}/pokemon/${idOrName}`);if(!r.ok)throw new Error('未找到');return r.json();}
async function fetchPkmSpecies(idOrName){const r=await fetch(`${POKEAPI}/pokemon-species/${idOrName}`);if(!r.ok)return null;return r.json();}
function getPokemonSprite(p,mode='static'){
  const id=Number(p?.id)||0;
  const name=String(p?.name||'').toLowerCase();
  const official=p?.sprites?.other?.['official-artwork']?.front_default||'';
  const staticSprite=p?.sprites?.front_default||official||'';
  if(mode==='artwork')return official||staticSprite;
  if(mode==='animated'){
    if(name)return`https://play.pokemonshowdown.com/sprites/ani/${name}.gif`;
    if(id>0&&id<=649)return`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
  }
  return staticSprite;
}
function updatePkmDetailSpriteToggle(){
  const img=document.getElementById('pkm-detail-img');
  const btns=[
    document.getElementById('pkm-detail-sprite-toggle'),
    document.getElementById('pkm-detail-sprite-action')
  ].filter(Boolean);
  if(!img||!btns.length)return;
  const staticSrc=img.dataset.staticSrc||'';
  const animatedSrc=img.dataset.animatedSrc||'';
  const hasAnimated=!!animatedSrc&&animatedSrc!==staticSrc;
  btns.forEach(btn=>{
    btn.disabled=!hasAnimated;
    btn.classList.toggle('on',img.dataset.mode==='animated');
    btn.textContent=img.dataset.mode==='animated'?'静态图':'动态图';
    btn.title=hasAnimated?'切换动态图/静态图':'这只宝可梦暂无可用动态图';
  });
}
function togglePkmDetailSprite(ev){
  ev?.stopPropagation?.();
  const img=document.getElementById('pkm-detail-img');if(!img)return;
  const staticSrc=img.dataset.staticSrc||img.src;
  const animatedSrc=img.dataset.animatedSrc||staticSrc;
  const toAnimated=img.dataset.mode!=='animated'&&animatedSrc&&animatedSrc!==staticSrc;
  img.dataset.mode=toAnimated?'animated':'static';
  img.src=toAnimated?animatedSrc:staticSrc;
  updatePkmDetailSpriteToggle();
}
function getSpeciesDexId(p,species){
  return Number(species?.id)
    || Number(String(p?.species?.url||'').split('/').filter(Boolean).pop())
    || Number(p?.id)
    || 0;
}
function getFormSlug(p,species){
  const rawName=String(p?.name||'');
  const speciesName=String(species?.name||p?.species?.name||'');
  if(!rawName||!speciesName||rawName===speciesName)return'';
  return rawName.startsWith(speciesName+'-')?rawName.slice(speciesName.length+1):rawName;
}
function padDexId(id){return String(id).padStart(4,'0');}
function plainHtmlText(html){
  return String(html||'')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<[^>]+>/g,'')
    .replace(/&nbsp;/g,' ')
    .replace(/&amp;/g,'&')
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'")
    .replace(/\s+/g,' ')
    .trim();
}
async function loadOfficialPkmVariants(){
  if(pkmOfficialVariantDataCache)return pkmOfficialVariantDataCache;
  if(pkmOfficialVariantDataPromise)return pkmOfficialVariantDataPromise;
  pkmOfficialVariantDataPromise=(async()=>{
    const paths=['js/data/pokedex_zh_official_variants.json','scripts/out/pokedex_zh_official_variants.json'];
    for(const path of paths){
      try{
        const r=await fetch(path,{cache:'force-cache'});
        if(!r.ok)continue;
        const data=await r.json();
        if(data&&typeof data==='object'){
          pkmOfficialVariantDataCache=data;
          return pkmOfficialVariantDataCache;
        }
      }catch{}
    }
    pkmOfficialVariantDataCache={};
    return pkmOfficialVariantDataCache;
  })();
  return pkmOfficialVariantDataPromise;
}
const FORM_TOKEN_HINTS={
  alola:['阿罗拉'],
  galar:['伽勒尔'],
  hisui:['洗翠'],
  paldea:['帕底亚'],
  mega:['超级进化','超级'],
  gmax:['超极巨化'],
  x:['Ｘ','X'],
  y:['Ｙ','Y'],
  male:['雄性'],
  female:['雌性'],
  red:['红'],
  blue:['蓝'],
  yellow:['黄'],
  green:['绿'],
  orange:['橙'],
  white:['白'],
  black:['黑'],
  violet:['紫'],
  indigo:['靛'],
  spring:['春'],
  summer:['夏'],
  autumn:['秋'],
  winter:['冬'],
  aria:['歌声'],
  pirouette:['舞步'],
  baile:['热辣热辣'],
  'pom-pom':['啪滋啪滋'],
  pau:['呼拉呼拉'],
  sensu:['轻盈轻盈'],
  midday:['白昼','白天','中午'],
  midnight:['黑夜','夜晚','午夜'],
  dusk:['黄昏'],
  'red-striped':['红条纹'],
  'blue-striped':['蓝条纹'],
  incarnate:['化身'],
  therian:['灵兽'],
  plant:['草木蓑衣'],
  sandy:['砂土蓑衣'],
  trash:['垃圾蓑衣'],
  wash:['清洗'],
  heat:['加热'],
  frost:['结冰'],
  fan:['旋转'],
  mow:['切割'],
  sunshine:['晴天'],
  overcast:['阴天'],
  attack:['攻击'],
  defense:['防御'],
  speed:['速度'],
  land:['陆上','大地'],
  sky:['天空'],
  ordinary:['平常'],
  resolute:['觉悟'],
  confined:['惩戒'],
  unbound:['解放'],
  '50':['50'],
  complete:['完全体'],
  '10':['10'],
  full:['满腹'],
  'full-belly':['满腹'],
  hangry:['空腹'],
  meteor:['流星'],
  core:['核心'],
  small:['小尺寸','小'],
  large:['大尺寸','大'],
  super:['特大尺寸','超级'],
  curly:['卷曲','卷卷'],
  droopy:['下垂','垂垂'],
  stretchy:['平挺','伸展'],
  phony:['赝品'],
  antique:['真品'],
  masterpiece:['杰作'],
  family:['一家'],
  four:['四只家族','一家'],
};
function scoreOfficialVariantMatch(variant,p,species){
  let score=0;
  const formSlug=getFormSlug(p,species);
  const tokens=formSlug?[formSlug,...formSlug.split('-').filter(Boolean)]:[];
  const label=`${variant.name||''} ${variant.subname||''}`;
  const subname=variant.subname||'';
  const typeNames=(p.types||[]).map(t=>TYPE_ZH[t.type.name]||t.type.name);
  if(!formSlug){
    if(!subname||subname==='一般'||subname==='流星的样子'||subname==='热辣热辣风格')score+=8;
    if(variant.href.endsWith(`/${padDexId(getSpeciesDexId(p,species))}`))score+=6;
  }else{
    tokens.forEach(token=>{
      const hints=FORM_TOKEN_HINTS[token];
      if(hints&&hints.some(h=>label.includes(h)))score+=7;
      else if(label&&label.toLowerCase().includes(token))score+=4;
    });
  }
  if(typeNames.length&&variant.types?.length){
    const same=typeNames.filter(t=>variant.types.includes(t)).length;
    if(same===typeNames.length&&same===variant.types.length)score+=5;
    else score+=same;
  }
  if(subname==='一般'&&formSlug==='')score+=3;
  if(subname&&formSlug&&subname.includes('样子'))score+=1;
  return score;
}
async function resolveOfficialDexVariant(p,species){
  const dexId=getSpeciesDexId(p,species);
  if(!dexId)return null;
  const variantMap=await loadOfficialPkmVariants().catch(()=>null);
  const variants=variantMap?.[String(dexId)]||variantMap?.[dexId]||null;
  if(!variants?.length)return null;
  if(variants.length===1)return variants[0];
  const scored=variants.map(v=>({variant:v,score:scoreOfficialVariantMatch(v,p,species)})).sort((a,b)=>b.score-a.score);
  return scored[0]?.variant||variants[0];
}
async function loadOfficialPkmDex(){
  if(pkmOfficialDexCache)return pkmOfficialDexCache;
  if(pkmOfficialDexPromise)return pkmOfficialDexPromise;
  pkmOfficialDexPromise=(async()=>{
    const paths=['js/data/pokedex_zh_official.json','scripts/out/pokedex_zh_official.json'];
    for(const path of paths){
      try{
        const r=await fetch(path,{cache:'force-cache'});
        if(!r.ok)continue;
        const data=await r.json();
        if(Array.isArray(data)&&data.length){
          const map={};
          data.forEach(item=>{if(item?.id)map[item.id]=item;});
          pkmOfficialDexCache=map;
          return pkmOfficialDexCache;
        }
      }catch{}
    }
    pkmOfficialDexCache={};
    return pkmOfficialDexCache;
  })();
  return pkmOfficialDexPromise;
}
async function getOfficialDexDesc(pkmId){
  const map=await loadOfficialPkmDex();
  const item=map?.[pkmId];
  if(!item)return null;
  if(Array.isArray(item.descZhAll)&&item.descZhAll.length){
    return item.descZhAll.find(Boolean)||item.descZh||null;
  }
  return item.descZh||null;
}
function getCachedOfficialDexName(pkmId){
  return pkmOfficialDexCache?.[pkmId]?.zhName||null;
}
async function getOfficialDexName(pkmId){
  const map=await loadOfficialPkmDex();
  return map?.[pkmId]?.zhName||null;
}
async function getPreferredBaseName(p,species,cnFallback){
  const dexId=getSpeciesDexId(p,species)||Number(p?.id)||0;
  const officialName=await getOfficialDexName(dexId).catch(()=>null);
  return officialName
    || cnFallback
    || getCNName(species,p?.name)
    || (dexId?await getPkmCNName(dexId,p?.name):null)
    || PKM_CN_TABLE[dexId]
    || species?.name
    || p?.name
    || '';
}
async function getOfficialFormDexDesc(p,species){
  const variant=await resolveOfficialDexVariant(p,species).catch(()=>null);
  const texts=(variant?.descZhAll||[]).filter(Boolean);
  if(!texts.length)return null;
  return{text:texts[0],texts,variant};
}
function getDisplayNameWithVariant(baseName,variant){
  if(variant?.name&&variant.name!==baseName&&!variant.subname)return variant.name;
  if(!variant?.subname||variant.subname==='一般')return baseName;
  return `${baseName}（${variant.subname}）`;
}
function getDetailBaseName(p,species){
  const dexId=getSpeciesDexId(p,species)||Number(p?.id)||0;
  return getCachedOfficialDexName(dexId)||getCNName(species,p?.name)||PKM_CN_TABLE[dexId]||(species?.name||p?.name||'');
}
function buildSearchCandidates(){
  const seen=new Map();
  Object.entries(PKM_CN_TABLE).forEach(([id,name])=>{
    const dexId=Number(id);
    const officialName=getCachedOfficialDexName(dexId)||name;
    seen.set(`base-${dexId}`,{key:`base-${dexId}`,label:officialName,searchText:[officialName,name].filter(Boolean).join(' '),target:dexId});
  });
  const variantsMap=pkmOfficialVariantDataCache||{};
  Object.entries(variantsMap).forEach(([dexId,items])=>{
    const baseName=getCachedOfficialDexName(Number(dexId))||PKM_CN_TABLE[Number(dexId)]||'';
    (items||[]).forEach(v=>{
      const label=getDisplayNameWithVariant(baseName,v);
      const searchText=[baseName,v.name,v.subname,label].filter(Boolean).join(' ');
      const key=`variant-${dexId}-${v.href||label}`;
      if(!seen.has(key))seen.set(key,{key,label,searchText,target:Number(dexId)});
    });
  });
  return [...seen.values()];
}
async function renderDetailForms(p,species,baseName){
  const wrap=document.getElementById('pkm-detail-forms');
  if(!wrap)return;
  const dexId=getSpeciesDexId(p,species)||Number(p.id)||0;
  const cacheKey=String(dexId);
  let forms=pkmDetailFormsCache[cacheKey];
  if(!forms){
    const varieties=species?.varieties||[];
    forms=await Promise.all(varieties.map(async v=>{
      try{
        const vp=await fetchPkm(v.pokemon.name);
        const variant=await resolveOfficialDexVariant(vp,species).catch(()=>null);
        return{
          id:vp.id,
          name:vp.name,
          sprite:vp.sprites?.front_default||'',
          displayName:getDisplayNameWithVariant(baseName,variant),
          sortKey:variant?.href?.split('/').pop()||`${padDexId(dexId)}-${v.pokemon.name}`,
        };
      }catch{return null;}
    }));
    forms=forms.filter(Boolean);
    const uniq=new Map();
    forms.forEach(f=>{if(!uniq.has(f.name))uniq.set(f.name,f);});
    forms=[...uniq.values()].sort((a,b)=>a.sortKey.localeCompare(b.sortKey,'en'));
    pkmDetailFormsCache[cacheKey]=forms;
  }
  if(forms.length<=1){wrap.style.display='none';wrap.innerHTML='';return;}
  wrap.style.display='flex';
  wrap.innerHTML=forms.map(f=>`<button class="pkm-detail-form-chip${f.id===p.id?' on':''}" onclick="openPkmDetail('${f.name}')">${f.sprite?`<img src="${f.sprite}" alt="">`:''}<span>${esc(f.displayName)}</span></button>`).join('');
}

// ===== 宝可梦官方简体中文名对照表（全1003只）=====
const PKM_CN_TABLE={1:'妙蛙种子',2:'妙蛙草',3:'妙蛙花',4:'小火龙',5:'火恐龙',6:'喷火龙',7:'杰尼龟',8:'卡咪龟',9:'水箭龟',10:'绿毛虫',11:'铁甲蛹',12:'巴大蝶',13:'独角虫',14:'铁壳蛹',15:'大针蜂',16:'波波',17:'比比鸟',18:'大比鸟',19:'小拉达',20:'拉达',
21:'烈雀',22:'大嘴雀',23:'阿柏蛇',24:'阿柏怪',25:'皮卡丘',26:'雷丘',27:'穿山鼠',28:'穿山王',29:'尼多兰',30:'尼多娜',31:'尼多后',32:'尼多朗',33:'尼多力诺',34:'尼多王',35:'皮皮',36:'皮可西',37:'六尾',38:'九尾',39:'胖丁',40:'胖可丁',
41:'超音蝠',42:'大嘴蝠',43:'走路草',44:'臭臭花',45:'霸王花',46:'派拉斯',47:'派拉斯特',48:'毛球',49:'安穆泥',50:'地鼠',51:'三地鼠',52:'喵喵',53:'猫老大',54:'可达鸭',55:'哥达鸭',56:'猴怪',57:'火暴猴',58:'卡蒂狗',59:'风速狗',60:'蚊香蝌蚪',
61:'蚊香君',62:'蚊香泳士',63:'凯西',64:'勇基拉',65:'胡地',66:'腕力',67:'豪力',68:'怪力',69:'喇叭芽',70:'口呆花',71:'大食花',72:'玛瑙水母',73:'毒刺水母',74:'小拳石',75:'隆隆石',76:'隆隆岩',77:'小火马',78:'烈焰马',79:'呆呆兽',80:'呆壳兽',
81:'小磁怪',82:'三磁怪',83:'大葱鸭',84:'嘟嘟',85:'嘟嘟利',86:'小海狮',87:'白海狮',88:'臭泥',89:'臭臭泥',90:'大舌贝',91:'刺甲贝',92:'鬼斯',93:'鬼斯通',94:'耿鬼',95:'大岩蛇',96:'食梦梦',97:'梦妖',98:'大钳蟹',99:'巨钳蟹',100:'霹雳球',
101:'顽皮雷弹',102:'蛋蛋',103:'椰蛋树',104:'卡拉卡拉',105:'嘎啦嘎啦',106:'飞腿郎',107:'快拳郎',108:'舔舔',109:'毒瓦斯',110:'双弹瓦斯',111:'独角犀牛',112:'钻角犀兽',113:'吉利蛋',114:'蔓藤怪',115:'袋兽',116:'海马仔',117:'刺龙王',118:'角金鱼',119:'金鱼王',120:'海星星',
121:'宝石海星',122:'魔墙人偶',123:'飞天螳螂',124:'迷唇姐',125:'电击兽',126:'鸭嘴火兽',127:'凯罗斯',128:'肯泰罗',129:'鲤鱼王',130:'暴鲤龙',131:'乘龙',132:'百变怪',133:'伊布',134:'水伊布',135:'雷伊布',136:'火伊布',137:'多边兽',138:'菊石兽',139:'多刺菊石兽',140:'化石盔',
141:'镰刀盔',142:'化石翼龙',143:'卡比兽',144:'急冻鸟',145:'闪电鸟',146:'火焰鸟',147:'迷你龙',148:'哈克龙',149:'快龙',150:'超梦',151:'梦幻',152:'菊草叶',153:'月桂叶',154:'大竺葵',155:'火球鼠',156:'火岩鼠',157:'火暴兽',158:'波克达',159:'鳄鱼弟',160:'大力鳄',
161:'尾立',162:'大尾立',163:'咕咕',164:'猫头夜鹰',165:'芭瓢虫',166:'电爆虫',167:'圆丝蛛',168:'阿利多斯',169:'叉字蝠',170:'亮亮鱼',171:'灯笼鱼',172:'皮丘',173:'宝宝丁',174:'布比小丑',175:'波克比',176:'波克基古',177:'天然雀',178:'占卜鸟',179:'咩利羊',180:'茸茸羊',
181:'电龙',182:'美丽花',183:'玛力露',184:'玛力露丽',185:'树才怪',186:'隐水青蛙',187:'跳跳猪',188:'棉棉草',189:'绒绒草',190:'傻傻猫',191:'向日种子',192:'向日花怪',193:'乌波',194:'沼跃鱼',195:'蚌壳兽',196:'太阳伊布',197:'月亮伊布',198:'黑暗鸦',199:'呆河马',200:'梦妖幻',
201:'未知图腾',202:'果然翁',203:'麒麟奇',204:'壶壶',205:'盾甲茧',206:'土龙弟弟',207:'天蝎',208:'大钢蛇',209:'布鲁',210:'布鲁皇',211:'刺刺鱼',212:'剑郎',213:'壶缘缘',214:'赫拉克罗斯',215:'迪路兽',216:'熊宝宝',217:'熊霸',218:'岩浆蜗牛',219:'溶岩蜗牛',220:'小山猪',
221:'猪猪兽',222:'珊瑚龙',223:'铁炮鱼',224:'章鱼桶',225:'德利鸟',226:'魔翼飞鱼',227:'钢翼鸟',228:'炎狐兽',229:'黑炎狐',230:'金色海马',231:'小小象',232:'大象巨猿',233:'多边兽Ⅱ',234:'惊角鹿',235:'大画师',236:'飞拳蛙',237:'怪力蛙',238:'迷唇娃',239:'小小雷',240:'小小焰',
241:'大奶罐',242:'幸福蛋',243:'雷公',244:'炎帝',245:'水君',246:'幼基拉斯',247:'沙基拉斯',248:'班基拉斯',249:'路基欧',250:'凤王',251:'时拉比',252:'木守宫',253:'森林蜥蜴',254:'蜥蜴王',255:'火稚鸡',256:'火焰鸡',257:'炽焰鸡',258:'水跃兽',259:'沼跃兽',260:'沼王',
261:'土狼犬',262:'大狼犬',263:'之字郎',264:'之字猫',265:'刺尾虫',266:'盔茧',267:'彩粉蝶',268:'沙茧',269:'毒粉蝶',270:'莲帽小童',271:'莲帽幼童',272:'乐天河童',273:'撒种小僧',274:'长鼻叶',275:'果树怪',276:'赤红雀',277:'天然鸟',278:'长翅鸥',279:'长翅鸥Ⅱ',280:'拉鲁拉丝',
281:'奇鲁莉安',282:'沙奈朵',283:'溅水宝宝',284:'涉水鱼郎',285:'蘑蘑菇',286:'肌肉草',287:'懒懒兽',288:'隐形兽',289:'超级懒兽',290:'土居忍士',291:'铁面忍者',292:'铁面影人',293:'振声虫',294:'超声虫',295:'爆音波',296:'投技少爷',297:'爆打拳师',298:'鼻可丽',299:'竖耳蝙蝠',300:'貌美猫',
301:'猫小姐',302:'闇黑独眼',303:'钢下颚',304:'可可多拉',305:'多拉克',306:'多边兽Ⅲ',307:'忍拳卡',308:'不知翁',309:'雷丘仔',310:'电气兽',311:'正电拍拍',312:'负电拍拍',313:'雄萤虫',314:'雌萤虫',315:'毒蔷薇',316:'毒圆宝',317:'垃圾袋',318:'颚锯鱼',319:'巨牙鲨',320:'吞食兽',
321:'吞食海牛',322:'溶溶熔岩',323:'魔熔兽',324:'煤炭龟',325:'心跳球',326:'迷惑之球',327:'吃吃斯',328:'飞沙蛭',329:'沙漠蜻蜓',330:'螳螂虾',331:'龙舌拉',332:'大灯笼',333:'羽毛球',334:'七夕青鸟',335:'乌拉拉',336:'缠绕蟒',337:'月石宝',338:'太阳宝',339:'泥泥鱼',340:'泥泥鱼王',
341:'龙虾小兵',342:'龙虾将军',343:'黏美人',344:'黏美人偶',345:'海百合',346:'铁羽百合',347:'古空棘鱼',348:'重甲潮流鱼',349:'丑丑鱼',350:'美纳斯',351:'天气娃娃',352:'变色龙',353:'毛球鬼',354:'魔镜台',355:'骷髅公仔',356:'骷髅妈妈',357:'热带龙',358:'铃铛响',359:'阿勃梭鲁',360:'还未孵化',
361:'雪人宝',362:'冰鬼护',363:'海豹球',364:'海豹',365:'帝牙海狮',366:'璀璨贝',367:'勾魂眼',368:'玫瑰海星',369:'巨古拉',370:'心心鱼',371:'幼基古拉',372:'沙壳龙',373:'飞龙',374:'铁哑铃',375:'铁哑铃Ⅱ',376:'巨金怪',377:'雷吉洛克',378:'雷吉艾斯',379:'雷吉斯奇鲁',380:'拉帝亚斯',
381:'拉帝欧斯',382:'盖欧卡',383:'固拉多',384:'烈空坐',385:'基拉祈',386:'代欧奇希斯',387:'草苗龟',388:'浮草龟',389:'树林龟',390:'小猴子',391:'猛火猴',392:'烈焰猴',393:'波加曼',394:'波皇子',395:'帝王拿',396:'姆克儿',397:'姆克鸟',398:'姆克霸',399:'比克斯',400:'大比克斯',
401:'鸣鸣虫',402:'乐乐蟬',403:'小皮皮',404:'莱可儿',405:'路卡利欧',406:'花蓓蓓',407:'玫瑰马',408:'头盔化石',409:'镰刀铁盔',410:'盾甲化石',411:'盾甲化石Ⅱ',412:'结草儿',413:'蓑衣虫',414:'蛾儿',415:'蜂女王',416:'蜂女王Ⅱ',417:'帕其利斯',418:'泳圈鼬',419:'浮潜鼬',420:'樱花儿',
421:'樱花恋',422:'海星海星',423:'单颌怪',424:'双尾怪',425:'飘飘球',426:'逃个球',427:'卷卷耳',428:'长耳兔',429:'幻影进化',430:'黑翅膀鸦',431:'毛球',432:'喵可丽',433:'叮当钟',434:'臭鼬婴',435:'臭鼬',436:'青铜小钟',437:'青铜钟',438:'土偶娃',439:'魔术师',440:'幸福蛋Ⅱ',
441:'聒噪鸟',442:'幽灵',443:'迷你龙Ⅱ',444:'哈克龙Ⅱ',445:'烈咬陆鲨',446:'卡比兽宝宝',447:'波利',448:'路卡利欧Ⅱ',449:'河马兽',450:'大河马',451:'蝎子',452:'蝎子王',453:'毒蛙',454:'毒镖蛙',455:'捕虫植物',456:'发光鱼',457:'发光鱼Ⅱ',458:'空中曼波',459:'雪球',460:'长毛雪人',
461:'暗伊布',462:'多边兽Ζ',463:'呆呆王',464:'钻角犀兽Ⅱ',465:'蔓藤怪Ⅱ',466:'电击兽Ⅱ',467:'鸭嘴火兽Ⅱ',468:'波克基古Ⅱ',469:'绑架甲虫',470:'草叶伊布',471:'冰伊布',472:'天蝎Ⅱ',473:'象牙猪',474:'多边兽Ζ Ⅱ',475:'艾路雷朵',476:'大鼻球',477:'骷髅盔甲',478:'雪妖女',479:'幽灵洗衣机',480:'知识神',
481:'意志神',482:'情感神',483:'帝牙卢卡',484:'帕路奇亚',485:'骑拉帝纳',486:'雷吉奇卡斯',487:'克雷色利亚',488:'曼妙鱼',489:'妈妈皮',490:'曼纳菲',491:'达克莱伊',492:'谢米',493:'阿尔宙斯',494:'胜利神兽',495:'藤藤蛇',496:'蔓蔓蛇',497:'超级蔓蛇',498:'暖暖猪',499:'顿顿猪',500:'爆香猪',
501:'水水獭',502:'双刃丸',503:'大剑鬼',504:'探探鼠',505:'步哨鼠',506:'小约克',507:'哈约克',508:'长毛狗',509:'扒手猫',510:'酷豹',511:'花椰猴',512:'花椰猿',513:'爆香猴',514:'爆香猿',515:'冷水猴',516:'冷水猿',517:'食梦梦',518:'梦梦蚀',519:'豆豆鸽',520:'咕咕鸽',
521:'高傲雉鸡',522:'斑斑马',523:'雷电斑马',524:'石丸子',525:'地幔岩',526:'庞岩怪',527:'滚滚蝙蝠',528:'心蝙蝠',529:'螺钉地鼠',530:'龙头地鼠',531:'差不多娃娃',532:'搬运小匠',533:'铁骨土人',534:'修建老匠',535:'圆蝌蚪',536:'蓝蟾蜍',537:'蟾蜍王',538:'投摔鬼',539:'打击鬼',540:'虫宝包',
541:'宝包茧',542:'保姆虫',543:'百足蜈蚣',544:'车轮球',545:'蜈蚣王',546:'木棉球',547:'风妖精',548:'百合根娃娃',549:'裙儿小姐',550:'野蛮鲈鱼',551:'黑眼鳄',552:'混混鳄',553:'流氓鳄',554:'火红不倒翁',555:'达摩狒狒',556:'沙铃仙人掌',557:'石居蟹',558:'岩殿居蟹',559:'滑滑小子',560:'头巾混混',
561:'象征鸟',562:'哭哭面具',563:'迭失棺',564:'原盖海龟',565:'肋骨海龟',566:'始祖小鸟',567:'始祖大鸟',568:'破破袋',569:'灰尘山',570:'索罗亚',571:'索罗亚克',572:'泡沫栗鼠',573:'奇诺栗鼠',574:'哥德宝宝',575:'哥德小童',576:'哥德小姐',577:'单卵细胞球',578:'双卵细胞球',579:'人造细胞卵',580:'鸭宝宝',
581:'舞天鹅',582:'迷你冰',583:'多多冰',584:'双倍多多冰',585:'四季鹿',586:'萌芽鹿',587:'电飞鼠',588:'盖盖虫',589:'骑士蜗牛',590:'哎呀球菇',591:'败露球菇',592:'轻飘飘',593:'胖嘟嘟',594:'保姆曼波',595:'电电虫',596:'电蜘蛛',597:'种子铁球',598:'坚果哑铃',599:'齿轮儿',600:'齿轮组',
601:'齿轮怪',602:'麻麻小鱼',603:'麻麻鳗',604:'麻麻鳗鱼王',605:'小灰怪',606:'大宇怪',607:'烛光灵',608:'灯火幽灵',609:'水晶灯火灵',610:'牙牙',611:'斧牙龙',612:'双斧战龙',613:'喷嚏熊',614:'冻原熊',615:'几何雪花',616:'小嘴蜗',617:'敏捷虫',618:'泥巴鱼',619:'功夫鼬',620:'师父鼬',
621:'赤面龙',622:'泥偶小人',623:'泥偶巨人',624:'驹刀小兵',625:'劈斩司令',626:'爆炸头水牛',627:'毛头小鹰',628:'勇士雄鹰',629:'秃鹰丫头',630:'秃鹰娜',631:'熔蚁兽',632:'铁蚁',633:'单首龙',634:'双首暴龙',635:'三首恶龙',636:'燃烧虫',637:'火神蛾',638:'勾帕路翁',639:'代拉基翁',640:'毕力吉翁',
641:'龙卷云',642:'雷电云',643:'莱希拉姆',644:'捷克罗姆',645:'土地云',646:'酋雷姆',647:'凯路迪欧',648:'美洛耶塔',649:'盖诺赛克特',650:'哈力栗',651:'胖胖哈力',652:'布里卡隆',653:'火狐狸',654:'长尾火狐',655:'妖火红狐',656:'呱呱泡蛙',657:'呱头蛙',658:'甲贺忍蛙',659:'掘掘兔',660:'掘地兔',
661:'小箭雀',662:'火箭雀',663:'烈箭鹰',664:'粉蝶虫',665:'粉蝶蛹',666:'彩粉蝶',667:'小狮狮',668:'火炎狮',669:'花蓓蓓',670:'花叶蒂',671:'花洁夫人',672:'坐骑小羊',673:'坐骑山羊',674:'顽皮熊猫',675:'霸道熊猫',676:'多丽米亚',677:'妙喵',678:'超能妙喵',679:'独剑鞘',680:'双剑鞘',
681:'坚盾剑怪',682:'粉香香',683:'芳香精',684:'绵绵泡芙',685:'胖甜妮',686:'好啦鱿',687:'乌贼王',688:'龟脚脚',689:'龟足巨铠',690:'垃垃藻',691:'毒藻龙',692:'铁臂枪虾',693:'钢炮臂虾',694:'伞电蜥',695:'光电伞蜥',696:'宝宝暴龙',697:'怪颚龙',698:'冰雪龙',699:'冰雪巨龙',700:'仙子伊布',
701:'摔角鹰人',702:'咚咚鼠',703:'小碎钻',704:'黏黏宝',705:'黏美儿',706:'黏美龙',707:'钥圈儿',708:'小木灵',709:'朽木妖',710:'南瓜精',711:'南瓜怪人',712:'冰宝',713:'冰岩怪',714:'嗡蝠',715:'音波龙',716:'哲尔尼亚斯',717:'伊裴尔塔尔',718:'基格尔德',719:'蒂安希',720:'胡帕',
721:'波尔凯尼恩',722:'木木枭',723:'投羽枭',724:'狙射树枭',725:'火斑喵',726:'炎热喵',727:'炽焰咆哮虎',728:'球球海狮',729:'花漾海狮',730:'西狮海壬',731:'小笃儿',732:'喇叭啄鸟',733:'铳嘴大鸟',734:'猫鼬少',735:'猫鼬探长',736:'强颚鸡母虫',737:'虫电宝',738:'锹农炮虫',739:'好胜蟹',740:'好胜毛蟹',
741:'花舞鸟',742:'萌虻',743:'蝶结萌虻',744:'岩狗狗',745:'鬃岩狼人',746:'弱丁鱼',747:'好坏星',748:'超坏星',749:'泥驴仔',750:'重泥挽马',751:'滴蛛',752:'滴蛛霸',753:'伪螳草',754:'兰螳花',755:'睡睡菇',756:'灯罩夜菇',757:'夜盗火蜥',758:'焰后蜥',759:'童偶熊',760:'穿着熊',
761:'甜竹竹',762:'甜舞妮',763:'甜冷美后',764:'花疗环环',765:'智挥猩',766:'投掷猴',767:'胆小虫',768:'具甲武者',769:'沙丘娃',770:'噬沙堡爷',771:'拳海参',772:'属性：空',773:'银伴战兽',774:'小陨星',775:'树枕尾熊',776:'爆焰龟兽',777:'托戈德玛尔',778:'谜拟丘',779:'磨牙彩皮鱼',780:'老翁龙',
781:'破破舵轮',782:'心鳞宝',783:'鳞甲龙',784:'杖尾鳞甲龙',785:'卡璞・鸣鸣',786:'卡璞・蝶蝶',787:'卡璞・哞哞',788:'卡璞・鳍鳍',789:'科斯莫古',790:'科斯莫姆',791:'索尔迦雷欧',792:'露奈雅拉',793:'虚吾伊德',794:'爆肌蚊',795:'费洛美螂',796:'电束木',797:'铁火辉夜',798:'纸御剑',799:'恶食大王',800:'奈克洛兹玛',
801:'玛机雅娜',802:'玛夏多',803:'毒贝比',804:'四颚针龙',805:'垒磊石',806:'砰头小丑',807:'捷拉奥拉',808:'美录坦',809:'美录梅塔',810:'敲音猴',811:'啪咚猴',812:'轰擂金刚猩',813:'炎兔儿',814:'腾蹴小将',815:'闪焰王牌',816:'泪眼蜥',817:'变涩蜥',818:'千面避役',819:'贪心栗鼠',820:'藏饱栗鼠',
821:'稚山雀',822:'蓝鸦',823:'钢铠鸦',824:'索侦虫',825:'天罩虫',826:'以欧路普',827:'狡小狐',828:'猾大狐',829:'幼棉棉',830:'白蓬蓬',831:'毛辫羊',832:'毛毛角羊',833:'咬咬龟',834:'暴噬龟',835:'来电汪',836:'逐电犬',837:'小炭仔',838:'大炭车',839:'巨炭山',840:'啃果虫',
841:'苹裹龙',842:'丰蜜龙',843:'沙包蛇',844:'沙螺蟒',845:'古月鸟',846:'刺梭鱼',847:'戽斗尖梭',848:'电音婴',849:'颤弦蝾螈',850:'烧火蚣',851:'焚焰蚣',852:'拳拳蛸',853:'八爪武师',854:'来悲茶',855:'怖思壶',856:'迷布莉姆',857:'提布莉姆',858:'布莉姆温',859:'捣蛋小妖',860:'诈唬魔',
861:'长毛巨魔',862:'堵拦熊',863:'喵头目',864:'魔灵珊瑚',865:'葱游兵',866:'踏冰人偶',867:'迭失板',868:'小仙奶',869:'霜奶仙',870:'列阵兵',871:'啪嚓海胆',872:'雪吞虫',873:'雪绒蛾',874:'巨石丁',875:'冰砌鹅',876:'爱管侍',877:'莫鲁贝可',878:'铜象',879:'大王铜象',880:'雷鸟龙',
881:'雷鸟海兽',882:'鳃鱼龙',883:'鳃鱼海兽',884:'铝钢龙',885:'多龙梅西亚',886:'多龙奇',887:'多龙巴鲁托',888:'苍响',889:'藏玛然特',890:'无极汰那',891:'熊徒弟',892:'武道熊师',893:'萨戮德',894:'雷吉艾勒奇',895:'雷吉铎拉戈',896:'雪暴马',897:'灵幽马',898:'蕾冠王',899:'诡角鹿',900:'劈斧螳螂',
901:'月月熊',902:'幽尾玄鱼',903:'大狃拉',904:'万针鱼',905:'眷恋云',906:'新叶喵',907:'蒂蕾喵',908:'魔幻假面喵',909:'呆火鳄',910:'炙烫鳄',911:'骨纹巨声鳄',912:'润水鸭',913:'涌跃鸭',914:'狂欢浪舞鸭',915:'爱吃豚',916:'飘香豚',917:'团珠蛛',918:'操陷蛛',919:'豆蟋蟀',920:'烈腿蝗',
921:'布拨',922:'布土拨',923:'巴布土拨',924:'一对鼠',925:'一家鼠',926:'狗仔包',927:'麻花犬',928:'迷你芙',929:'奥利纽',930:'奥利瓦',931:'怒鹦哥',932:'盐石宝',933:'盐石垒',934:'盐石巨灵',935:'炭小侍',936:'红莲铠骑',937:'苍炎刃鬼',938:'光蚪仔',939:'电肚蛙',940:'电海燕',
941:'大电海燕',942:'偶叫獒',943:'獒教父',944:'滋汁鼹',945:'涂标客',946:'纳噬草',947:'怖纳噬草',948:'原野水母',949:'陆地水母',950:'毛崖蟹',951:'热辣娃',952:'狠辣椒',953:'虫滚泥',954:'虫甲圣',955:'飘飘雏',956:'超能艳鸵',957:'小锻匠',958:'巧锻匠',959:'巨锻匠',960:'海地鼠',
961:'三海地鼠',962:'下石鸟',963:'波普海豚',964:'海豚侠',965:'噗隆隆',966:'普隆隆姆',967:'摩托蜥',968:'拖拖蚓',969:'晶光芽',970:'晶光花',971:'墓仔狗',972:'墓扬犬',973:'纠红鹤',974:'走鲸',975:'浩大鲸',976:'轻身鳕',977:'吃吼霸',978:'米立龙',979:'弃世猴',980:'土王',
981:'奇麒麟',982:'土龙节节',983:'仆刀将军',984:'雄伟牙',985:'吼叫尾',986:'猛恶菇',987:'振翼发',988:'爬地翅',989:'沙铁皮',990:'铁辙迹',991:'铁包袱',992:'铁臂膀',993:'铁脖颈',994:'铁毒蛾',995:'铁荆棘',996:'凉脊龙',997:'冻脊龙',998:'戟脊龙',999:'索财灵',1000:'赛富豪',
1001:'古简蜗',1002:'古剑豹',1003:'古鼎鹿',1004:'古玉鱼',1005:'轰鸣月',1006:'铁武者',1007:'故勒顿',1008:'密勒顿',1009:'波荡水',1010:'铁斑叶',1011:'裹蜜虫',1012:'斯魔茶',1013:'来悲粗茶',1014:'够赞狗',1015:'愿增猿',1016:'吉雉鸡',1017:'厄诡椪',1018:'铝钢桥龙',1019:'蜜集大蛇',1020:'破空焰',
1021:'猛雷鼓',1022:'铁磐岩',1023:'铁头壳',1024:'太乐巴戈斯',1025:'桃歹郎'};


// ── 52poke 中文图鉴抓取（简体中文）──
async function fetch52PokeDesc(cnName,pkmId){
  if(!cnName)return null;
  try{
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),6000);
    const base='https://wiki.52poke.com/api.php';
    // Step 1: 获取章节列表，找到图鉴描述章节编号（variant=zh-hans 转为简体）
    const sectUrl=`${base}?action=parse&page=${encodeURIComponent(cnName)}&prop=sections&format=json&origin=*&variant=zh-hans`;
    const sr=await fetch(sectUrl,{signal:ctrl.signal});
    if(!sr.ok){clearTimeout(timer);return null;}
    const sd=await sr.json();clearTimeout(timer);
    const sections=sd?.parse?.sections||[];
    const descSect=sections.find(s=>/图鉴/.test(s.line||''));
    if(!descSect)return null;
    // Step 2: 获取该章节的渲染 HTML（variant=zh-hans 强制简体输出）
    const ctrl2=new AbortController();const timer2=setTimeout(()=>ctrl2.abort(),6000);
    const htUrl=`${base}?action=parse&page=${encodeURIComponent(cnName)}&prop=text&section=${descSect.index}&format=json&origin=*&variant=zh-hans`;
    const wr=await fetch(htUrl,{signal:ctrl2.signal});
    if(!wr.ok){clearTimeout(timer2);return null;}
    const wd=await wr.json();clearTimeout(timer2);
    const html=wd?.parse?.text?.['*']||'';
    if(!html)return null;
    // Step 3: 用 DOMParser 解析 HTML，提取有效中文描述
    // 图鉴描述在 52poke 里是表格 <td> 格式，不能移除 table
    const doc=new DOMParser().parseFromString(html,'text/html');
    doc.querySelectorAll('.mw-editsection,sup,.reference,.sortkey').forEach(el=>el.remove());
    // 同时查 td（图鉴表格）和 p/li/dd（段落文字）
    const candidates=[...doc.querySelectorAll('td,p,li,dd')]
      .map(el=>el.textContent.replace(/\s+/g,' ').trim())
      .filter(t=>{
        if(t.length<15||t.length>500)return false;
        if(!/[\u4e00-\u9fa5]{10,}/.test(t))return false;  // 至少10个连续汉字
        // 排除版本名、纯标题等极短/无意义条目
        if(/^(红|蓝|黄|金|银|晶|火红|叶绿|红宝石|蓝宝石|翡翠|钻石|珍珠|白金|心金|魂银|黑|白|X|Y|太阳|月亮|剑|盾|朱|紫|图鉴号|分类|身高|体重|特性|捕获率|性别比例|蛋组|精灵图鉴)$/.test(t))return false;
        return true;
      });
    if(!candidates.length)return null;
    // 取最长的描述（通常最完整）
    return candidates.sort((a,b)=>b.length-a.length)[0];
  }catch(e){return null;}
}

// ── 52poke 精灵信息抓取（特性 + 努力值）──
async function fetch52PokePkmInfo(cnName){
  if(!cnName)return null;
  if(_52pokeInfoCache[cnName])return _52pokeInfoCache[cnName];
  try{
    const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),8000);
    const url=`https://wiki.52poke.com/api.php?action=parse&page=${encodeURIComponent(cnName)}&prop=text&format=json&origin=*&variant=zh-hans`;
    const r=await fetch(url,{signal:ctrl.signal});clearTimeout(t);
    if(!r.ok)return null;
    const d=await r.json();
    if(d?.error||!d?.parse)return null;
    const html=d?.parse?.text?.['*'];if(!html)return null;
    const doc=new DOMParser().parseFromString(html,'text/html');
    const result={abilities:[],hiddenAbility:'',evYields:{}};
    doc.querySelectorAll('th').forEach(th=>{
      const label=th.textContent.trim();
      const row=th.closest('tr');if(!row)return;
      const td=row.querySelector('td');if(!td)return;
      if(label==='特性'){
        const links=[...td.querySelectorAll('a')].map(a=>a.textContent.trim()).filter(Boolean);
        if(links.length){result.abilities=links;}
        else{result.abilities=td.textContent.trim().split(/[\/\n]/).map(s=>s.replace(/（.*?）/g,'').trim()).filter(Boolean);}
        // 标记隐藏特性（梦境特性/隐藏特性通常是最后一个）
        const innerHtml=td.innerHTML;
        if(/梦境特性|隐藏特性/.test(innerHtml)&&result.abilities.length>0){
          result.hiddenAbility=result.abilities[result.abilities.length-1];
          result.abilities=result.abilities.slice(0,-1);
        }
      }
      if(label==='努力值'){
        const text=td.textContent.trim();
        const statMap={'HP':'hp','攻击':'attack','防御':'defense','特攻':'special-attack','特防':'special-defense','速度':'speed'};
        for(const[zh,key] of Object.entries(statMap)){
          const m=text.match(new RegExp(zh+'\\s*[+＋](\\d+)'));
          if(m)result.evYields[key]=parseInt(m[1]);
        }
      }
    });
    if(result.abilities.length||Object.keys(result.evYields).length){
      _52pokeInfoCache[cnName]=result;return result;
    }
    return null;
  }catch(e){return null;}
}

// ── 渲染特性标签 ──
function renderPkmAbilities(info,elId){
  const el=document.getElementById(elId);if(!el)return;
  if(!info?.abilities?.length){el.innerHTML='';return;}
  const tags=info.abilities.map(a=>`<span class="pkm-ability-tag">${esc(a)}</span>`).join('');
  const hidden=info.hiddenAbility?`<span class="pkm-ability-tag pkm-ability-hidden">${esc(info.hiddenAbility)}<span class="pkm-ability-hidden-mark">隐</span></span>`:'';
  el.innerHTML=`<div class="pkm-abilities-row"><span class="pkm-ability-lbl">特性</span>${tags}${hidden}</div>`;
}

// ── 52poke 地点精灵分布抓取 ──
async function fetch52PokeLocDistribution(locName){
  try{
    const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),10000);
    const url=`https://wiki.52poke.com/api.php?action=parse&page=${encodeURIComponent(locName)}&prop=text&format=json&origin=*&variant=zh-hans`;
    const r=await fetch(url,{signal:ctrl.signal});clearTimeout(t);
    if(!r.ok)return null;
    const d=await r.json();
    if(d?.error||!d?.parse)return null;
    const html=d?.parse?.text?.['*'];if(!html)return null;
    const doc=new DOMParser().parseFromString(html,'text/html');
    const rev=getPkmCnRev();
    const found=new Map();
    // 从 wiki 链接中提取精灵名
    doc.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      const name=a.textContent.trim();
      if(href.includes('/wiki/')&&rev[name]&&!found.has(name))found.set(name,rev[name]);
    });
    // 补充：表格单元格纯文本
    if(found.size<3){
      doc.querySelectorAll('td').forEach(td=>{
        const text=td.textContent.trim();
        if(rev[text]&&!found.has(text))found.set(text,rev[text]);
      });
    }
    if(!found.size)return null;
    const items=[];
    for(const[name,id] of [...found].slice(0,15)){
      try{
        const p=await fetchPkm(id);
        const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
        const evYields={};
        for(const st of(p.stats||[])){if(st.effort>0)evYields[st.stat.name]=st.effort;}
        if(!Object.keys(evYields).length)evYields['hp']=1;
        items.push({id,name,img,evYields,official:true,rate:'中'});
      }catch(e){}
    }
    return items.length?items:null;
  }catch(e){return null;}
}

// ── 图鉴描述降级渲染：52poke → AI翻译 ──
// enTextId/btnId 用于区分首页卡片和详情弹窗
async function renderDescFallback(descEl,engText,pkmId,cnName,enTextId,btnId){
  if(pkmDescTransCache[pkmId]){descEl.innerHTML=pkmDescTransCache[pkmId];return;}
  // 尝试 52poke
  descEl.innerHTML='<span class="desc-seeking">从 52poke 获取中文图鉴…</span>';
  const wiki=await fetch52PokeDesc(cnName,pkmId);
  if(wiki){
    const html=`<span>${esc(wiki)}</span><span class="desc-src-tag">52poke 官方中文</span>`;
    pkmDescTransCache[pkmId]=html;
    descEl.innerHTML=html;
    return;
  }
  // 52poke 无结果 → 显示英文 + AI翻译按钮
  descEl.innerHTML=`<span style="color:var(--t3);font-size:.7rem;font-style:normal;margin-bottom:3px;display:block">📖 暂无中文图鉴</span><span id="${enTextId}">${esc(engText)}</span><div><button class="pkm-translate-btn" id="${btnId}" onclick="translatePkmDesc(${pkmId},document.getElementById('${enTextId}').textContent,this,document.getElementById('${enTextId}'))">🌐 AI翻译</button></div>`;
  if(pkmDescTransCache[pkmId]){const t=document.getElementById(enTextId);if(t)t.innerHTML=pkmDescTransCache[pkmId];const b=document.getElementById(btnId);if(b)b.style.display='none';}
}

// 图鉴文字 AI 翻译（带缓存）
async function translatePkmDesc(pkmId,engText,btnEl,targetEl){
  if(pkmDescTransCache[pkmId]){targetEl.innerHTML=pkmDescTransCache[pkmId];btnEl.style.display='none';return;}
  btnEl.classList.add('loading');btnEl.textContent='翻译中…';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:'请将以下宝可梦图鉴文字翻译成简体中文，只输出翻译结果，不要加任何解释或符号：\n'+engText}]}],generationConfig:{maxOutputTokens:200,temperature:0.3}})
    });
    const d=await res.json();
    const translated=(d.candidates?.[0]?.content?.parts?.[0]?.text||'').trim();
    if(translated){
      const html='<span class="pkm-translated-text">'+translated+'</span><span class="desc-src-tag desc-src-ai">AI翻译</span>';
      pkmDescTransCache[pkmId]=html;
      targetEl.innerHTML=html;
      btnEl.style.display='none';
    }else{throw new Error('空响应');}
  }catch(e){
    btnEl.classList.remove('loading');
    btnEl.textContent='🌐 AI翻译';
    btnEl.title='翻译失败，点击重试';
  }
}
async function getPkmCNName(id,engName){
  // 优先查运行时缓存
  if(pkmCNCache[id])return pkmCNCache[id];
  // 请求 PokéAPI 获取官方中文名（zh-Hans 简体 > zh-Hant 繁体）
  try{
    const r=await fetch(`${POKEAPI}/pokemon-species/${id}`);
    if(!r.ok)return pkmCNCache[id]=getCachedOfficialDexName(id)||PKM_CN_TABLE[id]||engName||'';
    const d=await r.json();
    const zhHans=d.names?.find(x=>x.language.name==='zh-Hans');
    const zhHant=d.names?.find(x=>x.language.name==='zh-Hant');
    // API 官方中文名优先，找不到才降级到本地官方图鉴，再用内置对照表兜底
    const cn=zhHans?.name||zhHant?.name||getCachedOfficialDexName(id)||PKM_CN_TABLE[id]||engName||'';
    return pkmCNCache[id]=cn;
  }catch{return pkmCNCache[id]=getCachedOfficialDexName(id)||PKM_CN_TABLE[id]||engName||'';}
}
function getCNName(species,engName){if(species){const n=species.names?.find(x=>x.language.name==='zh-Hans'||x.language.name==='zh-Hant');if(n?.name){if(species.id)pkmCNCache[species.id]=n.name;return n.name;}}return null;}
function getCNFlavorText(species){
  if(!species)return null;
  const entries=species.flavor_text_entries||[];
  // 优先简体中文，其次繁体中文，最后英文兜底（部分新世代只有英文图鉴）
  const zh=entries.find(x=>x.language.name==='zh-Hans')
          ||entries.find(x=>x.language.name==='zh-Hant');
  if(zh)return zh.flavor_text.replace(/\f|\n/g,' ').trim();
  const en=entries.find(x=>x.language.name==='en');
  return en?en.flavor_text.replace(/\f|\n/g,' ').trim():null;
}
async function getPreferredDexDesc(p,species){
  const dexId=getSpeciesDexId(p,species);
  const formSlug=getFormSlug(p,species);
  if(formSlug){
    const formDesc=await getOfficialFormDexDesc(p,species).catch(()=>null);
    if(formDesc?.text)return{kind:'zh',text:formDesc.text,source:'official-form',variant:formDesc.variant,texts:formDesc.texts};
  }
  const localDesc=await getOfficialDexDesc(dexId).catch(()=>null);
  if(localDesc)return{kind:'zh',text:localDesc,source:'official-local'};
  const apiDesc=getCNFlavorText(species);
  if(apiDesc&&species?.flavor_text_entries?.some(x=>x.language.name==='zh-Hans'||x.language.name==='zh-Hant')){
    return{kind:'zh',text:apiDesc,source:'pokeapi-zh'};
  }
  const en=species?.flavor_text_entries?.find(x=>x.language.name==='en');
  const enText=en?en.flavor_text.replace(/\f|\n/g,' ').trim():null;
  return enText?{kind:'en',text:enText,source:'pokeapi-en'}:null;
}

async function loadTodayPkm(random=false){
  let seed=Math.floor(Math.random()*1010)+1;
  try{
    document.getElementById('pkm-today-name').textContent='加载中…';
    document.getElementById('pkm-today-desc').textContent='';
    document.getElementById('pkm-today-locations').innerHTML='';
    const p=await fetchPkm(seed);
    const speciesName=p.species?.name||p.name.replace(/-(standard|galar|alola|hisui|paldea|incarnate|aria|baile|midday|solo|red-striped|blue-striped|natural|male|female|plant|sandy|trash|heat|wash|frost|fan|mow|normal|attack|defense|speed|ordinary|overcast|sunshine|land|sky|zen|original|therian|black|white|resolute|ordinary|pirouette|active|shield|blade|confined|unbound|50|complete|10|dusk|dawn|ultra|original|crowned|ice|shadow|hangry|full-belly|gorging|family-of-four|four|nasal|droopy|stretchy|curly|small|large|super|eternal|average|small|large|super|red|orange|yellow|green|blue|indigo|violet|heart|star|diamond|deprived|well-fed|belly-full|hangry|phony|antique|disguised|busted|meteor|core|school|disguised|midday|midnight|dusk|dawn|ultra)$/,'').replace(/-[a-z]+$/,'');
    const sp=await fetchPkmSpecies(speciesName).catch(()=>null)||await fetchPkmSpecies(p.id).catch(()=>null);
    todayPkm={...p,species:sp};
    // 先拿中文名再渲染，保证不显示英文
    let cnName=getCNName(sp,speciesName);
    if(!cnName)cnName=await getPkmCNName(p.id,speciesName);
    await renderTodayPkm(p,sp,cnName);
    await loadPkmCollection();
    updateTodayBtns();
    loadPkmEncounters(p.id,p.name);
  }catch(e){console.error('宝可梦加载失败',e);}
}

// 各世代游戏名称映射（英文->中文）
const GAME_NAME_ZH={
  'red':'红','blue':'蓝','yellow':'黄','gold':'金','silver':'银','crystal':'水晶',
  'ruby':'红宝石','sapphire':'蓝宝石','emerald':'绿宝石','firered':'火红','leafgreen':'叶绿',
  'diamond':'钻石','pearl':'珍珠','platinum':'白金','heartgold':'心金','soulsilver':'魂银',
  'black':'黑','white':'白','black-2':'黑2','white-2':'白2',
  'x':'X','y':'Y','omega-ruby':'始源红宝石','alpha-sapphire':'始源蓝宝石',
  'sun':'太阳','moon':'月亮','ultra-sun':'究极之日','ultra-moon':'究极之月',
  'sword':'剑','shield':'盾','brilliant-diamond':'晶灿钻石','shining-pearl':'明亮珍珠',
  'legends-arceus':'传说:阿尔宙斯','scarlet':'朱','violet':'紫'
};

// 常见地名翻译（英文路由名 -> 中文）
const LOC_ZH={
  'route':'道路','road':'小路','cave':'山洞','forest':'森林','tower':'塔',
  'island':'岛','lake':'湖','mountain':'山','city':'市','town':'镇',
  'village':'村','ruins':'遗迹','path':'小道','sea':'海','river':'河',
  'area':'地区','safari':'狩猎区','ranch':'牧场','desert':'沙漠',
  'valley':'山谷','volcano':'火山','shrine':'神殿','temple':'圣所',
  'mansion':'大厦','gym':'道馆','gate':'门','bridge':'桥','meadow':'草地',
  'garden':'庭园','power':'发电站','plant':'发电站','museum':'博物馆',
  'airport':'机场','port':'港口','harbor':'港口','cliff':'悬崖',
  'beach':'海滩','coast':'海岸','woods':'树林','park':'公园','hill':'丘陵',
  'plateau':'高原','tower':'塔楼','lab':'研究所','outpost':'前哨',
  'wilds':'荒野','fields':'田野','heights':'高地','badlands':'荒地',
  'mirage':'幻影','pal':'宝可梦牧场','safari':'狩猎区',
  // 具体地名
  'pallet':'真新镇','viridian':'常磐市','pewter':'グレー市','cerulean':'ハナダ市',
  'vermilion':'クチバ市','lavender':'シオン','celadon':'タマムシ','fuchsia':'セキチク',
  'saffron':'ヤマブキ','cinnabar':'グレン','victory':'勝利','indigo':'インディゴ',
  'littleroot':'コトキ','oldale':'カイナ','petalburg':'トウカ','rustboro':'カナズミ',
  'dewford':'ムロ','slateport':'カイナ','mauville':'キンセツ','verdanturf':'シダケ',
  'fallarbor':'ハジツゲ','lavaridge':'フエンタウン','fortree':'ヒワマキ',
  'lilycove':'ミナモ','mossdeep':'トクサネ','sootopolis':'ルネ','ever':'エバーグランデ',
  'twinleaf':'フタバ','sandgem':'マサゴ','jubilife':'コトブキ','oreburgh':'クロガネ',
  'floaroma':'ソノオ','eterna':'ハクタイ','hearthome':'ヨスガ','solaceon':'ズイ',
  'veilstone':'トバリ','pastoria':'ノモセ','celestic':'ミオ','canalave':'ミオ',
  'snowpoint':'キッサキ','sunyshore':'ナギサ','lake-verity':'真実の湖','lake-valor':'知識の湖',
  'spear-pillar':'やりのはしら','mt-coronet':'テンガン山',
  // 神奥地名
  'nuvema':'カノコ','accumula':'カラクサ','striaton':'サンヨウ','nacrene':'シッポウ',
  'castelia':'ヒウン','nimbasa':'ライモン','driftveil':'ホドモエ','mistralton':'フキヨセ',
  'lentimas':'リュウラセン','undella':'サザナミ','lacunosa':'ラクツ','opelucid':'ソウリュウ',
  'pokemon-league':'ポケモンリーグ','victory-road':'チャンピオンロード',
};

function translateLocation(engName){
  if(!engName)return engName;
  // 先整体匹配
  const lower=engName.toLowerCase().replace(/-/g,' ');
  // 尝试分词翻译
  let result=lower;
  // 处理 route N 格式
  const routeMatch=lower.match(/route\s*(\d+)/);
  if(routeMatch)return`${routeMatch[1]}号道路`;
  // 处理 mt. / mount 格式
  if(lower.includes('mt') || lower.includes('mount'))result=result.replace(/mt\.?|mount/,'').trim()+'山';
  // 逐词替换
  Object.entries(LOC_ZH).forEach(([en,zh])=>{result=result.replace(new RegExp(`\\b${en}\\b`,'gi'),zh);});
  // 去掉多余空格，首字母大写
  return result.replace(/\s+/g,' ').trim()||engName;
}

async function loadPkmEncounters(pkmId,engName){
  const locEl=document.getElementById('pkm-today-locations');
  if(!locEl)return;
  locEl.innerHTML=`<div style="font-size:.7rem;color:var(--t3);margin-bottom:4px;font-family:'DM Mono',monospace">🗺 各世代获取方式</div><div style="font-size:.72rem;color:var(--t3)">查询中…</div>`;
  try{
    const r=await fetch(`${POKEAPI}/pokemon/${pkmId}/encounters`);
    if(!r.ok){locEl.innerHTML='';return;}
    const data=await r.json();
    if(!data||!data.length){
      locEl.innerHTML=`<div style="font-size:.7rem;color:var(--t3);margin-bottom:4px;font-family:'DM Mono',monospace">🗺 获取方式</div><div style="font-size:.75rem;color:var(--t3)">通过进化、交换或特殊事件获得</div>`;
      return;
    }
    // 按游戏分组，合并地点
    const byGame={};
    data.forEach(loc=>{
      const rawLoc=loc.location_area.name.replace(/-area$/,'').replace(/-/g,' ');
      loc.version_details.forEach(vd=>{
        const g=vd.version.name;
        if(!byGame[g])byGame[g]=new Set();
        byGame[g].add(rawLoc);
      });
    });
    // 按游戏版本排序（优先显示新世代）
    const gameOrder=['scarlet','violet','legends-arceus','brilliant-diamond','shining-pearl','sword','shield','ultra-sun','ultra-moon','sun','moon','omega-ruby','alpha-sapphire','x','y','black-2','white-2','black','white','heartgold','soulsilver','platinum','diamond','pearl','firered','leafgreen','emerald','ruby','sapphire','crystal','gold','silver','yellow','red','blue'];
    const sortedGames=Object.keys(byGame).sort((a,b)=>{const ia=gameOrder.indexOf(a);const ib=gameOrder.indexOf(b);return(ia<0?99:ia)-(ib<0?99:ib);});
    const html=sortedGames.map(g=>{
      const zhName=GAME_NAME_ZH[g]||g;
      const locs=[...byGame[g]].slice(0,3).map(l=>translateLocation(l)).join('、');
      return`<div style="display:flex;gap:6px;align-items:flex-start;margin-bottom:4px">
        <span style="font-size:.62rem;padding:1px 6px;border-radius:3px;background:rgba(96,165,250,.15);color:var(--acc);white-space:nowrap;flex-shrink:0;font-family:'DM Mono',monospace">${zhName}</span>
        <span style="font-size:.7rem;color:var(--t2);line-height:1.45">${locs}</span>
      </div>`;
    }).join('');
    locEl.innerHTML=`<div style="font-size:.7rem;color:var(--t3);margin-bottom:6px;font-family:'DM Mono',monospace;letter-spacing:.04em">🗺 各世代获取地点（${sortedGames.length}个版本）</div>${html}`;  }catch(e){if(locEl)locEl.innerHTML='';}
}

async function renderTodayPkm(p,sp,cnName){
  const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
  const img2=p.sprites?.front_default||img;
  document.getElementById('pkm-today-img').src=img2;
  document.getElementById('pkm-today-bg').style.backgroundImage=img?`url(${img})`:'none';
  const baseDexId=getSpeciesDexId(p,sp)||Number(p.id);
  const baseName=await getPreferredBaseName(p,sp,cnName);
  const officialVariant=await resolveOfficialDexVariant(p,sp).catch(()=>null);
  const name=getDisplayNameWithVariant(baseName,officialVariant);
  document.getElementById('pkm-today-num').textContent=`#${String(baseDexId||p.id).padStart(3,'0')}`;
  document.getElementById('pkm-today-name').textContent=name;
  document.getElementById('pkm-today-types').innerHTML=p.types.map(t=>typeTag(t.type.name)).join('');
  document.getElementById('pkm-today-stats').innerHTML=p.stats.map(s=>statBar(s.stat.name,s.base_stat)).join('');
  // 特性（52poke 异步获取）
  const todayAbEl=document.getElementById('pkm-today-abilities');
  if(todayAbEl){
    todayAbEl.innerHTML='<span style="font-size:.62rem;color:var(--t3);font-family:\'DM Mono\',monospace">特性查询中…</span>';
    fetch52PokePkmInfo(name).then(info=>renderPkmAbilities(info,'pkm-today-abilities')).catch(()=>{if(todayAbEl)todayAbEl.innerHTML='';});
  }
  // 图鉴描述（中文优先，无中文则显示英文并标注）
  const descEl=document.getElementById('pkm-today-desc');
  if(descEl){
    const descInfo=await getPreferredDexDesc(p,sp);
    if(descInfo?.kind==='zh'){
      descEl.innerHTML=`<span>${esc(descInfo.text)}</span>`;
      descEl.style.display='block';
    }else if(descInfo?.kind==='en'&&sp){
      // 无中文图鉴：先查 52poke，再回退 AI
      const todayPkmId=baseDexId||p?.id||0;
      const todayCnName=baseName;
      descEl.style.display='block';
      renderDescFallback(descEl,descInfo.text,todayPkmId,todayCnName,'pkm-today-en-text','pkm-today-translate-btn');
    }else{descEl.textContent='';descEl.style.display='none';}
  }
  loadEvoChain(sp,'pkm-today-evo');
}
async function loadEvoChain(sp,containerId){
  if(!sp?.evolution_chain?.url)return;
  try{
    const r=await fetch(sp.evolution_chain.url);const ec=await r.json();
    const paths=[];
    const walk=(node,path=[])=>{
      if(!node?.species?.name)return;
      const next=[...path,node.species.name];
      if(!node.evolves_to?.length){paths.push(next);return;}
      node.evolves_to.forEach(child=>walk(child,next));
    };
    walk(ec.chain,[]);
    const uniqueNames=[...new Set(paths.flat())];
    if(uniqueNames.length<=1){document.getElementById(containerId).innerHTML='';return;}
    await loadOfficialPkmDex().catch(()=>null);
    const itemMap={};
    await Promise.all(uniqueNames.map(async n=>{
      const p=await fetchPkm(n);
      const s=await fetchPkmSpecies(p.species?.name||p.id).catch(()=>null);
      const cn=await getPreferredBaseName(p,s);
      itemMap[n]={name:n,cn,img:getPokemonSprite(p,'static'),id:p.id};
    }));
    const pathHtml=paths.map(path=>`<div class="pkm-evo-chain">${path.map((n,i)=>{
      const it=itemMap[n];if(!it)return'';
      return`${i>0?'<span class="pkm-evo-arrow">→</span>':''}<div class="pkm-evo-item" onclick="openPkmDetail(${it.id})"><img src="${it.img}" alt=""><div class="pkm-evo-name">${esc(it.cn)}</div></div>`;
    }).join('')}</div>`).join('');
    document.getElementById(containerId).innerHTML=`<div style="font-size:.68rem;color:var(--t3);margin-bottom:4px;font-family:'DM Mono',monospace">进化链</div>${pathHtml}`;
  }catch(e){}
}
async function loadPkmCollection(){
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  const{data}=await db.from('pkm_collection').select('*').eq('user_id',session.user.id);
  pkmCollection={};(data||[]).forEach(r=>{if(!pkmCollection[r.pkm_id])pkmCollection[r.pkm_id]={};pkmCollection[r.pkm_id][r.status]=r.id;});
}
function updateTodayBtns(){
  if(!todayPkm)return;const col=pkmCollection[todayPkm.id]||{};
  ['caught','liked','wanted'].forEach(s=>{const btn=document.getElementById(`pkm-btn-${s}`);if(btn){btn.className='pkm-btn'+(col[s]?` ${s}`:'');}});
}
async function togglePkmStatus(status){
  const{data:{session}}=await db.auth.getSession();if(!session?.user){alert('请先登录');return;}
  if(!todayPkm)return;await togglePkmStatusFor(todayPkm.id,todayPkm.name,status);updateTodayBtns();
  if(document.getElementById('ov-pkm').classList.contains('on'))updateDetailBtns(todayPkm.id);
}
async function togglePkmStatusModal(status){
  const{data:{session}}=await db.auth.getSession();if(!session?.user){alert('请先登录');return;}
  const id=currentDetailPkmId||parseInt(document.getElementById('pkm-detail-num').textContent.replace('#',''));
  const name=document.getElementById('pkm-detail-name').textContent;
  await togglePkmStatusFor(id,name,status);updateDetailBtns(id);
  if(todayPkm&&todayPkm.id===id)updateTodayBtns();
}
async function togglePkmStatusFor(pkmId,pkmName,status){
  const{data:{session}}=await db.auth.getSession();const user=session?.user;if(!user)return;
  const col=pkmCollection[pkmId]||{};
  if(col[status]){await db.from('pkm_collection').delete().eq('id',col[status]);delete col[status];}
  else{const{data}=await db.from('pkm_collection').insert({user_id:user.id,pkm_id:pkmId,pkm_name:pkmName,status}).select().single();if(data){if(!pkmCollection[pkmId])pkmCollection[pkmId]={};pkmCollection[pkmId][status]=data.id;}}
}
function updateDetailBtns(pkmId){
  const col=pkmCollection[pkmId]||{};
  ['caught','liked','wanted'].forEach(s=>{const btn=document.getElementById(`pkm-detail-${s}`);if(btn){btn.className='pkm-btn'+(col[s]?` ${s}`:'');}});
}
async function openPkmDetail(idOrName){
  if(window.partnerTrackEvent)window.partnerTrackEvent('pokedex_view');
  document.getElementById('ov-pkm').classList.add('on');
  document.getElementById('pkm-detail-name').textContent='加载中…';
  try{
    const p=await fetchPkm(idOrName);const sp=await fetchPkmSpecies(p.species.url.split('/').slice(-2)[0]);
    currentDetailPkmId=p.id;
    const dexId=getSpeciesDexId(p,sp)||Number(p.id);
    const baseCnName=await getPreferredBaseName(p,sp);
    const officialVariant=await resolveOfficialDexVariant(p,sp).catch(()=>null);
    const cnName=getDisplayNameWithVariant(baseCnName,officialVariant);
    // 图鉴文字：本地官方中文优先，其次 PokéAPI 中文，再回退 52poke / AI
    const descEl=document.getElementById('pkm-detail-desc');
    const descInfo=await getPreferredDexDesc(p,sp);
    if(descInfo?.kind==='zh'){
      descEl.innerHTML=`<span>${esc(descInfo.text)}</span>`;
    }else if(descInfo?.kind==='en'){
      const pkmId=dexId||p.id;
      // 先查 52poke，查不到再显示 AI翻译按钮
      renderDescFallback(descEl,descInfo.text,pkmId,baseCnName,'pkm-en-desc-text','pkm-translate-btn');
    }else{
      descEl.innerHTML=`<span style="color:var(--t3)">暂无图鉴信息</span>`;
    }
    const img=getPokemonSprite(p,'artwork');
    const img2=getPokemonSprite(p,'static');
    const imgAnimated=getPokemonSprite(p,'animated');
    const detailImg=document.getElementById('pkm-detail-img');
    detailImg.dataset.staticSrc=img2;
    detailImg.dataset.animatedSrc=imgAnimated;
    detailImg.dataset.mode='static';
    detailImg.onerror=()=>{detailImg.onerror=null;detailImg.src=img2||img;detailImg.dataset.mode='static';detailImg.dataset.animatedSrc='';updatePkmDetailSpriteToggle();};
    detailImg.src=img2;document.getElementById('pkm-detail-bg').style.backgroundImage=img?`url(${img})`:'none';
    updatePkmDetailSpriteToggle();
    document.getElementById('pkm-detail-num').textContent=`#${String(dexId||p.id).padStart(3,'0')}`;document.getElementById('pkm-detail-name').textContent=cnName;
    document.getElementById('pkm-detail-types').innerHTML=p.types.map(t=>typeTag(t.type.name)).join('');
    document.getElementById('pkm-detail-meta').textContent=`身高 ${p.height/10}m · 体重 ${p.weight/10}kg`;
    await renderDetailForms(p,sp,baseCnName);
    document.getElementById('pkm-detail-stats').innerHTML=p.stats.map(s=>statBar(s.stat.name,s.base_stat)).join('');
    // 特性（52poke 异步获取）
    const detailAbEl=document.getElementById('pkm-detail-abilities');
    if(detailAbEl){
      detailAbEl.innerHTML='<span style="font-size:.62rem;color:var(--t3);font-family:\'DM Mono\',monospace">特性查询中…</span>';
      fetch52PokePkmInfo(baseCnName).then(info=>renderPkmAbilities(info,'pkm-detail-abilities')).catch(()=>{if(detailAbEl)detailAbEl.innerHTML='';});
    }
    await loadEvoChain(sp,'pkm-detail-evo');await loadPkmCollection();updateDetailBtns(p.id);
    currentChatPkm={id:p.id,name:cnName,types:p.types.map(t=>t.type.name),species:sp};
    // 重置AI氛围图按钮和背景

  }catch(e){document.getElementById('pkm-detail-name').textContent='加载失败';}
}
function onPkmSearch(v){
  clearTimeout(pkmSearchT);const res=document.getElementById('pkm-search-results');
  if(!v.trim()){res.innerHTML='';return;}
  pkmSearchT=setTimeout(async()=>{
    res.innerHTML='<div style="color:var(--t3);font-size:.8rem;padding:8px">搜索中…</div>';
    try{
      const q=v.trim().toLowerCase();
      await loadOfficialPkmDex().catch(()=>null);
      await loadOfficialPkmVariants().catch(()=>null);
      const localMatches=buildSearchCandidates()
        .filter(item=>item.searchText.toLowerCase().includes(q))
        .slice(0,16);
      if(localMatches.length){
        const items=await Promise.all(localMatches.map(async item=>{
          const p=await fetchPkm(item.target);
          const img=p.sprites?.front_default||'';
          return`<div class="pkm-mini" onclick="openPkmDetail(${item.target})"><img src="${img}" alt=""><div class="pkm-mini-name">${esc(item.label)}</div></div>`;
        }));
        res.innerHTML=items.join('');
        return;
      }
      const r=await fetch(`${POKEAPI}/pokemon?limit=2000`);const d=await r.json();
      const matches=d.results.filter(x=>x.name.includes(q)||x.url.split('/').slice(-2)[0]===q).slice(0,16);
      if(!matches.length){res.innerHTML='<div style="color:var(--t3);font-size:.8rem;padding:8px">未找到</div>';return;}
      const items=await Promise.all(matches.map(async m=>{
        const p=await fetchPkm(m.name);
        const sp=await fetchPkmSpecies(p.species?.name||p.id).catch(()=>null);
        const baseName=await getPreferredBaseName(p,sp);
        const variant=await resolveOfficialDexVariant(p,sp).catch(()=>null);
        const cn=getDisplayNameWithVariant(baseName,variant);
        const img=p.sprites?.front_default||'';
        return`<div class="pkm-mini" onclick="openPkmDetail('${m.name}')"><img src="${img}" alt=""><div class="pkm-mini-name">${esc(cn)}</div></div>`;
      }));
      res.innerHTML=items.join('');
    }catch(e){res.innerHTML='<div style="color:var(--danger);font-size:.8rem;padding:8px">搜索失败</div>';}
  },500);
}
async function loadGen(gen,el){
  document.querySelectorAll('.pkm-gen-tab').forEach(t=>t.classList.remove('on'));el.classList.add('on');
  const grid=document.getElementById('pkm-gen-grid');grid.innerHTML='<div class="pkm-empty">加载中…</div>';
  if(genCache[gen]){grid.innerHTML=genCache[gen];return;}
  const[start,end]=GEN_RANGE[gen];const ids=Array.from({length:end-start+1},(_,i)=>start+i);
  grid.innerHTML='';const BATCH=10;let allHtml=''; // 减小批次，让中文名能及时拿到
  for(let b=0;b<ids.length;b+=BATCH){
    const batch=ids.slice(b,b+BATCH);
    const items=await Promise.all(batch.map(async id=>{
      try{
        const p=await fetchPkm(id);
        const speciesName=p.species?.name||p.name;
        // getPkmCNName 内部会查 species，直接用它
        const cn=await getPkmCNName(p.id,speciesName);
        const img=p.sprites?.front_default||'';
        const col=pkmCollection[p.id]||{};
        const mark=col.caught?'✓':col.liked?'♥':col.wanted?'★':'';
        return'<div class="pkm-mini" onclick="openPkmDetail('+p.id+')" style="position:relative">'
          +(mark?'<div style="position:absolute;top:3px;right:3px;font-size:.6rem;color:var(--acc2)">'+mark+'</div>':'')
          +'<img src="'+img+'" alt="" loading="lazy">'
          +'<div class="pkm-mini-name">'+cn+'</div></div>';
      }catch{return'';}
    }));
    allHtml+=items.join('');grid.innerHTML=allHtml;
  }
  genCache[gen]=allHtml;
}

let pkmSeriesLogs={};
async function loadSeriesData(){
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  const{data}=await db.from('pkm_series_log').select('*').eq('user_id',session.user.id);
  pkmSeriesLogs={};(data||[]).forEach(r=>pkmSeriesLogs[r.series_id]=r);renderSeries();renderActiveCatches();
}
function renderSeries(){
  const grid=document.getElementById('pkm-series-grid');
  grid.innerHTML=PKM_SERIES.map(s=>{const log=pkmSeriesLogs[s.id];const st=log?.status||'none';const cls=st==='cleared'?' cleared':st==='played'?' played':'';const stTxt=st==='cleared'?'✓ 已通关':st==='played'?'▶ 游玩中':'— 未游玩';const stColor=st==='cleared'?'var(--acc)':st==='played'?'var(--acc2)':'var(--t3)';const ace=log?.ace_pokemon?'🏆 '+log.ace_pokemon:'';return'<div class="pkm-series-card'+cls+'" onclick="openSeriesDetail(this)" data-sid="'+s.id+'"><div class="pkm-series-name">'+s.name+'</div><div class="pkm-series-year">'+s.year+'</div><div class="pkm-series-status" style="color:'+stColor+'">'+stTxt+'</div>'+(log?.play_hours?'<div style="font-size:.63rem;color:var(--t3);margin-top:2px">'+log.play_hours+'h</div>':'')+(ace?'<div style="font-size:.63rem;color:var(--warn);margin-top:2px">'+ace+'</div>':'')+'</div>';}).join('');
}
function openSeriesDetail(el){
  const seriesId=el.dataset.sid;const s=PKM_SERIES.find(x=>x.id===seriesId);if(!s)return;
  _curSid=seriesId;
  // 仅概览模式，无需重置 Tab
  const log=pkmSeriesLogs[seriesId]||{};
  document.getElementById('series-modal-title').textContent=s.name;document.getElementById('series-modal-year').textContent=s.year+' 年发行';
  document.getElementById('series-start-inp').value=log.start_date||'';document.getElementById('series-end-inp').value=log.end_date||'';
  document.getElementById('series-hours-inp').value=log.play_hours||'';document.getElementById('series-ace-inp').value=log.ace_pokemon||'';
  document.getElementById('series-save-btn').dataset.sid=seriesId;
  seriesChatHistory=[];seriesChatOpen=false;
  const sw=document.getElementById('series-chat-wrap');if(sw)sw.style.display='none';
  const sab=document.getElementById('series-ai-btn');if(sab)sab.textContent='⬡ 和 AI 聊聊这部作品';
  const scm=document.getElementById('series-chat-msgs');if(scm)scm.innerHTML='';
  const qinp=document.getElementById('quicknote-inp');if(qinp)qinp.value='';
  setSeriesStatusUI(log.status||'none');
  const colors={none:'linear-gradient(135deg,#1b1d21,#141518)',played:'linear-gradient(135deg,rgba(56,189,248,.15),rgba(13,14,16,1))',cleared:'linear-gradient(135deg,rgba(96,165,250,.15),rgba(13,14,16,1))'};
  document.getElementById('series-hero').style.background=colors[log.status||'none'];
  document.getElementById('ov-series').classList.add('on');
  // 从 Supabase 数据填充本地内存
  if(log.notes!=null)       lsSet('pkm_notes_'+seriesId,    Array.isArray(log.notes)?log.notes:[]);
  if(log.party!=null)       lsSet('pkm_party_'+seriesId,    log.party);
  if(log.progress!=null)    lsSet('pkm_progress_'+seriesId, log.progress);
  if(log.hunts!=null)       lsSet('pkm_hunt_'+seriesId,     log.hunts);
  // 训练 EV：{pkmId: {hp,attack,...}} → 逐只写入内存
  if(log.training_evs!=null){
    Object.entries(log.training_evs).forEach(([pkmId,evs])=>{
      lsSet('pkm_train_ev_'+seriesId+'_'+pkmId,evs);
    });
  }
  renderQuickNotes(seriesId);
  initFRLGMapTab(seriesId);
  // 清理上一个版本的冒险日记，避免串号
  const _diary=document.getElementById('adventure-diary');if(_diary){_diary.style.display='none';_diary.textContent='';}
  const _diaryBtn=document.getElementById('gen-diary-btn');if(_diaryBtn){_diaryBtn.disabled=false;_diaryBtn.textContent='✦ AI 润色成冒险日记';}
}
function setSeriesStatus(st){setSeriesStatusUI(st);const colors={none:'linear-gradient(135deg,#1b1d21,#141518)',played:'linear-gradient(135deg,rgba(56,189,248,.15),rgba(13,14,16,1))',cleared:'linear-gradient(135deg,rgba(96,165,250,.15),rgba(13,14,16,1))'};document.getElementById('series-hero').style.background=colors[st];document.getElementById('series-save-btn').dataset.status=st;if(st==='cleared')setTimeout(spawnConfetti,300);}
function setSeriesStatusUI(st){['none','played','cleared'].forEach(s=>{const el=document.getElementById('spill-'+s);if(!el)return;el.className='series-pill'+(s===st?' active-'+s:'');});document.getElementById('series-save-btn').dataset.status=st;}
async function saveSeriesDetail(){
  const btn=document.getElementById('series-save-btn');const sid=btn.dataset.sid;
  const{data:{session}}=await db.auth.getSession();if(!session?.user){alert('请先登录');return;}
  btn.textContent='保存中…';btn.disabled=true;
  const payload={user_id:session.user.id,series_id:sid,status:btn.dataset.status||'none',start_date:document.getElementById('series-start-inp').value||null,end_date:document.getElementById('series-end-inp').value||null,play_hours:parseInt(document.getElementById('series-hours-inp').value)||0,ace_pokemon:document.getElementById('series-ace-inp').value.trim()||null,updated_at:new Date().toISOString()};
  const{error}=await db.from('pkm_series_log').upsert(payload,{onConflict:'user_id,series_id'});
  if(error){alert('保存失败：'+error.message);btn.textContent='保存';btn.disabled=false;return;}
  pkmSeriesLogs[sid]={...payload};renderSeries();btn.textContent='✓ 已保存';
  setTimeout(()=>{btn.textContent='保存记录';btn.disabled=false;closeOv('ov-series');},800);
}

function openPkmChat(){if(!todayPkm)return;const sp=todayPkm.species;currentChatPkm={id:todayPkm.id,name:getCNName(todayPkm.species,todayPkm.name)||todayPkm.name,types:todayPkm.types.map(t=>t.type.name),species:sp};pkmChatFromModal=false;openPkmChatModal();}
function openPkmChatFromModal(){pkmChatFromModal=true;openPkmChatModal();}
function openPkmChatModal(){
  const g=currentChatPkm;if(!g)return;
  pkmChatHistory=[];document.getElementById('pkm-chat-title').textContent='和 AI 聊聊 '+g.name;
  document.getElementById('pkm-ai-msgs').innerHTML='';document.getElementById('pkm-ai-quick').innerHTML='';
  document.getElementById('pkm-series-inp').value='';document.getElementById('pkm-sum-btn').textContent='📋 生成游戏日志';document.getElementById('pkm-sum-btn').disabled=false;
  document.getElementById('ov-pkm-chat').classList.add('on');
  const qs=['这只宝可梦的对战技能推荐？','它的进化条件是什么？','在哪部作品里登场印象最深？','有什么有趣的冷知识？','怎么培育出高个体值？'];
  document.getElementById('pkm-ai-quick').innerHTML=qs.map(q=>`<button class="qq" onclick="sendPkmQuick('${q.replace(/'/g,"&#39;")}')">${q}</button>`).join('');
  const types=g.types.map(t=>TYPE_ZH[t]||t).join('/');
  const greet='《'+g.name+'》的档案已加载。\n\n属性：'+types+'，编号 #'+String(g.id).padStart(3,'0')+'。\n\n关于对战配置、进化条件、游戏出场、冷知识……随便问，我在。';
  addPkmBubble(greet,'ai',false);
}
function sendPkmQuick(q){document.getElementById('pkm-ai-inp').value=q;sendPkmAIMsg();}
function addPkmBubble(text,role,animate){
  const msgs=document.getElementById('pkm-ai-msgs');const div=document.createElement('div');div.className='cmsg '+(role==='ai'?'ai-msg':'user-msg');
  div.innerHTML='<div class="cmsg-av '+(role==='ai'?'ai-av':'usr-av')+'">'+(role==='ai'?'AI':'我')+'</div><div class="cmsg-bbl"></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;const bbl=div.querySelector('.cmsg-bbl');
  if(animate&&role==='ai'){let i=0;const spd=text.length>400?15:25;const t=()=>{if(i<text.length){bbl.textContent+=text[i++];msgs.scrollTop=msgs.scrollHeight;setTimeout(t,1000/spd);}};t();}
  else{bbl.textContent=text;msgs.scrollTop=msgs.scrollHeight;}
}
async function sendPkmAIMsg(){
  const inp=document.getElementById('pkm-ai-inp');const v=inp.value.trim();if(!v)return;
  inp.value='';addPkmBubble(v,'user',false);pkmChatHistory.push({role:'user',parts:[{text:v}]});
  const snd=document.getElementById('pkm-ai-snd');snd.disabled=true;
  const td=document.createElement('div');td.className='cmsg ai-msg';td.id='pkm-typing';
  td.innerHTML='<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  const msgs=document.getElementById('pkm-ai-msgs');msgs.appendChild(td);msgs.scrollTop=msgs.scrollHeight;
  const g=currentChatPkm;const series=document.getElementById('pkm-series-inp').value.trim();
  const sys=`你是一位精通宝可梦世界的博士级情报员，专精于${g.name}（#${String(g.id).padStart(3,'0')}，${g.types.map(t=>TYPE_ZH[t]||t).join('/')}属性）。你对这只宝可梦了如指掌：进化方式、对战技能、个性搭配、各作品出场方式、相关剧情和冷知识。${series?`玩家当前游玩的系列：${series}，请优先结合该作品中的相关内容来回答。`:''}\n回答要求：中文，400字左右，详细丰富，纯文字不用Markdown符号。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:pkmChatHistory,generationConfig:{maxOutputTokens:1000,temperature:1.0}})});
    if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err?.error?.message||'HTTP '+res.status);}
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI 暂时离线）';
    const t=document.getElementById('pkm-typing');if(t)t.remove();
    addPkmBubble(reply,'ai',true);pkmChatHistory.push({role:'model',parts:[{text:reply}]});if(pkmChatHistory.length>30)pkmChatHistory=pkmChatHistory.slice(-30);
  }catch(e){const t=document.getElementById('pkm-typing');if(t)t.remove();addPkmBubble('连接失败：'+e.message,'ai',false);}
  snd.disabled=false;inp.focus();
}
async function generatePkmLog(){
  if(pkmChatHistory.length<2){alert('至少聊几句再生成日志吧～');return;}
  const btn=document.getElementById('pkm-sum-btn');btn.disabled=true;btn.textContent='生成中…';
  const g=currentChatPkm;const series=document.getElementById('pkm-series-inp').value.trim();
  const histText=pkmChatHistory.map(m=>(m.role==='user'?'训练师':'博士')+':'+m.parts[0].text).join('\n');
  const prompt='以下是关于宝可梦'+g.name+'的对话记录：\n\n'+histText+'\n\n请将这段对话中有价值的内容写成一则100-150字的训练师日志。用第一人称，像宝可梦训练师在记录探索日记一样，融入宝可梦世界的氛围。提炼关键信息，纯文字不用Markdown。';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:300,temperature:0.8}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const summary=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if(!summary)throw new Error('AI 返回为空');
    const{data:{session}}=await db.auth.getSession();const user=session?.user;
    if(!user){alert('请先登录才能保存日志');btn.disabled=false;btn.textContent='📋 生成游戏日志';return;}
    const{error}=await db.from('pkm_logs').insert({user_id:user.id,pkm_id:g.id,pkm_name:g.name,summary,game_series:series||null});
    if(error)throw new Error(error.message);
    btn.textContent='✓ 日志已保存';setTimeout(()=>{btn.disabled=false;btn.textContent='📋 生成游戏日志';},2000);loadPkmLogs();
  }catch(e){alert('生成失败：'+e.message);btn.disabled=false;btn.textContent='📋 生成游戏日志';}
}
async function loadPkmLogs(){
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  const{data}=await db.from('pkm_logs').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(30);
  const list=document.getElementById('pkm-log-list');
  if(!data||!data.length){list.innerHTML='<div class="pkm-empty">还没有日志，和 AI 聊完后可以生成</div>';document.getElementById('pkm-log-count').textContent='';return;}
  document.getElementById('pkm-log-count').textContent=data.length+' 条';
  list.innerHTML=data.map(r=>'<div class="pkm-log-item"><div class="pkm-log-item-hdr"><span class="pkm-log-name">📖 '+r.pkm_name+'</span><div style="display:flex;align-items:center;gap:6px"><span class="pkm-log-date">'+new Date(r.created_at).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+'</span><button onclick="delPkmLog(this)" data-id="'+r.id+'" style="background:none;border:none;color:var(--t3);cursor:pointer;font-size:.72rem;padding:0" title="删除">🗑</button></div></div><div class="pkm-log-text">'+esc(r.summary)+'</div>'+(r.game_series?'<div class="pkm-log-series">'+esc(r.game_series)+'</div>':'')+'</div>').join('');
}
function delPkmLog(el){deletePkmLog(el.dataset.id);}
async function deletePkmLog(id){if(!confirm('删除这条游戏日志？'))return;const{data:{session}}=await db.auth.getSession();if(!session?.user)return;await db.from('pkm_logs').delete().eq('id',id).eq('user_id',session.user.id);loadPkmLogs();}

/* 系列AI对话 */
let seriesChatHistory=[],seriesChatOpen=false;
function toggleSeriesChat(){
  seriesChatOpen=!seriesChatOpen;const wrap=document.getElementById('series-chat-wrap');if(wrap)wrap.style.display=seriesChatOpen?'block':'none';
  const btn=document.getElementById('series-ai-btn');if(btn)btn.textContent=seriesChatOpen?'收起 AI 对话':'⬡ 和 AI 聊聊这部作品';
  if(seriesChatOpen){const msgs=document.getElementById('series-chat-msgs');if(msgs&&msgs.children.length===0)initSeriesChat();}
}
function initSeriesChat(){
  const sid=document.getElementById('series-save-btn')?.dataset?.sid;if(!sid)return;
  const s=PKM_SERIES.find(x=>x.id===sid);if(!s)return;
  seriesChatHistory=[];const nameEl=document.getElementById('series-chat-game-name');if(nameEl)nameEl.textContent=s.name;
  const status=document.getElementById('series-save-btn')?.dataset?.status||'none';
  const hours=document.getElementById('series-hours-inp')?.value||'';const ace=document.getElementById('series-ace-inp')?.value||'';
  const qs=['这部作品的剧情有什么亮点？','入坑建议是什么？','隐藏要素有哪些值得探索？','推荐怎么组队？'];
  const qq=document.getElementById('series-quick-qs');if(qq)qq.innerHTML=qs.map(q=>'<button class="qq" onclick="sendSeriesQuick(\''+q.replace(/'/g,"\\'")+'\')" style="font-size:.68rem">'+q+'</button>').join('');
  const stTxt={none:'还没玩过',played:'正在游玩中',cleared:'已通关'}[status]||'';
  addSeriesBubble('《'+s.name+'》（'+s.year+'年）档案已加载。'+(stTxt?'你'+stTxt+'，':'')+(hours?'投入了约'+hours+'小时，':'')+(ace?'王牌是'+ace+'。':'')+' 关于剧情、攻略、隐藏要素，随便问。','ai',false);
}
function sendSeriesQuick(q){const inp=document.getElementById('series-chat-inp');if(inp){inp.value=q;sendSeriesAIMsg();}}
function addSeriesBubble(text,role,animate){
  const msgs=document.getElementById('series-chat-msgs');if(!msgs)return;
  const div=document.createElement('div');div.className='cmsg '+(role==='ai'?'ai-msg':'user-msg');
  div.innerHTML='<div class="cmsg-av '+(role==='ai'?'ai-av':'usr-av')+'">'+(role==='ai'?'AI':'我')+'</div><div class="cmsg-bbl"></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;const bbl=div.querySelector('.cmsg-bbl');
  if(animate&&role==='ai'){let i=0;const t=()=>{if(i<text.length){bbl.textContent+=text[i++];msgs.scrollTop=msgs.scrollHeight;setTimeout(t,20);}};t();}
  else{bbl.textContent=text;msgs.scrollTop=msgs.scrollHeight;}
}
async function sendSeriesAIMsg(){
  const inp=document.getElementById('series-chat-inp');const v=inp?.value?.trim();if(!v)return;
  inp.value='';addSeriesBubble(v,'user',false);seriesChatHistory.push({role:'user',parts:[{text:v}]});
  const snd=document.getElementById('series-ai-snd');if(snd)snd.disabled=true;
  const msgs=document.getElementById('series-chat-msgs');
  const td=document.createElement('div');td.className='cmsg ai-msg';td.id='series-typing';
  td.innerHTML='<div class="cmsg-av ai-av">AI</div><div class="cmsg-bbl"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  if(msgs){msgs.appendChild(td);msgs.scrollTop=msgs.scrollHeight;}
  const sid=document.getElementById('series-save-btn')?.dataset?.sid;const s=PKM_SERIES.find(x=>x.id===sid)||{name:'未知',year:''};
  const status=document.getElementById('series-save-btn')?.dataset?.status||'none';const hours=document.getElementById('series-hours-inp')?.value||'';const ace=document.getElementById('series-ace-inp')?.value||'';
  const sys='你是宝可梦系列「'+s.name+'」（'+s.year+'年）的专属攻略顾问。玩家状态：'+(status==='cleared'?'已通关':status==='played'?'游玩中':'未游玩')+(hours?'，约'+hours+'小时':'')+(ace?'，王牌：'+ace:'')+'。用中文详细回答（400字左右），纯文字不用Markdown。';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({system_instruction:{parts:[{text:sys}]},contents:seriesChatHistory,generationConfig:{maxOutputTokens:1000,temperature:1.0}})});
    if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI 暂时离线）';
    const t=document.getElementById('series-typing');if(t)t.remove();addSeriesBubble(reply,'ai',true);
    seriesChatHistory.push({role:'model',parts:[{text:reply}]});if(seriesChatHistory.length>20)seriesChatHistory=seriesChatHistory.slice(-20);
  }catch(e){const t=document.getElementById('series-typing');if(t)t.remove();addSeriesBubble('连接失败：'+e.message,'ai',false);}
  if(snd)snd.disabled=false;if(inp)inp.focus();
}
async function genSeriesLogFromChat(){
  if(seriesChatHistory.length<2){alert('至少聊几句再生成日志吧');return;}
  const btn=document.getElementById('series-log-btn');if(btn){btn.disabled=true;btn.textContent='生成中…';}
  const sid=document.getElementById('series-save-btn')?.dataset?.sid;const s=PKM_SERIES.find(x=>x.id===sid)||{name:'未知'};
  const histText=seriesChatHistory.map(m=>(m.role==='user'?'训练师':'顾问')+':'+m.parts[0].text).join('\n');
  const prompt='以下是关于宝可梦「'+s.name+'」的对话：\n\n'+histText+'\n\n请用第一人称训练师日记口吻，写一段100-130字的游玩日志，提炼有价值的内容，融入游戏氛围，纯文字不用Markdown。';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:300,temperature:0.9}})});
    if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const text=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();if(!text)throw new Error('返回为空');
    const ta=document.getElementById('series-notes-inp');if(ta){const prev=ta.value.trim();ta.value=(prev?prev+'\n\n':'')+'[AI 日志]\n'+text;}
    const{data:{session}}=await db.auth.getSession();if(session?.user){await db.from('pkm_logs').insert({user_id:session.user.id,pkm_id:0,pkm_name:'📝 '+s.name,summary:text,game_series:s.name});loadPkmLogs();}
    if(btn){btn.textContent='✓ 已保存到日志';setTimeout(()=>{btn.disabled=false;btn.textContent='📋 生成游玩日志';},2000);}
  }catch(e){alert('生成失败：'+e.message);if(btn){btn.disabled=false;btn.textContent='📋 生成游玩日志';}}
}
async function initPkm(){Object.keys(genCache).forEach(k=>delete genCache[k]);await loadSeriesData();await loadTodayPkm();await loadPkmCollection();updateTodayBtns();loadGen(1,document.querySelector('.pkm-gen-tab'));await loadPkmLogs();renderActiveCatches();}


/* ================================================================
   新功能：系列弹窗 Tabs / 快记 / 队伍 / 进度 / 探索 / 狩猎 / 图鉴录入
   ================================================================ */

/* ── 常量：性格表 ── */
const NATURES=[
  {id:'hardy',zh:'坚毅',up:null,down:null},
  {id:'lonely',zh:'孤僻',up:'attack',down:'defense'},
  {id:'brave',zh:'勇敢',up:'attack',down:'speed'},
  {id:'adamant',zh:'固执',up:'attack',down:'special-attack'},
  {id:'naughty',zh:'淘气',up:'attack',down:'special-defense'},
  {id:'bold',zh:'温顺',up:'defense',down:'attack'},
  {id:'docile',zh:'悠闲',up:null,down:null},
  {id:'relaxed',zh:'乐天',up:'defense',down:'speed'},
  {id:'impish',zh:'皮皮',up:'defense',down:'special-attack'},
  {id:'lax',zh:'大大咧咧',up:'defense',down:'special-defense'},
  {id:'timid',zh:'胆小',up:'speed',down:'attack'},
  {id:'hasty',zh:'急躁',up:'speed',down:'defense'},
  {id:'serious',zh:'认真',up:null,down:null},
  {id:'jolly',zh:'爽朗',up:'speed',down:'special-attack'},
  {id:'naive',zh:'天真',up:'speed',down:'special-defense'},
  {id:'modest',zh:'内敛',up:'special-attack',down:'attack'},
  {id:'mild',zh:'温和',up:'special-attack',down:'defense'},
  {id:'quiet',zh:'冷静',up:'special-attack',down:'speed'},
  {id:'rash',zh:'马虎',up:'special-attack',down:'special-defense'},
  {id:'calm',zh:'沉稳',up:'special-defense',down:'attack'},
  {id:'gentle',zh:'温柔',up:'special-defense',down:'defense'},
  {id:'sassy',zh:'自大',up:'special-defense',down:'speed'},
  {id:'careful',zh:'慎重',up:'special-defense',down:'special-attack'},
  {id:'quirky',zh:'浮躁',up:null,down:null},
  {id:'bashful',zh:'害羞',up:null,down:null},
];
function getNatureZh(id){return NATURES.find(n=>n.id===id)?.zh||id;}

/* ── 常量：各作品进度节点 ── */
const SERIES_CHECKPOINTS={
  'red-blue':['🏅 小刚道馆','🏅 小霞道馆','🏅 苏珊娜道馆','🏅 阿洛道馆','🏅 娜汪道馆','🏅 陈伟道馆','🏅 卡丽娜道馆','🏅 松原道馆','🔴 击败火箭队','⚔️ 四天王','🏆 冠军小茂'],
  'yellow':['🏅 小刚道馆','🏅 小霞道馆','🏅 苏珊娜道馆','🏅 阿洛道馆','🏅 娜汪道馆','🏅 陈伟道馆','🏅 卡丽娜道馆','🏅 松原道馆','🔴 击败火箭队','⚔️ 四天王','🏆 冠军小茂'],
  'gold-silver':['🏅 芙蓉道馆','🏅 藤树道馆','🏅 月桂道馆','🏅 毛利道馆','🏅 麻子道馆','🏅 雷光道馆','🏅 雪诺道馆','🏅 白金道馆','⚔️ 四天王','🏆 冠军','🗺 关都道馆×8','🏆 再战小茂'],
  'crystal':['🏅 芙蓉道馆','🏅 藤树道馆','🏅 月桂道馆','🏅 毛利道馆','🏅 麻子道馆','🏅 雷光道馆','🏅 雪诺道馆','🏅 白金道馆','⚔️ 四天王','🏆 冠军','🗺 关都道馆×8','🏆 再战小茂'],
  'ruby-sapphire':['🏅 楼舟道馆','🏅 月见道馆','🏅 常磐道馆','🏅 水镜道馆','🏅 仙台道馆','🏅 金木道馆','🏅 绿岭道馆','🏅 雄山道馆','🔴 击败水队/炎队','⚔️ 四天王','🏆 冠军'],
  'firered-leafgreen':['🏅 小刚道馆','🏅 小霞道馆','🏅 苏珊娜道馆','🏅 阿洛道馆','🏅 娜汪道馆','🏅 陈伟道馆','🏅 卡丽娜道馆','🏅 松原道馆','🔴 击败火箭队','⚔️ 四天王','🏆 冠军小茂'],
  'emerald':['🏅 楼舟道馆','🏅 月见道馆','🏅 常磐道馆','🏅 水镜道馆','🏅 仙台道馆','🏅 金木道馆','🏅 绿岭道馆','🏅 雄山道馆','🔴 击败水队&炎队','⚔️ 四天王','🏆 冠军'],
  'diamond-pearl':['🏅 随意城道馆','🏅 勾玉道馆','🏅 镜水道馆','🏅 芙蓉道馆','🏅 幸福道馆','🏅 白金道馆','🏅 冰雪道馆','🏅 电光道馆','🔴 击败银河队','⚔️ 四天王','🏆 冠军赤'],
  'platinum':['🏅 随意城道馆','🏅 勾玉道馆','🏅 镜水道馆','🏅 芙蓉道馆','🏅 幸福道馆','🏅 白金道馆','🏅 冰雪道馆','🏅 电光道馆','🔴 击败银河队','⚔️ 四天王','🏆 冠军赤'],
  'heartgold-soulsilver':['🏅 芙蓉道馆','🏅 藤树道馆','🏅 月桂道馆','🏅 毛利道馆','🏅 麻子道馆','🏅 雷光道馆','🏅 雪诺道馆','🏅 白金道馆','⚔️ 四天王','🏆 冠军','🗺 关都道馆×8','🏆 再战小茂'],
  'black-white':['🏅 杖城道馆','🏅 瓶城道馆','🏅 格城道馆','🏅 粗城道馆','🏅 白城道馆','🏅 黑城道馆','🏅 冰城道馆','🏅 辉城道馆','🔴 击败等离子队','⚔️ 四天王','🔮 决战N','🏆 冠军阿戟'],
  'black2-white2':['🏅 杖城道馆','🏅 瓶城道馆','🏅 格城道馆','🏅 黑市道馆','🏅 白城道馆','🏅 黑城道馆','🏅 冰城道馆','🏅 辉城道馆','⚔️ 四天王','🏆 冠军','🌀 黑白塔'],
  'x-y':['🏅 紫堇市道馆','🏅 月桂市道馆','🏅 霓虹市道馆','🏅 石英道馆','🏅 卡洛斯道馆','🏅 花村道馆','🏅 岩城道馆','🏅 冻原道馆','🔴 击败闪焰队','⚔️ 四天王','🏆 冠军'],
  'oras':['🏅 楼舟道馆','🏅 月见道馆','🏅 常磐道馆','🏅 水镜道馆','🏅 仙台道馆','🏅 金木道馆','🏅 绿岭道馆','🏅 雄山道馆','🔴 击败水队/炎队','⚔️ 四天王','🏆 冠军','🌌 传说之戒'],
  'sun-moon':['🌺 伊利马大试练','🔥 卡赫利大试练','🔮 鲁扎米尼大试练','🌊 苏菲大试练','👊 马罗大试练','💎 奥利维亚岛王','👻 纳纳米大试练','🌿 阿卡拉岛王','⚡ 麦勒史蒂芬大试练','🏝 帕尼帕尼岛王','🔴 击败亚力山大','🏆 成为冠军'],
  'usum':['🌺 伊利马大试练','🔥 卡赫利大试练','🔮 鲁扎米尼大试练','🌊 苏菲大试练','👊 马罗大试练','💎 奥利维亚岛王','👻 纳纳米大试练','🌿 阿卡拉岛王','⚡ 帕尼帕尼大试练','🔴 击败亚力山大','🏆 成为冠军','🚀 彩虹火箭队'],
  'sword-shield':['🏅 图特菲尔德道馆','🏅 霍尔斯比道馆','🏅 图尔菲尔德道馆','🏅 斯托海德道馆','🏅 塞奇尔道馆','🏅 西彩德道馆','🏅 斯帕罗特道馆','🏅 黑斯尔道馆','⚔️ 半决赛','🏆 冠军战','🔴 击败罗斯'],
  'bdsp':['🏅 随意城道馆','🏅 勾玉道馆','🏅 镜水道馆','🏅 芙蓉道馆','🏅 幸福道馆','🏅 白金道馆','🏅 冰雪道馆','🏅 电光道馆','🔴 击败银河队','⚔️ 四天王','🏆 冠军赤'],
  'legends-arceus':['🌿 翠玉部落','❄️ 月桂部落','🌾 黄金部落','🪨 水岸部落','🌋 钻石部落','🔴 vs 氏族决战','🌀 捕获超古代','✨ 捕获阿尔宙斯'],
  'scarlet-violet':['🗺 南路线探索','🗺 西路线探索','🗺 东路线探索','🗺 北路线探索','🏅 道馆全通','⭐ 传说强者之路','🔴 星队扫荡','🏆 终章通关','💜 零之秘宝'],
  'legends-za':['📖 序章','🏙 卢米奥斯改造','⚔️ 首次大型战斗','🌀 中盘转折','🏆 终章通关'],
};

const _lsMem={};
function lsGet(k){try{const v=localStorage.getItem(k);return v!=null?JSON.parse(v):(_lsMem[k]??null);}catch{return _lsMem[k]??null;}}
function lsSet(k,v){_lsMem[k]=v;try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

/* 把单个 jsonb 字段写回 pkm_series_log（fire-and-forget） */
async function syncSeriesField(sid,field,value){
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  if(pkmSeriesLogs[sid]){
    await db.from('pkm_series_log').update({[field]:value}).eq('user_id',session.user.id).eq('series_id',sid);
  }else{
    await db.from('pkm_series_log').upsert({user_id:session.user.id,series_id:sid,status:'none',[field]:value},{onConflict:'user_id,series_id'});
    if(!pkmSeriesLogs[sid])pkmSeriesLogs[sid]={status:'none'};
  }
  if(pkmSeriesLogs[sid])pkmSeriesLogs[sid][field]=value;
}
let _huntSyncTimer=null;
function debounceSyncHunts(sid,list){clearTimeout(_huntSyncTimer);_huntSyncTimer=setTimeout(()=>syncSeriesField(sid,'hunts',list),1500);}

let _trainEVSyncTimer=null;
function debounceSyncTrainEVs(sid){
  clearTimeout(_trainEVSyncTimer);
  _trainEVSyncTimer=setTimeout(()=>{
    // 把当前 series 所有精灵的 EV 汇总成一个 object 存回 Supabase
    const prefix='pkm_train_ev_'+sid+'_';
    const evObj={};
    Object.entries(_lsMem).forEach(([k,v])=>{if(k.startsWith(prefix))evObj[k.slice(prefix.length)]=v;});
    syncSeriesField(sid,'training_evs',evObj);
  },1200);
}

/* ── 当前系列 ID ── */
let _curSid='';

/* ── Tab 切换 ── */
function switchSeriesTab(el,tab){
  document.querySelectorAll('.stab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.stab-panel').forEach(p=>p.classList.remove('on'));
  el.classList.add('on');
  const panel=document.getElementById('stab-'+tab);if(panel)panel.classList.add('on');
  if(tab==='party')renderPartySlots(_curSid);
  if(tab==='progress')renderProgress(_curSid);
  if(tab==='training')initTrainTab(_curSid);
  if(tab==='hunting')initHuntTab(_curSid);
  if(tab==='catches'){initNatureSelect('catch-nature');loadCatchList(_curSid);}
  if(tab==='frlgmap')frlgInitView('kanto');
  if(tab==='explore'){document.getElementById('explore-result').style.display='none';const sr=document.getElementById('explore-save-row');if(sr)sr.style.display='none';loadExploreHistory(_curSid);}
}


/* ============================
   ⚡ 快记
   ============================ */
function addQuickNote(){
  const inp=document.getElementById('quicknote-inp');
  const text=inp?.value?.trim();if(!text)return;
  let notes=lsGet('pkm_notes_'+_curSid)||[];if(!Array.isArray(notes))notes=[];
  notes.unshift({text,ts:Date.now()});
  lsSet('pkm_notes_'+_curSid,notes);
  inp.value='';
  renderQuickNotes(_curSid);
  syncSeriesField(_curSid,'notes',notes);
}
function renderQuickNotes(sid){
  const list=document.getElementById('quicknote-list');if(!list)return;
  let notes=lsGet('pkm_notes_'+sid)||[];
  if(!Array.isArray(notes))notes=[];
  if(!notes.length){list.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:4px 0">还没有快记，边玩边记吧～</div>';return;}
  list.innerHTML=notes.map((n,i)=>{
    const d=new Date(n.ts);
    const ts=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    return`<div class="quicknote-item"><span class="quicknote-ts">${ts}</span><span class="quicknote-text">${esc(n.text)}</span><button class="quicknote-del" onclick="delQuickNote('${sid}',${i})">✕</button></div>`;
  }).join('');
}
function delQuickNote(sid,idx){
  let notes=lsGet('pkm_notes_'+sid)||[];if(!Array.isArray(notes))notes=[];notes.splice(idx,1);lsSet('pkm_notes_'+sid,notes);renderQuickNotes(sid);syncSeriesField(sid,'notes',notes);
}

/* ============================
   👥 队伍追踪
   ============================ */
function renderPartySlots(sid){
  let party=lsGet('pkm_party_'+sid)||[];if(!Array.isArray(party))party=[];while(party.length<6)party.push(null);
  const html=(searchId)=>party.map((p,i)=>{
    if(p){
      return`<div class="party-slot filled">
        <button class="party-slot-del" onclick="removeFromParty('${sid}',${i});event.stopPropagation()">✕</button>
        <img src="${p.img||''}" alt="" onerror="this.style.display='none'">
        <div class="party-slot-name">${esc(p.name)}</div>
        ${p.nick?`<div class="party-slot-nick">${esc(p.nick)}</div>`:''}
        <div class="party-slot-lv">${p.lv?'Lv.'+p.lv:''}</div>
        <button class="party-speak-btn" onclick="speakPartyMember('${sid}',${i});event.stopPropagation()">💬 说话</button>
      </div>`;
    }
    return`<div class="party-slot" onclick="document.getElementById('${searchId}')?.focus()">
      <div class="party-slot-empty-icon">+</div>
      <div class="party-slot-empty-lbl">空位</div>
    </div>`;
  }).join('');
  const wrap=document.getElementById('party-slots');
  if(wrap)wrap.innerHTML=html('party-search-inp');
  const immWrap=document.getElementById('imm-party-slots');
  if(immWrap)immWrap.innerHTML=html('imm-party-search-inp');
  renderImmPartyScene(sid);
}
function focusPartySearch(){document.getElementById('party-search-inp')?.focus();}
function removeFromParty(sid,idx){
  let party=lsGet('pkm_party_'+sid)||[];if(!Array.isArray(party))party=[];while(party.length<6)party.push(null);
  party[idx]=null;lsSet('pkm_party_'+sid,party);
  renderPartySlots(sid);
  if(typeof initTrainTab==='function')initTrainTab(sid);
  syncSeriesField(sid,'party',party);
}
let _partySearchT=null;
function searchPartyPkm(v){
  clearTimeout(_partySearchT);
  const res=document.getElementById('party-search-results');
  if(!v.trim()){if(res)res.classList.remove('open');return;}
  _partySearchT=setTimeout(()=>doInlineSearch(v,res,'party'),400);
}
function searchImmPartyPkm(v){
  clearTimeout(_partySearchT);
  const res=document.getElementById('imm-party-search-results');
  if(!v.trim()){if(res)res.classList.remove('open');return;}
  _partySearchT=setTimeout(()=>doInlineSearch(v,res,'party'),400);
}
function addToParty(sid,pkm){
  let party=lsGet('pkm_party_'+sid)||[];if(!Array.isArray(party))party=[];while(party.length<6)party.push(null);
  const emptyIdx=party.findIndex(p=>p===null);
  if(emptyIdx<0){showToast('队伍已满（最多6只）');return;}
  const nick=prompt(`给 ${pkm.name} 起个昵称？（回车跳过）`,'')||'';
  const lv=prompt('当前等级？（回车跳过）','')||'';
  const cleanLv=lv?String(Math.max(1,Math.min(100,parseInt(lv,10)||1))):'';
  party[emptyIdx]={pkmId:pkm.id,name:pkm.name,img:pkm.img,nick,lv:cleanLv};
  lsSet('pkm_party_'+sid,party);
  ['party-search-inp','imm-party-search-inp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['party-search-results','imm-party-search-results'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('open');});
  renderPartySlots(sid);
  renderImmParty();
  if(typeof initTrainTab==='function')initTrainTab(sid);
  syncSeriesField(sid,'party',party);
}

/* ============================
   🏁 进度打卡
   ============================ */
function renderProgress(sid){
  const list=document.getElementById('progress-list');if(!list)return;
  const checkpoints=SERIES_CHECKPOINTS[sid];
  if(!checkpoints){list.innerHTML='<div style="color:var(--t3);font-size:.82rem;padding:8px 0">该作品暂无预设进度节点</div>';return;}
  const done=lsGet('pkm_progress_'+sid)||{};
  const total=checkpoints.length;const doneCount=Object.keys(done).length;
  const pct=Math.round(doneCount/total*100);
  list.innerHTML=`<div class="progress-head">
    <div>
      <div class="progress-head-title">路线推进</div>
      <div class="progress-head-meta">${doneCount}/${total} 节点完成</div>
    </div>
    <div class="progress-head-pct">${pct}%</div>
  </div>
  <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
  <div class="progress-items-wrap">`
  +checkpoints.map((cp,i)=>{
    const isDone=!!done[i];const ts=done[i]?.ts;
    const tsStr=ts?new Date(ts).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'}):'未记录';
    return`<div class="progress-item${isDone?' done':''}" onclick="toggleCheckpoint('${sid}',${i})">
      <div class="progress-check">${isDone?'✓':''}</div>
      <div class="progress-main">
        <span class="progress-label">${cp}</span>
        <div class="progress-subrow">
          <span class="progress-ts">${tsStr}</span>
          ${!isDone?`<button class="gym-brief-btn" onclick="getBriefing('${sid}',${i});event.stopPropagation()" title="战前动员">⚔️ 战前动员</button>`:'<span class="progress-done-tag">已完成</span>'}
        </div>
      </div>
    </div>`;
  }).join('')+'</div>';
}
function toggleCheckpoint(sid,idx){
  const done=lsGet('pkm_progress_'+sid)||{};
  const wasNew=!done[idx];
  if(done[idx])delete done[idx];else done[idx]={ts:Date.now()};
  lsSet('pkm_progress_'+sid,done);renderProgress(sid);syncSeriesField(sid,'progress',done);
  if(wasNew)setTimeout(()=>spawnCheckpointBurst(idx),30);
}

/* ============================
   🗺 探索：位置 + 截图 + AI分析
   ============================ */
let _exploreImgData=null,_exploreImgMime=null,_lastExploreResult=null;

function onExploreImgChange(inp){
  const file=inp.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const dataUrl=e.target.result;
    const comma=dataUrl.indexOf(',');
    _exploreImgData=dataUrl.slice(comma+1);
    _exploreImgMime=file.type||'image/jpeg';
    const preview=document.getElementById('explore-img-preview');
    preview.style.display='block';
    preview.innerHTML=`<div class="explore-img-thumb-wrap"><img src="${dataUrl}" class="explore-img-thumb" alt="截图预览"><button class="explore-img-clear" onclick="clearExploreImg()">✕</button></div>`;
    const lbl=document.getElementById('explore-img-lbl');
    if(lbl){lbl.textContent='📷 '+(file.name.length>12?file.name.slice(0,12)+'…':file.name);lbl.classList.add('active');}
  };
  reader.readAsDataURL(file);
}

function clearExploreImg(){
  _exploreImgData=null;_exploreImgMime=null;
  const preview=document.getElementById('explore-img-preview');if(preview)preview.style.display='none';
  const inp=document.getElementById('explore-img-inp');if(inp)inp.value='';
  const lbl=document.getElementById('explore-img-lbl');if(lbl){lbl.textContent='📷 截图';lbl.classList.remove('active');}
}

async function exploreLocation(){
  const loc=document.getElementById('explore-loc-inp')?.value.trim()||'';
  if(!loc&&!_exploreImgData){showToast('请输入地图位置或上传截图');return;}
  const sid=_curSid;const s=PKM_SERIES.find(x=>x.id===sid);
  const weather=document.getElementById('explore-weather')?.value||'';
  const time=document.getElementById('explore-time')?.value||'';
  const box=document.getElementById('explore-result');
  const saveRow=document.getElementById('explore-save-row');
  const saveOk=document.getElementById('explore-save-ok');
  box.style.display='block';if(saveRow)saveRow.style.display='none';if(saveOk)saveOk.style.display='none';
  box.innerHTML=`<div class="explore-result-header"><span class="explore-loc-name">🗺 ${esc(loc||'识别截图中…')}</span><span style="font-size:.72rem;color:var(--t3);margin-left:8px">AI分析中…</span></div>`;
  const btn=document.getElementById('explore-btn');if(btn){btn.disabled=true;btn.textContent='…';}
  const ctxStr=[weather?'天气：'+weather:'',time?'时间：'+time:''].filter(Boolean).join('，');
  const locCtx=loc?`当前位置：「${loc}」`:'请先从截图识别当前所在位置，然后再进行分析';
  const promptText=`你是宝可梦世界的旅行作家兼精灵生态学家。
玩家正在游玩「${s?.name||sid}」（${s?.year||''}年），${locCtx}${ctxStr?'，'+ctxStr:''}。

请严格按照以下三段格式输出（每个【标题】独占一行）：

【旅途印象】
以训练师第一人称，写60-80字沉浸式旅行散文：融合该地点的地形风光${weather?'、'+weather+'天气的氛围':''}${time?'、'+time+'的时间感':''}，精灵的存在感自然渗透在叙述中，有画面感和情绪，结尾带一点旅人的感慨。

【精灵分布】
列出在「${s?.name||'该作品'}」${loc?'「'+loc+'」':'此地'}可遇到的宝可梦，每行一只，格式：
精灵名 · 遭遇率：高/中/低 · 条件：出现的时间/天气/地形/特殊要求
（8-12只，涵盖常见与稀有${time?'，优先标注'+time+'可遇':''}${weather?'，标注'+weather+'天气特有':''}）

【探索提示】
20-30字，该地点的隐藏道具、特殊事件或值得注意的攻略技巧。

纯文字，不用Markdown，不用额外符号。`;
  const parts=[];
  if(_exploreImgData)parts.push({inline_data:{mime_type:_exploreImgMime||'image/jpeg',data:_exploreImgData}});
  parts.push({text:promptText});
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{maxOutputTokens:800,temperature:0.85}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI暂时无法响应）';
    const displayLoc=loc||(_exploreImgData?'截图位置':'未知位置');
    _lastExploreResult={loc:displayLoc,weather,time,text:reply,ts:Date.now(),sid};
    box.innerHTML=`<div class="explore-result-header">
      <span style="font-size:1.1rem">🗺</span>
      <span class="explore-loc-name">${esc(displayLoc)}</span>
      ${weather?`<span class="explore-ctx-tag">${esc(weather)}</span>`:''}
      ${time?`<span class="explore-ctx-tag">${esc(time)}</span>`:''}
      <span style="font-size:.68rem;color:var(--t3);font-family:'DM Mono',monospace;margin-left:auto">${s?.name||''}</span>
    </div>${renderExploreSections(reply)}`;
    // 旅途印象段打字机效果
    const _immBody=box.querySelector('.explore-section-imm .explore-section-body');
    if(_immBody){const _t=_immBody.textContent;typewriter(_immBody,_t,26);}
    if(saveRow)saveRow.style.display='flex';
  }catch(e){box.innerHTML=`<div class="explore-body" style="color:var(--danger)">查询失败：${e.message}</div>`;}
  if(btn){btn.disabled=false;btn.textContent='探索';}
}

function renderExploreSections(text){
  const parts=text.split(/(?=【[^】]+】)/);
  return parts.map(part=>{
    const m=part.match(/^【([^】]+)】\n?([\s\S]*)/);
    if(!m)return`<div class="explore-body explore-narrative">${esc(part.trim())}</div>`;
    const[,title,body]=m;
    const cls=title==='旅途印象'?'explore-section-imm':title==='精灵分布'?'explore-section-pkm':'explore-section-tip';
    const icon=title==='旅途印象'?'✦':title==='精灵分布'?'◈':'⚑';
    return`<div class="explore-section ${cls}"><div class="explore-section-title">${icon} ${esc(title)}</div><div class="explore-section-body">${esc(body.trim())}</div></div>`;
  }).join('');
}

async function saveExploreRecord(){
  if(!_lastExploreResult)return;
  const btn=document.querySelector('#explore-save-row .btn');if(btn){btn.disabled=true;btn.textContent='保存中…';}
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){showToast('请先登录');if(btn){btn.disabled=false;btn.textContent='📌 保存到探索日志';}return;}
  const r=_lastExploreResult;
  const{error}=await db.from('pkm_explore_log').insert({
    user_id:session.user.id,series_id:r.sid,
    location:r.loc,weather:r.weather||null,time_of_day:r.time||null,content:r.text
  });
  if(btn){btn.disabled=false;btn.textContent='📌 保存到探索日志';}
  if(error){showToast('保存失败：'+error.message);return;}
  const saveOk=document.getElementById('explore-save-ok');
  if(saveOk){saveOk.style.display='inline';setTimeout(()=>{saveOk.style.display='none';},2000);}
  loadExploreHistory(r.sid);
}

async function loadExploreHistory(sid){
  const el=document.getElementById('explore-history');if(!el)return;
  el.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:6px 0">加载中…</div>';
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){el.innerHTML='';return;}
  const{data,error}=await db.from('pkm_explore_log').select('*').eq('user_id',session.user.id).eq('series_id',sid).order('created_at',{ascending:false});
  if(error||!data?.length){el.innerHTML='';return;}
  renderExploreHistory(data);
}

function renderExploreHistory(records){
  const el=document.getElementById('explore-history');if(!el)return;
  if(!records.length){el.innerHTML='';return;}
  el.innerHTML=`<div class="explore-hist-hdr"><span style="font-size:.65rem;color:var(--t3);font-family:'DM Mono',monospace;letter-spacing:.08em">探索日志 · ${records.length} 条记录</span></div>`
    +records.map((r,i)=>{
      const d=new Date(r.created_at);
      const ts=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      const tags=[r.weather,r.time_of_day].filter(Boolean).map(t=>`<span class="explore-ctx-tag">${esc(t)}</span>`).join('');
      const safeId=r.id.replace(/-/g,'_');
      const isFirst=i===0;
      return`<div class="explore-hist-item${isFirst?' explore-hist-latest':''}">
        <div class="explore-hist-header" onclick="toggleExploreRecord('${safeId}')">
          <span class="explore-hist-loc">🗺 ${esc(r.location)}</span>
          ${tags}
          ${isFirst?'<span class="explore-hist-new">最新</span>':''}
          <span class="explore-hist-ts">${ts}</span>
          <button class="explore-hist-del" onclick="delExploreRecord('${r.id}');event.stopPropagation()">✕</button>
        </div>
        <div class="explore-hist-body" id="explore-hist-body-${safeId}" style="display:${isFirst?'block':'none'}">${renderExploreSections(r.content)}</div>
      </div>`;
    }).join('');
}

function toggleExploreRecord(safeId){
  const el=document.getElementById('explore-hist-body-'+safeId);if(el)el.style.display=el.style.display==='none'?'block':'none';
}

async function delExploreRecord(id){
  if(!confirm('删除这条探索记录？'))return;
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  await db.from('pkm_explore_log').delete().eq('id',id).eq('user_id',session.user.id);
  loadExploreHistory(_curSid);
}

/* ============================
   🏠 首页：当前游玩版本捕获展示
   ============================ */
// 性格 → 上升属性分类（用于卡片颜色）
const NATURE_UP_CLASS={
  attack:'up-atk',defense:'up-def','special-attack':'up-spa',
  'special-defense':'up-spd2',speed:'up-spd'
};
async function renderActiveCatches(){
  const box=document.getElementById('pkm-active-catches');
  const row=document.getElementById('pkm-active-catches-row');
  const gameEl=document.getElementById('pkm-active-game');
  const countEl=document.getElementById('pkm-active-count');
  if(!box||!row)return;
  const playingEntry=Object.entries(pkmSeriesLogs).find(([,v])=>v.status==='played');
  if(!playingEntry){box.style.display='none';return;}
  const[sid]=playingEntry;
  const s=PKM_SERIES.find(x=>x.id===sid);
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){box.style.display='none';return;}
  const{data:catches}=await db.from('pkm_catch_log').select('*').eq('user_id',session.user.id).eq('series_id',sid).order('created_at',{ascending:false});
  if(!catches?.length){box.style.display='none';return;}
  box.style.display='block';
  if(gameEl)gameEl.textContent=s?.name||sid;
  if(countEl)countEl.textContent=catches.length+' 只';
  row.innerHTML=catches.map((c,i)=>{
    const nat=NATURES.find(n=>n.id===c.nature);
    const natCls=nat?.up?NATURE_UP_CLASS[nat.up]||'':'';
    const extra=getCatchExtra(c);
    return`<div class="pkm-catch-card${natCls?' '+natCls:''}" style="animation-delay:${i*60}ms" onclick="openSeriesDetailById('${sid}')">
      <img src="${c.img||''}" alt="${esc(c.pkm_name)}" style="animation-delay:${(i*200)%1600}ms" onerror="this.style.display='none'">
      <div class="pkm-catch-card-name">${esc(c.pkm_name)}</div>
      ${c.nickname?`<div class="pkm-catch-card-nick">「${esc(c.nickname)}」</div>`:''}
      <div class="pkm-catch-card-nature ${natCls}">${nat?.zh||c.nature}</div>
      ${extra.location?`<div class="pkm-catch-card-loc" title="${esc(extra.location)}">📍 ${esc(extra.location)}</div>`:''}
    </div>`;
  }).join('');
}

function openSeriesDetailById(sid){
  const el=document.querySelector(`.pkm-series-card[data-sid="${sid}"]`);
  if(el)openSeriesDetail(el);
}

function openSeriesCatchRecorder(){
  if(!_curSid)return;
  closeOv('ov-series');
  openImm('hunt',_curSid,-1);
  setTimeout(()=>{
    toggleImmPanel('catches');
    const locInp=document.getElementById('catch-location');
    if(locInp&&!locInp.value)locInp.value=getCatchLocationPrefill();
    document.getElementById('catch-search-inp')?.focus();
  },100);
}

/* ================================================================
   🎯 新版狩猎系统：地点选择 → AI精灵分布 → 沉浸式战斗
   ================================================================ */

/* ── 版本→PokéAPI版本名 ── */
const SERIES_VERSIONS={
  'red-blue':['red','blue'],'yellow':['yellow'],
  'gold-silver':['gold','silver'],'crystal':['crystal'],
  'ruby-sapphire':['ruby','sapphire'],'emerald':['emerald'],
  'firered-leafgreen':['firered','leafgreen'],
  'diamond-pearl':['diamond','pearl'],'platinum':['platinum'],
  'heartgold-soulsilver':['heartgold','soulsilver'],
  'black-white':['black','white'],'black2-white2':['black-2','white-2'],
  'x-y':['x','y'],'oras':['omega-ruby','alpha-sapphire'],
  'sun-moon':['sun','moon'],'usum':['ultra-sun','ultra-moon'],
  'sword-shield':[],'bdsp':['brilliant-diamond','shining-pearl'],
  'legends-arceus':[],'scarlet-violet':[],'legends-za':[],
};

/* ── 中文地点→PokéAPI location名（按游戏版本）── */
const LOCATION_API_MAP={
  'red-blue':{
    '1号道路':'route-1','2号道路':'route-2','月亮山':'mt-moon',
    '无名小径':'cerulean-cave','赤铁岛':'kanto-pokemon-mansion',
    '常盘森林':'viridian-forest','水流岛':'seafoam-islands','胜利道路':'kanto-victory-road'
  },
  'yellow':{
    '1号道路':'route-1','2号道路':'route-2','月亮山':'mt-moon',
    '无名小径':'cerulean-cave','赤铁岛':'kanto-pokemon-mansion',
    '常盘森林':'viridian-forest','胜利道路':'kanto-victory-road'
  },
  'firered-leafgreen':{
    '1号道路':'route-1','2号道路':'route-2','月亮山':'mt-moon',
    '赤铁岛':'kanto-pokemon-mansion','常盘森林':'viridian-forest',
    '水流岛':'seafoam-islands','胜利道路':'kanto-victory-road'
  },
  'gold-silver':{
    '29号道路':'route-29','31号道路':'route-31','迷雾山':'mt-mortar',
    '冰川小道':'ice-path','苹果树森林':'ilex-forest',
    '喷火龙岛':'whirl-islands','银岩山':'mt-silver','胜利道路':'johto-victory-road'
  },
  'crystal':{
    '29号道路':'route-29','31号道路':'route-31','迷雾山':'mt-mortar',
    '冰川小道':'ice-path','苹果树森林':'ilex-forest',
    '喷火龙岛':'whirl-islands','胜利道路':'johto-victory-road'
  },
  'heartgold-soulsilver':{
    '29号道路':'route-29','迷雾山':'mt-mortar','冰川小道':'ice-path',
    '苹果树森林':'ilex-forest','喷火龙岛':'whirl-islands',
    '银岩山':'mt-silver','胜利道路':'johto-victory-road'
  },
  'ruby-sapphire':{
    '101号道路':'route-101','102号道路':'route-102','幻影岛':'petalburg-woods',
    '天气研究所':'route-119','流星瀑布':'meteor-falls',
    '沙漠遗迹':'route-111','胜利道路':'hoenn-victory-road'
  },
  'emerald':{
    '101号道路':'route-101','102号道路':'route-102','幻影岛':'petalburg-woods',
    '天气研究所':'route-119','流星瀑布':'meteor-falls','胜利道路':'hoenn-victory-road'
  },
  'oras':{
    '101号道路':'route-101','102号道路':'route-102','幻影岛':'petalburg-woods',
    '天气研究所':'route-119','流星瀑布':'meteor-falls','胜利道路':'hoenn-victory-road'
  },
  'diamond-pearl':{
    '201号道路':'route-201','202号道路':'route-202','永远森林':'eterna-forest',
    '溺水城湖畔':'route-208','崩落山道':'mt-coronet','挑战道路':'route-210','大雪山':'route-216'
  },
  'platinum':{
    '201号道路':'route-201','202号道路':'route-202','永远森林':'eterna-forest',
    '旅人道路':'route-206','挑战道路':'route-210','日暮地':'wayward-cave','大雪山':'route-216'
  },
  'bdsp':{
    '201号道路':'route-201','202号道路':'route-202','永远森林':'eterna-forest',
    '崩落山道':'mt-coronet','挑战道路':'route-210','大雪山':'route-216','地下大迷宫':null
  },
  'black-white':{
    '1号道路':'unova-route-1','深沉森林':'pinwheel-forest','冰洞':'twist-mountain',
    '荒凉通道':'route-7','胜利道路':'unova-victory-road','白之遗迹':'relic-castle'
  },
  'black2-white2':{
    '19号道路':'route-19','20号道路':'route-20','黑暗草地':null,
    '游乐园遗迹':'relic-passage','胜利道路':'unova-victory-road','白之遗迹':'relic-castle'
  },
  'x-y':{
    '1号道路':'kalos-route-2','2号道路':'kalos-route-3','蔷薇大道':'kalos-route-3',
    '结晶岩窟':'reflecting-cave','倒扣杯湖':'kalos-route-14',
    '冠军道路':'pokemon-league-x-y','碧之洞窟':'sea-spirit-den'
  },
  'sun-moon':{
    '阿卡拉大草原':'akala-outskirts','梅雷梅雷草地':'melemele-meadow',
    '波海帕帕河':'brooklet-hill','哈纳岛草地':'ula-ula-meadow',
    '大莫库峰':'mount-lanakila','奈菲留斯岛':'poni-plains'
  },
  'usum':{
    '阿卡拉大草原':'akala-outskirts','梅雷梅雷草地':'melemele-meadow',
    '大莫库峰':'mount-lanakila','奈菲留斯岛':'poni-plains','超时空之洞':null
  },
};

/* ── 官方精灵分布（PokéAPI location-area）── */
async function fetchOfficialDistribution(sid,loc){
  const versions=SERIES_VERSIONS[sid]||[];
  const apiLoc=(LOCATION_API_MAP[sid]||{})[loc];
  if(!apiLoc||!versions.length)return null;
  try{
    const locRes=await fetch(`https://pokeapi.co/api/v2/location/${apiLoc}/`);
    if(!locRes.ok)return null;
    const locData=await locRes.json();
    const areas=locData.areas||[];
    if(!areas.length)return null;
    const areaResults=await Promise.all(areas.map(a=>
      fetch(a.url).then(r=>r.ok?r.json():null).catch(()=>null)
    ));
    // 汇总遭遇率（取各版本最大值）
    const pkmMap={};
    for(const areaData of areaResults){
      if(!areaData)continue;
      for(const enc of(areaData.pokemon_encounters||[])){
        const pkmName=enc.pokemon.name;
        for(const vd of(enc.version_details||[])){
          if(versions.includes(vd.version.name)){
            const chance=vd.max_chance||0;
            pkmMap[pkmName]=Math.max(pkmMap[pkmName]||0,chance);
          }
        }
      }
    }
    const entries=Object.entries(pkmMap).sort((a,b)=>b[1]-a[1]);
    if(!entries.length)return null;
    // 获取前12只精灵数据
    const items=[];
    for(const[name,chance] of entries.slice(0,12)){
      try{
        const p=await fetchPkm(name);
        const id=p.id;
        const cnName=PKM_CN_TABLE[id]||p.name;
        const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
        const evYields={};
        for(const st of(p.stats||[])){if(st.effort>0)evYields[st.stat.name]=st.effort;}
        if(!Object.keys(evYields).length)evYields['hp']=1;
        items.push({id,name:cnName,img,evYields,chance,official:true,rate:chance>=30?'高':chance>=10?'中':'低'});
      }catch(e){}
    }
    return items.length?items:null;
  }catch(e){return null;}
}

/* ── 各版本地点表 ── */
const SERIES_LOCATIONS={
  'red-blue':['1号道路','2号道路','月亮山','无名小径','赤铁岛','常盘森林','水流岛','胜利道路'],
  'yellow':['1号道路','2号道路','月亮山','无名小径','赤铁岛','常盘森林','胜利道路'],
  'gold-silver':['29号道路','31号道路','迷雾山','冰川小道','苹果树森林','喷火龙岛','银岩山','胜利道路'],
  'crystal':['29号道路','31号道路','迷雾山','冰川小道','苹果树森林','喷火龙岛','胜利道路'],
  'ruby-sapphire':['101号道路','102号道路','幻影岛','天气研究所','流星瀑布','沙漠遗迹','胜利道路'],
  'emerald':['101号道路','102号道路','幻影岛','天气研究所','流星瀑布','胜利道路'],
  'firered-leafgreen':['1号道路','2号道路','3号道路','4号道路','5号道路','6号道路','7号道路','8号道路','9号道路','10号道路','11号道路','12号道路','13号道路','14号道路','15号道路','16号道路','17号道路','18号道路','19号道路','20号道路','21号道路','22号道路','23号道路','24号道路','25号道路','常盘森林','月亮山','岩石隧道','宝可梦之塔','狩猎地带','水流岛','发电站','赤铁岛（宝可梦洋馆）','胜利道路','无名小径','埋火山','熄灭道路','断崖之岬','果实森林','冰落洞窟','水的迷宫','石碑之岛','遗迹山谷','花纹草丛','塞沃特峡谷','塔诺比遗迹'],
  'diamond-pearl':['201号道路','202号道路','永远森林','溺水城湖畔','崩落山道','挑战道路','大雪山'],
  'platinum':['201号道路','202号道路','永远森林','旅人道路','挑战道路','日暮地','大雪山'],
  'heartgold-soulsilver':['29号道路','迷雾山','冰川小道','苹果树森林','喷火龙岛','银岩山','胜利道路'],
  'black-white':['1号道路','深沉森林','冰洞','荒凉通道','胜利道路','白之遗迹'],
  'black2-white2':['19号道路','20号道路','黑暗草地','游乐园遗迹','胜利道路','白之遗迹'],
  'x-y':['1号道路','2号道路','蔷薇大道','结晶岩窟','倒扣杯湖','冠军道路','碧之洞窟'],
  'oras':['101号道路','102号道路','幻影岛','天气研究所','流星瀑布','胜利道路'],
  'sun-moon':['阿卡拉大草原','梅雷梅雷草地','波海帕帕河','哈纳岛草地','大莫库峰','奈菲留斯岛'],
  'usum':['阿卡拉大草原','梅雷梅雷草地','大莫库峰','奈菲留斯岛','超时空之洞'],
  'sword-shield':['怀尔德荒原','怀尔德荒原南部','水桥市郊','巨冰山脉','克朗斯特市郊','圣剑峡谷'],
  'bdsp':['201号道路','202号道路','永远森林','崩落山道','挑战道路','大雪山','地下大迷宫'],
  'legends-arceus':['黑曜原野','红莲湿地','雪白原野','云霞山地','无冠湖岸'],
  'scarlet-violet':['南路线一带','西路线一带','东路线一带','北路线一带','帕尔德大湖畔','零之秘宝区域'],
  'legends-za':['卢米奥斯城街道','卢米奥斯城花园','卢米奥斯城深处','郊外丛林'],
};

let _huntDistCache={};   // "sid|loc" → [{id,name,img,rate}]
let _huntLocPkm=[];      // 当前地点分布
let _huntSelLoc='';      // "sid|loc"
let _huntSelEncounterKey=''; // FRLG 直接选中的 encounter key
let _huntDistPkm=null;   // 从分布列表选中的精灵
let _huntActionsLocked=false;
let _huntParticleTimer=null;
let _pkmCnRevMap=null;

function getPkmCnRev(){
  if(!_pkmCnRevMap){_pkmCnRevMap={};Object.entries(PKM_CN_TABLE).forEach(([id,cn])=>{_pkmCnRevMap[cn]=parseInt(id);});}
  return _pkmCnRevMap;
}

/* ── Tab 初始化 ── */
function initHuntTab(sid){
  renderHuntList(sid);
  const locs=SERIES_LOCATIONS[sid];
  const locRow=document.getElementById('hunt-loc-chips');
  const distSection=document.getElementById('hunt-phase-dist');
  const noLoc=document.getElementById('hunt-no-loc');
  if(!locRow)return;
  if(!locs?.length){
    locRow.innerHTML='';
    if(noLoc)noLoc.style.display='block';
    if(distSection)distSection.style.display='none';
    return;
  }
  if(noLoc)noLoc.style.display='none';
  locRow.innerHTML=locs.map(l=>`<div class="hunt-loc-chip" onclick="selectHuntLoc('${l.replace(/'/g,'\\\'')}')" data-loc="${esc(l)}">${esc(l)}</div>`).join('');
  // 恢复上次选择
  const prevKey=_huntSelLoc;
  if(prevKey.startsWith(sid+'|')){
    const prevLoc=prevKey.slice(sid.length+1);
    const chip=locRow.querySelector(`[data-loc="${prevLoc}"]`);
    if(chip){chip.classList.add('on');if(distSection)distSection.style.display='block';}
    const cacheKey=prevKey;
    if(_huntDistCache[cacheKey]){const cached=_huntDistCache[cacheKey];renderHuntDist(cached,cached[0]?.official===true);const btn=document.getElementById('hunt-dist-btn');if(btn)btn.style.display='none';}
  } else {
    if(distSection)distSection.style.display='none';
  }
}

// 自定义地点输入 → 获取分布（hunt / train 通用）
async function loadCustomLocDist(type){
  const sid=_curSid;
  const inp=document.getElementById(type==='hunt'?'hunt-custom-loc':'train-custom-loc');
  const loc=inp?.value?.trim();
  if(!loc){showToast('请输入地点名称');return;}
  if(type==='hunt'){
    _huntSelLoc=sid+'|'+loc;
    document.querySelectorAll('#hunt-loc-chips .hunt-loc-chip').forEach(c=>c.classList.remove('on'));
    const distSection=document.getElementById('hunt-phase-dist');
    const distTitle=document.getElementById('hunt-dist-title');
    if(distSection)distSection.style.display='block';
    if(distTitle)distTitle.textContent=loc+' 精灵分布';
    await loadHuntDistribution();
  }else{
    _trainSelLoc=sid+'|'+loc;
    document.querySelectorAll('#train-loc-chips .hunt-loc-chip').forEach(c=>c.classList.remove('on'));
    const distSec=document.getElementById('train-dist-section');
    const distTitle=document.getElementById('train-dist-title');
    if(distSec)distSec.style.display='block';
    if(distTitle)distTitle.textContent=loc+' 精灵分布 & 努力值';
    await loadTrainDistribution();
  }
}

function selectHuntLoc(loc){
  const sid=_curSid;
  _huntSelEncounterKey='';
  _huntSelLoc=sid+'|'+loc;
  document.querySelectorAll('.hunt-loc-chip').forEach(c=>c.classList.toggle('on',c.dataset.loc===loc));
  const distSection=document.getElementById('hunt-phase-dist');
  const distTitle=document.getElementById('hunt-dist-title');
  const distGrid=document.getElementById('hunt-dist-grid');
  if(distSection)distSection.style.display='block';
  if(distTitle)distTitle.textContent=loc+' 精灵分布';
  const cacheKey=_huntSelLoc;
  if(_huntDistCache[cacheKey]){
    const cached=_huntDistCache[cacheKey];
    renderHuntDist(cached,cached[0]?.official===true);
    const btn=document.getElementById('hunt-dist-btn');if(btn)btn.style.display='none';
  } else {
    if(distGrid)distGrid.innerHTML='';
    const btn=document.getElementById('hunt-dist-btn');
    if(btn){btn.style.display='';btn.disabled=false;btn.textContent='✦ 获取分布';}
  }
}
function selectHuntLocFromMap(loc,encounterKey){
  _huntSelEncounterKey=encounterKey||'';
  selectHuntLoc(loc);
}

async function loadHuntDistribution(){
  const cacheKey=_huntSelLoc;
  if(!cacheKey?.includes('|')){showToast('请先选择地点');return;}
  const[sid,loc]=cacheKey.split('|');
  const btn=document.getElementById('hunt-dist-btn');
  const grid=document.getElementById('hunt-dist-grid');
  if(btn){btn.disabled=true;btn.textContent='获取中…';}
  // FRLG：直接用本地 PokeAPI 静态数据
  if(sid==='firered-leafgreen'&&typeof FRLG_ENCOUNTERS!=='undefined'){
    const entry=(_huntSelEncounterKey&&FRLG_ENCOUNTERS[_huntSelEncounterKey])||Object.values(FRLG_ENCOUNTERS).find(e=>e.zh===loc);
    if(entry&&entry.encounters?.length){
      if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">加载精灵数据…</div>';
      const items=[];
      for(const enc of [...entry.encounters].sort((a,b)=>b.rate-a.rate).slice(0,16)){
        try{
          const p=await fetchPkm(enc.slug);
          const id=p.id;
          const cnName=PKM_CN_TABLE[id]||p.name;
          const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
          const evYields={};for(const st of(p.stats||[])){if(st.effort>0)evYields[st.stat.name]=st.effort;}
          if(!Object.keys(evYields).length)evYields['hp']=1;
          items.push({id,name:cnName,img,chance:enc.rate,rate:enc.rate>=30?'高':enc.rate>=10?'中':'低',evYields,official:true,versions:enc.versions,methods:enc.methods});
        }catch(e){}
      }
      if(items.length){
        _huntDistCache[cacheKey]=items;
        renderHuntDist(items,true,'PokeAPI');
        if(btn)btn.style.display='none';
        return;
      }
    }
  }
  if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">正在从 52poke 读取「'+loc+'」精灵分布…</div>';
  // 优先 52poke
  const wiki52=await fetch52PokeLocDistribution(loc);
  if(wiki52){
    _huntDistCache[cacheKey]=wiki52;
    renderHuntDist(wiki52,true);
    if(btn)btn.style.display='none';
    return;
  }
  // 回退 AI
  if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">52poke 暂无数据，AI 分析中…</div>';
  const s=PKM_SERIES.find(x=>x.id===sid);
  const prompt=`宝可梦游戏「${s?.name||sid}」中「${loc}」可以遇到的精灵，请列出10只，每行一只，格式：
精灵中文名 · 高/中/低
（遭遇率：高=常见，中=偶见，低=稀有）
只输出列表，不要编号不要其他内容。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:200,temperature:0.6}})});
    const data=await res.json();
    const txt=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'';
    const rev=getPkmCnRev();
    const items=[];
    for(const line of txt.split('\n')){
      const m=line.trim().match(/^(.+?)\s*[·•·]\s*(高|中|低)/);
      if(!m)continue;
      const cnName=m[1].trim();const rate=m[2];
      const id=rev[cnName];if(!id)continue;
      try{
        const p=await fetchPkm(id);
        const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
        const evYields={};for(const st of(p.stats||[])){if(st.effort>0)evYields[st.stat.name]=st.effort;}
        if(!Object.keys(evYields).length)evYields['hp']=1;
        items.push({id,name:cnName,img,rate,evYields,official:false});
      }catch(e){}
    }
    if(!items.length){
      if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--danger)">未能识别精灵名称，请重试</div>';
      if(btn){btn.disabled=false;btn.textContent='↺ 重试';}
      return;
    }
    _huntDistCache[cacheKey]=items;
    renderHuntDist(items,false);
    if(btn)btn.style.display='none';
  }catch(e){
    if(grid)grid.innerHTML=`<div style="font-size:.75rem;color:var(--danger)">获取失败：${e.message}</div>`;
    if(btn){btn.disabled=false;btn.textContent='↺ 重试';}
  }
}

function renderHuntDist(items,isOfficial,srcLabel){
  _huntLocPkm=items;
  // 沉浸模式下立即同步区域精灵网格（必须在 hunt-dist-grid 检查之前）
  const ov=document.getElementById('ov-imm');
  if(ov&&ov.style.display!=='none'&&_immMode==='hunt'){
    const curList=lsGet('pkm_hunt_'+_immSid)||[];
    renderHuntAreaGrid(curList[_immIdx]||null);
  }
  const grid=document.getElementById('hunt-dist-grid');if(!grid)return;
  const srcBadge=isOfficial
    ?`<div class="dist-src-badge dist-src-official">${srcLabel||'52poke'} 官方</div>`
    :`<div class="dist-src-badge dist-src-ai">AI 参考</div>`;
  grid.innerHTML=srcBadge+items.map((it,i)=>{
    let rateHtml;
    if(it.official&&it.chance!=null){
      const cls=it.chance>=30?'rate-hi':it.chance>=10?'rate-md':'rate-lo';
      rateHtml=`<div class="hunt-dist-rate ${cls}">● ${it.chance}%</div>`;
    }else{
      const cls=it.rate==='高'?'rate-hi':it.rate==='低'?'rate-lo':'rate-md';
      rateHtml=`<div class="hunt-dist-rate ${cls}">● ${it.rate}</div>`;
    }
    return`<div class="hunt-dist-card" id="hunt-dist-${i}" onclick="selectDistPkm(${i})" style="animation-delay:${i*35}ms">
      <div class="hunt-dist-sel-mark">✓</div>
      <img src="${it.img||''}" alt="" onerror="this.style.display='none'">
      <div class="hunt-dist-name">${esc(it.name)}</div>
      ${rateHtml}
    </div>`;
  }).join('');
}

function selectDistPkm(idx){
  const pkm=_huntLocPkm[idx];if(!pkm)return;
  document.querySelectorAll('.hunt-dist-card').forEach((c,i)=>c.classList.toggle('selected',i===idx));
  _huntDistPkm=pkm;
  // 直接开始目标捕捉
  const sid=_curSid;
  const loc=_huntSelLoc.includes('|')?_huntSelLoc.split('|')[1]:'';
  const list=lsGet('pkm_hunt_'+sid)||[];
  let idx2=list.findIndex(t=>t.pkmId===pkm.id&&!t.done);
  if(idx2<0){
    list.push({pkmId:pkm.id,name:pkm.name,img:pkm.img,nature:'—',iv:'—',count:0,done:false,ts:Date.now(),loc});
    idx2=list.length-1;
    lsSet('pkm_hunt_'+sid,list);
    syncSeriesField(sid,'hunts',list);
    renderHuntList(sid);
  }
  openImmHunt(sid,idx2);
}

/* ── 捕捉记录列表 ── */
function renderHuntList(sid){
  const el=document.getElementById('hunt-list');if(!el)return;
  const list=lsGet('pkm_hunt_'+sid)||[];
  const active=list.filter(t=>!t.done);const done=list.filter(t=>t.done);
  if(!list.length){el.innerHTML='<div style="font-size:.78rem;color:var(--t3);text-align:center;padding:20px 0;font-family:\'DM Mono\',monospace">选择地点后点击宝可梦开始自由捕捉</div>';return;}
  const renderCard=(t,i)=>{
    const realIdx=list.indexOf(t);
    return`<div class="hunt-card${t.done?' done-card':''}">
      <img class="hunt-card-img" src="${t.img||''}" alt="" onerror="this.style.display='none'">
      <div class="hunt-card-info">
        <div class="hunt-card-name">${esc(t.name)}${t.done?' ✓':''}</div>
        ${t.loc?`<div class="hunt-card-loc">📍 ${esc(t.loc)}</div>`:''}
        <div class="hunt-card-count">${t.done?`共遭遇 ${t.count} 次后捕捉`:`已遭遇 <b>${t.count}</b> 次`}</div>
      </div>
      <div class="hunt-card-actions">
        ${!t.done?`<button class="hunt-enter-btn" onclick="openImmHunt('${sid}',${realIdx})">进入捕捉</button>`:`<span class="hunt-done-badge">已捕捉</span>`}
        <button class="hunt-del-btn" onclick="huntDel('${sid}',${realIdx})">✕</button>
      </div>
    </div>`;
  };
  el.innerHTML=(active.length?`<div class="hunt-group-lbl">🎯 进行中 (${active.length})</div>`+active.map(renderCard).join(''):'')
    +(done.length?`<div class="hunt-group-lbl" style="margin-top:10px">✓ 已捕捉 (${done.length})</div>`+done.map(renderCard).join(''):'');
}
function huntDel(sid,idx){
  if(!confirm('删除这个捕捉记录？'))return;
  const list=lsGet('pkm_hunt_'+sid)||[];list.splice(idx,1);lsSet('pkm_hunt_'+sid,list);renderHuntList(sid);syncSeriesField(sid,'hunts',list);
}

/* ============================
   📖 图鉴录入：种族值 + 性格 + 努力值AI推荐
   ============================ */
let _catchSelectedPkm=null,_catchSearchT=null,_catchBaseStats=null,_catchEvYields=null;

function initNatureSelect(id){
  const sel=document.getElementById(id);if(!sel||sel.options.length>1)return;
  sel.innerHTML=NATURES.map(n=>{
    const hint=n.up?`+${STAT_ZH[n.up]||n.up}/-${STAT_ZH[n.down]||n.down}`:'中性';
    return`<option value="${n.id}">${n.zh}（${hint}）</option>`;
  }).join('');
  sel.value='timid';
}

function searchCatchPkm(v){
  clearTimeout(_catchSearchT);
  const res=document.getElementById('catch-search-results');
  if(!v.trim()){res.classList.remove('open');return;}
  _catchSearchT=setTimeout(()=>doInlineSearch(v,res,'catch'),400);
}

function getCatchLocationPrefill(){
  const locBadge=document.getElementById('imm-loc');
  const ov=document.getElementById('ov-imm');
  const raw=locBadge?.textContent?.trim()||'';
  if(ov?.classList.contains('on')&&raw){
    return raw.replace(/^📍\s*/,'').trim();
  }
  return '';
}

function resetCatchForm(prefillLocation=''){
  const searchInp=document.getElementById('catch-search-inp');
  const nickInp=document.getElementById('catch-nickname');
  const locInp=document.getElementById('catch-location');
  const noteInp=document.getElementById('catch-note');
  const form=document.getElementById('catch-form-body');
  const preview=document.getElementById('catch-pkm-preview');
  const baseStats=document.getElementById('catch-basestats');
  const evYields=document.getElementById('catch-ev-yields');
  const aiBox=document.getElementById('catch-ai-result');
  if(searchInp)searchInp.value='';
  if(nickInp)nickInp.value='';
  if(locInp)locInp.value=prefillLocation||'';
  if(noteInp)noteInp.value='';
  if(form)form.style.display='none';
  if(preview)preview.innerHTML='';
  if(baseStats)baseStats.innerHTML='';
  if(evYields)evYields.innerHTML='';
  if(aiBox){
    aiBox.style.display='none';
    aiBox.textContent='';
  }
  _catchSelectedPkm=null;
  _catchBaseStats=null;
  _catchEvYields=null;
}

function getCatchLocalMeta(sid){
  const meta=lsGet('pkm_catch_meta_'+sid);
  return meta&&typeof meta==='object'?meta:{};
}

function setCatchLocalMeta(sid,meta){
  lsSet('pkm_catch_meta_'+sid,meta&&typeof meta==='object'?meta:{});
}

function getCatchExtra(catchRecord){
  const sid=catchRecord?.series_id||_curSid;
  const localMeta=getCatchLocalMeta(sid);
  const local=localMeta[catchRecord?.id]||{};
  return {
    location:catchRecord?.catch_location||catchRecord?.location_caught||local.location||'',
    note:catchRecord?.manual_note||catchRecord?.description_manual||local.note||''
  };
}

function isCatchSchemaCompatError(error){
  const msg=String(error?.message||'');
  return /column/i.test(msg)
    || /schema cache/i.test(msg)
    || /could not find .*catch_location/i.test(msg)
    || /could not find .*manual_note/i.test(msg)
    || /catch_location/i.test(msg)
    || /manual_note/i.test(msg);
}

async function selectCatchPkm(pkm){
  _catchSelectedPkm=pkm;
  document.getElementById('catch-search-inp').value=pkm.name;
  document.getElementById('catch-search-results').classList.remove('open');
  document.getElementById('catch-form-body').style.display='block';
  document.getElementById('catch-ai-result').style.display='none';
  document.getElementById('catch-nickname').value='';
  document.getElementById('catch-location').value=getCatchLocationPrefill();
  document.getElementById('catch-note').value='';
  document.getElementById('catch-pkm-preview').innerHTML=
    `<img src="${pkm.img}" alt="" onerror="this.style.display='none'">
     <div><div class="catch-pkm-header-name">${esc(pkm.name)}</div>
     <div class="catch-pkm-header-num">#${String(pkm.id).padStart(3,'0')}</div></div>`;
  document.getElementById('catch-basestats').innerHTML='<div style="font-size:.75rem;color:var(--t3)">加载种族值中…</div>';
  document.getElementById('catch-ev-yields').innerHTML='';
  try{
    const p=await fetchPkm(pkm.id);
    _catchBaseStats=p.stats;
    _catchEvYields=p.stats.filter(s=>s.effort>0);
    renderCatchBaseStats(p.stats,document.getElementById('catch-nature')?.value||null);
    const evText=_catchEvYields.length
      ?'击败该精灵可获得：'+_catchEvYields.map(s=>`${STAT_ZH[s.stat.name]||s.stat.name} +${s.effort}`).join('、')
      :'（该精灵无努力值产出）';
    document.getElementById('catch-ev-yields').textContent='EV产出 · '+evText;
  }catch(e){document.getElementById('catch-basestats').innerHTML='<div style="color:var(--danger);font-size:.8rem">种族值加载失败</div>';}
  updateCatchNatureHint();
}

function renderCatchBaseStats(stats,nature){
  const n=NATURES.find(x=>x.id===nature);
  document.getElementById('catch-basestats').innerHTML=
    `<div class="catch-stats-title">种族值（含性格修正）</div>`+
    stats.map(s=>{
      const val=s.base_stat;
      const isUp=n&&n.up===s.stat.name;const isDown=n&&n.down===s.stat.name;
      const eff=isUp?Math.floor(val*1.1):isDown?Math.floor(val*0.9):val;
      return statBar(s.stat.name,val)+(isUp||isDown?`<div style="font-size:.62rem;color:${isUp?'var(--acc2)':'var(--danger)'};font-family:'DM Mono',monospace;margin:-3px 0 3px 40px">${isUp?'▲':'▼'} 实际约${eff}</div>`:'');
    }).join('');
}

function updateCatchNatureHint(){
  if(!_catchBaseStats)return;
  const nature=document.getElementById('catch-nature')?.value;
  const n=NATURES.find(x=>x.id===nature);
  const hint=document.getElementById('catch-nature-hint');
  if(!hint)return;
  if(n&&n.up){
    hint.innerHTML=`<span style="color:var(--acc2)">▲ ${STAT_ZH[n.up]||n.up} +10%</span>&emsp;<span style="color:var(--danger)">▼ ${STAT_ZH[n.down]||n.down} -10%</span>`;
  }else{
    hint.innerHTML='<span style="color:var(--t3)">无增减（中性性格）</span>';
  }
  renderCatchBaseStats(_catchBaseStats,nature);
}

async function persistCatchRecord(){
  if(!_catchSelectedPkm){showToast('请先选择宝可梦');return false;}
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){showToast('请先登录');return false;}
  const sid=_curSid;
  const nature=document.getElementById('catch-nature')?.value||'serious';
  const nick=document.getElementById('catch-nickname')?.value?.trim()||'';
  const location=document.getElementById('catch-location')?.value?.trim()||'';
  const note=document.getElementById('catch-note')?.value?.trim()||'';
  const aiBox=document.getElementById('catch-ai-result');
  const aiRec=(aiBox&&aiBox.style.display!=='none')?aiBox.textContent:'';
  const saveBtn=document.getElementById('catch-save-btn')||document.querySelector('#ov-imm .btn-a');
  if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='保存中…';}
  const payload={
    user_id:session.user.id,series_id:sid,
    pkm_id:_catchSelectedPkm.id,pkm_name:_catchSelectedPkm.name,
    img:_catchSelectedPkm.img||null,nickname:nick||null,nature,
    base_stats:_catchBaseStats||null,ev_yields:_catchEvYields||null,
    ai_rec:aiRec||null,
    catch_location:location||null,
    manual_note:note||null
  };
  let row=null;
  let insertError=null;
  const insertRes=await db.from('pkm_catch_log').insert(payload).select().single();
  insertError=insertRes.error||null;
  row=insertRes.data||null;
  if(insertError&&isCatchSchemaCompatError(insertError)){
    const fallbackPayload={
      user_id:payload.user_id,series_id:payload.series_id,
      pkm_id:payload.pkm_id,pkm_name:payload.pkm_name,
      img:payload.img,nickname:payload.nickname,nature:payload.nature,
      base_stats:payload.base_stats,ev_yields:payload.ev_yields,ai_rec:payload.ai_rec
    };
    const fallbackRes=await db.from('pkm_catch_log').insert(fallbackPayload).select().single();
    insertError=fallbackRes.error||null;
    row=fallbackRes.data||null;
    if(row&&(location||note)){
      const localMeta=getCatchLocalMeta(sid);
      localMeta[row.id]={location,note};
      setCatchLocalMeta(sid,localMeta);
    }
  }else if(row){
    const localMeta=getCatchLocalMeta(sid);
    if(localMeta[row.id]){
      delete localMeta[row.id];
      setCatchLocalMeta(sid,localMeta);
    }
  }
  if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='保存记录';}
  if(insertError){showToast('保存失败：'+insertError.message);return false;}
  resetCatchForm(getCatchLocationPrefill());
  await loadCatchList(sid);
  await renderActiveCatches();
  showToast('已保存到图鉴录入');
  return true;
}

async function getCatchAIRec(){
  if(!_catchSelectedPkm||!_catchBaseStats){showToast('请先选择宝可梦');return;}
  const btn=document.getElementById('catch-ai-btn');btn.disabled=true;btn.textContent='AI分析中…';
  const sid=_curSid;const s=PKM_SERIES.find(x=>x.id===sid);
  const nature=document.getElementById('catch-nature').value;
  const natZh=getNatureZh(nature);
  const statsText=_catchBaseStats.map(st=>`${STAT_ZH[st.stat.name]||st.stat.name}:${st.base_stat}`).join(' / ');
  const evText=_catchEvYields?.length?_catchEvYields.map(x=>`${STAT_ZH[x.stat.name]||x.stat.name}+${x.effort}`).join('、'):'无产出';
  const prompt=`你是宝可梦培育专家。
精灵：${_catchSelectedPkm.name}（当前选择性格：${natZh}）
种族值：${statsText}
自身EV产出：${evText}
游戏版本：${s?.name||sid}（${s?.year||''}年）

请给出以下内容（纯文字，每段标题加【】）：

【PvE推荐性格】最适合通关的性格名 + 简要理由（30字内）
【PvE努力值方案】具体分配如HP252 速度252 特防6，说明思路（40字内）
【PvE刷值指南】在「${s?.name||'该版本'}」中，推荐去哪里刷哪些精灵来快速获得上述努力值（精灵名+产出能力+数量，列出2-4个）

【PvP推荐性格】主流对战性格 + 简要理由（30字内）
【PvP努力值方案】具体分配 + 思路（40字内）
【PvP刷值指南】在「${s?.name||'该版本'}」中的推荐刷值地点和精灵`;
  const box=document.getElementById('catch-ai-result');
  box.style.display='block';box.textContent='AI 分析中，请稍候…';
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:900,temperature:0.7}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI暂时无法响应）';
    box.textContent=reply;
  }catch(e){box.textContent='获取失败：'+e.message;}
  btn.disabled=false;btn.textContent='✦ AI推荐性格 + 努力值';
}

async function saveCatch(){
  await persistCatchRecord();
}

async function loadCatchList(sid){
  const el=document.getElementById('catch-list');if(!el)return;
  el.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0">加载中…</div>';
  const{data:{session}}=await db.auth.getSession();
  if(!session?.user){el.innerHTML='';return;}
  const{data,error}=await db.from('pkm_catch_log').select('*').eq('user_id',session.user.id).eq('series_id',sid).order('created_at',{ascending:false});
  if(error||!data){el.innerHTML='';return;}
  renderCatchList(data);
}

function renderCatchList(records){
  const el=document.getElementById('catch-list');if(!el)return;
  if(!records.length){el.innerHTML='<div style="font-size:.8rem;color:var(--t3);text-align:center;padding:16px 0">还没有录入记录，抓到好精灵快来记录吧</div>';return;}
  el.innerHTML=records.map(c=>{
    const natZh=getNatureZh(c.nature);
    const extra=getCatchExtra(c);
    const d=new Date(c.created_at);const ts=`${d.getMonth()+1}/${d.getDate()}`;
    const evStr=c.ev_yields?.length?c.ev_yields.map(x=>`${STAT_ZH[x.stat.name]||x.stat.name}+${x.effort}`).join(' '):'—';
    return`<div class="catch-card">
      <img src="${c.img||''}" alt="" onerror="this.style.display='none'">
      <div class="catch-card-body">
        <div class="catch-card-name">${esc(c.pkm_name)}${c.nickname?` <span style="color:var(--acc);font-size:.78rem">「${esc(c.nickname)}」</span>`:''}</div>
        <div class="catch-card-nature">${natZh}性格</div>
        <div class="catch-card-meta">EV产出 ${evStr} · ${ts}${extra.location?` · ${esc(extra.location)}`:''}</div>
        ${extra.note?`<div class="catch-card-note">${esc(extra.note)}</div>`:''}
        ${c.ai_rec?`<details style="margin-top:4px"><summary style="font-size:.7rem;color:var(--t3);cursor:pointer;font-family:'DM Mono',monospace">查看AI推荐方案</summary><div style="font-size:.75rem;color:var(--t2);white-space:pre-wrap;margin-top:4px;padding:6px;background:var(--bg);border-radius:3px;line-height:1.7">${esc(c.ai_rec)}</div></details>`:''}
      </div>
      <button class="catch-card-del" onclick="delCatch('${c.id}')">✕</button>
    </div>`;
  }).join('');
}

async function delCatch(id){
  if(!confirm('删除这条录入？'))return;
  const{data:{session}}=await db.auth.getSession();if(!session?.user)return;
  await db.from('pkm_catch_log').delete().eq('id',id).eq('user_id',session.user.id);
  const localMeta=getCatchLocalMeta(_curSid);
  if(localMeta[id]){
    delete localMeta[id];
    setCatchLocalMeta(_curSid,localMeta);
  }
  loadCatchList(_curSid);
  renderActiveCatches();
}

/* ============================
   🔍 通用内联宝可梦搜索
   ============================ */
async function doInlineSearch(v,resEl,mode){
  resEl.classList.add('open');
  resEl.innerHTML='<div class="pkm-inline-item" style="color:var(--t3);font-size:.78rem">搜索中…</div>';
  try{
    const q=v.trim().toLowerCase();
    let ids=[];
    // 中文名匹配
    const cnMatches=Object.entries(PKM_CN_TABLE).filter(([,name])=>name.includes(q)).slice(0,8);
    ids=cnMatches.map(([id])=>parseInt(id));
    // 英文名兜底
    if(!ids.length){
      const r=await fetch(`${POKEAPI}/pokemon?limit=2000`);const d=await r.json();
      ids=d.results.filter(x=>x.name.includes(q)).slice(0,8).map(x=>parseInt(x.url.split('/').slice(-2)[0]));
    }
    if(!ids.length){resEl.innerHTML='<div class="pkm-inline-item" style="color:var(--t3)">未找到匹配精灵</div>';return;}
    const items=await Promise.all(ids.map(async id=>{
      const p=await fetchPkm(id);
      const cn=PKM_CN_TABLE[id]||(await getPkmCNName(id,p.name))||p.name;
      const img=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||'';
      return{id,name:cn,img};
    }));
    // 存入全局数组，onclick 只传 index，避免 JSON 中的引号破坏 HTML 属性
    _inlineSearchResults=items;
    resEl.innerHTML=items.map((it,i)=>`<div class="pkm-inline-item" onclick="selectInlinePkm(${i},'${mode}')">
      <img src="${it.img}" alt="" onerror="this.style.display='none'">
      <div><div class="pkm-inline-item-name">${esc(it.name)}</div><div class="pkm-inline-item-num">#${String(it.id).padStart(3,'0')}</div></div>
    </div>`).join('');
  }catch(e){resEl.innerHTML=`<div class="pkm-inline-item" style="color:var(--danger)">搜索失败</div>`;}
}
let _inlineSearchResults=[];
function selectInlinePkm(idx,mode){
  const pkm=_inlineSearchResults[idx];if(!pkm)return;
  if(mode==='party')addToParty(_curSid,pkm);
  else if(mode==='catch')selectCatchPkm(pkm);
}

/* ============================
   🎯 沉浸式狩猎界面
   ============================ */
let _immSid='',_immIdx=-1;

async function openImmHunt(sid,idx){
  const list=lsGet('pkm_hunt_'+sid)||[];
  const t=list[idx];if(!t||t.done)return;
  _immSid=sid;_immIdx=idx;
  _huntActionsLocked=false;

  const natZh=getNatureZh(t.nature);
  const locBadge=document.getElementById('hunt-imm-loc');
  if(locBadge)locBadge.textContent='📍 '+(t.loc||'野外');

  document.getElementById('hunt-imm-name').textContent=t.name;
  document.getElementById('hunt-imm-target').textContent=
    NATURES.some(n=>n.id===t.nature)?natZh+'性格 目标':'🎯 '+t.name;
  document.getElementById('hunt-imm-num').textContent=t.count;
  document.getElementById('hunt-imm-sprite').src=t.img||'';
  document.getElementById('hunt-imm-bg').style.backgroundImage=`url(${t.img||''})`;
  document.getElementById('hunt-imm-success').style.display='none';
  document.getElementById('hunt-nature-pick').style.display='none';

  // 填充区域精灵分布网格
  renderHuntAreaGrid(t);

  // 入场动画
  const sp=document.getElementById('hunt-imm-sprite');
  sp.classList.remove('fight-hit','run-away','shiny');void sp.offsetWidth;
  sp.classList.add('enter-new');setTimeout(()=>sp.classList.remove('enter-new'),500);

  const ov=document.getElementById('ov-hunt-imm');
  ov.classList.add('on');
  document.body.style.overflow='hidden';
  startHuntParticles();

  // 高清图（后台拉取）
  try{
    const p=await fetchPkm(t.pkmId);
    const art=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||t.img;
    document.getElementById('hunt-imm-sprite').src=art;
    document.getElementById('hunt-imm-bg').style.backgroundImage=`url(${art})`;
    document.getElementById('hunt-success-sprite').src=art;
  }catch(e){}
}

function getHuntLocLabel(){
  return _huntSelLoc?.includes('|')?_huntSelLoc.split('|')[1]:'野外';
}
function setHuntHeroForCapture(pkm,label,count){
  const locBadge=document.getElementById('imm-loc');
  if(locBadge)locBadge.textContent='📍 '+getHuntLocLabel();
  const nameEl=document.getElementById('hunt-imm-name');
  const targetEl=document.getElementById('hunt-imm-target');
  const numEl=document.getElementById('hunt-imm-num');
  const spriteEl=document.getElementById('hunt-imm-sprite');
  const successEl=document.getElementById('hunt-success-sprite');
  if(nameEl)nameEl.textContent=pkm?.name||'';
  if(targetEl)targetEl.textContent=label||'自由捕捉';
  if(numEl)numEl.textContent=String(count||0);
  if(spriteEl)spriteEl.src=pkm?.img||'';
  if(successEl)successEl.src=pkm?.img||'';
}
function startFreeCapture(pkm){
  if(!pkm)return;
  const sid=_immSid||_curSid;
  const loc=getHuntLocLabel();
  const list=lsGet('pkm_hunt_'+sid)||[];
  list.push({pkmId:pkm.id,name:pkm.name,img:pkm.img,nature:'any',iv:'—',count:1,done:false,ts:Date.now(),loc,free:true});
  _immSid=sid;
  _immIdx=list.length-1;
  lsSet('pkm_hunt_'+sid,list);
  debounceSyncHunts(sid,list);
  renderHuntList(sid);
  setHuntHeroForCapture(pkm,'自由捕捉',1);
  renderHuntAreaGrid(list[_immIdx]);
  _huntActionsLocked=true;
  showHuntNaturePick();
}

// 填充捕捉沉浸区域精灵网格
function renderHuntAreaGrid(t){
  const areaEl=document.getElementById('hunt-area-section');
  const grid=document.getElementById('hunt-area-grid');
  const actions=document.getElementById('hunt-battle-actions');
  if(!grid)return;
  if(!_huntLocPkm.length){
    // 无分布数据：有激活目标才显示传统按钮，否则隐藏
    if(areaEl)areaEl.style.display='none';
    if(actions)actions.style.display=(t&&!t.done)?'flex':'none';
    return;
  }
  if(areaEl)areaEl.style.display='flex';
  if(actions)actions.style.display='none';  // 有分布则隐藏传统按钮
  const label=areaEl?.querySelector('.hunt-area-label');
  if(label)label.textContent=t&&!t.done?'目标捕捉：点击目标进入捕捉，其他会逃跑':'自由捕捉：点击遇到的宝可梦记录捕捉';
  grid.innerHTML=_huntLocPkm.map((pkm,i)=>{
    const isTarget=t&&(pkm.id===t.pkmId||pkm.name===t.name);
    return`<div class="hunt-area-card${isTarget?' hunt-area-target':''}" onclick="huntEncounterFromGrid(${i})" title="${esc(pkm.name)}">
      <button class="hunt-area-goal-btn" onclick="setHuntGoalFromGrid(${i},event)" title="${isTarget?'当前目标':'设为捕捉目标'}">${isTarget?'目标':'设为目标'}</button>
      <img src="${pkm.img||''}" alt="${esc(pkm.name)}" onerror="this.style.opacity='.3'">
      <div class="hunt-area-card-name">${esc(pkm.name)}</div>
      ${isTarget?'<div class="hunt-area-target-ring"></div>':''}
    </div>`;
  }).join('');
}

/* ── 捕捉目标设定弹窗 ── */
let _huntGoalPkmIdx=-1;
function openHuntGoalSetup(pkmIdx){
  _huntGoalPkmIdx=pkmIdx;
  const pkm=_huntLocPkm[pkmIdx];if(!pkm)return;
  const el=document.getElementById('hunt-goal-setup');if(!el)return;
  document.getElementById('hgs-sprite').src=pkm.img||'';
  document.getElementById('hgs-name').textContent=pkm.name;
  document.getElementById('hgs-loc').textContent=_huntSelLoc.includes('|')?_huntSelLoc.split('|')[1]:'';
  initNatureSelect('hgs-nature');
  document.getElementById('hgs-iv').value='';
  el.style.display='flex';
}
function closeHuntGoalSetup(){
  const el=document.getElementById('hunt-goal-setup');if(el)el.style.display='none';
  _huntGoalPkmIdx=-1;
}
function setHuntGoalFromGrid(pkmIdx,ev){
  ev?.stopPropagation?.();
  if(_huntActionsLocked)return;
  openHuntGoalSetup(pkmIdx);
}
function confirmHuntGoalSetup(){
  const pkm=_huntLocPkm[_huntGoalPkmIdx];if(!pkm)return;
  const nature=document.getElementById('hgs-nature')?.value||'—';
  const iv=document.getElementById('hgs-iv')?.value?.trim()||'—';
  const loc=_huntSelLoc.includes('|')?_huntSelLoc.split('|')[1]:'';
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  const newT={pkmId:pkm.id,name:pkm.name,img:pkm.img,nature,iv,count:0,done:false,ts:Date.now(),loc};
  list.push(newT);_immIdx=list.length-1;
  lsSet('pkm_hunt_'+_immSid,list);
  syncSeriesField(_immSid,'hunts',list);renderHuntList(_immSid);
  const locBadge=document.getElementById('imm-loc');if(locBadge&&loc)locBadge.textContent='📍 '+loc;
  const natZh=getNatureZh(nature);
  document.getElementById('hunt-imm-name').textContent=pkm.name;
  document.getElementById('hunt-imm-target').textContent='🎯 '+pkm.name+(nature&&nature!=='—'?' · '+natZh+'性格':'');
  document.getElementById('hunt-imm-sprite').src=pkm.img||'';
  document.getElementById('hunt-success-sprite').src=pkm.img||'';
  document.getElementById('hunt-imm-num').textContent='0';
  closeHuntGoalSetup();
  renderHuntAreaGrid(newT);
}

// 点击区域精灵：无目标 → 自由捕捉；目标 → 遭遇；非目标 → 逃跑
function huntEncounterFromGrid(idx){
  if(_huntActionsLocked)return;
  const pkm=_huntLocPkm[idx];if(!pkm)return;
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  const t=list[_immIdx];
  // 无激活目标 → 自由捕捉，不要求先设目标
  if(!t||t.done){
    startFreeCapture(pkm);
    return;
  }
  const isTarget=pkm.id===t.pkmId||pkm.name===t.name;

  if(isTarget){
    // 遭遇目标精灵！计数 + 直接进入捕捉性格选择
    _huntActionsLocked=true;
    const ov=document.getElementById('ov-imm');
    const fl=document.createElement('div');fl.className='hunt-screen-flash-red';if(ov)ov.appendChild(fl);setTimeout(()=>fl.remove(),280);
    const sp=document.getElementById('hunt-imm-sprite');
    sp.classList.remove('fight-hit','run-away','shiny');void sp.offsetWidth;sp.classList.add('fight-hit');
    _huntCountUp();_checkShiny();
    setTimeout(()=>{sp.classList.remove('fight-hit');_huntActionsLocked=false;showHuntNaturePick();},420);
  }else{
    // 非目标 → 一闪而过，逃跑
    _huntActionsLocked=true;
    const card=document.querySelectorAll('.hunt-area-card')[idx];
    if(card){card.classList.add('hunt-area-flash');setTimeout(()=>card.classList.remove('hunt-area-flash'),350);}
    showHuntNarration('不是目标，逃跑了……');
    setTimeout(()=>{_huntActionsLocked=false;},380);
  }
}

function closeImmHunt(){
  stopHuntParticles();
  const ov=document.getElementById('ov-hunt-imm');
  ov.classList.remove('on');
  document.body.style.overflow='';
  _huntActionsLocked=false;
}

/* ── 战斗动作 ── */
function _huntCountUp(){
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  if(!list[_immIdx]||list[_immIdx].done)return 0;
  list[_immIdx].count++;
  lsSet('pkm_hunt_'+_immSid,list);
  const cnt=list[_immIdx].count;
  const numEl=document.getElementById('hunt-imm-num');
  numEl.textContent=cnt;numEl.classList.remove('pop');void numEl.offsetWidth;numEl.classList.add('pop');
  if(HUNT_MILESTONE_TEXT[cnt])showHuntNarration(HUNT_MILESTONE_TEXT[cnt]);
  debounceSyncHunts(_immSid,list);
  return cnt;
}

function _checkShiny(){
  if(Math.random()<1/4096){
    const sp=document.getElementById('hunt-imm-sprite');
    if(sp&&!sp.classList.contains('shiny')){
      sp.classList.add('shiny');
      showHuntNarration('✨ 等等…… 闪 光 ！！！');
      setTimeout(()=>sp.classList.remove('shiny'),5000);
    }
  }
}

function huntActionFight(){
  if(_huntActionsLocked)return;
  _huntActionsLocked=true;
  // 红闪 + 精灵抖动
  const ov=document.getElementById('ov-imm');
  const fl=document.createElement('div');fl.className='hunt-screen-flash-red';if(ov)ov.appendChild(fl);setTimeout(()=>fl.remove(),280);
  const sp=document.getElementById('hunt-imm-sprite');
  sp.classList.remove('fight-hit','enter-new');void sp.offsetWidth;sp.classList.add('fight-hit');
  _huntCountUp();
  _checkShiny();
  setTimeout(()=>{sp.classList.remove('fight-hit');_huntActionsLocked=false;},420);
}

function huntActionRun(){
  if(_huntActionsLocked)return;
  _huntActionsLocked=true;
  _huntCountUp();
  const sp=document.getElementById('hunt-imm-sprite');
  sp.classList.remove('fight-hit','enter-new','shiny');void sp.offsetWidth;
  sp.classList.add('run-away');
  showHuntNarration('逃跑了……');
  setTimeout(()=>{
    sp.classList.remove('run-away');void sp.offsetWidth;
    sp.classList.add('enter-new');
    _checkShiny();
    setTimeout(()=>{sp.classList.remove('enter-new');_huntActionsLocked=false;},460);
  },420);
}

function huntActionCatch(){
  if(_huntActionsLocked)return;
  _huntActionsLocked=true;
  showHuntNaturePick();
}

function showHuntNaturePick(){
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  const t=list[_immIdx];if(!t)return;
  const pick=document.getElementById('hunt-nature-pick');if(!pick)return;
  const targetEl=document.getElementById('hunt-np-target');
  const hasNature=t.nature&&t.nature!=='any'&&t.nature!=='—'&&NATURES.some(n=>n.id===t.nature);
  if(targetEl)targetEl.textContent=t.free?'自由捕捉：记录这次遇到的宝可梦':(hasNature?'目标性格：'+getNatureZh(t.nature):'无特定性格目标');
  // 渲染性格网格
  const grid=document.getElementById('hunt-np-grid');
  if(grid){
    grid.innerHTML=NATURES.map(n=>{
      const hint=n.up?`+${STAT_ZH[n.up]||n.up}`:'中性';
      const isTarget=hasNature&&n.id===t.nature;
      return`<div class="hunt-np-btn${isTarget?' hunt-np-target-nat':''}" onclick="huntSelectNature('${n.id}')">${n.zh}<span class="hunt-np-hint">${hint}</span></div>`;
    }).join('');
  }
  document.getElementById('hunt-battle-actions').style.display='none';
  pick.style.display='flex';
}

function cancelHuntNaturePick(){
  document.getElementById('hunt-nature-pick').style.display='none';
  const actions=document.getElementById('hunt-battle-actions');
  if(actions)actions.style.display=_huntLocPkm.length?'none':'flex';
  _huntActionsLocked=false;
}

function huntSelectNature(natId){
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  const t=list[_immIdx];if(!t)return;
  const hasNature=t.nature&&t.nature!=='any'&&t.nature!=='—'&&NATURES.some(n=>n.id===t.nature);
  document.getElementById('hunt-nature-pick').style.display='none';
  if(!hasNature||natId===t.nature){
    // 性格匹配（或无目标性格）→ 捕捉成功
    confirmImmCatch();
  } else {
    // 性格不对 → 继续捕捉
    _huntCountUp();
    const actions=document.getElementById('hunt-battle-actions');
    if(actions)actions.style.display=_huntLocPkm.length?'none':'flex';
    _huntActionsLocked=false;
    const natZh=getNatureZh(natId);
    const targetZh=getNatureZh(t.nature);
    showHuntNarration(`${natZh}性格……不是目标${targetZh}，继续！`);
    // 新精灵入场动画
    const sp=document.getElementById('hunt-imm-sprite');
    sp.classList.remove('fight-hit','run-away','shiny');void sp.offsetWidth;
    sp.classList.add('enter-new');setTimeout(()=>sp.classList.remove('enter-new'),500);
  }
}

/* ── 粒子背景 ── */
function startHuntParticles(){
  stopHuntParticles();
  const container=document.getElementById('hunt-imm-particles');if(!container)return;
  container.innerHTML='';
  const colors=['rgba(200,144,64,.6)','rgba(90,184,154,.5)','rgba(255,255,255,.35)','rgba(160,100,220,.4)','rgba(90,140,220,.4)'];
  let active=0;
  _huntParticleTimer=setInterval(()=>{
    if(active>40)return;
    const el=document.createElement('div');el.className='hunt-particle';
    const size=2+Math.random()*4;
    const dur=3+Math.random()*4;
    const dx=(Math.random()-0.5)*70;
    el.style.cssText=`left:${Math.random()*100}%;bottom:${5+Math.random()*40}%;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};--pdx:${dx}px;animation-duration:${dur}s;`;
    container.appendChild(el);active++;
    setTimeout(()=>{el.remove();active--;},dur*1000);
  },180);
}
function stopHuntParticles(){
  if(_huntParticleTimer){clearInterval(_huntParticleTimer);_huntParticleTimer=null;}
  const c=document.getElementById('hunt-imm-particles');if(c)c.innerHTML='';
}

function spawnBall(x,y){
  const el=document.createElement('div');
  el.className='hunt-ball';
  el.style.left=x+'px';
  el.style.top=y+'px';
  el.textContent='⚫';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),600);
}

function spawnFlash(){
  const el=document.createElement('div');
  el.className='hunt-flash';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),200);
}

function confirmImmCatch(){
  const list=lsGet('pkm_hunt_'+_immSid)||[];
  const t=list[_immIdx];if(!t)return;
  t.done=true;
  lsSet('pkm_hunt_'+_immSid,list);
  syncSeriesField(_immSid,'hunts',list);

  // 显示成功动画层
  const suc=document.getElementById('hunt-imm-success');
  document.getElementById('hunt-success-name').textContent=t.name;
  document.getElementById('hunt-success-count').textContent='共遭遇 '+t.count+' 次';
  spawnCaptureBeam();
  setTimeout(()=>{spawnSparks();suc.style.display='flex';},400);

  // 3秒后关闭（光束0.4s + 成功动画2.6s）
  setTimeout(()=>{
    closeImmHunt();
    renderHuntList(_immSid);
    renderActiveCatches();
    showToast('恭喜捕捉到 '+t.name+'！共遭遇 '+t.count+' 次');
  },3000);
}

function spawnSparks(){
  const container=document.getElementById('hunt-success-sparks');
  container.innerHTML='';
  const colors=['#f0c040','#5ab89a','#a0c8f0','#ff80ab','#c890ff','#ffffff'];
  const cx=window.innerWidth/2,cy=window.innerHeight/2;
  for(let i=0;i<40;i++){
    const el=document.createElement('div');
    el.className='spark';
    const angle=Math.random()*Math.PI*2;
    const dist=80+Math.random()*200;
    el.style.cssText=`
      left:${cx}px;top:${cy}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --dx:${Math.cos(angle)*dist}px;
      --dy:${Math.sin(angle)*dist}px;
      animation-delay:${Math.random()*0.3}s;
      animation-duration:${0.6+Math.random()*0.6}s;
      width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;
    `;
    container.appendChild(el);
  }
}


/* ================================================================
   💪 训练模式（努力值 EV 追踪）
   ================================================================ */
const EV_STATS=[
  {key:'hp',zh:'HP',color:'#e05555'},
  {key:'attack',zh:'攻击',color:'#e08840'},
  {key:'defense',zh:'防御',color:'#b0c040'},
  {key:'special-attack',zh:'特攻',color:'#7070e0'},
  {key:'special-defense',zh:'特防',color:'#50b870'},
  {key:'speed',zh:'速度',color:'#e060a0'},
];
const EV_MAX_STAT=252,EV_MAX_TOTAL=510;

let _trainSid='';
let _trainPkmData=null;   // {name,id,img,nature}
let _trainEVs={hp:0,attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0};
let _trainSelLoc='';      // "sid|loc"
let _trainSelEncounterKey=''; // FRLG 直接选中的 encounter key
let _trainDistCache={};   // "sid|loc" → [{id,name,img,evYields:{hp,attack,...}}]
let _trainLocPkm=[];

function initTrainTab(sid){
  _trainSid=sid;
  // 显示队伍
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];while(party.length<6)party.push(null);
  const slots=document.getElementById('train-pkm-slots');if(!slots)return;
  const filledParty=party.filter(p=>p);
  if(!filledParty.length){
    slots.innerHTML='<div style="font-size:.78rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">请先在「队伍」Tab 添加宝可梦</div>';
  } else {
    slots.innerHTML=filledParty.map((p,i)=>`
      <div class="train-pkm-slot${_trainPkmData?.id===p.pkmId?' selected':''}" onclick="selectTrainPkm(${i})">
        <img src="${p.img||''}" alt="" onerror="this.style.display='none'">
        <div class="train-pkm-slot-name">${esc(p.name)}</div>
        ${p.nick?`<div class="train-pkm-slot-nick">「${esc(p.nick)}」</div>`:''}
        ${p.lv?`<div class="train-pkm-slot-lv">Lv.${esc(p.lv)}</div>`:''}
      </div>`).join('');
  }
  // 地点选择（复用 SERIES_LOCATIONS）
  const locs=SERIES_LOCATIONS[sid];
  const locRow=document.getElementById('train-loc-chips');
  const noLoc=document.getElementById('train-no-loc');
  if(locRow){
    if(!locs?.length){locRow.innerHTML='';if(noLoc)noLoc.style.display='block';}
    else{
      if(noLoc)noLoc.style.display='none';
      locRow.innerHTML=locs.map(l=>`<div class="hunt-loc-chip" onclick="selectTrainLoc('${l.replace(/'/g,'\\\'')}')" data-loc="${esc(l)}">${esc(l)}</div>`).join('');
      // 恢复上次选择
      if(_trainSelLoc.startsWith(sid+'|')){
        const pl=_trainSelLoc.split('|')[1];
        const chip=locRow.querySelector(`[data-loc="${pl}"]`);
        if(chip)chip.classList.add('on');
      }
    }
  }
  // 恢复当前精灵 EV 面板
  if(_trainPkmData)renderTrainEVs();
  // 恢复分布
  if(_trainSelLoc.startsWith(sid+'|')&&_trainDistCache[_trainSelLoc]){
    const distSec=document.getElementById('train-dist-section');
    if(distSec)distSec.style.display='block';
    const cachedT=_trainDistCache[_trainSelLoc];renderTrainDist(cachedT,cachedT[0]?.official===true);
    const btn=document.getElementById('train-dist-btn');if(btn)btn.style.display='none';
    const title=document.getElementById('train-dist-title');
    if(title)title.textContent=_trainSelLoc.split('|')[1]+' 精灵分布 & 努力值';
  }
}

function selectTrainPkm(slotIdx){
  const sid=_trainSid;
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];while(party.length<6)party.push(null);
  const filledParty=party.filter(p=>p);
  const p=filledParty[slotIdx];if(!p)return;
  const partyIdx=party.findIndex(x=>x===p);
  _trainPkmData={name:p.name,id:p.pkmId,img:p.img,nick:p.nick,lv:p.lv,partyIdx};
  // 载入或初始化 EV
  const saved=lsGet('pkm_train_ev_'+sid+'_'+p.pkmId);
  _trainEVs=saved||{hp:0,attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0};
  // 高亮选中
  document.querySelectorAll('.train-pkm-slot').forEach((el,i)=>el.classList.toggle('selected',i===slotIdx));
  const evPanel=document.getElementById('train-ev-panel');if(evPanel)evPanel.style.display='block';
  const aiSec=document.getElementById('train-ai-result');if(aiSec)aiSec.style.display='none';
  renderTrainEVs();
  updateImmTrainPlaceholder();
}

function renderTrainEVs(){
  const bars=document.getElementById('train-ev-bars');if(!bars)return;
  const totalUsed=Object.values(_trainEVs).reduce((a,b)=>a+b,0);
  const remainTotal=Math.max(0,EV_MAX_TOTAL-totalUsed);
  bars.innerHTML=EV_STATS.map(s=>{
    const v=_trainEVs[s.key]||0;
    const pct=Math.min(100,v/EV_MAX_STAT*100);
    const over=v>EV_MAX_STAT;
    return`<div class="train-ev-row">
      <div class="train-ev-lbl">${s.zh}</div>
      <div class="train-ev-bar-wrap">
        <div class="train-ev-bar-fill" style="width:${pct}%;background:${s.color};${over?'box-shadow:0 0 6px '+s.color:''}"></div>
      </div>
      <div class="train-ev-val" style="color:${over?'var(--danger)':v>=EV_MAX_STAT?s.color:'var(--t2)'}">${v}<span style="font-size:.55rem;color:var(--t3)">/252</span></div>
    </div>`;
  }).join('');
  const totEl=document.getElementById('train-ev-total');
  if(totEl)totEl.innerHTML=`<span class="train-ev-total-num" style="color:${totalUsed>EV_MAX_TOTAL?'var(--danger)':totalUsed>=480?'var(--acc2)':'var(--t2)'}">${totalUsed}</span><span style="color:var(--t3)">/510</span>　<span style="font-size:.68rem;color:var(--t3)">剩余 ${remainTotal}</span>`;
}

function resetTrainEVs(){
  if(!_trainPkmData)return;
  _trainEVs={hp:0,attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0};
  lsSet('pkm_train_ev_'+_trainSid+'_'+_trainPkmData.id,_trainEVs);
  debounceSyncTrainEVs(_trainSid);
  renderTrainEVs();showToast('EV 已重置');
}

function getBoostMultiplier(){
  const v=document.getElementById('train-boost-sel')?.value||'1';
  if(v==='2b'||v==='2p')return 2;
  if(v==='4')return 4;
  return 1;
}

/* 击败精灵 → 累加 EV */
function beatPokemon(idx){
  const pkm=_trainLocPkm[idx];if(!pkm||!_trainPkmData)return;
  const mult=getBoostMultiplier();
  const totalBefore=Object.values(_trainEVs).reduce((a,b)=>a+b,0);
  if(totalBefore>=EV_MAX_TOTAL){showToast('EV 已满 510，无法再增加！');return;}
  let added=false;
  for(const [stat,ev] of Object.entries(pkm.evYields)){
    if(!ev)continue;
    const gain=ev*mult;
    const curTotal=Object.values(_trainEVs).reduce((a,b)=>a+b,0);
    const actualGain=Math.min(gain,EV_MAX_TOTAL-curTotal,EV_MAX_STAT-(_trainEVs[stat]||0));
    if(actualGain>0){_trainEVs[stat]=(_trainEVs[stat]||0)+actualGain;added=true;}
  }
  if(!added){showToast('EV 容量已满');return;}
  lsSet('pkm_train_ev_'+_trainSid+'_'+_trainPkmData.id,_trainEVs);
  debounceSyncTrainEVs(_trainSid);
  renderTrainEVs();
  // 动画反馈
  const card=document.getElementById('train-card-'+idx);
  if(card){card.classList.add('beat-flash');setTimeout(()=>card.classList.remove('beat-flash'),400);}
  // 显示获得的EV
  const evText=Object.entries(pkm.evYields).filter(([,v])=>v>0).map(([k,v])=>{
    const s=EV_STATS.find(x=>x.key===k);return`${s?.zh||k}+${v*mult}`;
  }).join(' ');
  showToast(`${pkm.name}  ${evText}`);
}

function selectTrainLocFromMap(loc,encounterKey){
  _trainSelEncounterKey=encounterKey||'';
  selectTrainLoc(loc);
}
function selectTrainLoc(loc){
  const sid=_trainSid;
  _trainSelEncounterKey='';
  _trainSelLoc=sid+'|'+loc;
  document.querySelectorAll('#train-loc-chips .hunt-loc-chip').forEach(c=>c.classList.toggle('on',c.dataset.loc===loc));
  const distSec=document.getElementById('train-dist-section');
  const distTitle=document.getElementById('train-dist-title');
  if(distSec)distSec.style.display='block';
  if(distTitle)distTitle.textContent=loc+' 精灵分布 & 努力值';
  const cacheKey=_trainSelLoc;
  if(_trainDistCache[cacheKey]){
    const cachedTL=_trainDistCache[cacheKey];renderTrainDist(cachedTL,cachedTL[0]?.official===true);
    const btn=document.getElementById('train-dist-btn');if(btn)btn.style.display='none';
  } else {
    const grid=document.getElementById('train-dist-grid');if(grid)grid.innerHTML='';
    const btn=document.getElementById('train-dist-btn');if(btn){btn.style.display='';btn.disabled=false;btn.textContent='✦ 获取';}
  }
}

async function loadTrainDistribution(){
  const cacheKey=_trainSelLoc;
  if(!cacheKey?.includes('|')){showToast('请先选择地点');return;}
  const[sid,loc]=cacheKey.split('|');
  const btn=document.getElementById('train-dist-btn');
  const grid=document.getElementById('train-dist-grid');
  if(btn){btn.disabled=true;btn.textContent='获取中…';}
  // FRLG：直接用本地 PokeAPI 静态数据
  if(sid==='firered-leafgreen'&&typeof FRLG_ENCOUNTERS!=='undefined'){
    const entry=(_trainSelEncounterKey&&FRLG_ENCOUNTERS[_trainSelEncounterKey])||Object.values(FRLG_ENCOUNTERS).find(e=>e.zh===loc);
    if(entry&&entry.encounters?.length){
      if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">加载精灵数据…</div>';
      const items=[];
      for(const enc of [...entry.encounters].sort((a,b)=>b.rate-a.rate).slice(0,16)){
        try{
          const p=await fetchPkm(enc.slug);
          const id=p.id;
          const cnName=PKM_CN_TABLE[id]||p.name;
          const img=p.sprites?.front_default||'';
          const evYields={};for(const st of(p.stats||[])){if(st.effort>0)evYields[st.stat.name]=st.effort;}
          if(!Object.keys(evYields).length)evYields['hp']=1;
          items.push({id,name:cnName,img,evYields,chance:enc.rate,rate:enc.rate>=30?'高':enc.rate>=10?'中':'低',official:true,versions:enc.versions,methods:enc.methods});
        }catch(e){}
      }
      if(items.length){
        _trainDistCache[cacheKey]=items;
        renderTrainDist(items,true,'PokeAPI');
        if(btn)btn.style.display='none';
        return;
      }
    }
  }
  if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">正在从 52poke 读取「'+loc+'」精灵分布…</div>';
  // 优先 52poke
  const wiki52t=await fetch52PokeLocDistribution(loc);
  if(wiki52t){
    _trainDistCache[cacheKey]=wiki52t;
    renderTrainDist(wiki52t,true);
    if(btn)btn.style.display='none';
    return;
  }
  // 回退 AI（名单 → PokéAPI 努力值）
  if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">52poke 暂无数据，AI 生成名单并读取努力值…</div>';
  const s=PKM_SERIES.find(x=>x.id===sid);
  const prompt=`宝可梦游戏「${s?.name||sid}」中「${loc}」可以遇到的精灵，请列出10只，每行一只，只写精灵中文名，不要编号不要其他内容。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:120,temperature:0.5}})});
    const data=await res.json();
    const txt=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'';
    const names=txt.split('\n').map(l=>l.trim().replace(/^[\d\.\-、]+/,'')).filter(Boolean).slice(0,12);
    const rev=getPkmCnRev();
    const items=[];
    if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--t3);padding:8px 0;font-family:\'DM Mono\',monospace">从 PokéAPI 读取努力值（'+names.length+' 只）…</div>';
    for(const cnName of names){
      const id=rev[cnName];if(!id)continue;
      try{
        const p=await fetchPkm(id);
        const img=p.sprites?.front_default||'';
        const evYields={};
        for(const st of(p.stats||[])){if(st.effort>0)evYields[st.stat.name]=st.effort;}
        if(!Object.keys(evYields).length)evYields['hp']=1;
        items.push({id,name:cnName,img,evYields,official:false});
      }catch(e){}
    }
    if(!items.length){
      if(grid)grid.innerHTML='<div style="font-size:.75rem;color:var(--danger)">未能识别精灵名称，请重试</div>';
      if(btn){btn.disabled=false;btn.textContent='↺ 重试';}
      return;
    }
    _trainDistCache[cacheKey]=items;
    renderTrainDist(items,false);
    if(btn)btn.style.display='none';
  }catch(e){
    if(grid)grid.innerHTML=`<div style="font-size:.75rem;color:var(--danger)">获取失败：${e.message}</div>`;
    if(btn){btn.disabled=false;btn.textContent='↺ 重试';}
  }
}

/* ============================
   ⚡ 沉浸式训练界面
   ============================ */
let _trainImmParticleTimer=null;
let _trainImmSession=null;
let _trainImmTimer=null;

function _trainEmptyStats(){
  return {beats:0,counts:{},evGains:{hp:0,attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0}};
}
function _trainImmFmtTime(sec){
  sec=Math.max(0,Math.floor(sec||0));
  const m=Math.floor(sec/60),s=sec%60,h=Math.floor(m/60);
  return h>0?`${String(h).padStart(2,'0')}:${String(m%60).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function _trainImmEnsureSession(){
  if(!_trainImmSession){
    _trainImmSession={startedAt:Date.now(),ended:false,..._trainEmptyStats()};
  }
  _trainImmStartTimer();
  _trainImmRenderSession();
}
function _trainImmStartTimer(){
  if(_trainImmTimer)return;
  _trainImmTimer=setInterval(_trainImmRenderSession,1000);
}
function _trainImmStopTimer(){
  if(_trainImmTimer){clearInterval(_trainImmTimer);_trainImmTimer=null;}
}
function _trainImmElapsedSec(){
  if(!_trainImmSession)return 0;
  return Math.floor(((Date.now())-_trainImmSession.startedAt)/1000);
}
function _trainImmTopCounts(max){
  const counts=_trainImmSession?.counts||{};
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,max||4).map(([name,n])=>`${name}×${n}`);
}
function _trainImmEvGainText(){
  const gains=_trainImmSession?.evGains||{};
  return EV_STATS.map(s=>({label:s.zh,val:gains[s.key]||0})).filter(x=>x.val>0).map(x=>`${x.label}+${x.val}`).join(' / ');
}
function _trainImmRenderSession(){
  const timer=document.getElementById('train-imm-timer');
  const count=document.getElementById('train-imm-beat-count');
  const partner=document.getElementById('train-imm-partner-link');
  if(timer)timer.textContent=_trainImmFmtTime(_trainImmElapsedSec());
  if(count)count.textContent=String(_trainImmSession?.beats||0);
  if(partner){
    const hasPartner=typeof partnerData!=='undefined'&&!!partnerData;
    partner.textContent=hasPartner?'伙伴同步中：结束训练后结算经验':'未选择伙伴：仅记录本次训练';
  }
}
function _trainImmResetSummary(){
  const box=document.getElementById('train-imm-summary');
  if(box){box.style.display='none';box.innerHTML='';}
}
function _trainImmRecordBeat(pkm,gains){
  _trainImmEnsureSession();
  _trainImmSession.beats+=1;
  _trainImmSession.counts[pkm.name]=(_trainImmSession.counts[pkm.name]||0)+1;
  for(const [stat,val] of Object.entries(gains||{})){
    _trainImmSession.evGains[stat]=(_trainImmSession.evGains[stat]||0)+val;
  }
  _trainImmRenderSession();
}
function _trainImmBuildSummary(){
  if(!_trainImmSession)return null;
  const elapsedSec=_trainImmElapsedSec();
  const top=_trainImmTopCounts(5);
  const evText=_trainImmEvGainText();
  const loc=_trainSelLoc?.includes('|')?_trainSelLoc.split('|')[1]:'训练点';
  const target=_trainPkmData?(_trainPkmData.name+(_trainPkmData.nick?`「${_trainPkmData.nick}」`:'')):'训练对象';
  return {elapsedSec,beats:_trainImmSession.beats,counts:{..._trainImmSession.counts},evGains:{..._trainImmSession.evGains},top,evText,loc,target};
}
function _trainImmShowSummary(summary,partnerMsg){
  const box=document.getElementById('train-imm-summary');if(!box||!summary)return;
  const topText=summary.top.length?summary.top.join('、'):'还没有击败记录';
  box.innerHTML=`<div class="tim-summary-title">TRAINING REPORT</div>
    <div class="tim-summary-main">${esc(summary.target)} 在 ${esc(summary.loc)} 训练了 ${esc(_trainImmFmtTime(summary.elapsedSec))}，击败 ${summary.beats} 只宝可梦。</div>
    <div class="tim-summary-sub">打过：${esc(topText)}</div>
    <div class="tim-summary-sub">EV 收获：${esc(summary.evText||'暂无')}</div>
    ${partnerMsg?`<div class="tim-summary-sub">${esc(partnerMsg)}</div>`:''}`;
  box.style.display='block';
}
function finishTrainImmSession(){
  const summary=_trainImmBuildSummary();
  if(!summary||summary.beats<=0){showToast('还没有训练记录');return;}
  _trainImmStopTimer();
  let partnerMsg='';
  if(window.partnerTrackTrainingSession){
    partnerMsg=window.partnerTrackTrainingSession(summary)||'伙伴已记录本次训练';
  }
  _trainImmShowSummary(summary,partnerMsg);
  _trainImmSession={startedAt:Date.now(),ended:false,..._trainEmptyStats()};
  _trainImmStartTimer();
  _trainImmRenderSession();
}
function _trainImmFinalizeOnClose(){
  const summary=_trainImmBuildSummary();
  if(!summary||summary.beats<=0){_trainImmStopTimer();_trainImmSession=null;return;}
  let partnerMsg='';
  if(window.partnerTrackTrainingSession)partnerMsg=window.partnerTrackTrainingSession(summary)||'伙伴已记录本次训练';
  _trainImmShowSummary(summary,partnerMsg);
  _trainImmStopTimer();
  _trainImmSession=null;
}

function openImmTrain(){
  if(!_trainPkmData){showToast('请先选择训练对象');return;}
  if(!_trainLocPkm.length){showToast('请先加载地点精灵分布');return;}
  const ov=document.getElementById('ov-train-imm');if(!ov)return;

  // 填入训练精灵信息
  const art=document.getElementById('train-imm-sprite');
  if(art){art.src=_trainPkmData.img||'';art.classList.remove('train-imm-beat');void art.offsetWidth;}
  const bg=document.getElementById('train-imm-bg');
  if(bg)bg.style.backgroundImage=`url(${_trainPkmData.img||''})`;
  document.getElementById('train-imm-name').textContent=_trainPkmData.name+(_trainPkmData.nick?`「${_trainPkmData.nick}」`:'');

  // 渲染训练目标精灵网格
  renderTrainImmGrid();
  // 渲染 EV 进度条
  renderTrainImmEVs();
  _trainImmResetSummary();
  _trainImmEnsureSession();

  // 后台拉高清图
  fetchPkm(_trainPkmData.id).then(p=>{
    const hd=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||_trainPkmData.img;
    if(art)art.src=hd;
    if(bg)bg.style.backgroundImage=`url(${hd})`;
  }).catch(()=>{});

  ov.classList.add('on');
  document.body.style.overflow='hidden';
  startTrainImmParticles();
}

function closeImmTrain(){
  stopTrainImmParticles();
  _trainImmFinalizeOnClose();
  const ov=document.getElementById('ov-train-imm');if(ov)ov.classList.remove('on');
  document.body.style.overflow='';
  // 同步回主 tab
  renderTrainEVs();
}

function renderTrainImmGrid(){
  const grid=document.getElementById('train-imm-dist-grid');if(!grid)return;
  grid.innerHTML=_trainLocPkm.map((it,i)=>{
    const evColors=Object.entries(it.evYields||{}).filter(([,v])=>v>0).map(([k,v])=>{
      const s=EV_STATS.find(x=>x.key===k);
      return`<span class="tim-ev-dot" style="background:${s?.color||'#aaa'}" title="${s?.zh||k}+${v}"></span>`;
    }).join('');
    const evLabel=Object.entries(it.evYields||{}).filter(([,v])=>v>0).map(([k,v])=>{
      const s=EV_STATS.find(x=>x.key===k);return`${s?.zh||k}+${v}`;
    }).join(' ');
    return`<div class="tim-pkm-card" id="tim-card-${i}" onclick="trainImmBeat(${i})">
      <img src="${it.img||''}" alt="${esc(it.name)}" onerror="this.style.opacity='.4'">
      <div class="tim-pkm-name">${esc(it.name)}</div>
      <div class="tim-ev-dots">${evColors}</div>
      <div class="tim-ev-label">${evLabel}</div>
    </div>`;
  }).join('');
}

function renderTrainImmEVs(){
  const bars=document.getElementById('train-imm-ev-bars');if(!bars)return;
  const totalUsed=Object.values(_trainEVs).reduce((a,b)=>a+b,0);
  bars.innerHTML=EV_STATS.map(s=>{
    const v=_trainEVs[s.key]||0;const pct=Math.min(100,v/EV_MAX_STAT*100);
    return`<div class="tim-ev-row">
      <div class="tim-ev-lbl" style="color:${s.color}">${s.zh}</div>
      <div class="tim-ev-bar-wrap"><div class="tim-ev-bar-fill" style="width:${pct}%;background:${s.color}"></div></div>
      <div class="tim-ev-val" style="color:${v>=EV_MAX_STAT?s.color:'rgba(255,255,255,.6)'}">${v}</div>
    </div>`;
  }).join('');
  const tot=document.getElementById('train-imm-ev-total');
  if(tot)tot.innerHTML=`<span style="color:${totalUsed>=510?'var(--acc2)':'rgba(255,255,255,.75)'};font-size:.9rem;font-family:'DM Mono',monospace;font-weight:700">${totalUsed}/510</span>`;
}

function trainImmBeat(idx){
  const pkm=_trainLocPkm[idx];if(!pkm||!_trainPkmData)return;
  _trainImmEnsureSession();
  const mult=getBoostMultiplier();
  const totalBefore=Object.values(_trainEVs).reduce((a,b)=>a+b,0);
  if(totalBefore>=EV_MAX_TOTAL){showToast('EV 已满 510！');return;}
  let added=false;
  const actualGains={};
  for(const [stat,ev] of Object.entries(pkm.evYields)){
    if(!ev)continue;
    const gain=ev*mult;
    const curTotal=Object.values(_trainEVs).reduce((a,b)=>a+b,0);
    const actualGain=Math.min(gain,EV_MAX_TOTAL-curTotal,EV_MAX_STAT-(_trainEVs[stat]||0));
    if(actualGain>0){
      _trainEVs[stat]=(_trainEVs[stat]||0)+actualGain;
      actualGains[stat]=(actualGains[stat]||0)+actualGain;
      added=true;
    }
  }
  if(!added){showToast('EV 容量已满');return;}
  lsSet('pkm_train_ev_'+_trainSid+'_'+_trainPkmData.id,_trainEVs);
  debounceSyncTrainEVs(_trainSid);
  renderTrainImmEVs();
  // 精灵抖动
  const sp=document.getElementById('train-imm-sprite');
  if(sp){sp.classList.remove('train-imm-beat');void sp.offsetWidth;sp.classList.add('train-imm-beat');setTimeout(()=>sp.classList.remove('train-imm-beat'),300);}
  // 卡片闪烁
  const card=document.getElementById('tim-card-'+idx);
  if(card){card.classList.add('tim-beat-flash');setTimeout(()=>card.classList.remove('tim-beat-flash'),350);}
  // EV获得提示
  const evText=Object.entries(pkm.evYields).filter(([,v])=>v>0).map(([k,v])=>{const s=EV_STATS.find(x=>x.key===k);return`${s?.zh||k}+${v*mult}`;}).join(' ');
  _trainImmRecordBeat(pkm,actualGains);
  showToast(pkm.name+'  '+evText);
}

function startTrainImmParticles(){
  stopTrainImmParticles();
  const container=document.getElementById('train-imm-particles');if(!container)return;
  container.innerHTML='';
  const colors=['rgba(200,144,64,.5)','rgba(90,184,154,.4)','rgba(160,100,220,.35)','rgba(255,255,255,.25)'];
  let active=0;
  _trainImmParticleTimer=setInterval(()=>{
    if(active>30)return;
    const el=document.createElement('div');el.className='hunt-particle';
    const size=2+Math.random()*3;const dur=3+Math.random()*4;const dx=(Math.random()-.5)*60;
    el.style.cssText=`left:${Math.random()*100}%;bottom:${5+Math.random()*30}%;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};--pdx:${dx}px;animation-duration:${dur}s;`;
    container.appendChild(el);active++;setTimeout(()=>{el.remove();active--;},dur*1000);
  },220);
}
function stopTrainImmParticles(){
  if(_trainImmParticleTimer){clearInterval(_trainImmParticleTimer);_trainImmParticleTimer=null;}
  const c=document.getElementById('train-imm-particles');if(c)c.innerHTML='';
}

function renderTrainDist(items,isOfficial,srcLabel){
  _trainLocPkm=items;
  // 同步更新沉浸模式训练网格
  const ov=document.getElementById('ov-imm');
  if(ov&&ov.style.display!=='none'&&_immMode==='train')renderTrainImmGrid();
  const grid=document.getElementById('train-dist-grid');if(!grid)return;
  const srcBadge=isOfficial
    ?`<div class="dist-src-badge dist-src-official">${srcLabel||'52poke'} 官方 · 精灵分布</div>`
    :`<div class="dist-src-badge dist-src-ai">AI 参考 · 努力值来自 PokéAPI</div>`;
  grid.innerHTML=srcBadge+items.map((it,i)=>{
    const evStr=Object.entries(it.evYields||{}).map(([k,v])=>{
      const s=EV_STATS.find(x=>x.key===k);
      return`<span class="train-ev-chip" style="background:${s?.color||'var(--acc)'}22;border-color:${s?.color||'var(--acc)'}55;color:${s?.color||'var(--acc)'}">${s?.zh||k} +${v}</span>`;
    }).join('');
    const chanceHtml=it.official&&it.chance!=null
      ?`<div class="train-dist-chance">${it.chance}%</div>`:'';
    return`<div class="train-dist-card" id="train-card-${i}" onclick="beatPokemon(${i})" style="animation-delay:${i*35}ms">
      ${chanceHtml}
      <img src="${it.img||''}" alt="" onerror="this.style.display='none'">
      <div class="train-dist-name">${esc(it.name)}</div>
      <div class="train-ev-chips">${evStr}</div>
    </div>`;
  }).join('');
}

async function getTrainRec(){
  if(!_trainPkmData){showToast('请先选择训练对象');return;}
  const btn=document.getElementById('train-ai-btn');
  const box=document.getElementById('train-ai-result');
  if(btn){btn.disabled=true;btn.textContent='AI 分析中…';}
  if(box){box.style.display='block';box.textContent='…';}
  const sid=_trainSid;
  const s=PKM_SERIES.find(x=>x.id===sid);
  const evStr=EV_STATS.map(st=>`${st.zh}:${_trainEVs[st.key]||0}`).join(' / ');
  const totalEV=Object.values(_trainEVs).reduce((a,b)=>a+b,0);
  const prompt=`你是宝可梦对战培育专家。
精灵：${_trainPkmData.name}（PokéAPI ID #${_trainPkmData.id}）${_trainPkmData.lv?'，当前Lv.'+_trainPkmData.lv:''}
游戏版本：${s?.name||sid}
当前EV累计（共${totalEV}/510）：${evStr}

请给出：
1. 推荐EV分配方案（如：速度252/特攻252/特防4），说明原因
2. 在「${s?.name||sid}」中刷该EV的最佳地点（请基于该游戏的实际地图）
3. 性格推荐（上升/下降属性）
4. 一句话培育目标

注意：EV总和不超过510，单项不超过252，数据请基于官方资料。纯文字不用Markdown。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:500,temperature:0.6}})});
    const data=await res.json();
    const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI暂时无法响应）';
    typewriter(box,reply,28);
  }catch(e){if(box)box.textContent='生成失败：'+e.message;}
  if(btn){btn.disabled=false;btn.textContent='✦ AI 培养方向建议';}
}

/* ── 打字机工具 ── */
function typewriter(el,text,speed){
  speed=speed||30;el.textContent='';el.classList.add('tw-active');
  let i=0;const step=()=>{if(i<text.length){el.textContent+=text[i++];setTimeout(step,1000/speed);}else{el.classList.remove('tw-active');}};
  step();
}

/* ── 捕获光束 ── */
function spawnCaptureBeam(){
  const ov=document.getElementById('ov-imm');if(!ov)return;
  const beam=document.createElement('div');beam.className='capture-beam';
  ov.appendChild(beam);setTimeout(()=>beam.remove(),800);
}

/* ── 进度打卡爆发粒子 ── */
function spawnCheckpointBurst(idx){
  const items=document.querySelectorAll('.progress-item');
  const item=items[idx];if(!item)return;
  const rect=item.getBoundingClientRect();
  const cx=rect.left+24,cy=rect.top+rect.height/2;
  const colors=['#f0c040','#5ab89a','#a0c8f0','#ffffff','#ff80ab'];
  for(let i=0;i<20;i++){
    const el=document.createElement('div');el.className='cp-spark';
    const a=Math.random()*Math.PI*2,d=30+Math.random()*70;
    el.style.cssText=`left:${cx}px;top:${cy}px;background:${colors[i%colors.length]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;animation-delay:${Math.random()*0.12}s`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),700);
  }
}

/* ── 通关彩带 ── */
function spawnConfetti(){
  const colors=['#f0c040','#5ab89a','#ff80ab','#a0c8f0','#c890ff','#d97c30','#ffffff'];
  for(let i=0;i<90;i++){
    const el=document.createElement('div');el.className='confetti-piece';
    el.style.cssText=`left:${Math.random()*100}vw;background:${colors[i%colors.length]};animation-delay:${Math.random()*1.6}s;animation-duration:${1.4+Math.random()*1.6}s;width:${4+Math.random()*6}px;height:${4+Math.random()*9}px;transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),3800);
  }
}

/* ================================================================
   AI 沉浸系统
   ================================================================ */

/* ── ① 冒险日记 ── */
async function genAdventureLog(){
  const sid=_curSid;
  let notes=lsGet('pkm_notes_'+sid)||[];if(!Array.isArray(notes))notes=[];
  if(!notes.length){showToast('先记一条快记，再生成日记～');return;}
  const btn=document.getElementById('gen-diary-btn');
  const box=document.getElementById('adventure-diary');
  btn.disabled=true;btn.textContent='AI 书写中…';
  box.style.display='block';box.textContent='…';
  const s=PKM_SERIES.find(x=>x.id===sid);
  const status=document.getElementById('series-save-btn')?.dataset?.status||'none';
  const hours=document.getElementById('series-hours-inp')?.value||'';
  const ace=document.getElementById('series-ace-inp')?.value||'';
  const latestNote=notes[0];
  const stStr={none:'尚未开始',played:'正在游玩',cleared:'已通关'}[status]||'';
  const prompt=`你是宝可梦训练师日记的润色师。
游戏：「${s?.name||sid}」（${stStr}${hours?'，已游玩'+hours+'小时':''}${ace?'，王牌'+ace:''}）
训练师最新快记：${latestNote.text}

请将这条快记润色扩写成一段80-120字的训练师冒险日记片段，要求：
- 用第一人称叙事，像在记录真实的宝可梦旅途
- 自然融入「${s?.name||''}」这部作品的世界观和氛围
- 在快记内容基础上添加沉浸式细节和情绪，结尾带一点期待或感慨
纯文字，不用Markdown，不用标题。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:400,temperature:0.9}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI暂时无法响应）';
    typewriter(box,reply);
    const{data:{session}}=await db.auth.getSession();
    if(session?.user){await db.from('pkm_logs').insert({user_id:session.user.id,pkm_id:0,pkm_name:'📖 '+(s?.name||sid),summary:reply,game_series:s?.name||sid});loadPkmLogs();}
  }catch(e){box.textContent='生成失败：'+e.message;}
  btn.disabled=false;btn.textContent='✦ AI 润色成冒险日记';
}

/* ── ② 宝可梦对话 ── */
async function speakPartyMember(sid,idx){
  let party=lsGet('pkm_party_'+sid)||[];if(!Array.isArray(party))party=[];while(party.length<6)party.push(null);
  const p=party[idx];if(!p)return;
  const resultEl=document.getElementById('party-speak-result');
  resultEl.style.display='block';
  resultEl.innerHTML='<span style="color:var(--t3);font-size:.78rem">…</span>';
  const s=PKM_SERIES.find(x=>x.id===sid);
  const prompt=`你是宝可梦「${p.name}」${p.nick?'（训练师叫它「'+p.nick+'」）':''}，等级${p.lv||'?'}，正在跟随训练师冒险于「${s?.name||'宝可梦世界'}」。
用第一人称说一句20-35字的话，体现这只宝可梦的性格和对训练师的感情。语气要有灵性，像真实的宝可梦在说话，自然不做作。纯文字。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:80,temperature:1.2}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'……';
    resultEl.innerHTML=`<span style="font-size:.68rem;color:var(--acc);font-family:'DM Mono',monospace">${esc(p.name)}${p.nick?'「'+esc(p.nick)+'」':''}</span><br><span>${esc(reply)}</span>`;
  }catch(e){resultEl.textContent='连接失败';}
}

/* ── ③ 狩猎旁白里程碑 ── */
const HUNT_MILESTONE_TEXT={
  1:'草丛轻轻颤动……它出现了。',
  5:'第五次遭遇，它似乎还不愿配合。',
  10:'十次了，你深吸一口气。',
  20:'二十次。汗水打湿了发梢，眼神却更加坚定。',
  30:'三十次。日落了，你还没有放弃。',
  50:'五十次。这已经是意志的考验。',
  75:'七十五次。你几乎认识了它的每一个习惯。',
  100:'一百次——它依然没有出现。但你没有放弃。',
  150:'一百五十次。这条路上你已走过无数次。',
  200:'两百次，你已经记不清多少个日落了……',
  300:'三百次，仿佛整个世界只剩下这片草丛。',
  500:'五百次。传说中，最执着的训练师终将遇见命运。',
};
let _narrationTimer=null;
function showHuntNarration(text){
  const el=document.getElementById('hunt-imm-narration');if(!el)return;
  el.style.display='block';el.textContent=text;
  el.style.animation='none';void el.offsetWidth;el.style.animation='';
  clearTimeout(_narrationTimer);
  _narrationTimer=setTimeout(()=>{if(el)el.style.display='none';},3200);
}

/* ── ④ 道馆战前动员 ── */
async function getBriefing(sid,idx){
  const checkpoints=SERIES_CHECKPOINTS[sid];
  const cpName=checkpoints?.[idx]||'';if(!cpName)return;
  const panel=document.getElementById('gym-briefing-panel');if(!panel)return;
  panel.style.display='block';
  panel.innerHTML=`<div class="gym-brief-hdr">⚔️ BATTLE READY · 加载中…</div>`;
  const s=PKM_SERIES.find(x=>x.id===sid);
  const hours=document.getElementById('series-hours-inp')?.value||'';
  const ace=document.getElementById('series-ace-inp')?.value||'';
  const prompt=`你是宝可梦训练师的内心旁白专员。
玩家正在游玩「${s?.name||sid}」，即将挑战：「${cpName}」。
${ace?'训练师的王牌是'+ace+'。':''}${hours?'已经历了'+hours+'小时的旅途。':''}

请用第一人称写一段60-80字的战前动员：结合「${s?.name||''}」这部作品的剧情氛围，描写训练师此刻的心情、眼前的场景、以及即将出击的决心。
文字要有沉浸感，像游戏内心独白，纯文字不用Markdown。`;
  try{
    const res=await fetch(SB_URL+'/functions/v1/gemini-proxy',{method:'POST',headers:{'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:200,temperature:0.9}})});
    if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()||'（AI离线）';
    panel.innerHTML=`<div class="gym-brief-hdr">⚔️ BATTLE READY · ${esc(cpName)}</div><div id="gym-brief-text"></div>`;
    typewriter(document.getElementById('gym-brief-text'),reply);
  }catch(e){panel.innerHTML=`<div class="gym-brief-hdr" style="color:var(--danger)">连接失败：${e.message}</div>`;}
}

let _immMode='hunt';
let _immMapInited=false;
function updateImmTrainPlaceholder(){
  const placeholder=document.getElementById('imm-train-placeholder');
  const hero=document.querySelector('#imm-panel-train .tim-hero');
  const show=!_trainPkmData;
  if(placeholder)placeholder.style.display=show?'block':'none';
  if(hero)hero.style.display=show?'none':'flex';
}

function selectTrainPkmFromImm(idx){
  const sid=_curSid;
  let party=lsGet('pkm_party_'+sid)||[];
  const p=party[idx];if(!p)return;
  _trainPkmData={name:p.name,id:p.pkmId,img:p.img,nick:p.nick,lv:p.lv,partyIdx:idx};
  const saved=lsGet('pkm_train_ev_'+sid+'_'+p.pkmId);
  _trainEVs=saved?{...saved}:{hp:0,attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0};
  _trainSid=sid;
  toggleImmPanel('__none__');
  updateImmTrainPlaceholder();
  const _tSprite=document.getElementById('train-imm-sprite');
  if(_tSprite){_tSprite.src=p.img||'';_tSprite.style.visibility='visible';}
  if(p.pkmId){fetchPkm(p.pkmId).then(data=>{const art=data.sprites?.other?.['official-artwork']?.front_default||data.sprites?.front_default||p.img;if(_tSprite&&art)_tSprite.src=art;}).catch(()=>{});}
  const _tName=document.getElementById('train-imm-name');
  if(_tName)_tName.textContent=p.name+(p.nick?`「${p.nick}」`:'');
  renderTrainImmEVs();
  if(_trainLocPkm.length)renderTrainImmGrid();
}

function setImmMode(mode){
  if(false){
    showToast('请先在「训练」tab 选择训练对象');
    return;
  }
  if(false){
    showToast('请先在「训练」tab 加载刷练地点分布');
    return;
  }
  const nextMode=mode==='train'?'train':'hunt';
  if(_immMode==='train'&&nextMode!=='train')_trainImmFinalizeOnClose();
  _immMode=nextMode;
  const immBg=document.getElementById('imm-bg');
  if(immBg)immBg.style.backgroundImage=_immMode==='train'?"url('css/沉浸模式 - 训练背景.png')":`url('css/沉浸模式 - 狩猎背景.png')`;
  const huntPanel=document.getElementById('imm-panel-hunt');
  const trainPanel=document.getElementById('imm-panel-train');
  const huntBtn=document.getElementById('imm-mode-hunt');
  const trainBtn=document.getElementById('imm-mode-train');
  if(huntPanel)huntPanel.style.display=_immMode==='hunt'?'block':'none';
  if(trainPanel)trainPanel.style.display=_immMode==='train'?'block':'none';
  if(huntBtn){
    huntBtn.style.background=_immMode==='hunt'?'var(--acc)':'var(--bg3)';
    huntBtn.style.color=_immMode==='hunt'?'#fff':'var(--t2)';
    huntBtn.style.border=_immMode==='hunt'?'none':'1px solid var(--b)';
  }
  if(trainBtn){
    trainBtn.style.background=_immMode==='train'?'var(--acc)':'var(--bg3)';
    trainBtn.style.color=_immMode==='train'?'#fff':'var(--t2)';
    trainBtn.style.border=_immMode==='train'?'none':'1px solid var(--b)';
  }
  updateImmTrainPlaceholder();
  if(_immMode==='train'){
    _trainImmResetSummary();
    _trainImmEnsureSession();
    if(!_trainPkmData)toggleImmPanel('party');
  }
}

function enterImmersiveFromSeries(mode){
  closeOv('ov-series');
  if(mode==='progress'){
    const sid=_curSid;
    openImm('hunt',sid,-1);
    setTimeout(()=>toggleImmPanel('progress'),80);
    return;
  }
  openImm(mode,_curSid,-1);
  if(mode==='hunt'&&_curSid==='firered-leafgreen'){
    setTimeout(()=>openImmMapPicker(),80);
  }
}

function toggleImmPanel(name){
  if(name==='map'){openImmMapPicker();return;}
  const panelMap={
    party:document.getElementById('imm-sub-party'),
    catches:document.getElementById('imm-sub-catches'),
    explore:document.getElementById('imm-sub-explore'),
    progress:document.getElementById('imm-sub-progress'),
  };
  const target=panelMap[name];
  const wasOpen=!!(target&&target.dataset.open==='1');
  Object.values(panelMap).forEach(panel=>{
    if(panel){panel.style.display='none';panel.dataset.open='0';}
  });
  if(!target||wasOpen)return;
  target.style.display='block';
  target.dataset.open='1';
  if(name==='party'){
    const sid=getActivePartySid();
    if(sid)renderPartySlots(sid);
  }
  if(name==='catches'){
    initNatureSelect('catch-nature');
    resetCatchForm(getCatchLocationPrefill());
    loadCatchList(_curSid);
  }
  if(name==='explore'){
    const result=document.getElementById('explore-result');
    const saveRow=document.getElementById('explore-save-row');
    if(result)result.style.display='none';
    if(saveRow)saveRow.style.display='none';
    loadExploreHistory(_curSid);
  }
  if(name==='progress'){
    const sid=_curSid||_immSid;
    renderProgress(sid);
    const bp=document.getElementById('gym-briefing-panel');
    if(bp)bp.style.display='none';
  }
}

function renderImmParty(){
  const row=document.getElementById('imm-party-row');
  if(!row)return;
  let party=lsGet('pkm_party_'+_curSid)||[];
  if(!Array.isArray(party))party=[];
  while(party.length<6)party.push(null);
  row.innerHTML=party.slice(0,6).map(p=>{
    if(!p)return '<div style="width:24px;height:24px;border-radius:4px;background:var(--bg3);border:1px solid var(--b)"></div>';
    return `<img src="${p.img||''}" alt="${esc(p.name||'party')}" title="${esc(p.name||'party')}" style="width:24px;height:24px;border-radius:4px;background:var(--bg3);border:1px solid var(--b);object-fit:contain;padding:2px;box-sizing:border-box" onerror="this.style.opacity='.35'">`;
  }).join('');
}

function _immNormalizePartyPkm(p){
  if(!p)return null;
  return {
    id:p.pkmId||p.id||null,
    name:p.name||'',
    img:p.img||'',
    nick:p.nick||'',
    lv:p.lv||'',
  };
}

async function _immResolvePkmArt(pkm){
  const fallback=pkm?.img||'';
  const id=pkm?.id||null;
  if(!id)return fallback;
  try{
    const data=await fetchPkm(id);
    return data.sprites?.other?.['official-artwork']?.front_default||data.sprites?.front_default||fallback;
  }catch(e){
    return fallback;
  }
}

function startHuntParticles(){
  stopHuntParticles();
  const container=document.getElementById('imm-particles');if(!container)return;
  container.innerHTML='';
  const colors=['rgba(200,144,64,.6)','rgba(90,184,154,.5)','rgba(255,255,255,.35)','rgba(160,100,220,.4)','rgba(90,140,220,.4)'];
  let active=0;
  _huntParticleTimer=setInterval(()=>{
    if(active>40)return;
    const el=document.createElement('div');el.className='hunt-particle';
    const size=2+Math.random()*4;
    const dur=3+Math.random()*4;
    const dx=(Math.random()-0.5)*70;
    el.style.cssText=`left:${Math.random()*100}%;bottom:${5+Math.random()*40}%;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};--pdx:${dx}px;animation-duration:${dur}s;`;
    container.appendChild(el);active++;
    setTimeout(()=>{el.remove();active--;},dur*1000);
  },180);
}
function stopHuntParticles(){
  if(_huntParticleTimer){clearInterval(_huntParticleTimer);_huntParticleTimer=null;}
  const c=document.getElementById('imm-particles');if(c)c.innerHTML='';
}

function startTrainImmParticles(){
  stopTrainImmParticles();
  const container=document.getElementById('imm-particles');if(!container)return;
  container.innerHTML='';
  const colors=['rgba(200,144,64,.5)','rgba(90,184,154,.4)','rgba(160,100,220,.35)','rgba(255,255,255,.25)'];
  let active=0;
  _trainImmParticleTimer=setInterval(()=>{
    if(active>30)return;
    const el=document.createElement('div');el.className='hunt-particle';
    const size=2+Math.random()*3;const dur=3+Math.random()*4;const dx=(Math.random()-.5)*60;
    el.style.cssText=`left:${Math.random()*100}%;bottom:${5+Math.random()*30}%;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};--pdx:${dx}px;animation-duration:${dur}s;`;
    container.appendChild(el);active++;setTimeout(()=>{el.remove();active--;},dur*1000);
  },220);
}
function stopTrainImmParticles(){
  if(_trainImmParticleTimer){clearInterval(_trainImmParticleTimer);_trainImmParticleTimer=null;}
  const c=document.getElementById('imm-particles');if(c)c.innerHTML='';
}

function spawnCaptureBeam(){
  const ov=document.getElementById('ov-imm');if(!ov)return;
  const beam=document.createElement('div');beam.className='capture-beam';
  ov.appendChild(beam);setTimeout(()=>beam.remove(),800);
}

async function saveCatch(){
  await persistCatchRecord();
}

function selectTrainPkm(slotIdx){
  const sid=_trainSid;
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];
  while(party.length<6)party.push(null);
  const filledParty=party.map((p,idx)=>p?{..._immNormalizePartyPkm(p),partyIdx:idx}:null).filter(Boolean);
  const p=filledParty[slotIdx];if(!p||!p.id)return;
  _trainPkmData={name:p.name,id:p.id,img:p.img,nick:p.nick,lv:p.lv,partyIdx:p.partyIdx};
  const saved=lsGet('pkm_train_ev_'+sid+'_'+p.id);
  _trainEVs=saved||{hp:0,attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0};
  document.querySelectorAll('.train-pkm-slot').forEach((el,i)=>el.classList.toggle('selected',i===slotIdx));
  const evPanel=document.getElementById('train-ev-panel');if(evPanel)evPanel.style.display='block';
  const aiSec=document.getElementById('train-ai-result');if(aiSec)aiSec.style.display='none';
  renderTrainEVs();
  updateImmTrainPlaceholder();
}

function huntActionFight(){
  if(_huntActionsLocked)return;
  _huntActionsLocked=true;
  const ov=document.getElementById('ov-imm');
  const fl=document.createElement('div');fl.className='hunt-screen-flash-red';ov.appendChild(fl);setTimeout(()=>fl.remove(),280);
  const sp=document.getElementById('hunt-imm-sprite');
  sp.classList.remove('fight-hit','enter-new');void sp.offsetWidth;sp.classList.add('fight-hit');
  _huntCountUp();
  _checkShiny();
  setTimeout(()=>{sp.classList.remove('fight-hit');_huntActionsLocked=false;},420);
}

async function openImm(mode,...args){
  const ov=document.getElementById('ov-imm');
  const bg=document.getElementById('imm-bg');
  const loc=document.getElementById('imm-loc');
  if(!ov||!bg)return;

  if(mode==='hunt'){
    const[sid,idx]=args;
    const i=idx??-1;
    _immSid=sid;_immIdx=i;_huntActionsLocked=false;
    const list=lsGet('pkm_hunt_'+sid)||[];
    const t=i>=0?list[i]:null;
    if(loc)loc.textContent='📍 '+(t?.loc||'野外');
    document.getElementById('hunt-imm-success').style.display='none';
    document.getElementById('hunt-nature-pick').style.display='none';
    if(t&&!t.done){
      const natZh=getNatureZh(t.nature);
      document.getElementById('hunt-imm-name').textContent=t.name;
      document.getElementById('hunt-imm-target').textContent=NATURES.some(n=>n.id===t.nature)?natZh+'性格 目标':'🎯 '+t.name;
      document.getElementById('hunt-imm-num').textContent=t.count;
      document.getElementById('hunt-imm-sprite').src=t.img||'';
      document.getElementById('hunt-success-sprite').src=t.img||'';
      const sp=document.getElementById('hunt-imm-sprite');
      sp.classList.remove('fight-hit','run-away','shiny');void sp.offsetWidth;
      sp.classList.add('enter-new');setTimeout(()=>sp.classList.remove('enter-new'),500);
    }else{
      document.getElementById('hunt-imm-name').textContent='';
      document.getElementById('hunt-imm-target').textContent='自由捕捉：选择地点后点击遇到的宝可梦';
      document.getElementById('hunt-imm-num').textContent='0';
      document.getElementById('hunt-imm-sprite').src='css/可达鸭空状态.png';
      const actEl=document.getElementById('hunt-battle-actions');
      if(actEl)actEl.style.display='none';
    }
    bg.style.backgroundImage="url('css/沉浸模式 - 狩猎背景.png')";
    initHuntTab(sid);
    renderHuntAreaGrid(t);
    if(t&&!t.done){
      try{
        const p=await fetchPkm(t.pkmId);
        const art=p.sprites?.other?.['official-artwork']?.front_default||p.sprites?.front_default||t.img;
        document.getElementById('hunt-imm-sprite').src=art;
        document.getElementById('hunt-success-sprite').src=art;
      }catch(e){}
    }
  }else{
    const tSid=_trainSid||_curSid;
    const art=document.getElementById('train-imm-sprite');
    if(art){art.style.visibility='hidden';art.removeAttribute('src');art.classList.remove('train-imm-beat');void art.offsetWidth;}
    if(loc)loc.textContent='📍 '+(_trainSelLoc.includes('|')?_trainSelLoc.split('|')[1]:'训练点');
    if(_trainPkmData){
      document.getElementById('train-imm-name').textContent=_trainPkmData.name+(_trainPkmData.nick?`「${_trainPkmData.nick}」`:'');
    }
    bg.style.backgroundImage="url('css/沉浸模式 - 训练背景.png')";
    if(tSid)initTrainTab(tSid);
    if(_trainLocPkm.length)renderTrainImmGrid();
    renderTrainImmEVs();
    _trainImmResetSummary();
    _trainImmEnsureSession();
    if(_trainPkmData){
      const hd=await _immResolvePkmArt(_trainPkmData);
      if(art&&hd){
        art.onerror=()=>{art.style.visibility='hidden';};
        art.onload=()=>{art.style.visibility='visible';};
        art.src=hd;
      }
      if(art&&!hd)art.style.visibility='hidden';
    }
  }

  setImmMode(mode);
  renderImmParty();
  ['imm-sub-catches','imm-sub-explore','imm-sub-progress','imm-sub-party'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.style.display='none';el.dataset.open='0';}
  });
  // minimap：仅 FRLG 系列显示；FRLG 时隐藏顶部地点输入区
  const immSidForMap=mode==='hunt'?_immSid:_trainSid;
  const minimap=document.getElementById('imm-minimap');
  const isFRLG=immSidForMap==='firered-leafgreen';
  if(minimap)minimap.style.display=isFRLG?'block':'none';
  const ov2=document.getElementById('ov-imm');
  if(ov2)ov2.dataset.series=isFRLG?'frlg':'';
  const fabs=document.getElementById('imm-fabs');
  if(fabs)fabs.style.display='flex';
  ov.style.display='flex';
  ov.classList.add('on');
  document.body.style.overflow='hidden';
  stopHuntParticles();
  stopTrainImmParticles();
  if(mode==='hunt')startHuntParticles(); else startTrainImmParticles();
}

function closeImm(){
  stopHuntParticles();
  stopTrainImmParticles();
  closeImmMapFull();
  const ov=document.getElementById('ov-imm');if(ov){ov.classList.remove('on');ov.style.display='none';}
  ['imm-sub-catches','imm-sub-explore','imm-sub-progress','imm-sub-party'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.style.display='none';el.dataset.open='0';}
  });
  const minimap=document.getElementById('imm-minimap');
  if(minimap)minimap.style.display='none';
  document.body.style.overflow='';
  const encPanel=document.getElementById('frlg-enc-panel');if(encPanel){encPanel.classList.remove('visible');encPanel.style.display='none';}
  if(_immMode==='train'){_trainImmFinalizeOnClose();renderTrainEVs();}
  _huntActionsLocked=false;
}

function openImmMapPicker(){
  const full=document.getElementById('imm-map-full');if(!full)return;
  const fabs=document.getElementById('imm-fabs');
  if(fabs)fabs.style.display='none';
  full.style.display='flex';
  if(!_immMapInited){
    _immMapInited=true;
    if(typeof frlgInitView==='function')frlgInitView('kanto');
  }
  if(typeof frlgSetSelectMode==='function'){
    frlgSetSelectMode(function(key,label){
      const entry=typeof FRLG_ENCOUNTERS!=='undefined'?FRLG_ENCOUNTERS[key]:null;
      const zhName=entry?.zh||label;
      closeImmMapFull();
      if(_immMode==='hunt'){
        selectHuntLocFromMap(zhName, key);
        const _refreshHuntGrid=()=>{const list=lsGet('pkm_hunt_'+_immSid)||[];renderHuntAreaGrid(list[_immIdx]||null);};
        if(_huntDistCache[_huntSelLoc]){_huntLocPkm=_huntDistCache[_huntSelLoc];_refreshHuntGrid();}
        else{loadHuntDistribution().then(_refreshHuntGrid);}
      }else{
        selectTrainLocFromMap(zhName, key);
        if(_trainDistCache[_trainSelLoc]){_trainLocPkm=_trainDistCache[_trainSelLoc];renderTrainImmGrid();}
        else{loadTrainDistribution().then(renderTrainImmGrid);}
      }
      updateImmMinimap(zhName);
    });
  }
}

function closeImmMapFull(){
  const full=document.getElementById('imm-map-full');if(full)full.style.display='none';
  const fabs=document.getElementById('imm-fabs');
  if(fabs)fabs.style.display='flex';
  if(typeof frlgClearSelectMode==='function')frlgClearSelectMode();
}

function updateImmMinimap(loc){
  const lbl=document.getElementById('imm-minimap-loc');
  if(lbl)lbl.textContent=loc||'点击地图选择';
}

async function openImmHunt(sid,idx){
  return openImm('hunt',sid,idx);
}
function closeImmHunt(){
  return closeImm();
}
function openImmTrain(){
  return openImm('train');
}
function closeImmTrain(){
  return closeImm();
}

let _partyEditingSlot=null;
let _partyReplaceTarget=null;

function isPartySlotEditing(sid,idx){
  return _partyEditingSlot?.sid===sid&&_partyEditingSlot?.idx===idx;
}

function togglePartyEdit(sid,idx){
  _partyEditingSlot=isPartySlotEditing(sid,idx)?null:{sid,idx};
  renderPartySlots(sid);
}

function savePartyEdit(sid,idx){
  const nickEl=document.getElementById(`party-nick-${sid}-${idx}`);
  const lvEl=document.getElementById(`party-lv-${sid}-${idx}`);
  let lv=(lvEl?.value||'').trim();
  if(lv!==''){
    const num=Math.max(1,Math.min(100,parseInt(lv,10)||1));
    lv=String(num);
  }
  updatePartyMember(sid,idx,{nick:(nickEl?.value||'').trim(),lv});
}

function updatePartyMember(sid,idx,fields){
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];
  while(party.length<6)party.push(null);
  if(!party[idx])return;
  party[idx]={...party[idx],...fields};
  lsSet('pkm_party_'+sid,party);
  _partyEditingSlot=null;
  _partyReplaceTarget=null;
  renderPartySlots(sid);
  renderImmParty();
  if(typeof initTrainTab==='function')initTrainTab(sid);
  syncSeriesField(sid,'party',party);
}

function queuePartyReplace(sid,idx,searchId){
  _partyReplaceTarget={sid,idx};
  _partyEditingSlot=null;
  renderPartySlots(sid);
  const inp=document.getElementById(searchId);
  if(inp){
    inp.focus();
    inp.select?.();
  }
  if(typeof showToast==='function')showToast('选择一只宝可梦来替换当前队伍位');
}

function replacePartyMember(sid,idx,pkm){
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];
  while(party.length<6)party.push(null);
  const prev=party[idx]||{};
  party[idx]={
    pkmId:pkm.id,
    name:pkm.name,
    img:pkm.img,
    nick:prev.nick||'',
    lv:prev.lv||''
  };
  lsSet('pkm_party_'+sid,party);
  _partyReplaceTarget=null;
  _partyEditingSlot={sid,idx};
  renderPartySlots(sid);
  renderImmParty();
  if(typeof initTrainTab==='function')initTrainTab(sid);
  syncSeriesField(sid,'party',party);
}

function renderPartySlots(sid){
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];
  while(party.length<6)party.push(null);
  const html=(searchId)=>party.map((p,i)=>{
    if(p){
      const editing=isPartySlotEditing(sid,i);
      const nickVal=(p.nick||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
      const lvVal=String(p.lv||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
      return`<div class="party-slot filled${editing?' party-slot-editing':''}" onclick="togglePartyEdit('${sid}',${i})">
        <button class="party-slot-del" onclick="removeFromParty('${sid}',${i});event.stopPropagation()">✕</button>
        <img src="${p.img||''}" alt="" onerror="this.style.display='none'">
        <div class="party-slot-name">${esc(p.name)}</div>
        ${editing
          ?`<div class="party-slot-edit-form" onclick="event.stopPropagation()">
              <input id="party-nick-${sid}-${i}" class="series-inp party-slot-inp" placeholder="昵称" value="${nickVal}">
              <input id="party-lv-${sid}-${i}" class="series-inp party-slot-inp" type="number" min="0" max="100" placeholder="等级" value="${lvVal}">
              <div class="party-slot-edit-actions">
                <button class="btn btn-sm" onclick="savePartyEdit('${sid}',${i});event.stopPropagation()">确认</button>
                <button class="btn btn-sm" onclick="queuePartyReplace('${sid}',${i},'${searchId}');event.stopPropagation()">更换</button>
              </div>
            </div>`
          :`${p.nick?`<div class="party-slot-nick">${esc(p.nick)}</div>`:''}
             <div class="party-slot-lv">${p.lv?'Lv.'+p.lv:''}</div>
             <button class="party-speak-btn" onclick="speakPartyMember('${sid}',${i});event.stopPropagation()">💬 说话</button>`
        }
      </div>`;
    }
    return`<div class="party-slot" onclick="document.getElementById('${searchId}')?.focus()">
      <div class="party-slot-empty-icon">+</div>
      <div class="party-slot-empty-lbl">空位</div>
    </div>`;
  }).join('');
  const wrap=document.getElementById('party-slots');
  if(wrap)wrap.innerHTML=html('party-search-inp');
  const immWrap=document.getElementById('imm-party-slots');
  if(immWrap)immWrap.innerHTML=html('imm-party-search-inp');
  renderImmPartyScene(sid);
}

function removeFromParty(sid,idx){
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];
  while(party.length<6)party.push(null);
  party[idx]=null;
  lsSet('pkm_party_'+sid,party);
  if(isPartySlotEditing(sid,idx))_partyEditingSlot=null;
  if(_partyReplaceTarget?.sid===sid&&_partyReplaceTarget?.idx===idx)_partyReplaceTarget=null;
  renderPartySlots(sid);
  renderImmParty();
  if(typeof initTrainTab==='function')initTrainTab(sid);
  syncSeriesField(sid,'party',party);
}

const IMM_PARTY_POS=[
  {x:20,y:66},{x:38,y:50},{x:57,y:64},{x:75,y:48},{x:30,y:82},{x:68,y:82}
];
function getActivePartySid(){
  return _curSid||_trainSid||_immSid;
}
function renderImmPartyScene(sid){
  const stage=document.getElementById('imm-party-stage');
  if(!stage)return;
  let party=lsGet('pkm_party_'+sid)||[];
  if(!Array.isArray(party))party=[];
  while(party.length<6)party.push(null);
  const filled=party.filter(Boolean);
  if(!filled.length){
    stage.innerHTML='<div class="imm-party-stage-empty">搜索宝可梦加入队伍，它们会在这里一起待机。</div>';
    return;
  }
  stage.innerHTML=party.map((p,i)=>{
    const pos=IMM_PARTY_POS[i]||{x:50,y:60};
    if(!p)return`<div class="imm-party-empty-slot" onclick="document.getElementById('imm-party-search-inp')?.focus()" style="left:${pos.x}%;top:${pos.y}%">+</div>`;
    const selected=_trainPkmData&&Number(_trainPkmData.id)===Number(p.pkmId)&&(_trainPkmData.nick||'')===(p.nick||'');
    const act=_immMode==='train'?`selectTrainPkmFromImm(${i})`:`togglePartyEdit('${sid}',${i})`;
    return`<div class="imm-party-mon${selected?' selected':''}" onclick="${act}" style="left:${pos.x}%;top:${pos.y}%;animation-delay:${i*.22}s">
      <div class="imm-party-sprite-wrap"><img src="${p.img||''}" alt="${esc(p.name)}" onerror="this.style.opacity='.35'"></div>
      <div class="imm-party-name">${esc(p.nick||p.name)}</div>
      <div class="imm-party-lv">${p.lv?'Lv.'+esc(p.lv):'Lv.?'}</div>
    </div>`;
  }).join('');
}

function selectInlinePkm(idx,mode){
  const pkm=_inlineSearchResults[idx];
  if(!pkm)return;
  if(mode==='party'){
    const sid=getActivePartySid();
    if(!sid){showToast('请先选择正在游玩的版本');return;}
    if(_partyReplaceTarget?.sid===sid)replacePartyMember(sid,_partyReplaceTarget.idx,pkm);
    else addToParty(sid,pkm);
  }else if(mode==='catch'){
    selectCatchPkm(pkm);
  }
}
