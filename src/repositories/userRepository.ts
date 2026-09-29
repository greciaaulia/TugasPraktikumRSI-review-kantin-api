import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'owner' | 'customer';
}

export class UserRepository {
  async findAll() {
    const db = await getDb();
    return db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users);
  }

  async create(input: CreateUserInput) {
    const db = await getDb();
    const rows = await db.insert(users).output().values(input);
    const user = rows[0];
    if (!user) return undefined;
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}