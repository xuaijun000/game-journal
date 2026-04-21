/**
 * 【Pokemon Champions 推荐阵容爬虫 — Supabase 直推版】
 * 数据来源: championsmeta.io/teams（双打 VGC 锦标赛队伍，每日更新）
 *
 * 使用方法：
 * 1. 浏览器打开 https://championsmeta.io/teams，等页面完全加载
 * 2. F12 打开 DevTools → Console
 * 3. 粘贴以下全部代码，回车运行
 * 4. 脚本自动解析队伍数据并推送到 Supabase，无需手动下载文件
 * 5. 回到游戏日志 → 对战 → 双打 → 阵容推荐 → 点击「🔄 在线更新」即可看到数据
 *
 * Supabase 建表 SQL（首次使用前在 Dashboard → SQL Editor 执行一次）:
 * CREATE TABLE IF NOT EXISTS pkm_champions_teams (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   title text DEFAULT '',
 *   player text DEFAULT '',
 *   pokemon jsonb DEFAULT '[]'::jsonb,
 *   tournament text DEFAULT '',
 *   date text DEFAULT '',
 *   record text DEFAULT '',
 *   placement int DEFAULT 0,
 *   votes int DEFAULT 0,
 *   type text DEFAULT 'tournament',
 *   url text DEFAULT '',
 *   created_at timestamptz DEFAULT now()
 * );
 * ALTER TABLE pkm_champions_teams ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "public_read" ON pkm_champions_teams FOR SELECT USING (true);
 * CREATE POLICY "anon_write"  ON pkm_champions_teams FOR INSERT WITH CHECK (true);
 * CREATE POLICY "anon_del"    ON pkm_champions_teams FOR DELETE USING (true);
 * GRANT SELECT, INSERT, DELETE ON TABLE pkm_champions_teams TO anon;
 */

(async () => {
  // ─── 配置 ─────────────────────────────────────────────────────────────────
  const SB_URL = 'https://qbzxfwnosacwbdumkvoz.supabase.co';
  const SB_KEY = 'sb_publishable_m-FvqswdlPrigzfyxrBjJA_F9wzPNb2';
  const TABLE  = 'pkm_champions_teams';

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ── 名称 → slug 标准化 ─────────────────────────────────────────────────────
  const toSlug = name => {
    if (!name) return '';
    let s = name.toLowerCase().trim()
      .replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ùûü]/g,'u')
      .replace(/[ïî]/g,'i').replace(/[ôö]/g,'o')
      .replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');

    // 洗翠/阿罗拉等形态后缀重排
    const regionMap = { 'hisuian-':'hisui', 'alolan-':'alola', 'galarian-':'galar', 'paldean-':'paldea' };
    for (const [k,v] of Object.entries(regionMap)) {
      if (s.startsWith(k)) { s = s.slice(k.length) + '-' + v; break; }
    }
    // Rotom 形态：wash-rotom → rotom-wash
    for (const f of ['heat','wash','frost','fan','mow']) {
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

  const normalizeFromND = rawTeams => rawTeams.map(t => ({
    title: t.title || t.name || t.archetype || '',
    player: t.player || t.username || t.author || '',
    pokemon: (t.pokemon || t.team || t.members || []).map(p =>
      toSlug(typeof p === 'string' ? p : (p.name || p.slug || ''))
    ).filter(Boolean).slice(0, 6),
    tournament: t.tournament || t.event || t.source || '',
    date: (t.date || t.createdAt || '').slice(0, 10),
    record: t.record || t.score || '',
    placement: +t.placement || +t.rank || +t.place || 0,
    votes: +t.votes || +t.likes || 0,
    type: t.type || (t.tournament ? 'tournament' : 'community'),
    url: t.url || t.sourceUrl || t.pasteUrl || '',
  })).filter(t => t.pokemon.length >= 3);

  // ── DOM 解析备用 ─────────────────────────────────────────────────────────
  const parseFromDOM = () => {
    const teams = [];
    const allCards = Array.from(document.querySelectorAll('[class*="team"],[class*="card"],[class*="Team"],[class*="Card"]'));
    for (const card of allCards) {
      const imgs = Array.from(card.querySelectorAll('img')).filter(img => {
        const src = img.src || '';
        return (src.includes('pokemon') || src.includes('sprites') || src.includes('pkm') ||
                src.includes('championsmeta')) && img.alt?.length > 1;
      });
      if (imgs.length < 3) continue;
      const pokemon = imgs.slice(0, 6).map(img =>
        toSlug(img.alt || img.getAttribute('data-name') || img.src.split('/').pop().replace(/\.\w+$/, ''))
      ).filter(s => s.length > 1);
      if (pokemon.length < 3) continue;
      const text = card.innerText || '';
      const recordMatch = text.match(/\b(\d{1,2}-\d{1,2}(?:-\d)?)\b/);
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const title = lines.find(l => l.length > 3 && l.length < 60 && !/^\d/.test(l)) || '';
      const link = card.querySelector('a[href*="vrpastes"],a[href*="limitlesstcg"]');
      teams.push({ title, player: '', pokemon, tournament: '', date: '', record: recordMatch?.[1]||'', placement: 0, votes: 0, type: 'tournament', url: link?.href||'' });
    }
    return teams;
  };

  // ── 解析 ─────────────────────────────────────────────────────────────────
  console.log('🔍 解析 championsmeta.io/teams...');
  let rawND = tryNextData();
  let teams;
  if (rawND) {
    console.log(`✓ __NEXT_DATA__ 获取 ${rawND.length} 支`);
    teams = normalizeFromND(rawND);
  } else {
    console.log('⚠ 未找到 __NEXT_DATA__，尝试 DOM 解析...');
    teams = parseFromDOM();
    if (!teams.length) { await sleep(2000); teams = parseFromDOM(); }
  }

  if (!teams.length) {
    console.error('✗ 未解析到队伍。请确保页面已完全加载后再运行。');
    return;
  }

  // 去重
  const seen = new Set();
  teams = teams.filter(t => {
    const key = [...t.pokemon].sort().join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`✓ 解析完成：${teams.length} 支队伍（锦标赛 ${teams.filter(t=>t.type==='tournament').length}，社区 ${teams.filter(t=>t.type==='community').length}）`);

  // ── 推送到 Supabase ───────────────────────────────────────────────────────
  const headers = {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  };

  // 先清空旧数据
  console.log('🗑️  清除旧数据...');
  await fetch(`${SB_URL}/rest/v1/${TABLE}?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE', headers
  });

  // 分批插入（每批 50 条）
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < teams.length; i += BATCH) {
    const batch = teams.slice(i, i + BATCH);
    const res = await fetch(`${SB_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`✗ 批次 ${i}-${i+BATCH} 写入失败：${err}`);
      // 如果是表不存在，给出提示
      if (err.includes('relation') || err.includes('does not exist')) {
        console.error('💡 请先在 Supabase SQL Editor 中执行脚本顶部的建表 SQL，再重新运行此脚本。');
      }
      return;
    }
    inserted += batch.length;
    console.log(`  已写入 ${inserted}/${teams.length} 条`);
  }

  console.log(`✅ 完成！${inserted} 支队伍已推送到 Supabase，刷新游戏日志即可看到数据。`);
})();
