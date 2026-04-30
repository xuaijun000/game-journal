let _frlgSelectCb = null;
function frlgSetSelectMode(cb){ _frlgSelectCb = cb; }
function frlgClearSelectMode(){ _frlgSelectCb = null; }

const FRLG_IMG = {
  kanto : 'css/firered-and-leafgreen-versions-map/火红叶绿全局地图.png',
  sevii : 'css/firered-and-leafgreen-versions-map/七岛缩略图.png',
  island: n => `css/firered-and-leafgreen-versions-map/第${['一','二','三','四','五','六','七'][n-1]}岛.webp`,
};

const KANTO_REGIONS = [
  { label:'🏝 七岛', action:'sevii', x:80.14, y:79.11, w:19.22, h:20.02 },
];

const KANTO_HOTSPOTS = [
  // ── 左侧纵列 ──
  { label:'23号道路', x:5,  y:8,  key:'route-23' },
  { label:'常盘森林', x:14, y:17, key:'viridian-forest' },
  { label:'2号道路',  x:14, y:21, key:'route-2' },
  { label:'22号道路', x:8,  y:28, key:'route-22' },
  { label:'1号道路',  x:18, y:53, key:'route-1' },
  { label:'胜利道路', x:16, y:72, key:'victory-road-kanto' },
  { label:'21号道路', x:9,  y:83, key:'route-21' },
  // ── 上方横列 ──
  { label:'16号道路', x:35, y:16, key:'route-16' },
  { label:'24号道路', x:47, y:20, key:'route-24' },
  { label:'25号道路', x:55, y:16, key:'route-25' },
  { label:'7号道路',  x:58, y:17, key:'route-7' },
  { label:'8号道路',  x:86, y:17, key:'route-8' },
  // ── 中左区 ──
  { label:'3号道路',  x:26, y:34, key:'route-3' },
  { label:'月亮山',   x:22, y:39, key:'mt-moon' },
  { label:'4号道路',  x:32, y:29, key:'route-4' },
  { label:'17号道路', x:32, y:46, key:'route-17' },
  { label:'18号道路', x:33, y:82, key:'route-18' },
  // ── 中区 ──
  { label:'无名小径', x:44, y:30, key:'cerulean-cave' },
  { label:'5号道路',  x:50, y:35, key:'route-5' },
  { label:'6号道路',  x:62, y:33, key:'route-6' },
  { label:'狩猎地带', x:49, y:70, key:'kanto-safari-zone' },
  { label:'水流岛',   x:35, y:90, key:'seafoam-islands' },
  { label:'宝可梦洋馆', x:48, y:93, key:'kanto-pokemon-mansion' },
  { label:'19号道路', x:46, y:90, key:'route-19' },
  { label:'20号道路', x:36, y:90, key:'route-20' },
  // ── 右侧区 ──
  { label:'岩石隧道', x:89, y:4,  key:'rock-tunnel' },
  { label:'宝可梦之塔', x:93, y:13, key:'pokemon-tower' },
  { label:'12号道路', x:93, y:28, key:'route-12' },
  { label:'9号道路',  x:75, y:28, key:'route-9' },
  { label:'发电站',   x:87, y:28, key:'power-plant' },
  { label:'11号道路', x:81, y:37, key:'route-11' },
  { label:'10号道路', x:85, y:40, key:'route-10' },
  { label:'13号道路', x:73, y:64, key:'route-13' },
  { label:'14号道路', x:70, y:76, key:'route-14' },
  { label:'15号道路', x:58, y:77, key:'route-15' },
];

const SEVII_HOTSPOTS = [
  { label:'第一岛', x:30, y:25, action:'island-1', key:null },
  { label:'第二岛', x:55, y:20, action:'island-2', key:null },
  { label:'第三岛', x:70, y:30, action:'island-3', key:null },
  { label:'第四岛', x:25, y:55, action:'island-4', key:null },
  { label:'第五岛', x:50, y:60, action:'island-5', key:null },
  { label:'第六岛', x:70, y:55, action:'island-6', key:null },
  { label:'第七岛', x:55, y:80, action:'island-7', key:null },
];

const ISLAND_HOTSPOTS = {
  1: [
    { label:'熄灭道路', x:40, y:45, key:'kindle-road' },
    { label:'埋火山', x:70, y:35, key:'mt-ember' },
  ],
  2: [
    { label:'断崖之岬', x:50, y:40, key:'cape-brink' },
  ],
  3: [
    { label:'连结桥', x:35, y:50, key:'bond-bridge' },
    { label:'果实森林', x:65, y:45, key:'berry-forest' },
  ],
  4: [
    { label:'冰落洞窟', x:55, y:40, key:'icefall-cave' },
  ],
  5: [
    { label:'水的迷宫', x:35, y:55, key:'water-labyrinth' },
    { label:'石碑之岛', x:65, y:40, key:'memorial-pillar' },
  ],
  6: [
    { label:'遗迹山谷', x:40, y:45, key:'ruin-valley' },
    { label:'花纹草丛', x:65, y:55, key:'pattern-bush' },
    { label:'暗点洞穴', x:50, y:65, key:'dotted-hole' },
  ],
  7: [
    { label:'塞沃特峡谷', x:35, y:50, key:'sevault-canyon' },
    { label:'塔诺比遗迹', x:65, y:55, key:'tanoby-ruins' },
  ],
};

const FRLG_METHOD_META = {
  'walk'      : { label:'🌿草丛', icon:'🌿' },
  'surf'      : { label:'🌊冲浪', icon:'🌊' },
  'old-rod'   : { label:'🎣普通竿', icon:'🎣' },
  'good-rod'  : { label:'🎣好钓竿', icon:'🎣' },
  'super-rod' : { label:'🎣超级竿', icon:'🎣' },
  'rock-smash': { label:'🪨破岩', icon:'🪨' },
};

const FRLG_VERSION_META = {
  firered  : { label:'火红', short:'火', cls:'ver-fr' },
  leafgreen: { label:'叶绿', short:'叶', cls:'ver-lg' },
};

let frlgView = 'kanto';
let _frlgActiveMethodFilters = new Set();
let _frlgActiveVersionFilters = new Set();
let _frlgCurrentEncounters = [];
let _frlgCurrentLocationKey = '';
const _frlgPkmCache = {};
let _frlgCalibMode = false;
const _frlgCalibOverrides = {};
let _frlgDragging = false;
let _frlgSvgLabel = null;
let _frlgPolyRegions = {};
let _frlgPolyCalib = false;
let _frlgPolyDraft = [];
let _frlgPolyJustDbl = false;

