import React from 'react';

export default function FormCTA({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  // data contains cta_register_url and cta_line_url
  const registerUrl = data.cta_register_url || '';
  const lineUrl = data.cta_line_url || '';

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '} 行動呼籲按鈕 (CTA)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示按鈕
        </label>
      </div>

      {!isCollapsed && (
        <div className="module-body" style={{ padding: '20px' }}>
          {data.visible !== false && (
            <>
              {/* 區塊標題設定 */}
              <div className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-1 block">區塊主標題 (Main Title)</label>
                  <input type="text" className="form-control" style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }} placeholder="立即報名 · 啟程夢想旅程" value={data.title || ''} onChange={e => onChange({ ...data, title: e.target.value })} />
                </div>
                <div>
                  <label className="form-label text-xs text-[var(--c-pri)] font-bold mb-1 block">區塊英文副標 (Badge)</label>
                  <input type="text" className="form-control" style={{ marginBottom: 0, padding: '6px 12px', fontSize: '13px' }} placeholder="Book Now" value={data.subtitle || ''} onChange={e => onChange({ ...data, subtitle: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                <label className="form-label font-bold text-[var(--c-pri)] flex items-center gap-1">
                  我要報名 (表單網址)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={registerUrl}
                  onChange={e => onChange({ ...data, cta_register_url: e.target.value })}
                  placeholder="https://forms.gle/..."
                />
                <p className="text-xs text-gray-500 mt-1">留白則不顯示報名按鈕</p>
              </div>
              <div>
                <label className="form-label font-bold text-[#06C755] flex items-center gap-1">
                  LINE 客服 (加好友網址)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={lineUrl}
                  onChange={e => onChange({ ...data, cta_line_url: e.target.value })}
                  placeholder="https://line.me/R/ti/p/..."
                />
                <p className="text-xs text-gray-500 mt-1">留白則不顯示 LINE 按鈕</p>
              </div>
            </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
