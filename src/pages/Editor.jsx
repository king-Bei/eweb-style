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
  BookOpen
} from 'lucide-react';
import * as ClassicEngine from '../ExportEngine';
import * as MagazineEngine from '../ExportEngineMagazine';
import FormHero from '../components/FormHero';
import FormQuickInfo from '../components/FormQuickInfo';
import FormHighlights from '../components/FormHighlights';
import FormSpots from '../components/FormSpots';
import FormFlights from '../components/FormFlights';
import FormHotels from '../components/FormHotels';
import FormDays from '../components/FormDays';
import FormNotices from '../components/FormNotices';
import FormRecommended from '../components/FormRecommended';
import FormCTA from '../components/FormCTA';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef(null);

  // State for itinerary data
  const [itinerary, setItinerary] = useState({
    title: '',
    hero_data: {},
    quick_info: {},
    highlights: {},
    spots: {},
    notices: {},
    recommended: {}
  });
  const [status, setStatus] = useState('草稿');
  const [publishDateNote, setPublishDateNote] = useState('');
  const [flights, setFlights] = useState({});
  const [days, setDays] = useState({});
  const [hotels, setHotels] = useState({});
  const [cta, setCta] = useState({});

  // Preview Mode & Export Output
  const [theme, setTheme] = useState('classic');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [autoPreview, setAutoPreview] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [exportCodes, setExportCodes] = useState({ html: '', css: '', js: '' });

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
      setItinerary({
        title: data.title,
        hero_data: data.hero_data || {},
        quick_info: data.quick_info || {},
        highlights: data.highlights || {},
        spots: data.spots || {},
        notices: data.notices || {},
        recommended: data.recommended || {}
      });
      setStatus(data.status || '草稿');
      setPublishDateNote(data.publish_date_note || '');

      const f_items = data.itinerary_flights ? data.itinerary_flights.map(f => f.flight_data) : [];
      setFlights({ visible: data.config?.flights_visible !== false, items: f_items });

      const d_items = data.itinerary_days ? data.itinerary_days.sort((a, b) => a.day_index - b.day_index).map(d => d.content) : [];
      setDays({ visible: data.config?.days_visible !== false, items: d_items });

      const h_items = data.itinerary_hotels ? data.itinerary_hotels.map(h => h.hotel_group_data) : [];
      setHotels({ visible: data.config?.hotels_visible !== false, layout: data.config?.hotelLayout || 'overlap', items: h_items });

      setCta({
        visible: data.config?.cta_visible !== false,
        cta_register_url: data.config?.cta_register_url || '',
        cta_line_url: data.config?.cta_line_url || ''
      });

      setTheme(data.config?.theme || 'classic');

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
    try {
      const user = await authApi.getUser();
      const config = {
        theme,
        flights_visible: flights.visible,
        days_visible: days.visible,
        hotels_visible: hotels.visible,
        hotelLayout: hotels.layout,
        cta_visible: cta.visible,
        cta_register_url: cta.cta_register_url,
        cta_line_url: cta.cta_line_url
      };

      await itineraryApi.update(id, {
        title: itinerary.title,
        hero_data: itinerary.hero_data,
        quick_info: itinerary.quick_info,
        highlights: itinerary.highlights,
        spots: itinerary.spots,
        notices: itinerary.notices,
        recommended: itinerary.recommended,
        config,
        status,
        publish_date_note: publishDateNote,
        last_modifier_name: user?.name || user?.id || '未知'
      });

      await flightApi.save(id, flights.items || []);
      const daysToSave = (days.items || []).map((content, idx) => ({ day_index: idx + 1, content }));
      await daysApi.save(id, daysToSave);
      await hotelsApi.save(id, hotels.items || []);

      alert('儲存成功！');
      localStorage.setItem(backupSavedKey, String(Date.now()));
      localStorage.removeItem(backupKey);
      setPendingBackup(null);

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
    } catch (err) {
      console.error(err);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;
    const engine = theme === 'magazine' ? MagazineEngine : ClassicEngine;
    const html = engine.generateHtml(itinerary, flights, days, hotels, cta);
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
  body { margin: 0; padding: 0; font-family: "PingFang TC", "Microsoft JhengHei", sans-serif; background: #fff; }
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

  const handleRefreshPreview = () => {
    setPreviewVersion(version => version + 1);
  };

  const handleExport = () => {
    const engine = theme === 'magazine' ? MagazineEngine : ClassicEngine;
    setExportCodes({
      html: engine.generateHtml(itinerary, flights, days, hotels, cta),
      css: engine.generateCss(),
      js: engine.generateJs()
    });
    setShowExport(true);
  };

  const handleCopy = (type) => {
    navigator.clipboard.writeText(exportCodes[type]);
    alert(`已複製 ${type.toUpperCase()} 代碼！`);
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
      if (snapshot.days) setDays(snapshot.days);
      if (snapshot.hotels) setHotels(snapshot.hotels);
      if (snapshot.cta) setCta(snapshot.cta);
      if (snapshot.status) setStatus(snapshot.status);
      if (snapshot.publish_date_note !== undefined) setPublishDateNote(snapshot.publish_date_note || '');
      if (snapshot.theme || snapshot.config?.theme) setTheme(snapshot.theme || snapshot.config.theme);
      setShowHistoryModal(false);
      alert('已還原版本，請記得點擊「儲存變更」以確認覆蓋。');
    } catch (err) {
      alert('還原失敗');
    }
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
              {theme === 'magazine' ? '雜誌風格' : '經典風格'}
            </div>
            <button className="editor-link-button" onClick={handleExport}>
              <Code size={14} /> 匯出代碼
            </button>
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
                  <button className="btn-gold px-3 py-1 text-xs flex items-center gap-1" onClick={() => handleCopy('css')}>
                    <Copy size={12} /> 一鍵複製 CSS
                  </button>
                </div>
                <textarea readOnly value={exportCodes.css} className="w-full h-20 bg-gray-50 text-xs font-mono p-2 border border-gray-300 rounded cursor-text" onClick={e => e.target.select()} />
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-gray-700">3. JS 腳本</span>
                  <button className="btn-gold px-3 py-1 text-xs flex items-center gap-1" onClick={() => handleCopy('js')}>
                    <Copy size={12} /> 一鍵複製 JS
                  </button>
                </div>
                <textarea readOnly value={exportCodes.js} className="w-full h-20 bg-gray-50 text-xs font-mono p-2 border border-gray-300 rounded cursor-text" onClick={e => e.target.select()} />
              </div>
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
            <div className="editor-form-card">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="form-label text-[var(--c-pri)] font-bold mb-1 block text-sm">行程名稱</label>
                  <input type="text" className="form-control font-bold" value={itinerary.title} onChange={e => setItinerary({ ...itinerary, title: e.target.value })} />
                </div>
              </div>
            </div>

            <FormHero heroData={itinerary.hero_data} onChange={(d) => setItinerary({ ...itinerary, hero_data: d })} />
            <FormQuickInfo data={itinerary.quick_info} onChange={(d) => setItinerary({ ...itinerary, quick_info: d })} />
            <FormHighlights data={itinerary.highlights} onChange={(d) => setItinerary({ ...itinerary, highlights: d })} />
            <FormSpots data={itinerary.spots} onChange={(d) => setItinerary({ ...itinerary, spots: d })} />
            <FormFlights data={flights} onChange={setFlights} />
            <FormHotels data={hotels} onChange={setHotels} />
            <FormDays data={days} onChange={setDays} />
            <FormNotices data={itinerary.notices} onChange={(d) => setItinerary({ ...itinerary, notices: d })} />
            <FormCTA data={cta} onChange={setCta} />
            <FormRecommended data={itinerary.recommended} onChange={(d) => setItinerary({ ...itinerary, recommended: d })} />
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

          <div className="editor-preview-canvas">
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
    </div>
  );
}
