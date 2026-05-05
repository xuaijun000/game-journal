/* ════════════════════════════════════════════════
   COMMUNITY.JS — 宝可梦社区（阵容 · 捕捉 · 通关）
   ════════════════════════════════════════════════ */

let communityProfile = null;
let commFeed = [];
let commFeedOffset = 0;
const COMM_PAGE_SIZE = 10;
let commFeedCategory = 'all'; // 'all' | 'team' | 'catch' | 'series'
let commFeedHasMore = false;
let commCurrentCommentTeamId = null;
let commLikedSet = new Set();

/* ──────── 路由钩子 ──────── */
async function onEnterCommunity() {
  await loadUserProfile();
  updateCommProfileBtn();
  await loadLikedSet();
  commFeed = [];
  commFeedOffset = 0;
  commFeedCategory = 'all';
  document.querySelectorAll('.comm-cat-btn').forEach(b => b.classList.toggle('on', b.dataset.cat === 'all'));
  await loadCommunityFeed(true);
}

/* ──────── 个人资料 ──────── */
async function loadUserProfile() {
  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.user) { communityProfile = null; return; }
    const { data } = await db.from('profiles').select('*').eq('id', session.user.id).single();
    communityProfile = data || null;
    if (communityProfile?.username) {
      const av = document.getElementById('av');
      if (av) av.textContent = communityProfile.username.slice(0, 2).toUpperCase();
    }
  } catch(e) { communityProfile = null; }
}

function updateCommProfileBtn() {
  const btn = document.getElementById('comm-profile-btn');
  if (!btn) return;
  btn.textContent = communityProfile?.username ? `@${communityProfile.username}` : '设置主页';
}

async function openProfileModal() {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) { showToast('请先登录', 'warn'); go('auth', null); return; }
  await loadUserProfile();
  const p = communityProfile;
  document.getElementById('prof-username-inp').value = p?.username || '';
  document.getElementById('prof-bio-inp').value = p?.bio || '';
  const current = p?.avatar || '🎮';
  document.querySelectorAll('.prof-avatar-opt').forEach(el => {
    el.classList.toggle('on', el.dataset.av === current);
  });
  document.getElementById('ov-profile').classList.add('on');
}

function closeProfileModal() {
  document.getElementById('ov-profile').classList.remove('on');
}

async function saveProfile() {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) return;
  const username = document.getElementById('prof-username-inp').value.trim();
  const bio = document.getElementById('prof-bio-inp').value.trim();
  const avatar = document.querySelector('.prof-avatar-opt.on')?.dataset.av || '🎮';
  if (!username) { showToast('请输入用户名', 'warn'); return; }
  if (!/^[一-龥a-zA-Z0-9_]{2,16}$/.test(username)) {
    showToast('用户名 2-16 字符，支持中英文、数字、下划线', 'warn'); return;
  }
  const btn = document.getElementById('prof-save-btn');
  btn.disabled = true; btn.textContent = '保存中…';
  const { error } = await db.from('profiles').upsert(
    { id: session.user.id, username, avatar, bio },
    { onConflict: 'id' }
  );
  btn.disabled = false; btn.textContent = '保存';
  if (error) {
    if (error.code === '23505') showToast('用户名已被占用，请换一个', 'warn');
    else showToast('保存失败：' + error.message, 'danger');
    return;
  }
  communityProfile = { id: session.user.id, username, avatar, bio };
  updateCommProfileBtn();
  const av = document.getElementById('av');
  if (av) av.textContent = username.slice(0, 2).toUpperCase();
  closeProfileModal();
  showToast('个人资料已保存 ✓', 'ok');
}

/* ──────── 前置检查：需要登录且有用户名 ──────── */
async function _requireProfile() {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) { showToast('请先登录', 'warn'); go('auth', null); return false; }
  if (!communityProfile?.username) {
    showToast('分享前请先设置用户名', 'warn');
    await openProfileModal();
    return false;
  }
  return true;
}

/* ──────── 点赞集合（battle_teams） ──────── */
async function loadLikedSet() {
  commLikedSet = new Set();
  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.user) return;
    const { data } = await db.from('team_likes').select('team_id').eq('user_id', session.user.id);
    (data || []).forEach(r => commLikedSet.add(r.team_id));
  } catch(e) {}
}

