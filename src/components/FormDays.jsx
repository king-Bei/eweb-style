import React from 'react';
import ImageAttributionInput from './ImageAttributionInput';

export default function FormDays({ data = {}, onChange, theme = 'classic' }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const items = data.items || [];

  const addItem = () => {
    onChange({
      ...data,
      items: [
        ...items,
        {
          route: '',
          title: '',
          lead: '',
          summary: '',
          image: { url: '', source: '', label: '', subtitle: '' },
          points: '',
          meals: { breakfast: '', lunch: '', dinner: '' },
          stay: '',
          hotel_name: ''
        }
      ]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newItems[index][parent] = { ...newItems[index][parent], [child]: value };
    } else {
      newItems[index][field] = value;
    }
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '} 每日行程 (Daily Itinerary)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>
          {/* 區塊標題設定 */}
          <div className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>
              <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-1 block">區塊主標題 (Main Title)</label>
              <input type="text" className="form-control" style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }} placeholder="每日行程" value={data.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} />
            </div>
            <div>
              <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-1 block">區塊英文副標 (Badge)</label>
              <input type="text" className="form-control" style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }} placeholder="Daily Itinerary" value={data.subtitle || ''} onChange={e => onChange({ ...data, subtitle: e.target.value })} />
            </div>
          </div>

          {theme === 'classic' && <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-1.5 block">行程圖面放置方式</label>
              <select
                className="form-control"
                value={data.layout || 'leftimg'}
                onChange={e => onChange({ ...data, layout: e.target.value })}
                style={{ width: '220px', padding: '6px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="leftimg">左圖右文 (經典預設)</option>
                <option value="rightimg">右圖左文 (交錯對稱)</option>
                <option value="topimg">上圖下文 (雜誌大圖)</option>
                <option value="timeline">時序時間軸 (新版型)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={data.points_bold === true}
                  onChange={e => onChange({ ...data, points_bold: e.target.checked })}
                />
                條列重點加粗顯示
              </label>
            </div>
          </div>}

          {data.visible !== false && (
            <>
              {items.map((item, i) => (
                <div key={i} style={{ backgroundColor: '#fafafa', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', borderLeft: '4px solid var(--c-pri)', marginBottom: '15px', position: 'relative' }}>
                  <div className="flex justify-between mb-3 border-b border-gray-700 pb-2">
                    <h4 style={{ margin: 0, color: 'var(--c-pri)', fontWeight: 'bold' }}>第 {i + 1} 天</h4>
                    <button onClick={() => removeItem(i)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>刪除</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="form-label text-xs">行程路線 (Route)</label>
                      <input type="text" className="form-control" value={item.route} onChange={e => updateItem(i, 'route', e.target.value)} placeholder="例如: 桃園機場 ✈ 新加坡 ✈ 馬列" />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">主標題 (Title)</label>
                      <input type="text" className="form-control" value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} placeholder="啟程 ‧ 前往遺世獨立的純淨海島" />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">前言 (Lead)</label>
                      <textarea className="form-control" rows={2} value={item.lead} onChange={e => updateItem(i, 'lead', e.target.value)}></textarea>
                    </div>
                    {theme === 'magazine' && (
                      <div className="col-span-2 rounded border border-amber-200 bg-amber-50 p-3">
                        <label className="form-label text-xs font-bold text-[var(--c-pri)]">行程總覽摘要 (Magazine Summary)</label>
                        <p className="mb-2 text-xs text-gray-500">顯示於雜誌風格的行程總覽；留空時會使用前言內容。</p>
                        <textarea
                          className="form-control mb-0"
                          rows={2}
                          value={item.summary || ''}
                          onChange={e => updateItem(i, 'summary', e.target.value)}
                          placeholder="以一兩句話概述當日亮點"
                        />
                      </div>
                    )}

                    {/* Image Section */}
                    <div className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded">
                      <label className="form-label text-xs text-[var(--c-pri)] font-bold">圖片設定</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <input type="text" className="form-control text-sm" value={item.image?.url || ''} onChange={e => updateItem(i, 'image.url', e.target.value)} placeholder="圖片網址" />
                          <ImageAttributionInput value={item.image?.source || ''} onChange={value => updateItem(i, 'image.source', value)} />
                        </div>
                        <div>
                          <input type="text" className="form-control text-sm" value={item.image?.label || ''} onChange={e => updateItem(i, 'image.label', e.target.value)} placeholder="圖片大標籤 (如: FIRST DAY)" />
                        </div>
                        <div>
                          <input type="text" className="form-control text-sm" value={item.image?.subtitle || ''} onChange={e => updateItem(i, 'image.subtitle', e.target.value)} placeholder="圖片副標" />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="form-label text-xs">條列重點 (Points，每行一點)</label>
                      <textarea className="form-control" rows={4} value={item.points} onChange={e => updateItem(i, 'points', e.target.value)} placeholder="第一點...&#10;第二點..."></textarea>
                    </div>

                    {/* Meals */}
                    <div className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-0">餐食設定</label>
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.meals?.show !== false}
                            onChange={e => updateItem(i, 'meals.show', e.target.checked)}
                          />
                          顯示餐食
                        </label>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="form-label text-xs">早餐</label>
                          <input type="text" className="form-control text-sm" value={item.meals?.breakfast || ''} onChange={e => updateItem(i, 'meals.breakfast', e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label text-xs">午餐</label>
                          <input type="text" className="form-control text-sm" value={item.meals?.lunch || ''} onChange={e => updateItem(i, 'meals.lunch', e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label text-xs">晚餐</label>
                          <input type="text" className="form-control text-sm" value={item.meals?.dinner || ''} onChange={e => updateItem(i, 'meals.dinner', e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="form-label text-xs">住宿 (Stay)</label>
                      <input type="text" className="form-control" value={item.stay} onChange={e => updateItem(i, 'stay', e.target.value)} placeholder="Ozen Reserve Bolifushi - Earth Pool Villa" />
                    </div>
                    {theme === 'magazine' && (
                      <div className="col-span-2 rounded border border-amber-200 bg-amber-50 p-3">
                        <label className="form-label text-xs font-bold text-[var(--c-pri)]">雜誌住宿顯示名稱 (Magazine Stay)</label>
                        <p className="mb-2 text-xs text-gray-500">顯示於雜誌風格的行程總覽與每日頁面；留空時會使用上方住宿欄位。</p>
                        <input
                          type="text"
                          className="form-control mb-0"
                          value={item.hotel_name || ''}
                          onChange={e => updateItem(i, 'hotel_name', e.target.value)}
                          placeholder="例如：馬爾地夫奧臻瑞澤爾芙度假村"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="btn-outline-gold" style={{ width: '100%', padding: '8px' }}>+ 新增一天行程</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
