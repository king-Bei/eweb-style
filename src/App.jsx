import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    const handleAuthExpired = () => {
      setSession(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const router = useMemo(() => createBrowserRouter([
    { path: '/login', element: !session ? <Login onLogin={setSession} /> : <Navigate to="/" /> },
    { path: '/', element: session ? <Dashboard onLogout={() => setSession(null)} /> : <Navigate to="/login" /> },
    { path: '/dashboard', element: <Navigate to="/" /> },
    { path: '/settings', element: session ? <Settings /> : <Navigate to="/login" /> },
    { path: '/editor/:id?', element: session ? <Editor /> : <Navigate to="/login" /> },
    { path: '/editor-magazine/:id', element: session ? <Editor forcedTheme="magazine" /> : <Navigate to="/login" /> },
    { path: '/brochure-pages', element: <Navigate to="/" replace /> }
  ]), [session]);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#1a1a1a] text-[#C5A059]">載入中...</div>;

  return <RouterProvider router={router} />;
}

export default App;
