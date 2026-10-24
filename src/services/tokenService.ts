import jwt, { type SignOptions } from 'jsonwebtoken';

export type UserRole = 'admin' | 'owner' | 'customer';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET belum diset di .env');
  }
  return secret;
}

function getExpiresIn(): SignOptions['expiresIn'] {
  return (process.env.JWT_EXPIRES_IN ?? '2h') as SignOptions['expiresIn'];
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: String(user.id), name: user.name, email: user.email, role: user.role },
    getJwtSecret(),
    { algorithm: 'HS256', expiresIn: getExpiresIn() },
  );
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });

  if (typeof payload === 'string') {
    throw new jwt.JsonWebTokenError('Payload token bukan objek JSON');
  }

  const id = Number(payload.sub);
  const { name, email, role } = payload as {
    name?: string;
    email?: string;
    role?: UserRole;
  };

  if (!Number.isInteger(id) || !name || !email || !role) {
    throw new jwt.JsonWebTokenError('Payload token tidak lengkap');
  }

  return { id, name, email, role };
}