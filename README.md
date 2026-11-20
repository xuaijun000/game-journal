# PIXELFISH

PIXELFISH 面向宝可梦玩家，主入口为图鉴、队伍、对战和冒险。游戏库、动漫、漫画和统计保留在“更多”；`pokemon-trainer-terminal/` 为独立的离线工作台，数据保存在当前浏览器。

## 冒险记录（2026-11-20）

- 抓捕确认自动建立独立个体档案，可直接加入队伍、训练和编辑；等级、特性、球种、招式保存在个体档案中。
- 训练支持当前 EV 修正、目标、剩余数量、批量计数、撤销、结算预览、历史和未保存草稿恢复。旧的物种 EV 只迁移给第一只旧个体，避免复制给同种的其他个体。
- 火红/叶绿提供默认地图选点与全部地点搜索，按版本、遭遇方式筛选。133 种精灵的种族值和 EV 产出来自 PokeAPI 静态快照；图片仍使用远程资源。更新命令：`node --use-env-proxy scripts/snapshot-frlg-data.mjs`。
- 新功能复用 `pkm_series_log` 的 JSON 字段和 `pkm_catch_log`，无需执行新数据库迁移。`training_evs` 中 `_individuals`、`_goals`、`_legacyClaims`、`_sessions` 为元数据，其余键是个体 EV；数字键作为旧数据保留。
- 先保存本机，再同步云端；失败保留待同步快照并显示重试入口。地点的手工标定仍保留在本机，普通玩家界面使用内置地点。
- `npm.cmd test` 包括冒险回归测试和此前的重启修复测试。部署后以页面 `app-build=2026-11-20-adventure-v1` 和脚本校验值确认版本。

## 本地运行

这是一个静态前端项目。建议在仓库根目录运行 `npm.cmd run dev`，打开输出的本地地址。请用 HTTP 服务访问，直接双击文件会使 JSON 数据加载受到浏览器限制。PowerShell 如阻止 npm.ps1，请使用 npm.cmd。

推荐上线方式：

- GitHub Pages、Cloudflare Pages、Vercel Static、Netlify Static 都可以。
- 运行 `npm.cmd test` 验证，再运行 `npm.cmd run build:web`，发布 `web-dist/`；入口文件是 `index.html`。
- `web-dist/` 与 Electron 的 `dist/` 是不同产物，不发布 node_modules、PSD 或桌面安装包。
- 已固定 Supabase/Chart.js 前端资源及 SHA-256；通过 `npm.cmd run vendor` 可按锁定清单重新获取。
- 发布时可设置 `SITE_URL` 为实际 HTTPS 站点地址，构建脚本会生成 canonical 和绝对分享图片地址。

## Supabase 设置

1. 新建 Supabase 项目。
2. 打开 SQL Editor。
3. 先运行 [scripts/supabase-schema.sql](scripts/supabase-schema.sql)，再运行 [scripts/supabase-community-schema.sql](scripts/supabase-community-schema.sql)。已有项目先从 Supabase 备份数据库，在测试项目验证后再应用。仅运行主 schema 不会安装点赞 RPC 和公开排行榜接口。
4. 确认 Authentication 已启用邮箱登录，Site URL 和 Redirect URLs 包含实际正式域名及本地调试地址；验证注册确认邮件及 `index.html?recovery=1#auth` 密码重置回调。
5. 确认 Storage 中存在 `game-screenshots` bucket。新建时使用公开截图链接；现有桶的公开设置不会被主 SQL 重置。前端与隐私页已告知图片链接的公开范围。
6. 在 [js/config.js](js/config.js) 中配置 Supabase URL 和 anon key。

RLS 已按 `user_id = auth.uid()` 配好。公开给外部用户前，不要关闭 RLS。

## 可选 Edge Functions

以下功能依赖代理或 AI 函数：

- IGDB 发现页：`IGDB_PROXY`
- Steam 同步：`STEAM_PROXY`
- Gemini/AI 对话与总结：`GEMINI_PROXY`
- 动漫/漫画动态代理：`DYNAMIC_WORKER`

这些地址在 [js/config.js](js/config.js) 中配置。没有部署时，核心游戏库、统计、手动记录和本地备份仍然可用。

## 数据备份

账号页现在有“数据保险箱”：

- `导出全部数据`：登录时导出 Supabase 个人数据，未登录时导出本地数据。
- `导入 JSON`：把 PIXELFISH 备份追加到当前账号或本地数据。

截图备份保留公开 URL，不会下载原始图片文件。要完整保留截图，请继续保留 Supabase Storage 中的对象。

## 公开前检查

- 跑完完整 schema，确认所有表和 `game-screenshots` bucket 存在。
- 用新账号注册、添加游戏、上传截图、保存筛选视图、导出再导入一次。
- 检查 `js/config.js` 中没有 service role key，只能放 anon key。
- 给代理函数加来源限制、频率限制和服务端 API key。
- 准备隐私说明：用户会保存游戏记录、截图、AI 总结和宝可梦记录。
