import React from 'react';

export default function FormSpots({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const items = data.items || [];
  const layout = data.layout || 'fullimg';

  const addItem = () => {
    onChange({ ...data, items: [...items, { name: '', img: '', desc: '', tag: '' }] });
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
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}4. 嚴選景點 (Scenic Spots)</h3>
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
              <option value="fullimg">滿版大圖 (Full Image)</option>
              <option value="ltr">左右交錯 (Left-to-Right)</option>
              <option value="grid">格狀三欄 (Grid)</option>
            </select>
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: '#fafafa', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', borderLeft: '4px solid var(--c-pri)', marginBottom: '15px', position: 'relative' }}>
              <button onClick={() => removeItem(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✖</button>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label">景點名稱</label>
                  <input type="text" className="form-control" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">標籤 (Tag)</label>
                  <input type="text" className="form-control" value={item.tag} onChange={e => updateItem(i, 'tag', e.target.value)} placeholder="例如: 必訪景點" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">圖片網址</label>
                  <input type="text" className="form-control" value={item.img} onChange={e => updateItem(i, 'img', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="form-label">景點介紹</label>
                  <textarea className="form-control" rows={3} value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)}></textarea>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="btn-outline-gold" style={{ width: '100%', padding: '8px' }}>+ 新增景點</button>
        </>
      )}
    </div>
          )}
</div>
    );
}
