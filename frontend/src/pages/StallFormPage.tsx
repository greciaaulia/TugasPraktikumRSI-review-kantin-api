import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  api,
  getErrorMessage,
  getFieldErrors,
  type FieldError,
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import { canCreateStall } from '../permissions';
import type { Stall } from '../types';

const KATEGORI_SARAN = ['Nasi', 'Bakso', 'Mie', 'Kwetiau', 'Minuman', 'Western', 'Sate', 'Soto'];

// Satu form dipakai untuk Tambah (/stalls/new) dan Edit (/stalls/:id/edit)
export default function StallFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [ownerId, setOwnerId] = useState<number | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  // Mode edit: ambil data warung yang mau diubah
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    setNotFound(false);
    setLoadError('');
    api
      .get<{ data: Stall }>(`/stalls/${id}`)
      .then((res) => {
        const s = res.data.data;
        setNama(s.name);
        setKategori(s.category ?? '');
        setLokasi(s.location ?? '');
        setDeskripsi(s.description ?? '');
        setOwnerId(s.ownerId);
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(getErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const msg = (field: string) =>
    fieldErrors.find((e) => e.field === field)?.message;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors([]);

    const payload = {
      name: nama.trim(),
      category: kategori.trim() || null,
      location: lokasi.trim() || null,
      description: deskripsi.trim() || null,
    };

    try {
      if (isEdit) {
        await api.put(`/stalls/${id}`, payload);
        navigate(`/stalls/${id}`, {
          state: { flash: 'Perubahan warung berhasil disimpan' },
        });
      } else {
        await api.post('/stalls', payload);
        navigate('/kelola/warung', { state: { flash: 'Warung baru berhasil ditambahkan' } });
      }
    } catch (err) {
      const fields = getFieldErrors(err);
      setFieldErrors(fields);
      setError(fields.length > 0 ? '' : getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || (isEdit && loading)) {
    return (
      <div className="state-box" role="status">
        <span className="bounce">🍓</span>
        <p>Lagi nyiapin form...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="state-box">
        <span className="emoji">🔒</span>
        <p>Kamu harus masuk dulu buat ngelola warung.</p>
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
        <p>Halaman ini cuma buat owner dan admin.</p>
        <Link className="btn btn-ghost" to="/">
          Balik ke beranda
        </Link>
      </div>
    );
  }

  if (isEdit && notFound) {
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

  if (isEdit && loadError) {
    return (
      <div className="state-box error" role="alert">
        <span className="emoji">🫠</span>
        <p>Gagal memuat data warung: {loadError}</p>
        <Link className="btn btn-ghost" to="/">
          Balik ke beranda
        </Link>
      </div>
    );
  }

  if (isEdit && user.role !== 'admin' && ownerId !== user.id) {
    return (
      <div className="state-box error">
        <span className="emoji">🚫</span>
        <p>Kamu hanya bisa mengubah warung milikmu sendiri.</p>
        <Link className="btn btn-ghost" to={`/stalls/${id}`}>
          Lihat warungnya saja
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card form-card">
      <h2>{isEdit ? 'Edit warung' : 'Tambah warung baru'}</h2>
      <p className="muted">
        {isEdit
          ? 'Ubah info warung, lalu simpan.'
          : 'Isi info warungmu. Kamu otomatis jadi pemiliknya.'}
      </p>

      {isEdit && user.role !== 'admin' && ownerId !== user.id && (
        <div className="alert warn">
          Warung ini bukan milikmu. Kamu bisa mencoba menyimpan, tetapi server akan
          menolaknya (403) sesuai aturan hak akses.
        </div>
      )}
      
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Nama warung
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Warung Bu Tini"
          />
          {msg('name') && <span className="field-error">{msg('name')}</span>}
        </label>

        <label>
          Kategori
          <input
            type="text"
            list="kategori-saran"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            placeholder="Pilih atau ketik sendiri"
          />
          <datalist id="kategori-saran">
            {KATEGORI_SARAN.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
          {msg('category') && (
            <span className="field-error">{msg('category')}</span>
          )}
        </label>

        <label>
          Lokasi
          <input
            type="text"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Contoh: Kantin FKIP"
          />
          {msg('location') && (
            <span className="field-error">{msg('location')}</span>
          )}
        </label>

        <label>
          Deskripsi
          <textarea
            rows={4}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Ceritakan sedikit tentang warungmu"
          />
          {msg('description') && (
            <span className="field-error">{msg('description')}</span>
          )}
        </label>

        <div className="form-actions">
          <Link className="btn btn-ghost" to={isEdit ? `/stalls/${id}` : '/kelola/warung'}>
            Batal
          </Link>
          <button className="submit-btn" type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Tambah warung'}
          </button>
        </div>
      </form>
    </div>
  );
}