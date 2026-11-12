export interface Stall {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number;
  reviewCount: number;
  isPopular: boolean;
}

export interface StallListResponse {
  status: string;
  meta: { page: number; limit: number; total: number };
  data: Stall[];
}

export interface MenuItem {
  id: number;
  stallId: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export type Role = 'admin' | 'owner' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string | null;
}

export interface FlagRow {
  id: number;
  reviewId: number;
  reportedBy: number;
  reason: string | null;
  status: string;
  createdAt: string | null;
  review: { rating: number; comment: string | null };
  reporter: { id: number; name: string };
}

export interface AuditRow {
  id: number;
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: string | null;
  createdAt: string | null;
}