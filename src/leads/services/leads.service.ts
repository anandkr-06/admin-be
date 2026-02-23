// leads/leads.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Lead } from '../schema/leads.schema';
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { buildAdminQuery } from 'src/common/utils/admin-query.util';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name)
    private leadModel: Model<Lead>,
  ) {}

  async getLeads(dto: AdminQueryDto & {
    courseId?: string;
    userType?: string;
    source?: string;
  }) {
    // ✅ SAFE pagination
    const page = Math.max(Number(dto.page) || 1, 1);
    const limit = Math.max(Number(dto.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // 🔎 Base filters
    const filter: Record<string, any> = buildAdminQuery(dto, [
      'firstName',
      'lastName',
      'email',
      'phone',
    ]);

    // 🎯 Exact filters
    if (dto.courseId) {
      filter.courseId = new Types.ObjectId(dto.courseId);
    }

    if (dto.userType) {
      filter.userType = dto.userType;
    }

    if (dto.source) {
      filter.source = dto.source;
    }

    // 🔃 Sorting
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'firstName',
      'userType',
    ];

    const sortBy = allowedSortFields.includes(dto.sortBy)
      ? dto.sortBy
      : 'createdAt';

    const sortOrder: 1 | -1 = dto.sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: filter },

      // 🔗 Join course
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course',
        },
      },

      {
        $unwind: {
          path: '$course',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          userType: 1,
          source: 1,
          isAgreedToTermsAndConditions: 1,
          isAgreedToCommunicationAndOffers: 1,
          createdAt: 1,
          updatedAt: 1,
          course: {
            _id: '$course._id',
            courseName: '$course.courseName',
            category: '$course.category',
          },
        },
      },

      { $sort: { [sortBy]: sortOrder } as Record<string, 1 | -1> },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, totalResult] = await Promise.all([
      this.leadModel.aggregate(pipeline),
      this.leadModel.aggregate([
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