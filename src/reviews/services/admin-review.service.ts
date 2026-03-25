import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryReviewDto } from '../dto/query-review.dto';
import { UpdateReviewStatusDto } from '../dto/update-review-status.dto';

@Injectable()
export class AdminReviewService {
  constructor(
    @InjectModel('InstructorReview')
    private readonly reviewModel: Model<any>,
  ) {}

  // ✅ GET REVIEWS WITH PAGINATION
  async getReviews(query: QueryReviewDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.reviewModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ✅ UPDATE STATUS (APPROVE / REJECT)
  async updateStatus(reviewId: string, dto: UpdateReviewStatusDto) {
    const review = await this.reviewModel.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = dto.status;
    await review.save();

    return {
      message: `Review ${dto.status} successfully`,
      review,
    };
  }
}