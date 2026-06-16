import React from 'react';

export default function FormMap({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div
        className="module-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>
          {isCollapsed ? '▶️ ' : '🔽 '}🗺️ 行程地圖
        </h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={data.visible !== false}
            onChange={e => onChange({ ...data, visible: e.target.checked })}
          />
          顯示
        </label>
      </div>

      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>
          <label className="form-label text-xs text-[var(--c-pri)] font-bold">地圖嵌入網址</label>
          <p className="text-xs text-gray-400 mb-2">
            Google Maps → 分享 → 嵌入地圖 → 複製 <code>src="..."</code> 中的網址
          </p>
          <input
            type="text"
            className="form-control"
            value={data.embed_url || ''}
            onChange={e => onChange({ ...data, embed_url: e.target.value })}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
        </div>
      )}
    </div>
  );
}
