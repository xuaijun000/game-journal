const DATA_EXPORT_VERSION = 2;
const DATA_TABLES = [
  'games','game_library_views','anime_list','manga_list',
  'play_sessions','play_snapshots','play_logs','game_moments','chat_summaries',
  'game_timelines','media_timelines','battle_teams',
  'pkm_collection','pkm_series_log','pkm_logs','pkm_explore_log','pkm_catch_log','pkm_partner',
  'profiles','battle_records','team_comments','community_match_posts','team_likes','catch_likes','series_likes'
];
const DATA_LOCAL_KEYS = ['gj','gj_library_views','anime_list','manga_list','battle_teams','steamId'];
const DATA_LOCAL_PREFIXES = ['pkm_','frlg_','ptt.'];
const DATA_UPSERTS = {
  game_timelines:'user_id,game_id',
  media_timelines:'user_id,media_id,media_type',
  pkm_series_log:'user_id,series_id',
  pkm_partner:'user_id',
  pkm_collection:'user_id,pkm_id,status'
};

async function getCurrentUser(){
  const {data:{session}} = await db.auth.getSession();
  return session?.user || null;
}

function downloadJsonFile(filename,data){
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}

function readLocalData(){
  const out = {};
  DATA_LOCAL_KEYS.forEach(k=>{
    const v = localStorage.getItem(k);
    if(v != null) out[k] = v;
  });
  DATA_LOCAL_PREFIXES.forEach(prefix=>{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(k?.startsWith(prefix)) out[k] = localStorage.getItem(k);
    }
  });
  return out;
}

async function readRemoteData(user){
  const out = {};
  for(const table of DATA_TABLES){
    out[table]=[];
    for(let offset=0;;offset+=500){
      const {data,error}=await db.from(table).select('*').eq(table==='profiles'?'id':'user_id',user.id).order('id').range(offset,offset+499);
      if(error)throw new Error(`${table}: ${error.message}`);
      out[table].push(...(data||[]));
      if(!data||data.length<500)break;
    }
  }
  return out;
}

async function exportAllData(){
  try{
    const user = await getCurrentUser();
    const stamp = new Date().toISOString().slice(0,10);
    const payload = {
      app:'PIXELFISH',
      version:DATA_EXPORT_VERSION,
      exported_at:new Date().toISOString(),
      source:user?'supabase':'local',
      data:user?await readRemoteData(user):readLocalData(),
      local:readLocalData()
    };
    downloadJsonFile(`pixelfish-export-${stamp}.json`,payload);
    showToast(user?'云端数据已导出':'本地数据已导出','ok');
  }catch(e){
    notifyError('导出失败',e);
  }
}

function openDataImport(){
  document.getElementById('data-import-file')?.click();
}

function cleanRemoteRow(row,userId){
  const next = {...row,user_id:userId};
  delete next._id;
  return next;
}

async function backupRowId(table,source,userId){
  const old=source.id||source._id;
  if(source.user_id===userId&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(old||''))return old;
  const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
  const seed=JSON.stringify([userId,table,old||canonical(source)]);
  const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(seed))).slice(0,16);
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function backupRows(data,table){
  const alias=table==='games'?'gj':table==='game_library_views'?'gj_library_views':table;
  return coerceRows(data?.[table]??data?.[alias]);
}

function coerceRows(value){
  if(Array.isArray(value)) return value;
  if(typeof value === 'string'){
    try{
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    }catch{return [];}
  }
  return [];
}

async function writeTableRows(table,rows,userId){
  if(!Array.isArray(rows) || !rows.length) return 0;
  const cleaned = rows.map(r=>{const next=cleanRemoteRow(r,userId);if(table==='profiles')delete next.user_id;return next;});
  const batchSize = 200;
  let count = 0;
  for(let i=0;i<cleaned.length;i+=batchSize){
    const batch = cleaned.slice(i,i+batchSize);
    const req = DATA_UPSERTS[table]
      ? db.from(table).upsert(batch,{onConflict:DATA_UPSERTS[table]})
      : db.from(table).upsert(batch,{onConflict:'id'});
    const {error} = await req;
    if(error) throw new Error(`${table}: ${error.message}`);
    count += batch.length;
  }
  return count;
}

