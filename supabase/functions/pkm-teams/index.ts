/**
 * Supabase Edge Function: pkm-teams
 * 服务端拉取 championsmeta.io/teams，解析队伍数据并返回，绕过 CORS 限制。
 * 部署方法：Supabase Dashboard → Edge Functions → New Function → 粘贴此代码
 *
 * 调用方式：
 *   GET /functions/v1/pkm-teams?format=doubles
 *   Authorization: Bearer <anon_key>
 *
 * 返回：{ teams: [...], updated: "2026-04-22", source: "championsmeta.io" }
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_DURATION_MS = 8 * 60 * 60 * 1000; // 8 小时
let _cache: { data: unknown; ts: number } | null = null;

const toSlug = (name: string): string => {
  if (!name) return '';
  let s = name.toLowerCase().trim()
    .replace(/[éèê]/g,'e').replace(/[àâ]/g,'a').replace(/[ùûü]/g,'u')
    .replace(/[ïî]/g,'i').replace(/[ôö]/g,'o')
    .replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
  // 形态重排
  const regionMap: Record<string, string> = {
    'hisuian-':'hisui-', 'alolan-':'alola-', 'galarian-':'galar-', 'paldean-':'paldea-',
  };
  for (const [k, v] of Object.entries(regionMap)) {
    if (s.startsWith(k)) { s = s.slice(k.length) + '-' + v.slice(0, -1); break; }
  }
  const rotomForms = ['heat','wash','frost','fan','mow'];
  for (const f of rotomForms) {
    if (s === f + '-rotom') { s = 'rotom-' + f; break; }
  }
  return s;
};

const parseTeams = (html: string) => {
  const teams: unknown[] = [];

  // 1. 尝试 __NEXT_DATA__
  const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (ndMatch) {
    try {
      const nd = JSON.parse(ndMatch[1]);
      const pp = nd?.props?.pageProps;
      const rawTeams = pp?.teams || pp?.data?.teams || pp?.teamList;
      if (Array.isArray(rawTeams) && rawTeams.length) {
        return rawTeams.map((t: Record<string, unknown>) => ({
          title: t.title || t.name || t.archetype || '',
          player: t.player || t.username || t.author || '',
          pokemon: ((t.pokemon || t.team || t.members || []) as unknown[]).map((p: unknown) =>
            toSlug(typeof p === 'string' ? p : ((p as Record<string,string>).name || (p as Record<string,string>).slug || ''))
          ).filter(Boolean).slice(0, 6),
          tournament: t.tournament || t.event || t.source || '',
          date: t.date || t.createdAt || '',
          record: t.record || t.score || '',
          placement: t.placement || t.rank || t.place || 0,
          votes: t.votes || t.likes || 0,
          type: t.type || (t.tournament ? 'tournament' : 'community'),
          url: t.url || t.sourceUrl || t.pasteUrl || '',
        })).filter((t: {pokemon: unknown[]}) => t.pokemon.length >= 3);
      }
    } catch (_) { /* ignore */ }
  }

  // 2. 扫描 JSON-LD 或内联 JSON
  const jsonBlocks = html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g);
  for (const m of jsonBlocks) {
    try {
      const j = JSON.parse(m[1]);
      const arr = Array.isArray(j) ? j : j?.teams || j?.data;
      if (Array.isArray(arr) && arr.length && arr[0]?.pokemon) {
        return arr.map((t: Record<string, unknown>) => ({
          title: t.title || '',
          player: t.player || t.username || '',
          pokemon: ((t.pokemon || []) as unknown[]).map((p: unknown) =>
            toSlug(typeof p === 'string' ? p : (p as Record<string,string>).name || '')
          ).filter(Boolean).slice(0, 6),
          tournament: t.tournament || '',
          date: t.date || '',
          record: t.record || '',
          placement: Number(t.placement) || 0,
          votes: Number(t.votes) || 0,
          type: t.type || 'community',
          url: t.url || '',
        })).filter((t: {pokemon: unknown[]}) => t.pokemon.length >= 3);
      }
    } catch (_) { /* ignore */ }
  }

  // 3. 正则扫描 alt 属性（备用）
  const teamPattern = /(?:pokemon|sprite)[^>]+alt="([^"]+)"/gi;
  const allAlts: string[] = [];
  let m;
  while ((m = teamPattern.exec(html)) !== null) {
    const slug = toSlug(m[1]);
    if (slug.length > 1) allAlts.push(slug);
  }
  // 每 6 只分一组
  for (let i = 0; i + 3 <= allAlts.length; i += 6) {
    teams.push({ title: '', player: '', pokemon: allAlts.slice(i, i + 6), tournament: '', date: '', record: '', placement: 0, votes: 0, type: 'tournament', url: '' });
  }

  return teams;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'doubles';

    // 使用内存缓存
    const now = Date.now();
    if (_cache && (now - _cache.ts) < CACHE_DURATION_MS) {
      return new Response(JSON.stringify(_cache.data), {
        headers: { ...CORS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    const pagesMap: Record<string, string> = {
      doubles: 'https://championsmeta.io/teams',
      singles: 'https://championsmeta.io/teams',
    };
    const pageUrl = pagesMap[format] || pagesMap['doubles'];

    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PkmJournal/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const teams = parseTeams(html);

    if (!teams.length) throw new Error('parse_empty');

    const updated = new Date().toISOString().slice(0, 10);
    const data = { teams, updated, source: 'championsmeta.io', format };
    _cache = { data, ts: now };

    return new Response(JSON.stringify(data), {
      headers: { ...CORS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (e) {
    const msg = (e as Error).message;
    return new Response(JSON.stringify({ error: msg, teams: [], updated: '', source: '' }), {
      status: msg === 'parse_empty' ? 204 : 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
