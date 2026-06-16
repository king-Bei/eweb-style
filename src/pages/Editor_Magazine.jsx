import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi, itineraryApi } from '../api';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FilePlus2,
  FileText,
  GripVertical,
  Image,
  MonitorCheck,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2
} from 'lucide-react';

const getStorageKey = itineraryId => `brochure_builder_project_v1_${itineraryId || 'draft'}`;

const transitionOptions = [
  { value: 'fade-up', label: '淡入上升' },
  { value: 'slide-left', label: '由左滑入' },
  { value: 'slide-right', label: '由右滑入' },
  { value: 'zoom', label: '縮放進場' },
  { value: 'none', label: '無動畫' }
];

const transitionCss = `
  .builder-transition { animation-duration: .75s; animation-fill-mode: both; animation-timing-function: cubic-bezier(.2,.8,.2,1); }
  .builder-transition-fade-up { animation-name: builderFadeUp; }
  .builder-transition-slide-left { animation-name: builderSlideLeft; }
  .builder-transition-slide-right { animation-name: builderSlideRight; }
  .builder-transition-zoom { animation-name: builderZoom; }
  @keyframes builderFadeUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:none } }
  @keyframes builderSlideLeft { from { opacity:0; transform:translateX(-50px) } to { opacity:1; transform:none } }
  @keyframes builderSlideRight { from { opacity:0; transform:translateX(50px) } to { opacity:1; transform:none } }
  @keyframes builderZoom { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:none } }
`;

const koweiHostCss = `
  html { font-size: 16px; }
  body {
    margin: 0;
    min-width: 320px;
    color: #333;
    background: #fff;
    font-family: Arial, "Microsoft JhengHei", sans-serif;
    line-height: 1.6;
  }
  body * { box-sizing: border-box; }
  body img { max-width: 100%; height: auto; vertical-align: middle; }
  body h1, body h2, body h3, body h4, body p { margin-top: 0; }
  body a { color: #1367a8; text-decoration: none; }
  body button, body input, body textarea, body select { font: inherit; }
  .kowei-host-shell {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    overflow: hidden;
    background: #fff;
  }
  .kowei-host-content { width: 100%; overflow-x: hidden; }
`;

