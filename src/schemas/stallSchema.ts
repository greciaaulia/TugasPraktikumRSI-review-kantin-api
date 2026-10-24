import { z } from "zod";

// id di URL (/stalls/:id)
export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id harus berupa angka" })
    .int("id harus bilangan bulat")
    .positive("id harus lebih dari 0"),
});

// query di GET /stalls
export const stallQuerySchema = z.object({
  search: z.string().trim().max(100, "search maksimal 100 karakter").optional(),
  category: z.string().trim().max(50, "category maksimal 50 karakter").optional(),
  page: z.coerce
    .number({ invalid_type_error: "page harus berupa angka" })
    .int("page harus bilangan bulat")
    .min(1, "page minimal 1")
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: "limit harus berupa angka" })
    .int("limit harus bilangan bulat")
    .min(1, "limit minimal 1")
    .max(100, "limit maksimal 100")
    .default(10),
});

const optionalNullableText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter`).nullable().optional();

// body di POST /stalls
// Catatan: sengaja TIDAK ada ownerId. Pemilik warung nanti diambil dari token,
// bukan dari body, sesuai aturan tugas.
export const createStallSchema = z
  .object({
    name: z
      .string({ required_error: "name wajib diisi" })
      .trim()
      .min(3, "name minimal 3 karakter")
      .max(100, "name maksimal 100 karakter"),
    category: optionalNullableText(50, "category"),
    location: optionalNullableText(100, "location"),
    description: optionalNullableText(1000, "description"),
  })
  .strict({ message: "body hanya boleh berisi name, category, location, dan description" });

// body di PUT /stalls/:id (semua field jadi opsional)
export const updateStallSchema = createStallSchema.partial();

export type IdParam = z.infer<typeof idParamSchema>;
export type StallQuery = z.infer<typeof stallQuerySchema>;
export type CreateStallInput = z.infer<typeof createStallSchema>;
export type UpdateStallInput = z.infer<typeof updateStallSchema>;