// ── 自定义地图 ──────────────────────────────────────────────────────────────
let _frlgCustomViews = null;
function _frlgLoadCustomViews(){
  if(_frlgCustomViews)return _frlgCustomViews;
  try{_frlgCustomViews=JSON.parse(localStorage.getItem('frlg_custom_views')||'{}');}
  catch{_frlgCustomViews={};}
  return _frlgCustomViews;
}
function _frlgSaveCustomViews(){
  try{localStorage.setItem('frlg_custom_views',JSON.stringify(_frlgCustomViews||{}));}catch{}
}
function frlgGetCustomHotspots(view){
  try{return JSON.parse(localStorage.getItem('frlg_hotspots_'+view)||'[]');}catch{return[];}
}
function frlgSaveCustomHotspots(view,hotspots){
  try{localStorage.setItem('frlg_hotspots_'+view,JSON.stringify(hotspots));}catch{}
}
function frlgDeleteCustomView(key){
  const views=_frlgLoadCustomViews();
  delete views[key];
  _frlgSaveCustomViews();
  try{localStorage.removeItem('frlg_poly_'+key);localStorage.removeItem('frlg_hotspots_'+key);}catch{}
}

function initFRLGMapTab(seriesId) {
  const btn = document.getElementById('imm-map-btn');
  if (btn) btn.style.display = seriesId === 'firered-leafgreen' ? '' : 'none';
  if (typeof _immMapInited !== 'undefined') _immMapInited = false;
  frlgSetupPanel();
  if (seriesId !== 'firered-leafgreen') {
    const panel = document.getElementById('frlg-enc-panel');
    if (panel) panel.classList.remove('visible');
  }
}

function frlgInitView(view) {
  const nextView = view || 'kanto';
  if (_frlgPolyCalib) {
    _frlgPolyCalib = false;
    _frlgPolyDraft = [];
    document.getElementById('frlg-poly-info-bar')?.remove();
    document.getElementById('frlg-poly-inp')?.remove();
  }
  frlgView = nextView;
  _frlgActiveMethodFilters.clear();
  _frlgActiveVersionFilters.clear();
  _frlgCurrentEncounters = [];

  const breadcrumb = document.getElementById('frlg-breadcrumb');
  const viewer = document.getElementById('frlg-map-viewer');
  const panel = document.getElementById('frlg-enc-panel');
  if (!breadcrumb || !viewer) return;
  if (panel) panel.classList.remove('visible');

  breadcrumb.innerHTML = frlgBuildBreadcrumb(frlgView);
  frlgRenderCalibButton();

  const { src, hotspots, alt } = frlgGetViewConfig(frlgView);
  viewer.innerHTML = '<div class="frlg-map-loading" id="frlg-map-loading">加载中…</div>';
  viewer.classList.toggle('calib-mode', _frlgCalibMode);

  // calib-log 放在 viewer 外部（map-root 末尾），避免被 overflow:hidden 裁剪
  const root = viewer.closest('.frlg-map-root');
  let calibLog = document.getElementById('frlg-calib-log');
  if (!calibLog) {
    calibLog = document.createElement('div');
    calibLog.id = 'frlg-calib-log';
    calibLog.className = 'frlg-calib-log';
    if (root) root.appendChild(calibLog);
  } else {
    calibLog.innerHTML = '';
    calibLog.classList.remove('visible');
  }

  const img = document.createElement('img');
  img.alt = alt;
  img.src = src;
  img.draggable = false;
  img.onload = () => {
    const loading = document.getElementById('frlg-map-loading');
    if (loading) loading.style.display = 'none';
    frlgBindCalibEvents();
  };
  img.onerror = () => {
    const loading = document.getElementById('frlg-map-loading');
    if (loading) loading.style.display = 'none';
    const msg = document.createElement('div');
    msg.className = 'frlg-map-msg';
    msg.textContent = '地图图片加载失败';
    viewer.appendChild(msg);
  };

  viewer.appendChild(img);
  if (frlgView === 'kanto') {
    frlgRenderRegions(viewer, KANTO_REGIONS);
    frlgRenderPolyOverlay(viewer);
  } else if (frlgView.startsWith('custom:') || frlgView.startsWith('island-')) {
    frlgRenderHotspots(viewer, hotspots);
    frlgRenderPolyOverlay(viewer);
  } else {
    frlgRenderHotspots(viewer, hotspots);
  }
  frlgResetCalibrationSurface();
}

function frlgRenderHotspots(viewer, hotspots) {
  hotspots.forEach(hotspot => {
    const el = document.createElement('div');
    const override = _frlgCalibOverrides[hotspot.label];
    const x = override?.x ?? hotspot.x;
    const y = override?.y ?? hotspot.y;
    el.className = 'frlg-hotspot' + (hotspot.highlight ? ' highlight' : '') + (_frlgCalibMode ? ' draggable' : '');
    el.dataset.key = hotspot.key || hotspot.action || hotspot.label;
    el.dataset.label = hotspot.label;
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.innerHTML = `<div class="frlg-hotspot-dot"></div><div class="frlg-hotspot-label">${frlgEsc(hotspot.label)}</div>`;
    el.onclick = () => {
      if (_frlgDragging) return;
      document.querySelectorAll('.frlg-hotspot.active').forEach(node => node.classList.remove('active'));
      frlgTriggerRipple(el);
      if (hotspot.action) {
        frlgInitView(hotspot.action);
        return;
      }
      el.classList.add('active');
      if (!hotspot.key) return;
      const resolved = frlgResolveLocationKey(hotspot.key);
      frlgShowEncounters(resolved || hotspot.key, hotspot.label);
    };
    if (_frlgCalibMode) frlgBindHotspotDrag(el, hotspot);
    viewer.appendChild(el);
  });
}

function frlgRenderRegions(viewer, regions) {
  regions.forEach(region => {
    const el = document.createElement('div');
    el.className = 'frlg-region';
    el.style.position = 'absolute';
    el.style.left = region.x + '%';
    el.style.top = region.y + '%';
    el.style.width = region.w + '%';
    el.style.height = region.h + '%';
    el.style.cursor = 'pointer';
    el.style.background = 'transparent';
    if (region.label) el.setAttribute('aria-label', region.label);
    el.onclick = () => {
      if (region.action) {
        frlgInitView(region.action);
        return;
      }
      if (!region.key) return;
      const resolved = frlgResolveLocationKey(region.key);
      frlgShowEncounters(resolved || region.key, region.label);
    };
    viewer.appendChild(el);
  });
}

