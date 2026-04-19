/**
 * 二次修复:
 * 1. 技能中文名 (zh-hans 小写)
 * 2. 12只 slug 不对的宝可梦手动补全
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
const POKEAPI = 'https://pokeapi.co/api/v2';
const DELAY = 280;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── 手动补全 slug → PokeAPI slug ─────────────────────────────────────────────
const SLUG_OVERRIDE = {
  'tauros-paldean':       'tauros-paldea-combat-breed',
  'floette-eternal-flower':'floette-eternal',
  'meowstic':             'meowstic-male',
  'aegislash':            'aegislash-shield',
  'gourgeist':            'gourgeist-average',
  'lycanroc':             'lycanroc-midday',
  'mimikyu':              'mimikyu-disguised',
  'mr.-rime':             'mr-rime',
  'morpeko':              'morpeko-full-belly',
  'basculegion':          'basculegion-male',
  'maushold':             'maushold-family-of-three',
  'palafin':              'palafin-zero',
};

const pkm   = JSON.parse(fs.readFileSync(path.join(OUT, 'pkm_champions_fixed.json'), 'utf8'));
const moves = JSON.parse(fs.readFileSync(path.join(OUT, 'moves_champions_fixed.json'), 'utf8'));

// ── 1. 修复 12 只宝可梦 ────────────────────────────────────────────────────────
console.log('[1/2] 修复 12 只缺失宝可梦...');
const broken = pkm.filter(p => !p.types.length);
console.log('  需修复:', broken.map(p=>p.slug).join(', '));

for (const p of broken) {
  const apiSlug = SLUG_OVERRIDE[p.slug] || p.slug;
  try {
    const r = await fetch(`${POKEAPI}/pokemon/${apiSlug}`);
    if (!r.ok) throw new Error(`${r.status}`);
    const d = await r.json();
    p.types    = d.types.map(t => t.type.name);
    p.stats    = Object.fromEntries(d.stats.map(s => [
      {hp:'hp',attack:'atk',defense:'def','special-attack':'spa','special-defense':'spd',speed:'spe'}[s.stat.name]||s.stat.name,
      s.base_stat
    ]));
    p.abilities = d.abilities.map(a => a.ability.name);
    p.spriteUrl = d.sprites.front_default || '';
    console.log(`  ✓ ${p.slug} → ${apiSlug}: ${p.types.join('/')}`);
  } catch(e) {
    console.warn(`  ✗ ${p.slug} → ${apiSlug}: ${e.message}`);
  }
  await sleep(DELAY);
}

// ── 2. 重新获取技能中文名 (zh-hans 小写) ──────────────────────────────────────
console.log('\n[2/2] 修复技能中文名 (zh-hans)...');
const cache = path.join(OUT, '_fix_moves2_cache.json');
let fixed = fs.existsSync(cache) ? JSON.parse(fs.readFileSync(cache,'utf8')) : {};

let done = 0;
for (const m of moves) {
  if (fixed[m.slug]) continue;
  try {
    const r = await fetch(`${POKEAPI}/move/${m.slug}`);
    if (!r.ok) throw new Error(`${r.status}`);
    const d = await r.json();
    const zhName = d.names?.find(n => n.language.name === 'zh-hans')?.name
                || d.names?.find(n => n.language.name === 'zh-hant')?.name
                || '';
    fixed[m.slug] = zhName || null; // null 表示 PokeAPI 无中文名
    done++;
    if (done % 50 === 0) {
      process.stdout.write(`\r  进度: ${done} 新增 / ${Object.keys(fixed).length} 已完成`);
      fs.writeFileSync(cache, JSON.stringify(fixed, null, 2));
    }
  } catch(e) {
    fixed[m.slug] = null;
  }
  await sleep(DELAY);
}
fs.writeFileSync(cache, JSON.stringify(fixed, null, 2));
console.log(`\n  完成: ${Object.keys(fixed).length} 个技能`);

// 写入中文名
moves.forEach(m => {
  const cn = fixed[m.slug];
  if (cn) m.name = cn;
  // 状态技能 power 强制为 null
  if (m.cat === 'status') m.power = null;
});

// 同时把宝可梦 learnset 里的技能名也更新
const moveMap = {};
moves.forEach(m => { moveMap[m.slug] = m.name; });
pkm.forEach(p => {
  p.learnset = p.learnset.map(l => ({
    ...l,
    name: moveMap[l.slug] || l.name,
  }));
});

// ── 保存 ───────────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(OUT,'pkm_champions_fixed.json'), JSON.stringify(pkm, null, 2));
fs.writeFileSync(path.join(OUT,'moves_champions_fixed.json'), JSON.stringify(moves, null, 2));

const typeOk   = pkm.filter(p=>p.types.length>0).length;
const moveCn   = moves.filter(m=>/[\u4e00-\u9fff]/.test(m.name)).length;
console.log(`\n✓ 完成！宝可梦有属性: ${typeOk}/258，技能有中文名: ${moveCn}/${moves.length}`);
console.log('示例:');
console.log('  地震:', JSON.stringify(moves.find(m=>m.slug==='earthquake')));
console.log('  龙舞:', JSON.stringify(moves.find(m=>m.slug==='dragon-dance')));
console.log('  喷火龙:', pkm.find(p=>p.slug==='charizard')?.cnName, pkm.find(p=>p.slug==='charizard')?.types);
