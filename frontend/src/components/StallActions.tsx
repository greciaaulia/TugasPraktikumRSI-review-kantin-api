import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { canDeleteStall, canEditStall } from '../permissions';
import type { Stall } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  stall: Stall;
  onDeleted: (message: string) => void;
}

// Tombol Edit / Hapus yang muncul sesuai role
export default function StallActions({ stall, onDeleted }: Props) {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const showEdit = canEditStall(user, stall);
  const showDelete = canDeleteStall(user);
  if (!showEdit && !showDelete) return null;

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/stalls/${stall.id}`);
      setConfirming(false);
      onDeleted(`Warung "${stall.name}" berhasil dihapus`);
    } catch (err) {
      setConfirming(false);
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stall-actions">
      <div className="stall-actions-row">
        {showEdit && (
          <Link className="btn btn-sm btn-matcha" to={`/stalls/${stall.id}/edit`}>
            Edit
          </Link>
        )}
        {showDelete && (
          <button className="btn btn-sm btn-danger" onClick={() => setConfirming(true)}>
            Hapus
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}

      {confirming && (
        <ConfirmDialog
          title="Hapus warung ini?"
          message={`Warung "${stall.name}" akan dihapus permanen beserta datanya. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Ya, hapus"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}