import React, { useState, useEffect } from 'react';
import { noticeTemplateApi } from '../api';
import { Search } from 'lucide-react';

export default function FormNotices({ data = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const items = data.items || [];
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (showTemplates) {
      loadTemplates();
    }
  }, [showTemplates]);

  const loadTemplates = async () => {
    try {
      const data = await noticeTemplateApi.getAll();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = () => {
    onChange({ ...data, items: [...items, { t: '', desc: '' }] });
  };

  const applyTemplate = (tmpl) => {
    onChange({ ...data, items: [...items, { t: tmpl.title, desc: tmpl.content }] });
    setShowTemplates(false);
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
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}8. 報名注意事項 (Notices)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={data.visible !== false} onChange={e => onChange({ ...data, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
      <div className="module-body" style={{ padding: '20px' }}>

      {data.visible !== false && (
        <>
          <div className="mb-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-sm font-bold text-gray-700">🔍 從資料庫匯入注意事項範本</span>
            <button className="btn-outline-gold px-3 py-1 text-sm flex items-center gap-1" onClick={() => setShowTemplates(!showTemplates)}>
              {showTemplates ? '關閉範本庫' : '展開範本庫'}
            </button>
          </div>

          {showTemplates && (
            <div className="mb-6 bg-white border border-[var(--luxury-gold)] p-3 rounded-lg shadow-sm">
              <h4 className="text-xs font-bold mb-2 text-[var(--c-pri)]">選擇並點擊下方範本以加入行程：</h4>
              {templates.length === 0 ? <p className="text-sm text-gray-500">尚無範本，請至設定中心新增</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {templates.map(tmpl => (
                    <div key={tmpl.id} className="bg-gray-50 p-2 rounded border border-gray-100 hover:border-[var(--luxury-gold)] cursor-pointer" onClick={() => applyTemplate(tmpl)}>
                      <div className="text-sm font-bold text-[var(--c-pri)]">{tmpl.title}</div>
                      <div className="text-xs text-gray-500 truncate">{tmpl.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: '#fafafa', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', borderLeft: '4px solid var(--c-pri)', marginBottom: '15px', position: 'relative' }}>
              <button onClick={() => removeItem(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>✖</button>
              <label className="form-label">注意標題</label>
              <input type="text" className="form-control" value={item.t} onChange={e => updateItem(i, 't', e.target.value)} placeholder="例如: 簽證注意事項" />
              <label className="form-label">說明內容</label>
              <textarea className="form-control" rows={3} value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)}></textarea>
            </div>
          ))}
          <button onClick={addItem} className="btn-outline-gold" style={{ width: '100%', padding: '8px' }}>+ 新增注意事項</button>
        </>
      )}
    </div>
          )}
</div>
    );
}
