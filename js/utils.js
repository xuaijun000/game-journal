function closeOv(id){document.getElementById(id).classList.remove('on');}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function showToast(msg,type='info'){
  const colors={
    info:'rgba(126,205,196,.95)',
    ok:'rgba(143,184,160,.96)',
    warn:'rgba(255,179,163,.96)',
    danger:'rgba(190,92,92,.96)'
  };
  const t = document.createElement('div');
  t.style.cssText=`position:fixed;bottom:90px;left:50%;transform:translateX(-50%);max-width:min(520px,calc(100vw - 32px));background:${colors[type]||colors.info};color:#0f1a1c;padding:9px 18px;border-radius:999px;font-size:.82rem;font-weight:600;line-height:1.45;z-index:9999;pointer-events:none;box-shadow:0 12px 30px rgba(0,0,0,.28);animation:fadeIn .2s ease;text-align:center`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{if(t.parentNode)t.parentNode.removeChild(t);}, 2400);
}
function notifyError(prefix,error){
  const msg = error?.message || String(error || '未知错误');
  showToast(`${prefix}：${msg}`,'danger');
}

async function createOwnedRecord(table,payload,localKey){
  const {data:{session}}=await db.auth.getSession();
  if(session?.user){
    const {data,error}=await db.from(table).insert({...payload,user_id:session.user.id}).select().single();
    if(error)throw error;
    if(!data)throw new Error('服务器未确认保存，请重试');
    return data;
  }
  const row={...payload,_id:crypto.randomUUID(),created_at:new Date().toISOString()};
  const prior=JSON.parse(localStorage.getItem(localKey)||'[]');
  localStorage.setItem(localKey,JSON.stringify([row,...prior]));
  return row;
}

function updateHeaderChromeState(){
  const header=document.querySelector('header');
  const activePage=document.querySelector('.pg.on');
  if(!header||!activePage)return;
  const banner=activePage.querySelector('.tab-banner');
  const shouldSolid=!banner||banner.getBoundingClientRect().bottom<=header.offsetHeight+4;
  header.classList.toggle('header-solid',shouldSolid);
}

window.updateHeaderChromeState=updateHeaderChromeState;

window.addEventListener('scroll',updateHeaderChromeState,{passive:true});
window.addEventListener('resize',updateHeaderChromeState);

const siteScriptLoads=new Map();
function loadSiteScript(src){
  if(siteScriptLoads.has(src))return siteScriptLoads.get(src);
  const pending=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>{script.remove();siteScriptLoads.delete(src);reject(new Error('资源未加载：'+src));};document.head.appendChild(script);});
  siteScriptLoads.set(src,pending);return pending;
}
async function ensureBattleAssets(){
  for(const src of ['js/data/pkm_champions_data.js','js/data/moves_champions_data.js','js/data/items_champions_data.js','js/data/pkm_champions_builds.js'])await loadSiteScript(src);
}

// 为现有各模块提供一致的弹窗焦点、键盘操作和背景锁定。
document.addEventListener('DOMContentLoaded',()=>{
  for(const id of ['ae','ap'])document.getElementById(id)?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();doAuth();}});
  document.querySelectorAll('input[type="file"][accept="image/*"]').forEach(input=>{
    const note=document.createElement('small');note.className='upload-privacy-note';note.textContent='上传截图会生成公开链接，请勿上传敏感信息。';input.closest('label')?.after(note);
  });
  const lazyImages=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const img=entry.target;img.src=img.dataset.src;delete img.dataset.src;lazyImages.unobserve(img);}}),{rootMargin:'120px'});
  document.querySelectorAll('img[data-src]').forEach(img=>lazyImages.observe(img));
  let stack=[],last=null,returnFocus=null,previousOverflow='';
  const focusable=el=>[...el.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex="0"]')].filter(node=>node.getClientRects().length);
  const sync=()=>{
    const open=[...document.querySelectorAll('.ov.on,#ov-play.on,#ov-snap-hist.on')];
    stack=stack.filter(el=>open.includes(el));
    open.forEach(el=>{if(!stack.includes(el))stack.push(el);});
    const active=stack.at(-1)||null;
    if(active===last){if(active)document.body.style.overflow='hidden';return;}
    if(!last&&active){returnFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
    document.querySelectorAll('body > header,body > main,.site-footer,.moment-fab,.pflt').forEach(el=>{if(!active||!el.contains(active))el.inert=Boolean(active);});
    stack.forEach((el,i)=>{el.style.zIndex=String(3200+i);el.setAttribute('role','dialog');el.setAttribute('aria-modal',String(el===active));el.inert=el!==active;});
    if(active){const title=active.querySelector('h2,h3,.pkm-detail-name');if(title){if(!title.id)title.id=active.id+'-title';active.setAttribute('aria-labelledby',title.id);}else active.setAttribute('aria-label','详情窗口');}
    if(last&&!open.includes(last)){last.inert=false;last.removeAttribute('aria-modal');}
    last=active;
    if(active){active.tabIndex=-1;(focusable(active)[0]||active).focus({preventScroll:true});}
    else{document.body.style.overflow=previousOverflow;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
  };
  const pressed=()=>document.querySelectorAll('.pfchip,.pkm-gen-tab,.chip,.prof-avatar-opt,[data-route],.btab,.partner-tab-btn,.library-status-tabs button').forEach(el=>el.setAttribute('aria-pressed',String(el.classList.contains('on')||el.classList.contains('active'))));
  new MutationObserver(()=>{sync();pressed();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{
    if(!last)return;
    if(event.key==='Escape'){
      event.preventDefault();
      if(last.id==='ov-play'&&typeof closePlayMode==='function')closePlayMode();else closeOv(last.id);
    }
    if(event.key==='Tab'){
      const nodes=focusable(last),first=nodes[0],end=nodes.at(-1);
      if(!first){event.preventDefault();last.focus();}
      else if(event.shiftKey&&(document.activeElement===first||!last.contains(document.activeElement))){event.preventDefault();end.focus();}
      else if(!event.shiftKey&&(document.activeElement===end||!last.contains(document.activeElement))){event.preventDefault();first.focus();}
    }
  });
  document.addEventListener('keydown',event=>{
    if(!['Enter',' '].includes(event.key)||event.target.matches('button,input,textarea,select,a'))return;
    const target=event.target.closest('[role="button"][onclick]');
    if(target){event.preventDefault();target.click();}
  });
  const enhance=()=>{
    document.querySelectorAll('div[onclick]:not([role]),span[onclick]:not([role])').forEach(el=>{el.setAttribute('role','button');el.tabIndex=0;});
    document.querySelectorAll('.field').forEach(field=>{const label=field.querySelector('label'),control=field.querySelector('input,textarea,select');if(label&&control?.id)label.htmlFor=control.id;});
    pressed();
  };
  new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});enhance();sync();
});

