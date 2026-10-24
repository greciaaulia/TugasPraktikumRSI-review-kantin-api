import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository.ts';
import { signToken, type AuthUser } from './tokenService.ts';
import { AppError } from '../errors/AppError.ts';
import { UnauthorizedError } from '../errors/UnauthorizedError.ts';
import type { LoginInput, RegisterInput } from '../schemas/authSchema.ts';

function getSaltRounds(): number {
  return Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
}

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async register(input: RegisterInput): Promise<AuthUser> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new AppError(409, 'Email sudah terdaftar');

    // Password di-hash dulu, yang masuk database cuma hasil hash-nya.
    const passwordHash = await bcrypt.hash(input.password, getSaltRounds());

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'customer', // role ditentukan server, bukan dari body
    });
    if (!user) throw new AppError(500, 'User gagal dibuat');

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(input: LoginInput) {
    const row = await this.userRepository.findByEmail(input.email);

    // Pesan sengaja sama biar orang tidak bisa menebak email mana yang terdaftar.
    if (!row) throw new UnauthorizedError('Email atau password salah');

    const valid = await bcrypt.compare(input.password, row.passwordHash);
    if (!valid) throw new UnauthorizedError('Email atau password salah');

    const user: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
    };

    return {
      token: signToken(user),
      tokenType: 'Bearer' as const,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
      user,
    };
  }
}