const getCompatibilityIssues = (pages, headHtml) => {
  const combinedHtml = `${headHtml}\n${pages.map(page => page.html).join('\n')}`;
  const issues = [];
  const localUrls = combinedHtml.match(/(?:src|href)=["'](?:file:|blob:|http:\/\/localhost|http:\/\/127\.0\.0\.1|\/Users\/)[^"']*/gi) || [];
  const insecureUrls = combinedHtml.match(/(?:src|href)=["']http:\/\/(?!localhost|127\.0\.0\.1)[^"']*/gi) || [];
  const missingImageUrls = pages.reduce((count, page) => {
    const documentNode = new DOMParser().parseFromString(page.html, 'text/html');
    return count + [...documentNode.querySelectorAll('img')].filter(image => !image.getAttribute('src')?.trim()).length;
  }, 0);

  if (/cdn\.tailwindcss\.com/.test(combinedHtml)) {
    issues.push({ level: 'warning', text: '依賴 Tailwind CDN；若科威封鎖外部 Script，utility 樣式會失效。' });
  }
  if (/<script[\s>]/i.test(combinedHtml)) {
    issues.push({ level: 'warning', text: '內容含 JavaScript；若科威編輯器會移除 Script，動畫與導覽功能將不執行。' });
  }
  if (/(^|[},\s])body\s*[,{]|::-webkit-scrollbar|\*\s*\{/im.test(combinedHtml)) {
    issues.push({ level: 'warning', text: '偵測到全域 CSS，貼入科威既有頁面時可能影響網站頁首、頁尾或其他內容。' });
  }
  if (/\b(?:w-screen|100vw)\b/.test(combinedHtml)) {
    issues.push({ level: 'warning', text: '部分頁面使用 100vw，科威頁面若有側欄或容器留白，可能產生橫向捲動。' });
  }
  if (localUrls.length) {
    issues.push({ level: 'error', text: `有 ${localUrls.length} 個本機或暫時網址，上傳後無法讀取。` });
  }
  if (insecureUrls.length) {
    issues.push({ level: 'error', text: `有 ${insecureUrls.length} 個非 HTTPS 外部資源，可能被瀏覽器阻擋。` });
  }
  if (missingImageUrls) {
    issues.push({ level: 'error', text: `有 ${missingImageUrls} 張圖片未設定網址。` });
  }
  if (!issues.some(issue => issue.level === 'error')) {
    issues.push({ level: 'success', text: '未發現會直接造成上傳失敗的圖片或網址問題。' });
  }
  return issues;
};

const editorBridgeScript = `
  <script>
    (() => {
      const section = document.querySelector('section');
      if (!section) return;
      document.body.classList.add('page-mode');
      section.classList.add('active-page');
      section.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));

      const editableSelector = 'h1,h2,h3,h4,h5,h6,p,li,button,a,span';
      section.querySelectorAll(editableSelector).forEach(el => {
        if (el.children.length || !el.textContent.trim()) return;
        el.contentEditable = 'true';
        el.dataset.builderEditable = 'true';
        el.title = '點擊即可修改文字';
      });

      section.querySelectorAll('img').forEach(img => {
        img.dataset.builderImage = 'true';
        img.title = '點擊更換圖片網址';
        img.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          const nextUrl = window.prompt('請輸入新的公開圖片網址', img.getAttribute('src') || '');
          if (nextUrl && nextUrl.trim()) {
            img.setAttribute('src', nextUrl.trim());
            window.parent.postMessage({ type: 'BROCHURE_DIRTY' }, '*');
          }
        });
      });

      section.addEventListener('input', () => {
        window.parent.postMessage({ type: 'BROCHURE_DIRTY' }, '*');
      });
    })();
  <\/script>
`;

const cleanSectionForSave = (section) => {
  if (!section) return '';
  const clone = section.cloneNode(true);
  clone.classList.remove('active-page', 'builder-transition');
  [...clone.classList].forEach(className => {
    if (className.startsWith('builder-transition-')) clone.classList.remove(className);
  });
  clone.querySelectorAll('[contenteditable], [data-builder-editable], [data-builder-image], [title]').forEach(el => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('data-builder-editable');
    el.removeAttribute('data-builder-image');
    if (el.getAttribute('title') === '點擊即可修改文字' || el.getAttribute('title') === '點擊更換圖片網址') {
      el.removeAttribute('title');
    }
  });
  return clone.outerHTML;
};

const ensureBuilderFields = (html) => {
  const documentNode = new DOMParser().parseFromString(html, 'text/html');
  const section = documentNode.querySelector('section');
  if (!section) return html;

  let textIndex = section.querySelectorAll('[data-builder-field^="text-"]').length;
  const textNodes = [];
  const walker = documentNode.createTreeWalker(section, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    const text = node.textContent || '';
    const trimmed = text.trim();
    const parent = node.parentElement;
    if (!trimmed || !parent || parent.closest('script,style,svg') || parent.closest('[data-builder-field]')) return;

    const allowedParent = /^(H1|H2|H3|H4|H5|H6|P|LI|A|BUTTON|SPAN|STRONG|SMALL|DIV)$/.test(parent.tagName);
    if (!allowedParent) return;

    if (parent.childElementCount === 0 && [...parent.childNodes].filter(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim()).length === 1) {
      parent.dataset.builderField = `text-${textIndex++}`;
      return;
    }

    const leading = text.match(/^\s*/)?.[0] || '';
    const trailing = text.match(/\s*$/)?.[0] || '';
    const fragment = documentNode.createDocumentFragment();
    if (leading) fragment.append(documentNode.createTextNode(leading));
    const span = documentNode.createElement('span');
    span.dataset.builderField = `text-${textIndex++}`;
    span.textContent = trimmed;
    fragment.append(span);
    if (trailing) fragment.append(documentNode.createTextNode(trailing));
    node.replaceWith(fragment);
  });

  section.querySelectorAll('img').forEach((image, index) => {
    if (!image.dataset.builderField) image.dataset.builderField = `image-${index}`;
  });

  return section.outerHTML;
};

const getPageFields = (html) => {
  if (!html) return { text: [], images: [] };
  const documentNode = new DOMParser().parseFromString(html, 'text/html');
  const section = documentNode.querySelector('section');
  if (!section) return { text: [], images: [] };

  const text = [...section.querySelectorAll('[data-builder-field^="text-"]')].map((element, index) => ({
    id: element.dataset.builderField,
    label: `${element.tagName.toLowerCase()} 文字 ${index + 1}`,
    value: element.textContent || ''
  }));
  const images = [...section.querySelectorAll('img[data-builder-field]')].map((image, index) => ({
    id: image.dataset.builderField,
    label: image.alt || `圖片 ${index + 1}`,
    value: image.getAttribute('src') || '',
    alt: image.alt || ''
  }));

  return { text, images };
};

const createBlankPageHtml = (id, title) => `
  <section id="${id}" class="magazine-section bg-luxury-cream text-luxury-dark" data-title="${title}">
    <div class="max-w-5xl mx-auto w-full px-6 py-16">
      <p class="text-luxury-gold tracking-[0.3em] uppercase text-xs mb-4">CUSTOM PAGE</p>
      <h2 class="text-4xl md:text-5xl font-bold tracking-widest mb-6">${title}</h2>
      <div class="w-12 h-[2px] bg-luxury-gold mb-10"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h3 class="text-2xl font-bold mb-4">新增內容標題</h3>
          <p class="font-sans text-gray-600 leading-relaxed">點擊文字即可編輯內容。點擊右側圖片即可更換公開圖片網址。</p>
        </div>
        <div class="h-[50vh] overflow-hidden bg-gray-200">
          <img src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80" alt="新增頁面圖片" class="w-full h-full object-cover img-elegant">
        </div>
      </div>
    </div>
  </section>`;

export default function EditorMagazine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [headHtml, setHeadHtml] = useState('');
  const [activePage, setActivePage] = useState(null);
  const [draggedPage, setDraggedPage] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [originalPages, setOriginalPages] = useState([]);
  const [previewEnvironment, setPreviewEnvironment] = useState('editor');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const currentIndex = pages.findIndex(page => page.id === activePage);
  const currentPage = pages[currentIndex];

  useEffect(() => {
    const handleDirty = event => {
      if (event.data?.type === 'BROCHURE_DIRTY') setDirty(true);
    };
    window.addEventListener('message', handleDirty);
    return () => window.removeEventListener('message', handleDirty);
  }, []);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch('/code-artifact-pages.html');
        const source = await response.text();
        const documentNode = new DOMParser().parseFromString(source, 'text/html');
        const originalSections = [...documentNode.querySelectorAll('body > section')];
        const sourceHead = documentNode.head.innerHTML;
        setHeadHtml(sourceHead);

        const defaultPages = originalSections.map((section, index) => ({
              id: section.id || `page-${index + 1}`,
              label: section.dataset.title || `頁面 ${index + 1}`,
              description: index === 0 ? '主視覺封面' : '點擊預覽內容即可編輯',
              html: section.outerHTML,
              transition: 'fade-up'
            })).map(page => ({ ...page, html: ensureBuilderFields(page.html) }));
        setOriginalPages(defaultPages);

        const itineraryData = id ? await itineraryApi.getById(id) : null;
        if (itineraryData && itineraryData.config?.theme !== 'magazine') {
          navigate(`/editor/${id}`, { replace: true });
          return;
        }
        setItinerary(itineraryData);

        const saved = JSON.parse(localStorage.getItem(getStorageKey(id)) || 'null');
        const databasePages = itineraryData?.config?.magazine_pages;
        const loadedPages = (Array.isArray(saved?.pages) && saved.pages.length
          ? saved.pages
          : Array.isArray(databasePages) && databasePages.length
            ? databasePages
            : defaultPages).map(page => ({ ...page, html: ensureBuilderFields(page.html) }));

        setPages(loadedPages);
        setActivePage(loadedPages[0]?.id || null);
      } catch (error) {
        console.error(error);
        alert('無法載入原始頁面');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id, navigate]);

  const captureCurrentPage = () => {
    if (!activePage || !iframeRef.current) return pages;
    const section = iframeRef.current.contentDocument?.querySelector('section');
    const html = cleanSectionForSave(section);
    if (!html) return pages;
    const next = pages.map(page => page.id === activePage ? { ...page, html } : page);
    setPages(next);
    setDirty(false);
    return next;
  };

  const saveProject = async () => {
    const next = captureCurrentPage();
    setSaving(true);
    try {
      localStorage.setItem(getStorageKey(id), JSON.stringify({ pages: next, updatedAt: Date.now() }));
      if (id && itinerary) {
        const user = await authApi.getUser();
        const config = {
          ...(itinerary.config || {}),
          theme: 'magazine',
          magazine_pages: next
        };
        const updated = await itineraryApi.update(id, {
          config,
          last_modifier_name: user?.name || user?.email || user?.id || '未知'
        });
        setItinerary(updated);
      }
      setDirty(false);
      alert('雜誌頁面已儲存');
    } catch (error) {
      console.error(error);
      alert('儲存失敗，內容仍保留在本機暫存');
    } finally {
      setSaving(false);
    }
  };

  const selectPage = pageId => {
    captureCurrentPage();
    setActivePage(pageId);
    setDirty(false);
  };

  const movePage = offset => {
    const nextIndex = Math.min(pages.length - 1, Math.max(0, currentIndex + offset));
    if (pages[nextIndex]) selectPage(pages[nextIndex].id);
  };

  const reorderPage = (pageId, offset) => {
    captureCurrentPage();
    setPages(current => {
      const fromIndex = current.findIndex(page => page.id === pageId);
      const toIndex = fromIndex + offset;
      if (fromIndex < 0 || toIndex < 0 || toIndex >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const dropPage = targetId => {
    if (!draggedPage || draggedPage === targetId) return;
    captureCurrentPage();
    setPages(current => {
      const next = [...current];
      const fromIndex = next.findIndex(page => page.id === draggedPage);
      const toIndex = next.findIndex(page => page.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggedPage(null);
  };

  const addPage = () => {
    const title = window.prompt('新頁面名稱', '自訂頁面');
    if (!title?.trim()) return;
    const next = captureCurrentPage();
    const id = `custom-page-${Date.now()}`;
    const page = {
      id,
      label: title.trim(),
      description: '自訂圖文頁',
      html: ensureBuilderFields(createBlankPageHtml(id, title.trim())),
      transition: 'fade-up'
    };
    setPages([...next, page]);
    setActivePage(id);
  };

  const duplicatePage = () => {
    if (!currentPage) return;
    const next = captureCurrentPage();
    const source = next.find(page => page.id === activePage);
    const id = `copy-page-${Date.now()}`;
    const parser = new DOMParser().parseFromString(source.html, 'text/html');
    const section = parser.querySelector('section');
    section.id = id;
    section.dataset.title = `${source.label} 複本`;
    const page = {
      ...source,
      id,
      label: `${source.label} 複本`,
      html: ensureBuilderFields(section.outerHTML)
    };
    const insertAt = next.findIndex(item => item.id === activePage) + 1;
    const updated = [...next];
    updated.splice(insertAt, 0, page);
    setPages(updated);
    setActivePage(id);
  };

  const deletePage = () => {
    if (!currentPage || pages.length === 1) return;
    if (!window.confirm(`確定刪除「${currentPage.label}」？`)) return;
    const nextIndex = Math.max(0, currentIndex - 1);
    const next = pages.filter(page => page.id !== activePage);
    setPages(next);
    setActivePage(next[nextIndex]?.id || next[0]?.id);
    setDirty(false);
  };

  const updateCurrentMeta = updates => {
    const section = iframeRef.current?.contentDocument?.querySelector('section');
    const html = cleanSectionForSave(section);
    setPages(current => current.map(page => (
      page.id === activePage ? { ...page, ...(html ? { html } : {}), ...updates } : page
    )));
    setDirty(false);
  };

  const updatePageField = (fieldId, value) => {
    const liveSection = iframeRef.current?.contentDocument?.querySelector('section');
    const liveHtml = cleanSectionForSave(liveSection);
    const sourceHtml = liveHtml || currentPage?.html;
    if (!sourceHtml) return;

    const documentNode = new DOMParser().parseFromString(sourceHtml, 'text/html');
    const section = documentNode.querySelector('section');
    const field = section?.querySelector(`[data-builder-field="${fieldId}"]`);
    if (!field) return;

    if (field.tagName === 'IMG') field.setAttribute('src', value);
    else field.textContent = value;

    setPages(current => current.map(page => (
      page.id === activePage ? { ...page, html: section.outerHTML } : page
    )));
    setDirty(true);
  };

  const resetProject = () => {
    if (!window.confirm('確定恢復原始 11 頁？目前新增與修改內容會被清除。')) return;
    localStorage.removeItem(getStorageKey(id));
    setPages(originalPages);
    setActivePage(originalPages[0]?.id || null);
    setDirty(true);
  };

  const exportHtml = () => {
    const next = captureCurrentPage();
    const sections = next.map((page, index) => {
      const documentNode = new DOMParser().parseFromString(page.html, 'text/html');
      const section = documentNode.querySelector('section');
      section.id = `page-${index + 1}`;
      section.dataset.title = page.label;
      section.dataset.transition = page.transition || 'fade-up';
      return section.outerHTML;
    }).join('\n');

    const exportScript = `
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const sections = [...document.querySelectorAll('body > section')];
          const nav = document.getElementById('nav-dots');
          sections.forEach((section, index) => {
            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.title = section.dataset.title || 'Page ' + (index + 1);
            dot.addEventListener('click', () => section.scrollIntoView({ behavior: 'smooth' }));
            nav.appendChild(dot);
          });
          const dots = [...nav.children];
          const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (!entry.isIntersecting) return;
              entry.target.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
              entry.target.classList.add('builder-transition', 'builder-transition-' + (entry.target.dataset.transition || 'fade-up'));
              const index = sections.indexOf(entry.target);
              dots.forEach(dot => dot.classList.remove('active'));
              dots[index]?.classList.add('active');
            });
          }, { threshold: .25 });
          sections.forEach(section => observer.observe(section));
        });
      <\/script>`;

    const output = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
${headHtml}
<style>${transitionCss}</style>
</head>
<body class="antialiased selection:bg-luxury-gold selection:text-white">
<div class="nav-dots" id="nav-dots"></div>
${sections}
${exportScript}
</body>
</html>`;
    const blob = new Blob([output], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'jollify-brochure.html';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const previewDoc = useMemo(() => {
    if (!currentPage || !headHtml) return '';
    const documentNode = new DOMParser().parseFromString(currentPage.html, 'text/html');
    const section = documentNode.querySelector('section');
    if (!section) return '';
    section.classList.add('builder-transition', `builder-transition-${currentPage.transition || 'fade-up'}`);
    return `<!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        ${headHtml}
        <style>
          ${transitionCss}
          ${previewEnvironment === 'kowei' ? koweiHostCss : ''}
          [data-builder-editable="true"]:hover { outline: 2px dashed #C5A059; outline-offset: 4px; cursor: text; }
          [data-builder-editable="true"]:focus { outline: 2px solid #4C2A85; outline-offset: 4px; }
          [data-builder-image="true"] { cursor: pointer; }
          [data-builder-image="true"]:hover { outline: 4px solid #C5A059; outline-offset: -4px; }
        </style>
      </head>
      <body class="antialiased selection:bg-luxury-gold selection:text-white">
        ${previewEnvironment === 'kowei' ? '<div class="kowei-host-shell"><main class="kowei-host-content">' : ''}
        ${section.outerHTML}
        ${previewEnvironment === 'kowei' ? '</main></div>' : ''}
        ${editorBridgeScript}
      </body>
      </html>`;
  }, [currentPage, headHtml, previewEnvironment]);

  const currentFields = useMemo(() => getPageFields(currentPage?.html), [currentPage?.html]);
  const compatibilityIssues = useMemo(() => getCompatibilityIssues(pages, headHtml), [pages, headHtml]);
  const compatibilityErrorCount = compatibilityIssues.filter(issue => issue.level === 'error').length;

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-[var(--c-pri)]">載入分頁編輯器...</div>;
  }

  return (
    <div className="brochure-pages-shell">
      <header className="brochure-pages-header">
        <div className="brochure-pages-title">
          <button className="editor-icon-button" onClick={() => navigate('/')} title="回管理台">
            <ArrowLeft size={20} />
          </button>
          <FileText size={21} />
          <div>
            <h1>{itinerary?.title || '旅遊手冊'} · 雜誌編輯器</h1>
            <p>{dirty ? '有尚未儲存的內容' : '內容已同步'} · 頁面式編排與圖片替換</p>
          </div>
        </div>

        <div className="brochure-pages-actions">
          <button className="editor-action-button" onClick={() => navigate(`/editor-magazine/${id}`)}>
            <FileText size={17} /> 資料表單
          </button>
          <button className="editor-action-button" onClick={addPage}><FilePlus2 size={17} /> 新增頁面</button>
          <button className="editor-action-button" onClick={duplicatePage}><Copy size={17} /> 複製</button>
          <button className="editor-action-button" onClick={deletePage} disabled={pages.length === 1}><Trash2 size={17} /> 刪除</button>
          <button className="editor-action-button editor-action-primary" onClick={saveProject} disabled={saving}>
            <Save size={17} /> {saving ? '儲存中...' : '儲存'}
          </button>
          <button className="editor-action-button editor-pdf-button" onClick={exportHtml}><Download size={17} /> 輸出 HTML</button>
        </div>
      </header>

      <div className="brochure-builder-toolbar">
        <button className="editor-segment-button" onClick={() => movePage(-1)} disabled={currentIndex === 0}>
          <ChevronLeft size={16} /> 上一頁
        </button>
        <span className="brochure-page-counter">{currentIndex + 1} / {pages.length}</span>
        <button className="editor-segment-button" onClick={() => movePage(1)} disabled={currentIndex === pages.length - 1}>
          下一頁 <ChevronRight size={16} />
        </button>
        <label>
          頁面名稱
          <input value={currentPage?.label || ''} onChange={event => updateCurrentMeta({ label: event.target.value })} />
        </label>
        <label>
          頁面效果
          <select value={currentPage?.transition || 'fade-up'} onChange={event => updateCurrentMeta({ transition: event.target.value })}>
            {transitionOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <div className="brochure-preview-switch" aria-label="預覽環境">
          <button
            className={previewEnvironment === 'editor' ? 'active' : ''}
            onClick={() => setPreviewEnvironment('editor')}
            title="一般編輯預覽"
          >
            <MonitorCheck size={15} /> 編輯預覽
          </button>
          <button
            className={previewEnvironment === 'kowei' ? 'active kowei' : ''}
            onClick={() => setPreviewEnvironment('kowei')}
            title="模擬科威網站既有 CSS"
          >
            {compatibilityErrorCount ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
            科威模擬
          </button>
        </div>
        <div className="brochure-preview-switch device" aria-label="預覽尺寸">
          <button className={previewDevice === 'desktop' ? 'active' : ''} onClick={() => setPreviewDevice('desktop')} title="桌面版">
            <MonitorCheck size={15} />
          </button>
          <button className={previewDevice === 'mobile' ? 'active' : ''} onClick={() => setPreviewDevice('mobile')} title="手機版">
            <Smartphone size={15} />
          </button>
        </div>
        <span className="brochure-edit-hint"><Image size={15} /> 圖片需使用公開 https 網址</span>
      </div>

      <div className="brochure-pages-workspace">
        <aside className="brochure-pages-sidebar">
          <div className="brochure-page-list-panel">
            <div className="brochure-sidebar-heading">
              <span>頁面順序</span>
              <button onClick={resetProject} title="恢復原始頁面"><RotateCcw size={14} /></button>
            </div>
            <nav>
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`brochure-page-button ${activePage === page.id ? 'active' : ''} ${draggedPage === page.id ? 'dragging' : ''}`}
                  onClick={() => selectPage(page.id)}
                  draggable
                  onDragStart={() => setDraggedPage(page.id)}
                  onDragEnd={() => setDraggedPage(null)}
                  onDragOver={event => event.preventDefault()}
                  onDrop={() => dropPage(page.id)}
                  role="button"
                  tabIndex={0}
                >
                  <GripVertical className="brochure-drag-handle" size={16} />
                  <span className="brochure-page-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="brochure-page-copy">
                    <strong>{page.label}</strong>
                    <small>{page.description}</small>
                  </span>
                  <span className="brochure-order-actions">
                    <button onClick={event => { event.stopPropagation(); reorderPage(page.id, -1); }} disabled={index === 0} title="上移"><ArrowUp size={14} /></button>
                    <button onClick={event => { event.stopPropagation(); reorderPage(page.id, 1); }} disabled={index === pages.length - 1} title="下移"><ArrowDown size={14} /></button>
                  </span>
                </div>
              ))}
            </nav>
          </div>

          <div className="brochure-content-editor">
            <div className="brochure-content-heading">
              <div>
                <span>頁面內容</span>
                <small>{currentFields.text.length} 個文字欄位 · {currentFields.images.length} 張圖片</small>
              </div>
            </div>

            <div className="brochure-editor-fields">
              {currentFields.text.length > 0 && (
                <section className="brochure-field-group">
                  <h3>文字內容</h3>
                  {currentFields.text.map(field => (
                    <label key={field.id} className="brochure-editor-field">
                      <span>{field.label}</span>
                      {field.value.length > 42 ? (
                        <textarea
                          rows={3}
                          value={field.value}
                          onChange={event => updatePageField(field.id, event.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={field.value}
                          onChange={event => updatePageField(field.id, event.target.value)}
                        />
                      )}
                    </label>
                  ))}
                </section>
              )}

              {currentFields.images.length > 0 && (
                <section className="brochure-field-group">
                  <h3>圖片設定</h3>
                  {currentFields.images.map(field => (
                    <label key={field.id} className="brochure-editor-field brochure-image-field">
                      <span>{field.label}</span>
                      <img src={field.value} alt={field.alt || field.label} />
                      <input
                        type="url"
                        value={field.value}
                        placeholder="https://..."
                        onChange={event => updatePageField(field.id, event.target.value)}
                      />
                    </label>
                  ))}
                </section>
              )}
            </div>
          </div>
        </aside>

        <main className="brochure-pages-preview">
          <div className="brochure-preview-heading">
            <div>
              <span>PAGE {String(currentIndex + 1).padStart(2, '0')}</span>
              <h2>{currentPage?.label}</h2>
            </div>
            <p>{previewEnvironment === 'kowei' ? '科威模擬會套用外站常見的全域 CSS' : '直接點預覽中的文字或圖片進行修改'}</p>
          </div>

          {previewEnvironment === 'kowei' && (
            <div className="brochure-compatibility-report">
              <strong>科威相容性檢查</strong>
              <div>
                {compatibilityIssues.map((issue, index) => (
                  <span key={`${issue.level}-${index}`} className={issue.level}>
                    {issue.level === 'success' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {issue.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`brochure-preview-canvas ${previewDevice}`}>
            <iframe
              ref={iframeRef}
              key={activePage}
              title={`${currentPage?.label || '頁面'}預覽`}
              srcDoc={previewDoc}
              sandbox="allow-scripts allow-same-origin allow-modals"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
