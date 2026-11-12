import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Skeleton';
import StallActions from '../../components/StallActions';
import { useAuth } from '../../context/AuthContext';
import { useFlash } from '../../hooks/useFlash';
import { useManagedStalls } from '../../hooks/useManagedStalls';
import { categoryEmoji } from '../../utils';

export default function KelolaStalls() {
  const { user } = useAuth();
  const { stalls, loading, error, reload } = useManagedStalls();
  const { message: flash, setMessage: setFlash } = useFlash();
  const [cari, setCari] = useState('');
  const isAdmin = user?.role === 'admin';

  const tampil = stalls.filter((s) =>
    s.name.toLowerCase().includes(cari.trim().toLowerCase()),
  );

  function handleDeleted(message: string) {
    setFlash(message);
    reload();
  }

  return (
    <div>
      <div className="kelola-head">
        <div>
          <p className="kelola-eyebrow">{isAdmin ? 'Mode admin' : 'Mode pemilik'}</p>
          <h2 className="kelola-title">{isAdmin ? 'Semua warung' : 'Warung saya'}</h2>
        </div>
        <Link className="btn btn-matcha" to="/stalls/new">
          + Tambah warung
        </Link>
      </div>

      {flash && (
        <div className="alert success flash" role="status">
          <span>{flash}</span>
          <button onClick={() => setFlash('')} aria-label="Tutup pesan">
            ✕
          </button>
        </div>
      )}

      <input
        className="kelola-search"
        type="text"
        aria-label="Cari warung"
        placeholder="Cari nama warung..."
        value={cari}
        onChange={(e) => setCari(e.target.value)}
      />

      {loading && <RowsSkeleton />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && tampil.length === 0 && (
        <div className="state-box">
          <span className="emoji">🍽️</span>
          <p>
            {cari
              ? `Warung "${cari}" nggak ketemu.`
              : isAdmin
                ? 'Belum ada warung yang terdaftar.'
                : 'Kamu belum punya warung. Yuk tambah warung pertamamu!'}
          </p>
        </div>
      )}

      {!loading && !error && tampil.length > 0 && (
        <ul className="manage-list">
          {tampil.map((s) => (
            <li className="manage-row" key={s.id}>
              <div className={`tile small tile-${s.id % 3}`}>
                {categoryEmoji(s.category)}
              </div>
              <div className="manage-info">
                <div className="stall-title">
                  <h3>{s.name}</h3>
                  {s.isPopular && <span className="hot">Lagi hits</span>}
                </div>
                <p className="meta">
                  <span>{s.location ?? 'Lokasi belum diisi'}</span>
                  {s.category && <span className="tag">{s.category}</span>}
                  <span>
                    ★ {s.avgRating.toFixed(1)} ({s.reviewCount} ulasan)
                  </span>
                </p>
              </div>
              <div className="manage-actions">
                <Link className="btn btn-sm btn-ghost" to={`/stalls/${s.id}`}>
                  Lihat
                </Link>
                <StallActions stall={s} onDeleted={handleDeleted} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}