import { readFileSync, writeFileSync } from 'fs';

const PSD_PATH = 'css/firered-and-leafgreen-versions-map/火红叶绿全局地图.psd';
const SVG_OUT  = 'css/firered-and-leafgreen-versions-map/火红叶绿全局地图.svg';

const NAME_TO_SLUG = {
  '1号道路':'kanto-route-1','2号道路':'kanto-route-2','3号道路':'kanto-route-3',
  '4号道路':'kanto-route-4','5号道路':'kanto-route-5','6号道路':'kanto-route-6',
  '7号道路':'kanto-route-7','8号道路':'kanto-route-8','9号道路':'kanto-route-9',
  '10号道路':'kanto-route-10','11号道路':'kanto-route-11','12号道路':'kanto-route-12',
  '13号道路':'kanto-route-13','14号道路':'kanto-route-14','15号道路':'kanto-route-15',
  '16号道路':'kanto-route-16','17号道路':'kanto-route-17','18号道路':'kanto-route-18',
  '19号水路':'kanto-sea-route-19','20号水路':'kanto-sea-route-20','21号水路':'kanto-sea-route-21',
  '22号道路':'kanto-route-22','22号水路':'kanto-route-22','23号道路':'kanto-route-23',
  '24号道路':'kanto-route-24','25号道路':'kanto-route-25',
  '常青森林':'viridian-forest','月亮山':'mt-moon','岩石隧道':'rock-tunnel',
  '发电厂':'kanto-power-plant','冰柱岛':'seafoam-islands',
  '狩猎地带':'kanto-safari-zone','胜利道路':'kanto-victory-road-2',
  '华蓝洞窟':'cerulean-cave','地鼠洞窟':'digletts-cave',
  '大豪宅':'pokemon-mansion','变化洞窟':'kanto-altering-cave',
};

const buf = readFileSync(PSD_PATH);
let pos = 0;

function readU8()  { return buf.readUInt8(pos++); }
function readU16() { const v = buf.readUInt16BE(pos); pos += 2; return v; }
function readU32() { const v = buf.readUInt32BE(pos); pos += 4; return v; }
function readI32() { const v = buf.readInt32BE(pos);  pos += 4; return v; }
function skip(n)   { pos += n; }

// PSD header (26 bytes)
skip(26);
// color mode
const colorModeLen = readU32(); skip(colorModeLen);
// image resources
const resSection = readU32();
const resEnd = pos + resSection;

const pathResources = [];

while (pos < resEnd) {
  const sigStart = pos;
  const sig = buf.slice(pos, pos+4).toString('ascii'); pos += 4;
  if (sig !== '8BIM') { pos = resEnd; break; }
  const rid = readU16();
  // pascal string (name)
  const nameLen = readU8();
  let name = '';
  if (nameLen > 0) name = buf.slice(pos, pos+nameLen).toString('utf8');
  pos += nameLen;
  if ((nameLen + 1) % 2 !== 0) skip(1); // pad to even
  const dataLen = readU32();
  const dataStart = pos;

  if (rid >= 2000 && rid <= 2997) {
    pathResources.push({ rid, name, dataStart, dataLen });
  }
  pos = dataStart + dataLen;
  if (dataLen % 2 !== 0) skip(1);
}

// Parse path resource data → SVG path string
function parsePathData(start, len, docW, docH) {
  const end = start + len;
  let p = start;
  const subpaths = [];
  let current = null;

  while (p < end) {
    const type = buf.readUInt16BE(p); p += 2;
    if (type === 6) { p += 24; continue; } // fill rule, skip
    if (type === 0 || type === 3) {
      // subpath length record
      const count = buf.readUInt16BE(p); p += 24;
      current = { closed: type === 0, knots: [] };
      subpaths.push(current);
      continue;
    }
    if (type === 1 || type === 2 || type === 4 || type === 5) {
      // bezier knot: preceding cp, anchor, leaving cp — each is (y, x) as fixed 8.24
      const pts = [];
      for (let i = 0; i < 3; i++) {
        const ry = readFixed(p);   p += 4;
        const rx = readFixed(p);   p += 4;
        pts.push({ x: rx * docW, y: ry * docH });
      }
      if (current) current.knots.push({ cp1: pts[0], anchor: pts[1], cp2: pts[2] });
      continue;
    }
    p += 24; // unknown record
  }

  let d = '';
  for (const sp of subpaths) {
    if (!sp.knots.length) continue;
    const k0 = sp.knots[0];
    d += `M${fmt(k0.anchor.x)},${fmt(k0.anchor.y)} `;
    for (let i = 0; i < sp.knots.length; i++) {
      const k = sp.knots[i];
      const kn = sp.knots[(i + 1) % sp.knots.length];
      if (i < sp.knots.length - 1 || sp.closed) {
        d += `C${fmt(k.cp2.x)},${fmt(k.cp2.y)} ${fmt(kn.cp1.x)},${fmt(kn.cp1.y)} ${fmt(kn.anchor.x)},${fmt(kn.anchor.y)} `;
      }
    }
    if (sp.closed) d += 'Z ';
  }
  return d.trim();
}

function readFixed(p) {
  return buf.readInt32BE(p) / 16777216.0;
}
function fmt(n) { return Math.round(n * 10) / 10; }

// Get canvas size from header (already known: 1254x1254)
const docW = 1254, docH = 1254;

// Get layer names in order (as fallback for path naming)
// We already have them from the script above — use rid offset
const layerNames = [
  '常青森林','5号道路','6号道路','7号道路','8号道路','9号道路','11号道路',
  '12号道路','13号道路','14号道路','15号道路','16号道路','17号道路','18号道路',
  '19号水路','2号道路','3号道路','4号道路','10号道路','20号水路','21号水路',
  '22号水路','24号道路','25号道路','月亮山','发电厂','狩猎地带','23号道路',
  '胜利道路','华蓝洞窟','地鼠洞窟','大豪宅','冰柱岛','岩石隧道','1号道路'
];

const paths = [];
pathResources.forEach((r, i) => {
  const zhName = r.name || layerNames[i] || `路径${i}`;
  const slug = NAME_TO_SLUG[zhName] || zhName;
  const d = parsePathData(r.dataStart, r.dataLen, docW, docH);
  if (d) paths.push({ zhName, slug, d });
  else console.warn('空路径:', zhName);
});

console.log(`解析完成：${paths.length} 条路径`);
paths.forEach(p => console.log(' -', p.zhName, '->', p.slug));

const svgPaths = paths.map(p =>
  `  <path id="${p.slug}" data-zh="${p.zhName}" d="${p.d}" />`
).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${docW} ${docH}" width="${docW}" height="${docH}">
${svgPaths}
</svg>`;

writeFileSync(SVG_OUT, svg, 'utf8');
console.log('SVG 已写入:', SVG_OUT);
