function closeOv(id){document.getElementById(id).classList.remove('on');}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function showToast(msg){
  const t = document.createElement('div');
  t.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--a);color:#fff;padding:8px 20px;border-radius:20px;font-size:.82rem;z-index:9999;pointer-events:none;animation:fadeIn .2s ease';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>document.body.removeChild(t), 2000);
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

