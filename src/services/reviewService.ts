import { ReviewRepository } from '../repositories/reviewRepository.ts';
import { StallRepository } from '../repositories/stallRepository.ts';
import { AppError } from '../errors/AppError.ts';
import { NotFoundError } from '../errors/NotFoundError.ts';
import type { CreateReviewBody } from '../schemas/reviewSchema.ts';

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private stallRepository: StallRepository;

  constructor(
    reviewRepository: ReviewRepository = new ReviewRepository(),
    stallRepository: StallRepository = new StallRepository(),
  ) {
    this.reviewRepository = reviewRepository;
    this.stallRepository = stallRepository;
  }

  // userId dikirim terpisah (dari token), bukan dari body.
  async createReview(stallId: number, userId: number, input: CreateReviewBody) {
    const stall = await this.stallRepository.findById(stallId);
    if (!stall) throw new NotFoundError('Warung tidak ditemukan');

    const review = await this.reviewRepository.create({
      stallId,
      userId,
      rating: input.rating,
      comment: input.comment ?? null,
    });
    if (!review) throw new AppError(500, 'Review gagal disimpan');

    return review;
  }
}