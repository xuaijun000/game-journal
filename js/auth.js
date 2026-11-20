let authUserId=null,authGeneration=0,authBusy=false;
async function init(){
  const{data:{session}}=await db.auth.getSession();
  setUser(session?.user||null);
  db.auth.onAuthStateChange((event,s)=>{
    if(event==='PASSWORD_RECOVERY'){am('reset');go('auth',null);}
    const previousId=authUserId,changed=(s?.user?.id||null)!==authUserId;
    setUser(s?.user||null);
    // 清除已下载的私人DOM/异步任务，阻止旧账号请求在新会话中回填。
    if(changed&&previousId){location.reload();return;}
    if(changed)setTimeout(()=>refreshUserPages().catch(e=>notifyError('加载账户失败',e)),0);
  });
  await load();
  if(new URL(location.href).searchParams.get('recovery')==='1'&&session?.user){am('reset');history.replaceState(null,'','#auth');}
  restoreRoute();
  if(window.updateHeaderChromeState)window.updateHeaderChromeState();
}
function setUser(u){
  const nextId=u?.id||null;
  if(nextId!==authUserId){authGeneration++;resetPrivateState();authUserId=nextId;}
  const av=document.getElementById('av'),ab=document.getElementById('abtn');
  if(u){
    av.textContent=(u.email||'训练师').slice(0,2).toUpperCase();ab.textContent='账号';ab.onclick=()=>go('auth',null);
  }
  else{av.textContent='?';ab.textContent='登录';ab.onclick=()=>go('auth',null);if(window.clearPartnerSession)window.clearPartnerSession();}
  document.getElementById('account-signout')?.toggleAttribute('hidden',!u);
}
function resetPrivateState(){
  games=[];libraryViews=[];mediaData={anime:[],manga:[]};battleTeams=[];
  battleEditTeam=null;battleMyTeamId=null;battleAnalysisMyTeam=null;
  pkmCollection={};pkmSeriesLogs={};pkmChatHistory=[];currentChatPkm=null;aiChatHistory=[];currentSummaries=[];
  communityProfile=null;commFeed=[];commLikedSet.clear();commBattleRecords=[];commMatchPosts=[];
  mediaChatHistory=[];mediaCurrentItem=null;
  ['_animeInited','_mangaInited','_pkmInited','_battleInited','_battlePkmcInited','_battleDoublesInited','_partnerInited'].forEach(k=>window[k]=false);
  document.querySelectorAll('.ov.on').forEach(el=>closeOv(el.id));
  ['anime-grid','manga-grid','battle-team-list','bd-team-list','comm-feed','comm-record-panel','pkm-log-list','pkm-series-grid','pkm-active-catches-row','partner-container','ai-msgs','comm-comments-list'].forEach(id=>{const el=document.getElementById(id);if(el)el.replaceChildren();});
  if(window.clearPartnerSession)window.clearPartnerSession();
  render();
}
async function refreshUserPages(){
  await load();
  restoreRoute();
}
async function signOutAccount(){
  const {error}=await db.auth.signOut();
  if(error){notifyError('退出失败',error);return;}
  setUser(null);go('pkm',null);
}
async function migrateLocalGames(user){
  const original=localStorage.getItem('gj'),generation=authGeneration;
  let local=[];
  try{local=JSON.parse(localStorage.getItem('gj')||'[]');}catch{throw new Error('本地游戏数据无法读取，已保留原始副本');}
  if(!Array.isArray(local)||!local.length)return;
  await importRemotePayload({gj:local},user);
  if(generation===authGeneration&&localStorage.getItem('gj')===original)localStorage.removeItem('gj');
}
async function load(){
  const generation=authGeneration;
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user){const{data,error}=await db.from('games').select('*').eq('user_id',user.id).order('created_at',{ascending:false});if(generation!==authGeneration)return;if(error){notifyError('读取游戏库失败',error);return;}games=data||[];}
  else{try{games=JSON.parse(localStorage.getItem('gj')||'[]');}catch{games=[];}}
  if(window.loadLibraryViews)await loadLibraryViews();
  render();
}
function am(m){amd=m;document.getElementById('t-in').classList.toggle('on',m==='login');document.getElementById('t-up').classList.toggle('on',m==='signup');document.getElementById('asub').textContent=m==='reset'?'设置新密码':m==='login'?'登录':'注册';document.getElementById('ap').autocomplete=m==='login'?'current-password':'new-password';document.getElementById('amsg').textContent='';}
async function doAuth(){
  if(authBusy)return;
  authBusy=true;const submit=document.getElementById('asub');submit.disabled=true;
  try{
  const e=document.getElementById('ae').value.trim(),p=document.getElementById('ap').value;
  const msg=document.getElementById('amsg');
  if(amd==='reset'){
    if(p.length<6){msg.textContent='新密码至少6位';return;}
    const {error}=await db.auth.updateUser({password:p});
    if(!error)am('login');msg.textContent=error?error.message:'密码已更新';return;
  }
  if(!e||!p){msg.textContent='请填写邮箱和密码';msg.className='amsg err';return;}
  msg.textContent=amd==='login'?'登录中…':'注册中…';msg.className='amsg';
  const{error}=amd==='login'?await db.auth.signInWithPassword({email:e,password:p}):await db.auth.signUp({email:e,password:p});
  if(error){msg.textContent=error.message;msg.className='amsg err';}
  else{
    msg.textContent=amd==='login'?'登录成功！':'注册成功，请查收验证邮件';msg.className='amsg ok';
    if(amd==='login'){
      try{const{data:{user}}=await db.auth.getUser();if(user)await migrateLocalGames(user);}
      catch(error){notifyError('本地记录迁移未完成，副本已保留',error);}
      await load();go('pkm',null);
    }
  }
  }catch(error){notifyError('账号操作失败',error);}
  finally{authBusy=false;submit.disabled=false;}
}

async function requestPasswordReset(){
  const email=document.getElementById('ae').value.trim();
  const msg=document.getElementById('amsg');
  if(!email){msg.textContent='请先填写邮箱';return;}
  const redirectTo=new URL('index.html',location.href);redirectTo.hash='auth';
  redirectTo.searchParams.set('recovery','1');
  const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:redirectTo.href});
  msg.textContent=error?error.message:'若邮箱已注册，你将收到密码重置邮件';
}

/* Steam同步 */
