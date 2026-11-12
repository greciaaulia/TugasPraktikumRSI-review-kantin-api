import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { minDelay } from '../utils';

// Mengambil data GET sederhana. Kalau path = null, tidak ada request yang dikirim.
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (path === null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    minDelay(api.get<{ data: T }>(path))
      .then((res) => setData(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [path, reloadKey]);

  return { data, loading, error, reload: () => setReloadKey((k) => k + 1) };
}