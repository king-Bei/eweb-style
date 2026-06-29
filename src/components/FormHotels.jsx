import React from 'react';
import ImageAttributionInput from './ImageAttributionInput';
import CountryCodeFields from './CountryCodeFields';
import { hotelTemplateApi } from '../api';
import { Database, Plus, Save, Search } from 'lucide-react';

export default function FormHotels({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const items = data.items || [];
  const layout = data.layout || 'overlap';
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchCountry, setSearchCountry] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const addItem = () => {
    onChange({ ...data, items: [...items, { visible: true, country_code: '', country: '', country_en: '', city_zh: '', img: '', image_source: '', stars: '★★★★★', name: '', name_en: '', desc: '', tags: '' }] });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const databaseErrorMessage = error => error?.code === 'PGRST205' || error?.code === '42P01'
    ? '尚未建立飯店資料庫，請先在 Supabase 執行 supabase-travel-library.sql。'
    : (error?.message || '飯店資料庫操作失敗');

  const searchDatabase = async () => {
    if (!searchQuery.trim() && !searchCountry.trim()) {
      alert('請輸入國家代碼或飯店關鍵字');
      return;
    }
    setIsSearching(true);
    try {
      setSearchResults(await hotelTemplateApi.search(searchQuery, searchCountry));
    } catch (error) {
      alert(databaseErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  };

  const addFromDatabase = template => {
    onChange({
      ...data,
      items: [...items, {
        visible: true,
        country_code: template.country_code || '',
        country: template.country_zh || '',
        country_en: template.country_en || '',
        city_zh: template.city_zh || '',
        name: template.name_zh || '',
        name_en: template.name_en || '',
        stars: template.stars || '★★★★★',
        desc: template.description || '',
        img: template.image_url || '',
        image_source: template.image_source || '',
        tags: template.tags || ''
      }]
    });
  };

  const saveToDatabase = async item => {
    try {
      await hotelTemplateApi.save(item);
      alert(`已儲存「${item.name}」至飯店資料庫`);
    } catch (error) {
      alert(databaseErrorMessage(error));
    }
  };

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '} 嚴選旅宿 (Hotels)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>

          {data.visible !== false && (
            <>
              {/* 區塊標題設定 */}
              <div className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-1 block">區塊主標題 (Main Title)</label>
                  <input type="text" className="form-control" style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }} placeholder="嚴選旅宿 ‧ 奢輿棲所" value={data.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} />
                </div>
                <div>
                  <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-1 block">區塊英文副標 (Badge)</label>
                  <input type="text" className="form-control" style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }} placeholder="Exclusive Stays" value={data.subtitle || ''} onChange={e => onChange({ ...data, subtitle: e.target.value })} />
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--c-pri)]">
                  <Database size={16} /> 飯店資料庫
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-[140px_1fr_auto]">
                  <input
                    type="text"
                    className="form-control uppercase"
                    style={{ marginBottom: 0 }}
                    value={searchCountry}
                    onChange={event => setSearchCountry(event.target.value.toUpperCase())}
                    placeholder="國家代碼 JP"
                  />
                  <input
                    type="search"
                    className="form-control"
                    style={{ marginBottom: 0 }}
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    onKeyDown={event => event.key === 'Enter' && searchDatabase()}
                    placeholder="搜尋飯店、城市或介紹"
                  />
                  <button type="button" className="btn-outline-gold flex items-center justify-center gap-2" onClick={searchDatabase} disabled={isSearching}>
                    <Search size={15} /> {isSearching ? '搜尋中' : '搜尋'}
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-3 divide-y divide-gray-100 rounded border border-gray-200">
                    {searchResults.map(result => (
                      <div key={result.id} className="flex items-center gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm text-gray-800">{result.name_zh}{result.name_en ? ` / ${result.name_en}` : ''}</strong>
                          <span className="text-xs text-gray-500">{[result.country_code, result.country_zh, result.city_zh].filter(Boolean).join(' · ')}</span>
                        </div>
                        <button type="button" className="btn-outline-gold flex items-center gap-1 px-2 py-1 text-xs" onClick={() => addFromDatabase(result)}>
                          <Plus size={13} /> 加入
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label">版型選擇 (Layout)</label>
                <select className="form-control" value={layout} onChange={e => onChange({ ...data, layout: e.target.value })}>
                  <option value="overlap">破格交疊 (Overlap)</option>
                  <option value="grid">格狀展示 (Grid)</option>
                </select>
              </div>

              {items.map((item, i) => (
                <div key={i} className={item.visible === false ? 'opacity-50' : ''} style={{ backgroundColor: '#fafafa', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', borderLeft: '4px solid var(--c-pri)', marginBottom: '15px', position: 'relative' }}>
                  <button onClick={() => removeItem(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✖</button>
                  <label className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700 w-fit cursor-pointer">
                    <input type="checkbox" checked={item.visible !== false} onChange={e => updateItem(i, 'visible', e.target.checked)} />
                    顯示此住宿
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <CountryCodeFields
                      value={item}
                      onChange={updates => {
                        const nextItems = items.map((current, index) => index === i ? { ...current, ...updates } : current);
                        onChange({ ...data, items: nextItems });
                      }}
                    />
                    <div className="col-span-2">
                      <label className="form-label text-xs">城市／地區</label>
                      <input type="text" className="form-control" value={item.city_zh || ''} onChange={event => updateItem(i, 'city_zh', event.target.value)} placeholder="例如：東京" />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">飯店名稱</label>
                      <input type="text" className="form-control" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">飯店英文名稱</label>
                      <input type="text" className="form-control" value={item.name_en || ''} onChange={e => updateItem(i, 'name_en', e.target.value)} placeholder="Hotel English Name" />
                    </div>
                    <div>
                      <label className="form-label text-xs">星級評分 (Stars)</label>
                      <input type="text" className="form-control" value={item.stars} onChange={e => updateItem(i, 'stars', e.target.value)} placeholder="★★★★★" />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">圖片網址</label>
                      <input type="text" className="form-control" value={item.img} onChange={e => updateItem(i, 'img', e.target.value)} />
                      <ImageAttributionInput value={item.image_source || ''} onChange={value => updateItem(i, 'image_source', value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">介紹文字</label>
                      <textarea className="form-control" rows={3} value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)}></textarea>
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">飯店標籤 (多個標籤請以逗號或換行分隔)</label>
                      <input type="text" className="form-control" value={item.tags || ''} onChange={e => updateItem(i, 'tags', e.target.value)} placeholder="例如：頂級溫泉, 無邊際泳池, 米其林星級" />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button type="button" className="btn-outline-gold flex items-center gap-2" onClick={() => saveToDatabase(item)}>
                        <Save size={15} /> 存入飯店資料庫
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="btn-outline-gold" style={{ width: '100%', padding: '8px' }}>+ 新增飯店</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
