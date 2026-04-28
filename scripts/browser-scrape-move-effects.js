/**
 * 【技能效果描述爬虫 v2】
 * 使用方法：
 * 1. 浏览器打开 https://op.gg/zh-cn/pokemon-champions/moves
 * 2. 等页面完全加载
 * 3. 打开 DevTools → Console（F12）
 * 4. 粘贴以下代码，回车运行
 * 5. 自动下载 moves_effects.json
 *
 * 断点续传：中途关闭后重新运行，自动跳过已抓的技能。
 */

(async () => {
  const DELAY_MS = 350;
  const CACHE_KEY = '_move_effects_cache_v2';

  // ── 读取缓存进度 ─────────────────────────────────────────────
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch(e) {}
  console.log(`已缓存 ${Object.keys(cache).length} 个，继续...`);

  // ── 收集 slugs ───────────────────────────────────────────────
  const allLinks = [...document.querySelectorAll('a[href*="/moves/"]')];
  const slugs = [...new Set(
    allLinks
      .map(a => { const m = a.getAttribute('href').match(/\/moves\/([^/?#]+)/); return m?.[1] || null; })
      .filter(Boolean)
  )];
  if (!slugs.length) { console.error('未找到技能链接'); return; }
  console.log(`共 ${slugs.length} 个技能，开始...`);

  // ── 先测试1个，打印原始数据结构 ─────────────────────────────
  const testSlug = slugs[0];
  console.log(`[诊断] 测试技能: ${testSlug}`);
  const testRes = await fetch(`/zh-cn/pokemon-champions/moves/${testSlug}`, { headers: { Accept: 'text/html' } });
  const testHtml = await testRes.text();
  const testDoc = new DOMParser().parseFromString(testHtml, 'text/html');

  // 尝试提取 __NEXT_DATA__
  const nextDataEl = testDoc.querySelector('#__NEXT_DATA__');
  if (nextDataEl) {
    try {
      const nd = JSON.parse(nextDataEl.textContent);
      console.log('[诊断] __NEXT_DATA__ 顶层 keys:', Object.keys(nd?.props?.pageProps || nd?.props || nd));
      const pp = nd?.props?.pageProps;
      if (pp) console.log('[诊断] pageProps keys:', Object.keys(pp));
      // 打印前300字看结构
      console.log('[诊断] pageProps 前300字:', JSON.stringify(pp).slice(0, 300));
    } catch(e) { console.log('[诊断] __NEXT_DATA__ 解析失败', e); }
  } else {
    console.log('[诊断] 无 __NEXT_DATA__，尝试 DOM');
    // 打印所有 <p> 内容
    const ps = [...testDoc.querySelectorAll('p')].map(p => p.textContent.trim()).filter(Boolean);
    console.log('[诊断] 页面 <p> 标签内容:', ps.slice(0, 10));
    // 打印含中文的 span/div
    const zhEls = [...testDoc.querySelectorAll('span,div,p')]
      .map(el => el.textContent.trim())
      .filter(t => t.length > 10 && t.length < 300 && /[一-鿿]{4,}/.test(t));
    console.log('[诊断] 含中文的元素 (前10):', zhEls.slice(0, 10));
  }

  // ── 提取效果描述（将在诊断后根据实际结构调整）────────────────
  const fetchEffect = async (slug) => {
    const url = `/zh-cn/pokemon-champions/moves/${slug}`;
    try {
      const r = await fetch(url, { headers: { Accept: 'text/html' } });
      if (!r.ok) return '';
      const html = await r.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // 策略1：__NEXT_DATA__ JSON
      const nd = doc.querySelector('#__NEXT_DATA__');
      if (nd) {
        try {
          const data = JSON.parse(nd.textContent);
          const pp = data?.props?.pageProps;
          if (pp) {
            // 递归搜索所有字符串值，找较长的中文描述
            const findDesc = (obj, depth = 0) => {
              if (depth > 6 || !obj) return null;
              if (typeof obj === 'string' && obj.length > 10 && /[一-鿿]{4,}/.test(obj) && obj.length < 400) return obj;
              if (Array.isArray(obj)) { for (const v of obj) { const r = findDesc(v, depth+1); if (r) return r; } }
              if (typeof obj === 'object') {
                // 优先找名字含 effect/description/flavor/detail/desc 的字段
                const priority = ['effect','description','flavor','detail','desc','text','summary','content'];
                for (const k of priority) {
                  if (obj[k]) { const r = findDesc(obj[k], depth+1); if (r) return r; }
                }
                for (const v of Object.values(obj)) { const r = findDesc(v, depth+1); if (r) return r; }
              }
              return null;
            };
            const found = findDesc(pp);
            if (found) return found;
          }
        } catch(e) {}
      }

      // 策略2：class 含 description/effect/flavor
      const descEl = doc.querySelector('[class*="escription"],[class*="ffect"],[class*="lavor"],[class*="etail"],[class*="ummary"]');
      if (descEl) {
        const t = descEl.textContent.trim();
        if (t.length > 10 && /[一-鿿]/.test(t)) return t;
      }

      // 策略3：main/article 里最长中文段落
      const paras = [...doc.querySelectorAll('main p,article p,[role="main"] p')]
        .map(p => p.textContent.trim())
        .filter(t => t.length > 10 && /[一-鿿]{4,}/.test(t) && !/^\d/.test(t));
      if (paras.length) return paras.sort((a,b) => b.length-a.length)[0];

      // 策略4：全页最长中文句子（兜底）
      const all = [...doc.querySelectorAll('p,span,div')]
        .map(el => el.textContent.trim())
        .filter(t => t.length > 15 && t.length < 300 && /[一-鿿]{5,}/.test(t) && !/^\d/.test(t));
      if (all.length) return all.sort((a,b) => b.length-a.length)[0];

      return '';
    } catch(e) { return ''; }
  };

  // ── 主循环 ───────────────────────────────────────────────────
  console.log('\n[诊断完毕，开始正式抓取，请查看上方诊断信息]');
  let done = 0, skipped = 0;
  for (const slug of slugs) {
    if (cache[slug] !== undefined) { skipped++; continue; }
    cache[slug] = await fetchEffect(slug);
    done++;
    if (done % 10 === 0) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch(e) {}
      const valid = Object.values(cache).filter(Boolean).length;
      console.log(`进度: ${done+skipped}/${slugs.length}  有效: ${valid}`);
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch(e) {}

  // ── 下载 ─────────────────────────────────────────────────────
  const result = Object.entries(cache)
    .filter(([,v]) => v)
    .map(([slug, effect]) => ({ slug, effect }))
    .sort((a,b) => a.slug.localeCompare(b.slug));
  const empty = slugs.filter(s => !cache[s]);

  console.log(`\n✓ 完成！有效: ${result.length}/${slugs.length}`);
  if (empty.length) console.log(`无描述 (${empty.length}):`, empty.join(', '));

  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'moves_effects.json' });
  a.click();
  console.log('已下载 moves_effects.json');
  return result;
})();
