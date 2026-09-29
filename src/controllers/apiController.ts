import type { Request, Response } from 'express';
import { ApiService } from '../services/apiService.ts';

export class ApiController {
  constructor(private apiService = new ApiService()) {}

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Data tidak ditemukan' });
    }
    if (error instanceof Error && error.message === 'BAD_REQUEST') {
      return res.status(400).json({ status: 'fail', message: 'Data permintaan tidak valid' });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  private parseId(value: string | string[]): number {
    if (typeof value !== 'string') throw new Error('BAD_REQUEST');
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) throw new Error('BAD_REQUEST');
    return id;
  }

  private async respond(res: Response, status: number, action: () => Promise<unknown>): Promise<Response> {
    try {
      return res.status(status).json({ status: 'success', data: await action() });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  getUsers = (_req: Request, res: Response) => this.respond(res, 200, () => this.apiService.getUsers());
  createUser = (req: Request, res: Response) => this.respond(res, 201, () => this.apiService.createUser(req.body));

  getMenuItems = (_req: Request, res: Response) => this.respond(res, 200, () => this.apiService.getMenuItems());
  getMenuItem = (req: Request, res: Response) => this.respond(res, 200, () => this.apiService.getMenuItem(this.parseId(req.params.id)));
  createMenuItem = (req: Request, res: Response) => this.respond(res, 201, () => this.apiService.createMenuItem(req.body));
  updateMenuItem = (req: Request, res: Response) => this.respond(res, 200, () => this.apiService.updateMenuItem(this.parseId(req.params.id), req.body));
  deleteMenuItem = (req: Request, res: Response) => this.respond(res, 200, () => this.apiService.deleteMenuItem(this.parseId(req.params.id)));

  getReviews = (_req: Request, res: Response) => this.respond(res, 200, () => this.apiService.getReviews());
  createReview = (req: Request, res: Response) => this.respond(res, 201, () => this.apiService.createReview(req.body));
  deleteReview = (req: Request, res: Response) => this.respond(res, 200, () => this.apiService.deleteReview(this.parseId(req.params.id)));

  createLike = (req: Request, res: Response) => this.respond(res, 201, () => this.apiService.createLike(req.body));
  deleteLike = (req: Request, res: Response) => this.respond(res, 200, () => this.apiService.deleteLike(
    this.parseId(req.params.reviewId), this.parseId(req.params.userId),
  ));

  getFlags = (_req: Request, res: Response) => this.respond(res, 200, () => this.apiService.getFlags());
  updateFlag = (req: Request, res: Response) => this.respond(res, 200, () => this.apiService.updateFlagStatus(
    this.parseId(req.params.id), req.body.status,
  ));

  getAuditLogs = (_req: Request, res: Response) => this.respond(res, 200, () => this.apiService.getAuditLogs());
  createAuditLog = (req: Request, res: Response) => this.respond(res, 201, () => this.apiService.createAuditLog(req.body));
}