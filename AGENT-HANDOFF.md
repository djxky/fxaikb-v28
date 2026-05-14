# AGENT HANDOFF · 飞象 AI 教师端 v28 demo

> 给下一个 AI agent 的交接备忘。新对话开头让 agent 读这个文件即可，不需要复制粘贴。

---

## 怎么用这个文件

**新对话第一句**：

> 项目：飞象 AI 教师端 v28 demo。请先读 `demo/v28-wiki-first/AGENT-HANDOFF.md`，然后我有新需求要讨论：XXX

下一个 agent 读完这一篇即可立刻 onboard。不要让它通读对话历史。

---

## AI 必读 · 3 个硬动作

来自 skill `productdemo`（`~/.cursor/skills/productdemo/SKILL.md`）。新 agent 拿到 HANDOFF 后必须做：

1. **改任何代码前**，先扫一遍 §3 反模式清单——里面是已被否决的方向，不要再提议；若用户新需求与 §2 / §3 冲突，必须明确指出并要求确认
2. **每个回复结束前自查**：本回合用户做了产品决策 / 否决方案 / 新边界 / 改视觉约定吗？任一为 yes，在回复末尾输出 `[记忆更新]` 段并把内容写入本文件对应段。识别有歧义时主动问，不要事后补
3. **进入"写过稿文字 / 出埋点"前必须先对账**：通读 §1～§7 + 扫 demo 代码 → 输出 `[对账清单]`（代码有但 HANDOFF 没记的 / HANDOFF 有但代码没的 / §6 待拍板的），等用户确认后再动笔

---

## §1 项目背景

- **路径**：`demo/v28-wiki-first/`
- **性质**：原型 demo（无后端、纯静态 HTML/CSS/JS），用于跟老板演示产品方向
- **当前状态**：持续迭代中；已新增 `AI 题库` 独立展示页、`历史对话` 列表页、`上传导入流程` 页面，均已接入真实入口；`v28-wiki-first` 全部 HTML 页面已接入 pin-comments 多人评论
- **核心定位**：AI 替教研组维护的「活 Wiki」——区别于传统云盘 / ima / Notion

---

## §2 已对齐的产品决策（不必再讨论）

1. **首页 = AI 织成的"活 Wiki"**，不是文件列表 / 最近使用
2. **理论锚点**：Andrej Karpathy 的 LLM-Wiki 思想——AI 主动维护、层级化可下钻、每段能追到原文件、好答案沉淀回 Wiki（复利效应）
3. **3 种视图切换**全局存在：Wiki / 知识图谱 / 文件夹（顶栏 view-switcher）
4. **2×2 演示矩阵**：
   - 新用户 · 首次使用 → `02-personal-home.html`
   - 老用户 · 日常工作（查 Wiki + 对话生成） → `02-wiki-home.html`
   - 老用户 · 查找原件 → `03-wiki-entry.html?view=folder` → `04-file-preview.html`
