import type { Request, Response } from 'express';
import { StallService } from '../services/stallService.ts';
import { getValidated } from '../middlewares/validate.ts';
import type {
  CreateStallInput,
  IdParam,
  StallQuery,
  UpdateStallInput,
} from '../schemas/stallSchema.ts';

export class StallController {
  private stallService: StallService;

  constructor(stallService: StallService = new StallService()) {
    this.stallService = stallService;
  }

  getStalls = async (_req: Request, res: Response): Promise<void> => {
    const query = getValidated<StallQuery>(res, 'query');
    const { data, total } = await this.stallService.getAllStalls({
      search: query.search,
      category: query.category,
      page: query.page,
      limit: query.limit,
    });
    res.status(200).json({
      status: 'success',
      meta: { page: query.page, limit: query.limit, total },
      data,
    });
  };

  getStallById = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<IdParam>(res, 'params');
    const stall = await this.stallService.getStallById(id);
    res.status(200).json({ status: 'success', data: stall });
  };

  getStallMenus = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<IdParam>(res, 'params');
    const menus = await this.stallService.getStallMenus(id);
    res.status(200).json({ status: 'success', data: menus });
  };

  createStall = async (_req: Request, res: Response): Promise<void> => {
    const body = getValidated<CreateStallInput>(res, 'body');

    // SEMENTARA: pemilik warung di-hardcode dulu karena login belum ada.
    // Nanti diganti dengan id user dari token.
    const ownerId = 2;

    const stall = await this.stallService.createStall(body, ownerId);
    res.status(201).json({ status: 'success', data: stall });
  };

  updateStall = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<IdParam>(res, 'params');
    const body = getValidated<UpdateStallInput>(res, 'body');
    const stall = await this.stallService.updateStall(id, body);
    res.status(200).json({ status: 'success', data: stall });
  };

  deleteStall = async (_req: Request, res: Response): Promise<void> => {
    const { id } = getValidated<IdParam>(res, 'params');
    const stall = await this.stallService.deleteStall(id);
    res.status(200).json({ status: 'success', data: stall });
  };
}