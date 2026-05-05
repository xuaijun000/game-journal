/* ════════════════════════════════════════════════
   COMMUNITY.JS — 宝可梦对战社区
   ════════════════════════════════════════════════ */

let communityProfile = null;
let commFeed = [];
let commFeedOffset = 0;
const COMM_PAGE_SIZE = 12;
let commFeedFormat = 'all';
let commFeedHasMore = false;
let commCurrentCommentTeamId = null;
let commLikedSet = new Set();

/* ──────── 路由钩子（go 调用时触发） ──────── */
async function onEnterCommunity() {
  await loadUserProfile();
  updateCommProfileBtn();
  await loadLikedSet();
  commFeed = [];
  commFeedOffset = 0;
  commFeedFormat = 'all';
  document.querySelectorAll('.comm-fmt-btn').forEach(b => b.classList.toggle('on', b.dataset.fmt === 'all'));
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
  } catch(e) {
    communityProfile = null;
  }
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

/* ──────── 点赞集合 ──────── */
async function loadLikedSet() {
  commLikedSet = new Set();
  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.user) return;
    const { data } = await db.from('team_likes').select('team_id').eq('user_id', session.user.id);
    (data || []).forEach(r => commLikedSet.add(r.team_id));
  } catch(e) {}
}

/* ──────── 社区动态 ──────── */
async function loadCommunityFeed(reset = false) {
  if (reset) { commFeed = []; commFeedOffset = 0; }
  const feedEl = document.getElementById('comm-feed');
  const emptyEl = document.getElementById('comm-feed-empty');
  const moreEl = document.getElementById('comm-load-more-wrap');
  if (commFeedOffset === 0 && feedEl) feedEl.innerHTML = '<div class="comm-loading">加载中…</div>';

  let query = db.from('battle_teams')
    .select('*')
    .eq('is_public', true)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(commFeedOffset, commFeedOffset + COMM_PAGE_SIZE - 1);

  if (commFeedFormat !== 'all') query = query.eq('format', commFeedFormat);

  const { data, error } = await query;
  if (error) {
    if (feedEl) feedEl.innerHTML = '<div class="comm-empty">加载失败，请刷新重试</div>';
    return;
  }
  const teams = data || [];
  commFeedHasMore = teams.length === COMM_PAGE_SIZE;
  commFeedOffset += teams.length;
  commFeed = reset ? teams : [...commFeed, ...teams];

  renderCommFeed(teams, !reset);
  if (emptyEl) emptyEl.style.display = (!commFeed.length) ? 'block' : 'none';
  if (moreEl) moreEl.style.display = commFeedHasMore ? 'block' : 'none';
}

function renderCommFeed(teams, append) {
  const el = document.getElementById('comm-feed');
  if (!el) return;
  if (!append) el.innerHTML = '';
  teams.forEach(t => {
    const card = document.createElement('div');
    card.className = 'comm-card';
    card.innerHTML = renderCommCard(t);
    el.appendChild(card);
  });
}

function renderCommCard(t) {
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
  const fmtCls = t.format === 'doubles' ? 'cc-fmt-doubles' : 'cc-fmt-singles';
  const liked = commLikedSet.has(t.id);
  const author = esc(t.author_username || '匿名训练师');
  const avatar = esc(t.author_avatar || '🎮');

  return `
    <div class="cc-head">
      <div class="cc-author">
        <span class="cc-avatar">${avatar}</span>
        <span class="cc-uname">@${author}</span>
      </div>
      <span class="cc-fmt ${fmtCls}">${fmt}</span>
      <span class="cc-time">${formatTimeAgo(t.created_at)}</span>
    </div>
    <div class="cc-name">${esc(t.team_name || '我的队伍')}</div>
    <div class="cc-sprites">${sprites}</div>
    <div class="cc-actions">
      <button class="cc-btn cc-like${liked ? ' liked' : ''}"
        onclick="likeTeam('${t.id}',this)">
        ${liked ? '♥' : '♡'}&nbsp;<span class="cc-like-count">${t.likes_count || 0}</span>
      </button>
      <button class="cc-btn" onclick="openTeamComments('${t.id}','${esc(t.team_name||'队伍')}')">
        💬&nbsp;评论
      </button>
      <button class="cc-btn cc-import" onclick="importTeamFromCommunity('${t.id}')">
        ↓&nbsp;借用
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

function setCommFormat(fmt, btn) {
  commFeedFormat = fmt;
  document.querySelectorAll('.comm-fmt-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  loadCommunityFeed(true);
}

/* ──────── 点赞 ──────── */
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

  const team = commFeed.find(t => t.id === teamId);
  if (!team) { showToast('队伍数据未找到', 'warn'); return; }

  const newTeam = {
    team_name: (team.team_name || '借用阵容') + ' (借用)',
    pokemon: team.pokemon,
    format: team.format || 'singles',
    user_id: session.user.id
  };
  const { data, error } = await db.from('battle_teams').insert(newTeam).select().single();
  if (error) { showToast('借用失败：' + error.message, 'danger'); return; }

  if (window.battleTeams) battleTeams.unshift(data);
  if (window.renderTeamList) renderTeamList();
  if (window.renderDTeamList) renderDTeamList();

  showToast('阵容已添加到我的队伍 ✓', 'ok');
  const battleBtn = document.querySelector('nav button[onclick*="\'battle\'"]');
  go('battle', battleBtn);
}

/* ──────── 分享 / 取消分享 ──────── */
async function toggleShareTeam(teamId, format) {
  const { data: { session } } = await db.auth.getSession();
  if (!session?.user) { showToast('请先登录', 'warn'); return; }

  if (!communityProfile?.username) {
    showToast('分享前请先设置用户名', 'warn');
    await openProfileModal();
    return;
  }

  const team = (window.battleTeams || []).find(t => t.id === teamId);
  if (!team || team.id.startsWith('local_')) {
    showToast('请先保存队伍到云端再分享', 'warn');
    return;
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
