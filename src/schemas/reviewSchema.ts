import { z } from 'zod';

// Sengaja tidak ada userId: penulis review selalu diambil dari token.
export const createReviewSchema = z
  .object({
    rating: z
      .number({
        required_error: 'rating wajib diisi',
        invalid_type_error: 'rating harus berupa angka',
      })
      .int('rating harus bilangan bulat')
      .min(1, 'rating minimal 1')
      .max(5, 'rating maksimal 5'),
    comment: z
      .string()
      .trim()
      .max(1000, 'comment maksimal 1000 karakter')
      .nullable()
      .optional(),
  })
  .strict({ message: 'body hanya boleh berisi rating dan comment' });

export type CreateReviewBody = z.infer<typeof createReviewSchema>;