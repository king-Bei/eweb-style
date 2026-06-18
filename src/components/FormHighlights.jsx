import React from 'react';

export default function FormHighlights({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const items = data.items || [];

  const addItem = () => {
    onChange({ ...data, items: [...items, { title: '', subtitle: '', desc: '', img: '' }] });
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

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '} 行程特色 (Highlights)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>

          {data.visible !== false && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label text-sm font-bold text-gray-700 block mb-1">特色版面選擇</label>
                <select
                  className="form-control font-medium"
                  value={data.layout || 'grid'}
                  onChange={e => onChange({ ...data, layout: e.target.value })}
                >
                  <option value="grid">經典無圖網格 (Grid)</option>
                  <option value="card">帶圖卡片網格 (Card)</option>
                  <option value="overlap">帶圖破格交疊 (Overlap)</option>
                </select>
              </div>

              {items.map((item, i) => (
                <div key={i} style={{ backgroundColor: '#fafafa', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', borderLeft: '4px solid var(--c-pri)', marginBottom: '15px', position: 'relative' }}>
                  <button onClick={() => removeItem(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✖</button>

                  <div style={{ marginBottom: '10px' }}>
                    <label className="form-label text-xs font-semibold text-gray-500 block mb-1">小字標題 (如: 五星住宿)</label>
                    <input type="text" className="form-control" value={item.subtitle || ''} onChange={e => updateItem(i, 'subtitle', e.target.value)} placeholder="例如: 五星住宿" />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label className="form-label text-xs font-semibold text-gray-500 block mb-1">特色標題</label>
                    <input type="text" className="form-control" value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} placeholder="例如: 專屬水上別墅" />
                  </div>

                  {(data.layout === 'card' || data.layout === 'overlap') && (
                    <div style={{ marginBottom: '10px' }}>
                      <label className="form-label text-xs font-semibold text-gray-500 block mb-1">特色圖片網址</label>
                      <input type="text" className="form-control" value={item.img || ''} onChange={e => updateItem(i, 'img', e.target.value)} placeholder="https://example.com/image.jpg" />
                    </div>
                  )}

                  <div style={{ marginBottom: '5px' }}>
                    <label className="form-label text-xs font-semibold text-gray-500 block mb-1">說明文字</label>
                    <textarea className="form-control" rows={3} value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)} placeholder="說明特色..."></textarea>
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="btn-outline-gold" style={{ width: '100%', padding: '8px' }}>+ 新增特色</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
