import { useState } from 'react';
import { codeLookupApi, flightTemplateApi } from '../api';
import { Search, Save, Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

const EMPTY_FLIGHT = {
  tag: '去程',
  airline_code: '',
  airline_name_zh: '',
  airline_name_en: '',
  flight_no: '',
  dep_location_zh: '',
  dep_location_en: '',
  arr_location_zh: '',
  arr_location_en: '',
  dep_time: '',
  arr_time: '',
  fTime: '', fCode: '', tCode: '', fn: '', dur: ''
};

const EMPTY_GROUP = {
  group_name: '去程',
  direction: 'outbound',
  layout: 'timeline',
  items: []
};

function syncLegacy(item) {
  return {
    ...item,
    fTime: item.dep_time || '',
    tTime: item.arr_time || '',
    fCode: `${item.dep_location_zh || ''} ${item.dep_location_en || ''}`.trim(),
    tCode: `${item.arr_location_zh || ''} ${item.arr_location_en || ''}`.trim(),
    fn: `${item.airline_name_zh || ''} ${item.airline_name_en || ''} ${item.flight_no || ''}`.trim(),
  };
}

// 將舊版 flat items 自動升級為組別結構
function migrateToGroups(data) {
  if (data.groups && data.groups.length > 0) return data;
  const items = data.items || [];
  if (items.length === 0) return { ...data, groups: [{ ...EMPTY_GROUP, items: [] }] };

  // 按 tag 分組
  const groupMap = {};
  const groupOrder = [];
  items.forEach(item => {
    const key = item.tag || '去程';
    if (!groupMap[key]) {
      groupMap[key] = [];
      groupOrder.push(key);
    }
    groupMap[key].push(item);
  });

  const groups = groupOrder.map(name => ({
    group_name: name,
    direction: name.includes('回') ? 'return' : 'outbound',
    layout: 'timeline',
    items: groupMap[name]
  }));

  return { ...data, groups };
}

export default function FormFlights({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTarget, setSearchTarget] = useState({ groupIdx: 0, itemIdx: -1 });

  // 向下相容：自動升級舊版資料
  const migratedData = migrateToGroups(data);
  const groups = migratedData.groups || [{ ...EMPTY_GROUP, items: [] }];

  const updateData = (newGroups) => {
    onChange({ ...migratedData, groups: newGroups, items: newGroups.flatMap(g => g.items) });
  };

  // ── Group actions ──
  const addGroup = () => {
    const isReturn = groups.some(g => (g.direction || g.group_name || '').includes('return') || String(g.group_name || '').includes('回'));
    updateData([...groups, { ...EMPTY_GROUP, group_name: isReturn ? `組別 ${groups.length + 1}` : '回程', direction: isReturn ? 'custom' : 'return', items: [] }]);
  };

  const autoGroupByAirline = () => {
    const allItems = groups.flatMap(g => g.items || []);
    if (allItems.length === 0) return alert('目前尚無航班可進行分組');

    const isReturnFlight = (f) => String(f.tag || '').includes('回') || String(f.direction || '').includes('return');

    const matchedGroups = [];
    allItems.forEach(flight => {
      if (isReturnFlight(flight)) {
        const flightCode = String(flight.airline_code || '').trim().toUpperCase();
        const flightZh = String(flight.airline_name_zh || '').trim().toUpperCase();

        const sameAirlineGroup = matchedGroups.find(g => {
          if (g.items.length >= 2) return false;
          const first = g.items[0];
          if (!first || isReturnFlight(first)) return false;
          const firstCode = String(first.airline_code || '').trim().toUpperCase();
          const firstZh = String(first.airline_name_zh || '').trim().toUpperCase();
          return (flightCode && firstCode && flightCode === firstCode) ||
            (flightZh && firstZh && flightZh === firstZh);
        });

        if (sameAirlineGroup) {
          sameAirlineGroup.items.push({ ...flight, tag: '回程' });
        } else {
          matchedGroups.push({
            group_name: flight.airline_name_zh || flight.airline_code || '回程航班',
            direction: 'return',
            layout: 'timeline',
            items: [{ ...flight, tag: '回程' }]
          });
        }
      } else {
        matchedGroups.push({
          group_name: flight.airline_name_zh || flight.airline_code || '去程航班',
          direction: 'outbound',
          layout: 'timeline',
          items: [{ ...flight, tag: '去程' }]
        });
      }
    });

    const finalGroups = [];
    matchedGroups.forEach(g => {
      const airlineName = g.group_name;
      const existing = finalGroups.find(fg => fg.group_name === airlineName && fg.items.length < 2);
      if (existing && g.items[0] && isReturnFlight(g.items[0]) && !existing.items.some(isReturnFlight)) {
        existing.items.push(g.items[0]);
      } else {
        finalGroups.push(g);
      }
    });

    const result = finalGroups.map((g, idx) => {
      const hasOut = g.items.some(item => !isReturnFlight(item));
      const hasIn = g.items.some(item => isReturnFlight(item));
      let dir = 'custom';
      if (hasOut && hasIn) dir = 'custom';
      else if (hasOut) dir = 'outbound';
      else if (hasIn) dir = 'return';

      return {
        group_name: g.group_name || `航班組別 ${idx + 1}`,
        direction: dir,
        layout: 'timeline',
        items: g.items
      };
    });

    updateData(result);
    alert('已成功依航空公司進行去回程配對分組！');
  };

  const removeGroup = (gi) => {
    if (!window.confirm(`確定要刪除「${groups[gi].group_name}」這整個組別？`)) return;
    updateData(groups.filter((_, i) => i !== gi));
  };

  const updateGroupField = (gi, field, value) => {
    const next = groups.map((g, i) => i === gi ? { ...g, [field]: value } : g);
    updateData(next);
  };

  const toggleGroup = (gi) => {
    setCollapsedGroups(prev => ({ ...prev, [gi]: !prev[gi] }));
  };

  const moveGroup = (gi, direction) => {
    const nextIndex = gi + direction;
    if (nextIndex < 0 || nextIndex >= groups.length) return;
    const nextGroups = [...groups];
    const temp = nextGroups[gi];
    nextGroups[gi] = nextGroups[nextIndex];
    nextGroups[nextIndex] = temp;
    updateData(nextGroups);
  };

  const moveItem = (gi, ii, direction) => {
    const g = groups[gi];
    const nextIndex = ii + direction;
    if (nextIndex < 0 || nextIndex >= g.items.length) return;
    const nextItems = [...g.items];
    const temp = nextItems[ii];
    nextItems[ii] = nextItems[nextIndex];
    nextItems[nextIndex] = temp;
    const nextGroups = groups.map((group, i) => i === gi ? { ...group, items: nextItems } : group);
    updateData(nextGroups);
  };

  // ── Item actions ──
  const addItem = (gi) => {
    const next = groups.map((g, i) =>
      i === gi ? { ...g, items: [...g.items, { ...EMPTY_FLIGHT }] } : g
    );
    updateData(next);
  };

  const updateItem = (gi, ii, field, value) => {
    const next = groups.map((g, i) => {
      if (i !== gi) return g;
      const newItems = g.items.map((item, j) => {
        if (j !== ii) return item;
        const autoUpper = ['airline_code', 'dep_location_en', 'arr_location_en', 'flight_no'].includes(field);
        const updated = { ...item, [field]: autoUpper ? value.toUpperCase() : value };
        return syncLegacy(updated);
      });
      return { ...g, items: newItems };
    });
    updateData(next);
  };

  const patchItem = (gi, ii, updates) => {
    const next = groups.map((g, i) => {
      if (i !== gi) return g;
      const newItems = g.items.map((item, j) => {
        if (j !== ii) return item;
        return syncLegacy({ ...item, ...updates });
      });
      return { ...g, items: newItems };
    });
    updateData(next);
  };

  const removeItem = (gi, ii) => {
    const next = groups.map((g, i) => {
      if (i !== gi) return g;
      return { ...g, items: g.items.filter((_, j) => j !== ii) };
    });
    updateData(next);
  };

  // ── API lookup ──
  const applyAirlineCode = async (gi, ii) => {
    const item = groups[gi]?.items[ii];
    if (!item?.airline_code) return;
    try {
      const airline = await codeLookupApi.getAirline(item.airline_code);
      if (!airline) return;
      patchItem(gi, ii, { airline_code: airline.code, airline_name_zh: airline.name_zh, airline_name_en: airline.name_en });
    } catch (err) { console.error(err); }
  };

  const applyCityCode = async (gi, ii, direction) => {
    const item = groups[gi]?.items[ii];
    const codeField = direction === 'dep' ? 'dep_location_en' : 'arr_location_en';
    const zhField = direction === 'dep' ? 'dep_location_zh' : 'arr_location_zh';
    if (!item?.[codeField]) return;
    try {
      const city = await codeLookupApi.getCity(item[codeField]);
      if (!city) return;
      patchItem(gi, ii, { [codeField]: city.code, [zhField]: city.city_zh });
    } catch (err) { console.error(err); }
  };

  const searchFlightNo = async (gi, ii) => {
    const item = groups[gi]?.items[ii];
    if (!item?.flight_no) return;
    setSearchTarget({ groupIdx: gi, itemIdx: ii });
    setIsSearching(true);
    try {
      const results = await flightTemplateApi.search(item.flight_no);
      if (results.length === 1) {
        applyTemplate(gi, ii, results[0]);
      } else {
        setSearchResults(results);
      }
    } catch (err) { console.error(err); }
    finally { setIsSearching(false); }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const results = await flightTemplateApi.search(searchQuery);
      setSearchResults(results);
    } catch (err) { console.error(err); }
    finally { setIsSearching(false); }
  };

  const applyTemplate = (gi, ii, template) => {
    const updates = {
      airline_code: template.airline_code || '',
      airline_name_zh: template.airline_name_zh || '',
      airline_name_en: template.airline_name_en || '',
      flight_no: template.flight_no || '',
      dep_location_zh: template.dep_location_zh || '',
      dep_location_en: template.dep_location_en || '',
      arr_location_zh: template.arr_location_zh || '',
      arr_location_en: template.arr_location_en || '',
      dep_time: template.dep_time || '',
      arr_time: template.arr_time || '',
    };
    patchItem(gi, ii, updates);
    setSearchResults([]);
    setSearchQuery('');
  };

  const saveToDatabase = async (item) => {
    if (!item.flight_no) return alert('請先輸入航班號碼');
    try {
      await flightTemplateApi.save({
        airline_code: item.airline_code,
        airline_name_zh: item.airline_name_zh,
        airline_name_en: item.airline_name_en,
        flight_no: item.flight_no,
        dep_location_zh: item.dep_location_zh,
        dep_location_en: item.dep_location_en,
        arr_location_zh: item.arr_location_zh,
        arr_location_en: item.arr_location_en,
        dep_time: item.dep_time,
        arr_time: item.arr_time
      });
      alert('已成功儲存至航班資料庫！');
    } catch (err) {
      console.error(err);
      alert('儲存至資料庫失敗');
    }
  };

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      {/* Module Header */}
      <div
        className="module-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {isCollapsed ? '▶️ ' : '🔽 '} 航程航班 ({groups.length} 組別)
        </h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={data.visible !== false}
            onChange={e => onChange({ ...migratedData, visible: e.target.checked })}
          />
          顯示
        </label>
      </div>

      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>
          {data.visible !== false && (
            <>
              {/* Global search */}
              <div className="mb-4 flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap">🔍 從資料庫匯入：</span>
                <input
                  type="text"
                  className="form-control"
                  style={{ marginBottom: 0, padding: '6px 12px' }}
                  placeholder="輸入航班號 (如 BR 397)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn-outline-gold px-3 py-1 text-sm flex items-center gap-1" onClick={handleSearch} disabled={isSearching}>
                  <Search size={14} /> {isSearching ? '搜尋中' : '搜尋'}
                </button>
              </div>

              <div className="mb-4 flex flex-wrap gap-3 items-center bg-purple-50 p-3 rounded-lg border border-purple-100">
                <span className="text-sm font-bold text-[var(--c-pri)] whitespace-nowrap">雜誌風航班版型</span>
                <select
                  className="form-control"
                  style={{ marginBottom: 0, padding: '6px 10px', width: '220px', fontSize: '13px' }}
                  value={migratedData.magazine_layout || 'auto'}
                  onChange={e => onChange({ ...migratedData, magazine_layout: e.target.value })}
                >
                  <option value="auto">自動判斷</option>
                  <option value="roundtrip_card">雙卡往返</option>
                  <option value="multi_segment">多段航程</option>
                  <option value="domestic_connection">中段銜接</option>
                </select>
                <span className="text-xs text-gray-500">經典版則使用每個組別自己的呈現方式。</span>
                <button
                  type="button"
                  onClick={autoGroupByAirline}
                  className="btn-outline-gold px-3 py-1.5 text-xs font-bold flex items-center gap-1 bg-white ml-auto"
                  title="將所有航段依航空公司自動整理為去回程組別"
                >
                  ✈️ 依航空自動分組
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-4 bg-white border border-[var(--luxury-gold)] p-3 rounded-lg shadow-sm">
                  <h4 className="text-xs font-bold mb-2 text-[var(--c-pri)]">
                    搜尋結果（點擊套用至第 {searchTarget.itemIdx + 1} 航段，或新增航段）
                  </h4>
                  <div className="flex flex-col gap-2">
                    {searchResults.map(res => (
                      <div
                        key={res.id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 hover:border-[var(--luxury-gold)] cursor-pointer"
                        onClick={() => {
                          const { groupIdx, itemIdx } = searchTarget;
                          if (itemIdx >= 0) {
                            applyTemplate(groupIdx, itemIdx, res);
                          } else {
                            // 新增到當前組別
                            const next = groups.map((g, i) =>
                              i === groupIdx ? { ...g, items: [...g.items, syncLegacy({ ...EMPTY_FLIGHT, ...res })] } : g
                            );
                            updateData(next);
                            setSearchResults([]);
                            setSearchQuery('');
                          }
                        }}
                      >
                        <span className="text-sm font-bold">{res.flight_no}</span>
                        <span className="text-xs text-gray-600">{res.airline_name_zh} ({res.airline_code})</span>
                        <span className="text-xs text-gray-600">{res.dep_location_zh} ➔ {res.arr_location_zh}</span>
                        <span className="text-xs text-gray-600">{res.dep_time} - {res.arr_time}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-2 text-xs text-gray-400 hover:text-gray-600" onClick={() => setSearchResults([])}>關閉</button>
                </div>
              )}

              {/* ── 組別列表 ── */}
              <div className="flex flex-col gap-4">
                {groups.map((group, gi) => (
                  <div key={gi} style={{ border: '2px solid #e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
                    {/* 組別標題列 */}
                    <div style={{ backgroundColor: 'rgba(76,42,133,0.05)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(gi)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-pri)', padding: 0 }}
                      >
                        {collapsedGroups[gi] ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {/* 組別名稱 */}
                      <input
                        type="text"
                        className="form-control"
                        style={{ marginBottom: 0, padding: '4px 10px', height: '32px', width: '120px', fontWeight: 'bold', color: 'var(--c-pri)' }}
                        value={group.group_name}
                        onChange={e => updateGroupField(gi, 'group_name', e.target.value)}
                        placeholder="去程 / 回程"
                        onClick={e => e.stopPropagation()}
                      />

                      {/* 去回程標註 */}
                      <select
                        className="form-control"
                        style={{ marginBottom: 0, padding: '4px 8px', height: '32px', width: '112px', fontSize: '13px' }}
                        value={group.direction || (String(group.group_name || '').includes('回') ? 'return' : 'outbound')}
                        onChange={e => updateGroupField(gi, 'direction', e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="outbound">去程標註</option>
                        <option value="return">回程標註</option>
                        <option value="custom">其他標註</option>
                      </select>

                      {/* 呈現方式 */}
                      <select
                        className="form-control"
                        style={{ marginBottom: 0, padding: '4px 8px', height: '32px', width: '150px', fontSize: '13px' }}
                        value={group.layout === 'boarding' ? 'card' : (group.layout || 'timeline')}
                        onChange={e => updateGroupField(gi, 'layout', e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="timeline">⏱ 時間軸（橫向）</option>
                        <option value="card">🃏 卡片式</option>
                        <option value="table">📋 表格式</option>
                      </select>

                      <span className="text-xs text-gray-500 ml-1">{group.items.length} 航段</span>

                      <button
                        type="button"
                        onClick={() => { setSearchTarget({ groupIdx: gi, itemIdx: -1 }); }}
                        className="btn-outline-gold px-2 py-1 text-xs ml-auto"
                        title="從資料庫搜尋並加入此組"
                      >
                        <Search size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveGroup(gi, -1)}
                        disabled={gi === 0}
                        style={{ background: 'none', border: 'none', cursor: gi === 0 ? 'not-allowed' : 'pointer', color: 'var(--c-pri)', opacity: gi === 0 ? 0.3 : 1, padding: '0 4px' }}
                        title="上移此組別"
                      >
                        ▲
                      </button>

                      <button
                        type="button"
                        onClick={() => moveGroup(gi, 1)}
                        disabled={gi === groups.length - 1}
                        style={{ background: 'none', border: 'none', cursor: gi === groups.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--c-pri)', opacity: gi === groups.length - 1 ? 0.3 : 1, padding: '0 4px' }}
                        title="下移此組別"
                      >
                        ▼
                      </button>

                      <button
                        type="button"
                        onClick={() => removeGroup(gi)}
                        className="text-red-400 hover:text-red-600"
                        title="刪除此組別"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* 組別內航段 */}
                    {!collapsedGroups[gi] && (
                      <div style={{ padding: '12px 16px' }}>
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-left text-sm whitespace-nowrap mb-3 border-collapse">
                            <thead>
                              <tr className="bg-gray-100 text-gray-700">
                                <th className="p-2 border border-gray-200 font-bold" style={{ minWidth: '60px' }}>航代</th>
                                <th className="p-2 border border-gray-200 font-bold">中/英航空</th>
                                <th className="p-2 border border-gray-200 font-bold">航班號</th>
                                <th className="p-2 border border-gray-200 font-bold">起點</th>
                                <th className="p-2 border border-gray-200 font-bold">終點</th>
                                <th className="p-2 border border-gray-200 font-bold">起/降時間</th>
                                <th className="p-2 border border-gray-200 font-bold text-center">操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((item, ii) => (
                                <tr key={ii} className="hover:bg-gray-50">
                                  <td className="p-2 border border-gray-200">
                                    <input
                                      type="text"
                                      className="form-control"
                                      style={{ marginBottom: 0, padding: '4px', height: '30px', width: '54px' }}
                                      value={item.airline_code || ''}
                                      onChange={e => updateItem(gi, ii, 'airline_code', e.target.value)}
                                      onBlur={() => applyAirlineCode(gi, ii)}
                                      placeholder="BR"
                                      title="輸入航代後離開欄位自動帶入航空公司名稱"
                                    />
                                  </td>
                                  <td className="p-2 border border-gray-200">
                                    <div className="flex flex-col gap-1">
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px' }} value={item.airline_name_zh || ''} onChange={e => updateItem(gi, ii, 'airline_name_zh', e.target.value)} placeholder="長榮" />
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px' }} value={item.airline_name_en || ''} onChange={e => updateItem(gi, ii, 'airline_name_en', e.target.value)} placeholder="EVA AIR" />
                                    </div>
                                  </td>
                                  <td className="p-2 border border-gray-200">
                                    <input
                                      type="text"
                                      className="form-control"
                                      style={{ marginBottom: 0, padding: '4px', height: '30px', width: '80px' }}
                                      value={item.flight_no || ''}
                                      onChange={e => updateItem(gi, ii, 'flight_no', e.target.value)}
                                      onBlur={() => searchFlightNo(gi, ii)}
                                      onKeyDown={e => e.key === 'Enter' && searchFlightNo(gi, ii)}
                                      placeholder="BR397"
                                    />
                                  </td>
                                  <td className="p-2 border border-gray-200">
                                    <div className="flex flex-col gap-1">
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '76px' }} value={item.dep_location_zh || ''} onChange={e => updateItem(gi, ii, 'dep_location_zh', e.target.value)} placeholder="台北" />
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '76px' }} value={item.dep_location_en || ''} onChange={e => updateItem(gi, ii, 'dep_location_en', e.target.value)} onBlur={() => applyCityCode(gi, ii, 'dep')} placeholder="TPE" />
                                    </div>
                                  </td>
                                  <td className="p-2 border border-gray-200">
                                    <div className="flex flex-col gap-1">
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '76px' }} value={item.arr_location_zh || ''} onChange={e => updateItem(gi, ii, 'arr_location_zh', e.target.value)} placeholder="河內" />
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '76px' }} value={item.arr_location_en || ''} onChange={e => updateItem(gi, ii, 'arr_location_en', e.target.value)} onBlur={() => applyCityCode(gi, ii, 'arr')} placeholder="HAN" />
                                    </div>
                                  </td>
                                  <td className="p-2 border border-gray-200">
                                    <div className="flex flex-col gap-1">
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '76px' }} value={item.dep_time || ''} onChange={e => updateItem(gi, ii, 'dep_time', e.target.value)} placeholder="09:00" />
                                      <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '76px' }} value={item.arr_time || ''} onChange={e => updateItem(gi, ii, 'arr_time', e.target.value)} placeholder="11:05" />
                                    </div>
                                  </td>
                                  <td className="p-2 border border-gray-200 text-center">
                                    <div className="flex flex-col gap-1 items-center">
                                      <button onClick={() => saveToDatabase(item)} className="text-[var(--luxury-gold)] hover:text-black flex items-center gap-1 text-xs" style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="儲存至航班資料庫">
                                        <Save size={12} /> 存庫
                                      </button>
                                      <div className="flex gap-2 justify-center my-0.5">
                                        <button
                                          type="button"
                                          onClick={() => moveItem(gi, ii, -1)}
                                          disabled={ii === 0}
                                          style={{ background: 'none', border: 'none', cursor: ii === 0 ? 'not-allowed' : 'pointer', color: 'var(--c-pri)', opacity: ii === 0 ? 0.3 : 1, padding: '0 2px', fontSize: '11px' }}
                                          title="上移此航段"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveItem(gi, ii, 1)}
                                          disabled={ii === group.items.length - 1}
                                          style={{ background: 'none', border: 'none', cursor: ii === group.items.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--c-pri)', opacity: ii === group.items.length - 1 ? 0.3 : 1, padding: '0 2px', fontSize: '11px' }}
                                          title="下移此航段"
                                        >
                                          ▼
                                        </button>
                                      </div>
                                      <button onClick={() => removeItem(gi, ii)} className="text-red-500 hover:text-red-700 text-xs" style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="刪除航段">✖ 刪除</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button onClick={() => addItem(gi)} className="btn-outline-gold text-sm" style={{ width: '100%', padding: '6px' }}>
                          + 新增航段至「{group.group_name}」
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 新增組別按鈕 */}
              <button
                onClick={addGroup}
                className="btn-gold flex items-center gap-2 justify-center mt-4"
                style={{ width: '100%', padding: '10px' }}
              >
                <Plus size={16} /> 新增組別（去程 / 回程 / 中停…）
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
