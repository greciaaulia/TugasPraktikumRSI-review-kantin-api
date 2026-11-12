import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canCreateStall } from '../permissions';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const staff = canCreateStall(user);

  return (
    <header className={staff && user ? `navbar staff-${user.role}` : 'navbar'}>
      <Link to="/" className="brand">
        <span className="brand-badge">🍓</span>
        <span className="brand-name">cobainyuk</span>
      </Link>

      <nav className="nav-right">
        {!loading && user && (
          <>
            {staff && (
              <Link className="nav-kelola" to="/kelola">
                Ruang Kelola
              </Link>
            )}
            <span className="user-chip">
              <span className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="user-meta">
                <b>{user.name}</b>
                <span className={`role role-${user.role}`}>{user.role}</span>
              </span>
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Keluar
            </button>
          </>
        )}
        {!loading && !user && (
          <>
            <Link className="nav-link" to="/login">
              Masuk
            </Link>
            <Link className="btn btn-primary" to="/register">
              Daftar
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}