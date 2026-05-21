import React from 'react';

export default function FormHero({ heroData = {}, onChange }) {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const handleChange = (e) => {
    onChange({ ...heroData, [e.target.name]: e.target.value });
  };

  return (
    <div className="module-section" style={{ marginBottom: '25px', backgroundColor: '#fff', border: '1px solid #e9ecef', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div className="module-header" onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer',  backgroundColor: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center'  }}>
        <h3 className="module-title" style={{ margin: 0, color: 'var(--c-pri)', fontSize: '1.05rem', fontWeight: 'bold' }}>{isCollapsed ? '▶️ ' : '🔽 '}1. 主視覺與標題 (Hero)</h3>
        <label className="flex items-center gap-2 cursor-pointer text-sm" onClick={e => e.stopPropagation()}>
          <input type="checkbox" name="visible" checked={heroData.visible !== false} onChange={e => onChange({ ...heroData, visible: e.target.checked })} />
          顯示
        </label>
      </div>
      {!isCollapsed && (
      <div className="module-body" style={{ padding: '20px' }}>

      {heroData.visible !== false && (
        <>
          <label className="form-label">主標題</label>
          <input type="text" name="title1" className="form-control" value={heroData.title1 || ''} onChange={handleChange} placeholder="馬爾地夫 ‧ 水上別墅蜜月奢旅" />

          <label className="form-label">副標題</label>
          <input type="text" name="title2" className="form-control" value={heroData.title2 || ''} onChange={handleChange} placeholder="Maldives Honeymoon ‧ 7 Days" />

          <label className="form-label">封面圖片網址</label>
          <input type="text" name="image" className="form-control" value={heroData.image || ''} onChange={handleChange} placeholder="https://" />
        </>
      )}
    </div>
          )}
</div>
    );
}
