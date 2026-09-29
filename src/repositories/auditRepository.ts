import { getDb } from '../db/index.ts';
import { auditLogs } from '../db/schema.ts';

export interface CreateAuditLogInput {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata?: string | null;
}

export class AuditRepository {
  async findAll() {
    const db = await getDb();
    return db.select().from(auditLogs).orderBy(auditLogs.id);
  }

  async create(input: CreateAuditLogInput) {
    const db = await getDb();
    const rows = await db.insert(auditLogs).output().values({
      userId: input.userId,
      action: input.action,
      targetTable: input.targetTable,
      targetId: input.targetId,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
    });
    return rows[0];
  }
}