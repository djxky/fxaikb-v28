/* ========================================================
   飞象 AI · v28 — 公共文件夹视图
   目标：FolderView 只维护一份，页面只提供容器和可选数据。
   ======================================================== */

(function(){
  const DEFAULT_FOLDER_DATA = {
    root: {
      label: '二次函数',
      meta: '12 份资料 · 2 子文件夹 + 8 文件',
      wikiCount: '2 个 Wiki',
      wikiChips: [
        { label:'二次函数图像与性质', action:"switchView('wiki','二次函数图像与性质')" },
        { label:'二次函数应用题', action:"openWiki('二次函数应用题')" },
      ],
      rows: [
        { type:'folder', id:'ppt', icon:'folder', name:'PPT 课件', size:'4 份', title:'进入「PPT 课件」子文件夹' },
        { type:'folder', id:'exercises', icon:'folder', name:'习题资料', size:'5 份', title:'进入「习题资料」子文件夹' },
        { icon:'presentation', name:'二次函数·导入课件.pptx', by:'张老师', time:'5 天前', size:'4.2 MB', wiki:'二次函数图像与性质', title:'预览原文件 · 左 PPT / 右 AI 摘要 1:1' },
        { icon:'file-text', name:'教学设计·二次函数.docx', by:'张老师', time:'5 天前', size:'340 KB', wiki:'二次函数图像与性质' },
        { icon:'file-text', name:'海淀区 2026 一模卷·数学.pdf', by:'李素芬', time:'1 周前', size:'1.2 MB', wiki:'二次函数 · 圆 · 相似' },
        { icon:'image', name:'王建华·公开课板书（4 张）', by:'王建华', time:'2 周前', size:'3.6 MB', wiki:'二次函数图像与性质' },
        { icon:'file-text', name:'赵明杰·错题剖析.docx', by:'赵明杰', time:'2 周前', size:'220 KB', wiki:'二次函数 · 一元二次方程' },
        { icon:'clipboard-list', name:'八(3)班·错题精选.xlsx', by:'张老师', time:'3 周前', size:'180 KB', wiki:'二次函数图像与性质' },
        { icon:'folder-archive', name:'北京中考真题 2021-2025（5 份）', by:'学校公共库', time:'3 周前', size:'12 MB', wiki:'21 个词条' },
        { type:'more', label:'…还有 2 份文件' },
      ],
    },
    subfolders: {
      ppt: {
        label: 'PPT 课件',
        meta: '4 份 PPT 文件',
        rows: [
          { icon:'presentation', name:'二次函数·导入课件.pptx', by:'张老师', time:'5 天前', size:'4.2 MB', wiki:'二次函数图像与性质', title:'预览原文件 · 左 PPT / 右 AI 摘要 1:1' },
          { icon:'presentation', name:'抛物线图像专题.pptx', by:'李素芬', time:'2 周前', size:'3.1 MB', wiki:'二次函数图像与性质' },
          { icon:'presentation', name:'顶点公式推导.pptx', by:'王建华', time:'3 周前', size:'1.8 MB', wiki:'二次函数图像与性质' },
          { icon:'presentation', name:'复习课·二次函数总结.pptx', by:'张老师', time:'1 个月前', size:'2.4 MB', wiki:'二次函数图像与性质' },
        ],
      },
    },
  };

  function data(){
    return window.V28_FOLDER_DATA || DEFAULT_FOLDER_DATA;
  }

  function esc(value){
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[char]));
  }

  function wikiCell(label){
    return `<a class="wlink" onclick="event.stopPropagation();switchView('wiki','二次函数图像与性质')">${esc(label)}</a>`;
  }

  function renderRows(rows){
    return rows.map(row => {
      if(row.type === 'folder'){
        return `
          <tr class="fv-row-folder" onclick="enterSubfolder('${esc(row.id)}')" title="${esc(row.title || '')}">
            <td class="col-name"><i data-lucide="${esc(row.icon || 'folder')}"></i> ${esc(row.name)}</td>
            <td class="fv-cell-dash">—</td>
            <td class="fv-cell-dash">—</td>
            <td>${esc(row.size)}</td>
            <td class="fv-cell-dash">—</td>
          </tr>
        `;
      }
      if(row.type === 'more'){
        return `
          <tr class="more" onclick="showToast('（演示）展开剩余文件')">
            <td class="col-name" colspan="5"><i data-lucide="more-horizontal"></i> ${esc(row.label)}</td>
          </tr>
        `;
      }
      return `
        <tr onclick="window.location.href='04-file-preview.html'" title="${esc(row.title || '演示：所有文件都进同一个 1:1 双栏预览页')}">
          <td class="col-name"><i data-lucide="${esc(row.icon || 'file-text')}"></i> ${esc(row.name)}</td>
          <td>${esc(row.by)}</td>
          <td>${esc(row.time)}</td>
          <td>${esc(row.size)}</td>
          <td>${wikiCell(row.wiki)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderTable(id, rows, hidden){
    return `
      <table class="fv-table" id="${id}"${hidden ? ' style="display:none"' : ''}>
        <thead>
          <tr>
            <th class="col-name">名称</th>
            <th class="col-by">上传者</th>
            <th class="col-time">上传时间</th>
            <th class="col-size">大小</th>
            <th class="col-wiki">关联词条</th>
          </tr>
        </thead>
        <tbody>${renderRows(rows)}</tbody>
      </table>
    `;
  }

  function renderFolderView(target, folderData = data()){
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if(!el) return;
    const root = folderData.root;
    const ppt = folderData.subfolders && folderData.subfolders.ppt;
    el.innerHTML = `
      <div class="fv-list">
        <div class="fv-list-head">
          <button class="fv-back-btn" id="fv-back-btn" onclick="exitSubfolder()" title="返回上级文件夹" style="display:none">
            <i data-lucide="arrow-left"></i>
          </button>
          <nav class="fv-breadcrumb" aria-label="路径">
            <a class="fv-bc-item" onclick="showToast('（演示）回到根目录')"><i data-lucide="library"></i> 教研组</a>
            <span class="fv-bc-sep">/</span>
            <a class="fv-bc-item" onclick="showToast('（演示）九年级')">九年级</a>
            <span class="fv-bc-sep">/</span>
            <a class="fv-bc-item" onclick="showToast('（演示）数学')">数学</a>
            <span class="fv-bc-sep">/</span>
            <span id="fv-bc-tail">
              <span class="fv-bc-current">${esc(root.label)}</span>
              <span class="fv-bc-meta">${esc(root.meta)}</span>
            </span>
          </nav>
          <div class="fv-tools">
            <button class="fv-tool" onclick="showToast('（演示）按上传时间 / 名称 / 大小排序')">
              <i data-lucide="arrow-up-down"></i> 排序
            </button>
            <button class="fv-tool" onclick="showToast('（演示）上传新文件')">
              <i data-lucide="upload"></i> 上传
            </button>
          </div>
        </div>

        <div class="fv-wiki-chips" id="fv-wiki-chips">
          <div class="fwc-label">
            <i data-lucide="sparkles"></i>
            <span>飞象把这组资料整理成了 <b>${esc(root.wikiCount)}</b></span>
          </div>
          <div class="fwc-chips">
            ${root.wikiChips.map(chip => `
              <a class="fwc-chip" onclick="${chip.action}">
                <i data-lucide="book-open"></i>
                <span>${esc(chip.label)}</span>
              </a>
            `).join('')}
          </div>
        </div>

        ${renderTable('fv-table-root', root.rows)}
        ${ppt ? renderTable('fv-table-ppt', ppt.rows, true) : ''}
      </div>
    `;
    if(window.lucide) lucide.createIcons();
  }

  function enterSubfolder(id){
    const folderData = data();
    const subfolder = folderData.subfolders && folderData.subfolders[id];
    const tableRoot = document.getElementById('fv-table-root');
    const tablePpt = document.getElementById('fv-table-ppt');
    const wikiChips = document.getElementById('fv-wiki-chips');
    const bcTail = document.getElementById('fv-bc-tail');
    const backBtn = document.getElementById('fv-back-btn');

    if(id === 'ppt' && subfolder){
      if(tableRoot) tableRoot.style.display = 'none';
      if(tablePpt) tablePpt.style.display = 'table';
      if(wikiChips) wikiChips.style.display = 'none';
      if(bcTail) bcTail.innerHTML = `
        <a class="fv-bc-item" onclick="exitSubfolder()" title="返回 ${esc(folderData.root.label)} 上级"><i data-lucide="folder"></i> ${esc(folderData.root.label)}</a>
        <span class="fv-bc-sep">/</span>
        <span class="fv-bc-current">${esc(subfolder.label)}</span>
        <span class="fv-bc-meta">${esc(subfolder.meta)}</span>
      `;
      if(backBtn) backBtn.style.display = 'inline-flex';
      if(window.lucide) lucide.createIcons();
      return;
    }

    const map = { exercises: '习题资料（5 份）' };
    if(typeof showToast === 'function'){
      showToast('（演示）进入「' + (map[id] || id) + '」子文件夹 · 完整 mock 数据待补');
    }
  }

  function exitSubfolder(){
    const folderData = data();
    const tableRoot = document.getElementById('fv-table-root');
    const tablePpt = document.getElementById('fv-table-ppt');
    const wikiChips = document.getElementById('fv-wiki-chips');
    const bcTail = document.getElementById('fv-bc-tail');
    const backBtn = document.getElementById('fv-back-btn');

    if(tableRoot) tableRoot.style.display = 'table';
    if(tablePpt) tablePpt.style.display = 'none';
    if(wikiChips) wikiChips.style.display = 'flex';
    if(bcTail) bcTail.innerHTML = `
      <span class="fv-bc-current">${esc(folderData.root.label)}</span>
      <span class="fv-bc-meta">${esc(folderData.root.meta)}</span>
    `;
    if(backBtn) backBtn.style.display = 'none';
    if(window.lucide) lucide.createIcons();
  }

  function boot(){
    renderFolderView('#view-folder');
  }

  window.renderFolderView = renderFolderView;
  window.enterSubfolder = enterSubfolder;
  window.exitSubfolder = exitSubfolder;

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
