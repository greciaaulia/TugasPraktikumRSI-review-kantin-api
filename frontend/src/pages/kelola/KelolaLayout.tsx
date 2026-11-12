import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canCreateStall } from '../../permissions';

// Kerangka Ruang Kelola: hanya untuk owner dan admin
export default function KelolaLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="state-box" role="status">
        <span className="bounce">🍓</span>
        <p>Lagi nyiapin ruang kelola...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="state-box">
        <span className="emoji">🔒</span>
        <p>Ruang kelola cuma bisa dibuka setelah masuk.</p>
        <Link className="btn btn-primary" to="/login">
          Masuk
        </Link>
      </div>
    );
  }

  if (!canCreateStall(user)) {
    return (
      <div className="state-box error">
        <span className="emoji">🚫</span>
        <p>Ruang kelola cuma buat owner dan admin.</p>
        <Link className="btn btn-ghost" to="/">
          Balik ke beranda
        </Link>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'side-link active' : 'side-link';

  return (
    <div className={`kelola kelola-${user.role}`}>
      <aside className="kelola-side">
        <div className="side-head">
          <span className="side-avatar">{user.name.charAt(0).toUpperCase()}</span>
          <div>
            <b>{user.name}</b>
            <span className="side-role">{isAdmin ? 'Admin' : 'Pemilik warung'}</span>
          </div>
        </div>
        <nav className="side-nav">
          <NavLink end to="/kelola" className={linkClass}>
            📊 Ringkasan
          </NavLink>
          <NavLink to="/kelola/warung" className={linkClass}>
            🏪 {isAdmin ? 'Semua warung' : 'Warung saya'}
          </NavLink>
            {isAdmin && (
            <>
              <NavLink to="/kelola/pengguna" className={linkClass}>
                👥 Pengguna
              </NavLink>
              <NavLink to="/kelola/laporan" className={linkClass}>
                🚩 Laporan
              </NavLink>
              <NavLink to="/kelola/riwayat" className={linkClass}>
                🕘 Riwayat
              </NavLink>
            </>
          )}
          <Link className="side-link" to="/stalls/new">
            ➕ Tambah warung
          </Link>
          <Link className="side-link" to="/">
            🌐 Lihat situs
          </Link>
        </nav>
      </aside>

      <section className="kelola-main">
        <Outlet />
      </section>
    </div>
  );
}