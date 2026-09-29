import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { flags, likes, reviews, users } from '../db/schema.ts';

export interface CreateReviewInput {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string | null;
}

export class ReviewRepository {
  async findAllWithUser() {
    const db = await getDb();
    return db.select({
      id: reviews.id,
      stallId: reviews.stallId,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      likeCount: reviews.likeCount,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      user: { id: users.id, name: users.name },
    }).from(reviews).innerJoin(users, eq(reviews.userId, users.id));
  }

  async create(input: CreateReviewInput) {
    const db = await getDb();
    const now = new Date();
    const rows = await db.insert(reviews).output().values({
      stallId: input.stallId,
      userId: input.userId,
      rating: input.rating,
      comment: input.comment ?? null,
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return rows[0];
  }

  async remove(id: number) {
    const db = await getDb();
    return db.transaction(async (tx) => {
      await tx.delete(likes).where(eq(likes.reviewId, id));
      await tx.delete(flags).where(eq(flags.reviewId, id));
      const rows = await tx.delete(reviews).where(eq(reviews.id, id)).output();
      return rows[0];
    });
  }
}