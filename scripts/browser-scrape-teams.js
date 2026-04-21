/**
 * 【Pokemon Champions 推荐阵容爬虫】
 * 数据来源: championsmeta.io/teams（双打 VGC 锦标赛队伍，每日更新）
 *
 * 使用方法：
 * 1. 浏览器打开 https://championsmeta.io/teams
 * 2. 等页面加载完成
 * 3. 打开 DevTools → Console（F12）
 * 4. 粘贴以下代码，回车运行
 * 5. 自动下载 pkm_champions_teams.js → 放入 js/data/ 即可
 */

(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ── 名称 → slug 标准化 ─────────────────────────────────────────────────────
  const toSlug = name => {
    if (!name) return '';
    let s = name.toLowerCase().trim()
      .replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ùûü]/g,'u')
      .replace(/[ïî]/g,'i').replace(/[ôö]/g,'o')
      .replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
    // 形态前缀重排（Mega Garchomp → mega-garchomp 已正确；Hisui→-hisui 后缀）
    const regionMap = {
      'hisuian-':'hisui-', 'alolan-':'alola-', 'galarian-':'galar-', 'paldean-':'paldea-',
    };
    for (const [k,v] of Object.entries(regionMap)) {
      if (s.startsWith(k)) { s = s.slice(k.length) + '-' + v.slice(0,-1); break; }
    }
    // Rotom forms: "rotom-wash" → "rotom-wash" ✓  "wash-rotom" → "rotom-wash"
    const rotomForms = ['heat','wash','frost','fan','mow'];
    for (const f of rotomForms) {
      if (s === f + '-rotom') { s = 'rotom-' + f; break; }
    }
    return s;
  };

  // ── 提取 __NEXT_DATA__ ────────────────────────────────────────────────────
  const tryNextData = () => {
    try {
      const el = document.getElementById('__NEXT_DATA__');
      if (!el) return null;
      const nd = JSON.parse(el.textContent);
      const pp = nd?.props?.pageProps;
      const teams = pp?.teams || pp?.data?.teams || pp?.teamList;
      if (Array.isArray(teams) && teams.length) return teams;
    } catch(e) {}
    return null;
  };

  // ── 从 __NEXT_DATA__ 规范化队伍 ───────────────────────────────────────────
  const normalizeFromND = (rawTeams) => rawTeams.map(t => ({
    title: t.title || t.name || t.archetype || '',
    player: t.player || t.username || t.author || '',
    pokemon: (t.pokemon || t.team || t.members || []).map(p =>
      toSlug(typeof p === 'string' ? p : (p.name || p.slug || ''))
    ).filter(Boolean).slice(0, 6),
    tournament: t.tournament || t.event || t.source || '',
    date: t.date || t.createdAt || '',
    record: t.record || t.score || '',
    placement: t.placement || t.rank || t.place || 0,
    votes: t.votes || t.likes || 0,
    type: t.type || (t.tournament ? 'tournament' : 'community'),
    url: t.url || t.sourceUrl || t.pasteUrl || '',
  })).filter(t => t.pokemon.length >= 3);

  // ── DOM 解析备用策略 ──────────────────────────────────────────────────────
  const parseFromDOM = () => {
    const teams = [];

    // 策略 1：查找含 6 张宝可梦图片的卡片
    const allCards = Array.from(document.querySelectorAll('[class*="team"],[class*="card"],[class*="Team"],[class*="Card"]'));
    for (const card of allCards) {
      const imgs = Array.from(card.querySelectorAll('img'));
      const pkmImgs = imgs.filter(img => {
        const src = img.src || '';
        return src.includes('pokemon') || src.includes('sprites') || src.includes('pkm') ||
               src.includes('championsmeta') || img.alt?.length > 1;
      });
      if (pkmImgs.length < 3) continue;

      const pokemon = pkmImgs.slice(0, 6).map(img =>
        toSlug(img.alt || img.getAttribute('data-name') || img.src.split('/').pop().replace(/\.\w+$/, ''))
      ).filter(s => s.length > 1);

      if (pokemon.length < 3) continue;

      // 提取文本信息
      const text = card.innerText || card.textContent;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

      // 尝试识别 record（格式 "9-2-0" 或 "11-2"）
      const recordMatch = text.match(/\b(\d{1,2}-\d{1,2}(?:-\d)?)\b/);
      const record = recordMatch ? recordMatch[1] : '';

      // 尝试识别名称（最长的短行通常是标题）
      const title = lines.find(l => l.length > 3 && l.length < 60 && !l.match(/^\d/) && !l.match(/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*$/)) || '';

      // 获取链接
      const link = card.querySelector('a[href*="vrpastes"],a[href*="limitlesstcg"],a[href*="source"]');
      const url = link?.href || '';

      teams.push({ title, player: '', pokemon, tournament: '', date: '', record, placement: 0, votes: 0, type: 'tournament', url });
    }

    // 策略 2：扫描页面所有文本提取 Pokemon 组合
    if (teams.length < 3) {
      const rows = Array.from(document.querySelectorAll('tr,li,[role="row"]'));
      for (const row of rows) {
        const imgs = Array.from(row.querySelectorAll('img')).filter(img =>
          img.alt && img.alt.length > 1 && !img.alt.includes(' ')
        );
        if (imgs.length >= 3) {
          const pokemon = imgs.slice(0, 6).map(img => toSlug(img.alt));
          if (pokemon.filter(Boolean).length >= 3) {
            teams.push({ title: '', player: '', pokemon, tournament: '', date: '', record: '', placement: 0, votes: 0, type: 'tournament', url: '' });
          }
        }
      }
    }

    return teams;
  };

  // ── 主逻辑 ────────────────────────────────────────────────────────────────
  console.log('🔍 正在解析 championsmeta.io/teams 页面...');

  let teamsRaw = tryNextData();
  let teams;

  if (teamsRaw) {
    console.log(`✓ 从 __NEXT_DATA__ 获取 ${teamsRaw.length} 支队伍`);
    teams = normalizeFromND(teamsRaw);
  } else {
    console.log('⚠ 未找到 __NEXT_DATA__，尝试 DOM 解析...');
    teams = parseFromDOM();
    if (!teams.length) {
      // 尝试等待 JS 渲染完成
      await sleep(2000);
      teams = parseFromDOM();
    }
  }

  if (!teams.length) {
    console.error('✗ 未能解析到队伍数据。请确保在 championsmeta.io/teams 页面上运行此脚本，且页面已完全加载。');
    return;
  }

  // 去重（按 pokemon 组合）
  const seen = new Set();
  teams = teams.filter(t => {
    const key = [...t.pokemon].sort().join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 优先锦标赛队伍
  teams.sort((a, b) => {
    if (a.type === 'tournament' && b.type !== 'tournament') return -1;
    if (b.type === 'tournament' && a.type !== 'tournament') return 1;
    return (b.votes || 0) - (a.votes || 0);
  });

  console.log(`✓ 解析完成！共 ${teams.length} 支队伍（锦标赛：${teams.filter(t=>t.type==='tournament').length}，社区：${teams.filter(t=>t.type==='community').length}）`);

  // ── 生成 JS 文件并下载 ─────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const js =
`// 自动生成 — Pokemon Champions 推荐阵容数据（双打 VGC）
// 来源: championsmeta.io/teams，勿手动修改
// 生成时间: ${today}
// 字段: title / player / pokemon(6slugs) / tournament / date / record / placement / type
window.PKM_CHAMPIONS_TEAMS = ${JSON.stringify({ doubles: teams, updated: today }, null, 2)};`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
  a.download = 'pkm_champions_teams.js';
  a.click();
  console.log('✓ 已下载 pkm_champions_teams.js → 放入 js/data/ 即可');
})();
