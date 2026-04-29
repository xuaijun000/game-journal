async function init(){
  const s=localStorage.getItem('steamId');if(s)document.getElementById('steam-id-inp').value=s;
  const{data:{session}}=await db.auth.getSession();
  if(session?.user)setUser(session.user);
  db.auth.onAuthStateChange((_,s)=>setUser(s?.user||null));
  await load();
  if(window.updateHeaderChromeState)window.updateHeaderChromeState();
}
function setUser(u){
  const av=document.getElementById('av'),ab=document.getElementById('abtn');
  if(u){
    av.textContent=u.email.slice(0,2).toUpperCase();ab.textContent='登出';ab.onclick=()=>db.auth.signOut().then(()=>{games=[];render();if(window.clearPartnerSession)window.clearPartnerSession();});
    if(window.initPartner&&!window._partnerInited){window._partnerInited=true;initPartner();}
  }
  else{av.textContent='?';ab.textContent='登录';ab.onclick=()=>go('auth',null);if(window.clearPartnerSession)window.clearPartnerSession();}
}
async function load(){
  const{data:{session}}=await db.auth.getSession();const user=session?.user;
  if(user){const{data}=await db.from('games').select('*').eq('user_id',user.id).order('created_at',{ascending:false});games=data||[];}
  else{try{games=JSON.parse(localStorage.getItem('gj')||'[]');}catch{games=[];}}
  render();
}
function am(m){amd=m;document.getElementById('t-in').classList.toggle('on',m==='login');document.getElementById('t-up').classList.toggle('on',m==='signup');document.getElementById('asub').textContent=m==='login'?'登录':'注册';document.getElementById('amsg').textContent='';}
async function doAuth(){
  const e=document.getElementById('ae').value.trim(),p=document.getElementById('ap').value;
  const msg=document.getElementById('amsg');
  if(!e||!p){msg.textContent='请填写邮箱和密码';msg.className='amsg err';return;}
  msg.textContent=amd==='login'?'登录中…':'注册中…';msg.className='amsg';
  const{error}=amd==='login'?await db.auth.signInWithPassword({email:e,password:p}):await db.auth.signUp({email:e,password:p});
  if(error){msg.textContent=error.message;msg.className='amsg err';}
  else{
    msg.textContent=amd==='login'?'登录成功！':'注册成功，请查收验证邮件';msg.className='amsg ok';
    if(amd==='login'){setTimeout(async()=>{let lg=[];try{lg=JSON.parse(localStorage.getItem('gj')||'[]');}catch{}const{data:{user}}=await db.auth.getUser();if(user&&lg.length){const ins=lg.map(g=>{const c={...g,user_id:user.id};delete c.id;delete c._id;return c;});await db.from('games').insert(ins);localStorage.removeItem('gj');}go('list',document.querySelector('nav button'));load();},700);}
  }
}

/* Steam同步 */
