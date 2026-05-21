import React from 'react';

export default function FormQuickInfo({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const handleChange = (e) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer',  backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}2. 行程速覽卡</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
      <div className="module-body" style={{ padding: '20px' }}>
      
      {data.visible !== false && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">天數</label>
            <input type="text" name="duration" className="form-control" value={data.duration || '7 天 5 夜'} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">成行人數</label>
            <input type="text" name="group" className="form-control" value={data.group || '2 人成行 / 蜜月專案'} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">出發檔期</label>
            <input type="text" name="depart" className="form-control" value={data.depart || '每月 1 梯 / 2026 全年'} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">參考售價</label>
            <input type="text" name="price" className="form-control" value={data.price || 'NT$ 268,000 / 人起'} onChange={handleChange} />
          </div>
          <div className="col-span-2">
            <label className="form-label">搭乘航空</label>
            <input type="text" name="flight" className="form-control" value={data.flight || '新加坡航空 / 經 SIN 轉機'} onChange={handleChange} />
          </div>
        </div>
      )}
    </div>
          )}
</div>
    );
}
