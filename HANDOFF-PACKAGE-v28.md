# 飞象 AI 教师端 v28 · 设计研发交接清单

> 用于把当前 demo 交给设计、前端、后端/算法继续推进。读完顺序建议：产品规格 → 设计系统 → 组件契约 → 本交接清单。

## 1. 交付物索引

| 文件 | 给谁看 | 用途 |
|---|---|---|
| `PRODUCT-SPEC-v28.md` | 产品 / 设计 / 研发 | 统一产品定位、路径、红线 |
| `DESIGN-SYSTEM-v28.md` | 设计 / 前端 | 统一组件状态、视觉 token、文案规则 |
| `COMPONENT-CONTRACT-v28.md` | 前端 / 后端 / 算法 | 统一组件边界、数据结构、事件契约 |
| `v28-shell.js` | 前端 | 公共壳低配实现，可迁移成生产组件 |
| `v28.css` | 设计 / 前端 | 视觉 token 和组件样式来源 |
| `02-personal-home.html` | 设计 / 前端 | 个人知识库场景 |
| `02-wiki-home.html` | 设计 / 前端 | 团队 Wiki 首页场景 |
| `03-wiki-entry.html` | 设计 / 前端 | Wiki 词条 / 文件夹 / 图谱入口场景 |
| `04-file-preview.html` | 设计 / 前端 | 文件预览 1:1 双栏场景 |

## 2. Demo 到生产组件映射

| Demo 结构 / class | 生产组件建议 | 说明 |
|---|---|---|
| `v28-shell.js` | `AppShell` | 统一渲染公共壳 |
| `.sidebar-left` | `Sidebar` | 左侧导航、账号入口 |
| `.sb-new-chat` / `.sb-chat-entry` | `ConversationNav` | 新对话、历史对话 |
| `.sb-kb` / `.sb-group-label` | `KnowledgeNav` | 我的知识库、团队知识库、AI 题库 |
| `.topbar` | `Topbar` | 当前 KB、视图切换、搜索、通知 |
| `.view-switcher` | `ViewSwitcher` | Wiki / 图谱 / 文件夹 |
| `.tb-search` / `.top-search-panel` | `GlobalSearch` | 顶栏短搜索 + 下拉搜索 |
| `.sb-account-menu` | `AccountMenu` | 个人信息、设置、账号与安全 |
| `.wiki-page` | `KnowledgeHome` / `WikiEntry` | 首页与词条共用基础排版 |
| `.folder-view` / `v28-folder.js` | `FolderView` | 文件夹纯列表，唯一公共实现 |
| `.file-preview-layout` | `FilePreview` | 左原文件、右 AI 解读 |
| `.chat-empty` / `.chat-page` | `ChatWorkspace` | 对话页面状态 |

## 3. 路由建议

| Demo URL | 生产路由建议 | 说明 |
|---|---|---|
| `02-personal-home.html` | `/kb/personal/:kbId/wiki` | 个人知识库 Wiki 首页 |
| `02-wiki-home.html` | `/kb/team/:kbId/wiki` | 团队知识库 Wiki 首页 |
| `03-wiki-entry.html?w=xxx` | `/kb/:kbId/wiki/:wikiId` | Wiki 词条 |
| `03-wiki-entry.html?view=folder` | `/kb/:kbId/files` 或 `/kb/:kbId/wiki/:wikiId/files` | 文件夹列表的 canonical demo 路由 |
| `04-file-preview.html` | `/kb/:kbId/files/:fileId` | 文件预览 |
| 图谱外链 | `/kb/:kbId/graph` | 未来产品内路由 |

## 4. 数据依赖清单

前端首屏需要：

- 当前用户：姓名、头像字、权限。
- 当前知识库：名称、类型、资料数、Wiki 数、更新时间。
- 左侧导航：个人库、团队空间列表、AI 题库权限。
- Wiki 首页：学段分组、知识点列表、AI 整理纪要。
- Wiki 词条：正文结构、来源文件、相关题目、相关对话。
- 文件夹视图：路径、子文件夹、文件列表、关联 Wiki。
- 文件预览：文件元信息、预览 URL、AI 摘要、右侧 AI 解读。
- 通知：未读状态、AI 整理完成状态。

## 5. Mock 与生产差异

| 当前 Demo | 生产实现 |
|---|---|
| `v28-shell.js` 内写死导航数据 | 从用户权限和知识库接口读取 |
| 搜索结果写死 3 条 | 接统一搜索 API |
| 所有文件点击同一个预览页 | 按 `fileId` 打开真实文件 |
| 图谱打开外部研发页面 | 内嵌或跳转产品内图谱路由 |
| `switchKb()` 前端硬跳页面 | 接路由和当前 workspace 状态 |
| AI 题库只展示入口 | 接题目审核、检索、知识点聚合 |
| 通知只 toast | 接 AI 后台任务通知中心 |

## 6. 前端迁移建议

1. 先实现 `AppShell`、`Sidebar`、`Topbar`、`GlobalSearch`。
2. 再实现 `KnowledgeHome` 和 `WikiEntry`，它们是 v28 主心智。
3. 接着实现 `FolderView` 和 `FilePreview`，支撑“找原件”路径。
4. 最后接 `ChatWorkspace`，保持“用左栏导航离开对话”的交互原则。

## 7. 设计迁移建议

1. 先把 Sidebar / Topbar 做成 Figma 组件。
2. 把 Wiki 首页、词条页、文件预览页拆成 page template。
3. 状态至少覆盖：默认、hover、active、collapsed、search open、account menu open。
4. 文案组件化：KB 名、知识点名、来源文件、AI 整理、引用数量、更新时间。

## 8. 后端 / 算法需要提前确认

- Wiki 页面是否有稳定 `wikiId`。
- Wiki 段落如何保存来源引用：文件、页码、题目、历史对话。
- AI 题库抽题后如何进入待审核状态。
- 搜索 API 是否支持混合结果：Wiki / 文件 / 题目。
- 通知中心是否能承接 AI 后台整理完成事件。

## 9. 验收标准

- 设计能从文档还原出一致的组件和状态。
- 前端能从 `v28-shell.js` 映射出生产组件结构。
- 后端/算法能从数据契约知道每个页面需要哪些字段。
- 后续调整 Sidebar / Topbar 只需要改一处公共壳，而不是 4 个页面。