async function frlgShowEncounters(locationKey, locationLabel) {
  if (_frlgSelectCb) {
    _frlgSelectCb(locationKey, locationLabel);
    return;
  }
  const panel = document.getElementById('frlg-enc-panel');
  const title = document.getElementById('frlg-enc-title');
  const methodsWrap = document.getElementById('frlg-enc-methods');
  const grid = document.getElementById('frlg-enc-grid');
  if (!panel || !title || !methodsWrap || !grid) return;

  panel.classList.add('visible');
  _frlgCurrentLocationKey = locationKey;
  _frlgActiveMethodFilters.clear();
  _frlgActiveVersionFilters.clear();

  if (typeof FRLG_ENCOUNTERS === 'undefined') {
    title.textContent = locationLabel;
    methodsWrap.innerHTML = '';
    grid.innerHTML = '<div class="frlg-empty-note">请先运行 node scripts/scrape-frlg-encounters.mjs 生成数据</div>';
    return;
  }

  const entry = FRLG_ENCOUNTERS[locationKey];
  if (!entry || !Array.isArray(entry.encounters) || !entry.encounters.length) {
    title.textContent = locationLabel;
    methodsWrap.innerHTML = '';
    grid.innerHTML = '<div class="frlg-empty-note">这个地点目前没有可显示的野生精灵数据</div>';
    return;
  }

  title.textContent = (entry.zh || locationLabel) + ' · 野生分布';
  _frlgCurrentEncounters = entry.encounters
    .slice()
    .sort((a, b) => (b.rate || 0) - (a.rate || 0) || a.slug.localeCompare(b.slug));

  frlgRenderMethodFilters();
  frlgRenderEncounterGrid();
}

function frlgRenderMethodFilters() {
  const methodsWrap = document.getElementById('frlg-enc-methods');
  if (!methodsWrap) return;

  const methods = [...new Set(_frlgCurrentEncounters.flatMap(item => item.methods || []))]
    .filter(Boolean);
  const versions = [...new Set(_frlgCurrentEncounters.flatMap(item => item.versions || []))]
    .filter(Boolean);
  const versionHtml = versions.length > 1
    ? `<div class="frlg-filter-group"><span class="frlg-filter-label">版本</span>${versions.map(version => {
        const meta = FRLG_VERSION_META[version] || { label: version, cls: '' };
        const cls = _frlgActiveVersionFilters.has(version) ? ' on' : '';
        return `<button class="frlg-method-badge frlg-version-badge ${meta.cls || ''}${cls}" onclick="frlgToggleVersionFilter('${version}')">${meta.label}</button>`;
      }).join('')}</div>`
    : '';
  const methodHtml = methods.length
    ? `<div class="frlg-filter-group"><span class="frlg-filter-label">方式</span>${methods.map(method => {
    const meta = FRLG_METHOD_META[method] || { label: method, icon: '•' };
    const cls = _frlgActiveMethodFilters.has(method) ? ' on' : '';
    return `<button class="frlg-method-badge${cls}" onclick="frlgToggleMethodFilter('${method}')">${meta.label}</button>`;
      }).join('')}</div>`
    : '';
  methodsWrap.innerHTML = versionHtml + methodHtml;
}

function frlgToggleMethodFilter(method) {
  if (_frlgActiveMethodFilters.has(method)) _frlgActiveMethodFilters.delete(method);
  else _frlgActiveMethodFilters.add(method);
  frlgRenderMethodFilters();
  frlgRenderEncounterGrid();
}

function frlgToggleVersionFilter(version) {
  if (_frlgActiveVersionFilters.has(version)) _frlgActiveVersionFilters.delete(version);
  else _frlgActiveVersionFilters.add(version);
  frlgRenderMethodFilters();
  frlgRenderEncounterGrid();
}

function frlgRenderVersionTags(versions=[]) {
  const vers = [...new Set(versions)].filter(Boolean);
  if (!vers.length) return '';
  if (vers.includes('firered') && vers.includes('leafgreen')) {
    return '<div class="frlg-enc-ver ver-both">火红/叶绿</div>';
  }
  return vers.map(version => {
    const meta = FRLG_VERSION_META[version] || { label: version, cls: '' };
    return `<div class="frlg-enc-ver ${meta.cls || ''}">${frlgEsc(meta.label)}</div>`;
  }).join('');
}

function frlgRenderMethodTags(methods=[]) {
  return [...new Set(methods)].filter(Boolean).map(method => {
    const meta = FRLG_METHOD_META[method] || { label: method, icon: '•' };
    return `<span class="frlg-method-mini">${frlgEsc(meta.label)}</span>`;
  }).join('');
}

function frlgRenderEncounterGrid() {
  const grid = document.getElementById('frlg-enc-grid');
  if (!grid) return;

  const activeMethods = [..._frlgActiveMethodFilters];
  const activeVersions = [..._frlgActiveVersionFilters];
  const items = _frlgCurrentEncounters.filter(item =>
    (!activeMethods.length || activeMethods.some(method => (item.methods || []).includes(method))) &&
    (!activeVersions.length || activeVersions.some(version => (item.versions || []).includes(version)))
  );

  if (!items.length) {
    grid.innerHTML = '<div class="frlg-empty-note">当前筛选下没有符合的精灵</div>';
    return;
  }

  grid.innerHTML = items.map((item, idx) => {
    const icons = (item.methods || []).map(m => FRLG_METHOD_META[m]?.icon || '•').join(' ');
    const methodTags = frlgRenderMethodTags(item.methods || []);
    const name = frlgGetPkmName(null, item.slug);
    const lv = item.minLv === item.maxLv ? `Lv.${item.minLv}` : `Lv.${item.minLv}-${item.maxLv}`;
    const rateCls = item.rate >= 20 ? 'rate-hi' : item.rate >= 10 ? 'rate-md' : 'rate-lo';
    const verTag = frlgRenderVersionTags(item.versions || []);
    return `<div class="frlg-enc-card" id="frlg-enc-card-${idx}" style="animation-delay:${idx * 40}ms">
      <div class="frlg-enc-sprite"><div class="frlg-enc-placeholder"></div></div>
      <div class="frlg-enc-method-icons">${icons}</div>
      <div class="frlg-enc-name">${frlgEsc(name)}</div>
      <div class="frlg-enc-lv">${frlgEsc(lv)}</div>
      <div class="frlg-enc-rate ${rateCls}">${item.rate || 0}%</div>
      <div class="frlg-enc-tags">${verTag}${methodTags}</div>
    </div>`;
  }).join('');

  items.forEach((item, idx) => frlgHydrateEncounterCard(item, idx));
}

