import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Settings from './pages/Settings';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getUser().then((user) => {
      setSession(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-[#C5A059]">載入中...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login onLogin={setSession} /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Dashboard onLogout={() => setSession(null)} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={<Navigate to="/" />} />
        <Route path="/settings" element={session ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/editor/:id?" element={session ? <Editor /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