function importLocalPayload(data){
  let count = 0;
  const remoteMap = {
    games:'gj',
    game_library_views:'gj_library_views',
    anime_list:'anime_list',
    manga_list:'manga_list',
    battle_teams:'battle_teams'
  };
  Object.entries(remoteMap).forEach(([table,key])=>{
    const rows = coerceRows(data?.[table]??data?.[key]);
    if(rows.length){
      const existing=coerceRows(localStorage.getItem(key));
      const merged=new Map(existing.map(r=>[r._id||r.id||JSON.stringify(r),r]));
      rows.forEach(r=>{const c={...r,_id:r._id||r.id};delete c.id;delete c.user_id;merged.set(c._id||JSON.stringify(c),c);});
      localStorage.setItem(key,JSON.stringify([...merged.values()]));
      count += rows.length;
    }
  });
  Object.entries(data || {}).forEach(([key,value])=>{
    if(!Object.values(remoteMap).includes(key)&&(DATA_LOCAL_KEYS.includes(key) || DATA_LOCAL_PREFIXES.some(prefix=>key.startsWith(prefix)))){
      localStorage.setItem(key,typeof value === 'string' ? value : JSON.stringify(value));
      count++;
    }
  });
  return count;
}

async function importRemotePayload(data,user){
  const prepared={},maps={};
  for(const table of DATA_TABLES){
    if(['team_likes','catch_likes','series_likes'].includes(table))continue;
    maps[table]=new Map();prepared[table]=[];
    for(const source of backupRows(data,table)){
      if(!source||typeof source!=='object'||Array.isArray(source))throw new Error(`${table}: 记录格式无效`);
      const id=table==='profiles'?user.id:await backupRowId(table,source,user.id);
      if(source.id||source._id)maps[table].set(String(source.id||source._id),id);
      const row=cleanRemoteRow({...source,id},user.id);
      if(table==='profiles')delete row.user_id;
      prepared[table].push(row);
    }
  }
  // 先完成全部引用映射与预检，再开始写入。跨表恢复顺序与UI列表顺序无关。
  const remap=(row,key,table)=>{
    if(row[key]&&maps[table]?.has(String(row[key])))row[key]=maps[table].get(String(row[key]));
  };
  for(const table of Object.keys(prepared))for(const row of prepared[table]){
    if(['play_sessions','play_logs','play_snapshots'].includes(table))remap(row,'ref_id',row.ref_type==='game'?'games':row.ref_type==='manga'?'manga_list':'anime_list');
    if(['chat_summaries','game_timelines'].includes(table))remap(row,'game_id','games');
    if(table==='media_timelines')remap(row,'media_id',row.media_type==='manga'?'manga_list':'anime_list');
    if(['battle_records','team_comments'].includes(table))remap(row,'team_id','battle_teams');
    // 从备份恢复的个人内容默认私有，分享由作者重新确认。
    if('is_public' in row)row.is_public=false;
    if('likes_count' in row)delete row.likes_count;
  }
  let count = 0;
  const order=['games','anime_list','manga_list','battle_teams',...DATA_TABLES.filter(t=>!['games','anime_list','manga_list','battle_teams'].includes(t))];
  for(const table of order){
    if(!prepared[table])continue;
    const unique=new Map(prepared[table].map(row=>[DATA_UPSERTS[table]?DATA_UPSERTS[table].split(',').map(k=>row[k]).join('|'):row.id,row]));
    count+=await writeTableRows(table,[...unique.values()],user.id);
  }
  // 点赞走受控RPC；已无法访问的原社区记录不阻断个人资料恢复。
  const skipped=[];
  for(const [table,kind,key,target] of [['team_likes','team','team_id','battle_teams'],['catch_likes','catch','catch_id','pkm_catch_log'],['series_likes','series','series_id','pkm_series_log']]){
    for(const row of backupRows(data,table)){
      const id=maps[target]?.get(String(row[key]))||row[key];
      const {error}=await db.rpc('set_community_like',{p_kind:kind,p_id:id,p_liked:true});
      if(error)skipped.push(`${table}: ${error.message}`);else count++;
    }
  }
  if(skipped.length)showToast(`个人数据已恢复，${skipped.length}条已不可访问的点赞未恢复`,'warn');
  return count;
}

async function importAllData(input){
  const file = input?.files?.[0];
  if(!file) return;
  try{
    const raw = await file.text();
    const payload = JSON.parse(raw);
    if(payload?.app !== 'PIXELFISH' || !payload.data) throw new Error('不是有效的 PIXELFISH 备份文件');
    if(payload.version>DATA_EXPORT_VERSION)throw new Error('备份版本较新，请先更新网站');
    if(!confirm('导入会合并到当前账号/本地数据，相同记录会更新；恢复的云端内容默认为私有。分批导入失败时可重试。继续？')) return;
    const user = await getCurrentUser();
    const count = user ? await importRemotePayload(payload.data,user) : importLocalPayload(payload.data);
    if(payload.local)importLocalPayload(payload.local);
    showToast(`导入完成：${count} 条记录`,'ok');
    if(window.load) await load();
    if(window.initMediaList)await initMediaList(typeof currentMediaType !== 'undefined' ? currentMediaType : 'anime');
    if(window.loadBattleTeams){await loadBattleTeams();renderTeamList();renderDTeamList();}
  }catch(e){
    notifyError('导入失败',e);
  }finally{
    input.value = '';
  }
}
