import { Link } from 'react-router-dom';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { useManagedStalls } from '../../hooks/useManagedStalls';
import type { FlagRow, UserRow } from '../../types';

export default function KelolaOverview() {
  const { user } = useAuth();
  const { stalls, loading, error, reload } = useManagedStalls();
  const isAdmin = user?.role === 'admin';
  // Data tambahan khusus admin (owner tidak mengirim request ini)
  const users = useFetch<UserRow[]>(isAdmin ? '/users' : null);
  const flags = useFetch<FlagRow[]>(isAdmin ? '/flags' : null);
  const jumlahUser = users.data?.length ?? 0;
  const laporanTerbuka = (flags.data ?? []).filter((f) => f.status !== 'resolved').length;

  const totalUlasan = stalls.reduce((sum, s) => sum + s.reviewCount, 0);
  const berating = stalls.filter((s) => s.reviewCount > 0);
  const rataRating =
    berating.length > 0
      ? berating.reduce((sum, s) => sum + s.avgRating, 0) / berating.length
      : 0;
  const jumlahHits = stalls.filter((s) => s.isPopular).length;

  return (
    <div>
      <p className="kelola-eyebrow">{isAdmin ? 'Mode admin' : 'Mode pemilik'}</p>
      <h2 className="kelola-title">Halo, {user?.name}!</h2>
      <p className="muted">
        {isAdmin
          ? 'Ini gambaran seluruh warung yang ada di cobainyuk.'
          : 'Ini gambaran warung-warung milikmu.'}
      </p>

      {loading && <RowsSkeleton count={2} />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="stat-grid">
            <div className="stat-card s-pink">
              <span>{isAdmin ? 'Total warung' : 'Warung saya'}</span>
              <b>{stalls.length}</b>
            </div>
            <div className="stat-card s-matcha">
              <span>Total ulasan</span>
              <b>{totalUlasan}</b>
            </div>
            <div className="stat-card s-butter">
              <span>Rata-rata rating</span>
              <b>{rataRating > 0 ? rataRating.toFixed(1) : '-'}</b>
            </div>
            <div className="stat-card s-white">
              <span>Lagi hits</span>
              <b>{jumlahHits}</b>
            </div>
          </div>

          {isAdmin && (
            <div className="stat-grid">
              <div className="stat-card s-white">
                <span>Pengguna terdaftar</span>
                <b>{users.error ? '-' : jumlahUser}</b>
              </div>
              <div className="stat-card s-pink">
                <span>Laporan belum selesai</span>
                <b>{flags.error ? '-' : laporanTerbuka}</b>
              </div>
            </div>
          )}

          {stalls.length === 0 && (
            <div className="state-box">
              <span className="emoji">🍽️</span>
              <p>
                {isAdmin
                  ? 'Belum ada warung yang terdaftar.'
                  : 'Kamu belum punya warung. Yuk tambah warung pertamamu!'}
              </p>
            </div>
          )}

          <div className="quick-actions">
            <Link className="btn btn-matcha" to="/stalls/new">
              + Tambah warung
            </Link>
            <Link className="btn btn-ghost" to="/kelola/warung">
              Kelola warung
            </Link>
          </div>
        </>
      )}
    </div>
  );
}