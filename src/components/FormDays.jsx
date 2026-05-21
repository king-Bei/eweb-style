import React from 'react';

export default function FormDays({ data = {}, onChange }) {
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
          image: { url: '', label: '', subtitle: '' },
          points: '',
          meals: { breakfast: '', lunch: '', dinner: '' },
          stay: ''
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
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer',  backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}7. 每日行程 (Daily Itinerary)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
      <div className="module-body" style={{ padding: '20px' }}>

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

                {/* Image Section */}
                <div className="col-span-2 p-3 bg-gray-50 border border-gray-200 rounded">
                  <label className="form-label text-xs text-[var(--c-pri)] font-bold">圖片設定</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input type="text" className="form-control text-sm" value={item.image?.url || ''} onChange={e => updateItem(i, 'image.url', e.target.value)} placeholder="圖片網址" />
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
