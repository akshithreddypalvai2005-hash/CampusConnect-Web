import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Eye, EyeOff, LogIn, Sparkles, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loginWithSreyasRollNumber } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sreyas quick roll number login state
  const [rollInput, setRollInput] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [rollLoading, setRollLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/dashboard';

  // 1. Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const res = await loginWithGoogle();
      if (res?.success) {
        navigate(redirectPath);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // 2. Direct Sreyas Roll Number Verification Login
  const handleRollSubmit = async (e) => {
    e.preventDefault();
    if (!rollInput.trim()) return;

    try {
      setRollLoading(true);
      const res = await loginWithSreyasRollNumber(rollInput, studentNameInput);
      if (res?.success) {
        navigate(redirectPath);
      }
    } finally {
      setRollLoading(false);
    }
  };

  // 3. Regular Email / Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillSampleSreyas = (roll, name) => {
    setRollInput(roll);
    setStudentNameInput(name);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.25rem',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            }}
          >
            <Compass size={30} />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Sreyas CampusConnect Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sreyas Institute of Engineering & Technology — Lost & Found System
          </p>
        </div>

        {/* Official Sreyas Domain Restriction Notice */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-light)',
            border: '1px solid var(--accent)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            fontSize: '0.8125rem',
          }}
        >
          <Shield size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>College Domain Restriction Enforced:</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              Only Google accounts with email format <code>&lt;rollnumber&gt;@sreyas.ac.in</code> are authorized to log in.
            </p>
          </div>
        </div>

        {/* PRIMARY GOOGLE LOGIN VIA FIREBASE */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.8125rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'var(--transition)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
        >
          {/* Google 4-Color SVG Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {googleLoading ? 'Verifying with Google...' : 'Sign in with Sreyas Google Account'}
          </span>
        </button>
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
            fontWeight: 500,
          }}
        >
          * Only college mails are accepted (<code>&lt;rollnumber&gt;@sreyas.ac.in</code>)
        </p>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span style={{ padding: '0 0.75rem' }}>Or verify with roll number</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Quick Sreyas Roll Number Verification Form */}
        <form onSubmit={handleRollSubmit} style={{ marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Sreyas Roll Number</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 21VE1A0521 or 22241A0501"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                required
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              />
              <span
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderLeft: 'none',
                  padding: '0.6875rem 0.75rem',
                  borderTopRightRadius: 'var(--radius-md)',
                  borderBottomRightRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                @sreyas.ac.in
              </span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Student Name (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name (optional)"
              value={studentNameInput}
              onChange={(e) => setStudentNameInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={rollLoading || !rollInput}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <span>{rollLoading ? 'Verifying Sreyas ID...' : 'Sign In as Sreyas Student'}</span>
          </button>
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              marginTop: '0.5rem',
              fontWeight: 500,
            }}
          >
            * Only college mails are accepted (<code>&lt;rollnumber&gt;@sreyas.ac.in</code>)
          </p>
        </form>

        {/* Quick Sample Roll Numbers for Testing */}
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border)',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '0.4rem',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} color="var(--accent)" />
            <span>Click to Test Valid Sreyas Roll Numbers:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillSampleSreyas('21VE1A0521', '')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              21VE1A0521 (CSE)
            </button>
            <button
              type="button"
              onClick={() => fillSampleSreyas('22241A0501', '')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              22241A0501 (CSE)
            </button>
            <button
              type="button"
              onClick={() => fillSampleSreyas('23VE1A0412', '')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              23VE1A0412 (ECE)
            </button>
          </div>
        </div>

        {/* Collapsible Admin / Staff Password Login */}
        <details style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--accent)' }}>
            Admin Credentials Login (Click to expand)
          </summary>
          <form onSubmit={handleSubmit} style={{ marginTop: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Admin / Staff Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@campusconnect.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              Sign In as Admin
            </button>
          </form>
        </details>
      </div>
    </div>
  );
};

export default LoginPage;
