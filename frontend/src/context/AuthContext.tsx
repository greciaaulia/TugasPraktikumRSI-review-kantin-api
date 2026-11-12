import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api/client';
import type { LoginResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Saat aplikasi dibuka: kalau ada token, tanya backend siapa pemiliknya (GET /auth/me)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Kalau token ditolak backend (401), anggap user sudah logout
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth-expired', handler);
    return () => window.removeEventListener('auth-expired', handler);
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ data: LoginResponse }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', res.data.data.token);
    setUser(res.data.data.user);
  }

  async function register(name: string, email: string, password: string) {
    await api.post('/auth/register', { name, email, password });
  }

  function logout() {
    // JWT itu stateless, jadi logout cukup hapus token di sisi frontend
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}