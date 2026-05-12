# AGENT HANDOFF · 飞象 AI 教师端 v28 demo

> 给下一个 AI agent 的交接备忘。新对话开头让 agent 读这个文件即可，不需要复制粘贴。

---

## 怎么用这个文件

**新对话第一句**：

> 项目：飞象 AI 教师端 v28 demo。请先读 `demo/v28-wiki-first/AGENT-HANDOFF.md`，然后我有新需求要讨论：XXX

下一个 agent 读完这一篇即可立刻 onboard。不要让它通读对话历史。

---

## 项目背景

- **路径**：`demo/v28-wiki-first/`
- **性质**：原型 demo（无后端、纯静态 HTML/CSS/JS），用于跟老板演示产品方向
- **当前状态**：**老板已认可现状**，进入下一阶段
- **核心定位**：AI 替教研组维护的「活 Wiki」——区别于传统云盘 / ima / Notion

---

## 已对齐的产品决策（不必再讨论）

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

---

## 反模式清单（不要走回头路）

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

## 文件结构

```
demo/v28-wiki-first/
├── index.html                    # 3 张大场景卡入口
├── 02-personal-home.html         # 个人 KB · 新用户场景（demo 数据 + 一键清空）
├── 02-wiki-home.html             # 团队 KB · Wiki 首页（演示主战场）
├── 03-wiki-entry.html            # Wiki 词条页 + 文件夹视图(?view=folder) + 知识图谱(?view=graph)
├── 04-file-preview.html          # 文件预览 · 默认双栏 1:1
├── v28.css                       # 全局样式
├── v28-shell.js                  # 公共壳渲染（Sidebar / Topbar / Search / AccountMenu）
├── v28.js                        # 全局交互（switchView / switchKb / toggleRight / openWiki / enterSubfolder）
├── kb-workbench.css/.js          # 早期工作台样式 / 交互（仍被部分页面引用）
├── kb-page-router.js             # 路由
├── PRODUCT-VISION.md             # 产品定位
├── PRODUCT-SPEC-v28.md           # 设计/研发复用产品规格
├── DESIGN-SYSTEM-v28.md          # 设计系统与组件状态
├── COMPONENT-CONTRACT-v28.md     # 研发组件与数据契约
├── HANDOFF-PACKAGE-v28.md        # 设计研发交接清单
├── AI-CONTEXT-MODEL.md           # AI 上下文模型
├── KNOWLEDGE-LIBRARY-MODEL.md    # 知识库数据模型
├── DEMO-GUIDE.md                 # 演示动线
└── AGENT-HANDOFF.md              # 本文件
```

新 agent 需要追历史细节时，去读 `PRODUCT-VISION.md` / `AI-CONTEXT-MODEL.md` / `KNOWLEDGE-LIBRARY-MODEL.md` / `DEMO-GUIDE.md`——比本备忘详尽。

---

## 视觉 / 交互约定

- **Lucide icons**，`stroke-width: 1.75`（精致度要求高）
- **配色**：金 `--gold:#A87E2C` · 深金 `--gold-deep:#7A5D20` · 浅金背景 `--gold-bg:rgba(201,167,110,.10)`
- **4 个页面 topbar 已完全统一**：`[KB 名] [Wiki|图谱|文件夹] [spacer] [搜索] [🔔]`
- **侧栏对话入口**：`新对话` 下方直接放 `历史对话`，题库留在知识库导航后的业务模块区
- **侧栏知识区结构**：`我的知识库` / `团队知识库`（若干空间）/ `AI 题库`；AI 题库不展示右侧数字
- **公共壳已抽象**：4 个核心页面的 Sidebar / Topbar 由 `v28-shell.js` 渲染，避免重复改 4 份 HTML
- **Wiki / 文件二级栏统一**：4 个 Wiki 相关页面都有通栏顶部条 + 下载 + 分享；Wiki 详情右栏按钮叫「整理依据」且默认收起；文件右栏按钮叫「AI 解读」且默认展开
- 02 / 03 / 04 在 topbar 下面有独立 `entry-bcbar`（面包屑 + 下载/分享；03/04 额外有右栏入口）
- **cache buster 当前版本**：`?v=20260512bd`（改 CSS/JS 后递增字母）

---

## 已知技术债 / pending

1. **04 的 entry-bcbar 在 1:1 双栏下可能拥挤**——4 段面包屑 + 3 个 actions 共 7 元素挤在 ~50% 宽度。后续可考虑：(a) 面包屑中间项省略为 `…`；(b) 下载/分享折成 `⋯` 菜单
2. **03 head 里仍有 inline `<style>` 兜底**（左栏 collapsed/expanded 宽度 + 文件夹视图微调），是为了绕浏览器缓存。以后可整合回 `v28.css` 并删 inline
3. **知识图谱视图**目前是占位（沿用 v27 链接），未真正实现
4. **新对话页面**未单独拆出来——左栏"新对话"按钮走的是 `02-workbench` 风格的 in-page chat 模式
5. **04-file-preview 已知**：`data-view` 不能设为 `"folder"`（会触发 v28.css 里 `.app[data-view="folder"] .workspace-scroll{display:none}` 把主内容隐掉），只能用 `"wiki"` + hardcode `vs-btn.active`

---

## 用户工作偏好（务必遵守）

来自工作区 rule `align-before-act.mdc`：

1. **先讨论后动手**：非 trivial 任务先列方案对齐再开工，不要闷头改文件
2. **批判性立场**：用户说法不对就直接指出，**不附和**；亮出更好的路径并给理由
3. **文案克制**：不要营销腔、不要"解决老板提的"自夸、不要口语化（如"空库不空手"）
4. **回复用简体中文**

---

## 一些可能被问到的"为什么"（避免新 agent 二次提议）

- **为什么 04 默认双栏？** —— 老板要求"看原文件时 AI 内容占 1:1"，体现 AI 不是辅助而是平等
- **为什么 topbar 始终显示 KB 名？** —— 搜索与视图切换都上移到全局工作栏后，KB 名需要作为稳定上下文锚点常驻
- **为什么所有文件都跳 04？** —— 演示用，避免老板乱点掉进死链。索引在 `index.html` 卡片文案里已写明
- **为什么 03 既是 wiki 词条页又是文件夹视图？** —— 共用模板降低开发量；通过 `?view=` URL 参数切换；切换时 `switchView()` 处理
- **为什么 hero 文案要"这不是云盘"开头？** —— 用户明确要求基于 Karpathy 理论体现"区别于传统网盘"，否定式 hook 最快建立差异认知