/* ──────── 社区动态数据获取 ──────── */
async function fetchPublicTeams(limit, offset) {
  const { data } = await db.from('battle_teams')
    .select('id,team_name,pokemon,format,author_username,author_avatar,likes_count,created_at')
    .eq('is_public', true)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return data || [];
}

async function fetchPublicCatches(limit, offset) {
  const { data } = await db.from('pkm_catch_log')
    .select('id,pkm_name,img,nature,nickname,catch_location,series_id,author_username,author_avatar,likes_count,created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return data || [];
}

async function fetchPublicSeries(limit, offset) {
  const { data } = await db.from('pkm_series_log')
    .select('id,series_id,series_name,status,play_hours,ace_pokemon,party,author_username,author_avatar,likes_count,created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return data || [];
}

/* ──────── 社区动态加载 ──────── */
async function loadCommunityFeed(reset = false) {
  if (reset) { commFeed = []; commFeedOffset = 0; }
  const feedEl = document.getElementById('comm-feed');
  const emptyEl = document.getElementById('comm-feed-empty');
  const moreEl = document.getElementById('comm-load-more-wrap');
  if (commFeedOffset === 0 && feedEl) feedEl.innerHTML = '<div class="comm-loading">加载中…</div>';

  let items = [];

  if (commFeedCategory === 'all') {
    const [teams, catches, series] = await Promise.all([
      fetchPublicTeams(8, 0),
      fetchPublicCatches(8, 0),
      fetchPublicSeries(8, 0)
    ]);
    items = [
      ...teams.map(t => ({ ...t, _type: 'team' })),
      ...catches.map(c => ({ ...c, _type: 'catch' })),
      ...series.map(s => ({ ...s, _type: 'series' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    commFeedHasMore = false;
  } else {
    const fetchers = { team: fetchPublicTeams, catch: fetchPublicCatches, series: fetchPublicSeries };
    const raw = await fetchers[commFeedCategory](COMM_PAGE_SIZE, commFeedOffset);
    items = raw.map(r => ({ ...r, _type: commFeedCategory }));
    commFeedHasMore = raw.length === COMM_PAGE_SIZE;
    commFeedOffset += raw.length;
  }

  commFeed = reset ? items : [...commFeed, ...items];
  renderCommFeed(items, !reset);
  if (emptyEl) emptyEl.style.display = (!commFeed.length) ? 'block' : 'none';
  if (moreEl) moreEl.style.display = commFeedHasMore ? 'block' : 'none';
}

function setCommCategory(cat, btn) {
  commFeedCategory = cat;
  document.querySelectorAll('.comm-cat-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  loadCommunityFeed(true);
}

/* ──────── 渲染 ──────── */
function renderCommFeed(items, append) {
  const el = document.getElementById('comm-feed');
  if (!el) return;
  if (!append) el.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'comm-card';
    if (item._type === 'team') card.innerHTML = renderTeamCard(item);
    else if (item._type === 'catch') card.innerHTML = renderCatchCard(item);
    else if (item._type === 'series') card.innerHTML = renderSeriesCard(item);
    el.appendChild(card);
  });
}

function _cardHead(item, typeBadge, typeCls) {
  const author = esc(item.author_username || '匿名训练师');
  const avatar = esc(item.author_avatar || '🎮');
  return `<div class="cc-head">
    <div class="cc-author">
      <span class="cc-avatar">${avatar}</span>
      <span class="cc-uname">@${author}</span>
    </div>
    <span class="cc-type-badge ${typeCls}">${typeBadge}</span>
    <span class="cc-time">${formatTimeAgo(item.created_at)}</span>
  </div>`;
}

function renderTeamCard(t) {
  const pkm = Array.isArray(t.pokemon) ? t.pokemon : [];
  const sprites = Array.from({ length: 6 }, (_, i) => {
    const p = pkm[i];
    if (!p?.name) return `<div class="cc-slot cc-slot-empty">·</div>`;
    const img = p._spriteUrl
      ? `<img src="${esc(p._spriteUrl)}" alt="${esc(p.name)}" onerror="this.style.display='none'">`
      : `<div class="cc-slot-name">${esc(p.name.slice(0, 4))}</div>`;
    return `<div class="cc-slot" title="${esc(p.name)}">${img}</div>`;
  }).join('');
  const fmt = t.format === 'doubles' ? '双打' : '单打';
  const fmtSub = `<span class="cc-fmt-sub ${t.format === 'doubles' ? 'cc-fmt-doubles' : 'cc-fmt-singles'}">${fmt}</span>`;
  const liked = commLikedSet.has(t.id);
  return `
    ${_cardHead(t, '阵容', 'cc-badge-team')}
    <div class="cc-name">${esc(t.team_name || '我的队伍')} ${fmtSub}</div>
    <div class="cc-sprites">${sprites}</div>
    <div class="cc-actions">
      <button class="cc-btn cc-like${liked ? ' liked' : ''}" onclick="likeTeam('${t.id}',this)">
        ${liked ? '♥' : '♡'}&nbsp;<span class="cc-like-count">${t.likes_count || 0}</span>
      </button>
      <button class="cc-btn" onclick="openTeamComments('${t.id}','${esc(t.team_name||'队伍')}')">💬&nbsp;评论</button>
      <button class="cc-btn cc-import" onclick="importTeamFromCommunity('${t.id}')">↓&nbsp;借用</button>
    </div>`;
}

function renderCatchCard(c) {
  const natMap = { lonely:'孤僻',brave:'勇敢',adamant:'固执',naughty:'顽皮',bold:'大胆',relaxed:'悠闲',impish:'淘气',lax:'马虎',timid:'胆小',hasty:'急躁',jolly:'爽朗',naive:'天真',modest:'内敛',mild:'温和',quiet:'冷静',rash:'粗心',calm:'沉着',gentle:'温顺',sassy:'自大',careful:'慎重',quirky:'浮躁',hardy:'勤奋',docile:'坦直',serious:'认真',bashful:'害羞' };
  const natZh = (c.nature && natMap[c.nature.toLowerCase()]) ? natMap[c.nature.toLowerCase()] + '性格' : (c.nature || '');
  const locStr = c.catch_location ? `📍 ${esc(c.catch_location)}` : '';
  const nickStr = c.nickname ? `<span class="cc-catch-nick">「${esc(c.nickname)}」</span>` : '';
  const imgHtml = c.img
    ? `<img class="cc-catch-img" src="${esc(c.img)}" alt="${esc(c.pkm_name)}" onerror="this.style.display='none'">`
    : `<div class="cc-catch-img cc-catch-img-placeholder">?</div>`;
  return `
    ${_cardHead(c, '捕捉', 'cc-badge-catch')}
    <div class="cc-catch-body">
      ${imgHtml}
      <div class="cc-catch-info">
        <div class="cc-name cc-catch-name">${esc(c.pkm_name)} ${nickStr}</div>
        ${natZh ? `<div class="cc-catch-meta">${natZh}</div>` : ''}
        ${locStr ? `<div class="cc-catch-meta">${locStr}</div>` : ''}
      </div>
    </div>
    <div class="cc-actions">
      <button class="cc-btn cc-like" onclick="likeCatchOrSeries('pkm_catch_log','${c.id}',this)">
        ♡&nbsp;<span class="cc-like-count">${c.likes_count || 0}</span>
      </button>
    </div>`;
}

function renderSeriesCard(s) {
  const statusMap = { cleared: '通关 ✓', played: '游玩中', none: '计划中' };
  const statusCls = { cleared: 'cc-series-cleared', played: 'cc-series-played', none: '' };
  const status = statusMap[s.status] || s.status;
  const pkm = Array.isArray(s.party) ? s.party.slice(0, 6) : [];
  const partySprites = pkm.length ? `<div class="cc-series-party">${pkm.map(p => {
    const img = p._spriteUrl || p.img || p.spriteUrl;
    return img
      ? `<img class="cc-series-pkm" src="${esc(img)}" alt="${esc(p.name||'')}" onerror="this.style.display='none'">`
      : `<span class="cc-series-pkm-name">${esc((p.name||'').slice(0,3))}</span>`;
  }).join('')}</div>` : '';
  return `
    ${_cardHead(s, '通关', 'cc-badge-series')}
    <div class="cc-series-head">
      <span class="cc-name">${esc(s.series_name || s.series_id || '未知系列')}</span>
      <span class="cc-series-status ${statusCls[s.status] || ''}">${status}</span>
    </div>
    <div class="cc-series-stats">
      ${s.play_hours ? `<span class="cc-series-stat">⏱ ${s.play_hours}h</span>` : ''}
      ${s.ace_pokemon ? `<span class="cc-series-stat">🏆 ${esc(s.ace_pokemon)}</span>` : ''}
    </div>
    ${partySprites}
    <div class="cc-actions">
      <button class="cc-btn cc-like" onclick="likeCatchOrSeries('pkm_series_log','${s.id}',this)">
        ♡&nbsp;<span class="cc-like-count">${s.likes_count || 0}</span>
      </button>
    </div>`;
}

function formatTimeAgo(dateStr) {
  const d = new Date(dateStr), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + '天前';
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

/* ──────── 点赞 — 阵容 ──────── */
async function likeTeam(teamId, btn) {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) { showToast('请先登录后点赞', 'warn'); return; }
  const liked = commLikedSet.has(teamId);
  const countEl = btn?.querySelector('.cc-like-count');
  const current = parseInt(countEl?.textContent || '0');
  const next = liked ? Math.max(0, current - 1) : current + 1;
  if (liked) {
    commLikedSet.delete(teamId);
    if (btn) { btn.classList.remove('liked'); btn.innerHTML = `♡&nbsp;<span class="cc-like-count">${next}</span>`; }
    await db.from('team_likes').delete().eq('user_id', session.user.id).eq('team_id', teamId);
  } else {
    commLikedSet.add(teamId);
    if (btn) { btn.classList.add('liked'); btn.innerHTML = `♥&nbsp;<span class="cc-like-count">${next}</span>`; }
    await db.from('team_likes').insert({ user_id: session.user.id, team_id: teamId });
  }
  await db.from('battle_teams').update({ likes_count: next }).eq('id', teamId);
}

/* ──────── 点赞 — 捕捉 / 通关 ──────── */
async function likeCatchOrSeries(table, id, btn) {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) { showToast('请先登录后点赞', 'warn'); return; }
  const countEl = btn?.querySelector('.cc-like-count');
  const current = parseInt(countEl?.textContent || '0');
  const next = current + 1;
  if (btn) { btn.classList.add('liked'); btn.innerHTML = `♥&nbsp;<span class="cc-like-count">${next}</span>`; btn.disabled = true; }
  await db.from(table).update({ likes_count: next }).eq('id', id);
}

/* ──────── 评论 ──────── */
async function openTeamComments(teamId, teamName) {
  commCurrentCommentTeamId = teamId;
  const titleEl = document.getElementById('comm-comments-title');
  if (titleEl) titleEl.textContent = teamName;
  const inp = document.getElementById('comm-comment-inp');
  if (inp) inp.value = '';
  document.getElementById('ov-comments').classList.add('on');
  await loadComments(teamId);
}

function closeCommentsModal() {
  document.getElementById('ov-comments').classList.remove('on');
  commCurrentCommentTeamId = null;
}

async function loadComments(teamId) {
  const el = document.getElementById('comm-comments-list');
  if (!el) return;
  el.innerHTML = '<div class="comm-loading">加载评论…</div>';
  const { data, error } = await db.from('team_comments')
    .select('*').eq('team_id', teamId).order('created_at', { ascending: true });
  if (error || !data?.length) {
    el.innerHTML = '<div class="comm-empty">还没有评论，快来抢沙发！</div>';
    return;
  }
  el.innerHTML = data.map(c => `
    <div class="comm-comment">
      <div class="comm-comment-meta">
        <span class="comm-comment-author">@${esc(c.username)}</span>
        <span class="comm-comment-time">${formatTimeAgo(c.created_at)}</span>
      </div>
      <div class="comm-comment-text">${esc(c.content)}</div>
    </div>`).join('');
  el.scrollTop = el.scrollHeight;
}

async function submitComment() {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) { showToast('请先登录后评论', 'warn'); return; }
  if (!communityProfile?.username) {
    showToast('请先设置用户名', 'warn');
    closeCommentsModal();
    openProfileModal();
    return;
  }
  const inp = document.getElementById('comm-comment-inp');
  const content = inp?.value.trim();
  if (!content) return;
  if (content.length > 200) { showToast('评论不超过 200 字', 'warn'); return; }
  const { error } = await db.from('team_comments').insert({
    team_id: commCurrentCommentTeamId,
    user_id: session.user.id,
    username: communityProfile.username,
    content
  });
  if (error) { showToast('评论失败：' + error.message, 'danger'); return; }
  inp.value = '';
  await loadComments(commCurrentCommentTeamId);
}

/* ──────── 借用阵容 ──────── */
async function importTeamFromCommunity(teamId) {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) { showToast('请先登录后借用阵容', 'warn'); return; }
  const team = commFeed.find(t => t.id === teamId && t._type === 'team');
  if (!team) { showToast('队伍数据未找到', 'warn'); return; }
  const { data, error } = await db.from('battle_teams').insert({
    team_name: (team.team_name || '借用阵容') + ' (借用)',
    pokemon: team.pokemon,
    format: team.format || 'singles',
    user_id: session.user.id
  }).select().single();
  if (error) { showToast('借用失败：' + error.message, 'danger'); return; }
  if (window.battleTeams) battleTeams.unshift(data);
  if (window.renderTeamList) renderTeamList();
  if (window.renderDTeamList) renderDTeamList();
  showToast('阵容已添加到我的队伍 ✓', 'ok');
  const battleBtn = document.querySelector('nav button[onclick*="\'battle\'"]');
  go('battle', battleBtn);
}

/* ──────── 分享阵容 ──────── */
async function toggleShareTeam(teamId, format) {
  if (!await _requireProfile()) return;
  const team = (window.battleTeams || []).find(t => t.id === teamId);
  if (!team || team.id.startsWith('local_')) {
    showToast('请先保存队伍到云端再分享', 'warn'); return;
  }
  const newPublic = !team.is_public;
  const { error } = await db.from('battle_teams').update({
    is_public: newPublic,
    format: format || team.format || 'singles',
    author_username: communityProfile.username,
    author_avatar: communityProfile.avatar || '🎮'
  }).eq('id', teamId);
  if (error) { showToast('操作失败：' + error.message, 'danger'); return; }
  team.is_public = newPublic;
  team.format = format || team.format || 'singles';
  if (window.renderTeamList) renderTeamList();
  if (window.renderDTeamList) renderDTeamList();
  showToast(newPublic ? '已分享到社区 ✓' : '已取消分享', newPublic ? 'ok' : 'info');
}

/* ──────── 分享捕捉记录 ──────── */
async function toggleShareCatch(catchId, currentPublic) {
  if (!await _requireProfile()) return;
  const newPublic = !currentPublic;
  const { error } = await db.from('pkm_catch_log').update({
    is_public: newPublic,
    author_username: communityProfile.username,
    author_avatar: communityProfile.avatar || '🎮'
  }).eq('id', catchId);
  if (error) { showToast('操作失败：' + error.message, 'danger'); return; }
  // 更新按钮状态
  const btn = document.querySelector(`.catch-share-btn[data-id="${catchId}"]`);
  if (btn) {
    btn.dataset.public = newPublic ? '1' : '0';
    btn.classList.toggle('shared', newPublic);
    btn.textContent = newPublic ? '已分享' : '分享';
  }
  showToast(newPublic ? '已分享到社区 ✓' : '已取消分享', newPublic ? 'ok' : 'info');
}

/* ──────── 分享通关记录 ──────── */
async function toggleShareSeries() {
  if (!await _requireProfile()) return;
  const btn = document.getElementById('series-save-btn');
  if (!btn) return;
  const sid = btn.dataset.sid;
  if (!sid) { showToast('请先保存记录再分享', 'warn'); return; }

  // 读取当前 is_public 状态（从 data 属性）
  const shareBtn = document.getElementById('series-share-btn');
  const currentPublic = shareBtn?.dataset.public === '1';
  const newPublic = !currentPublic;

  const s = window.PKM_SERIES?.find(x => x.id === sid);
  const { error } = await db.from('pkm_series_log').update({
    is_public: newPublic,
    author_username: communityProfile.username,
    author_avatar: communityProfile.avatar || '🎮',
    series_name: s?.name || sid
  }).eq('user_id', (await db.auth.getSession()).data.session?.user?.id).eq('series_id', sid);

  if (error) { showToast('操作失败：' + error.message, 'danger'); return; }
  if (shareBtn) {
    shareBtn.dataset.public = newPublic ? '1' : '0';
    shareBtn.classList.toggle('shared', newPublic);
    shareBtn.textContent = newPublic ? '已分享' : '分享到社区';
  }
  showToast(newPublic ? '通关记录已分享到社区 ✓' : '已取消分享', newPublic ? 'ok' : 'info');
}
