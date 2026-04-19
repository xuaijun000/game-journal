/**
 * 生成项目用的 JS 数据文件
 * 运行: node scripts/generate-js.mjs
 * 输出:
 *   js/data/pkm_champions_data.js   → window.PKM_CHAMPIONS_DATA
 *   js/data/moves_champions_data.js → window.MOVES_CHAMPIONS_DATA
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT  = path.join(__dirname, 'out');
const DATA = path.join(__dirname, '..', 'js', 'data');
if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

const pkm   = JSON.parse(fs.readFileSync(path.join(OUT,'pkm_champions_fixed.json'),'utf8'));
const moves = JSON.parse(fs.readFileSync(path.join(OUT,'moves_champions_fixed.json'),'utf8'));

// ── 1. 宝可梦数据 ─────────────────────────────────────────────────────────────
// 精简字段，减小文件体积
const pkmData = pkm.map(p => ({
  slug     : p.slug,
  num      : p.num,
  name     : p.cnName,
  types    : p.types,
  stats    : p.stats,
  abilities: p.abilities,
  learnset : p.learnset.map(l => l.slug), // 只存 slug，名字从 moves 查
  spriteUrl: p.spriteUrl || '',
}));

const pkmJs = `// 自动生成 — Pokemon Champions 宝可梦数据 (${pkmData.length} 只)
// 来源: op.gg + PokeAPI，勿手动修改
window.PKM_CHAMPIONS_DATA = ${JSON.stringify(pkmData, null, 2)};
`;

// ── 2. 技能数据 ───────────────────────────────────────────────────────────────
const movesData = moves.map(m => ({
  slug  : m.slug,
  name  : m.name,
  nameEn: m.nameEn,
  type  : m.type,
  cat   : m.cat,
  power : m.power,
  acc   : m.acc,
  pp    : m.pp,
}));

const movesJs = `// 自动生成 — Pokemon Champions 技能数据 (${movesData.length} 个)
// 来源: op.gg + PokeAPI，勿手动修改
window.MOVES_CHAMPIONS_DATA = ${JSON.stringify(movesData, null, 2)};
`;

fs.writeFileSync(path.join(DATA,'pkm_champions_data.js'),   pkmJs);
fs.writeFileSync(path.join(DATA,'moves_champions_data.js'), movesJs);

console.log(`✓ 生成完毕`);
console.log(`  js/data/pkm_champions_data.js   — ${pkmData.length} 只宝可梦`);
console.log(`  js/data/moves_champions_data.js — ${movesData.length} 个技能`);

// 统计
const noName = moves.filter(m=>!/[\u4e00-\u9fff]/.test(m.name));
if (noName.length) console.log(`  无中文名的技能 (${noName.length}): ${noName.map(m=>m.nameEn).join(', ')}`);
