import { randomBytes, scryptSync } from 'node:crypto';
import { AuditRepository, type CreateAuditLogInput } from '../repositories/auditRepository.ts';
import { FlagRepository } from '../repositories/flagRepository.ts';
import { LikeRepository } from '../repositories/likeRepository.ts';
import { MenuItemRepository, type MenuItemInput } from '../repositories/menuItemRepository.ts';
import { ReviewRepository, type CreateReviewInput } from '../repositories/reviewRepository.ts';
import { UserRepository } from '../repositories/userRepository.ts';

export class ApiService {
  constructor(
    private userRepository = new UserRepository(),
    private menuItemRepository = new MenuItemRepository(),
    private reviewRepository = new ReviewRepository(),
    private likeRepository = new LikeRepository(),
    private flagRepository = new FlagRepository(),
    private auditRepository = new AuditRepository(),
  ) {}

  async getUsers() {
    return this.userRepository.findAll();
  }

  async createUser(input: { name: string; email: string; password: string; role: 'admin' | 'owner' | 'customer' }) {
    if (!input || typeof input.name !== 'string' || !input.name.trim() || typeof input.email !== 'string' ||
      !input.email.trim() || typeof input.password !== 'string' || !input.password ||
      !['admin', 'owner', 'customer'].includes(input.role)) {
      throw new Error('BAD_REQUEST');
    }
    const salt = randomBytes(16).toString('hex');
    const passwordHash = `${salt}:${scryptSync(input.password, salt, 64).toString('hex')}`;
    const user = await this.userRepository.create({
      name: input.name.trim(),
      email: input.email.trim(),
      role: input.role,
      passwordHash,
    });
    if (!user) throw new Error('CREATE_FAILED');
    return user;
  }

  async getMenuItems() {
    return this.menuItemRepository.findAllWithStall();
  }

  async getMenuItem(id: number) {
    const item = await this.menuItemRepository.findByIdWithStall(id);
    if (!item) throw new Error('NOT_FOUND');
    return item;
  }

  async createMenuItem(input: MenuItemInput) {
    if (!input || !Number.isInteger(input.stallId) || input.stallId < 1 || typeof input.name !== 'string' ||
      !input.name.trim() || !Number.isInteger(input.price) || input.price < 0 || typeof input.isAvailable !== 'boolean') {
      throw new Error('BAD_REQUEST');
    }
    const item = await this.menuItemRepository.create(input);
    if (!item) throw new Error('CREATE_FAILED');
    return item;
  }

  async updateMenuItem(id: number, input: Partial<MenuItemInput>) {
    if (!input || !Object.keys(input).length ||
      (input.stallId !== undefined && (!Number.isInteger(input.stallId) || input.stallId < 1)) ||
      (input.name !== undefined && (typeof input.name !== 'string' || !input.name.trim())) ||
      (input.price !== undefined && (!Number.isInteger(input.price) || input.price < 0)) ||
      (input.isAvailable !== undefined && typeof input.isAvailable !== 'boolean')) {
      throw new Error('BAD_REQUEST');
    }
    const item = await this.menuItemRepository.update(id, input);
    if (!item) throw new Error('NOT_FOUND');
    return item;
  }

  async deleteMenuItem(id: number) {
    const item = await this.menuItemRepository.remove(id);
    if (!item) throw new Error('NOT_FOUND');
    return item;
  }

  async getReviews() {
    return this.reviewRepository.findAllWithUser();
  }

  async createReview(input: CreateReviewInput) {
    if (!input || !Number.isInteger(input.stallId) || input.stallId < 1 || !Number.isInteger(input.userId) ||
      input.userId < 1 || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5 ||
      (input.comment !== undefined && input.comment !== null && typeof input.comment !== 'string')) {
      throw new Error('BAD_REQUEST');
    }
    const review = await this.reviewRepository.create(input);
    if (!review) throw new Error('CREATE_FAILED');
    return review;
  }

  async deleteReview(id: number) {
    const review = await this.reviewRepository.remove(id);
    if (!review) throw new Error('NOT_FOUND');
    return review;
  }

  async createLike(input: { reviewId: number; userId: number }) {
    if (!input || !Number.isInteger(input.reviewId) || input.reviewId < 1 ||
      !Number.isInteger(input.userId) || input.userId < 1) throw new Error('BAD_REQUEST');
    return this.likeRepository.create(input.reviewId, input.userId);
  }

  async deleteLike(reviewId: number, userId: number) {
    const like = await this.likeRepository.remove(reviewId, userId);
    if (!like) throw new Error('NOT_FOUND');
    return like;
  }

  async getFlags() {
    return this.flagRepository.findAll();
  }

  async updateFlagStatus(id: number, status: string) {
    if (typeof status !== 'string' || !status.trim()) throw new Error('BAD_REQUEST');
    const flag = await this.flagRepository.updateStatus(id, status.trim());
    if (!flag) throw new Error('NOT_FOUND');
    return flag;
  }

  async getAuditLogs() {
    return this.auditRepository.findAll();
  }

  async createAuditLog(input: CreateAuditLogInput) {
    if (!input || !Number.isInteger(input.userId) || input.userId < 1 || typeof input.action !== 'string' ||
      !input.action.trim() || typeof input.targetTable !== 'string' || !input.targetTable.trim() ||
      !Number.isInteger(input.targetId) || input.targetId < 1 ||
      (input.metadata !== undefined && input.metadata !== null && typeof input.metadata !== 'string')) {
      throw new Error('BAD_REQUEST');
    }
    return this.auditRepository.create(input);
  }
}