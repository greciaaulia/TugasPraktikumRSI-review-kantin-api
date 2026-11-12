import { useState } from 'react';
import AdminOnly from '../../components/AdminOnly';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Skeleton';
import { useFetch } from '../../hooks/useFetch';
import type { Role, UserRow } from '../../types';
import { formatTanggal } from '../../utils';

const FILTER: Array<'semua' | Role> = ['semua', 'admin', 'owner', 'customer'];

export default function KelolaUsers() {
  const { data, loading, error, reload } = useFetch<UserRow[]>('/users');
  const [filter, setFilter] = useState<'semua' | Role>('semua');
  const [cari, setCari] = useState('');

  const users = data ?? [];
  const q = cari.trim().toLowerCase();
  const tampil = users.filter(
    (u) =>
      (filter === 'semua' || u.role === filter) &&
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  );
  const hitung = (r: 'semua' | Role) =>
    r === 'semua' ? users.length : users.filter((u) => u.role === r).length;

  return (
    <AdminOnly>
      <p className="kelola-eyebrow">Mode admin</p>
      <h2 className="kelola-title">Pengguna</h2>
      <p className="muted">Daftar semua akun yang terdaftar di cobainyuk.</p>

      <div className="chips kelola-chips">
        {FILTER.map((r) => (
          <button
            key={r}
            className={filter === r ? 'chip active' : 'chip'}
            onClick={() => setFilter(r)}
          >
            {r === 'semua' ? 'Semua' : r} ({hitung(r)})
          </button>
        ))}
      </div>

      <input
        className="kelola-search"
        type="text"
        aria-label="Cari pengguna"
        placeholder="Cari nama atau email..."
        value={cari}
        onChange={(e) => setCari(e.target.value)}
      />

      {loading && <RowsSkeleton />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && tampil.length === 0 && (
        <div className="state-box">
          <span className="emoji">👤</span>
          <p>Nggak ada pengguna yang cocok.</p>
        </div>
      )}

      {!loading && !error && tampil.length > 0 && (
        <ul className="manage-list">
          {tampil.map((u) => (
            <li className="manage-row" key={u.id}>
              <div className={`tile small tile-${u.id % 3}`}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="manage-info">
                <div className="stall-title">
                  <h3>{u.name}</h3>
                  <span className={`role role-${u.role}`}>{u.role}</span>
                </div>
                <p className="meta">
                  <span>{u.email}</span>
                  <span>Bergabung {formatTanggal(u.createdAt)}</span>
                </p>
              </div>
              <span className="muted user-id">#{u.id}</span>
            </li>
          ))}
        </ul>
      )}
    </AdminOnly>
  );
}