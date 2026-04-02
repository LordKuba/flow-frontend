'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { auth as authApi } from '@/lib/api';

const SUPABASE_URL = 'https://zzqmefxzdlzzppzknher.supabase.co';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flow-production-76f0.up.railway.app';

const C = {
  navy: '#0d1f3c', navyMid: '#1a3254', blue: '#1e5fa8',
  blueLight: '#3a8fe8', cream: '#f5f0e8', white: '#fff',
  green: '#22c55e', red: '#ef4444', gray: '#6b7280',
};

const features = [
  { icon: '💬', title: 'WhatsApp Business', desc: 'כל ההודעות במקום אחד' },
  { icon: '📥', title: 'Inbox חכם', desc: 'נהל שיחות, לידים ולקוחות' },
  { icon: '🤖', title: 'AI מזכירה', desc: 'תגובות אוטומטיות חכמות' },
  { icon: '📊', title: 'CRM מלא', desc: 'עקוב אחרי כל ליד' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('form'); // 'form' | 'forgot' | 'forgot_sent'
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '', organizationName: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Animated feature index
  const [featureIdx, setFeatureIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFeatureIdx(i => (i + 1) % features.length), 2800);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('נדרש שם מלא'); setLoading(false); return; }
        if (!form.organizationName.trim()) { setError('נדרש שם העסק'); setLoading(false); return; }
        await register(form.email, form.password, form.name, form.organizationName);
      }
      router.push('/');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login') || msg.includes('invalid')) setError('מייל או סיסמא שגויים');
      else if (msg.includes('already registered') || msg.includes('already exists')) setError('המייל כבר רשום במערכת');
      else if (msg.includes('Password')) setError('הסיסמא חייבת להיות לפחות 6 תווים');
      else setError(msg || 'שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!form.email) { setError('הכנס מייל קודם'); return; }
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(form.email);
      setStep('forgot_sent');
    } catch {
      setError('שגיאה בשליחת המייל, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  };

  const switchMode = (m) => { setMode(m); setError(''); setStep('form'); };

  /* ── Styles ── */
  const inp = {
    width: '100%', padding: '12px 16px', fontSize: 15, borderRadius: 12,
    border: '1.5px solid rgba(0,0,0,0.12)', background: '#fafafa',
    color: C.navy, fontFamily: 'inherit', direction: 'rtl',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Heebo', sans-serif", direction: 'rtl' }}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      {/* ── Left Panel — Branding ── */}
      <div style={{
        flex: 1, background: C.navy, padding: '48px 52px',
        flexDirection: 'column', justifyContent: 'space-between', position: 'relative',
        overflow: 'hidden',
      }} className="login-left">
        {/* BG blobs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(30,95,168,0.25)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(74,184,245,0.15)', filter: 'blur(50px)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>F</span>
            </div>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>Flow</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 16 }}>
            כל השיחות<br />במקום אחד
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
            פלטפורמת ה-CRM הישראלית לעסקים קטנים ובינוניים
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: featureIdx === i ? 'rgba(30,95,168,0.55)' : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${featureIdx === i ? 'rgba(74,184,245,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14, padding: '16px 18px',
                transition: 'all 0.4s ease',
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['#e74c3c','#3498db','#2ecc71','#f39c12'].map((c, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.2)', marginRight: -8 }} />
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              +500 עסקים ישראלים כבר עובדים עם Flow
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div style={{
        width: '100%', maxWidth: 520, background: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 44px', overflowY: 'auto',
      }}>
        {/* Mobile logo */}
        <div className="mobile-logo" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: C.blue, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>F</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.navy }}>Flow</div>
        </div>

        {/* ── Forgot Password Sent ── */}
        {step === 'forgot_sent' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>בדוק את המייל שלך</div>
            <div style={{ fontSize: 14, color: C.gray, marginBottom: 28, lineHeight: 1.7 }}>
              שלחנו קישור לאיפוס סיסמא ל-<strong>{form.email}</strong>
            </div>
            <button onClick={() => { setStep('form'); setError(''); }}
              style={{ padding: '11px 28px', borderRadius: 12, border: 'none', background: C.blue, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              חזרה להתחברות
            </button>
          </div>

        ) : step === 'forgot' ? (
          /* ── Forgot Password Form ── */
          <>
            <button onClick={() => { setStep('form'); setError(''); }}
              style={{ background: 'none', border: 'none', color: C.blue, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
              ← חזרה
            </button>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>שכחת סיסמא?</div>
            <div style={{ fontSize: 14, color: C.gray, marginBottom: 28 }}>הכנס את המייל שלך ונשלח לך קישור לאיפוס</div>
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input style={inp} type="email" placeholder="כתובת מייל" value={form.email}
                onChange={e => set('email', e.target.value)} required />
              {error && <ErrorBox msg={error} />}
              <button type="submit" disabled={loading}
                style={{ padding: '13px 0', borderRadius: 12, border: 'none', background: loading ? '#93c5fd' : C.blue, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
              </button>
            </form>
          </>

        ) : (
          /* ── Main Form ── */
          <>
            {/* Mode tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 28 }}>
              {[['login','התחברות'], ['register','הרשמה']].map(([m, label]) => (
                <button key={m} onClick={() => switchMode(m)}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? C.navy : C.gray,
                    boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 4 }}>
              {mode === 'login' ? 'ברוך הבא חזרה 👋' : 'צור חשבון חינמי 🚀'}
            </div>
            <div style={{ fontSize: 14, color: C.gray, marginBottom: 26 }}>
              {mode === 'login' ? 'התחבר לחשבון Flow שלך' : 'הצטרף לאלפי עסקים שמנהלים הכל ב-Flow'}
            </div>

            {/* Google button */}
            <button onClick={handleGoogle} disabled={googleLoading}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.12)', background: '#fff', color: C.navy, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, transition: 'background 0.2s' }}>
              {googleLoading
                ? <><Spinner /> מתחבר...</>
                : <><GoogleIcon />{mode === 'login' ? 'התחבר עם Google' : 'הרשם עם Google'}</>}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 13, color: C.gray }}>או</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'register' && (
                <>
                  <input style={inp} placeholder="שם מלא" value={form.name} onChange={e => set('name', e.target.value)} required />
                  <input style={inp} placeholder="שם העסק" value={form.organizationName} onChange={e => set('organizationName', e.target.value)} required />
                </>
              )}
              <input style={inp} type="email" placeholder="כתובת מייל" value={form.email} onChange={e => set('email', e.target.value)} required />
              <input style={inp} type="password" placeholder="סיסמא" value={form.password} onChange={e => set('password', e.target.value)} required />

              {error && <ErrorBox msg={error} />}

              {mode === 'login' && (
                <button type="button" onClick={() => { setStep('forgot'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: C.blue, fontSize: 13, cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit', padding: '2px 0' }}>
                  שכחתי סיסמא
                </button>
              )}

              <button type="submit" disabled={loading}
                style={{ marginTop: 4, padding: '13px 0', borderRadius: 12, border: 'none', background: loading ? '#93c5fd' : C.navy, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {loading ? <><Spinner />{mode === 'login' ? 'מתחבר...' : 'יוצר חשבון...'}</> : mode === 'login' ? 'כניסה' : 'יצירת חשבון'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.gray }}>
              {mode === 'login' ? 'עוד אין לך חשבון?' : 'כבר יש לך חשבון?'}{' '}
              <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                style={{ color: C.blue, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                {mode === 'login' ? 'הרשמה בחינם' : 'התחבר'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .login-left { display: flex; }
        .mobile-logo { display: none; }
        @media (max-width: 767px) {
          .login-left { display: none !important; }
          .mobile-logo { display: block !important; }
        }
        input:focus { border-color: #1e5fa8 !important; background: #fff !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: C.red, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>⚠️</span> {msg}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
