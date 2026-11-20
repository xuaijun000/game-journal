import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const root=new URL('../',import.meta.url);
const source=path=>readFile(new URL(path,root),'utf8');
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),key:i=>[...data.keys()][i],get length(){return data.size;}};}
function element(){return {style:{},dataset:{},value:'',hidden:false,innerHTML:'',textContent:'',options:[],classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},replaceChildren(){},querySelector(){return null;},scrollIntoView(){},setAttribute(){},removeAttribute(){}};}
async function fixture(){
  const elements=new Map();
  const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
  get('train-batch-count').value='1';get('train-boost-sel').value='1';get('adventure-frlg-version').value='firered';get('adventure-frlg-method').value='walk';
  const context=vm.createContext({console,crypto:webcrypto,URL,AbortSignal,Date,Math,localStorage:storage(),window:{},
    document:{getElementById:get,createElement:element,querySelectorAll:()=>[],querySelector:()=>null,body:{style:{}}},
    setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},showToast(){},authUserId:null,esc:s=>String(s??''),
    db:{auth:{getSession:async()=>({data:{session:null}})}},PKM_CN_TABLE:{4:'小火龙',16:'波波',19:'小拉达'},
    fetch:async path=>({ok:true,json:async()=>JSON.parse(await source(path))})});
  const pokemon=await source('js/pokemon.js');
  vm.runInContext(pokemon.slice(pokemon.indexOf('/* ===== 宝可梦专栏 ===== */')),context);
  vm.runInContext(await source('js/adventure.js'),context);
  vm.runInContext(await source('js/data/frlg_encounters.js'),context);
  context.FRLG_ENCOUNTERS=context.window.FRLG_ENCOUNTERS;
  context.originalHuntGrid=context.renderHuntAreaGrid;
  vm.runInContext(`renderHuntList=()=>{};renderHuntAreaGrid=()=>{};renderActiveCatches=async()=>{};renderPartySlots=()=>{};renderImmParty=()=>{};renderTrainEVs=()=>{};spawnCaptureBeam=()=>{};showHuntNarration=()=>{};loadCatchList=async()=>{};_curSid='firered-leafgreen';_immSid=_curSid;_trainSid=_curSid;`,context);
  return {context,get,run:code=>vm.runInContext(code,context)};
}
const plain=value=>JSON.parse(JSON.stringify(value));

test('旧物种EV仅迁移一次，同种个体独立且移除首只不会再继承',async()=>{
  const {context:c,run}=await fixture();
  run(`lsSet('pkm_train_ev_firered-leafgreen_4',{speed:41});lsSet('pkm_party_firered-leafgreen',[{pkmId:4,name:'小火龙'},{pkmId:4,name:'小火龙'}]);`);
  const party=c.getSeriesParty('firered-leafgreen');
  assert.notEqual(party[0].individualId,party[1].individualId);
  assert.equal(c.getTrainEVs('firered-leafgreen',party[0].individualId).speed,41);
  assert.equal(c.getTrainEVs('firered-leafgreen',party[1].individualId).speed,0);
  c.setTrainEVs('firered-leafgreen',party[1].individualId,{speed:8},{sync:false});
  assert.equal(c.getTrainEVs('firered-leafgreen',party[0].individualId).speed,41);
  party[0]=null;c.setSeriesParty('firered-leafgreen',party,{sync:false});
  assert.equal(c.getTrainEVs('firered-leafgreen',c.getSeriesParty('firered-leafgreen')[1].individualId).speed,8);
  const snapshot=c.collectSeriesTrainingEVs('firered-leafgreen');
  const next=await fixture();next.context.hydrateAdventureTraining('firered-leafgreen',snapshot);next.context.setSeriesParty('firered-leafgreen',party,{sync:false});
  assert.equal(next.context.getTrainEVs('firered-leafgreen',party[1].individualId).speed,8);
});

test('一次目标遭遇性格不符只计一次，自由捕获保存实际性格与唯一档案',async()=>{
  const {context:c,run}=await fixture();
  run(`_huntLocPkm=[{id:16,name:'波波',img:''}];_immIdx=0;setSeriesHunts(_immSid,[{pkmId:16,name:'波波',nature:'jolly',count:0,done:false}],{sync:false});`);
  c.huntEncounterFromGrid(0);c.huntSelectNature('adamant');
  assert.equal(c.getSeriesHunts('firered-leafgreen')[0].count,1);
  run(`setSeriesHunts(_immSid,[],{sync:false});_huntActionsLocked=false;`);
  c.startFreeCapture({id:16,name:'波波',img:''});c.huntSelectNature('adamant');
  await Promise.resolve();await Promise.resolve();
  const caught=c.getSeriesHunts('firered-leafgreen')[0];
  assert.equal(caught.nature,'adamant');assert.equal(caught.done,true);assert.equal(caught.count,1);
  const profiles=c.individualProfiles('firered-leafgreen');assert.equal(profiles[caught.individualId].nature,'adamant');
  const rows=c.mergeAdventureCatches('firered-leafgreen',[]);assert.equal(rows.length,1);assert.equal(rows[0].id,caught.individualId);
});

