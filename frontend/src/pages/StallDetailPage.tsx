import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { api, getErrorMessage } from '../api/client';
import type { MenuItem, Stall } from '../types';
import FoodImage from '../components/FoodImage';
import StallActions from '../components/StallActions';
import { useFlash } from '../hooks/useFlash'; 
import ErrorState from '../components/ErrorState';
import { DetailSkeleton } from '../components/Skeleton';
import {
  categoryEmoji,
  categoryImage,
  formatRupiah,
  menuImage,
  minDelay,
} from '../utils';

export default function StallDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message: flash, setMessage: setFlash } = useFlash();
  const [stall, setStall] = useState<Stall | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    setNotFound(false);

    minDelay(
      Promise.all([api.get(`/stalls/${id}`), api.get(`/stalls/${id}/menus`)]),
    )
      .then(([stallRes, menuRes]) => {
        setStall(stallRes.data.data);
        setMenus(menuRes.data.data);
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));
  }, [id, reloadKey]);

  if (loading) {
    return (
      <div role="status">
        <p className="loading-note">
          <span className="bounce-sm">🍓</span> Lagi ngambil detail warung...
        </p>
        <DetailSkeleton />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="state-box">
        <span className="emoji">🔍</span>
        <p>Warung dengan ID {id} nggak ketemu.</p>
        <Link className="btn btn-primary" to="/">
          Balik ke daftar warung
        </Link>
      </div>
    );
  }

  if (error || !stall) {
    return (
      <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
    );
  }

  return (
    <div>
      <Link className="back-link" to="/">
        ‹ Semua warung
      </Link>

      {flash && (
        <div className="alert success flash" role="status">
          <span>{flash}</span>
          <button onClick={() => setFlash('')} aria-label="Tutup pesan">
            ✕
          </button>
        </div>
      )}

      <section className="detail-head">
        <div className={`tile big tile-${stall.id % 3}`}>
          <FoodImage
            src={categoryImage(stall.category)}
            alt={stall.category ?? stall.name}
            fallback={categoryEmoji(stall.category)}
          />
        </div>
        <div className="detail-main">
          <div className="stall-title">
            <h2>{stall.name}</h2>
            {stall.isPopular && <span className="hot">Lagi hits</span>}
          </div>
          <p className="meta">
            <span>{stall.location ?? 'Lokasi belum diisi'}</span>
            {stall.category && <span className="tag">{stall.category}</span>}
          </p>
          <StallActions
            stall={stall}
            onDeleted={(message) => navigate('/', { state: { flash: message } })}
          />
        </div>
        <div className="rating-sticker big">
          <b>★ {stall.avgRating.toFixed(1)}</b>
          <small>{stall.reviewCount} ulasan</small>
        </div>
      </section>

      <section className="detail-section">
        <h3>Tentang warung</h3>
        <p className="desc">{stall.description ?? 'Belum ada deskripsi.'}</p>
      </section>

      <section className="detail-section">
        <h3>Menu</h3>
        {menus.length === 0 ? (
          <p className="muted">Belum ada menu untuk warung ini.</p>
        ) : (
          <ul className="menu-grid">
            {menus.map((m) => (
              <li key={m.id} className={m.isAvailable ? 'menu-card' : 'menu-card sold'}>
                <div className="menu-img">
                  <FoodImage
                    src={menuImage(m.name)}
                    alt={m.name}
                    fallback={categoryEmoji(stall.category)}
                  />
                  <span className={m.isAvailable ? 'avail ok' : 'avail no'}>
                    {m.isAvailable ? 'Ready' : 'Habis'}
                  </span>
                </div>
                <div className="menu-info">
                  <h4>{m.name}</h4>
                  <strong className="price">{formatRupiah(m.price)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}