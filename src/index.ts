import express, { type Request, type Response, type Application } from 'express';
import { sql } from 'drizzle-orm';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi.ts';
import { getDb } from './db/index.ts';
import { apiRouter } from './routes/apiRouter.ts';
import { stallRouter } from './routes/stallRouter.ts';
import { authRouter } from './routes/authRouter.ts';
import { authenticate } from './middlewares/auth.ts';
import { authorize } from './middlewares/authorize.ts';
import { notFoundHandler } from './middlewares/notFound.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

const app: Application = express();
const PORT: number = 3000;

app.use(express.json());

// Dokumentasi API, dibuat otomatis dari schema zod.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/health', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1 AS ok`);
    res.status(200).json({ status: 'success', message: 'Server dan database terhubung' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal terhubung ke database',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.use('/api/v1/stalls', stallRouter);
app.use('/api/v1/auth', authRouter);

// Endpoint lama (users, reviews, likes, flags, audit): hanya admin.
app.use('/api/v1', authenticate, authorize('admin'), apiRouter);

// Harus paling akhir.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});