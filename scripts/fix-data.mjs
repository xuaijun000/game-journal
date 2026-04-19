/**
 * 修复 pkm_champions.json 和 moves_champions.json 数据质量问题
 * 运行: node scripts/fix-data.mjs
 *
 * 修复内容:
 * 1. pkm: 去掉 cnName 里的 "#NNN" 前缀
 * 2. pkm: 用 PokeAPI 补全 types / stats / abilities
 * 3. moves: 用 PokeAPI 的 zh-Hans 语言获取技能中文名
 * 4. pkm: learnset.name 用修复后的技能中文名补全
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
const POKEAPI = 'https://pokeapi.co/api/v2';
const DELAY = 300; // ms between requests

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function apiFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

// op.gg slug → PokeAPI slug 转换
function toPokeApiSlug(slug) {
  return slug
    .replace(/^mega-(.+)-([xy])$/, '$1-mega-$2')   // mega-charizard-x → charizard-mega-x
    .replace(/^mega-(.+)$/, '$1-mega')              // mega-venusaur → venusaur-mega
    .replace(/-alolan$/, '-alola')                  // raichu-alolan → raichu-alola
    .replace(/-galarian$/, '-galar')                // slowbro-galarian → slowbro-galar
    .replace(/-paldean$/, '-paldea')                // tauros-paldean → tauros-paldea
    // hisui 不变: samurott-hisui → samurott-hisui ✓
    ;
}

// ── 1. 读取原始数据 ───────────────────────────────────────────────────────────
const pkm = JSON.parse(fs.readFileSync(path.join(OUT, 'pkm_champions.json'), 'utf8'));
const moves = JSON.parse(fs.readFileSync(path.join(OUT, 'moves_champions.json'), 'utf8'));

console.log(`读取: ${pkm.length} 只宝可梦, ${moves.length} 个技能\n`);

// ── 2. 修复 pkm cnName（去掉 "#NNN" 前缀） ───────────────────────────────────
console.log('[1/3] 修复宝可梦中文名...');
pkm.forEach(p => {
  p.cnName = p.cnName.replace(/^#\d+\s*/, '').trim();
});
console.log('  示例:', pkm[0].cnName, pkm[2].cnName);

// ── 3. 用 PokeAPI 补全 pkm types/stats/abilities ─────────────────────────────
console.log('\n[2/3] 从 PokeAPI 补全宝可梦属性/种族值/特性...');

const pkmCache = path.join(OUT, '_fix_pkm_cache.json');
let pkmFixed = fs.existsSync(pkmCache) ? JSON.parse(fs.readFileSync(pkmCache, 'utf8')) : {};

let done = 0;
for (const p of pkm) {
  if (pkmFixed[p.slug]) continue;
  const apiSlug = toPokeApiSlug(p.slug);
  try {
    const d = await apiFetch(`${POKEAPI}/pokemon/${apiSlug}`);
    pkmFixed[p.slug] = {
      types: d.types.map(t => t.type.name),
      stats: Object.fromEntries(
        d.stats.map(s => [
          { hp:'hp', attack:'atk', defense:'def',
            'special-attack':'spa', 'special-defense':'spd', speed:'spe' }[s.stat.name] || s.stat.name,
          s.base_stat
        ])
      ),
      abilities: d.abilities.map(a => a.ability.name),
      spriteUrl: d.sprites.front_default || '',
    };
    done++;
    if (done % 20 === 0) {
      process.stdout.write(`\r  进度: ${done} 新增 / ${Object.keys(pkmFixed).length} 已完成`);
      fs.writeFileSync(pkmCache, JSON.stringify(pkmFixed, null, 2));
    }
  } catch(e) {
    console.warn(`\n  ✗ ${p.slug} (→${apiSlug}): ${e.message}`);
    pkmFixed[p.slug] = { types:[], stats:{}, abilities:[], spriteUrl:'' };
  }
  await sleep(DELAY);
}
fs.writeFileSync(pkmCache, JSON.stringify(pkmFixed, null, 2));
console.log(`\n  完成: ${Object.keys(pkmFixed).length} 只`);