async function frlgHydrateEncounterCard(item, idx) {
  const card = document.getElementById('frlg-enc-card-' + idx);
  if (!card) return;
  const spriteWrap = card.querySelector('.frlg-enc-sprite');
  const nameEl = card.querySelector('.frlg-enc-name');
  if (!spriteWrap || !nameEl) return;

  const data = await _frlgGetPkmData(item.slug);
  if (!card.isConnected) return;

  nameEl.textContent = frlgGetPkmName(data.id, item.slug);
  if (!data.sprite) {
    spriteWrap.innerHTML = '<div class="frlg-enc-placeholder"></div>';
    return;
  }

  const img = document.createElement('img');
  img.alt = nameEl.textContent;
  img.src = data.sprite;
  img.loading = 'lazy';
  img.onerror = () => { spriteWrap.innerHTML = '<div class="frlg-enc-placeholder"></div>'; };
  spriteWrap.innerHTML = '';
  spriteWrap.appendChild(img);
}

async function _frlgGetPkmData(slug) {
  const cached = _frlgPkmCache[slug];
  if (cached?.data) return cached.data;
  if (cached?.promise) return cached.promise;

  const promise = fetch('https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(slug))
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      const out = {
        id    : data?.id ?? null,
        sprite: data?.sprites?.front_default || '',
      };
      _frlgPkmCache[slug] = { data: out };
      return out;
    })
    .catch(() => {
      const out = { id: null, sprite: '' };
      _frlgPkmCache[slug] = { data: out };
      return out;
    });

  _frlgPkmCache[slug] = { promise };
  return promise;
}

function frlgBuildBreadcrumb(view) {
  const crumbs = [{ label:'关都', view:'kanto' }];
  if (view === 'sevii') crumbs.push({ label:'七岛总览', view:'sevii' });
  if (view.startsWith('island-')) {
    crumbs.push({ label:'七岛总览', view:'sevii' });
    crumbs.push({ label:`第${frlgIslandCn(Number(view.split('-')[1]))}岛`, view });
  }
  if (view.startsWith('custom:')) {
    const chain = [];
    let cur = view;
    const visited = new Set(['kanto']);
    while (cur && !visited.has(cur)) {
      visited.add(cur);
      const v = _frlgLoadCustomViews()[cur];
      if (!v) break;
      chain.unshift({ label: v.label, view: cur });
      cur = v.parent || 'kanto';
    }
    chain.forEach(c => crumbs.push(c));
  }

  return crumbs.map((crumb, idx) => {
    const isLast = idx === crumbs.length - 1;
    const node = isLast
      ? `<span>${frlgEsc(crumb.label)}</span>`
      : `<span class="frlg-crumb-link" onclick="frlgInitView('${crumb.view}')">${frlgEsc(crumb.label)}</span>`;
    return idx ? `<span class="frlg-crumb-sep">›</span>${node}` : node;
  }).join('');
}

function frlgGetViewConfig(view) {
  if (view === 'sevii') {
    return { src: FRLG_IMG.sevii, hotspots: SEVII_HOTSPOTS, alt: '七岛总览地图' };
  }
  if (view.startsWith('island-')) {
    const n = Number(view.split('-')[1]);
    return { src: FRLG_IMG.island(n), hotspots: ISLAND_HOTSPOTS[n] || [], alt: `第${frlgIslandCn(n)}岛地图` };
  }
  if (view.startsWith('custom:')) {
    const v = _frlgLoadCustomViews()[view];
    const hotspots = frlgGetCustomHotspots(view);
    if (v) return { src: v.imgSrc || '', hotspots, alt: v.label };
    return { src: '', hotspots, alt: '自定义地图' };
  }
  return { src: FRLG_IMG.kanto, hotspots: KANTO_HOTSPOTS, alt: '关都地图' };
}

function frlgResolveLocationKey(key) {
  if (typeof FRLG_ENCOUNTERS === 'undefined' || !key) return key;
  if (FRLG_ENCOUNTERS[key]) return key;

  const routeMatch = key.match(/^route-(\d+)$/);
  const candidates = [
    key,
    routeMatch ? `kanto-route-${routeMatch[1]}` : '',
    routeMatch && ['19', '20', '21'].includes(routeMatch[1]) ? `kanto-sea-route-${routeMatch[1]}` : '',
    key === 'power-plant' ? 'kanto-power-plant' : '',
    key === 'kanto-pokemon-mansion' ? 'pokemon-mansion' : '',
    key === 'victory-road-kanto' ? 'kanto-victory-road-2' : '',
    key === 'route-19' ? 'kanto-sea-route-19' : '',
    key === 'route-20' ? 'kanto-sea-route-20' : '',
    key === 'route-21' ? 'kanto-sea-route-21' : '',
  ].filter(Boolean);

  return candidates.find(candidate => FRLG_ENCOUNTERS[candidate]) || key;
}

function frlgGetPkmName(id, slug) {
  if (id && typeof PKM_CN_TABLE !== 'undefined' && PKM_CN_TABLE[id]) return PKM_CN_TABLE[id];
  return slug;
}

function frlgEsc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function frlgIslandCn(n) {
  return ['一','二','三','四','五','六','七'][n - 1] || String(n);
}

function frlgTriggerRipple(el) {
  const dot = el.querySelector('.frlg-hotspot-dot');
  const target = dot || el;
  const old = target.querySelector('.frlg-ripple');
  if (old) old.remove();
  const ripple = document.createElement('div');
  ripple.className = 'frlg-ripple';
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  target.appendChild(ripple);
}

function frlgSetupPanel() {
  const panel = document.getElementById('frlg-enc-panel');
  if (!panel) return;
  panel.style.display = '';
  const closeBtn = panel.querySelector('.frlg-enc-header .btn');
  if (closeBtn && !closeBtn.dataset.frlgBound) {
    closeBtn.dataset.frlgBound = '1';
    closeBtn.onclick = () => {
      panel.classList.remove('visible');
      document.querySelectorAll('.frlg-poly-region.active').forEach(p=>p.classList.remove('active'));
    };
  }
}