5. **文件预览页默认双栏 1:1**：左原文件 / 右 AI 解读
6. **topbar 始终显示当前 KB 名**；右侧通知前显示短搜索框（不展示快捷键），点击后向下展开完整搜索；侧边栏不再常驻搜索框
7. **文件夹视图**：纯列表，无左侧目录树，子文件夹用一行 row 表达（参考 Finder list view / 网盘）
8. **演示阶段**：所有文件点击都跳同一个 `04-file-preview.html`（避免老板乱点掉进死链）
9. **AI 称呼统一**：「飞象 AI」/「飞象」，不要写「系统」「小助手」「智能助手」
10. **AI 题库入口必须是真实跳转**：左栏点击 `AI 题库` 进入 `05-ai-qbank.html`，不能只做 toast 占位
11. **当前题库目标先展示后交互**：`05-ai-qbank.html` 以静态可演示为第一优先，先保证版式与信息表达，再补筛选/题目篮等交互
12. **AI 题库中栏需尽可能还原 v26**：以 `archive/.../v26-knowledge-base/04-qbank.html` 的中栏视觉为准，优先还原筛选条、知识点侧栏、题卡、底部题目篮
13. **AI 题库 topbar 是精简版**：不显示“知识库名称”和“Wiki/知识图谱/文件夹”视图切换，仅保留搜索与通知
14. **AI 题库不展示“推荐/最新”排序**：列表上方只保留当前筛选结果说明
15. **AI 题库筛选结构固定为 3 个下拉**：`题型` / `难度` / `知识库`（不再平铺 chips）
16. **题目来源需带知识库名**：展示格式为“来自 知识库名 · 文件名”
17. **历史对话入口必须是真实跳转**：左栏点击 `历史对话` 进入 `06-chat-history.html`，不能只做 toast 占位
18. **历史对话页信息结构已收敛**：不做分组、不开标签；每条仅展示“对话标题 + 日期时间”，并按日期时间倒序（新→旧）排列
19. **历史对话 topbar 与其他页面统一**：仅保留搜索与通知（不放页面标题和批量按钮），页面标题与操作按钮放在内容区内部
20. **历史对话的“新对话/恢复”走跨页路由**：在 `chat-history` 页点击后先跳 `02-wiki-home.html?chat=new|resume`，再由 `v28.js` 在工作台页落地对话态（不要在历史页内直接切 `data-chat`）
21. **pin-comments 全页覆盖**：`index/02-personal-home/02-wiki-home/03-wiki-entry/04-file-preview/05-ai-qbank/06-chat-history` 均注入 `window.PIN_COMMENTS + supabase-js + ./shared/pin-comments.js`，`projectKey` 统一 `fxaikb`
22. **AI 题库题卡标签精简**：不展示「AI 精选」和「x 分钟」标签，仅保留题型/难度/知识点等必要标签
23. **文件夹视图不展示页内 AI 对话，但保留侧栏可点**：在 `wiki-entry + data-view="folder"` 下隐藏页内 `chat-stream/bottom-bar`；侧栏「新对话/历史对话」仍可点击，并通过跨页路由跳到工作台/历史页
24. **上传入口统一走 onboarding 流程**：`02-personal-home`、`02-wiki-home`、`03-wiki-entry?view=folder(v28-folder.js)` 的上传按钮统一跳 `01-upload-onboarding.html?from=personal|team|folder`
25. **上传完成必须回原入口页并给一次性提示**：onboarding 完成后带 `?imported=1` 回跳来源页；`v28.js` 在 `DOMContentLoaded` 读参后 toast 提示并 `history.replaceState` 清理参数

---

## §3 反模式清单（不要走回头路）

这些方向**已讨论过并被否决**，新 agent 不要重新提议：

- ❌ **三栏布局**（左导航 + 中内容 + 右栏）—— 老板不喜欢，已改为可切换的双栏
- ❌ **首页 = 最近使用**—— 老板已否决，必须是 Wiki
- ❌ **"今日推荐"模块**—— 用户嫌过度营销
- ❌ **左侧文件夹树**（在文件夹视图里）—— 用户嫌不像主流网盘，已简化为纯列表
- ❌ **底部对话栏 + 右侧滑出 panel**—— 已演进为"全页面切换"对话模式
- ❌ **关闭按钮退出对话**—— 用户嫌割裂，改为"用左栏导航离开"
- ❌ **顶栏合并 1 行**（04 试过，太挤）—— 已退回简洁版 + 下沉 entry-bcbar 两行
- ❌ **文案**「空库不空手」「解决老板提的」这类口语 / 自夸 / 营销腔——全部砍掉

---

## §4 边界条件 / 异常处理

demo 的关键边界，改之前要记得这些约束：

- **没有真实登录态**：所有页面默认假装"张老师"登录（左栏底部固定显示账号），不存在未登录态、登录跳转、token 过期
- **切换知识库 = 跨页跳转**：个人 KB 走 `02-personal-home.html`、团队 KB 走 `02-wiki-home.html`，不是同页内切上下文
- **「文件夹」按钮**在 02 / 04 页面会跳到 `03-wiki-entry.html?view=folder`（统一路由），不在本页切；只有 03 自身能在页内切 view
- **子文件夹 mock 数据**只造了「PPT 课件」一组，「习题资料」点进去会出 toast 占位（`v28-folder.js` 已处理）
- **04 的 `data-view` 不能设为 `"folder"`**：会触发 `.app[data-view="folder"] .workspace-scroll{display:none}` 把主内容隐掉；只能用 `"wiki"` + hardcode `vs-btn.active`
- **所有文件点击都跳同一个 `04-file-preview.html`**：演示性兜底，避免老板乱点掉进死链
- **`05-ai-qbank.html` 当前是静态展示态**：搜索、筛选、收藏、添加等按钮默认只承载演示视觉，不承诺真实数据联动
- **上传流程是前端演示态**：`01-upload-onboarding.html` 的扫描数、进度和步骤是 mock 数据；仅承载“看起来完整”的导入过程，不接真实文件系统