// 把 PokeAPI 数据合并回 pkm 数组
pkm.forEach(p => {
  const fix = pkmFixed[p.slug] || {};
  if (fix.types?.length) p.types = fix.types;
  if (fix.stats && Object.keys(fix.stats).length) p.stats = fix.stats;
  if (fix.abilities?.length) p.abilities = fix.abilities;
  if (fix.spriteUrl) p.spriteUrl = fix.spriteUrl;
});

// ── 4. 用 PokeAPI 获取技能中文名 ─────────────────────────────────────────────
console.log('\n[3/3] 从 PokeAPI 获取技能中文名 (zh-Hans)...');

const movesCache = path.join(OUT, '_fix_moves_cache.json');
let movesFixed = fs.existsSync(movesCache) ? JSON.parse(fs.readFileSync(movesCache, 'utf8')) : {};

done = 0;
for (const m of moves) {
  if (movesFixed[m.slug]) continue;
  try {
    const d = await apiFetch(`${POKEAPI}/move/${m.slug}`);
    const zhName = d.names?.find(n => n.language.name === 'zh-Hans')?.name || '';
    const jaName = d.names?.find(n => n.language.name === 'ja')?.name || ''; // 日文备用
    movesFixed[m.slug] = {
      name: zhName || jaName || m.nameEn,
      // 校验 type/cat/power/acc/pp（以 PokeAPI 为准）
      type: d.type?.name || m.type,
      cat: { physical:'physical', special:'special', status:'status' }[d.damage_class?.name] || m.cat,
      power: d.power ?? m.power,
      acc: d.accuracy ?? m.acc,
      pp: d.pp ?? m.pp,
    };
    done++;
    if (done % 50 === 0) {
      process.stdout.write(`\r  进度: ${done} 新增 / ${Object.keys(movesFixed).length} 已完成`);
      fs.writeFileSync(movesCache, JSON.stringify(movesFixed, null, 2));
    }
  } catch(e) {
    // 技能在 PokeAPI 不存在（游戏自定义技能）
    movesFixed[m.slug] = { name: m.nameEn, type: m.type, cat: m.cat, power: m.power, acc: m.acc, pp: m.pp };
  }
  await sleep(DELAY);
}
fs.writeFileSync(movesCache, JSON.stringify(movesFixed, null, 2));
console.log(`\n  完成: ${Object.keys(movesFixed).length} 个`);

// 把中文名合并回 moves 数组
moves.forEach(m => {
  const fix = movesFixed[m.slug] || {};
  m.name = fix.name || m.nameEn;
  if (fix.type) m.type = fix.type;
  if (fix.cat) m.cat = fix.cat;
  if (fix.power !== undefined) m.power = fix.power;
  if (fix.acc !== undefined) m.acc = fix.acc;
  if (fix.pp !== undefined) m.pp = fix.pp;
});

// ── 5. 补全 pkm learnset 中文名 ──────────────────────────────────────────────
const moveMap = {};
moves.forEach(m => { moveMap[m.slug] = m; });
pkm.forEach(p => {
  p.learnset = p.learnset.map(l => ({
    ...l,
    name: moveMap[l.slug]?.name || l.name,
    nameEn: moveMap[l.slug]?.nameEn || l.nameEn,
  }));
});

// ── 6. 保存 ──────────────────────────────────────────────────────────────────
const pkmOut = path.join(OUT, 'pkm_champions_fixed.json');
const movesOut = path.join(OUT, 'moves_champions_fixed.json');
fs.writeFileSync(pkmOut, JSON.stringify(pkm, null, 2));
fs.writeFileSync(movesOut, JSON.stringify(moves, null, 2));

console.log('\n✓ 完成！');
console.log(`  ${pkmOut}`);
console.log(`  ${movesOut}`);

// 打印统计
const typesOk = pkm.filter(p => p.types.length > 0).length;
const statsOk = pkm.filter(p => p.stats.hp > 0).length;
const abilitiesOk = pkm.filter(p => p.abilities.length > 0).length;
const movesCn = moves.filter(m => /[\u4e00-\u9fff]/.test(m.name)).length;
console.log(`\n  宝可梦: types=${typesOk}/258, stats=${statsOk}/258, abilities=${abilitiesOk}/258`);
console.log(`  技能中文名: ${movesCn}/${moves.length}`);
