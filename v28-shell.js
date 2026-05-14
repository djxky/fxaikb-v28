/* ========================================================
   飞象 AI · v28 — 公共壳渲染
   目标：让 Sidebar / Topbar / Search / AccountMenu 只维护一份。
   页面仍保留静态主内容，便于 demo 快速迭代。
   ======================================================== */

(function(){

  /* ────── 通知中心 · 轻面板（教研组共建 AI 沉淀回执） ────── */
  const NOTIFY_STYLE = `
    .notify-popover{
      position:fixed; top:54px; right:12px;
      width:min(360px, calc(100vw - 24px));
      max-height:min(440px, calc(100vh - 80px));
      background:var(--surface);
      border:1px solid var(--border);
      border-radius:14px;
      box-shadow:0 18px 48px -12px rgba(30,24,14,.22);
      z-index:118;
      display:flex; flex-direction:column;
      opacity:0; transform:translateY(-6px) scale(.98);
      pointer-events:none;
      transition:opacity .18s var(--ease, cubic-bezier(.4,0,.2,1)),
                 transform .18s var(--ease, cubic-bezier(.4,0,.2,1));
    }
    body[data-notify="open"] .notify-popover{
      opacity:1; transform:translateY(0) scale(1); pointer-events:auto;
    }
    .notify-popover::before{
      content:''; position:absolute; top:-7px; right:18px;
      width:12px; height:12px; transform:rotate(45deg);
      background:var(--surface);
      border-top:1px solid var(--border);
      border-left:1px solid var(--border);
    }
    .notify-head{
      padding:14px 16px 8px;
      display:flex; align-items:center; gap:8px;
      flex-shrink:0;
    }
    .notify-title{ font-size:13.5px; font-weight:700; color:var(--text); }
    .notify-count{
      font-size:11.5px; color:var(--gold-deep);
      background:var(--gold-bg); padding:2px 8px; border-radius:999px;
      font-weight:600;
    }
    .notify-clear{
      margin-left:auto; font-size:11.5px; color:var(--text-3);
      background:transparent; border:none; cursor:pointer;
      transition:color .15s;
    }
    .notify-clear:hover{ color:var(--gold-deep); }
    .notify-body{
      padding:0 8px 8px; overflow:auto; min-height:0;
    }
    .notify-item{
      display:flex; gap:10px; padding:10px 8px;
      border-radius:8px;
      cursor:pointer;
      transition:background .15s;
    }
    .notify-item:hover{ background:var(--surface-2); }
    .notify-item-icon{
      width:28px; height:28px; flex-shrink:0;
      border-radius:8px;
      display:grid; place-items:center;
      background:var(--gold-bg);
      color:var(--gold-deep);
    }
    .notify-item-icon [data-lucide]{ width:14px; height:14px; }
    .notify-item-body{ flex:1; min-width:0; }
    .notify-item-text{
      font-size:12.5px; line-height:1.55;
      color:var(--text-1);
    }
    .notify-item-text b{ color:var(--text); font-weight:600; }
    .notify-item-meta{
      margin-top:4px; font-size:11px; color:var(--text-4);
      display:flex; align-items:center; gap:6px;
    }
    .notify-foot{
      padding:8px 12px; border-top:1px solid var(--border);
      font-size:11.5px; color:var(--text-3); text-align:center;
      background:var(--surface-2);
      border-radius:0 0 14px 14px;
    }
    .notify-foot b{ color:var(--text-2); }
    .tb-btn[aria-expanded="true"]{
      background:var(--gold-bg);
      color:var(--gold-deep);
    }
    .tb-btn .notify-dot{
      position:absolute; top:7px; right:7px;
      width:7px; height:7px; border-radius:50%;
      background:var(--gold);
      border:1.5px solid var(--surface);
    }
    .tb-btn{ position:relative; }
  `;

  function ensureNotifyMounted(){
    if(document.getElementById('v28-notify-style')) return;
    const style = document.createElement('style');
    style.id = 'v28-notify-style';
    style.textContent = NOTIFY_STYLE;
    document.head.appendChild(style);

    const popover = document.createElement('aside');
    popover.className = 'notify-popover';
    popover.id = 'v28-notify-popover';
    popover.setAttribute('aria-hidden', 'true');
    popover.innerHTML = `
      <div class="notify-head">
        <span class="notify-title">今日教研组沉淀</span>
        <span class="notify-count">3 条</span>
        <button class="notify-clear" onclick="window.showToast && showToast('（演示）已全部标为已读')">全部已读</button>
      </div>
      <div class="notify-body">
        <div class="notify-item" onclick="window.showToast && showToast('（演示）跳转到「二次函数图像与性质」Wiki 页')">
          <div class="notify-item-icon"><i data-lucide="file-plus-2"></i></div>
          <div class="notify-item-body">
            <div class="notify-item-text">王老师上传 <b>《二次函数易错题 35 道》</b> → AI 已并入「二次函数图像与性质」</div>
            <div class="notify-item-meta"><i data-lucide="clock-3" style="width:11px;height:11px"></i><span>09:30 · 自动整理</span></div>
          </div>
        </div>
        <div class="notify-item" onclick="window.showToast && showToast('（演示）跳转到新建的「函数综合」Wiki 页')">
          <div class="notify-item-icon"><i data-lucide="sparkles"></i></div>
          <div class="notify-item-body">
            <div class="notify-item-text">李老师上传 <b>《圆与三角形综合》</b> → AI 已新建「函数综合」Wiki 页</div>
            <div class="notify-item-meta"><i data-lucide="clock-3" style="width:11px;height:11px"></i><span>11:45 · 自动整理</span></div>
          </div>
        </div>
        <div class="notify-item" onclick="window.showToast && showToast('（演示）查看「圆与三角形综合 §4」修订记录')">
          <div class="notify-item-icon" style="background:rgba(168,126,44,.08)"><i data-lucide="refresh-cw"></i></div>
          <div class="notify-item-body">
            <div class="notify-item-text">刘老师反馈 <b>"这段整理错了"</b> → AI 已重新整理「圆与三角形综合 §4」</div>
            <div class="notify-item-meta"><i data-lucide="clock-3" style="width:11px;height:11px"></i><span>14:20 · 老师反馈</span></div>
          </div>
        </div>
      </div>
      <div class="notify-foot">
        本周教研组累计 <b>+12 份资料</b> · AI 自动整理 <b>18 次</b> · 老师纠错 <b>3 次</b>
      </div>
    `;
    document.body.appendChild(popover);
    if(window.lucide) lucide.createIcons();

    document.addEventListener('click', (event) => {
      if(document.body.dataset.notify !== 'open') return;
      if(event.target.closest('#v28-notify-popover')) return;
      if(event.target.closest('.tb-btn[data-notify-toggle]')) return;
      closeNotifyPanel();
    });

    document.addEventListener('keydown', (event) => {
      if(event.key === 'Escape' && document.body.dataset.notify === 'open'){
        closeNotifyPanel();
      }
    });
  }

  function toggleNotifyPanel(event){
    if(event){ event.stopPropagation(); }
    ensureNotifyMounted();
    if(document.body.dataset.notify === 'open'){
      closeNotifyPanel();
    } else {
      openNotifyPanel();
    }
  }

  function openNotifyPanel(){
    document.body.dataset.notify = 'open';
    const popover = document.getElementById('v28-notify-popover');
    if(popover) popover.setAttribute('aria-hidden', 'false');
    document.querySelectorAll('.tb-btn[data-notify-toggle]').forEach(btn => btn.setAttribute('aria-expanded', 'true'));
  }

  function closeNotifyPanel(){
    delete document.body.dataset.notify;
    const popover = document.getElementById('v28-notify-popover');
    if(popover) popover.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.tb-btn[data-notify-toggle]').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
  }

  window.toggleNotifyPanel = toggleNotifyPanel;
  window.closeNotifyPanel = closeNotifyPanel;

  const KB_ITEMS = [
    { id:'personal', name:'我的知识库', count:'87', icon:'bookmark', tip:'我的知识库 · 87 份', onclick:"switchKb('personal','张老师 · 个人',87)" },
    { type:'group', label:'团队知识库', className:'sb-group-label-muted' },
    { id:'math-group', name:'初中数学教研组', count:'925', icon:'users-round', tip:'初中数学教研组 · 925 份', onclick:"switchKb('math-group','初中数学教研组',925)" },
    { id:'school', name:'北京 101 中学', count:'1,247', icon:'school', onclick:"switchKb('school','北京 101 中学 · 公共库',1247)" },
    { id:'grade-2', name:'初二数学备课组', count:'412', icon:'book-marked', onclick:"switchKb('grade-2','初二数学备课组',412)" },
    { id:'grade-3', name:'初三数学备课组', count:'531', icon:'book-marked', onclick:"switchKb('grade-3','初三数学备课组',531)" },
    { type:'divider', className:'sb-nav-divider' },
    { id:'ai-qbank', name:'AI 题库', icon:'file-stack', className:'sb-ai-qbank', tip:'AI 题库', onclick:"navTo('qbank')" },
  ];

  function getPageId(){
    if(document.body.dataset.page) return document.body.dataset.page;
    const file = (location.pathname.split('/').pop() || '').replace('.html','');
    if(file === '02-wiki-home') return 'wiki-home';
    return file || 'wiki-home';
  }

  function getActiveKb(pageId){
    return pageId === 'personal-home' ? 'personal' : 'math-group';
  }

  function getTopbarKb(pageId){
    if(pageId === 'personal-home'){
      return { name:'张老师 · 个人知识库', icon:'bookmark' };
    }
    return { name:'初中数学教研组', icon:'library' };
  }

  function getActiveView(pageId){
    if(pageId === 'file-preview') return 'folder';
    if(pageId !== 'wiki-entry') return 'wiki';
    const view = new URLSearchParams(location.search).get('view');
    return view || (document.getElementById('app')?.dataset.view || 'wiki');
  }

  function renderSidebar(){
    const sidebar = document.getElementById('v28-sidebar');
    if(!sidebar) return;
    const pageId = getPageId();
    const activeKb = getActiveKb(pageId);
    const moduleOnlyPages = new Set(['ai-qbank', 'chat-history']);
    const kbHtml = KB_ITEMS.map(item => {
      if(item.type === 'group') return `<div class="sb-group-label ${item.className || ''}">${item.label}</div>`;
      if(item.type === 'divider') return `<div class="${item.className || 'sb-nav-divider'}" aria-hidden="true"></div>`;
      const isQbankPage = pageId === 'ai-qbank' && item.id === 'ai-qbank';
      const isKbActive = !moduleOnlyPages.has(pageId) && item.id === activeKb;
      const active = (isKbActive || isQbankPage) ? ' active' : '';
      const extra = item.className ? ` ${item.className}` : '';
      const count = item.count ? `<span class="kb-count">${item.count}</span>` : '';
      const tip = item.tip ? `<span class="sb-tip">${item.tip}</span>` : '';
      return `
        <button class="sb-kb${extra}${active}" data-kb="${item.id}" onclick="${item.onclick}">
          <i data-lucide="${item.icon}"></i>
          <span class="kb-name">${item.name}</span>
          ${count}
          ${tip}
        </button>
      `;
    }).join('');

    sidebar.innerHTML = `
      <div class="sb-brand">
        <div class="sb-brand-mark" title="飞象 AI">FX</div>
        <div class="sb-brand-name">飞象 AI</div>
        <button class="sb-collapse-btn" onclick="toggleSide('left')" title="收起 / 展开 (⌘\\)">
          <i data-lucide="panel-left-close" id="left-icon"></i>
        </button>
      </div>

      <button class="sb-new-chat" onclick="openChat('new')">
        <i data-lucide="message-square-plus"></i>
        <span class="sb-new-chat-label">新对话</span>
        <span class="sb-tip">新对话</span>
      </button>
      <button class="sb-item sb-chat-entry${pageId === 'chat-history' ? ' active' : ''}" id="sb-chat" onclick="openChat('history')">
        <i data-lucide="message-square-text"></i>
        <span class="sb-item-label">历史对话</span>
        <span class="sb-tip">历史对话</span>
      </button>
      <div class="sb-divider" aria-hidden="true"></div>

      <div class="sb-scroll">
        <div class="sb-section">
          ${kbHtml}
        </div>
      </div>

      <div class="sb-foot">
        <div class="sb-account">
          <button class="sb-user" onclick="toggleAccountMenu(event)" aria-haspopup="menu" aria-expanded="false">
            <span class="sb-avatar">张</span>
            <span class="sb-user-name">张老师</span>
            <i data-lucide="chevron-up"></i>
            <span class="sb-tip">张老师</span>
          </button>
          <div class="sb-account-menu" role="menu" aria-label="张老师账号菜单">
            <button type="button" role="menuitem" onclick="accountMenuAction('个人信息')">
              <i data-lucide="user-round"></i>
              <span>个人信息</span>
            </button>
            <button type="button" role="menuitem" onclick="accountMenuAction('设置')">
              <i data-lucide="settings"></i>
              <span>设置</span>
            </button>
            <button type="button" role="menuitem" onclick="accountMenuAction('账号与安全')">
              <i data-lucide="shield-check"></i>
              <span>账号与安全</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function viewButton(view, label, icon, active, onclick, title = ''){
    const activeClass = active ? ' active' : '';
    const titleAttr = title ? ` title="${title}"` : '';
    return `
      <button class="vs-btn${activeClass}" data-view="${view}" onclick="${onclick}"${titleAttr}>
        <i data-lucide="${icon}"></i>
        ${label}
      </button>
    `;
  }

  function renderTopbar(){
    const topbar = document.getElementById('v28-topbar');
    if(!topbar) return;
    const pageId = getPageId();
    const activeView = getActiveView(pageId);
    const kb = getTopbarKb(pageId);

    if(pageId === 'ai-qbank'){
      topbar.innerHTML = `
        <div class="tb-spacer"></div>
        <button class="tb-search" onclick="toggleTopSearch(event)" aria-expanded="false">
          <i data-lucide="search"></i>
          <span>搜索题目、文件…</span>
        </button>
        <button class="tb-btn" data-notify-toggle onclick="toggleNotifyPanel(event)" aria-haspopup="true" aria-expanded="false" title="通知 · 今日 3 条">
          <i data-lucide="bell"></i>
          <span class="notify-dot" aria-hidden="true"></span>
        </button>
      `;
      return;
    }

    if(pageId === 'chat-history'){
      topbar.innerHTML = `
        <div class="tb-spacer"></div>
        <button class="tb-search" onclick="toggleTopSearch(event)" aria-expanded="false">
          <i data-lucide="search"></i>
          <span>搜索对话、文件…</span>
        </button>
        <button class="tb-btn" data-notify-toggle onclick="toggleNotifyPanel(event)" aria-haspopup="true" aria-expanded="false" title="通知 · 今日 3 条">
          <i data-lucide="bell"></i>
          <span class="notify-dot" aria-hidden="true"></span>
        </button>
      `;
      return;
    }

    let buttons;
    if(pageId === 'file-preview'){
      buttons = [
        viewButton('wiki', 'Wiki', 'book-open', false, "window.location.href='02-wiki-home.html'", '回 Wiki 首页'),
        viewButton('graph', '知识图谱', 'network', false, "window.location.href='03-wiki-entry.html?view=graph'", '回知识图谱视图'),
        viewButton('folder', '文件夹', 'folder', true, "window.location.href='03-wiki-entry.html?view=folder'", '回到 文件夹视图'),
      ].join('');
    } else {
      const wikiAction = pageId === 'wiki-entry'
        ? "switchView('wiki','二次函数图像与性质')"
        : "switchView('wiki')";
      buttons = [
        viewButton('wiki', 'Wiki', 'book-open', activeView === 'wiki', wikiAction),
        viewButton('graph', '知识图谱', 'network', activeView === 'graph', pageId === 'wiki-entry' ? "switchView('graph','二次函数图像与性质')" : "switchView('graph')"),
        viewButton('folder', '文件夹', 'folder', activeView === 'folder', pageId === 'wiki-entry' ? "switchView('folder','二次函数图像与性质')" : "switchView('folder')"),
      ].join('');
    }

    topbar.innerHTML = `
      <span class="tb-kb-current" id="tb-kb-current">
        <i data-lucide="${kb.icon}"></i>
        <span class="tb-kb-name" id="tb-kb-name">${kb.name}</span>
      </span>
      <div class="view-switcher" role="tablist">
        ${buttons}
      </div>
      <div class="tb-spacer"></div>
      <button class="tb-search" onclick="toggleTopSearch(event)" aria-expanded="false">
        <i data-lucide="search"></i>
        <span>搜索 Wiki、文件…</span>
      </button>
      <button class="tb-btn" data-notify-toggle onclick="toggleNotifyPanel(event)" aria-haspopup="true" aria-expanded="false" title="通知 · 今日 3 条">
        <i data-lucide="bell"></i>
        <span class="notify-dot" aria-hidden="true"></span>
      </button>
    `;
  }

  function renderV28Shell(){
    renderSidebar();
    renderTopbar();
    ensureNotifyMounted();
    if(window.lucide) lucide.createIcons();
  }

  document.addEventListener('DOMContentLoaded', renderV28Shell);
  window.renderV28Shell = renderV28Shell;
})();
