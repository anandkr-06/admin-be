// feedbacks/feedbacks.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Feedback } from '../schema/feedbacks.schema'
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { buildAdminQuery } from 'src/common/utils/admin-query.util';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectModel(Feedback.name)
    private feedbackModel: Model<Feedback>,
  ) {}

  async getFeedbacks(dto: AdminQueryDto & {
    feedbackType?: string;
    ownerType?: string;
    userId?: string;
  }) {
    // ✅ SAFE pagination
    const page = Math.max(Number(dto.page) || 1, 1);
    const limit = Math.max(Number(dto.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // 🔎 Base search + date filters
    const filter: Record<string, any> = buildAdminQuery(dto, [
      'description',
      'feedbackType',
      'ownerType',
    ]);

    // 🎯 Exact filters
    if (dto.feedbackType) {
      filter.feedbackType = dto.feedbackType;
    }

    if (dto.ownerType) {
      filter.ownerType = dto.ownerType;
    }

    if (dto.userId) {
      filter.userId = dto.userId;
    }

    // 🔃 Sorting
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'feedbackType',
      'ownerType',
    ];

    const sortBy = allowedSortFields.includes(dto.sortBy)
      ? dto.sortBy
      : 'createdAt';

    const sortOrder: 1 | -1 = dto.sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: filter },

      {
        $project: {
          feedbackType: 1,
          description: 1,
          fileUrl: 1,
          userId: 1,
          ownerType: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },

      { $sort: { [sortBy]: sortOrder } as Record<string, 1 | -1> },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, totalResult] = await Promise.all([
      this.feedbackModel.aggregate(pipeline),
      this.feedbackModel.aggregate([
        { $match: filter },
        { $count: 'total' },
      ] as PipelineStage[]),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}