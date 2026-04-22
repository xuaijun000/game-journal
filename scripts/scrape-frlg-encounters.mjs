/**
 * 火红 / 叶绿 野生精灵遭遇数据抓取脚本
 * 运行: node scripts/scrape-frlg-encounters.mjs
 * 输出:
 *   scripts/out/frlg_encounters.json  → 中间 JSON（调试用）
 *   js/data/frlg_encounters.js        → window.FRLG_ENCOUNTERS
 *
 * 依赖: Node.js 18+ (内置 fetch)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'out');
const DATA_DIR = path.join(__dirname, '..', 'js', 'data');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DELAY = 300; // ms 请求间隔
const REGION_URL = 'https://pokeapi.co/api/v2/region/kanto/';
const VALID_VERSIONS = new Set(['firered', 'leafgreen']);
const VALID_METHODS = new Set(['walk', 'surf', 'old-rod', 'good-rod', 'super-rod', 'rock-smash']);

const LOCATION_CACHE = path.join(OUT_DIR, '_frlg_locations_cache.json');
const AREA_CACHE = path.join(OUT_DIR, '_frlg_areas_cache.json');
const ENCOUNTER_CACHE = path.join(OUT_DIR, '_frlg_encounters_cache.json');

const JSON_OUT = path.join(OUT_DIR, 'frlg_encounters.json');
const JS_OUT = path.join(DATA_DIR, 'frlg_encounters.js');

const ZH_LOCATION = {
  'route-1':'1号道路','route-2':'2号道路','route-3':'3号道路','route-4':'4号道路',
  'route-5':'5号道路','route-6':'6号道路','route-7':'7号道路','route-8':'8号道路',
  'route-9':'9号道路','route-10':'10号道路','route-11':'11号道路','route-12':'12号道路',
  'route-13':'13号道路','route-14':'14号道路','route-15':'15号道路','route-16':'16号道路',
  'route-17':'17号道路','route-18':'18号道路','route-19':'19号道路','route-20':'20号道路',
  'route-21':'21号道路','route-22':'22号道路','route-23':'23号道路','route-24':'24号道路',
  'route-25':'25号道路',
  'viridian-forest':'常盘森林',
  'mt-moon':'月亮山',
  'rock-tunnel':'岩石隧道',
  'pokemon-tower':'宝可梦之塔',
  'kanto-safari-zone':'狩猎地带',
  'seafoam-islands':'水流岛',
  'power-plant':'发电站',
  'kanto-pokemon-mansion':'赤铁岛（宝可梦洋馆）',
  'victory-road-kanto':'胜利道路',
  'cerulean-cave':'无名小径',
  'mt-ember':'埋火山',
  'one-island':'第一岛（埋火山）',
  'kindle-road':'熄灭道路',
  'cape-brink':'断崖之岬',
  'two-island':'第二岛',
  'three-island':'第三岛',
  'bond-bridge':'连结桥',
  'berry-forest':'果实森林',
  'four-island':'第四岛',
  'icefall-cave':'冰落洞窟',
  'five-island':'第五岛',
  'water-labyrinth':'水的迷宫',
  'memorial-pillar':'石碑之岛',
  'six-island':'第六岛',
  'ruin-valley':'遗迹山谷',
  'pattern-bush':'花纹草丛',
  'dotted-hole':'暗点洞穴',
  'seven-island':'第七岛',
  'sevault-canyon':'塞沃特峡谷',
  'tanoby-ruins':'塔诺比遗迹',
  'trainer-tower':'训练家之塔',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'game-journal-frlg-scraper/1.0',
      'Accept': 'application/json',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

function getZhLocation(name) {
  if (ZH_LOCATION[name]) return ZH_LOCATION[name];
  if (name.startsWith('kanto-') && ZH_LOCATION[name.slice(6)]) return ZH_LOCATION[name.slice(6)];

  const aliases = [
    [name.replace(/^kanto-sea-route-/, 'route-')],
    [name.replace(/^kanto-route-/, 'route-')],
    [name.replace(/^kanto-victory-road-\d+$/, 'victory-road-kanto')],
    [name.replace(/^pokemon-mansion$/, 'kanto-pokemon-mansion')],
  ];
  for (const [alias] of aliases) {
    if (alias !== name && ZH_LOCATION[alias]) return ZH_LOCATION[alias];
  }
  return '';
}

function mergeEncounter(target, patch) {
  target.minLv = Math.min(target.minLv, patch.minLv);
  target.maxLv = Math.max(target.maxLv, patch.maxLv);
  target.rate = Math.max(target.rate, patch.rate);
  for (const method of patch.methods) {
    if (!target.methods.includes(method)) target.methods.push(method);
  }
  for (const version of patch.versions) {
    if (!target.versions.includes(version)) target.versions.push(version);
  }
}

function sortEncounter(entry) {
  entry.methods.sort();
  entry.versions.sort();
  return entry;
}

function parseAreaEncounters(areaData) {
  const merged = {};
  for (const item of areaData.pokemon_encounters || []) {
    const slug = item.pokemon?.name;
    if (!slug) continue;

    for (const versionDetail of item.version_details || []) {
      const version = versionDetail.version?.name;
      if (!VALID_VERSIONS.has(version)) continue;

      for (const detail of versionDetail.encounter_details || []) {
        const method = detail.method?.name;
        if (!VALID_METHODS.has(method)) continue;

        const key = slug;
        const patch = {
          slug,
          methods: [method],
          minLv: detail.min_level ?? 0,
          maxLv: detail.max_level ?? 0,
          rate: detail.chance ?? 0,
          versions: [version],
        };

        if (!merged[key]) {
          merged[key] = patch;
        } else {
          mergeEncounter(merged[key], patch);
        }
      }
    }
  }

  return Object.values(merged).map(sortEncounter);
}

function mergeLocationAreas(areaEntries) {
  const merged = {};
  for (const encounter of areaEntries) {
    const key = encounter.slug;
    if (!merged[key]) {
      merged[key] = {
        slug: encounter.slug,
        methods: [...encounter.methods],
        minLv: encounter.minLv,
        maxLv: encounter.maxLv,
        rate: encounter.rate,
        versions: [...encounter.versions],
      };
    } else {
      mergeEncounter(merged[key], encounter);
    }
  }

  return Object.values(merged)
    .map(sortEncounter)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

async function getRegionLocations() {
  const data = await fetchJson(REGION_URL);
  return (data.locations || []).map(loc => ({
    name: loc.name,
    url : loc.url,
  }));
}

async function getLocationAreas(location) {
  const data = await fetchJson(location.url);
  return {
    name : location.name,
    zh   : getZhLocation(location.name),
    areas: (data.areas || []).map(area => ({
      name: area.name,
      url : area.url,
    })),
  };
}

async function getAreaEncounterData(area) {
  const data = await fetchJson(area.url);
  return {
    name      : area.name,
    encounters: parseAreaEncounters(data),
  };
}

async function main() {
  console.log('[1/4] 获取关都地区 locations...');

  let locations;
  if (fs.existsSync(LOCATION_CACHE)) {
    locations = readJson(LOCATION_CACHE, []);
  } else {
    try {
      locations = await getRegionLocations();
      writeJson(LOCATION_CACHE, locations);
      await sleep(DELAY);
    } catch (e) {
      console.error(`  ✗ 获取 locations 失败: ${e.message}`);
      process.exit(1);
    }
  }
  console.log(`[1/4] 获取关都地区 locations... 共 ${locations.length} 个`);

  console.log(`[2/4] 获取各 location 的 area 列表...  进度: 0/${locations.length}`);
  let locationAreas = readJson(AREA_CACHE, {});
  for (const location of locations) {
    if (locationAreas[location.name]) locationAreas[location.name].zh = getZhLocation(location.name);
  }
  let areaProgress = 0;
  for (const location of locations) {
    if (locationAreas[location.name]) {
      areaProgress++;
      continue;
    }
    try {
      locationAreas[location.name] = await getLocationAreas(location);
      writeJson(AREA_CACHE, locationAreas);
      areaProgress++;
      process.stdout.write(`\r[2/4] 获取各 location 的 area 列表...  进度: ${areaProgress}/${locations.length} (${location.name})          `);
      await sleep(DELAY);
    } catch (e) {
      areaProgress++;
      console.warn(`\n  ! 跳过 location: ${location.name} - ${e.message}`);
    }
  }
  if (locations.length) process.stdout.write('\n');

  const allAreas = [];
  for (const locationName of Object.keys(locationAreas)) {
    for (const area of locationAreas[locationName].areas || []) {
      allAreas.push({
        location: locationName,
        name    : area.name,
        url     : area.url,
      });
    }
  }

  console.log(`[3/4] 抓取各 area 遭遇数据...          进度: 0/${allAreas.length}`);
  let encounterCache = readJson(ENCOUNTER_CACHE, {});
  let encounterProgress = 0;
  let fetchedSinceSave = 0;

  for (const area of allAreas) {
    if (encounterCache[area.name]) {
      encounterProgress++;
      continue;
    }

    try {
      encounterCache[area.name] = await getAreaEncounterData(area);
      fetchedSinceSave++;
      encounterProgress++;
      process.stdout.write(`\r[3/4] 抓取各 area 遭遇数据...          进度: ${encounterProgress}/${allAreas.length} (${area.name})          `);
      if (fetchedSinceSave % 20 === 0) writeJson(ENCOUNTER_CACHE, encounterCache);
      await sleep(DELAY);
    } catch (e) {
      encounterProgress++;
      console.warn(`\n  ! 跳过 area: ${area.name} - ${e.message}`);
    }
  }
  writeJson(ENCOUNTER_CACHE, encounterCache);
  if (allAreas.length) process.stdout.write('\n');

  console.log('[4/4] 合并数据并生成输出文件...');

  const finalData = {};
  let speciesCount = 0;

  for (const location of locations) {
    const info = locationAreas[location.name];
    if (!info) continue;

    const areaEntries = [];
    for (const area of info.areas || []) {
      const cached = encounterCache[area.name];
      if (!cached || !Array.isArray(cached.encounters)) continue;
      areaEntries.push(...cached.encounters);
    }

    const encounters = mergeLocationAreas(areaEntries);
    if (!encounters.length) continue;

    finalData[location.name] = {
      zh: info.zh || '',
      encounters,
    };
    speciesCount += encounters.length;
  }

  writeJson(JSON_OUT, finalData);

  const now = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const jsText = `// 自动生成 — 火红/叶绿 野生精灵遭遇数据
// 来源: PokeAPI (pokeapi.co)，勿手动修改
// 生成时间: ${now}
// 共 ${Object.keys(finalData).length} 个地点，${speciesCount} 个物种
window.FRLG_ENCOUNTERS = ${JSON.stringify(finalData, null, 2)};
`;
  fs.writeFileSync(JS_OUT, jsText);

  console.log('\n✓ 完成！');
  console.log(`  scripts/out/frlg_encounters.json — ${Object.keys(finalData).length} 个地点有遭遇数据`);
  console.log(`  js/data/frlg_encounters.js       — window.FRLG_ENCOUNTERS`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
