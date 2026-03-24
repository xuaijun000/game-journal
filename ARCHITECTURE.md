# 游戏旅途 · 项目架构说明

## 重构目标

将原 4071 行单文件 `index.html` 拆分为模块化多文件结构，实现：

1. **易于调试**：每个模块独立，报错可快速定位
2. **快速交接**：新开 Claude 窗口时只需发送相关模块文件 + 本文档
3. **减少 Token**：只发修改涉及的文件，不用整个 4000 行

## 文件结构

```
game-journal/
├── index.html              # 入口：加载所有 CSS/JS，包含 HTML 骨架
├── ARCHITECTURE.md          # 本文档（架构说明 + 交接指南）
├── css/
│   ├── base.css            # CSS 变量、reset、全局排版、header/nav
│   ├── cards.css           # 游戏卡片、媒体卡片、rank 列表样式
│   ├── modals.css          # 所有弹窗/overlay 样式（详情、编辑、发现）
│   ├── pokemon.css         # 宝可梦专栏全部样式
│   ├── media.css           # 动漫/漫画页面样式
│   ├── timeline.css        # 时间轴（游戏+媒体）样式
│   ├── play.css            # 沉浸式游玩模式全部样式
│   └── misc.css            # 游戏时刻面板、toast、快照历史、moment 面板
├── js/
│   ├── config.js           # 常量、映射表、Supabase 初始化 (≈60行)
│   ├── auth.js             # 登录/注册/用户状态 (≈50行)
│   ├── games.js            # 游戏 CRUD、搜索、渲染、Steam 同步 (≈250行)
│   ├── discover.js         # 发现页榜单 + AI 聊天 (≈200行)
│   ├── detail.js           # 游戏详情弹窗 + AI 情报员聊天 (≈250行)
│   ├── charts.js           # 统计图表 (≈50行)
│   ├── timeline.js         # 时间轴生成/渲染（游戏+媒体）(≈350行)
│   ├── pokemon.js          # 宝可梦专栏完整逻辑 (≈500行)
│   ├── media.js            # 动漫/漫画 CRUD + 排行 + AI (≈300行)
│   ├── moments.js          # 游戏时刻记录 (≈130行)
│   ├── play.js             # 沉浸式游玩模式 (≈500行)
│   └── utils.js            # 工具函数：esc、showToast 等 (≈20行)
└── html/                   # （可选）如果用 template 方式加载弹窗 HTML
```

## Supabase Edge Functions（独立部署）

| 函数名 | 文件 | 职责 |
|--------|------|------|
| `dynamic-worker` | 已部署 | IGDB 搜索/截图、AniList、硅基流动文生图 |
| `gemini-proxy` | 已部署 | AI 聊天代理（DeepSeek 文字 + AIGC 图片） |
| `steam-proxy` | 已部署 | Steam 游戏库同步 |

## Supabase 表（11 张）

games / game_timelines / media_timelines / chat_summaries / game_moments /
pkm_collection / pkm_logs / pkm_series_log / play_sessions / play_logs / play_snapshots

## 模块依赖关系

```
config.js ← 所有模块都依赖
utils.js  ← 所有模块都依赖
auth.js   ← games.js, media.js, play.js 等需要获取用户
games.js  ← detail.js 需要 games 数组
timeline.js ← detail.js, play.js, media.js 调用渲染
```

## 与 Claude 交接指南

### 小改动（修 Bug、调样式）
发送：`ARCHITECTURE.md` + 涉及的 1-2 个文件

### 中等改动（新功能模块）
发送：`ARCHITECTURE.md` + `config.js` + 涉及的 2-3 个文件

### 大改动（跨模块重构）
发送：`ARCHITECTURE.md` + `index.html` + 所有涉及模块

### 提示词模板
```
我正在开发「游戏旅途」项目，架构见 ARCHITECTURE.md。
本次需要修改 [模块名]，具体需求是：[描述]
附件：ARCHITECTURE.md + [相关文件]
请直接输出修改后的完整文件。
```

## GitHub Pages 部署

所有文件直接放在仓库根目录，GitHub Pages 访问 index.html 自动加载所有 CSS/JS。
无需构建工具。
