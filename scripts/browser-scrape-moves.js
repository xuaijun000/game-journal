/**
 * 【技能数据爬虫】
 * 使用方法：
 * 1. 浏览器打开 https://op.gg/zh-cn/pokemon-champions/moves
 * 2. 等页面完全加载
 * 3. 打开 DevTools → Console（F12）
 * 4. 粘贴以下代码，回车运行
 * 5. 自动下载 moves_champions.json
 */

(async () => {
  const TYPE_MAP = { '火':'fire','水':'water','草':'grass','电':'electric','冰':'ice',
    '格斗':'fighting','毒':'poison','地面':'ground','飞行':'flying','超能力':'psychic',
    '虫':'bug','岩石':'rock','幽灵':'ghost','龙':'dragon','恶':'dark','钢':'steel',
    '一般':'normal','妖精':'fairy' };
  const CAT_MAP  = { '物理':'physical','特殊':'special','状态':'status','变化':'status' };

  const moves = [];
  const seen  = new Set();
  let page = 1;

  const fetchPage = async (url) => {
    const r = await fetch(url, { headers: { 'Accept': 'text/html' } });
    const text = await r.text();
    const doc  = new DOMParser().parseFromString(text, 'text/html');
    return doc;
  };

  // 解析当前 DOM（第1页已加载）
  const parseDoc = (doc) => {
    // 找所有技能行 —— op.gg moves 页面的行结构
    const rows = doc.querySelectorAll('tr, [class*="move-row"], [class*="MoveRow"]');
    rows.forEach(row => {
      const links = row.querySelectorAll('a[href*="/moves/"]');
      if (!links.length) return;
      const href  = links[0].getAttribute('href') || '';
      const slug  = href.split('/moves/')[1]?.split('/')[0] || '';
      if (!slug || seen.has(slug)) return;
      seen.add(slug);

      const texts = [...row.querySelectorAll('td, [class*="cell"], span, div')]
        .map(el => el.textContent.trim()).filter(Boolean);

      // 中文名（含汉字的文本）
      const cnName = texts.find(t => /[\u4e00-\u9fff]/.test(t)) || '';
      // 英文名（从链接文本或 slug）
      const nameEn = links[0].textContent.trim() ||
        slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
      // 属性
      const typeZh = Object.keys(TYPE_MAP).find(t => texts.includes(t)) || '';
      // 分类
      const catZh  = Object.keys(CAT_MAP ).find(c => texts.includes(c)) || '';
      // 威力（整数）
      const nums = texts.map(t => parseInt(t)).filter(n => !isNaN(n) && n > 0);
      const power = nums.find(n => n >= 10 && n <= 250) || null;
      // 命中率（带 % 或 0~100 整数，排除威力）
      const accText = texts.find(t => t.endsWith('%'));
      const acc = accText ? parseInt(accText) : null;
      // PP（通常 5/8/10/15/16/20/25/30/40）
      const validPP = [5,8,10,15,16,20,25,30,40];
      const pp = nums.find(n => validPP.includes(n)) || null;

      moves.push({
        slug, name: cnName || nameEn, nameEn,
        type: TYPE_MAP[typeZh] || typeZh,
        cat : CAT_MAP[catZh]  || catZh,
        power, acc, pp,
      });
    });
  };

  // 解析当前页
  parseDoc(document);

  // 如果有分页，继续抓取（op.gg 通常是单页）
  const total = document.body.innerText.match(/(\d+)\s*招式/)?.[1];
  console.log(`当前页解析到 ${moves.length} 个技能（总计约 ${total || '?'} 个）`);

  // 如果结果太少，尝试直接抓取详情页补全
  if (moves.length < 50) {
    console.warn('行解析结果较少，尝试提取所有 /moves/ 链接...');
    const allLinks = [...document.querySelectorAll('a[href*="/moves/"]')];
    const slugsOnly = [...new Set(allLinks
      .map(a => a.getAttribute('href').split('/moves/')[1]?.split('/')[0])
      .filter(s => s && s.length > 0))];
    console.log(`找到 ${slugsOnly.length} 个技能链接，开始逐个抓取（这需要一些时间）...`);
    let done = 0;
    for (const slug of slugsOnly) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      try {
        const doc2 = await fetchPage(`/zh-cn/pokemon-champions/moves/${slug}`);
        const h1   = doc2.querySelector('h1');
        const cnName = [...(h1?.childNodes||[])].map(n=>n.textContent).find(t=>/[\u4e00-\u9fff]/.test(t))?.trim()||'';
        const nameEn = slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
        // 属性、分类等从详情页提取
        const body = doc2.body.innerText;
        const typeZh = Object.keys(TYPE_MAP).find(t => body.includes(t)) || '';
        const catZh  = Object.keys(CAT_MAP ).find(c => body.includes(c)) || '';
        const powerM = body.match(/威力\D{0,5}(\d+)/);
        const accM   = body.match(/命中\D{0,5}(\d+)/);
        const ppM    = body.match(/PP\D{0,5}(\d+)/);
        moves.push({
          slug, name: cnName||nameEn, nameEn,
          type: TYPE_MAP[typeZh]||typeZh,
          cat : CAT_MAP[catZh]||catZh,
          power: powerM ? parseInt(powerM[1]) : null,
          acc  : accM   ? parseInt(accM[1])   : null,
          pp   : ppM    ? parseInt(ppM[1])    : null,
        });
        done++;
        if (done % 20 === 0) console.log(`  进度: ${done}/${slugsOnly.length - seen.size + done}`);
        await new Promise(r => setTimeout(r, 400));
      } catch(e) {}
    }
  }

  // 下载 JSON
  const json = JSON.stringify(moves, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'moves_champions.json' });
  a.click();
  URL.revokeObjectURL(url);
  console.log(`✓ 下载 moves_champions.json（${moves.length} 个技能）`);
  return moves;
})();
