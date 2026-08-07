import React from 'react';
import ImageAttributionInput from './ImageAttributionInput';

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
          {isCollapsed ? '▶️ ' : '🔽 '} 行程地圖
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
          <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
            <div>
              <label className="form-label mb-1 block text-xs font-bold text-[var(--c-pri)]">區塊主標題 (Main Title)</label>
              <input
                type="text"
                className="form-control"
                style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }}
                value={data.title || ''}
                onChange={e => onChange({ ...data, title: e.target.value })}
                placeholder="行程地圖"
              />
            </div>
            <div>
              <label className="form-label mb-1 block text-xs font-bold text-[var(--c-pri)]">地圖說明 (Description)</label>
              <textarea
                className="form-control"
                rows={2}
                style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }}
                value={data.desc || ''}
                onChange={e => onChange({ ...data, desc: e.target.value })}
                placeholder="從起點到目的地的旅程路線"
              />
            </div>
          </div>
          <label className="form-label text-xs text-[var(--c-pri)] font-bold">地圖圖片網址</label>
          <p className="text-xs text-gray-400 mb-2">
            請輸入地圖的公開圖片連結（如：上傳至科威素材庫之圖片網址，地圖會自動隨視窗大小縮放）
          </p>
          <input
            type="text"
            className="form-control"
            value={data.embed_url || ''}
            onChange={e => onChange({ ...data, embed_url: e.target.value })}
            placeholder="https://example.com/images/map.jpg"
          />
          <ImageAttributionInput value={data.image_source || ''} onChange={image_source => onChange({ ...data, image_source })} />
        </div>
      )}
    </div>
  );
}