---

## 附录 · 文件结构

```
demo/v28-wiki-first/
├── index.html                    # 3 张大场景卡入口
├── 01-upload-onboarding.html      # 上传导入流程（扫描预览 → 导入进度 → 完成回跳）
├── 02-personal-home.html         # 个人 KB · 新用户场景（demo 数据 + 一键清空）
├── 02-wiki-home.html             # 团队 KB · Wiki 首页（演示主战场）
├── 03-wiki-entry.html            # Wiki 词条页 + 文件夹视图(?view=folder) + 知识图谱(?view=graph)
├── 04-file-preview.html          # 文件预览 · 默认双栏 1:1
├── 05-ai-qbank.html              # AI 题库展示页（v26 题库结构的轻量复用版）
├── 06-chat-history.html          # 历史对话列表页（居中容器，单列表倒序）
├── v28.css                       # 全局样式
├── v28-shell.js                  # 公共壳渲染（Sidebar / Topbar / Search / AccountMenu）
├── v28-folder.js                 # 公共 FolderView 渲染（唯一文件夹视图实现）
├── v28.js                        # 全局交互（switchView / switchKb / toggleRight / openWiki）
├── shared/pin-comments.js        # Pin 评论层（Supabase + projectKey，跨 demo 页通用）
├── migrate-v0.3-to-v0.4.sql      # Pin 评论 Supabase 增量迁移脚本
├── PRODUCT-VISION.md             # 产品定位
├── PRODUCT-SPEC-v28.md           # 设计/研发复用产品规格
├── DESIGN-SYSTEM-v28.md          # 设计系统与组件状态
├── COMPONENT-CONTRACT-v28.md     # 研发组件与数据契约
├── HANDOFF-PACKAGE-v28.md        # 设计研发交接清单
└── AGENT-HANDOFF.md              # 本文件
```

新 agent 需要追历史细节时，去读 `PRODUCT-VISION.md` / `PRODUCT-SPEC-v28.md` / `DESIGN-SYSTEM-v28.md` / `COMPONENT-CONTRACT-v28.md` / `HANDOFF-PACKAGE-v28.md`——比本备忘详尽。

---

## §5 视觉 / 交互约定

- **Lucide icons**，`stroke-width: 1.75`（精致度要求高）
- **配色**：金 `--gold:#A87E2C` · 深金 `--gold-deep:#7A5D20` · 浅金背景 `--gold-bg:rgba(201,167,110,.10)`
- **4 个页面 topbar 已完全统一**：`[KB 名] [Wiki|图谱|文件夹] [spacer] [搜索] [🔔]`
- **侧栏对话入口**：`新对话` 下方直接放 `历史对话`，题库留在知识库导航后的业务模块区
- **侧栏知识区结构**：`我的知识库` / `团队知识库`（若干空间）/ `AI 题库`；AI 题库不展示右侧数字
- **公共壳已抽象**：4 个核心页面的 Sidebar / Topbar 由 `v28-shell.js` 渲染，避免重复改 4 份 HTML
- **文件夹视图已收敛**：只有 `03-wiki-entry.html?view=folder` 承载 canonical FolderView，DOM 由 `v28-folder.js` 渲染；02 页面不再内嵌本地文件夹视图（清理项见 §6）
- **AI 题库页走 v28 壳**：`05-ai-qbank.html` 必须复用 `v28-shell.js + v28.css`，避免回退到 v26 独立壳样式
- **AI 题库中栏样式策略**：采用“中栏定向迁移”，允许在 `05-ai-qbank.html` 内内联局部样式做高保真复刻，但不引入整份 `kb-workbench.css`
- **AI 题库 topbar 例外规则**：`v28-shell.js` 对 `data-page="ai-qbank"` 走定制渲染，不显示 KB 名与视图切换
- **历史对话 topbar 例外规则**：`v28-shell.js` 对 `data-page="chat-history"` 走定制渲染，仅显示搜索与通知
- **历史对话内容区布局**：`06-chat-history.html` 的列表内容采用居中容器（`width:min(920px,100%)` + `margin:0 auto`），并在内容区内显示「历史对话」标题 + 「批量选择/新对话」按钮
- **历史对话列表规则**：`06-chat-history.html` 仅保留标题和日期时间，不使用“今天/昨天/上周”分组，也不展示对话标签
- **历史对话侧栏高亮**：`data-page="chat-history"` 时 `sb-chat-entry` 自动添加 `active` class，通过模板字符串在 `renderSidebar` 中内联判断
- **侧栏高亮互斥规则**：`ai-qbank` 和 `chat-history` 属于“模块页”，进入这两页时只高亮模块入口，不再同时高亮任一知识库项（避免双选中态）
- **历史对话页结构必须对齐 v28 壳**：`06-chat-history.html` 使用 `.app + .sidebar-left + .workspace + .topbar + .workspace-scroll + .sidebar-right + #toast`，禁止引入并行壳容器（如 `#toast-container`）
- **历史对话跨页对话链路**：`openChat()` 在 `chat-history` 场景下不做页内聊天态切换，而是写 query 参数后跳工作台页，工作台页 `DOMContentLoaded` 读取 `chat` 参数执行 `openChat('new'|'resume')`
- **文件夹视图对话兜底**：`v28.css` 强制隐藏 `.chat-stream/.bottom-bar`（`wiki-entry + view=folder`）；`v28.js openChat()` 在该场景不做页内切换，而是跨页跳转（`history -> 06-chat-history.html`，`new/resume/replay -> 02-wiki-home.html?chat=...`）
- **上传流程回跳约定**：`01-upload-onboarding.html` 通过 `from` 参数决定回跳页（`personal` / `team` / `folder`），完成时补 `imported=1`；`v28.js` 统一消费该参数并给提示
- **Wiki / 文件二级栏统一**：4 个 Wiki 相关页面都有通栏顶部条 + 下载 + 分享；Wiki 详情右栏按钮叫「整理依据」且默认收起；文件右栏按钮叫「AI 解读」且默认展开
- 02 / 03 / 04 在 topbar 下面有独立 `entry-bcbar`（面包屑 + 下载/分享；03/04 额外有右栏入口）
- **cache buster 当前版本**：`?v=20260512be`（改 CSS/JS 后递增字母）

