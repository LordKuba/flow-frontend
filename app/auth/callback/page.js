'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flow-production-76f0.up.railway.app';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('מעבד...');
  const [error, setError] = useState('');

  useEffect(() => {
    // Supabase returns tokens in the URL hash after OAuth
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken) {
      setError('לא נמצא טוקן — אנא נסה שוב');
      setTimeout(() => router.push('/login'), 3000);
      return;
    }

    // Verify token with our backend and get user profile
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data?.user || data?.id) {
          localStorage.setItem('flow_token', accessToken);
          if (refreshToken) localStorage.setItem('flow_refresh_token', refreshToken);
          setStatus('מחובר! מעביר...');
          // Force a full reload so AuthProvider re-reads from localStorage
          window.location.href = '/';
        } else {
          // New Google user — needs to complete registration
          // Store token temporarily and redirect to complete profile
          localStorage.setItem('flow_token', accessToken);
          if (refreshToken) localStorage.setItem('flow_refresh_token', refreshToken);
          setStatus('מעביר לדשבורד...');
          window.location.href = '/';
        }
      })
      .catch(() => {
        setError('שגיאת חיבור — אנא נסה שוב');
        setTimeout(() => router.push('/login'), 3000);
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1f3c',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Heebo', sans-serif", direction: 'rtl',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap" rel="stylesheet" />
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1e5fa8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 24, fontWeight: 900 }}>F</span>
        </div>
        {error ? (
          <>
            <div style={{ fontSize: 18, color: '#ef4444', marginBottom: 8 }}>❌ {error}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>מעביר לעמוד הכניסה...</div>
          </>
        ) : (
          <>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #4ab8f5', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 17, fontWeight: 700 }}>{status}</div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
