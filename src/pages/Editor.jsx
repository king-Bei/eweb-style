import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itineraryApi, flightApi, daysApi, hotelsApi, authApi } from '../api';
import { supabase } from '../supabase';
import {
  Save,
  ArrowLeft,
  Code,
  Copy,
  Lock,
  History,
  Users,
  RefreshCw,
  Phone,
  Monitor,
  BookOpen,
  PanelsTopLeft
} from 'lucide-react';
import * as ClassicEngine from '../ExportEngine';
import * as MagazineEngine from '../ExportEngineMagazine';
import FormHero from '../components/FormHero';
import FormHighlights from '../components/FormHighlights';
import FormSpots from '../components/FormSpots';
import FormFlights from '../components/FormFlights';
import FormHotels from '../components/FormHotels';
import FormDays from '../components/FormDays';
import FormMap from '../components/FormMap';
import FormNotices from '../components/FormNotices';
import FormRecommended from '../components/FormRecommended';
import FormCTA from '../components/FormCTA';

export default function Editor({ forcedTheme = null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef(null);

  // State for itinerary data
  const [itinerary, setItinerary] = useState({
    title: '',
    hero_data: {},
    highlights: {},
    spots: {},
    notices: {},
    recommended: {}
  });
  const [moduleOrder, setModuleOrder] = useState(['hero', 'highlights', 'spots', 'flights', 'hotels', 'days', 'notices', 'map', 'recommended']);
  const [status, setStatus] = useState('草稿');
  const [publishDateNote, setPublishDateNote] = useState('');
  const [flights, setFlights] = useState({});
  const [days, setDays] = useState({});
  const [hotels, setHotels] = useState({});
  const [cta, setCta] = useState({});

  // Preview Mode & Export Output
  const [theme, setTheme] = useState('classic');
  const [baseConfig, setBaseConfig] = useState({});

  // 儲存進度狀態
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveProgressText, setSaveProgressText] = useState('');
  const [showSaveProgress, setShowSaveProgress] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [autoPreview, setAutoPreview] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [exportCodes, setExportCodes] = useState({ html: '', css: '', js: '' });
  const [externalCssUrl, setExternalCssUrl] = useState('');
  const [externalJsUrl, setExternalJsUrl] = useState('');

  // New Features State
  const [activeUsers, setActiveUsers] = useState([]);
  const channelRef = useRef(null);
  const isReceivingRef = useRef(false);
  const isSubscribedRef = useRef(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyVersions, setHistoryVersions] = useState([]);
  const [pendingBackup, setPendingBackup] = useState(null);
  const hasSkippedInitialBackupRef = useRef(false);
  const hasRenderedInitialPreviewRef = useRef(false);
  const lastPreviewVersionRef = useRef(0);
  const backupKey = `backup_itinerary_${id}`;
  const backupSavedKey = `backup_saved_itinerary_${id}`;

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    if (!loading) {
      if (!hasSkippedInitialBackupRef.current) {
        hasSkippedInitialBackupRef.current = true;
        return;
      }

      // 1. Local Backup
      const backupData = { itinerary, flights, days, hotels, cta, timestamp: Date.now() };
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      // 2. Broadcast changes
      if (!isReceivingRef.current && channelRef.current && isSubscribedRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'UPDATE_DATA',
          payload: { itinerary, flights, days, hotels, cta }
        });
      }
    }
  }, [itinerary, flights, days, hotels, cta, loading, theme]);

  useEffect(() => {
    if (loading) return;

    if (!hasRenderedInitialPreviewRef.current) {
      hasRenderedInitialPreviewRef.current = true;
      updatePreview();
      return;
    }

    if (previewVersion !== lastPreviewVersionRef.current) {
      lastPreviewVersionRef.current = previewVersion;
      updatePreview();
      return;
    }

    if (!autoPreview) return;

    const timer = window.setTimeout(updatePreview, 900);
    return () => window.clearTimeout(timer);
  }, [itinerary, flights, days, hotels, cta, loading, theme, autoPreview, previewVersion]);

  // Realtime Setup
  useEffect(() => {
    let isMounted = true;
    let channel = null;

    const setupRealtime = async () => {
      const user = await authApi.getUser();
      if (!isMounted) return; // Prevent race condition in Strict Mode

      const userName = user?.name || user?.id || '匿名同事';

      channel = supabase.channel(`itinerary:${id}`, {
        config: { presence: { key: userName } }
      });
      channelRef.current = channel;

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).map(k => state[k][0]?.userName || k);
        setActiveUsers(users);
      });

      channel.on('broadcast', { event: 'UPDATE_DATA' }, payload => {
        isReceivingRef.current = true;
        const { itinerary: i, flights: f, days: d, hotels: h, cta: c } = payload.payload;
        if (i) setItinerary(i);
        if (f) setFlights(f);
        if (d) setDays(d);
        if (h) setHotels(h);
        if (c) setCta(c);
        setTimeout(() => isReceivingRef.current = false, 500);
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isMounted) {
          isSubscribedRef.current = true;
          await channel.track({ userName, onlineAt: new Date().toISOString() });
        }
      });
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  const loadData = async () => {
    try {
      const data = await itineraryApi.getById(id);
      if (!forcedTheme && data.config?.theme === 'magazine') {
        navigate(`/editor-magazine/${id}`, { replace: true });
        return;
      }
      setItinerary({
        title: data.title,
        hero_data: data.hero_data || {},
        highlights: data.highlights || {},
        spots: data.spots || {},
        notices: data.notices || {},
        recommended: data.recommended || {},
        map_data: data.map_data || {}
      });

      const defaultOrder = ['hero', 'highlights', 'spots', 'flights', 'hotels', 'days', 'notices', 'map', 'recommended'];
      let loadedOrder = data.config?.module_order || defaultOrder;
      loadedOrder = loadedOrder.filter(k => defaultOrder.includes(k));
      defaultOrder.forEach(k => {
        if (!loadedOrder.includes(k)) {
          loadedOrder.push(k);
        }
      });
      setModuleOrder(loadedOrder);

      setStatus(data.status || '草稿');
      setPublishDateNote(data.publish_date_note || '');

      const f_items = data.itinerary_flights ? data.itinerary_flights.map(f => f.flight_data) : [];
      setFlights({ visible: data.config?.flights_visible !== false, items: f_items });

      const d_items = data.itinerary_days ? data.itinerary_days.sort((a, b) => a.day_index - b.day_index).map(d => d.content) : [];
      setDays({
        visible: data.config?.days_visible !== false,
        layout: data.config?.daysLayout || 'leftimg',
        items: d_items
      });

      const h_items = data.itinerary_hotels ? data.itinerary_hotels.map(h => h.hotel_group_data) : [];
      setHotels({ visible: data.config?.hotels_visible !== false, layout: data.config?.hotelLayout || 'overlap', items: h_items });

      setCta({
        visible: data.config?.cta_visible !== false,
        cta_register_url: data.config?.cta_register_url || '',
        cta_line_url: data.config?.cta_line_url || ''
      });

      setBaseConfig(data.config || {});
      setTheme(forcedTheme || data.config?.theme || 'classic');

      // Check for unsaved local backup
      const backupStr = localStorage.getItem(backupKey);
      if (backupStr) {
        try {
          const backup = JSON.parse(backupStr);
          const dbTime = new Date(data.updated_at).getTime();
          const savedAt = Number(localStorage.getItem(backupSavedKey) || 0);
          if (backup.timestamp && savedAt && backup.timestamp <= savedAt) {
            localStorage.removeItem(backupKey);
            return;
          }
          if (backup.timestamp && backup.timestamp > dbTime + 10000) {
            setPendingBackup(backup);
          }
        } catch (e) { }
      }

    } catch (err) {
      console.error(err);
      alert('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setShowSaveProgress(true);
    setSaveProgress(10);
    setSaveProgressText('準備儲存專案中...');
    
    try {
      const user = await authApi.getUser();
      const config = {
        ...baseConfig,
        theme: forcedTheme || theme,
        flights_visible: flights.visible,
        days_visible: days.visible,
        daysLayout: days.layout || 'leftimg',
        hotels_visible: hotels.visible,
        hotelLayout: hotels.layout,
        cta_visible: cta.visible,
        cta_register_url: cta.cta_register_url,
        cta_line_url: cta.cta_line_url,
        module_order: moduleOrder
      };

      setSaveProgress(20);
      setSaveProgressText('正在儲存行程基本資料 (1/5)...');
      await itineraryApi.update(id, {
        title: itinerary.title,
        hero_data: itinerary.hero_data,
        highlights: itinerary.highlights,
        spots: itinerary.spots,
        notices: itinerary.notices,
        recommended: itinerary.recommended,
        map_data: itinerary.map_data,
        config,
        status,
        publish_date_note: publishDateNote,
        last_modifier_name: user?.name || user?.id || '未知'
      });

      setSaveProgress(40);
      setSaveProgressText('正在儲存航班資訊 (2/5)...');
      await flightApi.save(id, flights.items || []);

      setSaveProgress(60);
      setSaveProgressText('正在儲存每日行程說明 (3/5)...');
      const daysToSave = (days.items || []).map((content, idx) => ({ day_index: idx + 1, content }));
      await daysApi.save(id, daysToSave);

      setSaveProgress(80);
      setSaveProgressText('正在儲存嚴選旅宿住宿 (4/5)...');
      await hotelsApi.save(id, hotels.items || []);

      setSaveProgress(90);
      setSaveProgressText('正在建立歷史版本備份 (5/5)...');
      try {
        await itineraryApi.saveVersion(id, {
          itinerary,
          flights,
          days,
          hotels,
          cta,
          config,
          status,
          publish_date_note: publishDateNote,
          theme
        }, user);
      } catch (err) {
        console.warn('版本備份失敗', err);
      }

      setSaveProgress(100);
      setSaveProgressText('儲存成功！');
      localStorage.setItem(backupSavedKey, String(Date.now()));
      localStorage.removeItem(backupKey);
      setPendingBackup(null);

      setTimeout(() => {
        setShowSaveProgress(false);
      }, 800);

    } catch (err) {
      console.error(err);
      setSaveProgressText('儲存失敗！');
      alert('儲存失敗');
      setShowSaveProgress(false);
    } finally {
      setSaving(false);
    }
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;
    const engine = theme === 'magazine' ? MagazineEngine : ClassicEngine;
    const html = theme === 'magazine'
      ? engine.generateHtml(itinerary, flights, days, hotels, cta)
      : engine.generateHtml(itinerary, flights, days, hotels, cta, '', moduleOrder);
    const css = engine.generateCss();
    const js = engine.generateJs();

    const fullDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>網頁預覽</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Noto+Serif+TC:wght@300;400;600;700&display=swap" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js"></script>
<style>
  body { margin: 0; padding: 0; font-family: "Noto Serif TC", "PingFang TC", "Microsoft JhengHei", serif; background: #fff; }
  ${css}
</style>
</head>
<body>
${html}
<script>
  new WOW({ live: false }).init();
  ${js}
</script>
</body>
</html>`;

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    doc.open();
    doc.write(fullDoc);
    doc.close();
  };

  const scrollToIframe = (anchorId) => {
    if (!iframeRef.current) return;
    try {
      const iframeWindow = iframeRef.current.contentWindow;
      const iframeDoc = iframeRef.current.contentDocument || iframeWindow.document;
      
      let target = iframeDoc.getElementById(anchorId);
      if (!target && anchorId === 'top') {
        target = iframeDoc.getElementById('jollify-tour-module') || iframeDoc.body;
      }
      
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      console.error('Iframe scroll failed', e);
    }
  };

  const handleRefreshPreview = () => {
    setPreviewVersion(version => version + 1);
  };

  const handleExport = () => {
    const engine = theme === 'magazine' ? MagazineEngine : ClassicEngine;

    let headPreloads = '';
    if (itinerary.hero_data?.image_url) {
      headPreloads += `<link rel="preload" as="image" href="${itinerary.hero_data.image_url}">\n`;
    }
    // 如果有其他常用 CDN，也可在此預載
    headPreloads += `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Noto+Serif+TC:wght@300;400;600;700&display=swap" rel="stylesheet">\n`;

    setExportCodes({
      html: theme === 'classic'
        ? engine.generateHtml(itinerary, flights, days, hotels, cta, '', moduleOrder)
        : engine.generateHtml(itinerary, flights, days, hotels, cta),
      css: engine.generateCss(theme, true),
      js: engine.generateJs(),
      head: headPreloads.trim()
    });
    setShowExport(true);
  };

  const handleCopy = (type) => {
    navigator.clipboard.writeText(exportCodes[type]);
    alert(`已複製 ${type.toUpperCase()} 代碼！`);
  };

  const handleCopyExternalCssImport = () => {
    const url = externalCssUrl.trim();
    if (!url) {
      alert('請先貼上 CSS 檔案的公開網址');
      return;
    }
    navigator.clipboard.writeText(`<link rel="stylesheet" href="${url}">`);
    alert('已複製 CSS 外部匯入碼！');
  };

  const handleCopyExternalJsImport = () => {
    const url = externalJsUrl.trim();
    if (!url) {
      alert('請先貼上 JS 檔案的公開網址');
      return;
    }
    navigator.clipboard.writeText(`<script src="${url}" defer></script>`);
    alert('已複製 JS 外部匯入碼！');
  };

  const handleDownload = (type) => {
    const code = exportCodes[type];
    if (!code) {
      alert(`尚無 ${type.toUpperCase()} 代碼可下載`);
      return;
    }
    const blob = new Blob([code], { type: type === 'css' ? 'text/css' : 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary-${id || 'export'}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreLocalBackup = () => {
    if (!pendingBackup) return;
    if (pendingBackup.itinerary) setItinerary(pendingBackup.itinerary);
    if (pendingBackup.flights) setFlights(pendingBackup.flights);
    if (pendingBackup.days) setDays(pendingBackup.days);
    if (pendingBackup.hotels) setHotels(pendingBackup.hotels);
    if (pendingBackup.cta) setCta(pendingBackup.cta);
    setPendingBackup(null);
  };

  const handleDiscardLocalBackup = () => {
    localStorage.removeItem(backupKey);
    setPendingBackup(null);
  };

  const handleLoadHistory = async () => {
    try {
      const versions = await itineraryApi.getVersions(id);
      setHistoryVersions(versions);
      setShowHistoryModal(true);
    } catch (err) {
      alert('無法載入歷史紀錄');
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm('確定要還原到這個版本嗎？您目前的未儲存變更將會遺失。')) return;
    try {
      const snapshot = await itineraryApi.getVersionData(versionId);
      if (snapshot.itinerary) setItinerary(snapshot.itinerary);
      if (snapshot.flights) setFlights(snapshot.flights);
      if (snapshot.days) {
        setDays({
          ...snapshot.days,
          layout: snapshot.config?.daysLayout || snapshot.days.layout || 'leftimg'
        });
      }
      if (snapshot.hotels) setHotels(snapshot.hotels);
      if (snapshot.cta) setCta(snapshot.cta);
      if (snapshot.status) setStatus(snapshot.status);
      if (snapshot.publish_date_note !== undefined) setPublishDateNote(snapshot.publish_date_note || '');
      if (snapshot.theme || snapshot.config?.theme) setTheme(snapshot.theme || snapshot.config.theme);
      if (snapshot.config?.module_order) {
        setModuleOrder(snapshot.config.module_order);
      } else {
        setModuleOrder(['hero', 'highlights', 'spots', 'flights', 'hotels', 'days', 'notices', 'recommended']);
      }
      setShowHistoryModal(false);
      alert('已還原版本，請記得點擊「儲存變更」以確認覆蓋。');
    } catch (err) {
      alert('還原失敗');
    }
  };

  const renderModuleForm = (key) => {
    const isFirst = moduleOrder[0] === key;
    const isLast = moduleOrder[moduleOrder.length - 1] === key;

    const moveUp = () => {
      const idx = moduleOrder.indexOf(key);
      if (idx > 0) {
        const newOrder = [...moduleOrder];
        newOrder[idx] = newOrder[idx - 1];
        newOrder[idx - 1] = key;
        setModuleOrder(newOrder);
      }
    };

    const moveDown = () => {
      const idx = moduleOrder.indexOf(key);
      if (idx < moduleOrder.length - 1) {
        const newOrder = [...moduleOrder];
        newOrder[idx] = newOrder[idx + 1];
        newOrder[idx + 1] = key;
        setModuleOrder(newOrder);
      }
    };

    const names = {
      hero: '橫幅 Banner',
      highlights: '行程特色亮點',
      spots: '精選景點',
      flights: '航程航班資訊',
      hotels: '嚴選旅宿住宿',
      days: '每日行程說明',
      notices: '報名注意事項',
      map: '行程地圖',
      recommended: '推薦行程/更多旅程'
    };

    let formComponent = null;
    switch (key) {
      case 'hero':
        formComponent = <FormHero heroData={itinerary.hero_data} onChange={(d) => setItinerary({ ...itinerary, hero_data: d })} />;
        break;
      case 'highlights':
        formComponent = <FormHighlights data={itinerary.highlights} onChange={(d) => setItinerary({ ...itinerary, highlights: d })} />;
        break;
      case 'spots':
        formComponent = <FormSpots data={itinerary.spots} onChange={(d) => setItinerary({ ...itinerary, spots: d })} />;
        break;
      case 'flights':
        formComponent = <FormFlights data={flights} onChange={setFlights} theme={theme} />;
        break;
      case 'hotels':
        formComponent = <FormHotels data={hotels} onChange={setHotels} />;
        break;
      case 'days':
        formComponent = <FormDays data={days} onChange={setDays} />;
        break;
      case 'map':
        formComponent = <FormMap data={itinerary.map_data || {}} onChange={(d) => setItinerary({ ...itinerary, map_data: d })} />;
        break;
      case 'notices':
        formComponent = <FormNotices data={itinerary.notices} onChange={(d) => setItinerary({ ...itinerary, notices: d })} />;
        break;
      case 'recommended':
        formComponent = <FormRecommended data={itinerary.recommended} onChange={(d) => setItinerary({ ...itinerary, recommended: d })} />;
        break;
      default:
        return null;
    }

    return (
      <div key={key} id={`form-${key}`} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm relative transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100">
          <span className="font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-purple-50 text-[var(--c-pri)] text-xs px-3 py-1 rounded-full font-bold">
              第 {moduleOrder.indexOf(key) + 1} 區塊
            </span>
            {names[key]}
          </span>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={moveUp} 
              disabled={isFirst}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isFirst ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed' : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 hover:border-gray-400'}`}
            >
              ▲ 上移
            </button>
            <button 
              type="button" 
              onClick={moveDown} 
              disabled={isLast}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isLast ? 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed' : 'text-gray-600 border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 hover:border-gray-400'}`}
            >
              ▼ 下移
            </button>
          </div>
        </div>
        <div>
          {formComponent}
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ padding: '20px' }}>載入中...</div>;

  const isLocked = status === '已上架';

  return (
    <div className="editor-app-shell">
      <header className="editor-topbar">
        <div className="editor-brand">
          <button className="editor-icon-button" onClick={() => navigate('/dashboard')} title="回管理台">
            <ArrowLeft size={20} />
          </button>
          <div className="editor-title-group">
            <h1><BookOpen size={20} /> 網站行程產生器</h1>
            {isLocked && <span className="editor-lock-pill"><Lock size={12} /> 資料已鎖定</span>}
          </div>
        </div>

        <div className="editor-status-row">
          {activeUsers.length > 0 && (
            <span className="editor-soft-pill" title="目前在線編輯人員">
              <Users size={13} /> {activeUsers.length} 人在線
            </span>
          )}
        </div>

        <div className="editor-action-row">
          {forcedTheme === 'magazine' && (
            <button className="editor-action-button" onClick={() => navigate(`/editor-magazine-pages/${id}`)}>
              <PanelsTopLeft size={17} /> 分頁微調
            </button>
          )}
          <button className="editor-action-button editor-action-primary" onClick={handleSave} disabled={saving || isLocked}>
            <Save size={17} /> {saving ? '儲存中' : '儲存變更'}
          </button>
          <button className="editor-action-button editor-action-warn" onClick={handleLoadHistory}>
            <History size={17} /> 版本歷程
          </button>
          <button className="editor-action-button" onClick={handleExport}>
            <Code size={17} /> 匯出代碼
          </button>
          <button className="editor-action-button" onClick={handleRefreshPreview}>
            <RefreshCw size={17} /> 更新預覽
          </button>
          <button className={`editor-segment-button ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')}>
            <Monitor size={16} /> 電腦
          </button>
          <button className={`editor-segment-button ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')}>
            <Phone size={16} /> 手機
          </button>
        </div>
      </header>

      <div className="editor-workspace">
        <aside className="editor-left-pane">
          <div className="editor-mobile-toolbar">
            <div className="editor-title-group">
              <h1>行程編輯</h1>
              {isLocked && <span className="editor-lock-pill"><Lock size={12} /> 已上架鎖定中</span>}
            </div>
            <button className="editor-action-button editor-action-primary" onClick={handleSave} disabled={saving || isLocked}>
              <Save size={16} /> 儲存
            </button>
          </div>

          <div className="editor-theme-strip">
            <div className="editor-theme-label">
              <BookOpen size={14} />
              {forcedTheme === 'magazine' || theme === 'magazine' ? '雜誌風格 · 資料表單' : '經典風格'}
            </div>
            <div className="flex items-center gap-2">
              {forcedTheme === 'magazine' && (
                <button className="editor-link-button" onClick={() => navigate(`/editor-magazine-pages/${id}`)}>
                  <PanelsTopLeft size={14} /> 分頁微調
                </button>
              )}
              <button className="editor-link-button" onClick={handleExport}>
                <Code size={14} /> 匯出代碼
              </button>
            </div>
          </div>

          <div className="editor-legacy-header">
            <div className="flex items-center gap-3">
              <button className="text-gray-500 hover:text-black transition-colors" onClick={() => navigate('/dashboard')} title="回管理台">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-800 m-0 leading-tight">行程編輯</h2>
                {isLocked && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><Lock size={12} /> 已上架鎖定中</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeUsers.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mr-2" title="目前在線編輯人員">
                  <Users size={12} /> {activeUsers.length}人在線
                </div>
              )}
              <button className="btn-outline-gold px-2 py-1" onClick={handleLoadHistory}><History size={16} /></button>
              <button
                className="btn-gold flex items-center gap-2 px-4 py-2"
                onClick={handleSave}
                disabled={saving || isLocked}
                style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <Save size={16} /> {saving ? '儲存中...' : (isLocked ? '已鎖定' : '儲存變更')}
              </button>
            </div>
          </div>

          <div className="editor-legacy-theme-strip px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {theme === 'magazine' ? <><BookOpen size={14} /> 雜誌風格</> : <><BookOpen size={14} /> 經典風格</>}
            </div>
            <button className="btn-outline-gold flex items-center gap-2 px-3 py-1 text-sm" onClick={handleExport}>
              <Code size={14} /> 匯出代碼
            </button>
          </div>

          {pendingBackup && (
            <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold">有本機暫存草稿</div>
                  <div className="text-xs text-amber-800">
                    {pendingBackup.timestamp ? `暫存時間：${new Date(pendingBackup.timestamp).toLocaleString('zh-TW')}` : '偵測到先前未儲存內容'}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="btn-gold px-3 py-1 text-xs" onClick={handleRestoreLocalBackup}>還原</button>
                  <button className="btn-outline-gold px-3 py-1 text-xs bg-white" onClick={handleDiscardLocalBackup}>忽略</button>
                </div>
              </div>
            </div>
          )}

          {showExport && (
            <div className="absolute top-[120px] left-4 right-4 bg-white p-4 rounded-lg border border-[var(--c-pri)] shadow-xl z-30">
              <div className="flex justify-between items-center mb-4">
                <span style={{ color: 'var(--c-pri)', fontWeight: 'bold' }}>匯出代碼 (請依序貼入 CMS)</span>
                <button onClick={() => setShowExport(false)} className="text-gray-500 hover:text-black">關閉</button>
              </div>

              {theme === 'classic' && (
                <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 font-sans">
                  💡 <strong>經典版提示</strong>：產出的 HTML 已自動帶入外部 CSS 樣式與 JS 腳本素材連結，您只需複製 <strong>1. HTML 原始碼</strong> 貼入您的 CMS 即可。
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-700">1. HTML 原始碼</span>
                  <button className="btn-gold px-3 py-1 text-xs flex items-center gap-1" onClick={() => handleCopy('html')}>
                    <Copy size={12} /> 一鍵複製 HTML
                  </button>
                </div>
                <textarea readOnly value={exportCodes.html} className="w-full h-32 bg-gray-50 text-xs font-mono p-2 border border-gray-300 rounded cursor-text" onClick={e => e.target.select()} />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-700">2. CSS 樣式</span>
                  <div className="flex gap-2">
                    <button className="btn-outline-gold px-3 py-1 text-xs" onClick={() => handleDownload('css')}>下載 .css 檔</button>
                    <button className="btn-gold px-3 py-1 text-xs flex items-center gap-1" onClick={() => handleCopy('css')}>
                      <Copy size={12} /> 一鍵複製 CSS
                    </button>
                  </div>
                </div>
                <textarea readOnly value={exportCodes.css} className="w-full h-20 bg-gray-50 text-xs font-mono p-2 border border-gray-300 rounded cursor-text" onClick={e => e.target.select()} />
                <div className="mt-3 rounded border border-emerald-100 bg-emerald-50 p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-900">CSS 外部匯入</span>
                    <input
                      type="url"
                      className="form-control"
                      style={{ marginBottom: 0, minWidth: '280px', flex: 1, padding: '6px 10px', fontSize: '12px' }}
                      value={externalCssUrl}
                      onChange={e => setExternalCssUrl(e.target.value)}
                      placeholder="https://example.com/itinerary.css"
                    />
                    <button className="btn-outline-gold px-3 py-1 text-xs flex items-center gap-1" onClick={handleCopyExternalCssImport}>
                      <Copy size={12} /> 複製匯入碼
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={externalCssUrl.trim() ? `<link rel="stylesheet" href="${externalCssUrl.trim()}">` : '請先下載 .css 檔，上傳到科威素材庫，再把網址貼到上方。'}
                    className="w-full h-12 bg-white text-xs font-mono p-2 border border-emerald-100 rounded cursor-text"
                    onClick={e => e.target.select()}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-700">3. JS 腳本</span>
                  <div className="flex gap-2">
                    <button className="btn-outline-gold px-3 py-1 text-xs" onClick={() => handleDownload('js')}>下載 .js 檔</button>
                    <button className="btn-gold px-3 py-1 text-xs flex items-center gap-1" onClick={() => handleCopy('js')}>
                      <Copy size={12} /> 一鍵複製 JS
                    </button>
                  </div>
                </div>
                <textarea readOnly value={exportCodes.js} className="w-full h-20 bg-gray-50 text-xs font-mono p-2 border border-gray-300 rounded cursor-text" onClick={e => e.target.select()} />
                <div className="mt-3 rounded border border-blue-100 bg-blue-50 p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-900">JS 外部匯入</span>
                    <input
                      type="url"
                      className="form-control"
                      style={{ marginBottom: 0, minWidth: '280px', flex: 1, padding: '6px 10px', fontSize: '12px' }}
                      value={externalJsUrl}
                      onChange={e => setExternalJsUrl(e.target.value)}
                      placeholder="https://example.com/itinerary.js"
                    />
                    <button className="btn-outline-gold px-3 py-1 text-xs flex items-center gap-1" onClick={handleCopyExternalJsImport}>
                      <Copy size={12} /> 複製匯入碼
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={externalJsUrl.trim() ? `<script src="${externalJsUrl.trim()}" defer></script>` : '請先下載 .js 檔，上傳到公開 HTTPS 位置，再把網址貼到上方。'}
                    className="w-full h-12 bg-white text-xs font-mono p-2 border border-blue-100 rounded cursor-text"
                    onClick={e => e.target.select()}
                  />
                </div>
              </div>

              {exportCodes.head && (
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-[var(--c-pri)]">4. Head 預載代碼 (建議貼於頁面 &lt;head&gt; 區塊)</span>
                    <button className="btn-outline-gold px-3 py-1 text-xs flex items-center gap-1" onClick={() => handleCopy('head')}>
                      <Copy size={12} /> 一鍵複製 Head 代碼
                    </button>
                  </div>
                  <textarea readOnly value={exportCodes.head} className="w-full h-16 bg-gray-50 text-xs font-mono p-2 border border-[var(--luxury-gold)] rounded cursor-text" onClick={e => e.target.select()} />
                </div>
              )}
            </div>
          )}

          {isLocked && (
            <div className="absolute inset-0 top-[73px] bg-white/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center pointer-events-auto">
              <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 text-center max-w-[80%]">
                <Lock size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">行程已鎖定</h3>
              </div>
            </div>
          )}

          <div className="editor-form-scroll" style={{ pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.8 : 1 }}>
            {/* 左側表單快速導覽頁籤 */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-gray-100 scrollbar-none sticky top-0 bg-gray-50/90 backdrop-blur-[2px] py-2.5 px-4 z-[5] -mx-6 shadow-sm">
              <button onClick={() => document.getElementById('form-hero')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">主視覺</button>
              <button onClick={() => document.getElementById('form-highlights')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">行程特色</button>
              <button onClick={() => document.getElementById('form-spots')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">精選景點</button>
              <button onClick={() => document.getElementById('form-flights')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">航班資訊</button>
              <button onClick={() => document.getElementById('form-hotels')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">嚴選旅宿</button>
              <button onClick={() => document.getElementById('form-days')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">每日行程</button>
              <button onClick={() => document.getElementById('form-notices')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">注意事項</button>
              <button onClick={() => document.getElementById('form-cta')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">報名諮詢</button>
              <button onClick={() => document.getElementById('form-recommended')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-[var(--c-pri)] hover:text-[var(--c-pri)] whitespace-nowrap transition-all shadow-sm">推薦行程</button>
            </div>

            <div className="editor-form-card">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label text-[var(--c-pri)] font-bold mb-1 block text-sm">行程名稱</label>
                  <input type="text" className="form-control font-bold" value={itinerary.title} onChange={e => setItinerary({ ...itinerary, title: e.target.value })} />
                </div>
              </div>
            </div>

            {theme === 'classic' ? (
              <>
                {moduleOrder.map(key => renderModuleForm(key))}
                <div id="form-cta"><FormCTA data={cta} onChange={setCta} /></div>
              </>
            ) : (
              <>
                <div id="form-hero"><FormHero heroData={itinerary.hero_data} onChange={(d) => setItinerary({ ...itinerary, hero_data: d })} /></div>
                <div id="form-highlights"><FormHighlights data={itinerary.highlights} onChange={(d) => setItinerary({ ...itinerary, highlights: d })} /></div>
                <div id="form-spots"><FormSpots data={itinerary.spots} onChange={(d) => setItinerary({ ...itinerary, spots: d })} /></div>
                <div id="form-flights"><FormFlights data={flights} onChange={setFlights} theme={theme} /></div>
                <div id="form-hotels"><FormHotels data={hotels} onChange={setHotels} /></div>
                <div id="form-days"><FormDays data={days} onChange={setDays} /></div>
                <div id="form-notices"><FormNotices data={itinerary.notices} onChange={(d) => setItinerary({ ...itinerary, notices: d })} /></div>
                <div id="form-cta"><FormCTA data={cta} onChange={setCta} /></div>
                <div id="form-recommended"><FormRecommended data={itinerary.recommended} onChange={(d) => setItinerary({ ...itinerary, recommended: d })} /></div>
              </>
            )}
          </div>
        </aside>

        <section className="editor-preview-pane">
          <div className="editor-preview-toolbar">
            <div>
              <p>預覽需手動更新，避免右側畫面一直重新渲染</p>
              <label>
                <input type="checkbox" checked={autoPreview} onChange={e => setAutoPreview(e.target.checked)} />
                自動更新預覽
              </label>
            </div>
            <div className="editor-preview-actions">
              <button className="editor-action-button editor-action-primary" onClick={handleRefreshPreview}>
                <RefreshCw size={14} /> 更新預覽
              </button>
            </div>
          </div>

          <div className="editor-preview-canvas" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 右側預覽快速導覽頁籤 */}
            <div className="flex gap-2 overflow-x-auto pb-2.5 mb-3 px-2 scrollbar-none border-b border-gray-200 bg-gray-50 py-2 z-10 w-full rounded-lg shadow-sm items-center">
              <span className="text-xs text-gray-500 font-bold whitespace-nowrap pl-1">🔍 預覽跳轉：</span>
              <button onClick={() => scrollToIframe('top')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">頂部</button>
              <button onClick={() => scrollToIframe('highlights')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">特色</button>
              <button onClick={() => scrollToIframe('spots')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">景點</button>
              <button onClick={() => scrollToIframe('flights')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">航班</button>
              <button onClick={() => scrollToIframe('hotels')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">住宿</button>
              <button onClick={() => scrollToIframe('itinerary')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">日程</button>
              <button onClick={() => scrollToIframe('notices')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">須知</button>
              <button onClick={() => scrollToIframe('recommended')} className="px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:border-[var(--luxury-gold)] hover:text-black hover:bg-gray-50 whitespace-nowrap transition-all shadow-sm">推薦</button>
            </div>

            <div className={`editor-preview-frame ${previewMode === 'mobile' ? 'mobile' : 'desktop'}`}>
              {previewMode === 'desktop' && (
                <div className="browser-mockup-header">
                  <div className="dots"><span></span><span></span><span></span></div>
                  <div className="url-bar">網頁版預覽 (Web Preview)</div>
                </div>
              )}
              <iframe ref={iframeRef} title="itinerary-preview"></iframe>
            </div>
          </div>
        </section>
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold">歷史紀錄</h2>
              <button onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {historyVersions.map(v => (
                <div key={v.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-gray-800">{new Date(v.created_at).toLocaleString('zh-TW')}</span>
                    <span className="text-xs text-gray-500">儲存者：<span className="text-[var(--c-pri)] font-medium">{v.modifier_name || '未知'}</span></span>
                  </div>
                  <button className="btn-outline-gold px-3 py-1 text-sm" onClick={() => handleRestoreVersion(v.id)}>還原</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSaveProgress && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[6px] z-[10000] flex items-center justify-center p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-sm overflow-hidden p-6 border border-gray-100 flex flex-col items-center text-center">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              {saveProgress < 100 ? (
                <div className="w-12 h-12 border-[3.5px] border-gray-200 border-t-[var(--c-pri)] rounded-full animate-spin"></div>
              ) : (
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 animate-bounce">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            
            <h3 className="text-base font-bold text-gray-800 mb-1">正在儲存專案</h3>
            <p className="text-xs text-gray-500 mb-4 h-5">{saveProgressText}</p>
            
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2 relative">
              <div 
                className="bg-gradient-to-r from-[var(--c-pri)] to-[var(--luxury-gold)] h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${saveProgress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-[var(--c-pri)]">{saveProgress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
