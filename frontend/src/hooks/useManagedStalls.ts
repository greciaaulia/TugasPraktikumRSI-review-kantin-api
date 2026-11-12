import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Stall, StallListResponse } from '../types';
import { minDelay } from '../utils';

// Warung yang boleh dikelola: owner hanya warung miliknya, admin semua warung
export function useManagedStalls() {
  const { user } = useAuth();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    minDelay(api.get<StallListResponse>('/stalls', { params: { limit: 100 } }))
      .then((res) => {
        const all = res.data.data;
        setStalls(
          user?.role === 'owner' ? all.filter((s) => s.ownerId === user.id) : all,
        );
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user, reloadKey]);

  return { stalls, loading, error, reload: () => setReloadKey((k) => k + 1) };
}