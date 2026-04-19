/**
 * 【宝可梦图鉴爬虫 v2】
 * 使用方法：
 * 1. 浏览器打开 https://op.gg/zh-cn/pokemon-champions/pokedex
 * 2. 等页面初次加载完（不需要手动滚动）
 * 3. 打开 DevTools → Console（F12）
 * 4. 粘贴以下代码，回车运行
 * 5. 脚本会自动滚动页面加载全部宝可梦，然后逐个抓取详情
 * 6. 最终自动下载 pkm_champions.json
 */

(async () => {
  const TYPE_MAP = { '火':'fire','水':'water','草':'grass','电':'electric','冰':'ice',
    '格斗':'fighting','毒':'poison','地面':'ground','飞行':'flying','超能力':'psychic',
    '虫':'bug','岩石':'rock','幽灵':'ghost','龙':'dragon','恶':'dark','钢':'steel',
    '一般':'normal','妖精':'fairy' };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ── Step 1: 先从 Next.js 内嵌数据里尝试获取完整列表 ──────────────────────
  let slugsFromNextData = [];
  try {
    const nd = window.__NEXT_DATA__;
    if (nd) {
      const str = JSON.stringify(nd);
      const matches = str.matchAll(/"slug"\s*:\s*"([a-z0-9\-]+)"/g);
      for (const m of matches) slugsFromNextData.push(m[1]);
      // 也尝试 pageProps 里的列表
      const props = nd?.props?.pageProps;
      if (props) {
        const entries = props?.pokemons || props?.data?.pokemons || props?.list || [];
        if (Array.isArray(entries) && entries.length > 0) {
          console.log(`✓ 从 __NEXT_DATA__ 找到 ${entries.length} 个条目`);
          slugsFromNextData = entries.map(e => e.slug || e.name?.toLowerCase() || '').filter(Boolean);
        }
      }
    }
  } catch(e) {}

  // ── Step 2: 自动滚动让虚拟列表渲染完整 ──────────────────────────────────
  console.log('自动滚动页面加载全部宝可梦...');
  let lastCount = 0;
  let stableRounds = 0;
  for (let round = 0; round < 60; round++) {
    window.scrollTo(0, document.body.scrollHeight);
    await sleep(600);
    const cur = document.querySelectorAll('a[href*="/pokedex/"]').length;
    if (cur === lastCount) { stableRounds++; if (stableRounds >= 3) break; }
    else { stableRounds = 0; lastCount = cur; }
    if (round % 5 === 0) console.log(`  滚动中... DOM 中已有 ${cur} 个链接`);
  }
  window.scrollTo(0, 0);
  await sleep(400);

  // ── Step 3: 从 DOM 收集所有 slug ─────────────────────────────────────────
  const slugSet = new Set(slugsFromNextData);
  document.querySelectorAll('a[href*="/pokedex/"]').forEach(a => {
    const raw = a.getAttribute('href') || '';
    const slug = raw.split('/pokedex/')[1]?.split('/')[0]?.split('?')[0] || '';
    if (slug && slug.length > 1 && !/^\d+$/.test(slug)) slugSet.add(slug);
  });

  // 移除无效 slug（导航链接等）
  ['pokedex','moves','items','abilities'].forEach(s => slugSet.delete(s));

  const slugs = [...slugSet];
  console.log(`共找到 ${slugs.length} 只宝可梦，开始抓取详情（每只约0.8秒）...`);
  if (slugs.length === 0) { console.error('未找到任何宝可梦，请检查页面是否加载完成'); return; }

  // ── Step 4: 逐个抓取详情页 ───────────────────────────────────────────────
  const pokemons = [];
  const errors   = [];
  const base = '/zh-cn/pokemon-champions';

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    try {
      const r   = await fetch(`${base}/pokedex/${slug}`);
      if (!r.ok) { errors.push(slug); continue; }
      const txt = await r.text();
      const doc = new DOMParser().parseFromString(txt, 'text/html');

      // Next.js 内嵌数据（最准确）
      let cnName = '', num = null, types = [], stats = {}, abilities = [], learnsetSlugs = [];
      const scriptTags = doc.querySelectorAll('script#__NEXT_DATA__');
      if (scriptTags.length) {
        try {
          const nd = JSON.parse(scriptTags[0].textContent);
          const pkm = nd?.props?.pageProps?.pokemon || nd?.props?.pageProps?.data;
          if (pkm) {
            cnName   = pkm.name_ko || pkm.name_zh || pkm.name || '';  // op.gg 中文站
            num      = pkm.id || pkm.pokedex_id || null;
            const t1 = pkm.type1 || pkm.types?.[0]?.name || '';
            const t2 = pkm.type2 || pkm.types?.[1]?.name || '';
            if (t1) types.push(t1.toLowerCase());
            if (t2) types.push(t2.toLowerCase());
            const bs = pkm.base_stats || pkm.stats || {};
            stats = {
              hp : bs.hp  || bs.HP  || 0,
              atk: bs.attack   || bs.atk || 0,
              def: bs.defense  || bs.def || 0,
              spa: bs.special_attack  || bs.spa || 0,
              spd: bs.special_defense || bs.spd || 0,
              spe: bs.speed || bs.spe || 0,
            };
            abilities = (pkm.abilities || []).map(a => a.name || a.name_zh || a).filter(Boolean);
            learnsetSlugs = (pkm.moves || pkm.learnset || []).map(m => m.slug || m.name || '').filter(Boolean);
          }
        } catch(e) {}
      }

      // 回退：从渲染 HTML 解析
      if (!cnName) {
        const h1 = doc.querySelector('h1');
        cnName = h1?.textContent?.trim() || slug;
      }
      if (!num) {
        const m = doc.body.innerText.match(/#(\d+)/);
        num = m ? parseInt(m[1]) : null;
      }
      if (!types.length) {
        doc.querySelectorAll('[class*="type"],[class*="Type"]').forEach(el => {
          const t = el.textContent.trim();
          if (TYPE_MAP[t] && types.length < 2 && !types.includes(TYPE_MAP[t])) types.push(TYPE_MAP[t]);
        });
      }
      if (!Object.keys(stats).length) {
        const txt2 = doc.body.innerText;
        [['hp','HP'],['atk','Attack'],['def','Defense'],
         ['spa','Sp. Atk'],['spd','Sp. Def'],['spe','Speed']].forEach(([k,lbl]) => {
          const m = txt2.match(new RegExp(lbl.replace('.','\\.')+'[\\s\\S]{1,80}?(\\d{2,3})'));
          if (m) stats[k] = parseInt(m[1]);
        });
      }
      if (!abilities.length) {
        doc.querySelectorAll('[class*="ability"],[class*="Ability"]').forEach(el => {
          const t = el.textContent.trim();
          if (t && t.length < 20 && /[\u4e00-\u9fff]/.test(t) && !abilities.includes(t)) abilities.push(t);
        });
      }

      // 可学技能（从链接）
      const learnset = [];
      const lSeen = new Set(learnsetSlugs);
      doc.querySelectorAll('a[href*="/moves/"]').forEach(a => {
        const mSlug = a.getAttribute('href').split('/moves/')[1]?.split('/')[0]?.split('?')[0] || '';
        if (!mSlug) return;
        lSeen.add(mSlug);
        const cnMove = a.textContent.trim();
        if (!learnset.find(l => l.slug === mSlug)) {
          learnset.push({
            slug: mSlug,
            name: cnMove || mSlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
            nameEn: mSlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
          });
        }
      });
      // 补充 Next.js 数据里的 learnset slugs
      for (const ms of learnsetSlugs) {
        if (!learnset.find(l => l.slug === ms)) {
          learnset.push({ slug: ms, name: ms.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), nameEn: ms.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) });
        }
      }

      pokemons.push({ slug, num, cnName, types, stats, abilities, learnset });

      if ((i+1) % 10 === 0 || i === slugs.length-1) {
        console.log(`进度: ${i+1}/${slugs.length} — ${cnName || slug}`);
      }
    } catch (e) {
      errors.push(slug);
      console.warn(`✗ 失败: ${slug} —`, e.message);
    }
    await sleep(800);
  }

  pokemons.sort((a, b) => (a.num || 9999) - (b.num || 9999));
  if (errors.length) console.warn(`失败: ${errors.join(', ')}`);
  console.log(`✓ 抓取完成，共 ${pokemons.length} 只宝可梦`);

  // ── Step 5: 下载 JSON ────────────────────────────────────────────────────
  const json = JSON.stringify(pokemons, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: 'pkm_champions.json' }).click();
  URL.revokeObjectURL(url);
  console.log('已下载 pkm_champions.json');
  return pokemons;
})();