function frlgRenderCalibButton() {
  const breadcrumb = document.getElementById('frlg-breadcrumb');
  if (!breadcrumb) return;
  breadcrumb.querySelectorAll('.frlg-calib-btn,.frlg-export-btn,.frlg-poly-calib-btn,.frlg-poly-export-btn,.frlg-newview-btn').forEach(n => n.remove());

  const usePolyCalib = frlgView === 'kanto' || frlgView.startsWith('island-') || frlgView.startsWith('custom:');
  if (usePolyCalib) {
    const polyBtn = document.createElement('button');
    polyBtn.className = 'frlg-poly-calib-btn' + (_frlgPolyCalib ? ' on' : '');
    polyBtn.style.marginLeft = 'auto';
    polyBtn.textContent = _frlgPolyCalib ? '标定中 ✕' : '标定区域';
    polyBtn.onclick = frlgPolyToggle;
    breadcrumb.appendChild(polyBtn);
    if (_frlgPolyCalib) {
      const expBtn = document.createElement('button');
      expBtn.className = 'frlg-poly-export-btn';
      expBtn.textContent = '导出 JSON';
      expBtn.onclick = frlgPolyExport;
      breadcrumb.appendChild(expBtn);

      const newMapBtn = document.createElement('button');
      newMapBtn.className = 'frlg-poly-calib-btn frlg-newview-btn';
      newMapBtn.textContent = '➕ 新子地图';
      newMapBtn.onclick = () => {
        const viewer = document.getElementById('frlg-map-viewer');
        if (viewer) frlgShowNewSubViewDialog(viewer, key => frlgInitView(key));
      };
      breadcrumb.appendChild(newMapBtn);

      if (frlgView.startsWith('custom:')) {
        const delBtn = document.createElement('button');
        delBtn.className = 'frlg-poly-calib-btn frlg-newview-btn';
        delBtn.style.color = 'rgba(248,113,113,.9)';
        delBtn.textContent = '🗑 删除此图';
        delBtn.onclick = () => {
          const v = _frlgLoadCustomViews()[frlgView];
          if (!confirm('删除地图「' + (v?.label || frlgView) + '」及其所有区域？')) return;
          const parent = v?.parent || 'kanto';
          frlgDeleteCustomView(frlgView);
          frlgInitView(parent);
        };
        breadcrumb.appendChild(delBtn);
      }
    }
  } else {
    const btn = document.createElement('button');
    btn.className = 'frlg-calib-btn' + (_frlgCalibMode ? ' on' : '');
    btn.style.marginLeft = 'auto';
    btn.textContent = _frlgCalibMode ? '校准模式开' : '校准模式关';
    btn.onclick = () => { _frlgCalibMode = !_frlgCalibMode; frlgRenderCalibButton(); frlgApplyCalibrationMode(); };
    breadcrumb.appendChild(btn);
    if (_frlgCalibMode) {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'frlg-export-btn';
      exportBtn.textContent = '导出坐标';
      exportBtn.onclick = () => frlgExportCurrentHotspots();
      breadcrumb.appendChild(exportBtn);
    }
  }
}

function frlgApplyCalibrationMode() {
  // 直接重渲染当前视图，让 frlgRenderHotspots 按最新的 _frlgCalibMode 状态
  // 重新创建所有热点元素并绑定拖拽，避免事后补绑的时机问题
  frlgInitView(frlgView);
}

function frlgBindCalibEvents() {
  const viewer = document.getElementById('frlg-map-viewer');
  const img = viewer?.querySelector('img');
  if (!viewer || !img) return;

  viewer.onmousemove = e => {
    if (!_frlgCalibMode) return;
    const pos = frlgGetPercentFromEvent(e, img);
    if (!pos) return;
    frlgShowCalibCursor(e.clientX, e.clientY, pos, viewer);
  };
  viewer.onmouseleave = () => {
    if (!_frlgCalibMode) return;
    const cursor = document.getElementById('frlg-calib-cursor');
    if (cursor) cursor.style.display = 'none';
  };
  viewer.onclick = e => {
    if (!_frlgCalibMode) return;
    if (e.target.closest('.frlg-hotspot')) return;
    const pos = frlgGetPercentFromEvent(e, img);
    if (!pos) return;
    frlgAddCalibMarker(viewer, pos);
    frlgAppendCalibLog(pos);
  };
}

function frlgGetPercentFromEvent(e, img) {
  const rect = img.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const relX = e.clientX - rect.left;
  const relY = e.clientY - rect.top;
  if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return null;
  const x = Number(((relX / rect.width) * 100).toFixed(1));
  const y = Number(((relY / rect.height) * 100).toFixed(1));
  return { x, y };
}

function frlgShowCalibCursor(clientX, clientY, pos, viewer) {
  let cursor = document.getElementById('frlg-calib-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'frlg-calib-cursor';
    cursor.className = 'frlg-calib-cursor';
    document.body.appendChild(cursor);
  }
  cursor.style.display = 'block';
  cursor.textContent = `x: ${pos.x}  y: ${pos.y}`;

  const viewerRect = viewer.getBoundingClientRect();
  const cursorRect = { width: cursor.offsetWidth || 92, height: cursor.offsetHeight || 24 };
  let left = clientX + 8;
  let top = clientY + 8;
  if (left + cursorRect.width > viewerRect.right) left = clientX - cursorRect.width - 8;
  if (top + cursorRect.height > viewerRect.bottom) top = clientY - cursorRect.height - 8;
  left = Math.max(viewerRect.left, left);
  top = Math.max(viewerRect.top, top);
  cursor.style.left = left + 'px';
  cursor.style.top = top + 'px';
}

function frlgAddCalibMarker(viewer, pos) {
  const marker = document.createElement('div');
  marker.className = 'frlg-calib-marker';
  marker.style.left = pos.x + '%';
  marker.style.top = pos.y + '%';
  viewer.appendChild(marker);
}

function frlgAppendCalibLog(pos) {
  const log = document.getElementById('frlg-calib-log');
  if (!log) return;
  log.classList.add('visible');
  const line = `x:${Math.round(pos.x)}, y:${Math.round(pos.y)}  ← 点击后复制这行到对应热点坐标`;
  const row = document.createElement('div');
  row.textContent = line;
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(line).catch(() => {});
}

function frlgAppendCalibText(text) {
  const log = document.getElementById('frlg-calib-log');
  if (!log) return;
  log.classList.add('visible');
  const row = document.createElement('div');
  row.textContent = text;
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
}

function frlgResetCalibrationSurface() {
  const viewer = document.getElementById('frlg-map-viewer');
  if (!viewer) return;
  viewer.classList.toggle('calib-mode', _frlgCalibMode);
  if (!_frlgCalibMode) {
    viewer.querySelectorAll('.frlg-calib-marker').forEach(node => node.remove());
    const log = document.getElementById('frlg-calib-log');
    if (log) {
      log.innerHTML = '';
      log.classList.remove('visible');
    }
    const cursor = document.getElementById('frlg-calib-cursor');
    if (cursor) cursor.style.display = 'none';
  }
}

