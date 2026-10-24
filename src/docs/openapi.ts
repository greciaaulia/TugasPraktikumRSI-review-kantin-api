import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  createStallSchema,
  idParamSchema,
  stallQuerySchema,
  updateStallSchema,
} from '../schemas/stallSchema.ts';
import { loginSchema, registerSchema } from '../schemas/authSchema.ts';
import { createReviewSchema } from '../schemas/reviewSchema.ts';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// Tombol "Authorize" di Swagger UI: tempel token hasil login di sini.
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Token JWT dari POST /api/v1/auth/login (tanpa tulisan "Bearer")',
});
const secured = [{ bearerAuth: [] }];

// ---------- schema respons ----------
const errorSchema = registry.register(
  'ErrorResponse',
  z.object({
    status: z.string().openapi({ example: 'fail' }),
    message: z.string().openapi({ example: 'Validasi gagal' }),
    errors: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .optional()
      .openapi({ example: [{ field: 'name', message: 'name minimal 3 karakter' }] }),
  }),
);

const stallSchema = registry.register(
  'Stall',
  z.object({
    id: z.number().openapi({ example: 1 }),
    ownerId: z.number().openapi({ example: 2 }),
    name: z.string().openapi({ example: 'Warung Bu Tini' }),
    category: z.string().nullable().openapi({ example: 'Kwetiau' }),
    location: z.string().nullable().openapi({ example: 'Kantin FKIP' }),
    description: z.string().nullable().openapi({ example: 'Kedai kwetiau' }),
    avgRating: z.number().openapi({ example: 4.5 }),
    reviewCount: z.number().openapi({ example: 2 }),
    isPopular: z.boolean().openapi({ example: false }),
  }),
);

const reviewSchema = registry.register(
  'Review',
  z.object({
    id: z.number().openapi({ example: 1 }),
    stallId: z.number().openapi({ example: 1 }),
    userId: z.number().openapi({ example: 17 }),
    rating: z.number().openapi({ example: 5 }),
    comment: z.string().nullable().openapi({ example: 'Enak banget' }),
    likeCount: z.number().openapi({ example: 0 }),
  }),
);

const authUserSchema = registry.register(
  'AuthUser',
  z.object({
    id: z.number().openapi({ example: 17 }),
    name: z.string().openapi({ example: 'Grecia Test' }),
    email: z.string().openapi({ example: 'grecia@test.com' }),
    role: z.enum(['admin', 'owner', 'customer']).openapi({ example: 'customer' }),
  }),
);

const stallListResponse = registry.register(
  'StallListResponse',
  z.object({
    status: z.literal('success'),
    meta: z.object({ page: z.number(), limit: z.number(), total: z.number() }),
    data: z.array(stallSchema),
  }),
);
const stallDetailResponse = registry.register(
  'StallDetailResponse',
  z.object({ status: z.literal('success'), data: stallSchema }),
);
const reviewResponse = registry.register(
  'ReviewResponse',
  z.object({ status: z.literal('success'), data: reviewSchema }),
);
const registerResponse = registry.register(
  'RegisterResponse',
  z.object({
    status: z.literal('success'),
    data: z.object({ user: authUserSchema }),
  }),
);
const loginResponse = registry.register(
  'LoginResponse',
  z.object({
    status: z.literal('success'),
    data: z.object({
      token: z.string().openapi({ example: 'eyJhbGciOi...' }),
      tokenType: z.string().openapi({ example: 'Bearer' }),
      expiresIn: z.string().openapi({ example: '2h' }),
      user: authUserSchema,
    }),
  }),
);
const meResponse = registry.register(
  'MeResponse',
  z.object({ status: z.literal('success'), data: authUserSchema }),
);

// ---------- helper biar tidak berulang ----------
const json = (schema: z.ZodTypeAny) => ({ 'application/json': { schema } });
const ok = (description: string, schema: z.ZodTypeAny) => ({
  description,
  content: json(schema),
});
const fail = (description: string) => ({ description, content: json(errorSchema) });

const r400 = { 400: fail('Input tidak valid') };
const r401 = { 401: fail('Belum login / token tidak valid') };
const r403 = { 403: fail('Sudah login tapi tidak punya akses') };
const r404 = { 404: fail('Data tidak ditemukan') };

// ---------- endpoint publik ----------
registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls',
  summary: 'Daftar warung (publik)',
  request: { query: stallQuerySchema },
  responses: { 200: ok('Daftar warung', stallListResponse), ...r400 },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls/{id}',
  summary: 'Detail warung (publik)',
  request: { params: idParamSchema },
  responses: { 200: ok('Detail warung', stallDetailResponse), ...r400, ...r404 },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  summary: 'Daftar akun baru (role selalu customer)',
  request: { body: { content: json(registerSchema) } },
  responses: {
    201: ok('Akun dibuat', registerResponse),
    ...r400,
    409: fail('Email sudah terdaftar'),
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: 'Login dan terima token JWT',
  request: { body: { content: json(loginSchema) } },
  responses: { 200: ok('Login berhasil', loginResponse), ...r400, ...r401 },
});

// ---------- endpoint terlindungi ----------
registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  summary: 'Data user dari token (semua role)',
  security: secured,
  responses: { 200: ok('Data user', meResponse), ...r401 },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/stalls',
  summary: 'Tambah warung (owner, admin)',
  security: secured,
  request: { body: { content: json(createStallSchema) } },
  responses: { 201: ok('Warung dibuat', stallDetailResponse), ...r400, ...r401, ...r403 },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/stalls/{id}',
  summary: 'Ubah warung (owner hanya miliknya, admin semua)',
  security: secured,
  request: { params: idParamSchema, body: { content: json(updateStallSchema) } },
  responses: {
    200: ok('Warung diubah', stallDetailResponse),
    ...r400,
    ...r401,
    ...r403,
    ...r404,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/stalls/{id}',
  summary: 'Hapus warung (admin)',
  security: secured,
  request: { params: idParamSchema },
  responses: {
    200: ok('Warung dihapus', stallDetailResponse),
    ...r400,
    ...r401,
    ...r403,
    ...r404,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/stalls/{id}/reviews',
  summary: 'Tambah review (semua role yang login)',
  security: secured,
  request: { params: idParamSchema, body: { content: json(createReviewSchema) } },
  responses: {
    201: ok('Review dibuat', reviewResponse),
    ...r400,
    ...r401,
    ...r404,
    409: fail('Data bentrok (misalnya sudah pernah review)'),
  },
});

// ---------- hasil akhir ----------
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Review Kantin API',
    version: '1.0.0',
    description: 'Dokumentasi API Review Kantin (validasi zod, auth JWT, role admin/owner/customer).',
  },
  servers: [{ url: 'http://localhost:3000' }],
});