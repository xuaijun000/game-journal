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

let frlgView = 'kanto';
let _frlgActiveMethodFilters = new Set();
let _frlgCurrentEncounters = [];
let _frlgCurrentLocationKey = '';
const _frlgPkmCache = {};
let _frlgCalibMode = false;
const _frlgCalibOverrides = {};
let _frlgDragging = false;

function initFRLGMapTab(seriesId) {
  const btn = document.getElementById('stab-btn-frlgmap');
  if (btn) btn.style.display = seriesId === 'firered-leafgreen' ? '' : 'none';
  frlgSetupPanel();
  if (seriesId !== 'firered-leafgreen') {
    const panel = document.getElementById('frlg-enc-panel');
    if (panel) panel.classList.remove('visible');
  }
}

function frlgInitView(view) {
  frlgView = view || 'kanto';
  _frlgActiveMethodFilters.clear();
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
  frlgRenderHotspots(viewer, hotspots);
  if (frlgView === 'kanto') frlgRenderRegions(viewer, KANTO_REGIONS);
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
    el.style.border = '2px dashed rgba(255, 99, 71, 0.9)';
    el.style.boxSizing = 'border-box';
    el.style.borderRadius = '8px';
    el.style.zIndex = '2';
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
  const panel = document.getElementById('frlg-enc-panel');
  const title = document.getElementById('frlg-enc-title');
  const methodsWrap = document.getElementById('frlg-enc-methods');
  const grid = document.getElementById('frlg-enc-grid');
  if (!panel || !title || !methodsWrap || !grid) return;

  panel.classList.add('visible');
  _frlgCurrentLocationKey = locationKey;
  _frlgActiveMethodFilters.clear();

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
  methodsWrap.innerHTML = methods.map(method => {
    const meta = FRLG_METHOD_META[method] || { label: method, icon: '•' };
    const cls = _frlgActiveMethodFilters.has(method) ? ' on' : '';
    return `<button class="frlg-method-badge${cls}" onclick="frlgToggleMethodFilter('${method}')">${meta.label}</button>`;
  }).join('');
}

function frlgToggleMethodFilter(method) {
  if (_frlgActiveMethodFilters.has(method)) _frlgActiveMethodFilters.delete(method);
  else _frlgActiveMethodFilters.add(method);
  frlgRenderMethodFilters();
  frlgRenderEncounterGrid();
}

function frlgRenderEncounterGrid() {
  const grid = document.getElementById('frlg-enc-grid');
  if (!grid) return;

  const active = [..._frlgActiveMethodFilters];
  const items = _frlgCurrentEncounters.filter(item =>
    !active.length || active.some(method => (item.methods || []).includes(method))
  );

  if (!items.length) {
    grid.innerHTML = '<div class="frlg-empty-note">当前筛选下没有符合的精灵</div>';
    return;
  }

  grid.innerHTML = items.map((item, idx) => {
    const icons = (item.methods || []).map(m => FRLG_METHOD_META[m]?.icon || '•').join(' ');
    const name = frlgGetPkmName(null, item.slug);
    const lv = item.minLv === item.maxLv ? `Lv.${item.minLv}` : `Lv.${item.minLv}-${item.maxLv}`;
    const rateCls = item.rate >= 20 ? 'rate-hi' : item.rate >= 10 ? 'rate-md' : 'rate-lo';
    return `<div class="frlg-enc-card" id="frlg-enc-card-${idx}" style="animation-delay:${idx * 40}ms">
      <div class="frlg-enc-sprite"><div class="frlg-enc-placeholder"></div></div>
      <div class="frlg-enc-method-icons">${icons}</div>
      <div class="frlg-enc-name">${frlgEsc(name)}</div>
      <div class="frlg-enc-lv">${frlgEsc(lv)}</div>
      <div class="frlg-enc-rate ${rateCls}">${item.rate || 0}%</div>
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
    closeBtn.onclick = () => panel.classList.remove('visible');
  }
}

function frlgRenderCalibButton() {
  const breadcrumb = document.getElementById('frlg-breadcrumb');
  if (!breadcrumb) return;
  breadcrumb.querySelectorAll('.frlg-calib-btn,.frlg-export-btn').forEach(node => node.remove());
  const btn = document.createElement('button');
  btn.className = 'frlg-calib-btn' + (_frlgCalibMode ? ' on' : '');
  btn.textContent = _frlgCalibMode ? '校准模式开' : '校准模式关';
  btn.onclick = () => {
    _frlgCalibMode = !_frlgCalibMode;
    frlgRenderCalibButton();
    frlgApplyCalibrationMode();
  };
  breadcrumb.appendChild(btn);
  if (_frlgCalibMode) {
    const exportBtn = document.createElement('button');
    exportBtn.className = 'frlg-export-btn';
    exportBtn.textContent = '导出坐标';
    exportBtn.onclick = () => frlgExportCurrentHotspots();
    breadcrumb.appendChild(exportBtn);
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
