/**
 * 将 mega_images.json 里的图片URL写入 pkm_champions_data.js
 *
 * 运行: node scripts/apply-mega-images.mjs [path-to-mega_images.json]
 * 默认读取 scripts/mega_images.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'js', 'data', 'pkm_champions_data.js');

const imgFile = process.argv[2] || path.join(__dirname, 'mega_images.json');
if (!fs.existsSync(imgFile)) {
  console.error('找不到图片映射文件:', imgFile);
  console.error('请先运行浏览器爬虫脚本 scrape-mega-images.js 获取 mega_images.json');
  process.exit(1);
}

const imgMap = JSON.parse(fs.readFileSync(imgFile, 'utf8'));

// 解析 JS 文件中的数组
const raw = fs.readFileSync(DATA_FILE, 'utf8');
const arrStart = raw.indexOf('= [');
const arrEnd   = raw.lastIndexOf(']');
const before   = raw.slice(0, arrStart + 2);   // 保留头部注释和赋值语句
const after    = raw.slice(arrEnd + 1);          // 保留尾部 ;
const data = JSON.parse(raw.slice(arrStart + 2, arrEnd + 1));

let updated = 0;
for (const [slug, url] of Object.entries(imgMap)) {
  if (!url) { console.warn(`  跳过 ${slug}（图片URL为空）`); continue; }
  const p = data.find(e => e.slug === slug);
  if (p) {
    p.spriteUrl = url;
    updated++;
    console.log(`✓ ${slug} → ${url}`);
  } else {
    console.warn(`  跳过 ${slug}（不在数据中）`);
  }
}

// 重新序列化，保留头部结构
const newContent = before + JSON.stringify(data, null, 2) + after;
fs.writeFileSync(DATA_FILE, newContent);
console.log(`\n✓ 更新了 ${updated} 条记录 → js/data/pkm_champions_data.js`);
