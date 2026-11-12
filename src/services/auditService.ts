import { AuditRepository } from '../repositories/auditRepository.ts';

const auditRepository = new AuditRepository();

// Mencatat aktivitas ke tabel AUDIT_LOGS.
// Kalau pencatatan gagal, cukup tulis ke console supaya operasi utamanya
// (daftar, tambah, ubah, hapus warung) tidak ikut gagal.
export async function logActivity(
  userId: number,
  action: string,
  targetTable: string,
  targetId: number,
  metadata?: string,
): Promise<void> {
  try {
    await auditRepository.create({
      userId,
      action,
      targetTable,
      targetId,
      metadata: metadata ?? null,
    });
  } catch (error) {
    console.error('Gagal mencatat audit log:', error);
  }
}