import { useState } from 'react';
import AdminOnly from '../../components/AdminOnly';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Skeleton';
import { useFetch } from '../../hooks/useFetch';
import type { AuditRow, UserRow } from '../../types';
import { formatTanggal } from '../../utils';

const LABEL_AKSI: Record<string, string> = {
  CREATE_STALL: 'Menambah warung',
  UPDATE_STALL: 'Mengubah warung',
  DELETE_STALL: 'Menghapus warung',
  REGISTER: 'Mendaftar akun',
};

const LABEL_TABEL: Record<string, string> = {
  STALLS: 'Warung',
  USERS: 'Pengguna',
  REVIEWS: 'Ulasan',
  FLAGS: 'Laporan',
  MENU_ITEMS: 'Menu',
};

function jenisAksi(action: string): string {
  if (action.startsWith('CREATE') || action === 'REGISTER') return 'buat';
  if (action.startsWith('UPDATE')) return 'ubah';
  if (action.startsWith('DELETE')) return 'hapus';
  return 'lain';
}

const PER_HALAMAN = 20;

export default function KelolaAudit() {
  const logs = useFetch<AuditRow[]>('/audit');
  const users = useFetch<UserRow[]>('/users');
  const [jumlah, setJumlah] = useState(PER_HALAMAN);

  const loading = logs.loading || users.loading;
  const error = logs.error || users.error;
  const nama = new Map((users.data ?? []).map((u) => [u.id, u.name]));
  // data dari backend urut lama -> baru, dibalik supaya yang terbaru di atas
  const urut = [...(logs.data ?? [])].reverse();

  return (
    <AdminOnly>
      <p className="kelola-eyebrow">Mode admin</p>
      <h2 className="kelola-title">Riwayat aktivitas</h2>
      <p className="muted">Catatan siapa melakukan apa, dari yang paling baru.</p>

      {loading && <RowsSkeleton />}
      {!loading && error && (
        <ErrorState
          message={error}
          onRetry={() => {
            logs.reload();
            users.reload();
          }}
        />
      )}

      {!loading && !error && urut.length === 0 && (
        <div className="state-box">
          <span className="emoji">📜</span>
          <p>Belum ada aktivitas yang tercatat.</p>
        </div>
      )}

      {!loading && !error && urut.length > 0 && (
        <>
          <ul className="manage-list">
            {urut.slice(0, jumlah).map((l) => (
              <li className={`log-row log-${jenisAksi(l.action)}`} key={l.id}>
                <div className="log-main">
                  <b>{nama.get(l.userId) ?? `Pengguna #${l.userId}`}</b>
                  <span className="log-action">{LABEL_AKSI[l.action] ?? l.action}</span>
                </div>
                <p className="meta">
                  <span>
                    {LABEL_TABEL[l.targetTable] ?? l.targetTable} #{l.targetId}
                  </span>
                  {l.metadata && <span>{l.metadata}</span>}
                  <span>{formatTanggal(l.createdAt)}</span>
                </p>
              </li>
            ))}
          </ul>
          {jumlah < urut.length && (
            <div className="quick-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setJumlah((j) => j + PER_HALAMAN)}
              >
                Tampilkan lebih banyak
              </button>
            </div>
          )}
        </>
      )}
    </AdminOnly>
  );
}