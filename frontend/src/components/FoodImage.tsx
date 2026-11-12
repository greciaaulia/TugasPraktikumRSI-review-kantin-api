import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  fallback: string; // emoji yang dipakai kalau fotonya belum ada
}

// Menampilkan foto. Kalau file fotonya belum ada, otomatis tampil emoji (tidak error).
export default function FoodImage({ src, alt, fallback }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="img-fallback" role="img" aria-label={alt}>
        {fallback}
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}