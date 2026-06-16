import React from 'react';

export default function FormMap({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

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
            onChange={e => update('visible', e.target.checked)}
          />
          顯示
        </label>
      </div>

      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>
          <div className="grid grid-cols-1 gap-4">

            <div>
              <label className="form-label text-xs text-[var(--c-pri)] font-bold">區塊標題</label>
              <input
                type="text"
                className="form-control"
                value={data.title || ''}
                onChange={e => update('title', e.target.value)}
                placeholder="行程地圖"
              />
            </div>

            <div>
              <label className="form-label text-xs text-[var(--c-pri)] font-bold">Google Maps 嵌入網址</label>
              <p className="text-xs text-gray-400 mb-2">
                前往 <strong>Google Maps</strong> → 找到地點 → 點「分享」→「嵌入地圖」→ 複製 src 網址（以 https://www.google.com/maps/embed? 開頭的那段）
              </p>
              <input
                type="text"
                className="form-control"
                value={data.embed_url || ''}
                onChange={e => update('embed_url', e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>

            <div>
              <label className="form-label text-xs">地圖高度（px）</label>
              <input
                type="number"
                className="form-control"
                value={data.height || 450}
                min={200}
                max={800}
                onChange={e => update('height', Number(e.target.value))}
                style={{ maxWidth: '160px' }}
              />
            </div>

            <div>
              <label className="form-label text-xs">說明文字（選填）</label>
              <textarea
                className="form-control"
                rows={2}
                value={data.desc || ''}
                onChange={e => update('desc', e.target.value)}
                placeholder="例如：整個行程橫跨南北，從河內古城到下龍灣，全程交通皆由專屬導遊接送。"
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
