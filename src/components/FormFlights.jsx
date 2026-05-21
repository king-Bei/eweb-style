import React, { useState } from 'react';
import { codeLookupApi, flightTemplateApi } from '../api';
import { Search, Save } from 'lucide-react';

export default function FormFlights({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const items = data.items || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTargetIndex, setSearchTargetIndex] = useState(0);

  const addItem = () => {
    onChange({
      ...data,
      items: [...items, {
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
        // Legacy fields for backward compatibility with export engines
        fTime: '', fCode: '', tTime: '', tCode: '', fn: '', dur: ''
      }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    const nextValue = ['airline_code', 'dep_location_en', 'arr_location_en', 'flight_no'].includes(field)
      ? value.toUpperCase()
      : value;
    const item = { ...newItems[index], [field]: nextValue };

    // Auto sync legacy fields for Export Engines
    if (field === 'dep_time') item.fTime = value;
    if (field === 'arr_time') item.tTime = value;
    if (['dep_location_zh', 'dep_location_en'].includes(field)) {
      item.fCode = `${item.dep_location_zh || ''} ${item.dep_location_en || ''}`.trim();
    }
    if (['arr_location_zh', 'arr_location_en'].includes(field)) {
      item.tCode = `${item.arr_location_zh || ''} ${item.arr_location_en || ''}`.trim();
    }
    if (['airline_name_zh', 'airline_name_en', 'flight_no'].includes(field)) {
      item.fn = `${item.airline_name_zh || ''} ${item.airline_name_en || ''} ${item.flight_no || ''}`.trim();
    }

    newItems[index] = item;
    onChange({ ...data, items: newItems });
  };

  const patchItem = (index, updates) => {
    const newItems = [...items];
    const item = { ...newItems[index], ...updates };
    item.fTime = item.dep_time || '';
    item.tTime = item.arr_time || '';
    item.fCode = `${item.dep_location_zh || ''} ${item.dep_location_en || ''}`.trim();
    item.tCode = `${item.arr_location_zh || ''} ${item.arr_location_en || ''}`.trim();
    item.fn = `${item.airline_name_zh || ''} ${item.airline_name_en || ''} ${item.flight_no || ''}`.trim();
    newItems[index] = item;
    onChange({ ...data, items: newItems });
  };

  const applyAirlineCode = async (index) => {
    const item = items[index];
    if (!item?.airline_code) return;
    try {
      const airline = await codeLookupApi.getAirline(item.airline_code);
      if (!airline) return;
      patchItem(index, {
        airline_code: airline.code,
        airline_name_zh: airline.name_zh,
        airline_name_en: airline.name_en
      });
    } catch (err) {
      console.error(err);
    }
  };

  const applyCityCode = async (index, direction) => {
    const item = items[index];
    const codeField = direction === 'dep' ? 'dep_location_en' : 'arr_location_en';
    const zhField = direction === 'dep' ? 'dep_location_zh' : 'arr_location_zh';
    if (!item?.[codeField]) return;
    try {
      const city = await codeLookupApi.getCity(item[codeField]);
      if (!city) return;
      patchItem(index, {
        [codeField]: city.code,
        [zhField]: city.city_zh
      });
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchTargetIndex(items.length); // 全域搜尋預設新增為下一筆
    try {
      const results = await flightTemplateApi.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const searchFlightNo = async (index) => {
    const item = items[index];
    if (!item?.flight_no) return;
    setIsSearching(true);
    setSearchTargetIndex(index); // 記錄當前欄位索引
    try {
      const results = await flightTemplateApi.search(item.flight_no);
      if (results.length === 1) {
        applyTemplate(index, results[0]);
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const applyTemplate = (index, template) => {
    const newItems = [...items];
    const item = newItems[index] ? { ...newItems[index] } : { tag: '去程' };
    item.airline_code = template.airline_code || '';
    item.airline_name_zh = template.airline_name_zh || '';
    item.airline_name_en = template.airline_name_en || '';
    item.flight_no = template.flight_no || '';
    item.dep_location_zh = template.dep_location_zh || '';
    item.dep_location_en = template.dep_location_en || '';
    item.arr_location_zh = template.arr_location_zh || '';
    item.arr_location_en = template.arr_location_en || '';
    item.dep_time = template.dep_time || '';
    item.arr_time = template.arr_time || '';

    // Sync Legacy
    item.fTime = item.dep_time;
    item.tTime = item.arr_time;
    item.fCode = `${item.dep_location_zh} ${item.dep_location_en}`.trim();
    item.tCode = `${item.arr_location_zh} ${item.arr_location_en}`.trim();
    item.fn = `${item.airline_name_zh} ${item.airline_name_en} ${item.flight_no}`.trim();

    newItems[index] = item;
    onChange({ ...data, items: newItems });
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
      alert('已成功儲存至航班資料庫！未來可直接搜尋帶入。');
    } catch (err) {
      console.error(err);
      alert('儲存至資料庫失敗');
    }
  };

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}5. 專屬航班 (Timeline)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>

      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>
          {data.visible !== false && (
            <>
              <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="form-label font-bold text-[var(--c-pri)]">雜誌頁航班呈現方式經典不適用</label>
                <select
                  className="form-control"
                  style={{ marginBottom: 0 }}
                  value={data.magazine_layout || 'auto'}
                  onChange={e => onChange({ ...data, magazine_layout: e.target.value })}
                >
                  <option value="auto">自動判斷</option>
                  <option value="roundtrip_card">單點來回／單航空方案卡</option>
                  <option value="multi_segment">同航空四段／多段時間軸</option>
                  <option value="domestic_connection">含中段國內線／行程鏈</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  自動判斷：2 段以下用方案卡，4 段以上同航空用多段時間軸，其餘用行程鏈。
                </p>
              </div>

              {/* Flight Search Global Tools */}
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

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-4 bg-white border border-[var(--luxury-gold)] p-3 rounded-lg shadow-sm">
                  <h4 className="text-xs font-bold mb-2 text-[var(--c-pri)]">搜尋結果 (點擊套用至 {searchTargetIndex < items.length ? `第 ${searchTargetIndex + 1} 筆` : '新增航班'})</h4>
                  <div className="flex flex-col gap-2">
                    {searchResults.map(res => (
                      <div key={res.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 hover:border-[var(--luxury-gold)] cursor-pointer" onClick={() => applyTemplate(searchTargetIndex, res)}>
                        <span className="text-sm font-bold">{res.flight_no}</span>
                        <span className="text-xs text-gray-600">{res.airline_name_zh} ({res.airline_code})</span>
                        <span className="text-xs text-gray-600">{res.dep_location_zh} ➔ {res.arr_location_zh}</span>
                        <span className="text-xs text-gray-600">{res.dep_time} - {res.arr_time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flights Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap mb-4 border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-2 border border-gray-200 font-bold" style={{ minWidth: '80px' }}>標籤</th>
                      <th className="p-2 border border-gray-200 font-bold">航代 (Code)</th>
                      <th className="p-2 border border-gray-200 font-bold">中/英航空名</th>
                      <th className="p-2 border border-gray-200 font-bold">航班號</th>
                      <th className="p-2 border border-gray-200 font-bold">起點 (中/英)</th>
                      <th className="p-2 border border-gray-200 font-bold">終點 (中/英)</th>
                      <th className="p-2 border border-gray-200 font-bold">起/降時間</th>
                      <th className="p-2 border border-gray-200 font-bold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-2 border border-gray-200">
                          <select className="form-control" style={{ marginBottom: 0, padding: '4px', height: '30px' }} value={item.tag || '去程'} onChange={e => updateItem(i, 'tag', e.target.value)}>
                            <option value="去程">去程</option>
                            <option value="回程">回程</option>
                          </select>
                        </td>
                        <td className="p-2 border border-gray-200">
                          <input
                            type="text"
                            className="form-control"
                            style={{ marginBottom: 0, padding: '4px', height: '30px', width: '60px' }}
                            value={item.airline_code || ''}
                            onChange={e => updateItem(i, 'airline_code', e.target.value)}
                            onBlur={() => applyAirlineCode(i)}
                            placeholder="BR"
                            title="輸入航代後離開欄位，會自動帶入航空公司中英文"
                          />
                        </td>
                        <td className="p-2 border border-gray-200">
                          <div className="flex flex-col gap-1">
                            <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px' }} value={item.airline_name_zh || ''} onChange={e => updateItem(i, 'airline_name_zh', e.target.value)} placeholder="長榮航空" />
                            <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px' }} value={item.airline_name_en || ''} onChange={e => updateItem(i, 'airline_name_en', e.target.value)} placeholder="EVA AIR" />
                          </div>
                        </td>
                        <td className="p-2 border border-gray-200">
                          <input
                            type="text"
                            className="form-control"
                            style={{ marginBottom: 0, padding: '4px', height: '30px', width: '80px' }}
                            value={item.flight_no || ''}
                            onChange={e => updateItem(i, 'flight_no', e.target.value)}
                            onBlur={() => searchFlightNo(i)}
                            onKeyDown={e => e.key === 'Enter' && searchFlightNo(i)}
                            placeholder="BR397"
                            title="輸入航班號後按 Enter 或離開欄位，若資料庫有紀錄會帶入時間與 CITY CODE"
                          />
                        </td>
                        <td className="p-2 border border-gray-200">
                          <div className="flex flex-col gap-1">
                            <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '80px' }} value={item.dep_location_zh || ''} onChange={e => updateItem(i, 'dep_location_zh', e.target.value)} placeholder="台北" />
                            <input
                              type="text"
                              className="form-control text-xs"
                              style={{ marginBottom: 0, padding: '4px', height: '26px', width: '80px' }}
                              value={item.dep_location_en || ''}
                              onChange={e => updateItem(i, 'dep_location_en', e.target.value)}
                              onBlur={() => applyCityCode(i, 'dep')}
                              placeholder="TPE"
                              title="輸入 CITY CODE 後離開欄位，會自動帶入中文城市"
                            />
                          </div>
                        </td>
                        <td className="p-2 border border-gray-200">
                          <div className="flex flex-col gap-1">
                            <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '80px' }} value={item.arr_location_zh || ''} onChange={e => updateItem(i, 'arr_location_zh', e.target.value)} placeholder="河內" />
                            <input
                              type="text"
                              className="form-control text-xs"
                              style={{ marginBottom: 0, padding: '4px', height: '26px', width: '80px' }}
                              value={item.arr_location_en || ''}
                              onChange={e => updateItem(i, 'arr_location_en', e.target.value)}
                              onBlur={() => applyCityCode(i, 'arr')}
                              placeholder="HAN"
                              title="輸入 CITY CODE 後離開欄位，會自動帶入中文城市"
                            />
                          </div>
                        </td>
                        <td className="p-2 border border-gray-200">
                          <div className="flex flex-col gap-1">
                            <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '80px' }} value={item.dep_time || ''} onChange={e => updateItem(i, 'dep_time', e.target.value)} placeholder="09:00" />
                            <input type="text" className="form-control text-xs" style={{ marginBottom: 0, padding: '4px', height: '26px', width: '80px' }} value={item.arr_time || ''} onChange={e => updateItem(i, 'arr_time', e.target.value)} placeholder="11:05" />
                          </div>
                        </td>
                        <td className="p-2 border border-gray-200 text-center">
                          <div className="flex flex-col gap-2 items-center">
                            <button onClick={() => saveToDatabase(item)} className="text-[var(--luxury-gold)] hover:text-black flex items-center gap-1 text-xs mx-auto" title="儲存至航班資料庫">
                              <Save size={14} /> 存資料庫
                            </button>
                            <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-xs">✖ 刪除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button onClick={addItem} className="btn-outline-gold" style={{ width: '100%', padding: '8px' }}>+ 新增航班段</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
