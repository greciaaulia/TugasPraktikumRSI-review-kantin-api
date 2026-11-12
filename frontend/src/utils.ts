// Emoji sesuai kategori warung (kategori lain pakai piring default)
const CATEGORY_EMOJI: Record<string, string> = {
  nasi: '🍚',
  bakso: '🍜',
  mie: '🍝',
  kwetiau: '🥢',
  minuman: '🧋',
  western: '🍔',
  sate: '🍢',
  soto: '🍲',
};

export function categoryEmoji(category: string | null): string {
  if (!category) return '🍽️';
  return CATEGORY_EMOJI[category.trim().toLowerCase()] ?? '🍽️';
}

export function formatRupiah(angka: number): string {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

// Ubah teks jadi nama file: "Kwetiau Goreng Spesial" -> "kwetiau-goreng-spesial"
export function slugify(teks: string): string {
  return teks
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Foto kategori: public/images/kategori/nasi.jpg, bakso.jpg, dst
export function categoryImage(category: string | null): string {
  return `/images/kategori/${slugify(category ?? 'lainnya')}.jpg`;
}

// Foto menu: public/images/menu/kwetiau-goreng-spesial.jpg, dst
export function menuImage(name: string): string {
  return `/images/menu/${slugify(name)}.jpg`;
}

// Menahan hasil minimal beberapa milidetik supaya loading state tidak berkedip
// dan tetap terlihat walau backend-nya sangat cepat (misalnya di localhost).
export async function minDelay<T>(promise: Promise<T>, ms = 400): Promise<T> {
  const [result] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
  return result;
}
export function formatTanggal(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}