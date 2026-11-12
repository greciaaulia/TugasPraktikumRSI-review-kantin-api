import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getErrorMessage,
  getFieldErrors,
  type FieldError,
} from '../api/client';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  if (user) return <Navigate to="/" replace />;

  const msg = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors([]);
    try {
      await register(name, email, password);
      navigate('/login', { state: { registered: true } });
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
      <h2>Buat akun baru ✨</h2>
      <p className="muted">Gabung untuk mulai menjelajah dan mengelola warung</p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Nama
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkapmu"
          />
          {msg('name') && <span className="field-error">{msg('name')}</span>}
        </label>

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
            placeholder="Minimal 8 karakter"
          />
          {msg('password') && (
            <span className="field-error">{msg('password')}</span>
          )}
        </label>

        <button className="submit-btn" type="submit" disabled={submitting}>
          {submitting ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun? <Link to="/login">Masuk di sini</Link>
      </p>
    </div>
  );
}