function frlgBindHotspotDrag(el, hotspot) {
  if (el.dataset.calibBound === '1') return;
  el.dataset.calibBound = '1';

  const startDrag = startEvent => {
    if (!_frlgCalibMode) return;
    if (startEvent.cancelable) startEvent.preventDefault();
    startEvent.stopPropagation();

    const viewer = document.getElementById('frlg-map-viewer');
    const img = viewer?.querySelector('img');
    if (!viewer || !img) return;

    const startPoint = frlgGetPointerPoint(startEvent);
    const startClientX = startPoint.clientX;
    const startClientY = startPoint.clientY;
    let moved = false;

    el.classList.add('dragging');

    const moveHandler = moveEvent => {
      if (!_frlgCalibMode) return;
      const point = frlgGetPointerPoint(moveEvent);
      const dx = point.clientX - startClientX;
      const dy = point.clientY - startClientY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      if (moveEvent.cancelable) moveEvent.preventDefault();

      const rect = img.getBoundingClientRect();
      const rawX = ((point.clientX - rect.left) / rect.width) * 100;
      const rawY = ((point.clientY - rect.top) / rect.height) * 100;
      const x = frlgClamp(Number(rawX.toFixed(1)), 1, 99);
      const y = frlgClamp(Number(rawY.toFixed(1)), 1, 99);
      el.style.left = x + '%';
      el.style.top = y + '%';
    };

    const endHandler = endEvent => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', endHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchend', endHandler);
      document.removeEventListener('touchcancel', endHandler);
      el.classList.remove('dragging');

      if (!moved) return;
      if (endEvent.cancelable) endEvent.preventDefault();
      const x = Number(parseFloat(el.style.left).toFixed(1));
      const y = Number(parseFloat(el.style.top).toFixed(1));
      _frlgCalibOverrides[hotspot.label] = { x, y };
      _frlgDragging = true;
      frlgAppendCalibText(`已移动: ${hotspot.label}  x:${x} y:${y}`);
      setTimeout(() => { _frlgDragging = false; }, 100);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
    document.addEventListener('touchcancel', endHandler);
  };

  el.addEventListener('mousedown', startDrag);
  el.addEventListener('touchstart', startDrag, { passive: false });
}

function frlgGetPointerPoint(event) {
  return event.touches?.[0] || event.changedTouches?.[0] || event;
}

function frlgClamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function frlgGetCurrentViewHotspots() {
  if (frlgView === 'kanto') return KANTO_HOTSPOTS;
  if (frlgView === 'sevii') return SEVII_HOTSPOTS;
  if (frlgView.startsWith('island-')) {
    const n = Number(frlgView.split('-')[1]);
    return ISLAND_HOTSPOTS[n] || [];
  }
  return [];
}

function frlgExportCurrentHotspots() {
  const hotspots = frlgGetCurrentViewHotspots();
  const meta = frlgGetCurrentViewExportMeta();
  const text = `// ${meta.title}（校准后）
const ${meta.varName} = [
${hotspots.map(hotspot => '  ' + frlgFormatHotspotForExport(hotspot)).join('\n')}
];`;
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
  frlgAppendCalibText('✓ 已复制到剪贴板');
}

function frlgGetCurrentViewExportMeta() {
  if (frlgView === 'kanto') return { title: '关都热点', varName: 'KANTO_HOTSPOTS' };
  if (frlgView === 'sevii') return { title: '七岛总览热点', varName: 'SEVII_HOTSPOTS' };
  if (frlgView.startsWith('island-')) {
    const n = Number(frlgView.split('-')[1]);
    return { title: `第${frlgIslandCn(n)}岛热点`, varName: `ISLAND_HOTSPOTS[${n}]` };
  }
  return { title: '热点', varName: 'HOTSPOTS' };
}

function frlgFormatHotspotForExport(hotspot) {
  const override = _frlgCalibOverrides[hotspot.label];
  const x = override?.x ?? hotspot.x;
  const y = override?.y ?? hotspot.y;
  const parts = [
    `label:'${frlgJsStr(hotspot.label)}'`,
    `x:${x}`,
    `y:${y}`,
  ];
  if (Object.prototype.hasOwnProperty.call(hotspot, 'key')) {
    parts.push(hotspot.key === null ? 'key:null' : `key:'${frlgJsStr(hotspot.key)}'`);
  }
  if (hotspot.action) parts.push(`action:'${frlgJsStr(hotspot.action)}'`);
  if (hotspot.highlight) parts.push('highlight:true');
  return `{ ${parts.join(', ')} },`;
}

