import React from 'react';

export default function FormHotels({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const items = data.items || [];
  const layout = data.layout || 'overlap';

  const addItem = () => {
    onChange({ ...data, items: [...items, { img: '', stars: '★★★★★', name: '', desc: '' }] });
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
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer',  backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}6. 嚴選旅宿 (Hotels)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
      <div className="module-body" style={{ padding: '20px' }}>

      {data.visible !== false && (
        <>
          <div className="mb-4">
            <label className="form-label">版型選擇 (Layout)</label>
            <select className="form-control" value={layout} onChange={e => onChange({ ...data, layout: e.target.value })}>
              <option value="overlap">破格交疊 (Overlap)</option>
              <option value="grid">格狀展示 (Grid)</option>
            </select>
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: '#fafafa', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', borderLeft: '4px solid var(--c-pri)', marginBottom: '15px', position: 'relative' }}>
              <button onClick={() => removeItem(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✖</button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="col-span-2">
                  <label className="form-label text-xs">飯店名稱</label>
                  <input type="text" className="form-control" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label text-xs">星級評分 (Stars)</label>
                  <input type="text" className="form-control" value={item.stars} onChange={e => updateItem(i, 'stars', e.target.value)} placeholder="★★★★★" />
                </div>
                <div className="col-span-2">
                  <label className="form-label text-xs">圖片網址</label>
                  <input type="text" className="form-control" value={item.img} onChange={e => updateItem(i, 'img', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="form-label text-xs">介紹文字</label>
                  <textarea className="form-control" rows={3} value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)}></textarea>
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
