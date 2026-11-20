import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {webcrypto,createHash} from 'node:crypto';
import {parse,parseFragment} from 'parse5';
import {PGlite} from '@electric-sql/pglite';
const root=resolve(import.meta.dirname,'..');
const source=file=>readFile(resolve(root,file),'utf8');
const userA='11111111-1111-4111-8111-111111111111',userB='22222222-2222-4222-8222-222222222222';
const team='33333333-3333-4333-8333-333333333333';
function nodes(tree){return [tree,...(tree.childNodes||[]).flatMap(nodes)];}
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
function memoryStorage(initial={}){const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),key:i=>[...data.keys()][i],get length(){return data.size;}};}
function context(extra={}){
  const noop=()=>{};
  return vm.createContext({console,crypto:webcrypto,TextEncoder,URL,Blob,AbortSignal,structuredClone,setTimeout:noop,clearTimeout:noop,
    window:{addEventListener:noop},document:{addEventListener:noop,getElementById:()=>null,querySelectorAll:()=>[]},localStorage:memoryStorage(),showToast:noop,notifyError:noop,...extra});
}
async function run(file,ctx){return vm.runInContext(await source(file),ctx,{filename:file});}

test('运行时脚本和内联脚本均可解析，HTML没有重复ID或结构解析错误',async()=>{
  for(const entry of ['index.html','pokemon-trainer-terminal/index.html','privacy.html']){
    const errors=[];const tree=parse((await source(entry)).replace(/^\uFEFF/,''),{onParseError:error=>errors.push(error.code)});
    assert.deepEqual(errors,[],`${entry}: ${errors.join(',')}`);
    const ids=new Set();const scripts=[];
    for(const node of nodes(tree)){
      const id=attr(node,'id');if(id){assert(!ids.has(id),`${entry}: duplicate ${id}`);ids.add(id);}
      if(node.tagName==='script'){
        const src=attr(node,'src');
        if(src&&!/^https?:/.test(src)){const file=resolve(root,dirname(entry),src);scripts.push(await readFile(file,'utf8'));}
        else if(!src)scripts.push((node.childNodes||[]).map(n=>n.value||'').join(''));
      }
      for(const name of ['src','href','data-src']){
        const value=attr(node,name);
        if(!value||/^(https?:|data:|#|mailto:)/.test(value))continue;
        const file=resolve(root,dirname(entry),decodeURIComponent(value.split('#')[0].split('?')[0]));
        assert((await stat(file)).isFile()||(await stat(file)).isDirectory(),`${entry}: ${value}`);
      }
    }
    // 经典脚本共享全局词法环境，合并解析可发现跨模块声明冲突。
    new vm.Script(scripts.join('\n;\n'),{filename:entry});
  }
  const walk=async directory=>{for(const item of await readdir(resolve(root,directory),{withFileTypes:true})){const file=`${directory}/${item.name}`;if(item.isDirectory()){if(item.name!=='vendor')await walk(file);}else if(extname(file)==='.js')new vm.Script(await source(file),{filename:file});}};
  await walk('js');await walk('pokemon-trainer-terminal/js');
});

test('公开队名不进入JavaScript事件参数，未知性格和状态仅显示为文字',async()=>{
  const ctx=context();await run('js/utils.js',ctx);await run('js/community.js',ctx);
  const payload=`');globalThis.injected=true;//<img src=x onerror=alert(1)>`;
  const html=ctx.renderTeamCard({id:team,team_name:payload,pokemon:[],created_at:new Date().toISOString()});
  const buttons=nodes(parseFragment(html)).filter(node=>node.tagName==='button');
  assert(buttons.some(node=>attr(node,'data-community-comments')===team));
  assert(buttons.every(node=>!attr(node,'onclick')?.includes('injected')));
  const caught=ctx.renderCatchCard({id:team,nature:payload,pkm_name:'皮卡丘',created_at:new Date().toISOString()});
  assert.equal(nodes(parseFragment(caught)).filter(n=>n.tagName==='img').length,0);
  const series=ctx.renderSeriesCard({id:team,status:payload,party:[],created_at:new Date().toISOString()});
  assert.equal(nodes(parseFragment(series)).filter(n=>n.tagName==='img').length,0);
});

function backupDb(){
  const tables=new Map(),batches=[];
  return {tables,batches,from(table){return {upsert(rows,options){
    assert(rows.every(row=>table==='profiles'?!('user_id' in row):row.user_id));
    const keyFor=row=>(options.onConflict||'id').split(',').map(k=>row[k]).join('|');
    const keys=rows.map(keyFor);assert.equal(new Set(keys).size,keys.length,'同批重复键');
    const prior=tables.get(table)||new Map();rows.forEach(row=>prior.set(keyFor(row),structuredClone(row)));tables.set(table,prior);batches.push({table,rows:structuredClone(rows)});
    return Promise.resolve({error:null});
  }};},rpc:async()=>({data:1,error:null})};
}
test('备份导入不复制同一来源，重试幂等，跨账号恢复重映射引用',async()=>{
  const db=backupDb(),ctx=context({db});await run('js/data-tools.js',ctx);
  const gameId='44444444-4444-4444-8444-444444444444';
  const backup={games:[{id:gameId,user_id:userA,name:'测试游戏'}],anime_list:[{id:'55555555-5555-4555-8555-555555555555',user_id:userA,title:'测试作品'}],play_sessions:[{id:'66666666-6666-4666-8666-666666666666',user_id:userA,ref_type:'game',ref_id:gameId}],profiles:[{id:userA,username:'测试训练师'}]};
  await ctx.importRemotePayload(backup,{id:userB});await ctx.importRemotePayload(backup,{id:userB});
  assert.equal(db.tables.get('anime_list').size,1);assert.equal(db.tables.get('games').size,1);
  const game=[...db.tables.get('games').values()][0],session=[...db.tables.get('play_sessions').values()][0];
  assert.notEqual(game.id,gameId);assert.equal(session.ref_id,game.id);assert.equal(game.user_id,userB);
  assert.equal([...db.tables.get('profiles').values()][0].id,userB);
});
test('本地导入合并且不丢已有记录，离线工作台键包含在备份中',async()=>{
  const localStorage=memoryStorage({gj:JSON.stringify([{_id:'old',name:'旧记录'}]),'ptt.team.v1':'[25]'}),ctx=context({localStorage});await run('js/data-tools.js',ctx);
  ctx.importLocalPayload({gj:[{_id:'new',name:'新记录'}]});ctx.importLocalPayload({gj:[{_id:'new',name:'新记录'}]});
  assert.equal(JSON.parse(localStorage.getItem('gj')).length,2);
  assert.equal(ctx.readLocalData()['ptt.team.v1'],'[25]');
});
test('登录迁移写入失败保留原始本地副本，成功后才清理',async()=>{
  const localStorage=memoryStorage({gj:'[{"_id":"old","name":"记录"}]'});
  const ctx=context({localStorage,importRemotePayload:async()=>{throw new Error('RLS denied');}});await run('js/auth.js',ctx);
  await assert.rejects(ctx.migrateLocalGames({id:userA}),/RLS denied/);
  assert(localStorage.getItem('gj'));
  ctx.importRemotePayload=async()=>1;await ctx.migrateLocalGames({id:userA});assert.equal(localStorage.getItem('gj'),null);
});
test('点赞失败不改变按钮与已赞集合，重试成功才显示服务端计数',async()=>{
  const errors=[],btn={disabled:false,dataset:{},classList:{toggle(){}},innerHTML:'原始计数'};
  const db={auth:{getSession:async()=>({data:{session:{user:{id:userA}}}})},rpc:async()=>({data:null,error:{message:'失败'}})};
  const ctx=context({db,notifyError:(...args)=>errors.push(args)});await run('js/community.js',ctx);
  await ctx.likeTeam(team,btn);assert.equal(btn.innerHTML,'原始计数');assert.equal(btn.disabled,false);assert.equal(errors.length,1);
  db.rpc=async()=>({data:7,error:null});await ctx.likeTeam(team,btn);assert(btn.innerHTML.includes('7'));assert.equal(btn.dataset.liked,'true');
});
test('SDK未加载时本地模式仍可启动，云端写入给出明确错误',async()=>{
  const ctx=context();await run('js/config.js',ctx);
  const result=await vm.runInContext('db.auth.getSession()',ctx);assert.equal(result.data.session,null);
  const failed=await vm.runInContext("db.from('games').insert({}).select().single()",ctx);assert(failed.error);
});
test('云端队伍保存失败不修改列表或假报成功，也不落入访客缓存',async()=>{
  let closed=false;
  const db={auth:{getSession:async()=>({data:{session:{user:{id:userA}}}})},from:()=>({insert:()=>({select:()=>({single:async()=>({error:new Error('cloud unavailable')})})})})};
  const ctx=context({db,document:{addEventListener(){},getElementById:()=>({value:'新队伍'})}});
  await run('js/battle.js',ctx);
  vm.runInContext("battleTeams=[];battleEditTeam={id:'local_test',team_name:'新队伍',pokemon:[]};gatherSlotForm=()=>{};closeBattleTeamEdit=()=>markClosed();",ctx);
  ctx.markClosed=()=>closed=true;
  await ctx.saveBattleTeam();
  assert.equal(vm.runInContext('battleTeams.length',ctx),0);assert.equal(closed,false);assert.equal(ctx.localStorage.getItem('battle_teams'),null);
});
test('分享直接读取词法队伍状态，不依赖window属性',async()=>{
  let updated=null;
  const db={from:()=>({update:row=>({eq:async()=>{updated=row;return {error:null};}})})};
  const ctx=context({db});await run('js/battle.js',ctx);await run('js/community.js',ctx);
  vm.runInContext(`battleTeams=[{id:'${team}',team_name:'已保存队伍',pokemon:[]}];communityProfile={username:'训练师'};_requireProfile=async()=>true;`,ctx);
  await ctx.toggleShareTeam(team,'singles');
  assert.equal(updated.is_public,true);assert.equal(vm.runInContext('battleTeams[0].is_public',ctx),true);assert.equal(ctx.window.battleTeams,undefined);
});
test('图鉴加入未满的短队伍时追加成员，不覆盖已有成员',async()=>{
  const dex={num:120,slug:'pikachu',name:'皮卡丘',types:['electric'],stats:{hp:35},spriteUrl:'https://example.com/25.png'};
  const ctx=context({ensureBattleAssets:async()=>{},go:async()=>{},closeOv(){},prompt:()=> '1'});
  ctx.window.BATTLE_REGISTRY={champions:{pkm:[dex]}};
  await run('js/battle.js',ctx);
  vm.runInContext(`battleTeams=[{id:'${team}',team_name:'队伍',pokemon:[{name:'已有成员一'},{name:'已有成员二'}]}];loadBattleTeams=async()=>{};openBattleTeamEdit=(id,slot)=>{battleEditSlot=slot;battleEditTeam=structuredClone(battleTeams[0]);while(battleEditTeam.pokemon.length<6)battleEditTeam.pokemon.push({});};renderBattleSlotTabs=()=>{};renderBattleSlotForm=()=>{};`,ctx);
  await ctx.addPokedexPokemonToTeam({id:25,name:'pikachu'});
  assert.equal(vm.runInContext('battleEditSlot',ctx),2);assert.equal(vm.runInContext('battleEditTeam.pokemon[0].name',ctx),'已有成员一');assert.equal(vm.runInContext('battleEditTeam.pokemon[2].slug',ctx),'pikachu');
});
test('固定前端依赖与校验清单一致',async()=>{
  const manifest=JSON.parse(await source('js/vendor/manifest.json'));
  for(const [name,file] of [['@supabase/supabase-js','supabase.js'],['chart.js','chart.umd.js']]){
    const bytes=await readFile(resolve(root,'js/vendor',file));assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest[name].sha256);
  }
});

test('真实PostgreSQL内核验证迁移可重跑、匿名/双账号RLS、点赞及排行榜字段',async()=>{
  const db=new PGlite();
  try{
    await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
      create table storage.buckets(id text primary key,name text,public boolean);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;`);
    const main=(await source('scripts/supabase-schema.sql')).replace('create extension if not exists pgcrypto;','');
    const community=await source('scripts/supabase-community-schema.sql');
    await db.exec(main);await db.exec(community);await db.exec(community);
    await db.exec(`insert into auth.users values('${userA}'),('${userB}');
      insert into public.battle_teams(id,user_id,team_name,is_public) values('${team}','${userA}','公开队伍',true);
      insert into public.pkm_catch_log(id,user_id,series_id,pkm_id,pkm_name,is_public) values('77777777-7777-4777-8777-777777777777','${userA}','frlg',25,'皮卡丘',true);
      insert into public.pkm_series_log(id,user_id,series_id,is_public) values('88888888-8888-4888-8888-888888888888','${userA}','frlg',true);
      insert into public.pkm_partner(user_id,pkm_id,pkm_name,is_public,diary,inventory,interaction_counts) values('${userA}',25,'皮卡丘',true,'["私密日记"]','{"private":true}','{"total":"bad"}');`);
    const actor=async(role,id='')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec(`set role ${role}`);};
    await actor('anon');
    assert.equal((await db.query('select count(*)::integer n from public.battle_teams')).rows[0].n,1);
    // 排行榜函数返回白名单；整行伙伴表无匿名授权。
    const leaderboard=(await db.query('select * from public.get_partner_leaderboard()')).rows;
    assert.equal(leaderboard.length,1);assert(!('diary' in leaderboard[0]));assert(!('inventory' in leaderboard[0]));assert.equal(leaderboard[0].interaction_total,0);
    await assert.rejects(db.query('select diary from public.pkm_partner'));
    await actor('authenticated',userB);
    assert.equal((await db.query('select count(*)::integer n from public.pkm_partner')).rows[0].n,0);
    assert.equal((await db.query(`select public.set_community_like('team','${team}',true) n`)).rows[0].n,1);
    assert.equal((await db.query(`select public.set_community_like('team','${team}',true) n`)).rows[0].n,1);
    for(const [kind,id] of [['catch','77777777-7777-4777-8777-777777777777'],['series','88888888-8888-4888-8888-888888888888']]){
      assert.equal((await db.query(`select public.set_community_like('${kind}','${id}',true) n`)).rows[0].n,1);
      assert.equal((await db.query(`select public.set_community_like('${kind}','${id}',true) n`)).rows[0].n,1);
      assert.equal((await db.query(`select public.set_community_like('${kind}','${id}',false) n`)).rows[0].n,0);
    }
    await db.query(`insert into public.team_comments(team_id,user_id,username,content) values('${team}','${userB}','B','公开评论')`);
    assert.equal((await db.query(`update public.battle_teams set team_name='非法修改' where id='${team}' returning id`)).rows.length,0);
    await actor('authenticated',userA);
    await db.query(`update public.battle_teams set is_public=false,likes_count=999 where id='${team}'`);
    assert.equal((await db.query(`select likes_count from public.battle_teams where id='${team}'`)).rows[0].likes_count,1);
    await actor('authenticated',userB);
    assert.equal((await db.query('select * from public.team_comments')).rows.length,0);
    await assert.rejects(db.query(`select public.set_community_like('team','${team}',false)`));
    await assert.rejects(db.query(`insert into public.team_comments(team_id,user_id,username,content) values('${team}','${userB}','B','不能评论私有队伍')`));
    await actor('anon');assert.equal((await db.query('select * from public.battle_teams')).rows.length,0);
  }finally{await db.close();}
});
