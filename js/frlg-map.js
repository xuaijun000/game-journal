const FRLG_IMG = {
  kanto : 'css/firered-and-leafgreen-versions-map/火红叶绿全局地图.png',
  sevii : 'css/firered-and-leafgreen-versions-map/七岛缩略图.png',
  island: n => `css/firered-and-leafgreen-versions-map/第${['一','二','三','四','五','六','七'][n-1]}岛.webp`,
};

const KANTO_HOTSPOTS = [
  { label:'1号道路', x:51, y:79, key:'route-1' },
  { label:'2号道路', x:45, y:70, key:'route-2' },
  { label:'常盘森林', x:44, y:63, key:'viridian-forest' },
  { label:'3号道路', x:33, y:55, key:'route-3' },
  { label:'月亮山', x:28, y:50, key:'mt-moon' },
  { label:'4号道路', x:32, y:44, key:'route-4' },
  { label:'24号道路', x:46, y:38, key:'route-24' },
  { label:'25号道路', x:54, y:35, key:'route-25' },
  { label:'5号道路', x:52, y:52, key:'route-5' },
  { label:'6号道路', x:52, y:60, key:'route-6' },
  { label:'7号道路', x:60, y:53, key:'route-7' },
  { label:'8号道路', x:60, y:48, key:'route-8' },
  { label:'9号道路', x:67, y:45, key:'route-9' },
  { label:'10号道路', x:71, y:48, key:'route-10' },
  { label:'岩石隧道', x:72, y:51, key:'rock-tunnel' },
  { label:'发电站', x:75, y:42, key:'power-plant' },
  { label:'11号道路', x:76, y:55, key:'route-11' },
  { label:'12号道路', x:79, y:62, key:'route-12' },
  { label:'13号道路', x:73, y:72, key:'route-13' },
  { label:'14号道路', x:67, y:75, key:'route-14' },
  { label:'15号道路', x:59, y:73, key:'route-15' },
  { label:'16号道路', x:46, y:67, key:'route-16' },
  { label:'17号道路', x:42, y:74, key:'route-17' },
  { label:'18号道路', x:37, y:76, key:'route-18' },
  { label:'19号道路', x:46, y:85, key:'route-19' },
  { label:'20号道路', x:38, y:87, key:'route-20' },
  { label:'21号道路', x:50, y:90, key:'route-21' },
  { label:'22号道路', x:41, y:72, key:'route-22' },
  { label:'23号道路', x:37, y:67, key:'route-23' },
  { label:'狩猎地带', x:36, y:74, key:'kanto-safari-zone' },
  { label:'水流岛', x:36, y:85, key:'seafoam-islands' },
  { label:'宝可梦洋馆', x:42, y:90, key:'kanto-pokemon-mansion' },
  { label:'胜利道路', x:35, y:68, key:'victory-road-kanto' },
  { label:'无名小径', x:48, y:42, key:'cerulean-cave' },
  { label:'宝可梦之塔', x:70, y:57, key:'pokemon-tower' },
  { label:'🏝 七岛', x:80, y:88, key:null, action:'sevii', highlight:true },
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
  frlgResetCalibrationSurface();
}

function frlgRenderHotspots(viewer, hotspots) {
  hotspots.forEach(hotspot => {
    const el = document.createElement('div');
    el.className = 'frlg-hotspot' + (hotspot.highlight ? ' highlight' : '');
    el.dataset.key = hotspot.key || hotspot.action || hotspot.label;
    el.style.left = hotspot.x + '%';
    el.style.top = hotspot.y + '%';
    el.innerHTML = `<div class="frlg-hotspot-dot"></div><div class="frlg-hotspot-label">${frlgEsc(hotspot.label)}</div>`;
    el.onclick = () => {
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
  const btn = document.createElement('button');
  btn.className = 'frlg-calib-btn' + (_frlgCalibMode ? ' on' : '');
  btn.textContent = _frlgCalibMode ? '校准模式开' : '校准模式关';
  btn.onclick = () => {
    _frlgCalibMode = !_frlgCalibMode;
    frlgRenderCalibButton();
    frlgApplyCalibrationMode();
  };
  breadcrumb.appendChild(btn);
}

function frlgApplyCalibrationMode() {
  const viewer = document.getElementById('frlg-map-viewer');
  if (!viewer) return;
  viewer.classList.toggle('calib-mode', _frlgCalibMode);
  if (_frlgCalibMode) {
    frlgBindCalibEvents();
  } else {
    frlgResetCalibrationSurface();
  }
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
