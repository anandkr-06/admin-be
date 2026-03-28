// learners/learners.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder, PipelineStage } from 'mongoose';
import { Course } from '../schema/course.schema';
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { buildAdminQuery } from 'src/common/utils/admin-query.util';


@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<Course>,
  ) {}

//   async getCourses(dto: AdminQueryDto) {
//     const filter = buildAdminQuery(
//       dto,
//       ['courseName', 'category', 'courseType'],
//     );

//     // ✅ providerId fix
//     if (dto.providerId) {
//       filter.providerId = new Types.ObjectId(dto.providerId);
//     }

//     // ✅ sort fix
//     const allowedSortFields = [
//       'createdAt',
//       'updatedAt',
//       'price',
//       'courseName',
//       'status',
//     ];

//     const sortBy = allowedSortFields.includes(dto.sortBy)
//       ? dto.sortBy
//       : 'createdAt';

//     const sort: Record<string, SortOrder> = {
//       [sortBy]: dto.sortOrder === 'asc' ? 1 : -1,
//     };

//     const skip = (dto.page - 1) * dto.limit;

//     const [data, total] = await Promise.all([
//       this.courseModel
//         .find(filter)
//         .sort(sort)
//         .skip(skip)
//         .limit(dto.limit)
//         .lean(),

//       this.courseModel.countDocuments(filter),
//     ]);

//     return {
//       data,
//       meta: {
//         page: dto.page,
//         limit: dto.limit,
//         total,
//         totalPages: Math.ceil(total / dto.limit),
//       },
//     };
//   }
async getCourses(dto: AdminQueryDto) {
    const page = Math.max(Number(dto.page) || 1, 1);
    const limit = Math.max(Number(dto.limit) || 10, 1);
    const skip = (page - 1) * limit;
  
    const filter: Record<string, any> = buildAdminQuery(
      dto,
      ['courseName', 'category', 'courseType'],
    );
  
    if (dto.providerId) {
      filter.providerId = new Types.ObjectId(dto.providerId);
    } else {
      delete filter.providerId;
    }
  
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'price',
      'courseName',
      'status',
    ];
  
    const sortBy = allowedSortFields.includes(dto.sortBy)
      ? dto.sortBy
      : 'createdAt';
  
    const sortOrder: 1 | -1 = dto.sortOrder === 'asc' ? 1 : -1;
  
    const pipeline: PipelineStage[] = [
      { $match: filter },
  
      {
        $lookup: {
          from: 'courseproviders', // ✔ verified earlier
          localField: 'providerId',
          foreignField: '_id',
          as: 'provider',
        },
      },
  
      {
        $unwind: {
          path: '$provider',
          preserveNullAndEmptyArrays: true,
        },
      },
  
      {
        $project: {
          courseName: 1,
          category: 1,
          price: 1,
          schedules: 1,
          location: 1,
          seats: 1,
          courseType: 1,
          status: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          url:1,
          provider: {
            _id: '$provider._id',
            instituteName: '$provider.instituteName',
          },
        },
      },
  
      { $sort: { [sortBy]: sortOrder } as Record<string, 1 | -1> },
      { $skip: skip },
      { $limit: limit },
    ];
  
    const [data, totalResult] = await Promise.all([
      this.courseModel.aggregate(pipeline),
      this.courseModel.aggregate([
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