import type { Stall, User } from './types';

// Aturan tampilan (backend tetap yang memutuskan lewat 401/403)
export function canCreateStall(user: User | null): boolean {
  return user?.role === 'owner' || user?.role === 'admin';
}

export function canEditStall(user: User | null, stall: Stall): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.role === 'owner' && stall.ownerId === user.id;
}

export function canDeleteStall(user: User | null): boolean {
  return user?.role === 'admin';
}