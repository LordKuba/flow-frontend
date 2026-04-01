'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const C = {
  navy: "#0d1f3c", blue: "#1e5fa8", blueLight: "#3a8fe8",
  cream: "#f5f0e8", white: "#ffffff", red: "#ef4444",
};

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '', password: '', name: '', organizationName: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.name, form.organizationName);
      }
      router.push('/');
    } catch (err) {
      setError(err.message || 'שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 15,
    border: '1.5px solid rgba(0,0,0,0.12)', outline: 'none',
    fontFamily: 'inherit', direction: 'rtl', background: '#fff',
    color: '#0d1f3c', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.cream, borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: C.blue, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>F</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.navy }}>Flow</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {mode === 'login' ? 'ברוך הבא! התחבר לחשבונך' : 'צור חשבון חדש לעסק שלך'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <>
              <input style={inputStyle} placeholder="שם מלא" value={form.name}
                onChange={e => set('name', e.target.value)} required />
              <input style={inputStyle} placeholder="שם העסק" value={form.organizationName}
                onChange={e => set('organizationName', e.target.value)} required />
            </>
          )}

          <input style={inputStyle} type="email" placeholder="אימייל" value={form.email}
            onChange={e => set('email', e.target.value)} required />

          <input style={inputStyle} type="password" placeholder="סיסמה" value={form.password}
            onChange={e => set('password', e.target.value)} required />

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: C.red, fontSize: 14, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ background: loading ? '#93c5fd' : C.blue, color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
            {loading ? 'טוען...' : mode === 'login' ? 'כניסה' : 'הרשמה'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          {mode === 'login' ? 'אין לך חשבון?' : 'יש לך חשבון?'}
          {' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: C.blue, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
            {mode === 'login' ? 'הרשמה' : 'התחברות'}
          </button>
        </div>
      </div>
    </div>
  );
}
