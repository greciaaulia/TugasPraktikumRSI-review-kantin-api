import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { Stall, StallListResponse } from '../types';
import FoodImage from '../components/FoodImage';
import StallActions from '../components/StallActions';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../hooks/useFlash';
import { canCreateStall } from '../permissions';
import ErrorState from '../components/ErrorState';
import { StallGridSkeleton } from '../components/Skeleton';
import { categoryEmoji, categoryImage, minDelay } from '../utils';

const LIMIT = 8;

export default function StallListPage() {
  const { user } = useAuth();
  const { message: flash, setMessage: setFlash } = useFlash();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Ambil daftar kategori, buat isi chip filter
  useEffect(() => {
    api
      .get<StallListResponse>('/stalls', { params: { limit: 100 } })
      .then((res) => {
        const list = res.data.data
          .map((s) => s.category)
          .filter((c): c is string => !!c);
        setCategories([...new Set(list)]);
      })
      .catch(() => {});
  }, [reloadKey]);

    // Ambil daftar warung setiap kali search, kategori, atau halaman berubah
  useEffect(() => {
    setLoading(true);
    setError('');
    minDelay(
      api.get<StallListResponse>('/stalls', {
        params: {
          search: search || undefined,
          category: category || undefined,
          page,
          limit: LIMIT,
        },
      }),
    )
      .then((res) => {
        setStalls(res.data.data);
        setTotal(res.data.meta.total);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, category, page, reloadKey]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function pilihKategori(c: string) {
    setCategory(c);
    setPage(1);
  }

  // Dipanggil setelah admin berhasil menghapus warung
  function handleDeleted(message: string) {
    setFlash(message);
    if (stalls.length === 1 && page > 1) setPage(page - 1);
    else setReloadKey((k) => k + 1);
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const nomorHalaman = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      {flash && (
        <div className="alert success flash" role="status">
          <span>{flash}</span>
          <button onClick={() => setFlash('')} aria-label="Tutup pesan">
            ✕
          </button>
        </div>
      )}

      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-title">
            <span>Lapar?</span>
            <span className="hero-line2">Cobain yuk!</span>
          </h1>
          <p className="hero-sub">
            Cari warung kampus, intip menunya, dan baca ulasan sebelum antre.
          </p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              aria-label="Cari nama warung"
              placeholder="Mau makan apa? Ketik nama warung"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Cari
            </button>
          </form>
        </div>

        <div className="hero-stickers" aria-hidden="true">
          <span className="sticker s1">🍜</span>
          <span className="sticker s2">🧋</span>
          <span className="sticker s3">🍢</span>
          <span className="sticker s4">🍓</span>
        </div>
      </section>

      <div className="chips">
        <button
          className={category === '' ? 'chip active' : 'chip'}
          onClick={() => pilihKategori('')}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? 'chip active' : 'chip'}
            onClick={() => pilihKategori(c)}
          >
            {categoryEmoji(c)} {c}
          </button>
        ))}
      </div>

      <div className="list-head">
        <p className="result-info">
          {!loading && !error && total > 0 && (
            <>
              <b>{total}</b> warung siap dicicip
            </>
          )}
        </p>
        {canCreateStall(user) && (
          <Link className="btn btn-matcha" to="/stalls/new">
            + Tambah warung
          </Link>
        )}
      </div>

            {/* Loading state */}
      {loading && (
        <div role="status">
          <p className="loading-note">
            <span className="bounce-sm">🍓</span> Lagi nyiapin warung...
          </p>
          <StallGridSkeleton />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      )}

      {/* Empty state */}
      {!loading && !error && stalls.length === 0 && (
        <div className="state-box">
          <span className="emoji">🍽️</span>
          <p>
            {search
              ? `Warung "${search}" belum ketemu. Coba kata kunci lain atau pilih Semua.`
              : category
                ? 'Belum ada warung di kategori ini.'
                : 'Belum ada warung yang terdaftar.'}
          </p>
        </div>
      )}

      {/* Daftar warung */}
      {!loading && !error && stalls.length > 0 && (
        <>
          <ul className="stall-grid">
            {stalls.map((s) => (
              <li className="stall-card" key={s.id}>
                <div className={`card-cover tile-${s.id % 3}`}>
                  <FoodImage
                    src={categoryImage(s.category)}
                    alt={s.category ?? s.name}
                    fallback={categoryEmoji(s.category)}
                  />
                  {s.isPopular && <span className="hot cover-hot">Lagi hits</span>}
                  <span className="cover-rating">★ {s.avgRating.toFixed(1)}</span>
                </div>

                <div className="card-body">
                  <h3>{s.name}</h3>
                  <p className="meta">
                    <span>{s.location ?? 'Lokasi belum diisi'}</span>
                  </p>
                  {s.description && <p className="blurb">{s.description}</p>}
                  <div className="card-foot">
                    {s.category && <span className="tag">{s.category}</span>}
                    <span className="reviews">{s.reviewCount} ulasan</span>
                  </div>
                  <Link className="btn btn-primary btn-block" to={`/stalls/${s.id}`}>
                    Lihat menu
                  </Link>
                  <StallActions stall={s} onDeleted={handleDeleted} />
                </div>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button
              className="page-btn"
              aria-label="Halaman sebelumnya"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              ‹
            </button>
            {nomorHalaman.map((n) => (
              <button
                key={n}
                className={n === page ? 'page-btn active' : 'page-btn'}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="page-btn"
              aria-label="Halaman berikutnya"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              ›
            </button>
          </div>
        </>
      )}
    </div>
  );
}