import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeTemplateApi } from '../api';
import { ArrowLeft, Plus, Save, Trash2, Edit2 } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ title: '', content: '', category: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await noticeTemplateApi.getAll();
      setTemplates(data);
    } catch (err) {
      console.error(err);
      alert('無法載入注意事項範本');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tmpl) => {
    setEditingId(tmpl.id);
    setForm({ title: tmpl.title, content: tmpl.content, category: tmpl.category || '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: '', content: '', category: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return alert('標題與內容為必填');
    try {
      setLoading(true);
      await noticeTemplateApi.save({
        id: editingId === 'new' ? undefined : editingId,
        ...form
      });
      handleCancel();
      fetchTemplates();
    } catch (err) {
      console.error(err);
      alert('儲存失敗');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除此範本嗎？')) return;
    try {
      setLoading(true);
      await noticeTemplateApi.remove(id);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      alert('刪除失敗');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-black transition-colors" onClick={() => navigate('/dashboard')} title="回管理台">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--luxury-gold)] m-0">設定中心</h1>
              <p className="text-gray-500 mt-1">管理注意事項範本庫</p>
            </div>
          </div>
          <button className="btn-gold flex items-center gap-2" onClick={() => { setEditingId('new'); setForm({ title: '', content: '', category: '' }); }}>
            <Plus size={18} /> 新增範本
          </button>
        </header>

        {editingId && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-[var(--c-pri)]">
            <h3 className="text-lg font-bold mb-4">{editingId === 'new' ? '新增範本' : '編輯範本'}</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label font-bold text-[var(--c-pri)]">注意標題 *</label>
                  <input type="text" className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="例如: 簽證注意事項" />
                </div>
                <div>
                  <label className="form-label font-bold text-[var(--c-pri)]">分類/標籤 (選填)</label>
                  <input type="text" className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="例如: 一般 / 退費 / 簽證" />
                </div>
                <div className="col-span-2">
                  <label className="form-label font-bold text-[var(--c-pri)]">說明內容 *</label>
                  <textarea className="form-control" rows={5} value={form.content} onChange={e => setForm({...form, content: e.target.value})} required placeholder="輸入完整說明事項..."></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50" onClick={handleCancel}>取消</button>
                <button type="submit" className="btn-gold flex items-center gap-2" disabled={loading}>
                  <Save size={16}/> 儲存
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && !editingId ? (
          <p>載入中...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <th className="p-4 font-bold">標題</th>
                  <th className="p-4 font-bold">分類</th>
                  <th className="p-4 font-bold">預覽內容</th>
                  <th className="p-4 font-bold text-center w-32">操作</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">尚無注意事項範本</td>
                  </tr>
                ) : (
                  templates.map(tmpl => (
                    <tr key={tmpl.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-bold text-[var(--c-pri)]">{tmpl.title}</td>
                      <td className="p-4"><span className="bg-gray-200 px-2 py-1 rounded text-xs text-gray-700">{tmpl.category || '未分類'}</span></td>
                      <td className="p-4 text-sm text-gray-600 max-w-[300px] truncate">{tmpl.content}</td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button onClick={() => handleEdit(tmpl)} className="text-blue-500 hover:bg-blue-50 p-2 rounded transition-colors" title="編輯">
                          <Edit2 size={16}/>
                        </button>
                        <button onClick={() => handleDelete(tmpl.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="刪除">
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
