/* ========================================================
   飞象 AI · v28 — 交互逻辑
   架构：
     - 主区永远是内容（Wiki / 文件 / 图谱）
     - 底部 command bar 常驻（AI 入口）
     - 右栏 chat drawer 召唤式滑入，展开时底部 bar 自动隐藏
   ======================================================== */

const app = document.getElementById('app');

/* ──────────────────────────────────────────────
   左栏 dock 收折（保留 ⌘\ 快捷键）
   ────────────────────────────────────────────── */
function toggleSide(which){
  if(which !== 'left') return;
  const current = app.dataset.left;
  if(current === 'collapsed') delete app.dataset.left;
  else app.dataset.left = 'collapsed';
  refreshCollapseIcons();
}

function refreshCollapseIcons(){
  const leftCollapsed = app.dataset.left === 'collapsed';
  const li = document.getElementById('left-icon');
  if(li) li.setAttribute('data-lucide', leftCollapsed ? 'panel-left-open' : 'panel-left-close');
  if(window.lucide) lucide.createIcons();
}

/* 账号菜单 · 设置等低频入口收进张老师头像 */
function closeAccountMenus(){
  document.querySelectorAll('.sb-account.open').forEach(account => {
    account.classList.remove('open');
    const trigger = account.querySelector('.sb-user');
    if(trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

function toggleAccountMenu(event){
  if(event) event.stopPropagation();
  const trigger = event && event.currentTarget;
  const account = trigger && trigger.closest('.sb-account');
  if(!account) return;
  const willOpen = !account.classList.contains('open');
  closeAccountMenus();
  account.classList.toggle('open', willOpen);
  trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function accountMenuAction(label){
  closeAccountMenus();
  showToast(`（演示）打开${label}`);
}

/* 顶栏搜索 · 右侧短入口，下方展开搜索框 */
function ensureTopSearchPanel(){
  let panel = document.getElementById('top-search-panel');
  if(panel) return panel;
  const workspace = document.querySelector('.workspace');
  const topbar = document.querySelector('.topbar');
  if(!workspace || !topbar) return null;

  panel = document.createElement('div');
  panel.className = 'top-search-panel';
  panel.id = 'top-search-panel';
  panel.innerHTML = `
    <div class="top-search-input">
      <i data-lucide="search"></i>
      <input id="top-search-input" type="text" placeholder="搜索 Wiki、文件、题目…" autocomplete="off" />
      <span class="spot-esc" onclick="closeTopSearch()">Esc</span>
    </div>
    <div class="top-search-results">
      <button class="top-search-item" onclick="showToast('（演示）打开「二次函数图像与性质」')">
        <i data-lucide="book-open"></i>
        <span>
          <span class="top-search-main">二次函数图像与性质</span>
          <span class="top-search-sub">Wiki · 引用 12 份资料</span>
        </span>
        <span class="top-search-type">Wiki</span>
      </button>
      <button class="top-search-item" onclick="window.location.href='04-file-preview.html'">
        <i data-lucide="presentation"></i>
        <span>
          <span class="top-search-main">二次函数·导入课件.pptx</span>
          <span class="top-search-sub">文件 · 张老师上传</span>
        </span>
        <span class="top-search-type">文件</span>
      </button>
      <button class="top-search-item" onclick="showToast('（演示）筛选题库：二次函数')">
        <i data-lucide="file-stack"></i>
        <span>
          <span class="top-search-main">二次函数分层练习</span>
          <span class="top-search-sub">题库 · 38 道相关题</span>
        </span>
        <span class="top-search-type">题目</span>
      </button>
    </div>
  `;
  topbar.insertAdjacentElement('afterend', panel);
  if(window.lucide) lucide.createIcons();
  return panel;
}

function closeTopSearch(){
  const panel = document.getElementById('top-search-panel');
  if(panel) panel.classList.remove('open');
  document.querySelectorAll('.tb-search[aria-expanded="true"]').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });
}

function openTopSearch(){
  closeAccountMenus();
  const panel = ensureTopSearchPanel();
  if(!panel) return;
  panel.classList.add('open');
  document.querySelectorAll('.tb-search').forEach(btn => btn.setAttribute('aria-expanded', 'true'));
  setTimeout(() => {
    const input = document.getElementById('top-search-input');
    if(input) input.focus();
  }, 40);
}

function toggleTopSearch(event){
  if(event) event.stopPropagation();
  const panel = ensureTopSearchPanel();
  if(!panel) return;
  if(panel.classList.contains('open')) closeTopSearch();
  else openTopSearch();
}

/* ──────────────────────────────────────────────
   对话页 · 切到对话模块（不是浮窗，是页面切换）
   · 左栏保持原状（用户靠它回到知识库）
   · 中间 = 对话流，右栏 = Canvas
   ────────────────────────────────────────────── */
let _streamingTimer = null;

function openChat(mode = 'new', initialText = ''){
  const pageId = document.body?.dataset?.page || '';
  const fromHistoryPage = pageId === 'chat-history';
  const inFolderView = pageId === 'wiki-entry' && app?.dataset?.view === 'folder';

  if(inFolderView){
    if(mode === 'history'){
      window.location.href = '06-chat-history.html';
      return;
    }
    const targetMode = mode === 'resume' ? 'resume' : 'new';
    const initial = initialText ? '&initial=' + encodeURIComponent(initialText) : '';
    window.location.href = `02-wiki-home.html?chat=${targetMode}${initial}`;
    return;
  }

  if(mode === 'history'){
    window.location.href = '06-chat-history.html';
    return;
  }
  if(mode === 'resume'){
    if(fromHistoryPage){
      window.location.href = '02-wiki-home.html?chat=resume';
      return;
    }
    app.dataset.chat = 'open';
    setActiveModule('chat');
    showToast('（演示）已恢复上次对话 · 围绕《二次函数》出 5 道分层练习');
    runChatDemo('围绕「二次函数图像与性质」出 5 道分层练习，A/B/C 三难度，给八(3)班用');
    return;
  }
  /* 新对话：
     · 有 initialText（从底部 command bar 带入题）→ 直接进对话流
     · 没 initialText（点击 sidebar「+ 新对话」）→ 进空状态欢迎页，等老师自由输入 */
  if(initialText){
    if(fromHistoryPage){
      window.location.href = '02-wiki-home.html?chat=new&initial=' + encodeURIComponent(initialText);
      return;
    }
    app.dataset.chat = 'open';
    setActiveModule('chat');
    runChatDemo(initialText);
    return;
  }
  if(fromHistoryPage){
    window.location.href = '02-wiki-home.html?chat=new';
    return;
  }
  enterChatEmpty();
}

/* 新对话空状态：老师自由输入页（Gemini / ChatGPT 风格 new chat）
   · 不预填任何 prompt，不跑 AI mock
   · chip 点击 = 填入输入框（让老师再编辑），不直接发送
   · 老师按发送 → 切到 data-chat="open" 走 runChatDemo */
function enterChatEmpty(){
  clearTimeout(_streamingTimer);
  app.dataset.chat = 'empty';
  setActiveModule('chat');
  toggleMemoryToast(false);

  const h = new Date().getHours();
  const greet = h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  const greetEl = document.getElementById('ce-greet');
  if(greetEl) greetEl.textContent = `${greet}，张老师`;

  /* 联动当前 active 知识库（左栏选中的那个） */
  const activeKb = document.querySelector('.sb-kb.active .kb-name');
  if(activeKb){
    const name = activeKb.textContent.trim();
    const kbNameEl = document.getElementById('ce-kb-name');
    if(kbNameEl) kbNameEl.textContent = name;

    const kbLabel = document.getElementById('ce-kb-label');
    if(kbLabel){
      const short = name.replace(/共建库|知识库/g,'').trim();
      kbLabel.textContent = `${short} · 925 份`;
    }
  }

  const ta = document.getElementById('ce-input');
  if(ta){
    ta.value = '';
    autosize(ta);
  }
  refreshCeSend();

  setTimeout(()=>{
    const t = document.getElementById('ce-input');
    if(t) t.focus();
  }, 120);
}

function ceUseChip(text){
  const ta = document.getElementById('ce-input');
  if(!ta) return;
  ta.value = text;
  autosize(ta);
  refreshCeSend();
  ta.focus();
  if(ta.setSelectionRange) ta.setSelectionRange(ta.value.length, ta.value.length);
}

function ceSend(){
  const ta = document.getElementById('ce-input');
  if(!ta) return;
  const text = ta.value.trim();
  if(!text){
    showToast('先输入点什么');
    return;
  }
  app.dataset.chat = 'open';
  runChatDemo(text);
  ta.value = '';
  autosize(ta);
  refreshCeSend();
}

function refreshCeSend(){
  const ta = document.getElementById('ce-input');
  const btn = document.getElementById('ce-send');
  if(!ta || !btn) return;
  btn.classList.toggle('idle', !ta.value.trim());
}

/* 兼容旧调用：closeChat 现在等同于 → 回到知识库（当前 active 库） */
function closeChat(){
  backToKnowledgeBase();
}

function backToKnowledgeBase(){
  clearTimeout(_streamingTimer);
  delete app.dataset.chat;
  switchCanvas('wiki');
  toggleMemoryToast(false);

  const activeKb = document.querySelector('.sb-kb.active');
  setActiveModule(activeKb ? 'kb' : null);

  setTimeout(()=>{
    const tb = document.getElementById('bb-textarea');
    if(tb) tb.focus();
  }, 320);
}

/* 设置左栏当前 active 模块 */
function setActiveModule(mode){
  const chatBtn = document.getElementById('sb-chat');
  if(chatBtn) chatBtn.classList.toggle('active', mode === 'chat');
}

function toggleMemoryToast(show){
  const toast = document.getElementById('mem-toast-row');
  if(!toast) return;
  toast.classList.toggle('show', !!show);
}

function shouldShowMemoryToast(userText = ''){
  const text = String(userText || '').trim();
  if(!text) return false;

  const hasRuleIntent = /(以后|统一|固定|默认|优先|习惯|偏好|都按|命名|规则|比例|分配|归到|模板)/.test(text);
  const hasConfirmSignal = /(^|[\s，。！？])(对|是的|可以|确认|同意|就这样|按这个|以后都)([\s，。！？]|$)/.test(text);
  const hasTargetObject = /(出题|题目|难度|A\/B\/C|命名|函数|学情|课件|分类|模板|班级|八\(3\)班)/.test(text);

  return hasRuleIntent && hasConfirmSignal && hasTargetObject;
}

/* ──────────────────────────────────────────────
   对话 demo · 用户消息 + AI 流式打字 + 自动切到 Canvas 题目集
   ────────────────────────────────────────────── */
function runChatDemo(userText){
  clearTimeout(_streamingTimer);
  const showMemoryToast = shouldShowMemoryToast(userText);

  const userEl = document.getElementById('chat-user-text');
  const aiText = document.getElementById('chat-ai-text');
  const aiMsg  = document.getElementById('chat-ai-msg');
  const title  = document.getElementById('ch-title');
  const bcFrom = document.getElementById('bc-from');
  if(userEl) userEl.textContent = userText;
  if(title)  title.textContent  = userText.slice(0, 40) + (userText.length>40?'…':'');

  /* 面包屑入口跟当前 active 库联动 */
  const activeKb = document.querySelector('.sb-kb.active .kb-name');
  if(bcFrom && activeKb) bcFrom.textContent = activeKb.textContent.trim();

  const isQuiz   = /出.*题|组题|练习/.test(userText);
  const isSlides = /课件|讲评|备课/.test(userText);
  const isAnim   = /动画|讲解|动效/.test(userText);

  let body, citesHtml = '', actionsHtml = '';

  if(isQuiz){
    body = '好的。我从你们组共建库的「二次函数」相关 <b>12 份资料</b> 里挑了高频考点：'
         + '<span class="cite-link" onclick="showToast(\'（演示）打开 导入课件.pptx P3\')">开口方向</span>、'
         + '<span class="cite-link" onclick="showToast(\'（演示）打开 配套习题汇编.pdf P12\')">对称轴与顶点</span>、'
         + '<span class="cite-link" onclick="showToast(\'（演示）打开 海淀一模 T6\')">增减性应用</span>'
         + '，按 A / B / C 三档难度生成了 5 道题——已展示在右边 Canvas。';
    citesHtml = '<div class="msg-cites"><i data-lucide="link-2"></i>引用：导入课件.pptx · 配套习题汇编.pdf · 海淀 2026 一模卷</div>';
    actionsHtml = '<div class="msg-actions">'
      + '<button class="msg-action" onclick="switchCanvas(\'quiz\')"><i data-lucide="sparkles"></i>查看题目集</button>'
      + '<button class="msg-action" onclick="showToast(\'（演示）让 AI 再改改难度\')"><i data-lucide="refresh-ccw"></i>调整难度</button>'
      + '</div>';
    setTimeout(()=>{
      const tab = document.getElementById('cv-tab-quiz');
      if(tab) tab.hidden = false;
      switchCanvas('quiz');
    }, 1400);
  } else if(isSlides){
    body = '收到。我会基于「二次函数图像与性质」整理一份 <b>12 页课件</b>，包含：导入 → 开口方向 → 对称轴 → 顶点 → 增减性 → 综合例题 → 课后小结。准备就绪后展示在 Canvas。';
    actionsHtml = '<div class="msg-actions"><button class="msg-action" onclick="showToast(\'（演示）课件生成中…\')"><i data-lucide="layout"></i>查看课件预览</button></div>';
  } else if(isAnim){
    body = '好的。我会做一个 <b>2 分钟动画</b>，用图形动态演示判定过程。Canvas 区域加载视频预览中…';
  } else {
    body = '好的，我基于你们组共建库（925 份）来回答。当前你正在看「二次函数图像与性质」，已自动锁定上下文——右边 Canvas 实时显示我引用的位置。';
  }

  if(aiText){
    aiText.innerHTML = '';
    typeText(aiText, body, () => {
      const wrap = document.createElement('div');
      wrap.innerHTML = citesHtml + actionsHtml;
      while(wrap.firstChild) aiMsg.querySelector('.msg-content').appendChild(wrap.firstChild);
      if(window.lucide) lucide.createIcons();
      toggleMemoryToast(showMemoryToast);
    });
  }

  setTimeout(()=>{
    const ta = document.getElementById('cc-textarea');
    if(ta) ta.focus();
  }, 340);
}

function typeText(el, html, done){
  el.innerHTML = '<span class="typing-cursor"></span>';
  let i = 0;
  const len = html.length;
  const step = () => {
    i += 3;
    const chunk = html.slice(0, i);
    el.innerHTML = chunk + '<span class="typing-cursor"></span>';
    if(i >= len){
      el.innerHTML = html;
      done && done();
      return;
    }
    _streamingTimer = setTimeout(step, 18);
  };
  step();
}

/* ──────────────────────────────────────────────
   Canvas tab 切换
   ────────────────────────────────────────────── */
function switchCanvas(name){
  document.querySelectorAll('.cv-tab').forEach(b=>{
    b.classList.toggle('active', b.dataset.cv === name);
  });
  document.querySelectorAll('.cv-pane').forEach(p=>{
    p.classList.toggle('active', p.dataset.pane === name);
  });
}

/* 右栏面板 toggle：Wiki 展示整理依据，文件展示 AI 解读 */
function toggleRight(){
  if(!app) return;
  if(app.dataset.right === 'expanded'){
    delete app.dataset.right;
  } else {
    app.dataset.right = 'expanded';
  }
}
/* 兼容旧调用 */
function collapseRight(){ if(app) delete app.dataset.right; }
function expandRight(){ if(app) app.dataset.right = 'expanded'; }

/* 右栏「来源资料」展开 / 收起更多文件（仅 03-wiki-entry） */
function toggleSources(){
  document.body.classList.toggle('sources-expanded');
  const more = document.getElementById('cm-source-more');
  if(more){
    const label = more.querySelector('.cm-src-name');
    if(label){
      const expanded = document.body.classList.contains('sources-expanded');
      label.innerHTML = expanded
        ? '<i data-lucide="chevron-up"></i>收起'
        : '<i data-lucide="chevron-down"></i>展开全部 12 份';
      if(window.lucide) lucide.createIcons();
    }
  }
}

/* ──────────────────────────────────────────────
   中间对话区 · 输入提交
   ────────────────────────────────────────────── */
function sendInChat(){
  const ta = document.getElementById('cc-textarea');
  if(!ta || !ta.value.trim()){
    showToast('先输入点什么');
    return;
  }
  const text = ta.value.trim();
  ta.value = '';
  autosize(ta);
  refreshCcSend();
  runChatDemo(text);
}

function refreshCcSend(){
  const ta = document.getElementById('cc-textarea');
  const btn = document.getElementById('cc-send');
  if(!ta || !btn) return;
  btn.classList.toggle('idle', !ta.value.trim());
}

/* ──────────────────────────────────────────────
   底部 command bar · 提交 / 工具 chip / 上次对话回溯
   ────────────────────────────────────────────── */
function submitFromBar(){
  const ta = document.getElementById('bb-textarea');
  if(!ta || !ta.value.trim()){
    showToast('先输入点什么');
    return;
  }
  const text = ta.value.trim();
  ta.value = '';
  autosize(ta);
  refreshBarSend();
  openChat('new', text);
}

function useFromBar(text){
  const ta = document.getElementById('bb-textarea');
  if(!ta) return;
  ta.value = text;
  autosize(ta);
  refreshBarSend();
  ta.focus();
}

function refreshBarSend(){
  const ta = document.getElementById('bb-textarea');
  const btn = document.getElementById('bb-send');
  if(!ta || !btn) return;
  btn.classList.toggle('idle', !ta.value.trim());
}

/* ──────────────────────────────────────────────
   中栏视图切换
   ────────────────────────────────────────────── */
/* ──────────────────────────────────────────────
   视图切换 · wiki / graph / folder
   - graph：直接新窗口打开研发真实图谱（来自 KB 3 实数据）
   - folder：统一进入 03 的 canonical 文件夹视图，不在每页复制 DOM
   - wiki：保留当前页 Wiki，或从 03 的 folder 回到词条
   ────────────────────────────────────────────── */
const GRAPH_SRC = 'https://mapi.feixiangxingqiu.biz/fedebug/agora/feat/wiki-knowledge-graph/index.html#/knowledge-graph?kbId=3';
let _prevLeftBeforeFolder = null;

function switchView(v, entryName){
  /* 图谱 = 研发独立 SPA，直接新窗口打开。不动当前视图，保持上下文 */
  if(v === 'graph'){
    window.open(GRAPH_SRC, '_blank', 'noopener,noreferrer');
    showToast('知识图谱已在新窗口打开 · 来自研发实时数据');
    return;
  }

  if(v === 'folder' && document.body.dataset.page !== 'wiki-entry'){
    window.location.href = '03-wiki-entry.html?view=folder';
    return;
  }

  document.querySelectorAll('.vs-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.view === v);
  });

  const prevView = app.dataset.view;
  app.dataset.view = v;

  /* 进入文件夹视图：记住左栏状态后自动折叠到 dock，给文件树腾空间 */
  if(v === 'folder' && prevView !== 'folder'){
    _prevLeftBeforeFolder = app.dataset.left || 'expanded';
    app.dataset.left = 'collapsed';
    refreshCollapseIcons();
  }
  /* 离开文件夹视图：恢复用户原本的左栏状态 */
  if(v !== 'folder' && prevView === 'folder' && _prevLeftBeforeFolder !== null){
    if(_prevLeftBeforeFolder === 'collapsed'){
      app.dataset.left = 'collapsed';
    } else {
      delete app.dataset.left;
    }
    refreshCollapseIcons();
    _prevLeftBeforeFolder = null;
  }

  const hasFolderView = !!document.getElementById('view-folder');
  if(v === 'folder' && !hasFolderView){
    const msg = entryName
      ? `（演示）文件夹视图 · 定位到「${entryName}」的 12 份来源 — 即将上线`
      : '（演示）文件夹视图 — 即将上线，先看 Wiki';
    showToast(msg);
    setTimeout(()=>switchView('wiki'), 1200);
  }
}

function openGraphExternal(){
  window.open(GRAPH_SRC, '_blank', 'noopener,noreferrer');
}

/* 文件夹树 · 展开/折叠 */
function toggleFolder(itemEl){
  const li = itemEl.closest('li');
  if(!li) return;
  li.classList.toggle('open');
  const caret = itemEl.querySelector('.ti-caret');
  const icon  = itemEl.querySelector('.ti-icon');
  if(caret){
    caret.setAttribute('data-lucide', li.classList.contains('open') ? 'chevron-down' : 'chevron-right');
  }
  if(icon && !icon.classList.contains('keep')){
    const isFolder = icon.getAttribute('data-lucide')?.startsWith('folder');
    if(isFolder){
      icon.setAttribute('data-lucide', li.classList.contains('open') ? 'folder-open' : 'folder');
    }
  }
  if(window.lucide) lucide.createIcons();
}

function openFolder(folderId){
  document.querySelectorAll('.fv-tree-list li.active').forEach(li=>li.classList.remove('active'));
  const item = document.querySelector(`.fv-tree-item[onclick*="${folderId}"]`);
  if(item){
    const li = item.closest('li');
    if(li) li.classList.add('active');
  }
  showToast(`（演示）切换到文件夹「${folderId}」 · 这里只展开了「二次函数」做演示`);
}

/* ──────────────────────────────────────────────
   左栏 nav 跳转占位
   ────────────────────────────────────────────── */
function navTo(target){
  if(target === 'qbank'){
    window.location.href = '05-ai-qbank.html';
    return;
  }
  const labels = {
    workbench: '工作台',
    qbank: '题库',
    history: '历史对话',
  };
  showToast(`（演示）打开「${labels[target]||target}」`);
}

/* ──────────────────────────────────────────────
   切换知识库（demo mock）
   · 若在对话页：自动退出对话回到 Wiki 浏览态
   ────────────────────────────────────────────── */
function switchKb(id, name, count){
  /* 跨页跳转：个人 vs 团队 不是同一个页面 */
  const onPersonalPage = document.body.dataset.page === 'personal-home';

  if(id === 'personal' && !onPersonalPage){
    window.location.href = '02-personal-home.html';
    return;
  }
  if(id !== 'personal' && onPersonalPage){
    /* 个人页 → 团队 KB 系页面 */
    window.location.href = '02-wiki-home.html';
    return;
  }
  if(id === 'personal' && onPersonalPage){
    /* 已经在个人页，啥也不做（避免无效刷新） */
    return;
  }

  /* 以下是同页 in-page 切换团队 KB（仅在 team-home 页生效） */
  if(app.dataset.chat){
    clearTimeout(_streamingTimer);
    delete app.dataset.chat;
    switchCanvas('wiki');
    setActiveModule(null);
  }

  document.querySelectorAll('.sb-kb').forEach(b=>{
    b.classList.toggle('active', b.dataset.kb === id);
  });

  const title = document.getElementById('hero-title');
  const countEl = document.getElementById('hero-count');
  if(title){
    if(id === 'school'){
      title.innerHTML = `北京 101 中学 · <em>公共库</em>`;
    } else {
      title.innerHTML = `北京 101 中学 · <em>${name}</em>`;
    }
  }
  if(countEl) countEl.textContent = count.toLocaleString();

  /* 同步 topbar 当前 KB 名 */
  const tbKbName = document.getElementById('tb-kb-name');
  if(tbKbName){
    tbKbName.textContent = name;
  }

  showToast(`（演示）已切换到「${name}」 · ${count} 份资料`);
}

/* ──────────────────────────────────────────────
   Wiki 词条 / 新对话 / 右栏 prompt
   ────────────────────────────────────────────── */
function openWiki(name){
  if(name === '飞象使用指南'){
    showToast('（演示）这里会打开《飞象使用指南》— 5 分钟读完');
    return;
  }
  /* 所有 wiki 词条共用 03 模板，靠 query 参数传词条名 */
  window.location.href = '03-wiki-entry.html?w=' + encodeURIComponent(name);
}

function scrollToSec(id){
  const el = document.getElementById(id);
  if(!el){ return; }
  const scroller = document.querySelector('.workspace-scroll') || window;
  if(scroller === window){
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }else{
    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 16;
    scroller.scrollTo({top, behavior:'smooth'});
  }
  el.style.transition = 'background .8s';
  el.style.background = 'rgba(192,142,79,.08)';
  setTimeout(()=>{ el.style.background = ''; }, 1100);
}

function newChat(){
  openChat('new');
}

function useQuick(text){
  openChat('new', text);
}

function sendMessage(){
  sendInChat();
}

/* ──────────────────────────────────────────────
   textarea 自动高度
   ────────────────────────────────────────────── */
function autosize(ta){
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
}

/* ──────────────────────────────────────────────
   Toast
   ────────────────────────────────────────────── */
let _toastTimer = null;
function showToast(msg, duration = 2200){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(()=>t.classList.remove('show'), duration);
}

/* ══════════════════════════════════════════════
   个人 KB 演示数据（02-personal-home.html 专用）
   · 87 份资料分 5 个文件夹
   · 8 个 AI Wiki（4 数学知识点 + 2 教学方法 + 2 学情分析）
   ══════════════════════════════════════════════ */
const PERSONAL_KB_DATA = {
  folders: [
    { id:'lessons', name:'教案 / 课件', count:18 },
    { id:'tests',   name:'试卷 / 习题', count:24 },
    { id:'class',   name:'学情 / 学生作业', count:16 },
    { id:'notes',   name:'笔记 / 备课参考', count:14 },
    { id:'other',   name:'其他', count:15 },
  ],
  /* 每个文件夹的演示文件（每个文件夹列 8-10 条，剩下作"还有 N 条"占位） */
  files: {
    lessons: [
      { name:'二次函数第二课时·导入与图像.pptx', icon:'presentation', source:'张老师', time:'今天 10:42', size:'8.2 MB', wiki:'二次函数核心考点' },
      { name:'相似三角形判定·公开课设计.docx', icon:'file-text', source:'张老师', time:'昨天 16:08', size:'1.4 MB', wiki:'相似三角形判定与应用' },
      { name:'一元二次方程·配方法教学设计.docx', icon:'file-text', source:'张老师', time:'12-09 09:31', size:'860 KB', wiki:'一元二次方程根的判别式' },
      { name:'圆的切线性质·教学动画.mp4', icon:'video', source:'张老师', time:'12-05 14:22', size:'34 MB', wiki:'圆与三角形综合' },
      { name:'二次函数对称轴·板书图.jpg', icon:'image', source:'张老师', time:'12-03 11:08', size:'2.1 MB', wiki:'二次函数核心考点' },
      { name:'相似三角形·实际应用例题.pptx', icon:'presentation', source:'张老师', time:'11-28 17:50', size:'5.6 MB', wiki:'相似三角形判定与应用' },
      { name:'函数综合·中考压轴专题.pptx', icon:'presentation', source:'张老师', time:'11-22 10:40', size:'9.8 MB', wiki:null },
      { name:'圆的辅助线·常用套路.docx', icon:'file-text', source:'张老师', time:'11-18 15:20', size:'620 KB', wiki:'圆与三角形综合' },
      { name:'勾股定理·章末复习课件.pptx', icon:'presentation', source:'张老师', time:'11-12 09:00', size:'7.4 MB', wiki:null },
    ],
    tests: [
      { name:'八(3)班·二次函数周测卷.pdf', icon:'file', source:'张老师', time:'今天 09:18', size:'1.8 MB', wiki:'二次函数核心考点' },
      { name:'海淀 2026 一模卷·数学.pdf', icon:'file', source:'网络资料', time:'昨天 21:30', size:'3.2 MB', wiki:null },
      { name:'相似三角形·专项练习 30 题.docx', icon:'file-text', source:'张老师', time:'12-10 14:00', size:'1.1 MB', wiki:'相似三角形判定与应用' },
      { name:'一元二次方程·根的判别式分层练习.docx', icon:'file-text', source:'张老师', time:'12-07 19:42', size:'780 KB', wiki:'一元二次方程根的判别式' },
      { name:'圆·中考真题汇编 2020-2025.pdf', icon:'file', source:'网络资料', time:'12-04 10:15', size:'5.6 MB', wiki:'圆与三角形综合' },
      { name:'函数综合·压轴模拟 10 套.pdf', icon:'file', source:'网络资料', time:'11-30 16:48', size:'4.4 MB', wiki:null },
      { name:'二次函数·配套习题汇编.pdf', icon:'file', source:'张老师', time:'11-25 11:30', size:'2.9 MB', wiki:'二次函数核心考点' },
      { name:'相似三角形·错题精选.docx', icon:'file-text', source:'张老师', time:'11-19 17:55', size:'520 KB', wiki:'相似三角形判定与应用' },
      { name:'八(3)班·期中数学卷及答案.pdf', icon:'file', source:'教研组', time:'11-10 08:20', size:'2.3 MB', wiki:null },
    ],
    class: [
      { name:'八(3)班·作业完成情况周表.xlsx', icon:'sheet', source:'飞象自动汇总', time:'今天 07:15', size:'180 KB', wiki:'本学期作业完成质量趋势' },
      { name:'八(3)班·二次函数单元错题集.pdf', icon:'file', source:'张老师', time:'昨天 22:08', size:'1.2 MB', wiki:'八(3)班数学薄弱点画像' },
      { name:'张明·上周周测错题分析.docx', icon:'file-text', source:'张老师', time:'12-08 18:25', size:'340 KB', wiki:'八(3)班数学薄弱点画像' },
      { name:'李婷·学情访谈记录.docx', icon:'file-text', source:'张老师', time:'12-02 14:50', size:'180 KB', wiki:'八(3)班数学薄弱点画像' },
      { name:'班级学情·月度趋势图.png', icon:'image', source:'飞象自动生成', time:'11-30 23:00', size:'920 KB', wiki:'本学期作业完成质量趋势' },
      { name:'八(3)班·相似三角形错因统计.xlsx', icon:'sheet', source:'飞象自动汇总', time:'11-26 16:33', size:'120 KB', wiki:'八(3)班数学薄弱点画像' },
      { name:'家长会·学情汇报材料.pptx', icon:'presentation', source:'张老师', time:'11-18 09:40', size:'4.2 MB', wiki:null },
      { name:'八(3)班·上学期总评分析.docx', icon:'file-text', source:'张老师', time:'10-28 11:15', size:'420 KB', wiki:'本学期作业完成质量趋势' },
    ],
    notes: [
      { name:'王老师·公开课听课记录.docx', icon:'file-text', source:'张老师', time:'12-11 15:42', size:'160 KB', wiki:null },
      { name:'教研组·二次函数研讨纪要.docx', icon:'file-text', source:'教研组', time:'12-06 17:10', size:'220 KB', wiki:'二次函数核心考点' },
      { name:'分层练习设计法·学习笔记.docx', icon:'file-text', source:'张老师', time:'11-29 21:50', size:'140 KB', wiki:'分层练习设计法' },
      { name:'错题归因·四类错误分类法.docx', icon:'file-text', source:'张老师', time:'11-23 19:08', size:'180 KB', wiki:'错题归因模板' },
      { name:'课堂提问技巧·心得整理.docx', icon:'file-text', source:'张老师', time:'11-15 22:30', size:'95 KB', wiki:null },
      { name:'数学组教研周报·11月.pdf', icon:'file', source:'教研组', time:'11-30 12:00', size:'380 KB', wiki:null },
      { name:'相似三角形·教学反思.docx', icon:'file-text', source:'张老师', time:'11-12 21:00', size:'110 KB', wiki:'相似三角形判定与应用' },
      { name:'命题趋势·近 5 年中考分析.docx', icon:'file-text', source:'张老师', time:'10-30 14:20', size:'520 KB', wiki:null },
    ],
    other: [
      { name:'课程标准·初中数学.pdf', icon:'file', source:'官方文件', time:'09-01 09:00', size:'1.8 MB', wiki:null },
      { name:'中考考纲·2026 版.pdf', icon:'file', source:'官方文件', time:'09-15 10:30', size:'2.4 MB', wiki:null },
      { name:'教学计划·本学期数学.docx', icon:'file-text', source:'张老师', time:'09-08 08:20', size:'180 KB', wiki:null },
      { name:'本学期教学反思·上半.docx', icon:'file-text', source:'张老师', time:'10-30 22:00', size:'320 KB', wiki:null },
      { name:'飞象使用指南.pdf', icon:'file', source:'飞象官方', time:'你加入飞象时', size:'1.2 MB', wiki:null, isGuide:true },
      { name:'校历·2025-2026 学年.pdf', icon:'file', source:'学校', time:'08-25 11:00', size:'180 KB', wiki:null },
      { name:'安全教育材料.pdf', icon:'file', source:'学校', time:'08-30 14:00', size:'420 KB', wiki:null },
    ],
  },
  /* 每个文件夹关联的 wiki（演示给文件夹视图顶部 chips） */
  wikiByFolder: {
    lessons: ['二次函数核心考点', '相似三角形判定与应用', '圆与三角形综合'],
    tests:   ['二次函数核心考点', '相似三角形判定与应用', '一元二次方程根的判别式'],
    class:   ['八(3)班数学薄弱点画像', '本学期作业完成质量趋势'],
    notes:   ['分层练习设计法', '错题归因模板'],
    other:   [],
  },
};

/* 文件类型 icon 映射（lucide name） */
const FILE_ICON_MAP = {
  'file-text':'file-text', 'file':'file', 'presentation':'presentation',
  'sheet':'sheet', 'video':'video', 'image':'image',
};

let _personalCurrentFolder = 'lessons';

/* 渲染左侧文件夹树 */
function renderPersonalFolderTree(){
  const tree = document.getElementById('personal-folder-tree');
  if(!tree) return;
  tree.innerHTML = PERSONAL_KB_DATA.folders.map(f => `
    <li class="${f.id === _personalCurrentFolder ? 'active' : ''}">
      <div class="fv-tree-item" data-level="1" onclick="personalOpenFolder('${f.id}')">
        <i data-lucide="circle" class="ti-caret hide"></i>
        <i data-lucide="folder" class="ti-icon"></i>
        <span class="ti-name">${f.name}</span>
        <span class="ti-count">${f.count}</span>
      </div>
    </li>
  `).join('');
  if(window.lucide) lucide.createIcons();
}

/* 渲染右侧文件列表（按当前文件夹） */
function renderPersonalFiles(folderId){
  const folder = PERSONAL_KB_DATA.folders.find(f => f.id === folderId);
  if(!folder) return;

  /* 面包屑当前 */
  const cur = document.getElementById('personal-current-folder');
  const meta = document.getElementById('personal-current-meta');
  if(cur)  cur.textContent  = folder.name;
  if(meta) meta.textContent = `${folder.count} 份资料`;

  /* 关联 Wiki chips */
  const wikiList = PERSONAL_KB_DATA.wikiByFolder[folderId] || [];
  const chipsCountEl = document.getElementById('personal-wiki-chip-count');
  const chipsListEl  = document.getElementById('personal-wiki-chips-list');
  const chipsContainer = document.getElementById('personal-wiki-chips');
  if(chipsContainer) chipsContainer.style.display = wikiList.length ? '' : 'none';
  if(chipsCountEl) chipsCountEl.textContent = `${wikiList.length} 个 Wiki`;
  if(chipsListEl){
    chipsListEl.innerHTML = wikiList.map(name => `
      <a class="fwc-chip" onclick="openWiki('${name}')">
        <i data-lucide="book-open"></i>
        <span>${name}</span>
      </a>
    `).join('');
  }

  /* 文件列表 */
  const files = PERSONAL_KB_DATA.files[folderId] || [];
  const tbody = document.getElementById('personal-file-tbody');
  if(!tbody) return;
  const rows = files.map((f, i) => {
    const wikiCell = f.wiki
      ? `<a class="wlink" onclick="event.stopPropagation();openWiki('${f.wiki}')">${f.wiki}</a>`
      : `<span class="fv-no-wiki">—</span>`;
    return `
      <tr onclick="showToast('（演示）预览《${f.name}》')">
        <td class="col-name">
          <i data-lucide="${FILE_ICON_MAP[f.icon] || 'file'}"></i>
          ${f.name}
          ${f.isGuide ? '<span class="fv-tag-guide">官方</span>' : ''}
        </td>
        <td>${f.source}</td>
        <td>${f.time}</td>
        <td>${f.size}</td>
        <td>${wikiCell}</td>
      </tr>
    `;
  }).join('');

  const moreCount = folder.count - files.length;
  const moreRow = moreCount > 0 ? `
    <tr class="more" onclick="showToast('（演示）展开剩余 ${moreCount} 份资料')">
      <td class="col-name" colspan="5"><i data-lucide="more-horizontal"></i> …还有 ${moreCount} 份资料</td>
    </tr>
  ` : '';

  tbody.innerHTML = rows + moreRow;

  /* 同步左侧 tree 的 active 状态 */
  document.querySelectorAll('#personal-folder-tree li').forEach(li => {
    const item = li.querySelector('.fv-tree-item');
    const name = item && item.querySelector('.ti-name');
    li.classList.toggle('active', name && name.textContent.trim() === folder.name);
  });

  if(window.lucide) lucide.createIcons();
}

function personalOpenFolder(folderId){
  _personalCurrentFolder = folderId;
  renderPersonalFiles(folderId);
}

/* 一键清空所有演示数据（个人 KB 主页）
   · 淡出 Wiki 视图的 demo-zone（米色 callout 容器）
   · 清空文件夹视图的所有文件
   · Hero 数字归零 + 文案换成"已清空" */
function clearDemoData(){
  if(!confirmDemo('这会清空所有演示数据（87 份资料 + 16 个 Wiki），仅在本次演示中生效。继续吗？')) return;

  PERSONAL_KB_DATA.folders.forEach(f => { f.count = 0; });
  Object.keys(PERSONAL_KB_DATA.files).forEach(k => { PERSONAL_KB_DATA.files[k] = []; });
  renderPersonalFolderTree();
  renderPersonalFiles(_personalCurrentFolder);

  const demoZone = document.getElementById('demo-zone');
  if(demoZone){
    demoZone.style.opacity = '0';
    demoZone.style.transform = 'translateY(-6px)';
    setTimeout(() => demoZone.remove(), 420);
  }

  const heroSub = document.getElementById('hero-sub');
  if(heroSub) heroSub.innerHTML = '你的私人 AI 工作台。<b>演示数据已清空</b>，上传几份资料试试，AI 会帮你自动整理 Wiki。';
  const heroCount = document.getElementById('hero-count');
  if(heroCount) heroCount.textContent = '0';

  showToast('已清空演示数据');
}

/* 极简版 confirm（demo 用，不写自定义 modal） */
function confirmDemo(msg){
  return window.confirm(msg);
}

/* ──────────────────────────────────────────────
   初始化
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if(window.lucide) lucide.createIcons();

  const ta = document.getElementById('ai-textarea');
  if(ta){
    ta.addEventListener('input', () => autosize(ta));
    ta.addEventListener('keydown', e => {
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        sendMessage();
      }
    });
  }

  refreshBarSend();

  /* 个人 KB 主页：初始化文件夹树 + 默认文件列表 */
  if(document.body.dataset.page === 'personal-home'){
    renderPersonalFolderTree();
    renderPersonalFiles(_personalCurrentFolder);
  }

  /* Wiki 条目页：1:1 双栏阅读，左栏永久 collapsed 让出空间 */
  if(document.body.dataset.page === 'wiki-entry' && app){
    app.dataset.left = 'collapsed';
  }

  const params = new URLSearchParams(window.location.search);
  if(params.get('imported') === '1'){
    showToast('（演示）导入完成，资料已更新到当前知识库', 2600);
    params.delete('imported');
    const query = params.toString();
    const base = window.location.pathname.split('/').pop() || '02-wiki-home.html';
    const cleanUrl = query ? `${base}?${query}` : base;
    window.history.replaceState({}, '', cleanUrl);
  }

  /* 跨页对话路由：从历史页跳回工作台后再进入对话态 */
  const pageId = document.body.dataset.page || '';
  if(pageId === 'wiki-home' || pageId === 'personal-home'){
    const chatMode = params.get('chat');
    const initial = params.get('initial') || '';
    if(chatMode === 'resume'){
      openChat('resume');
    } else if(chatMode === 'new'){
      openChat('new', initial);
    }
  }

  document.addEventListener('keydown', e => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      openTopSearch();
    }
    if((e.metaKey || e.ctrlKey) && e.key === '\\'){
      e.preventDefault();
      toggleSide('left');
    }
    if(e.key === 'Escape' && app.dataset.chat === 'open'){
      closeChat();
    }
    if(e.key === 'Escape'){
      closeAccountMenus();
      closeTopSearch();
    }
  });

  document.addEventListener('click', e => {
    if(!e.target.closest('.sb-account')) closeAccountMenus();
    if(!e.target.closest('.top-search-panel') && !e.target.closest('.tb-search')) closeTopSearch();
  });
});
