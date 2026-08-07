import React from 'react';

export default function FormPrice({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const handleChange = (event) => onChange({ ...data, [event.target.name]: event.target.value });

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}參考售價</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={event => event.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={event => onChange({ ...data, visible: event.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && data.visible !== false && (
        <div className="module-body" style={{ padding: '20px' }}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">區塊標題</label>
              <input type="text" name="title" className="form-control" value={data.title || ''} onChange={handleChange} placeholder="尊榮旅程參考售價" />
            </div>
            <div>
              <label className="form-label">價格</label>
              <input type="text" name="amount" className="form-control" value={data.amount || ''} onChange={handleChange} placeholder="NT$ 268,000" />
            </div>
            <div>
              <label className="form-label">價格單位</label>
              <input type="text" name="unit" className="form-control" value={data.unit || ''} onChange={handleChange} placeholder="每人起" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">補充說明</label>
              <textarea name="note" className="form-control" rows={3} value={data.note || ''} onChange={handleChange} placeholder="實際價格依出發日期、航空艙等與房型安排為準。" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
