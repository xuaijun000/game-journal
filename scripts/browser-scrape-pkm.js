/**
 * 【宝可梦图鉴爬虫】
 * 使用方法：
 * 1. 浏览器打开 https://op.gg/zh-cn/pokemon-champions/pokedex
 * 2. 等页面完全加载（所有卡片出现）
 * 3. 如果有"加载更多"按钮，先点到底
 * 4. 打开 DevTools → Console（F12）
 * 5. 粘贴以下代码，回车运行
 * 6. 自动抓取每只宝可梦详情 → 下载 pkm_champions.json
 */

(async () => {
  const TYPE_MAP = { '火':'fire','水':'water','草':'grass','电':'electric','冰':'ice',
    '格斗':'fighting','毒':'poison','地面':'ground','飞行':'flying','超能力':'psychic',
    '虫':'bug','岩石':'rock','幽灵':'ghost','龙':'dragon','恶':'dark','钢':'steel',
    '一般':'normal','妖精':'fairy' };

  // ── Step 1: 从当前图鉴页提取所有宝可梦 slug ──────────────────────────────
  const slugSet = new Set();
  document.querySelectorAll('a[href*="/pokedex/"]').forEach(a => {
    const parts = a.getAttribute('href').split('/pokedex/');
    const slug  = parts[1]?.split('/')[0]?.split('?')[0];
    if (slug && slug.length > 0 && !/^\d+$/.test(slug)) slugSet.add(slug);
  });

  const slugs = [...slugSet];
  console.log(`找到 ${slugs.length} 只宝可梦，开始逐个抓取详情（预计 ${Math.ceil(slugs.length * 0.8 / 60)} 分钟）...`);

  // ── Step 2: 逐个抓取详情页 ────────────────────────────────────────────────
  const pokemons = [];
  const errors   = [];

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    try {
      const r   = await fetch(`/zh-cn/pokemon-champions/pokedex/${slug}`);
      const txt = await r.text();
      const doc = new DOMParser().parseFromString(txt, 'text/html');

      // 中文名
      const h1 = doc.querySelector('h1');
      const cnName = h1?.textContent?.trim() || slug;

      // 编号
      const numMatch = doc.body.innerText.match(/#(\d+)/);
      const num = numMatch ? parseInt(numMatch[1]) : null;

      // 属性（找属性徽章）
      const types = [];
      doc.querySelectorAll('[class*="type"], [class*="Type"]').forEach(el => {
        const t = el.textContent.trim();
        if (TYPE_MAP[t] && !types.includes(TYPE_MAP[t])) types.push(TYPE_MAP[t]);
      });
      // 备用：从文本中提取
      if (!types.length) {
        const bodyText = doc.body.innerText;
        Object.keys(TYPE_MAP).forEach(zh => {
          if (bodyText.includes(zh) && types.length < 2 && !types.includes(TYPE_MAP[zh])) {
            types.push(TYPE_MAP[zh]);
          }
        });
      }

      // 种族值
      const stats = {};
      const statBody = doc.body.innerText;
      [['hp','HP'],['atk','Attack'],['def','Defense'],['spa','Sp. Atk'],
       ['spd','Sp. Def'],['spe','Speed']].forEach(([k,label]) => {
        const re = new RegExp(label.replace('.','\\.') + '[\\s\\S]{1,80}?(\\d{2,3})');
        const m  = statBody.match(re);
        if (m) stats[k] = parseInt(m[1]);
      });

      // 特性
      const abilities = [];
      doc.querySelectorAll('[class*="ability"], [class*="Ability"]').forEach(el => {
        const t = el.textContent.trim();
        if (t && t.length < 20 && /[\u4e00-\u9fff]/.test(t) && !abilities.includes(t)) {
          abilities.push(t);
        }
      });

      // 可学技能（所有 /moves/ 链接）
      const learnset = [];
      const lSeen = new Set();
      doc.querySelectorAll('a[href*="/moves/"]').forEach(a => {
        const parts = a.getAttribute('href').split('/moves/');
        const mSlug = parts[1]?.split('/')[0]?.split('?')[0];
        if (mSlug && !lSeen.has(mSlug)) {
          lSeen.add(mSlug);
          const cnMove = a.textContent.trim();
          learnset.push({
            slug: mSlug,
            name: cnMove || mSlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
            nameEn: mSlug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
          });
        }
      });

      pokemons.push({ slug, num, cnName, types, stats, abilities, learnset });

      if ((i+1) % 10 === 0 || i === slugs.length-1) {
        console.log(`进度: ${i+1}/${slugs.length} — 最新: ${cnName}`);
      }
    } catch (e) {
      errors.push(slug);
      console.warn(`✗ 失败: ${slug}`);
    }
    await new Promise(r => setTimeout(r, 500)); // 每只间隔 500ms
  }

  pokemons.sort((a, b) => (a.num || 9999) - (b.num || 9999));

  if (errors.length) console.warn(`失败列表: ${errors.join(', ')}`);
  console.log(`✓ 完成，共 ${pokemons.length} 只宝可梦`);

  // ── Step 3: 下载 JSON ──────────────────────────────────────────────────────
  const json = JSON.stringify(pokemons, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'pkm_champions.json' });
  a.click();
  URL.revokeObjectURL(url);
  console.log('已下载 pkm_champions.json');
  return pokemons;
})();