test('捕获档案入队及训练沿用同一个体，重复入队不创建副本',async()=>{
  const {context:c,run}=await fixture();
  const id=webcrypto.randomUUID();c.saveIndividualProfile('firered-leafgreen',{individualId:id,pkmId:4,name:'小火龙',nature:'calm',caughtAt:new Date().toISOString()},{sync:false});
  const rows=c.mergeAdventureCatches('firered-leafgreen',[]);c.renderCatchList(rows);
  c.addCaughtIndividual(0);c.addCaughtIndividual(0);
  const party=c.getSeriesParty('firered-leafgreen');assert.equal(party.filter(Boolean).length,1);assert.equal(party[0].individualId,id);
  run(`fetchPkm=async()=>({sprites:{}});`);c.selectTrainPkmFromImm(0);
  assert.equal(run('_trainPkmData.individualId'),id);
});

test('批量训练按上限实际计入，撤销整批，保存重试不会重复增加EV或伙伴经验',async()=>{
  const {context:c,get,run}=await fixture();
  run(`_trainPkmData={id:4,individualId:'test-individual',name:'小火龙'};_trainEVs=emptyAdventureEVs();_trainEVs.speed=249;_trainLocPkm=[{name:'波波',evYields:{speed:1}}];_trainSelLoc='firered-leafgreen|1号道路';window.partnerTrackTrainingSession=()=>{globalThis.partnerCalls=(globalThis.partnerCalls||0)+1;return '';};`);
  get('train-batch-count').value='20';
  c.startTrainImmSession();c.trainImmBeat(0);
  assert.equal(run('_trainImmProjectedEVs().speed'),252);assert.equal(run('_trainImmSession.beats'),20);assert.equal(run('_trainEVs.speed'),249);
  c.undoTrainImmBeat();assert.equal(run('_trainImmProjectedEVs().speed'),249);assert.equal(run('_trainImmSession.beats'),0);
  c.trainImmBeat(0);c.finishTrainImmSession();await c.saveTrainImmSession();await c.saveTrainImmSession();
  assert.equal(c.getTrainEVs('firered-leafgreen','test-individual').speed,252);assert.equal(c.partnerCalls,1);
  assert.equal(Object.keys(c.adventureMeta('firered-leafgreen','sessions')).length,1);
  assert.equal(c.lsGet('pkm_train_draft_firered-leafgreen'),null);
});

test('从捕获切到训练继承地点并加载实际遭遇，切回时显示各自地点',async()=>{
  const {context:c,get,run}=await fixture();
  run(`_huntSelLoc=frlgDistributionKey(_immSid,'1号道路');_huntSelEncounterKey='kanto-route-1';_trainSelLoc='';_immMode='train';`);
  await c.syncAdventureModeLocation();
  assert.equal(run('_trainSelEncounterKey'),'kanto-route-1');
  assert.equal(run('_trainLocPkm.length'),2);
  assert.match(get('imm-loc').textContent,/1号道路/);
  assert.match(get('adventure-location-status').textContent,/2 种/);
  run(`_immMode='hunt';_huntSelLoc='';_huntSelEncounterKey='';`);
  await c.syncAdventureModeLocation();
  assert.equal(run('_huntSelEncounterKey'),'kanto-route-1');
  assert.equal(run('_huntLocPkm.length'),2);
});

test('训练草稿刷新后恢复且绑定个体，确认前不改正式EV',async()=>{
  const f=await fixture();const c=f.context;
  c.setSeriesParty('firered-leafgreen',[{individualId:'draft-individual',pkmId:4,name:'小火龙'}],{sync:false});
  f.run(`fetchPkm=async()=>({sprites:{}});`);c.selectTrainPkmFromImm(0);
  f.run(`_trainLocPkm=[{name:'波波',evYields:{speed:1}}];_trainSelLoc='firered-leafgreen|1号道路';`);
  c.startTrainImmSession();c.trainImmBeat(0);c._trainImmFinalizeOnClose();
  c.restoreAdventureDraft('firered-leafgreen');
  assert.equal(f.run('_trainImmSession.status'),'pending');assert.equal(f.run('_trainImmProjectedEVs().speed'),1);
  assert.equal(c.getTrainEVs('firered-leafgreen','draft-individual').speed,0);
  c.discardTrainImmSession();assert.equal(c.lsGet('pkm_train_draft_firered-leafgreen'),null);
});

