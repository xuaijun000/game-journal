/* Individual adventure records. Reuses the existing JSON columns; no schema migration. */
function newAdventureId(){return crypto.randomUUID();}
function adventureStorageKey(key){
  if(!/^pkm_(party|progress|hunt|train_ev|adventure|sync_pending|train_draft)_/.test(key))return key;
  const owner=typeof authUserId==='undefined'||!authUserId?'guest':authUserId;
  return `pkm_account_${owner}:${key}`;
}
function readLegacyAdventureValue(key){
  if(!/^pkm_(party|progress|hunt|train_ev)_/.test(key))return null;
  const value=localStorage.getItem(key);if(value==null)return null;
  const owner=typeof authUserId==='undefined'||!authUserId?'guest':authUserId;
  const claimant=localStorage.getItem('pkm_legacy_storage_owner');
  if(claimant&&claimant!==owner)return null;
  if(!claimant)localStorage.setItem('pkm_legacy_storage_owner',owner);
  return value;
}
function emptyAdventureEVs(){return Object.fromEntries(EV_STATS.map(s=>[s.key,0]));}
function resetAdventureCatchFields(){
  ['lv','ability','ball','moves'].forEach(key=>{const input=document.getElementById('catch-'+key);if(input)input.value='';});
}
function readAdventureCatchFields(){
  const lv=document.getElementById('catch-lv')?.value?.trim()||'';
  if(lv&&(!Number.isInteger(Number(lv))||Number(lv)<1||Number(lv)>100)){showToast('等级请填 1–100 的整数，或留空');return null;}
  const moves=(document.getElementById('catch-moves')?.value||'').split(/[、,，\n]/).map(x=>x.trim()).filter(Boolean);
  if(moves.length>4){showToast('最多填写四个招式');return null;}
  return {lv,ability:document.getElementById('catch-ability')?.value?.trim()||'',ball:document.getElementById('catch-ball')?.value?.trim()||'',moves};
}
function renderAdventureTrainingHistory(){
  const list=document.getElementById('adventure-training-history');if(!list)return;
  const sessions=Object.values(adventureMeta(_trainSid,'sessions')).filter(s=>s.individualId===_trainPkmData?.individualId).sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt));
  list.innerHTML=sessions.length?sessions.map(s=>`<div class="adventure-history-row"><time>${esc(new Date(s.savedAt).toLocaleString('zh-CN'))}</time><span>${esc(s.loc)} · ${s.beats} 只 · ${esc(s.evText||'无 EV 收获')}</span></div>`).join(''):'<p class="adventure-help">这只宝可梦还没有已结算的训练记录。</p>';
}
function cleanAdventureEVs(value){
  return Object.fromEntries(EV_STATS.map(s=>[s.key,Math.max(0,Math.min(252,Math.floor(Number(value?.[s.key])||0)))]));
}
function adventureMeta(sid,name){return lsGet(`pkm_adventure_${name}_${sid}`)||{};}
function setAdventureMeta(sid,name,value){lsSet(`pkm_adventure_${name}_${sid}`,value);}
function individualProfiles(sid){return adventureMeta(sid,'individuals');}
function saveIndividualProfile(sid,profile,{sync=true}={}){
  const profiles=individualProfiles(sid);
  profiles[profile.individualId]={...profiles[profile.individualId],...profile};
  setAdventureMeta(sid,'individuals',profiles);
  if(sync)debounceSyncTrainEVs(sid);
  return profiles[profile.individualId];
}
function normalizeAdventureParty(sid,party){
  let changed=false;
  const claims=adventureMeta(sid,'legacyClaims');
  const profiles=individualProfiles(sid);
  const list=party.map((p,index)=>{
    if(!p)return null;
    const individualId=p.individualId||`legacy-${sid}-${index}-${p.pkmId}`;
    const member={...p,individualId};
    if(!p.individualId)changed=true;
    // Also handles a party ID reaching the cloud before its EV migration.
    if(individualId.startsWith('legacy-')){
      if(!claims[p.pkmId]){
        changed=true;
        claims[p.pkmId]=individualId;
        const old=lsGet(`pkm_train_ev_${sid}_${p.pkmId}`);
        if(old&&!lsGet(`pkm_train_ev_${sid}_${individualId}`))lsSet(`pkm_train_ev_${sid}_${individualId}`,cleanAdventureEVs(old));
      }
    }
    profiles[individualId]={...profiles[individualId],...member};
    return member;
  });
  if(changed){lsSet('pkm_party_'+sid,list);setAdventureMeta(sid,'legacyClaims',claims);}
  setAdventureMeta(sid,'individuals',profiles);
  return list;
}
function hydrateAdventureTraining(sid,data){
  Object.entries(data||{}).forEach(([id,value])=>{
    if(id.startsWith('_'))setAdventureMeta(sid,id.slice(1),value);
    else setTrainEVs(sid,id,value,{sync:false});
  });
}
function adventureTrainingMetadata(sid){
  return Object.fromEntries(['individuals','goals','legacyClaims','sessions'].map(name=>['_'+name,adventureMeta(sid,name)]));
}
const _adventureSyncState={};
const _adventureSyncChains={};
function adventurePending(sid){return lsGet('pkm_sync_pending_'+sid)||{};}
function renderAdventureSync(){
  const el=document.getElementById('adventure-sync-status');if(!el)return;
  const sid=_curSid||_immSid;
  const state=_adventureSyncState[sid];
  el.textContent=state?.text||'记录保存在此设备';
  el.dataset.state=state?.kind||'local';
  const retry=document.getElementById('adventure-sync-retry');
  if(retry)retry.hidden=!['error','pending'].includes(state?.kind);
}
function setAdventureSyncStatus(sid,kind,text){_adventureSyncState[sid]={kind,text};renderAdventureSync();}
async function persistAdventureField(sid,field,value){
  const actor=typeof authUserId==='undefined'?null:authUserId;
  const snapshot=cloneJson(value);
  const ticket=newAdventureId();
  const pending=adventurePending(sid);
  pending[field]={owner:typeof authUserId==='undefined'?null:authUserId,value:snapshot,ticket};
  lsSet('pkm_sync_pending_'+sid,pending);
  let user;
  try{const result=await db.auth.getSession();user=result.data?.session?.user;}catch{}
  if((typeof authUserId==='undefined'?null:authUserId)!==actor)return {error:new Error('账号已切换，原记录保留在原账号的本机缓存')};
  if(!user){setAdventureSyncStatus(sid,'local','已保存在此设备 · 登录后可同步');return {local:true};}
  const staged=adventurePending(sid);
  if(staged[field]?.ticket===ticket){staged[field].owner=user.id;lsSet('pkm_sync_pending_'+sid,staged);}
  setAdventureSyncStatus(sid,'pending','已保存在此设备 · 正在同步');
  const task=async()=>{
    try{
      const current=await db.auth.getSession();
      if((typeof authUserId==='undefined'?null:authUserId)!==actor)throw new Error('账号已切换');
      if(current.data?.session?.user?.id!==user.id)throw new Error('账号已切换，请在原账号重试');
      let result;
      if(pkmSeriesLogs[sid])result=await db.from('pkm_series_log').update({[field]:snapshot}).eq('user_id',user.id).eq('series_id',sid).select('series_id');
      if(!pkmSeriesLogs[sid]||(!result?.error&&Array.isArray(result?.data)&&!result.data.length)){
        result=await db.from('pkm_series_log').upsert({user_id:user.id,series_id:sid,[field]:snapshot},{onConflict:'user_id,series_id'});
      }
      if(result?.error)throw result.error;
      if((typeof authUserId==='undefined'?null:authUserId)!==actor)return {error:new Error('账号已切换')};
      pkmSeriesLogs[sid]={...pkmSeriesLogs[sid],[field]:snapshot};
      const latest=adventurePending(sid);
      if(latest[field]?.ticket===ticket){delete latest[field];lsSet('pkm_sync_pending_'+sid,latest);}
      const outstanding=Object.values(latest).some(item=>item.owner===user.id)||Object.values(individualProfiles(sid)).some(p=>p.catchPending&&(!p.owner||p.owner===user.id));
      setAdventureSyncStatus(sid,outstanding?'pending':'synced',outstanding?'已保存在此设备 · 仍有记录待同步':'已同步到云端');
      return {synced:true};
    }catch(error){
      setAdventureSyncStatus(sid,'error','已保存在此设备 · 云端同步失败，可重试');
      return {error};
    }
  };
  const next=(_adventureSyncChains[sid]||Promise.resolve()).then(task,task);
  _adventureSyncChains[sid]=next;
  return next;
}
async function retryAdventureSync(){
  const sid=_curSid||_immSid;
  const session=await db.auth.getSession();const owner=session.data?.session?.user?.id;
  if(!owner){showToast('登录后可同步，当前记录仍保存在此设备');return;}
  for(const [field,item] of Object.entries(adventurePending(sid))){
    if(!item.owner||item.owner===owner)await syncSeriesField(sid,field,item.value);
  }
  for(const profile of Object.values(individualProfiles(sid))){
    if(profile.catchPending&&(!profile.owner||profile.owner===owner))await syncIndividualCatch(sid,profile);
  }
  await loadCatchList(sid);
}
function canHydrateAdventureField(sid,field){return !adventurePending(sid)[field];}
function profileCatchRow(profile,sid){
  return {id:profile.individualId,series_id:sid,pkm_id:profile.pkmId,pkm_name:profile.name,img:profile.img,
    nickname:profile.nick||null,nature:profile.nature||'unknown',catch_location:profile.location||null,
    manual_note:profile.note||null,base_stats:profile.baseStats||null,ev_yields:profile.evYields||null,
    ai_rec:profile.aiRec||null,created_at:profile.caughtAt||new Date().toISOString(),is_public:!!profile.is_public};
}
async function syncIndividualCatch(sid,profile){
  if(!profile.caughtAt)return {local:true};
  const actor=typeof authUserId==='undefined'?null:authUserId;
  try{
    const session=await db.auth.getSession();const user=session.data?.session?.user;
    if((typeof authUserId==='undefined'?null:authUserId)!==actor)throw new Error('账号已切换');
    if(!user){setAdventureSyncStatus(sid,'local','已保存在此设备 · 登录后可同步');return {local:true};}
    if(profile.owner&&profile.owner!==user.id)throw new Error('请在记录所属账号同步');
    profile={...profile,owner:user.id};saveIndividualProfile(sid,profile);
    const {series_id,pkm_id,pkm_name,img,nickname,nature,catch_location,manual_note,base_stats,ev_yields,ai_rec,created_at}=profileCatchRow(profile,sid);
    const payload={id:profile.individualId,user_id:user.id,series_id,pkm_id,pkm_name,img,nickname,nature,catch_location,manual_note,base_stats,ev_yields,ai_rec,created_at};
    let result=await db.from('pkm_catch_log').upsert(payload,{onConflict:'id'}).select().single();
    if(result.error&&isCatchSchemaCompatError(result.error)){
      const {catch_location,manual_note,...compatible}=payload;
      result=await db.from('pkm_catch_log').upsert(compatible,{onConflict:'id'}).select().single();
      const local=getCatchLocalMeta(sid);local[profile.individualId]={location:profile.location,note:profile.note};setCatchLocalMeta(sid,local);
    }
    if(result.error)throw result.error;
    if((typeof authUserId==='undefined'?null:authUserId)!==actor)return {error:new Error('账号已切换')};
    saveIndividualProfile(sid,{...profile,owner:user.id,catchPending:false});
    return {synced:true};
  }catch(error){
    setAdventureSyncStatus(sid,'error','捕获档案已保存在此设备 · 云端未同步，可重试');
    return {error};
  }
}
let _adventureCatchRows=[];
function mergeAdventureCatches(sid,remote){
  const profiles=individualProfiles(sid),rows=new Map();
  (remote||[]).forEach(row=>{
    const local=profiles[row.id];
    const extra=getCatchExtra(row);
    const profile={individualId:row.id,pkmId:row.pkm_id,name:row.pkm_name,img:row.img,nick:row.nickname||'',nature:row.nature,
      location:extra.location,note:extra.note,caughtAt:row.created_at,baseStats:row.base_stats,evYields:row.ev_yields,aiRec:row.ai_rec,
      owner:row.user_id,is_public:row.is_public,catchPending:false};
    profiles[row.id]=local?.catchPending?{...profile,...local}:{...local,...profile};
    rows.set(row.id,{...row,...profileCatchRow(profiles[row.id],sid)});
  });
  Object.values(profiles).filter(p=>p.caughtAt).forEach(p=>rows.set(p.individualId,{...rows.get(p.individualId),...profileCatchRow(p,sid)}));
  setAdventureMeta(sid,'individuals',profiles);
  return [...rows.values()].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
}
function addCaughtIndividual(index,train=false){
  const row=_adventureCatchRows[index];if(!row)return;
  const sid=row.series_id||_curSid;
  const party=getSeriesParty(sid);
  let slot=party.findIndex(p=>p?.individualId===row.id);
  if(slot<0){
    slot=party.findIndex(p=>!p);
    if(slot<0){showToast('队伍已满，请先腾出一个位置');return;}
    const profile=individualProfiles(sid)[row.id];
    party[slot]={individualId:row.id,pkmId:row.pkm_id,name:row.pkm_name,img:row.img,nick:row.nickname||'',lv:profile?.lv||'',nature:row.nature};
    setSeriesParty(sid,party);renderPartySlots(sid);renderImmParty();
  }
  if(train){_curSid=sid;_trainSid=sid;selectTrainPkmFromImm(slot);setImmMode('train');}
  else showToast('已加入队伍，可直接选择训练');
}
async function editCaughtIndividual(index){
  const row=_adventureCatchRows[index];if(!row)return;
  _curSid=row.series_id;await selectCatchPkm({id:row.pkm_id,name:row.pkm_name,img:row.img});
  _catchEditingId=row.id;
  document.getElementById('catch-nickname').value=row.nickname||'';
  document.getElementById('catch-nature').value=row.nature||'unknown';
  document.getElementById('catch-location').value=getCatchExtra(row).location;
  document.getElementById('catch-note').value=getCatchExtra(row).note;
  const profile=individualProfiles(row.series_id)[row.id];
  for(const key of ['lv','ability','ball','moves']){const input=document.getElementById('catch-'+key);if(input)input.value=key==='moves'?(profile?.moves||[]).join('、'):profile?.[key]||'';}
  document.getElementById('catch-save-btn').textContent='保存档案修改';
  document.getElementById('catch-form-body').scrollIntoView({block:'nearest'});
  updateCatchNatureHint();
}
function renderAdventureTrainControls(){
  const select=document.getElementById('train-individual-select');if(!select)return;
  const party=getSeriesParty(_curSid||_trainSid);
  select.innerHTML='<option value="">选择训练对象</option>'+party.map((p,i)=>p?`<option value="${i}"${p.individualId===_trainPkmData?.individualId?' selected':''}>${esc(p.nick||p.name)} · ${esc(p.name)} · ${i+1}号位</option>`:'').join('');
  select.disabled=!!_trainImmSession;
  renderAdventureTrainingHistory();
}
function renderAdventureTrainPlan(){
  const form=document.getElementById('train-plan-fields');if(!form)return;
  const p=_trainPkmData;
  if(!p){form.innerHTML='<p>选择队伍中的一只宝可梦后设置。</p>';return;}
  const goals=adventureMeta(_trainSid,'goals')[p.individualId]||emptyAdventureEVs();
  form.innerHTML='<div class="training-plan-head"><span>能力</span><span>当前 EV</span><span>目标 EV</span></div>'+EV_STATS.map(s=>`<div class="training-plan-row"><label for="train-current-${s.key}">${s.zh}</label><input id="train-current-${s.key}" aria-label="${s.zh}当前EV" type="number" min="0" max="252" step="1" value="${_trainEVs[s.key]||0}"><input id="train-goal-${s.key}" aria-label="${s.zh}目标EV" type="number" min="0" max="252" step="1" value="${goals[s.key]||0}"></div>`).join('');
}
function applyAdventureTrainPlan(){
  if(!_trainPkmData)return;
  if(_trainImmSession){showToast('先保存或丢弃本次训练，再修正数值');return;}
  const current={},goal={};
  for(const s of EV_STATS){
    for(const [prefix,dest] of [['current',current],['goal',goal]]){
      const value=Number(document.getElementById(`train-${prefix}-${s.key}`).value);
      if(!Number.isInteger(value)||value<0||value>252){showToast('每项 EV 请填写 0–252 的整数');return;}
      dest[s.key]=value;
    }
  }
  if([current,goal].some(values=>Object.values(values).reduce((a,b)=>a+b,0)>510)){showToast('当前值和目标值各自的总和不能超过 510');return;}
  _trainEVs=current;
  setTrainEVs(_trainSid,_trainPkmData.individualId,current,{sync:false});
  const goals=adventureMeta(_trainSid,'goals');goals[_trainPkmData.individualId]=goal;setAdventureMeta(_trainSid,'goals',goals);
  debounceSyncTrainEVs(_trainSid);renderTrainImmEVs();renderTrainImmGrid();
  document.getElementById('train-plan-editor').open=false;
  showToast('当前 EV 和训练目标已保存到此设备');
}
function adventureTrainingHint(pkm){
  if(!_trainPkmData)return '';
  const goals=adventureMeta(_trainSid,'goals')[_trainPkmData.individualId]||{};
  const evs=_trainImmProjectedEVs();
  const suggestions=EV_STATS.flatMap(s=>{
    const remaining=Math.max(0,(goals[s.key]||0)-(evs[s.key]||0));
    const gain=(pkm.evYields?.[s.key]||0)*getBoostMultiplier();
    return remaining&&gain?[`${s.zh}还需 ${Math.ceil(remaining/gain)} 只`]:[];
  });
  return suggestions.join(' · ');
}
function persistAdventureDraft(){
  if(_trainImmSession)lsSet('pkm_train_draft_'+_trainSid,{..._trainImmSession,individualId:_trainPkmData?.individualId,sid:_trainSid});
  else if(_trainSid){const key=adventureStorageKey('pkm_train_draft_'+_trainSid);try{localStorage.removeItem(key);}catch{}delete _lsMem[key];}
}
function restoreAdventureDraft(sid){
  const draft=lsGet('pkm_train_draft_'+sid);
  if(!draft?.beats)return;
  const sessions=adventureMeta(sid,'sessions');
  if(sessions[draft.id])return;
  const index=getSeriesParty(sid).findIndex(p=>p?.individualId===draft.individualId);
  if(index<0)return;
  selectTrainPkmFromImm(index);
  _trainImmSession={...draft,status:'pending',endedAt:draft.endedAt||Date.now()};
  _trainImmRenderSession();renderTrainImmEVs();
  _trainImmShowSummary(_trainImmBuildSummary(),'已恢复上次未保存的训练，请确认或丢弃');
}
let _adventurePokemonSnapshot=null;
async function getAdventurePokemonSnapshot(){
  if(!_adventurePokemonSnapshot)_adventurePokemonSnapshot=fetch('js/data/frlg_pokemon.json').then(r=>{if(!r.ok)throw new Error('本地精灵资料读取失败');return r.json();}).then(data=>data.pokemon).catch(error=>{_adventurePokemonSnapshot=null;throw error;});
  return _adventurePokemonSnapshot;
}
function frlgDistributionKey(sid,loc){
  const version=document.getElementById('adventure-frlg-version')?.value||'firered';
  const method=document.getElementById('adventure-frlg-method')?.value||'walk';
  return sid==='firered-leafgreen'?`${sid}|${loc}|${version}|${method}`:`${sid}|${loc}`;
}
async function loadAdventureFRLGDistribution(key,loc){
  const entry=window.FRLG_ENCOUNTERS?.[key];
  if(!entry)return [];
  const snapshot=await getAdventurePokemonSnapshot();
  const version=document.getElementById('adventure-frlg-version')?.value||'firered';
  const method=document.getElementById('adventure-frlg-method')?.value||'walk';
  const byName=new Map(Object.values(snapshot).map(p=>[p.name,p]));
  return entry.encounters.filter(enc=>enc.versions.includes(version)&&(method==='all'||enc.methods.includes(method))).map(enc=>{
    const p=byName.get(enc.slug);if(!p)return null;
    return {id:p.id,name:PKM_CN_TABLE[p.id]||p.name,img:p.sprites.front_default,evYields:Object.fromEntries(p.stats.filter(s=>s.effort>0).map(s=>[s.stat.name,s.effort])),chance:enc.rate,versions:[version],methods:method==='all'?enc.methods:[method],official:true,minLv:enc.minLv,maxLv:enc.maxLv};
  }).filter(Boolean);
}
async function refreshAdventureLocation(){
  if(_trainImmSession){showToast('先保存或丢弃本次训练，再切换地点或条件');return;}
  const train=_immMode==='train';const selected=train?_trainSelLoc:_huntSelLoc;
  if(!selected)return;
  const key=train?_trainSelEncounterKey:_huntSelEncounterKey;
  const loc=selected.split('|')[1];
  if(train){selectTrainLocFromMap(loc,key);await loadTrainDistribution();}
  else{selectHuntLocFromMap(loc,key);await loadHuntDistribution();renderHuntAreaGrid(null);}
}
