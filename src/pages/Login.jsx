import { useState } from 'react';
import { authApi } from '../api';

export default function Login({ onLogin }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authApi.signIn(employeeId, password);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || '登入失敗，請檢查帳號密碼。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '10px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e9ecef' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--c-pri)', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Jollify Travel</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>WEB 行程生成系統</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', color: '#ff6b6b', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="form-label">員工編號</label>
          <input
            type="text"
            className="form-control"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            placeholder="例如: T00001"
            required
          />

          <label className="form-label">密碼</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? '登入中...' : '登入系統'}
          </button>
        </form>
      </div>
    </div>
  );
}
