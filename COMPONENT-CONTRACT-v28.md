# 飞象 AI 教师端 v28 · 组件与数据契约

> 面向前端、后端、算法协作。静态 demo 只证明方向，生产实现应按这里拆组件、接数据、定义事件。

## 1. 组件树

```text
AppShell
  Sidebar
    ConversationNav
    KnowledgeNav
    AccountMenu
  Topbar
    KnowledgeContext
    ViewSwitcher
    GlobalSearch
    NotificationEntry
  PageContent
    KnowledgeHome | WikiEntry | FolderView | FilePreview | ChatWorkspace | ComposeSheet
```

## 2. AppShell

职责：布局和全局状态。

Props / State：

| 字段 | 类型 | 说明 |
|---|---|---|
| `page` | string | `personal-home` / `wiki-home` / `wiki-entry` / `file-preview` / `compose-sheet` |
| `activeKbId` | string | 当前知识库或团队空间 |
| `activeView` | string | `wiki` / `graph` / `folder` |
| `leftCollapsed` | boolean | 左侧栏是否折叠 |
| `chatState` | string | `closed` / `empty` / `open` |

Events：

- `onToggleSidebar()`
- `onSwitchView(view)`
- `onSwitchKnowledgeBase(kbId)`
- `onOpenChat(mode, initialText)`

## 3. Sidebar

职责：导航，不承载搜索。

Props：

| 字段 | 类型 | 说明 |
|---|---|---|
| `activeKbId` | string | 当前知识库 |
| `knowledgeNav` | object | 我的知识库、团队空间、AI 题库 |
| `chatActive` | boolean | 是否在对话页 |
| `user` | object | 当前用户 |

Events：

- `onNewChat()`
- `onOpenHistory()`
- `onOpenKnowledgeBase(kbId)`
- `onOpenQuestionBank()`
- `onOpenAccountMenu()`

## 4. Topbar

职责：当前上下文、视图切换、搜索、通知。

Props：

| 字段 | 类型 | 说明 |
|---|---|---|
| `kbName` | string | 顶栏显示的当前 KB 名 |
| `kbIcon` | string | `bookmark` / `library` |
| `activeView` | string | 当前视图 |
| `notificationState` | object | 未读数、任务状态 |

Events：

- `onSwitchView(view)`
- `onOpenSearch()`
- `onOpenNotifications()`

## 5. GlobalSearch

职责：统一搜索 Wiki、文件、题目。

Query：

| 字段 | 类型 | 说明 |
|---|---|---|
| `keyword` | string | 用户输入 |
| `kbId` | string | 当前知识库 |
| `scope` | array | `wiki` / `file` / `question` |

Result：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 结果 ID |
| `type` | string | `wiki` / `file` / `question` |
| `title` | string | 主标题 |
| `subtitle` | string | 来源、更新时间等 |
| `targetUrl` | string | 点击目标 |

## 6. KnowledgeHome

职责：展示某个知识库的 Wiki 首页。

Data：

- `knowledgeBase`
- `wikiGroups`
- `recentDigest`
- `folderSummary`
- `emptyState`

## 7. WikiEntry

职责：展示一个 Wiki 词条。

Data：

- `wikiPage`
- `sections`
- `sourceFiles`
- `relatedQuestions`
- `relatedChats`
- `aiContext`

Events：

- `onOpenSourceFile(fileId)`
- `onAskAI(prompt, wikiPageId)`
- `onSwitchToFolder(wikiPageId)`
- `onOpenGraph(wikiPageId)`

## 8. FolderView

职责：找原件。

归属：

- 只有一份 canonical 实现，由 `v28-folder.js` 渲染。
- Demo 路由统一落到 `03-wiki-entry.html?view=folder`。
- 02 首页不内嵌本地文件夹视图，只通过 topbar 导航进入公共 FolderView。

Data：

- `currentFolder`
- `breadcrumbs`
- `folders`
- `files`

规则：

- 不做左侧文件夹树。
- 子文件夹和文件都在同一个列表里。

## 9. FilePreview

职责：预览原文件和 AI 解读。

Data：

- `file`
- `preview`
- `aiSummary`
- `relatedWikiPages`
- `sourceMeta`

规则：

- 默认左原件 / 右 AI 解读 1:1。
- 右侧内容是 AI 解读，不是聊天窗口。

## 10. ComposeSheet

职责：承接 AI 题库“查看题目篮 / 去组题”，完成题单编辑与导出前确认。

Props / State：

| 字段 | 类型 | 说明 |
|---|---|---|
| `mode` | string | `compose` / `basket` |
| `sheetTitle` | string | 题单标题 |
| `questionIds` | string[] | 题目顺序 |
| `activeQuestionId` | string | 当前选中题 |
| `questions` | QuestionBankItem[] | 题目主体内容 |
| `questionMeta` | object | 来源、标签、答案、解析 |

Events：

- `onSelectQuestion(questionId)`
- `onReorderQuestions(questionIds)`
- `onAddQuestion()`
- `onViewDeletedQuestions()`
- `onSaveSheet()`
- `onExportSheet(format)`

交互契约：

- 左题号点击与中栏题目点击都触发 `onSelectQuestion`，行为一致。
- `activeQuestionId` 变化时，中栏与右栏必须同步更新（不可只更新单侧）。
- 保存、下载、活动轨迹在 demo 阶段允许 toast 占位，但按钮语义和位置不可漂移。
- 顶部动作按钮必须复用通用样式类 `.v28-action-btn`（主动作加 `.primary`），避免每页自建按钮体系。
- ComposeSheet 由页面自管顶部动作条，不复用 AppShell Topbar 的视图切换语义。

## 11. 数据模型

### KnowledgeBase

```ts
type KnowledgeBase = {
  id: string;
  name: string;
  type: 'personal' | 'team' | 'school';
  fileCount: number;
  wikiCount?: number;
  memberCount?: number;
  updatedAt: string;
};
```

### FileAsset

```ts
type FileAsset = {
  id: string;
  kbId: string;
  name: string;
  mimeType: string;
  ownerName: string;
  sizeLabel: string;
  updatedAt: string;
  previewUrl?: string;
  relatedWikiIds: string[];
};
```

### WikiPage

```ts
type WikiPage = {
  id: string;
  kbId: string;
  title: string;
  sections: WikiSection[];
  sourceFileIds: string[];
  relatedQuestionIds: string[];
  updatedAt: string;
};
```

### QuestionBankItem

```ts
type QuestionBankItem = {
  id: string;
  stem: string;
  answer: string;
  knowledgePoints: string[];
  difficulty: 'A' | 'B' | 'C';
  sourceFileId: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
};
```

## 12. Demo Mock 与生产接口差异

| Demo | 生产 |
|---|---|
| 所有文件点击统一进入 `04-file-preview.html` | 按 fileId 进入真实预览 |
| 搜索结果写死 3 条 | 接统一搜索 API |
| 图谱打开研发外链 | 接产品内图谱路由 |
| `switchKb()` 用前端 mock | 接用户权限下的知识库列表 |
| AI 题库仅导航展示 | 接题库审核和检索数据 |
| 组题编辑页题目内容写死 | 按题单 ID 拉取题目列表与元数据 |
