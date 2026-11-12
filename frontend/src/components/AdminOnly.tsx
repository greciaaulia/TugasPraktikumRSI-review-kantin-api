import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Membungkus halaman yang hanya boleh dibuka admin
export default function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="state-box error">
        <span className="emoji">🚫</span>
        <p>Halaman ini cuma buat admin.</p>
        <Link className="btn btn-ghost" to="/kelola">
          Balik ke ringkasan
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}