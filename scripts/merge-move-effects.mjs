/**
 * 合并技能效果描述 + 优先度 到 moves_champions_fixed.json
 * 输出：js/data/moves_champions_data.js
 * 运行：node scripts/merge-move-effects.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

const moves   = JSON.parse(readFileSync(join(__dir, 'out/moves_champions_fixed.json'),  'utf8'));
const effects = JSON.parse(readFileSync(join(__dir, 'out/moves_effects.json'),           'utf8'));

const effectMap = new Map(effects.map(e => [e.slug, e]));

let withEffect = 0, withPriority = 0;

const merged = moves.map(m => {
  const e = effectMap.get(m.slug);
  const out = { ...m };
  if (e?.effect)              { out.effect   = e.effect;   withEffect++; }
  if (e?.priority != null)    { out.priority = e.priority; withPriority++; }
  return out;
});

// 统计
const missing = merged.filter(m => !m.effect).map(m => `${m.slug}(${m.name})`);
console.log(`总计: ${merged.length} 个技能`);
console.log(`有效果描述: ${withEffect}`);
console.log(`有优先度: ${withPriority}`);
console.log(`无效果描述: ${missing.length}`);
if (missing.length) console.log('缺失:', missing.join(', '));

// 生成 JS 数据文件
const js = `// 自动生成 — Pokemon Champions 技能数据（含效果描述）
// 生成时间：${new Date().toISOString()}
// 效果描述来源：PokeAPI（zh-Hans 优先，无中文回落英文）
// 共 ${merged.length} 个技能，${withEffect} 个有效果描述，${withPriority} 个有优先度字段
(function(){
  const data = ${JSON.stringify(merged, null, 2)};
  if(!window.BATTLE_REGISTRY) window.BATTLE_REGISTRY={};
  if(!window.BATTLE_REGISTRY['champions']) window.BATTLE_REGISTRY['champions']={};
  window.BATTLE_REGISTRY['champions'].moves = data;
})();
`;

const outPath = join(root, 'js/data/moves_champions_data.js');
writeFileSync(outPath, js, 'utf8');
console.log(`\n✓ 已写入 js/data/moves_champions_data.js（${(js.length/1024).toFixed(1)} KB）`);
