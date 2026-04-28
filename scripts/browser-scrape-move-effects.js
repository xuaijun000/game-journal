/**
 * 【技能效果描述爬虫 v3 — PokeAPI 数据源】
 * 使用方法：
 * 1. 在任意页面打开 DevTools → Console（F12）
 * 2. 粘贴以下代码，回车运行
 * 3. 自动下载 moves_effects.json
 *
 * 数据来源：PokeAPI（https://pokeapi.co）
 * 效果描述优先用中文（zh-Hans），无中文时回落英文。
 * 断点续传：中途关闭后重新运行，自动跳过已缓存的技能。
 */

(async () => {
  const DELAY_MS  = 120;   // PokeAPI 有速率限制，不要太快
  const CACHE_KEY = '_move_effects_poke_v3';
  const API_BASE  = 'https://pokeapi.co/api/v2/move';

  // ── 读取缓存 ─────────────────────────────────────────────────
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch(e) {}
  console.log(`已缓存 ${Object.keys(cache).length} 个，继续...`);

  // ── 技能 slug 列表（从现有 moves_champions_fixed.json 内嵌）──
  // 如果你在 op.gg moves 页面运行，也可以自动提取
  let slugs = [];

  // 尝试从 op.gg 页面提取
  const opggLinks = [...document.querySelectorAll('a[href*="/moves/"]')];
  if (opggLinks.length > 50) {
    slugs = [...new Set(
      opggLinks
        .map(a => { const m = a.getAttribute('href').match(/\/moves\/([^/?#]+)/); return m?.[1]||null; })
        .filter(Boolean)
    )];
    console.log(`从页面提取到 ${slugs.length} 个 slug`);
  }

  // 如果不在 op.gg 页面，从 window.BATTLE_REGISTRY 读（游戏日志网站）
  if (!slugs.length && window.BATTLE_REGISTRY) {
    const moves = Object.values(window.BATTLE_REGISTRY).flatMap(r => r.moves || []);
    slugs = [...new Set(moves.map(m => m.slug).filter(Boolean))];
    console.log(`从 BATTLE_REGISTRY 提取到 ${slugs.length} 个 slug`);
  }

  if (!slugs.length) {
    console.error('无法获取 slug 列表。请在 op.gg/pokemon-champions/moves 页面运行，或在游戏日志网站运行。');
    return;
  }

  // ── 从 PokeAPI 抓取单个技能 ──────────────────────────────────
  const fetchEffect = async (slug) => {
    try {
      const r = await fetch(`${API_BASE}/${slug}/`);
      if (!r.ok) return { effect: '', priority: null };
      const data = await r.json();

      // 优先级
      const priority = data.priority ?? null;

      // 效果描述：优先 zh-Hans，其次 en
      const effectEntries = data.effect_entries || [];
      const zhEffect = effectEntries.find(e => e.language.name === 'zh-Hans');
      const enEffect = effectEntries.find(e => e.language.name === 'en');
      let effect = (zhEffect?.short_effect || zhEffect?.effect || enEffect?.short_effect || enEffect?.effect || '').trim();

      // 替换 $effect_chance% 占位符为实际数值
      if (data.effect_chance && effect.includes('$effect_chance')) {
        effect = effect.replace(/\$effect_chance/g, data.effect_chance);
      }

      return { effect, priority };
    } catch(e) {
      return { effect: '', priority: null };
    }
  };

  // ── 主循环 ───────────────────────────────────────────────────
  let done = 0, skipped = 0;
  const todo = slugs.filter(s => cache[s] === undefined);
  console.log(`待抓取: ${todo.length}，已缓存: ${slugs.length - todo.length}`);

  for (const slug of todo) {
    cache[slug] = await fetchEffect(slug);
    done++;

    if (done % 20 === 0) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch(e) {}
      const valid = Object.values(cache).filter(v => v?.effect).length;
      console.log(`进度: ${done}/${todo.length}  有效描述: ${valid}`);
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch(e) {}

  // ── 整理输出 ─────────────────────────────────────────────────
  const result = slugs
    .filter(s => cache[s])
    .map(s => {
      const { effect, priority } = cache[s];
      const entry = { slug: s };
      if (effect)         entry.effect   = effect;
      if (priority !== null) entry.priority = priority;
      return entry;
    })
    .filter(e => e.effect || e.priority !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const missing = slugs.filter(s => !cache[s]?.effect);
  console.log(`\n✓ 完成！有效: ${result.filter(e=>e.effect).length}/${slugs.length}`);
  console.log(`顺便收录了优先度字段（priority）`);
  if (missing.length) console.log(`无数据 (${missing.length}):`, missing.join(', '));

  // 下载
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob), download: 'moves_effects.json'
  }).click();
  console.log('已下载 moves_effects.json');
  return result;
})();
