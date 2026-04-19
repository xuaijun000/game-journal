/**
 * op.gg Pokemon Champions 数据爬虫
 * 运行: node scripts/scrape-opgg.mjs
 * 输出: scripts/out/pkm_champions.json  (258只宝可梦)
 *       scripts/out/moves_champions.json (919个技能)
 *
 * 依赖: Node.js 18+ (内置 fetch)
 * 如果 Node < 18，先 npm i node-fetch 然后把 fetch 改成 import fetch from 'node-fetch'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'https://op.gg/zh-cn/pokemon-champions';
const DELAY = 1200; // ms 每次请求间隔，避免被封

// ── 工具 ──────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

// 简单 HTML 解析工具（不依赖 cheerio）
function extractAll(html, pattern) {
  const matches = [];
  let m;
  const re = new RegExp(pattern, 'gs');
  while ((m = re.exec(html)) !== null) matches.push(m);
  return matches;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

// ── 1. 抓取全部宝可梦列表 ─────────────────────────────────────────────────────

async function scrapePokemonList() {
  console.log('[1/3] 抓取宝可梦图鉴列表...');
  const html = await fetchHtml(`${BASE}/pokedex`);

  // op.gg 的宝可梦卡片包含 slug（英文名路径），例如 /pokedex/charizard
  // 同时提取中文名和编号
  const slugSet = new Set();
  const pokemons = [];

  // 提取所有宝可梦条目（卡片形式），链接格式：href="/zh-cn/pokemon-champions/pokedex/SLUG"
  const linkRe = /href="\/zh-cn\/pokemon-champions\/pokedex\/([a-z0-9\-]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const slug = m[1];
    if (slugSet.has(slug)) continue;
    slugSet.add(slug);
    const inner = m[2];
    // 中文名
    const cnMatch = inner.match(/>([^\u0000-\u007F]{1,20})</); // 匹配中文字符
    const cnName = cnMatch ? stripTags(cnMatch[0]) : '';
    // 编号 #NNN
    const numMatch = inner.match(/#(\d+)/);
    const num = numMatch ? parseInt(numMatch[1]) : null;
    if (slug && cnName) {
      pokemons.push({ slug, num, cnName });
    }
  }

  console.log(`  找到 ${pokemons.length} 只宝可梦（去重后）`);
  return pokemons;
}

// ── 2. 抓取单只宝可梦详情 ─────────────────────────────────────────────────────

async function scrapePokemonDetail(slug) {
  const html = await fetchHtml(`${BASE}/pokedex/${slug}`);

  // 中文名、英文名
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1 = h1Match ? stripTags(h1Match[1]) : slug;

  // 编号
  const numMatch = html.match(/#(\d+)/);
  const num = numMatch ? parseInt(numMatch[1]) : null;

  // 属性（type tags）
  const typeMatches = extractAll(html, /type["\s][^"]*"([a-z]+)"[^>]*>([^<]+)</);
  const types = [];
  // 更可靠：找 type badge 文字
  const typeBadgeRe = /class="[^"]*type[^"]*"[^>]*>\s*([^\s<>]{2,10})\s*</g;
  const typeNames = new Set(['火','水','草','电','冰','格斗','毒','地面','飞行','超能力','虫','岩石','幽灵','龙','恶','钢','一般','妖精']);
  let tm;
  while ((tm = typeBadgeRe.exec(html)) !== null) {
    const t = tm[1].trim();
    if (typeNames.has(t) && types.length < 2 && !types.includes(t)) types.push(t);
  }

  // 种族值（HP/ATK/DEF/SPA/SPD/SPE）
  const stats = {};
  const statKeys = [
    ['hp', /HP[\s\S]{1,100}?(\d{2,3})/],
    ['atk', /Attack[\s\S]{1,100}?(\d{2,3})/],
    ['def', /Defense[\s\S]{1,100}?(\d{2,3})/],
    ['spa', /Sp\.\s*Atk[\s\S]{1,100}?(\d{2,3})/],
    ['spd', /Sp\.\s*Def[\s\S]{1,100}?(\d{2,3})/],
    ['spe', /Speed[\s\S]{1,100}?(\d{2,3})/],
  ];
  for (const [key, re] of statKeys) {
    const sm = html.match(re);
    if (sm) stats[key] = parseInt(sm[1]);
  }

  // 特性（ability 名称）
  const abilityRe = /class="[^"]*ability[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi;
  const abilities = [];
  let am;
  while ((am = abilityRe.exec(html)) !== null) {
    const name = stripTags(am[1]);
    if (name && name.length > 0 && name.length < 20 && !abilities.includes(name)) {
      abilities.push(name);
    }
  }

  // 可学技能列表（链接到 /moves/SLUG 的锚点）
  const learnsetSlug = [];
  const moveRe = /href="\/zh-cn\/pokemon-champions\/moves\/([a-z0-9\-]+)"/g;
  let mr;
  while ((mr = moveRe.exec(html)) !== null) {
    if (!learnsetSlug.includes(mr[1])) learnsetSlug.push(mr[1]);
  }

  // 中文技能名（同一行 / 邻近的中文文字）
  const learnset = learnsetSlug.map(slug => ({
    slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) // 暂填英文，后面用 moves 表替换
  }));

  return {
    slug,
    num,
    cnName: h1,
    types,
    stats,
    abilities,
    learnset: learnsetSlug,
  };
}

// ── 3. 抓取全部技能列表 ───────────────────────────────────────────────────────

async function scrapeMovesList() {
  console.log('[2/3] 抓取技能列表...');
  const html = await fetchHtml(`${BASE}/moves`);

  const moves = [];
  const seen = new Set();

  // 每个技能行的模式：找到 /moves/SLUG 的链接，并提取周边信息
  // op.gg 移动表格：slug -> 中文名、属性、分类、威力、命中、PP
  const rowRe = /href="\/zh-cn\/pokemon-champions\/moves\/([a-z0-9\-]+)"([\s\S]*?)(?=href="\/zh-cn\/pokemon-champions\/moves\/|$)/g;
  const typeNames = ['火','水','草','电','冰','格斗','毒','地面','飞行','超能力','虫','岩石','幽灵','龙','恶','钢','一般','妖精'];
  const catNames = ['物理','特殊','状态','变化'];

  let rm;
  while ((rm = rowRe.exec(html)) !== null) {
    const slug = rm[1];
    if (seen.has(slug)) continue;
    seen.add(slug);
    const chunk = rm[2];

    // 中文名（第一段非ASCII文字）
    const cnMatch = chunk.match(/>([\u4e00-\u9fff][^\u0000-\u007F\s<]{0,15})</);
    const cnName = cnMatch ? cnMatch[1] : '';

    // 英文名（从 slug 转换）
    const nameEn = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // 属性
    const type = typeNames.find(t => chunk.includes(t)) || '';
    // 分类
    const cat = catNames.find(c => chunk.includes(c)) || '';

    // 威力（数字）
    const powerMatch = chunk.match(/威力[\s\S]{0,30}?(\d+)/);
    const power = powerMatch ? parseInt(powerMatch[1]) : null;

    // 命中率
    const accMatch = chunk.match(/(\d{2,3})%/);
    const acc = accMatch ? parseInt(accMatch[1]) : null;

    // PP
    const ppMatch = chunk.match(/PP[\s\S]{0,20}?(\d+)/);
    const pp = ppMatch ? parseInt(ppMatch[1]) : null;

    moves.push({ slug, name: cnName || nameEn, nameEn, type, cat, power, acc, pp });
  }

  // 备用：逐行表格解析
  if (moves.length < 100) {
    console.log('  备用解析模式...');
    const tdRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let tr;
    while ((tr = tdRe.exec(html)) !== null) {
      const tds = [];
      const tdInner = /<td[^>]*>([\s\S]*?)<\/td>/g;
      let td;
      while ((td = tdInner.exec(tr[1])) !== null) {
        tds.push(stripTags(td[1]));
      }
      if (tds.length >= 5) {
        const nameCell = tds[0] || '';
        const slugMatch = tr[1].match(/moves\/([a-z0-9\-]+)/);
        if (slugMatch && !seen.has(slugMatch[1])) {
          seen.add(slugMatch[1]);
          moves.push({
            slug: slugMatch[1],
            name: nameCell,
            nameEn: slugMatch[1].replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
            type: tds[1] || '', cat: tds[2] || '',
            power: parseInt(tds[3]) || null,
            acc: parseInt(tds[4]) || null,
            pp: parseInt(tds[5]) || null,
          });
        }
      }
    }
  }

  console.log(`  找到 ${moves.length} 个技能`);
  return moves;
}

// ── 4. 抓取单个技能详情（补充中文名）────────────────────────────────────────

async function scrapeMoveDetail(slug) {
  const html = await fetchHtml(`${BASE}/moves/${slug}`);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1 = h1Match ? stripTags(h1Match[1]) : '';
  // 提取中文名（含汉字的部分）
  const cnMatch = h1.match(/[\u4e00-\u9fff][^\u0000-\u007F\s]*/);
  const enMatch = h1.match(/[A-Z][A-Za-z\s\-']+/);
  return {
    cnName: cnMatch ? cnMatch[0] : '',
    nameEn: enMatch ? enMatch[0].trim() : '',
  };
}

// ── 主流程 ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== op.gg Pokemon Champions 数据爬虫 ===\n');

  // Step 1: 宝可梦列表
  let pokemonList;
  const listCache = path.join(OUT_DIR, '_pkm_list_cache.json');
  if (fs.existsSync(listCache)) {
    pokemonList = JSON.parse(fs.readFileSync(listCache, 'utf8'));
    console.log(`[1/3] 使用缓存：${pokemonList.length} 只宝可梦`);
  } else {
    pokemonList = await scrapePokemonList();
    fs.writeFileSync(listCache, JSON.stringify(pokemonList, null, 2));
  }

  // Step 2: 技能列表
  let movesList;
  const movesCache = path.join(OUT_DIR, '_moves_list_cache.json');
  if (fs.existsSync(movesCache)) {
    movesList = JSON.parse(fs.readFileSync(movesCache, 'utf8'));
    console.log(`[2/3] 使用缓存：${movesList.length} 个技能`);
  } else {
    movesList = await scrapeMovesList();
    fs.writeFileSync(movesCache, JSON.stringify(movesList, null, 2));
    await sleep(DELAY);
  }

  // Step 3: 逐只宝可梦详情（包含可学技能 learnset）
  console.log(`[3/3] 抓取各宝可梦详情页（共 ${pokemonList.length} 只，间隔 ${DELAY}ms）...`);
  const detailCache = path.join(OUT_DIR, '_pkm_details_cache.json');
  let details = {};
  if (fs.existsSync(detailCache)) {
    details = JSON.parse(fs.readFileSync(detailCache, 'utf8'));
    console.log(`  已有缓存：${Object.keys(details).length} 只`);
  }

  let count = 0;
  for (const pkm of pokemonList) {
    if (details[pkm.slug]) continue; // 跳过已缓存
    try {
      const d = await scrapePokemonDetail(pkm.slug);
      details[pkm.slug] = { ...pkm, ...d };
      count++;
      process.stdout.write(`\r  进度: ${Object.keys(details).length}/${pokemonList.length} (${pkm.slug})          `);
      // 每10只保存一次
      if (count % 10 === 0) fs.writeFileSync(detailCache, JSON.stringify(details, null, 2));
      await sleep(DELAY);
    } catch (e) {
      console.error(`\n  ✗ 失败: ${pkm.slug} - ${e.message}`);
    }
  }
  fs.writeFileSync(detailCache, JSON.stringify(details, null, 2));
  console.log(`\n  详情抓取完成，共 ${Object.keys(details).length} 只`);

  // ── 生成最终输出 ────────────────────────────────────────────────────────────

  // 建立 moveSlug→move 映射（用于 learnset 补全中文名）
  const moveMap = {};
  for (const m of movesList) moveMap[m.slug] = m;

  // pkm_champions.json
  const pkmOut = Object.values(details).map(p => ({
    slug: p.slug,
    num: p.num,
    cnName: p.cnName,
    types: p.types || [],
    stats: p.stats || {},
    abilities: p.abilities || [],
    learnset: (p.learnset || []).map(slug => ({
      slug,
      name: moveMap[slug]?.name || slug,
      nameEn: moveMap[slug]?.nameEn || slug,
    })),
  })).sort((a, b) => (a.num || 9999) - (b.num || 9999));

  // moves_champions.json（只保留有中文名的，无中文名的保留英文名）
  const movesOut = movesList.map(m => ({
    slug: m.slug,
    name: m.name,
    nameEn: m.nameEn,
    type: m.type,
    cat: m.cat === '变化' ? 'status' : m.cat === '物理' ? 'physical' : m.cat === '特殊' ? 'special' : m.cat,
    power: m.power,
    acc: m.acc,
    pp: m.pp,
  }));

  fs.writeFileSync(path.join(OUT_DIR, 'pkm_champions.json'), JSON.stringify(pkmOut, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'moves_champions.json'), JSON.stringify(movesOut, null, 2));

  console.log('\n✓ 完成！');
  console.log(`  scripts/out/pkm_champions.json  — ${pkmOut.length} 只宝可梦`);
  console.log(`  scripts/out/moves_champions.json — ${movesOut.length} 个技能`);
  console.log('\n下一步：把生成的 JSON 数据替换 js/pokemon.js 的 PKM_CN_TABLE');
  console.log('        以及 js/battle.js 的 MOVES_DATA');
}

main().catch(e => { console.error(e); process.exit(1); });
