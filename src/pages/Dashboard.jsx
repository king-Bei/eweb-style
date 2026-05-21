import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itineraryApi, authApi } from '../api';
import { LogOut, Plus, Edit2, Trash2, Copy, Settings as SettingsIcon, LayoutTemplate, Palette, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('未命名新行程');
  const [newTheme, setNewTheme] = useState('magazine');

  const [statusModalItin, setStatusModalItin] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', publish_date_note: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const data = await itineraryApi.getAll();
      setItineraries(data);
    } catch (err) {
      alert('無法載入行程列表');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const newItin = await itineraryApi.create(newTitle || '未命名新行程', newTheme);
      setShowCreateModal(false);
      navigate(`/editor/${newItin.id}`);
    } catch (err) {
      alert('建立失敗');
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveStatus = async () => {
    try {
      setLoading(true);
      const user = await authApi.getUser();
      await itineraryApi.updateStatus(statusModalItin.id, {
        title: statusForm.title,
        status: statusForm.status,
        publish_date_note: statusForm.publish_date_note,
        config_updates: { status_modifier_name: user?.name || user?.id || '未知' }
      });
      setStatusModalItin(null);
      fetchItineraries();
    } catch (err) {
      alert('更新狀態失敗');
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此行程嗎？')) return;
    try {
      await itineraryApi.remove(id);
      fetchItineraries();
    } catch (err) {
      alert('刪除失敗');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await authApi.signOut();
    onLogout();
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ color: 'var(--luxury-gold)', margin: 0 }}>WEB行程商品管理台</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>Jollify Travel Itinerary CMS</p>
        </div>
        <div className="flex gap-4 items-center">
          <button className="btn-outline-gold flex items-center gap-2" onClick={() => navigate('/settings')} title="設定中心">
            <SettingsIcon size={18} />
          </button>
          <button className="btn-gold flex items-center gap-2" onClick={() => { setNewTitle('未命名新行程'); setNewTheme('magazine'); setShowCreateModal(true); }}>
            <Plus size={18} /> 新增商品行程
          </button>
          <button className="btn-outline-gold flex items-center gap-2" onClick={handleLogout}>
            <LogOut size={18} /> 登出
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-[var(--c-pri)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--c-pri)] mr-3"></div>
          載入中...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.length === 0 && <p className="text-gray-500 col-span-full text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">尚無行程，請點擊右上角新增。</p>}
          {itineraries.map(itin => {
            const statusColors = { '草稿': '#94a3b8', '製作中': '#3b82f6', '待修改': '#f59e0b', '待確認': '#8b5cf6', '已確認待上架': '#0ea5e9', '已上架': '#10b981' };
            const statusColor = statusColors[itin.status] || '#94a3b8';

            return (
              <div key={itin.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <h3 className="m-0 text-lg font-bold text-gray-800 flex-1 leading-snug group-hover:text-[var(--c-pri)] transition-colors">{itin.title}</h3>
                    <button
                      onClick={() => {
                        setStatusModalItin(itin);
                        setStatusForm({ title: itin.title || '', status: itin.status || '草稿', publish_date_note: itin.publish_date_note || '' });
                      }}
                      className="hover:scale-105 transition-transform cursor-pointer border-0 shrink-0 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                      style={{ backgroundColor: statusColor }}>
                      {itin.status || '草稿'} ⚙️
                    </button>
                  </div>

                  <div className="flex gap-2 items-center mb-4">
                    <span className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium shadow-sm">
                      {itin.config?.theme === 'magazine' ? <><Palette size={12} className="text-purple-500" /> 雜誌風</> : <><LayoutTemplate size={12} className="text-blue-500" /> 經典版</>}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 p-3 bg-gray-50/80 rounded-lg text-xs text-gray-600 border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">狀態最後調整：</span>
                      <span className="font-medium text-gray-700">{itin.last_modifier_name || '無'}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200/60 pt-2">
                      <span className="text-gray-400">最後編輯時間：</span>
                      <span className="font-mono text-gray-600">{new Date(itin.updated_at).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200/60 pt-2">
                      <span className="text-gray-400">最後編輯人員：</span>
                      <span className="font-bold text-[var(--c-pri)]">{itin.config?.status_modifier_name || '無'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                  <button
                    className="btn-gold flex items-center justify-center gap-2 flex-1 shadow-sm hover:shadow-md py-2 rounded-lg"
                    onClick={() => navigate(`/editor/${itin.id}`)}
                  >
                    <Edit2 size={15} /> 編輯
                  </button>
                  <button
                    className="flex items-center justify-center text-red-400 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    onClick={() => handleDelete(itin.id)}
                    title="刪除此行程"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
            padding: '24px'
          }}>
            <h2 style={{ color: 'var(--c-pri)', fontSize: '20px', fontWeight: 700, margin: '0 0 18px' }}>建立新行程</h2>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#374151' }}>行程名稱</label>
              <input type="text" className="form-control" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#374151', marginBottom: '10px' }}>選擇排版風格 (建立後綁定)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                <div
                  onClick={() => setNewTheme('magazine')}
                  style={{
                    position: 'relative',
                    minHeight: '178px',
                    padding: '18px',
                    borderRadius: '10px',
                    border: newTheme === 'magazine' ? '3px solid var(--c-sec)' : '2px solid #e5e7eb',
                    background: newTheme === 'magazine' ? '#fffbeb' : '#ffffff',
                    boxShadow: newTheme === 'magazine' ? '0 10px 26px rgba(212,169,59,0.2)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {newTheme === 'magazine' && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'var(--c-sec)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.16)'
                    }}>
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                  <Palette size={28} color={newTheme === 'magazine' ? 'var(--c-sec)' : '#9ca3af'} style={{ marginBottom: '14px' }} />
                  <h4 style={{ margin: '0 36px 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: 700 }}>頂級雜誌風</h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', lineHeight: 1.55 }}>現代 Tailwind 質感排版，高視覺張力</p>
                  <div style={{ marginTop: '16px', color: newTheme === 'magazine' ? 'var(--c-sec)' : '#9ca3af', fontSize: '13px', fontWeight: 700 }}>
                    {newTheme === 'magazine' ? '目前選擇' : '點擊選擇'}
                  </div>
                </div>
                <div
                  onClick={() => setNewTheme('classic')}
                  style={{
                    position: 'relative',
                    minHeight: '178px',
                    padding: '18px',
                    borderRadius: '10px',
                    border: newTheme === 'classic' ? '3px solid var(--c-pri)' : '2px solid #e5e7eb',
                    background: newTheme === 'classic' ? '#f5f3ff' : '#ffffff',
                    boxShadow: newTheme === 'classic' ? '0 10px 26px rgba(76,42,133,0.16)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {newTheme === 'classic' && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'var(--c-pri)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.16)'
                    }}>
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                  <LayoutTemplate size={28} color={newTheme === 'classic' ? 'var(--c-pri)' : '#9ca3af'} style={{ marginBottom: '14px' }} />
                  <h4 style={{ margin: '0 36px 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: 700 }}>經典版型</h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', lineHeight: 1.55 }}>傳統 Vanilla CSS 乾淨簡潔</p>
                  <div style={{ marginTop: '16px', color: newTheme === 'classic' ? 'var(--c-pri)' : '#9ca3af', fontSize: '13px', fontWeight: 700 }}>
                    {newTheme === 'classic' ? '目前選擇' : '點擊選擇'}
                  </div>
                </div>
              </div>
              <p style={{ margin: '14px 0 0', color: '#4b5563', fontSize: '14px' }}>
                目前將建立：<span style={{ color: 'var(--c-pri)', fontWeight: 700 }}>{newTheme === 'magazine' ? '頂級雜誌風' : '經典版型'}</span>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={{ padding: '10px 16px', color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>取消</button>
              <button className="btn-gold" onClick={handleCreate} disabled={loading}>
                {loading ? '建立中...' : '確認建立'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Edit Modal */}
      {statusModalItin && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: '#fff',
            borderRadius: '12px',
            borderTop: '4px solid var(--c-pri)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
            padding: '24px'
          }}>
            <h2 style={{ color: 'var(--c-pri)', fontSize: '18px', fontWeight: 700, margin: '0 0 18px' }}>行程狀態調整</h2>

            <div style={{ marginBottom: '18px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#374151' }}>狀態標籤</label>
              <select className="form-control" value={statusForm.status} onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}>
                <option value="草稿">草稿</option>
                <option value="製作中">製作中</option>
                <option value="待修改">待修改</option>
                <option value="待確認">待確認</option>
                <option value="已確認待上架">已確認待上架</option>
                <option value="已上架">已上架</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#374151' }}>備註上架日</label>
              <input
                type="text"
                className="form-control"
                value={statusForm.publish_date_note}
                onChange={e => setStatusForm({ ...statusForm, publish_date_note: e.target.value })}
                placeholder="如: 2024-10-01"
                disabled={statusForm.status !== '已確認待上架' && statusForm.status !== '已上架'}
              />
              <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '12px' }}>僅限待上架/已上架狀態填寫</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={{ padding: '10px 16px', color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setStatusModalItin(null)}>取消</button>
              <button className="btn-gold" onClick={handleSaveStatus} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> {loading ? '儲存中...' : '儲存狀態'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