function frlgJsStr(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ── Polygon region system ─────────────────────────────────────────────────────

const _frlgNS = 'http://www.w3.org/2000/svg';
const _frlgPolySlugMap = {
  '1号道路':'kanto-route-1','2号道路':'kanto-route-2','3号道路':'kanto-route-3',
  '4号道路':'kanto-route-4','5号道路':'kanto-route-5','6号道路':'kanto-route-6',
  '7号道路':'kanto-route-7','8号道路':'kanto-route-8','9号道路':'kanto-route-9',
  '10号道路':'kanto-route-10','11号道路':'kanto-route-11','12号道路':'kanto-route-12',
  '13号道路':'kanto-route-13','14号道路':'kanto-route-14','15号道路':'kanto-route-15',
  '16号道路':'kanto-route-16','17号道路':'kanto-route-17','18号道路':'kanto-route-18',
  '19号水路':'kanto-sea-route-19','20号水路':'kanto-sea-route-20','21号水路':'kanto-sea-route-21',
  '22号道路':'kanto-route-22','23号道路':'kanto-route-23','24号道路':'kanto-route-24','25号道路':'kanto-route-25',
  '常青森林':'viridian-forest','月亮山':'mt-moon','岩石隧道':'rock-tunnel',
  '发电厂':'kanto-power-plant','冰柱岛':'seafoam-islands','狩猎地带':'kanto-safari-zone',
  '胜利道路':'kanto-victory-road-2','华蓝洞窟':'cerulean-cave','地鼠洞窟':'digletts-cave',
  '大豪宅':'pokemon-mansion','变化洞窟':'kanto-altering-cave',
};

function frlgPolyGetRegions(v) {
  const view = v || frlgView;
  if (!_frlgPolyRegions[view]) {
    try {
      const raw = localStorage.getItem('frlg_poly_' + view);
      _frlgPolyRegions[view] = raw ? JSON.parse(raw) : [];
    } catch { _frlgPolyRegions[view] = []; }
  }
  return _frlgPolyRegions[view];
}

function frlgPolySave(v) {
  const view = v || frlgView;
  try { localStorage.setItem('frlg_poly_' + view, JSON.stringify(_frlgPolyRegions[view] || [])); } catch {}
}

function frlgRenderPolyOverlay(viewer) {
  viewer.querySelector('.frlg-poly-overlay')?.remove();
  const regions = frlgPolyGetRegions();

  const svg = document.createElementNS(_frlgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.classList.add('frlg-poly-overlay');

  regions.forEach((region, idx) => {
    const poly = document.createElementNS(_frlgNS, 'polygon');
    poly.setAttribute('points', region.pts.map(p => p.x + ',' + p.y).join(' '));
    if (_frlgPolyCalib) {
      poly.classList.add('frlg-poly-calib-existing');
      poly.addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm('删除"' + region.zh + '"?')) return;
        regions.splice(idx, 1);
        frlgPolySave();
        frlgRenderPolyOverlay(viewer);
        frlgPolyUpdateInfo();
      });
    } else {
      poly.classList.add('frlg-poly-region');
      if (region.subView) poly.classList.add('has-subview');
      const hoverLabel = region.subView ? ('📂 ' + region.zh) : region.zh;
      poly.addEventListener('mouseenter', e => frlgShowSvgLabel(hoverLabel, e));
      poly.addEventListener('mousemove', frlgMoveSvgLabel);
      poly.addEventListener('mouseleave', frlgHideSvgLabel);
      poly.addEventListener('click', e => {
        e.stopPropagation();
        if (region.subView) { frlgInitView(region.subView); return; }
        svg.querySelectorAll('.frlg-poly-region.active').forEach(p => p.classList.remove('active'));
        poly.classList.add('active');
        const resolved = frlgResolveLocationKey(region.slug);
        frlgShowEncounters(resolved || region.slug, region.zh);
      });
    }
    svg.appendChild(poly);
  });

  if (_frlgPolyCalib) {
    // In-progress draft
    if (_frlgPolyDraft.length) {
      const line = document.createElementNS(_frlgNS, 'polyline');
      line.setAttribute('points', _frlgPolyDraft.map(p => p.x + ',' + p.y).join(' '));
      line.classList.add('frlg-poly-draft-line');
      svg.appendChild(line);

      const cl = document.createElementNS(_frlgNS, 'line');
      cl.id = 'frlg-poly-cline';
      cl.classList.add('frlg-poly-cursor-line');
      const last = _frlgPolyDraft[_frlgPolyDraft.length - 1];
      cl.setAttribute('x1', last.x); cl.setAttribute('y1', last.y);
      cl.setAttribute('x2', last.x); cl.setAttribute('y2', last.y);
      svg.appendChild(cl);

      _frlgPolyDraft.forEach((pt, i) => {
        const c = document.createElementNS(_frlgNS, 'circle');
        c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y);
        const isFirst = i === 0 && _frlgPolyDraft.length >= 3;
        c.setAttribute('r', isFirst ? '1.0' : '0.6');
        c.classList.add('frlg-poly-vertex');
        if (isFirst) {
          c.style.fill = 'rgba(74,222,128,.9)';
          c.style.cursor = 'pointer';
          c.addEventListener('click', e => { e.stopPropagation(); frlgPolyFinish(viewer); });
        }
        svg.appendChild(c);
      });
    }

    svg.style.cursor = 'crosshair';

    svg.addEventListener('mousemove', e => {
      const cl = svg.querySelector('#frlg-poly-cline');
      if (!cl) return;
      const pt = frlgPolySvgPt(e, svg);
      cl.setAttribute('x2', pt.x); cl.setAttribute('y2', pt.y);
    });

    svg.addEventListener('dblclick', e => {
      if (e.target.classList.contains('frlg-poly-calib-existing')) return;
      _frlgPolyJustDbl = true;
      setTimeout(() => { _frlgPolyJustDbl = false; }, 50);
      if (_frlgPolyDraft.length >= 4) {
        _frlgPolyDraft.pop(); // remove duplicate vertex from second click
        frlgPolyFinish(viewer);
      } else if (_frlgPolyDraft.length === 3) {
        frlgPolyFinish(viewer);
      }
    });

    svg.addEventListener('click', e => {
      if (_frlgPolyJustDbl) return;
      if (e.target.classList.contains('frlg-poly-calib-existing')) return;
      if (e.target.classList.contains('frlg-poly-vertex')) return;
      const pt = frlgPolySvgPt(e, svg);
      _frlgPolyDraft.push(pt);
      frlgRenderPolyOverlay(viewer);
      frlgPolyUpdateInfo();
    });

    svg.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (_frlgPolyDraft.length) { _frlgPolyDraft = []; frlgRenderPolyOverlay(viewer); frlgPolyUpdateInfo(); }
    });
  }

  viewer.appendChild(svg);
}

function frlgPolySvgPt(e, svg) {
  const r = svg.getBoundingClientRect();
  return {
    x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 10,
    y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 10,
  };
}

function frlgPolyFinish(viewer) {
  if (_frlgPolyDraft.length < 3) return;
  const pts = [..._frlgPolyDraft];
  _frlgPolyDraft = [];
  frlgRenderPolyOverlay(viewer);
  frlgPolyShowInput(pts, viewer);
}

