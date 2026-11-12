import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getErrorMessage,
  getFieldErrors,
  type FieldError,
} from '../api/client';

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const justRegistered = (location.state as { registered?: boolean } | null)
    ?.registered;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  // Kalau sudah login, tidak perlu lihat halaman ini
  if (user) {
    return <Navigate to={user.role === 'customer' ? '/' : '/kelola'} replace />;
  }

  const msg = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors([]);
    try {
      await login(email, password);
    } catch (err) {
      const fields = getFieldErrors(err);
      setFieldErrors(fields);
      setError(fields.length > 0 ? '' : getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Selamat datang kembali 👋</h2>
      <p className="muted">Masuk untuk mengelola warung atau melihat akunmu</p>

      {justRegistered && (
        <div className="alert success">
          Registrasi berhasil! Silakan masuk dengan akunmu.
        </div>
      )}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
          />
          {msg('email') && <span className="field-error">{msg('email')}</span>}
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password kamu"
          />
          {msg('password') && (
            <span className="field-error">{msg('password')}</span>
          )}
        </label>

        <button className="submit-btn" type="submit" disabled={submitting}>
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="auth-switch">
        Belum punya akun? <Link to="/register">Daftar di sini</Link>
      </p>
    </div>
  );
}