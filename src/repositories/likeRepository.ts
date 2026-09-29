import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { likes, reviews } from '../db/schema.ts';

export class LikeRepository {
  async create(reviewId: number, userId: number) {
    const db = await getDb();
    return db.transaction(async (tx) => {
      const rows = await tx.insert(likes).output().values({ reviewId, userId, createdAt: new Date() });
      if (rows[0]) {
        await tx.update(reviews)
          .set({ likeCount: sql`${reviews.likeCount} + 1` })
          .where(eq(reviews.id, reviewId));
      }
      return rows[0];
    });
  }

  async remove(reviewId: number, userId: number) {
    const db = await getDb();
    return db.transaction(async (tx) => {
      const rows = await tx.delete(likes)
        .where(and(eq(likes.reviewId, reviewId), eq(likes.userId, userId)))
        .output();
      if (rows[0]) {
        await tx.update(reviews)
          .set({ likeCount: sql`CASE WHEN ${reviews.likeCount} > 0 THEN ${reviews.likeCount} - 1 ELSE 0 END` })
          .where(eq(reviews.id, reviewId));
      }
      return rows[0];
    });
  }
}