function frlgPolyShowInput(pts, viewer) {
  document.getElementById('frlg-poly-inp')?.remove();
  const root = viewer.closest('.frlg-map-root');
  if (!root) return;

  const views = _frlgLoadCustomViews();
  const viewOpts = Object.entries(views).map(([k, v]) =>
    `<option value="${k}">${v.label}</option>`).join('');

  const panel = document.createElement('div');
  panel.id = 'frlg-poly-inp';
  panel.className = 'frlg-poly-input-panel';
  panel.innerHTML =
    '<span class="frlg-poly-inp-label">新区域</span>' +
    '<input id="frlg-poly-inp-zh" class="frlg-poly-inp-field" placeholder="中文名（如 1号道路）" />' +
    '<input id="frlg-poly-inp-slug" class="frlg-poly-inp-field" placeholder="遭遇key（如 kanto-route-1）" />' +
    '<select id="frlg-poly-inp-sv" class="frlg-poly-inp-field" title="链接子地图（可选）">' +
    '<option value="">无子地图</option>' + viewOpts +
    '<option value="__new__">➕ 新建子地图…</option>' +
    '</select>' +
    '<button class="frlg-poly-inp-save" id="frlg-poly-inp-ok">保存</button>' +
    '<button class="frlg-poly-inp-cancel" id="frlg-poly-inp-no">取消</button>';
  root.appendChild(panel);

  const zh = document.getElementById('frlg-poly-inp-zh');
  const slug = document.getElementById('frlg-poly-inp-slug');
  const svSel = document.getElementById('frlg-poly-inp-sv');

  svSel.onchange = () => {
    if (svSel.value !== '__new__') return;
    svSel.value = '';
    frlgShowNewSubViewDialog(viewer, key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = _frlgLoadCustomViews()[key]?.label || key;
      svSel.insertBefore(opt, svSel.lastElementChild);
      svSel.value = key;
    });
  };

  zh.addEventListener('input', () => { const s = _frlgPolySlugMap[zh.value.trim()]; if (s) slug.value = s; });
  zh.focus();

  const save = () => {
    const z = zh.value.trim(), s = slug.value.trim(), sv = svSel.value;
    if (!z) { zh.focus(); return; }
    if (!s && !sv) { slug.focus(); return; }
    const region = { zh: z, pts };
    if (s) region.slug = s;
    if (sv) region.subView = sv;
    frlgPolyGetRegions().push(region);
    frlgPolySave();
    panel.remove();
    frlgRenderPolyOverlay(viewer);
    frlgPolyUpdateInfo();
  };
  zh.addEventListener('keydown', e => { if (e.key === 'Enter') { (slug.value||svSel.value) ? save() : slug.focus(); } });
  slug.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
  document.getElementById('frlg-poly-inp-ok').onclick = save;
  document.getElementById('frlg-poly-inp-no').onclick = () => { panel.remove(); frlgPolyUpdateInfo(); };
}

function frlgPolyUpdateInfo() {
  const el = document.getElementById('frlg-poly-info-bar');
  if (!el) return;
  const n = frlgPolyGetRegions().length;
  el.textContent = _frlgPolyDraft.length
    ? '绘制中（' + _frlgPolyDraft.length + ' 顶点）— 双击或点首顶点完成 · 右键取消'
    : '已有 ' + n + ' 个区域 · 点击地图添加顶点，双击完成多边形 · 点已有区域（黄色）可删除';
}

function frlgPolyToggle() {
  const viewer = document.getElementById('frlg-map-viewer');
  if (!viewer) return;
  _frlgPolyCalib = !_frlgPolyCalib;
  _frlgPolyDraft = [];
  document.getElementById('frlg-poly-inp')?.remove();
  frlgHideSvgLabel();

  const root = viewer.closest('.frlg-map-root');
  document.getElementById('frlg-poly-info-bar')?.remove();
  if (_frlgPolyCalib && root) {
    const bar = document.createElement('div');
    bar.id = 'frlg-poly-info-bar';
    bar.className = 'frlg-poly-info-bar';
    root.insertBefore(bar, viewer.nextSibling);
    frlgPolyUpdateInfo();
  }

  frlgRenderPolyOverlay(viewer);
  frlgRenderCalibButton();
}

function frlgPolyExport() {
  const regions = frlgPolyGetRegions();
  navigator.clipboard?.writeText(JSON.stringify(regions, null, 2)).then(() => {
    frlgAppendCalibText('✓ 已复制 ' + regions.length + ' 个多边形区域 JSON');
  });
}

function frlgShowNewSubViewDialog(viewer, onCreated) {
  const existing = viewer.querySelector('.frlg-new-subview-modal');
  if (existing) { existing.remove(); return; }
  const modal = document.createElement('div');
  modal.className = 'frlg-new-subview-modal';
  modal.style.cssText = 'position:absolute;inset:0;z-index:100;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:var(--bg2);border-radius:10px;padding:16px 18px;width:min(300px,90%);display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.5)">
      <div style="font-size:.78rem;font-family:'DM Mono',monospace;color:var(--t1);font-weight:600">➕ 新建子地图</div>
      <input id="frlg-nsv-name" style="padding:5px 8px;border-radius:5px;border:1px solid var(--b2);background:var(--bg3);color:var(--t);font-size:.74rem;outline:none" placeholder="地图名称（如：岩石隧道内部）">
      <label style="font-size:.68rem;color:var(--t3);cursor:pointer">
        地图图片（上传后可在此视图标定）
        <input type="file" id="frlg-nsv-img" accept="image/*" style="display:block;margin-top:4px;font-size:.67rem;color:var(--t2)">
      </label>
      <div style="display:flex;gap:8px">
        <button id="frlg-nsv-ok" style="flex:1;padding:6px;border-radius:5px;border:none;background:var(--acc);color:#000;font-size:.74rem;font-weight:600;cursor:pointer">创建</button>
        <button id="frlg-nsv-no" style="padding:6px 12px;border-radius:5px;border:1px solid var(--b2);background:var(--bg3);color:var(--t2);font-size:.74rem;cursor:pointer">取消</button>
      </div>
    </div>`;
  viewer.appendChild(modal);
  const nameInp = modal.querySelector('#frlg-nsv-name');
  nameInp.focus();
  modal.querySelector('#frlg-nsv-no').onclick = () => modal.remove();
  modal.querySelector('#frlg-nsv-ok').onclick = async () => {
    const name = nameInp.value.trim();
    if (!name) { nameInp.focus(); return; }
    const fileInput = modal.querySelector('#frlg-nsv-img');
    let imgSrc = '';
    if (fileInput.files?.[0]) {
      imgSrc = await new Promise(res => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.readAsDataURL(fileInput.files[0]);
      });
    }
    const key = 'custom:' + Date.now();
    _frlgLoadCustomViews()[key] = { label: name, imgSrc, parent: frlgView };
    _frlgSaveCustomViews();
    modal.remove();
    if (onCreated) onCreated(key);
  };
}

function frlgShowSvgLabel(text, e) {
  if (!_frlgSvgLabel) {
    _frlgSvgLabel = document.createElement('div');
    _frlgSvgLabel.className = 'frlg-svg-label';
    document.body.appendChild(_frlgSvgLabel);
  }
  _frlgSvgLabel.textContent = text;
  _frlgSvgLabel.style.display = 'block';
  frlgMoveSvgLabel(e);
}

function frlgMoveSvgLabel(e) {
  if (!_frlgSvgLabel) return;
  _frlgSvgLabel.style.left = (e.clientX + 12) + 'px';
  _frlgSvgLabel.style.top = (e.clientY + 12) + 'px';
}

function frlgHideSvgLabel() {
  if (_frlgSvgLabel) _frlgSvgLabel.style.display = 'none';
}