test('直接从训练进入捕获时初始化空状态，隐藏破图并关闭无目标战斗按钮',async()=>{
  const {context:c,get,run}=await fixture();
  run(`renderHuntAreaGrid=originalHuntGrid;_immMode='train';_immIdx=-1;_huntLocPkm=[];`);
  c.setImmMode('hunt');
  assert.match(get('hunt-imm-target').textContent,/自由捕捉/);
  assert.equal(get('hunt-imm-sprite').style.visibility,'hidden');
  assert.equal(get('hunt-imm-num').textContent,'0');
  assert.equal(get('hunt-battle-actions').style.display,'none');
});

test('云端写入失败保留待同步快照，重试成功才清除，不假报成功',async()=>{
  const {context:c,run}=await fixture();
  let failing=true;
  c.db={auth:{getSession:async()=>({data:{session:{user:{id:'user-a'}}}})},from:()=>({upsert:async()=>({error:failing?{message:'network down'}:null})})};
  let result=await c.syncSeriesField('firered-leafgreen','training_evs',{individual:{speed:5}});
  assert(result.error);assert.equal(c.adventurePending('firered-leafgreen').training_evs.value.individual.speed,5);
  assert.equal(run('_adventureSyncState["firered-leafgreen"].kind'),'error');
  assert.equal(run('pkmSeriesLogs["firered-leafgreen"]'),undefined);
  failing=false;result=await c.syncSeriesField('firered-leafgreen','training_evs',{individual:{speed:5}});
  assert(result.synced);assert.deepEqual(plain(c.adventurePending('firered-leafgreen')),{});
  assert.equal(run('_adventureSyncState["firered-leafgreen"].kind'),'synced');
});

test('火红叶绿遭遇列表按版本和方式筛选，133种本地资料覆盖所有遭遇',async()=>{
  const {context:c,get}=await fixture();
  const snapshot=await c.getAdventurePokemonSnapshot();const slugs=new Set(Object.values(snapshot).map(p=>p.name));
  Object.values(c.FRLG_ENCOUNTERS).forEach(e=>e.encounters.forEach(p=>assert(slugs.has(p.slug),p.slug)));
  let items=await c.loadAdventureFRLGDistribution('kanto-route-1','1号道路');
  assert.deepEqual(plain(items.map(p=>p.name).sort()),['小拉达','波波']);assert(items.every(p=>p.evYields.speed===1));
  get('adventure-frlg-method').value='surf';items=await c.loadAdventureFRLGDistribution('kanto-route-1','1号道路');assert.equal(items.length,0);
  get('adventure-frlg-method').value='all';get('adventure-frlg-version').value='leafgreen';items=await c.loadAdventureFRLGDistribution('celadon-city','玉虹市');
  assert(items.every(p=>p.versions.includes('leafgreen')));assert(!items.some(p=>p.id===54));
});

test('账号切换隔离档案、队伍、EV和草稿，旧设备记录仅归属首次迁移账号',async()=>{
  const {context:c,run}=await fixture();
  run(`authUserId='user-a';`);
  c.localStorage.setItem('pkm_party_firered-leafgreen',JSON.stringify([{pkmId:4,name:'旧小火龙'}]));
  assert.equal(c.getSeriesParty('firered-leafgreen')[0].name,'旧小火龙');
  c.saveIndividualProfile('firered-leafgreen',{individualId:'private-id',pkmId:4,name:'私有档案',caughtAt:'2026-11-20'},{sync:false});
  c.setTrainEVs('firered-leafgreen','private-id',{speed:41},{sync:false});
  c.lsSet('pkm_train_draft_firered-leafgreen',{beats:3});
  run(`authUserId='user-b';`);
  assert.equal(c.getSeriesParty('firered-leafgreen').filter(Boolean).length,0);
  assert.deepEqual(plain(c.individualProfiles('firered-leafgreen')),{});
  assert.equal(c.getTrainEVs('firered-leafgreen','private-id').speed,0);
  assert.equal(c.lsGet('pkm_train_draft_firered-leafgreen'),null);
  run(`authUserId='user-a';`);
  assert.equal(c.individualProfiles('firered-leafgreen')['private-id'].name,'私有档案');
  assert.equal(c.getTrainEVs('firered-leafgreen','private-id').speed,41);
});
