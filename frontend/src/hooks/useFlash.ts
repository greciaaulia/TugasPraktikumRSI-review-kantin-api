import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Menampilkan pesan sukses yang dikirim dari halaman sebelumnya (lewat navigate state)
export function useFlash() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const flash = (location.state as { flash?: string } | null)?.flash;
    if (flash) {
      setMessage(flash);
      // hapus state supaya pesan tidak muncul lagi saat halaman di-refresh
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate]);

  return { message, setMessage };
}