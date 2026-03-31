// courseproviders/courseproviders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { CourseProvider } from '../schema/courseproviders.schema';
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { buildAdminQuery } from 'src/common/utils/admin-query.util';

@Injectable()
export class CourseProvidersService {
  constructor(
    @InjectModel(CourseProvider.name)
    private providerModel: Model<CourseProvider>,
  ) {}

  async getProviders(dto: AdminQueryDto) {
    // ✅ SAFE pagination
    const page = Math.max(Number(dto.page) || 1, 1);
    const limit = Math.max(Number(dto.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // 🔎 Filters
    const filter = buildAdminQuery(dto, [
      'instituteName',
      'email',
      'phone',
      'location.suburb',
      'location.state',
    ]);

    // 🔃 Sorting
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'instituteName',
      'isActive',
    ];

    const sortBy = allowedSortFields.includes(dto.sortBy)
      ? dto.sortBy
      : 'createdAt';

    const sortOrder: 1 | -1 = dto.sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: filter },

      {
        $project: {
          instituteName: 1,
          email: 1,
          phone: 1,
          logoUrl: 1,
          websiteUrl: 1,
          isActive: 1,
          isAgreedToTermsAndConditions: 1,
          isAgreedToCommunicationAndOffers: 1,
          location: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },

      { $sort: { [sortBy]: sortOrder } as Record<string, 1 | -1> },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, totalResult] = await Promise.all([
      this.providerModel.aggregate(pipeline),
      this.providerModel.aggregate([
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

  // ✅ ADD THIS METHOD
async updateStatus(providerId: string, isActive: boolean) {
  const updated = await this.providerModel.findByIdAndUpdate(
    providerId,
    { $set: { isActive } },
    { new: true },
  );

  if (!updated) {
    throw new NotFoundException('Course provider not found');
  }

  return {
    message: `Course provider ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { isActive },
  };
}

async getProfile(id: string) {
  const provider = await this.providerModel
    .findById(id)
    .lean();

  if (!provider) {
    throw new NotFoundException('Course provider not found');
  }

  return provider;
}



}