---

## §6 已知技术债 / 悬而未决

1. **04 的 entry-bcbar 在 1:1 双栏下可能拥挤**——4 段面包屑 + 3 个 actions 共 7 元素挤在 ~50% 宽度。后续可考虑：(a) 面包屑中间项省略为 `…`；(b) 下载/分享折成 `⋯` 菜单
2. **03 head 里仍有 inline `<style>` 兜底**（左栏 collapsed/expanded 宽度 + 文件夹视图微调），是为了绕浏览器缓存。以后可整合回 `v28.css` 并删 inline
3. **知识图谱视图**目前是占位（沿用 v27 链接），未真正实现
4. **新对话页面**未单独拆出来——左栏"新对话"按钮走的是 `02-workbench` 风格的 in-page chat 模式
5. **`02-wiki-home.html` 残留** `legacy-view-folder` hidden DOM——文件夹视图已统一到 03，这段死代码可以清掉
6. **`05-ai-qbank.html` 暂未接入真实交互**：筛选/题目篮/审核侧滑仍是展示态，后续如需演示流程需补最小可点击链路
7. **题目篮 fixed 布局还未适配左栏折叠态**：当前按左栏展开宽度计算 `left`，后续若要支持 dock 态需加响应规则

---

## §7 用户工作偏好（务必遵守）

来自工作区 rule `align-before-act.mdc`：

1. **先讨论后动手**：非 trivial 任务先列方案对齐再开工，不要闷头改文件
2. **批判性立场**：用户说法不对就直接指出，**不附和**；亮出更好的路径并给理由
3. **文案克制**：不要营销腔、不要"解决老板提的"自夸、不要口语化（如"空库不空手"）
4. **回复用简体中文**

---

## 附录 · 常见疑问（避免新 agent 二次提议）

- **为什么 04 默认双栏？** —— 老板要求"看原文件时 AI 内容占 1:1"，体现 AI 不是辅助而是平等
- **为什么 topbar 始终显示 KB 名？** —— 搜索与视图切换都上移到全局工作栏后，KB 名需要作为稳定上下文锚点常驻
- **为什么所有文件都跳 04？** —— 演示用，避免老板乱点掉进死链。索引在 `index.html` 卡片文案里已写明
- **为什么文件夹视图统一落到 03？** —— 三视图是全局能力，不应该每页复制；`switchView('folder')` 会统一导航到 `03-wiki-entry.html?view=folder`
- **为什么 hero 文案要"这不是云盘"开头？** —— 用户明确要求基于 Karpathy 理论体现"区别于传统网盘"，否定式 hook 最快建立差异认知
