/**
 * 官方中文图鉴爬虫（pokemon.cn）
 *
 * 运行:
 *   node scripts/scrape-pokedex-zh.mjs
 *   node scripts/scrape-pokedex-zh.mjs --from 1 --to 30
 *
 * 输出:
 *   scripts/out/pokedex_zh_official.json
 *
 * 数据源:
 * - 中国官方宝可梦图鉴: https://www.pokemon.cn/play/pokedex/0001
 *
 * 说明:
 * - 按全国图鉴编号顺序抓取 0001 ~ 1025
 * - 提取官方中文名和“图鉴版本”里的中文描述
 * - 支持断点续跑；已有数据会跳过
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const OUT_FILE = path.join(OUT_DIR, 'pokedex_zh_official.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'https://www.pokemon.cn/play/pokedex';

const argv = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const idx = argv.indexOf(name);
  if (idx < 0 || idx === argv.length - 1) return fallback;
  return argv[idx + 1];
};

const FROM = Number(getArg('--from', 1));
const TO = Number(getArg('--to', 1025));
const DELAY = Number(getArg('--delay', 500));
const RETRIES = Number(getArg('--retries', 3));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function padId(id) {
  return String(id).padStart(4, '0');
}

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function readExisting() {
  if (!fs.existsSync(OUT_FILE)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeOutput(rows) {
  const sorted = [...rows].sort((a, b) => a.id - b.id);
  fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

async function fetchHtml(url, label = url) {
  let lastErr = null;

  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return {
        html: await res.text(),
        finalUrl: res.url,
      };
    } catch (err) {
      lastErr = err;
      console.warn(`  请求失败 (${attempt}/${RETRIES}) ${label}: ${err.message}`);
      if (attempt < RETRIES) await sleep(DELAY * attempt);
    }
  }

  throw lastErr;
}

function parseOfficialDexPage(html, id) {
  const titleMatch = html.match(/<title>\s*([^|]+?)\s*\|\s*宝可梦图鉴/i);
  const zhName = titleMatch ? stripTags(titleMatch[1]) : '';

  const blockMatch = html.match(/<div class="pokemon-story"[\s\S]*?<span class="pokemon-story__title[^"]*">\s*图鉴版本\s*<\/span>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
  const blockHtml = blockMatch ? blockMatch[1] : '';

  const storyMatches = [...blockHtml.matchAll(/<p class="pokemon-story__body[^"]*"[^>]*>\s*<span>([\s\S]*?)<\/span>\s*<\/p>/gi)];
  const descZhAll = storyMatches
    .map(match => stripTags(match[1]))
    .filter(Boolean);

  const metaDescMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const metaDesc = metaDescMatch ? stripTags(metaDescMatch[1]) : '';

  const descriptions = descZhAll.length ? descZhAll : (metaDesc ? [metaDesc] : []);

  return {
    id,
    zhName,
    descZh: descriptions[0] || '',
    descZhAll: descriptions,
  };
}

async function scrapeOne(id) {
  const dexId = padId(id);
  const pageUrl = `${BASE}/${dexId}`;
  const { html, finalUrl } = await fetchHtml(pageUrl, `#${dexId}`);
  const parsed = parseOfficialDexPage(html, id);

  return {
    id,
    zhName: parsed.zhName,
    descZh: parsed.descZh,
    descZhAll: parsed.descZhAll,
    source: 'pokemon.cn',
    url: finalUrl || pageUrl,
  };
}

async function main() {
  console.log('官方中文图鉴爬虫');
  console.log(`范围: #${padId(FROM)} - #${padId(TO)}`);
  console.log(`输出: ${OUT_FILE}`);

  const existing = readExisting();
  const map = new Map(existing.map(row => [row.id, row]));

  let ok = 0;
  let miss = 0;
  let fail = 0;

  for (let id = FROM; id <= TO; id++) {
    const exists = map.get(id);
    if (exists?.descZh) {
      console.log(`#${padId(id)} ${exists.zhName || ''} 已存在，跳过`);
      continue;
    }

    process.stdout.write(`#${padId(id)} ... `);

    try {
      const row = await scrapeOne(id);
      map.set(id, row);
      writeOutput([...map.values()]);

      if (row.descZh) {
        ok++;
        console.log(`OK ${row.zhName} (${row.descZhAll.length}条)`);
      } else {
        miss++;
        console.log(`无图鉴文本 ${row.zhName || ''}`.trim());
      }
    } catch (err) {
      fail++;
      console.log(`失败: ${err.message}`);
      map.set(id, {
        id,
        zhName: '',
        descZh: '',
        descZhAll: [],
        source: 'pokemon.cn',
        url: `${BASE}/${padId(id)}`,
        error: err.message,
      });
      writeOutput([...map.values()]);
    }

    await sleep(DELAY);
  }

  console.log('\n完成');
  console.log(`  成功: ${ok}`);
  console.log(`  缺失: ${miss}`);
  console.log(`  失败: ${fail}`);
  console.log(`  文件: ${OUT_FILE}`);
}

main().catch(err => {
  console.error('\n脚本失败:', err);
  process.exit(1);
});
