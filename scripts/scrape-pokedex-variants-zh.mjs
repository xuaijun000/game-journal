/**
 * 官方中文图鉴形态爬虫（pokemon.cn）
 *
 * 运行:
 *   node scripts/scrape-pokedex-variants-zh.mjs
 *   node scripts/scrape-pokedex-variants-zh.mjs --from 1 --to 1025
 *
 * 输出:
 *   scripts/out/pokedex_zh_official_variants.json
 *
 * 说明:
 * - 按全国图鉴编号抓官方图鉴页
 * - 提取“样子”列表中的所有形态
 * - 为每个形态抓取对应的官方中文图鉴文案
 * - 仅保存存在多个样子的宝可梦
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const OUT_FILE = path.join(OUT_DIR, 'pokedex_zh_official_variants.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'https://www.pokemon.cn';

const argv = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const idx = argv.indexOf(name);
  if (idx < 0 || idx === argv.length - 1) return fallback;
  return argv[idx + 1];
};

const FROM = Number(getArg('--from', 1));
const TO = Number(getArg('--to', 1025));
const DELAY = Number(getArg('--delay', 350));
const RETRIES = Number(getArg('--retries', 3));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function padDexId(id) {
  return String(id).padStart(4, '0');
}

function plainHtmlText(html) {
  return String(html || '')
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
  if (!fs.existsSync(OUT_FILE)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

function writeOutput(data) {
  const sortedKeys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  const sorted = {};
  for (const key of sortedKeys) sorted[key] = data[key];
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
      return await res.text();
    } catch (err) {
      lastErr = err;
      console.warn(`  请求失败 (${attempt}/${RETRIES}) ${label}: ${err.message}`);
      if (attempt < RETRIES) await sleep(DELAY * attempt);
    }
  }

  throw lastErr;
}

function parseVariantList(html, dexId) {
  const variants = [];
  const blockRe = /<div class="pokemon-style-box">([\s\S]*?)<\/div>\s*<\/div>/gi;
  let match;

  while ((match = blockRe.exec(html)) !== null) {
    const block = match[1];
    const href = (block.match(/<a href="([^"]+)"/i)?.[1] || '').trim();
    if (!href) continue;

    const name = plainHtmlText(block.match(/pokemon-style-box__name[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
    const subname = plainHtmlText(block.match(/pokemon-style-box__subname[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');
    const types = [...block.matchAll(/pokemon-style-box__type[^>]*>\s*<div><span>([^<]+)<\/span>/gi)]
      .map(m => plainHtmlText(m[1]))
      .filter(Boolean);

    variants.push({
      href: href.startsWith('http') ? href : `${BASE}${href}`,
      name,
      subname,
      types,
    });
  }

  if (variants.length) return variants;

  return [{
    href: `${BASE}/play/pokedex/${padDexId(dexId)}`,
    name: '',
    subname: '',
    types: [],
  }];
}

function parseStoryTexts(html) {
  return [...html.matchAll(/<p class="pokemon-story__body[^"]*"[^>]*>\s*<span>([\s\S]*?)<\/span>\s*<\/p>/gi)]
    .map(m => plainHtmlText(m[1]))
    .filter(Boolean);
}

async function scrapeVariantsForDexId(id) {
  const baseUrl = `${BASE}/play/pokedex/${padDexId(id)}`;
  const baseHtml = await fetchHtml(baseUrl, `#${padDexId(id)} base`);
  const variants = parseVariantList(baseHtml, id);

  if (variants.length <= 1) return null;

  const result = [];
  for (const variant of variants) {
    const html = variant.href === baseUrl ? baseHtml : await fetchHtml(variant.href, variant.href);
    const descZhAll = parseStoryTexts(html);

    result.push({
      href: variant.href,
      name: variant.name,
      subname: variant.subname,
      types: variant.types,
      descZh: descZhAll[0] || '',
      descZhAll,
    });

    await sleep(DELAY);
  }

  return result;
}

async function main() {
  console.log('官方中文图鉴形态爬虫');
  console.log(`范围: #${padDexId(FROM)} - #${padDexId(TO)}`);
  console.log(`输出: ${OUT_FILE}`);

  const existing = readExisting();
  let found = 0;
  let skipped = 0;
  let failed = 0;

  for (let id = FROM; id <= TO; id++) {
    if (existing[String(id)]) {
      console.log(`#${padDexId(id)} 已存在，跳过`);
      skipped++;
      continue;
    }

    process.stdout.write(`#${padDexId(id)} ... `);

    try {
      const variants = await scrapeVariantsForDexId(id);
      if (variants?.length) {
        existing[String(id)] = variants;
        writeOutput(existing);
        found++;
        console.log(`找到 ${variants.length} 个样子`);
      } else {
        console.log('无额外样子');
      }
    } catch (err) {
      failed++;
      console.log(`失败: ${err.message}`);
    }

    await sleep(DELAY);
  }

  console.log('\n完成');
  console.log(`  有形态: ${found}`);
  console.log(`  跳过: ${skipped}`);
  console.log(`  失败: ${failed}`);
  console.log(`  文件: ${OUT_FILE}`);
}

main().catch(err => {
  console.error('\n脚本失败:', err);
  process.exit(1);
});
