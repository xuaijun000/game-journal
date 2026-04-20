/**
 * 【Pokemon Champions 热门配置爬虫】
 * 数据来源: pikalytics.com/championstournaments
 *
 * 使用方法：
 * 1. 浏览器打开 https://www.pikalytics.com/champions（任意页面即可）
 * 2. 打开 DevTools → Console（F12）
 * 3. 粘贴以下代码，回车运行
 * 4. 约 3 分钟后自动下载 pkm_champions_builds.js
 *
 * 抓取内容：技能 top4 / 道具 top1 / 特性 top1 / 队友 top6
 * 页面格式：服务端渲染，直接 fetch 每只宝可梦的独立 URL
 */

(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const toSlug = name => name.toLowerCase()
    .replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ùûü]/g,'u')
    .replace(/[ïî]/g,'i').replace(/[ôö]/g,'o').replace(/\s+/g,'-')
    .replace(/[^a-z0-9\-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');

  // ── slug 列表（优先读全局数据） ──────────────────────────────────────────
  let slugs = [];
  if (window.PKM_CHAMPIONS_DATA && Array.isArray(window.PKM_CHAMPIONS_DATA)) {
    slugs = window.PKM_CHAMPIONS_DATA.map(p => p.slug).filter(Boolean);
    console.log(`✓ 从 PKM_CHAMPIONS_DATA 读取 ${slugs.length} 只宝可梦`);
  } else {
    // 完整258只 slug 列表（来自 pkm_champions_data.js）
    slugs = [
      'venusaur','mega-venusaur','charizard','mega-charizard-x','mega-charizard-y',
      'blastoise','mega-blastoise','beedrill','mega-beedrill','pidgeot','mega-pidgeot',
      'arbok','pikachu','raichu','raichu-alolan','clefable','mega-clefable',
      'ninetales','ninetales-alolan','arcanine','arcanine-hisui','alakazam','mega-alakazam',
      'machamp','victreebel','mega-victreebel','slowbro','slowbro-galarian','mega-slowbro',
      'gengar','mega-gengar','kangaskhan','mega-kangaskhan','starmie','mega-starmie',
      'pinsir','mega-pinsir','tauros','tauros-paldean','gyarados','mega-gyarados',
      'ditto','vaporeon','jolteon','flareon','aerodactyl','mega-aerodactyl',
      'snorlax','dragonite','mega-dragonite','meganium','mega-meganium',
      'typhlosion','typhlosion-hisui','feraligatr','mega-feraligatr','ariados',
      'ampharos','mega-ampharos','azumarill','politoed','espeon','umbreon',
      'slowking','slowking-galarian','forretress','steelix','mega-steelix',
      'scizor','mega-scizor','heracross','mega-heracross','skarmory','mega-skarmory',
      'houndoom','mega-houndoom','tyranitar','mega-tyranitar','pelipper',
      'gardevoir','mega-gardevoir','sableye','mega-sableye','aggron','mega-aggron',
      'medicham','mega-medicham','manectric','mega-manectric','sharpedo','mega-sharpedo',
      'camerupt','mega-camerupt','torkoal','altaria','mega-altaria','milotic',
      'castform','banette','mega-banette','chimecho','mega-chimecho','absol','mega-absol',
      'glalie','mega-glalie','torterra','infernape','empoleon','luxray','roserade',
      'rampardos','bastiodon','lopunny','mega-lopunny','spiritomb','garchomp','mega-garchomp',
      'lucario','mega-lucario','hippowdon','toxicroak','abomasnow','mega-abomasnow',
      'weavile','rhyperior','leafeon','glaceon','gliscor','mamoswine',
      'gallade','mega-gallade','froslass','mega-froslass','rotom',
      'rotom-heat','rotom-wash','rotom-frost','rotom-fan','rotom-mow',
      'serperior','emboar','mega-emboar','samurott','samurott-hisui',
      'watchog','liepard','simisage','simisear','simipour',
      'excadrill','mega-excadrill','audino','mega-audino','conkeldurr','whimsicott',
      'krookodile','cofagrigus','garbodor','zoroark','zoroark-hisui','reuniclus',
      'vanilluxe','emolga','chandelure','mega-chandelure','beartic',
      'stunfisk','stunfisk-galarian','golurk','mega-golurk','hydreigon','volcarona',
      'chesnaught','mega-chesnaught','delphox','mega-delphox','greninja','mega-greninja',
      'diggersby','talonflame','vivillon','floette-eternal-flower','mega-floette',
      'florges','pangoro','furfrou','meowstic','mega-meowstic','aegislash',
      'aromatisse','slurpuff','clawitzer','heliolisk','tyrantrum','aurorus','sylveon',
      'hawlucha','mega-hawlucha','dedenne','goodra','goodra-hisui','klefki',
      'trevenant','gourgeist','avalugg','avalugg-hisui','noivern',
      'decidueye','decidueye-hisui','incineroar','primarina','toucannon',
      'crabominable','mega-crabominable','lycanroc','toxapex','mudsdale',
      'araquanid','salazzle','tsareena','oranguru','passimian','mimikyu',
      'drampa','mega-drampa','kommo-o','corviknight','flapple','appletun',
      'sandaconda','polteageist','hatterene','mr.-rime','runerigus','alcremie',
      'morpeko','dragapult','wyrdeer','kleavor','basculegion','sneasler',
      'meowscarada','skeledirge','quaquaval','maushold','garganacl',
      'armarouge','ceruledge','bellibolt','scovillain','mega-scovillain',
      'espathra','tinkaton','palafin','orthworm','glimmora','mega-glimmora',
      'farigiraf','kingambit','sinistcha','archaludon','hydrapple',
    ];
  }

  console.log(`开始抓取 ${slugs.length} 只，预计 ${Math.ceil(slugs.length*0.7/60)} 分钟...`);

  // ── 解析页面 ─────────────────────────────────────────────────────────────
  const parsePage = (html) => {
    // 优先尝试 __NEXT_DATA__（从原始 HTML 字符串里提取，避免 DOMParser 挂载问题）
    const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(\{[\s\S]*?\})<\/script>/);
    if (ndMatch) {
      try {
        const nd = JSON.parse(ndMatch[1]);
        const pp = nd?.props?.pageProps;
        const ms = pp?.moveStats || pp?.moves || pp?.data?.moves;
        const is = pp?.itemStats || pp?.items || pp?.data?.items;
        const as = pp?.abilityStats || pp?.abilities || pp?.data?.abilities;
        const ts = pp?.teammates || pp?.data?.teammates;
        if (ms?.length) {
          return {
            moves:     ms.slice(0,4).map(m=>({slug:toSlug(m.name||m.move||''),pct:+parseFloat(m.usage||m.pct||0).toFixed(3)})).filter(m=>m.slug),
            item:      is?.[0] ? {slug:toSlug(is[0].name||is[0].item||''),pct:+parseFloat(is[0].usage||is[0].pct||0).toFixed(3)} : null,
            ability:   as?.[0] ? {slug:toSlug(as[0].name||as[0].ability||''),pct:+parseFloat(as[0].usage||as[0].pct||0).toFixed(3)} : null,
            teammates: (ts||[]).slice(0,6).map(t=>({slug:toSlug(t.name||t.pokemon||''),pct:+parseFloat(t.usage||t.pct||0).toFixed(3)})).filter(t=>t.slug),
          };
        }
      } catch(e) {}
    }

    // ── 回退：DOM 查询（结构：div#xxx_wrapper > div.pokedex-move-entry-new）──
    // 注意：DOMParser 文档用 textContent（不用 innerText，挂载后才有值）
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // nameSelector: 技能用 .pokedex-inline-text-offset，道具/队友用 .pokedex-inline-text
    const extractFromWrapper = (wrapperId, limit, nameSelector) => {
      const wrapper = doc.getElementById(wrapperId);
      if (!wrapper) return [];
      const results = [];
      wrapper.querySelectorAll('.pokedex-move-entry-new').forEach(row => {
        if (results.length >= limit) return;
        const nameEl = row.querySelector(nameSelector);
        const pctEl  = row.querySelector('.pokedex-inline-right');
        if (!nameEl || !pctEl) return;
        // 队友名在第一个 span 内，其他直接取 textContent
        const name = (nameEl.querySelector('span:first-child') || nameEl).textContent.trim();
        const pctStr = pctEl.textContent.trim().replace('%','');
        const slug = toSlug(name);
        const pct  = +parseFloat(pctStr).toFixed(3);
        if (slug && slug.length > 1) results.push({ slug, pct });
      });
      return results;
    };

    const moves     = extractFromWrapper('moves_wrapper',     4, '.pokedex-inline-text-offset');
    const items     = extractFromWrapper('items_wrapper',     1, '.pokedex-inline-text');
    const abilities = extractFromWrapper('abilities_wrapper', 1, '.pokedex-inline-text-offset');
    const teammates = extractFromWrapper('dex_team_wrapper',  6, '.pokedex-inline-text');

    return { moves, item: items[0]||null, ability: abilities[0]||null, teammates };
  };

  // ── 主循环 ───────────────────────────────────────────────────────────────
  const data   = {};
  const errors = [];
  const BASE   = 'https://www.pikalytics.com/pokedex/championstournaments';

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    try {
      // mega/regional 形态找不到时，回退到基础形态数据
      const fetchSlug = async (s) => {
        const opts = { headers: { 'Accept-Language': 'en-US,en;q=0.9' } };
        const res = await fetch(`${BASE}/${s}`, opts);
        if (res.ok) return res;
        const base = s.replace(/^mega-/,'').replace(/-(hisui|alolan|galarian|paldean|x|y)$/,'');
        if (base !== s) {
          const res2 = await fetch(`${BASE}/${base}`, opts);
          if (res2.ok) return res2;
        }
        throw new Error(`HTTP ${res.status}`);
      };
      const res = await fetchSlug(slug);
      const parsed = parsePage(await res.text());

      if (!parsed.moves.length) {
        console.warn(`  ⚠ ${slug}：未解析到技能`);
        errors.push(slug);
      } else {
        data[slug] = parsed;
      }
    } catch(e) {
      console.error(`  ✗ ${slug}: ${e.message}`);
      errors.push(slug);
    }

    if ((i+1) % 10 === 0 || i === slugs.length-1)
      console.log(`  进度 ${i+1}/${slugs.length}，成功 ${Object.keys(data).length} 只`);
    if (i < slugs.length-1) await sleep(700);
  }

  console.log(`\n✓ 完成！成功 ${Object.keys(data).length} 只，失败 ${errors.length} 只`);
  if (errors.length) console.warn('失败:', errors);

  // ── 生成 JS 文件并下载 ───────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0,10);
  const js =
`// 自动生成 — Pokemon Champions 热门配置数据
// 来源: pikalytics.com/championstournaments，勿手动修改
// 生成时间: ${today}
// 字段说明: moves(top4) / item(top1) / ability(top1) / teammates(top6)
//           pct = 锦标赛使用率百分比
window.PKM_CHAMPIONS_BUILDS = ${JSON.stringify(data, null, 2)};`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([js], {type:'text/javascript'}));
  a.download = 'pkm_champions_builds.js';
  a.click();
  console.log('✓ 已下载 pkm_champions_builds.js → 放入 js/data/ 即可');
})();
