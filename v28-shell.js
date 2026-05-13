/* ========================================================
   飞象 AI · v28 — 公共壳渲染
   目标：让 Sidebar / Topbar / Search / AccountMenu 只维护一份。
   页面仍保留静态主内容，便于 demo 快速迭代。
   ======================================================== */

(function(){
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
    const kbHtml = KB_ITEMS.map(item => {
      if(item.type === 'group') return `<div class="sb-group-label ${item.className || ''}">${item.label}</div>`;
      if(item.type === 'divider') return `<div class="${item.className || 'sb-nav-divider'}" aria-hidden="true"></div>`;
      const active = item.id === activeKb ? ' active' : '';
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
      <button class="sb-item sb-chat-entry" id="sb-chat" onclick="openChat('history')">
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
      <button class="tb-btn" onclick="showToast('（演示）打开通知中心')" title="通知">
        <i data-lucide="bell"></i>
      </button>
    `;
  }

  function renderV28Shell(){
    renderSidebar();
    renderTopbar();
    if(window.lucide) lucide.createIcons();
  }

  document.addEventListener('DOMContentLoaded', renderV28Shell);
  window.renderV28Shell = renderV28Shell;
})();
