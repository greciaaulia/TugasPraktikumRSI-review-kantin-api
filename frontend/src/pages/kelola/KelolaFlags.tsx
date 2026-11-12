import { useState } from 'react';
import AdminOnly from '../../components/AdminOnly';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Skeleton';
import { api, getErrorMessage } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import type { FlagRow } from '../../types';
import { formatTanggal } from '../../utils';

type Tampilan = 'terbuka' | 'selesai' | 'semua';

export default function KelolaFlags() {
  const { data, loading, error, reload } = useFetch<FlagRow[]>('/flags');
  const [tampilan, setTampilan] = useState<Tampilan>('terbuka');
  const [prosesId, setProsesId] = useState<number | null>(null);
  const [pesan, setPesan] = useState('');
  const [galat, setGalat] = useState('');

  const flags = data ?? [];
  const selesai = (f: FlagRow) => f.status === 'resolved';
  const tampil = flags.filter((f) =>
    tampilan === 'semua' ? true : tampilan === 'selesai' ? selesai(f) : !selesai(f),
  );

  async function tandaiSelesai(f: FlagRow) {
    setProsesId(f.id);
    setPesan('');
    setGalat('');
    try {
      await api.put(`/flags/${f.id}`, { status: 'resolved' });
      setPesan(`Laporan #${f.id} ditandai selesai`);
      reload();
    } catch (err) {
      setGalat(getErrorMessage(err));
    } finally {
      setProsesId(null);
    }
  }

  return (
    <AdminOnly>
      <p className="kelola-eyebrow">Mode admin</p>
      <h2 className="kelola-title">Laporan ulasan</h2>
      <p className="muted">Ulasan yang dilaporkan pengguna dan perlu dicek admin.</p>

      <div className="chips kelola-chips">
        {(['terbuka', 'selesai', 'semua'] as Tampilan[]).map((t) => (
          <button
            key={t}
            className={tampilan === t ? 'chip active' : 'chip'}
            onClick={() => setTampilan(t)}
          >
            {t === 'terbuka' ? 'Belum selesai' : t === 'selesai' ? 'Selesai' : 'Semua'}
          </button>
        ))}
      </div>

      {pesan && (
        <div className="alert success flash" role="status">
          <span>{pesan}</span>
          <button onClick={() => setPesan('')} aria-label="Tutup pesan">
            ✕
          </button>
        </div>
      )}
      {galat && <div className="alert error">{galat}</div>}

      {loading && <RowsSkeleton />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && tampil.length === 0 && (
        <div className="state-box">
          <span className="emoji">🎉</span>
          <p>
            {tampilan === 'terbuka'
              ? 'Nggak ada laporan yang menunggu. Aman!'
              : 'Belum ada laporan di kategori ini.'}
          </p>
        </div>
      )}

      {!loading && !error && tampil.length > 0 && (
        <ul className="manage-list">
          {tampil.map((f) => (
            <li className={selesai(f) ? 'flag-card done' : 'flag-card'} key={f.id}>
              <div className="flag-top">
                <span className="rating-sticker mini">
                  <b>★ {f.review.rating}</b>
                </span>
                <span className={selesai(f) ? 'avail ok' : 'avail no pending'}>
                  {selesai(f) ? 'Selesai' : f.status}
                </span>
                <span className="muted flag-date">{formatTanggal(f.createdAt)}</span>
              </div>
              <p className="flag-comment">
                {f.review.comment ? `"${f.review.comment}"` : 'Ulasan tanpa komentar'}
              </p>
              <p className="meta">
                <span>Alasan: {f.reason ?? '-'}</span>
                <span>Dilaporkan oleh {f.reporter.name}</span>
              </p>
              {!selesai(f) && (
                <button
                  className="btn btn-sm btn-matcha"
                  disabled={prosesId === f.id}
                  onClick={() => tandaiSelesai(f)}
                >
                  {prosesId === f.id ? 'Memproses...' : 'Tandai selesai'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </AdminOnly>
  );
}