import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchPaginationDto } from 'src/suburbs/dto/pagination.dto';
import {
  TestLocation,
  TestLocationDocument,
} from '../schemas/testlocation.schema';

@Injectable()
export class TestLocationsService {
  constructor(
    @InjectModel(TestLocation.name)
    private readonly testLocationModel: Model<TestLocationDocument>,
  ) {}

  async getTestLocations(
    { search = '', page = 1, limit = 10 }: SearchPaginationDto = {
      search: '',
      page: 1,
      limit: 10,
    },
  ) {
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    const skip = (safePage - 1) * safeLimit;
    const filter: any = {
      $and: [
        {
          $or: [{ isActive: true }, { isActive: { $exists: false } }],
        },
      ],
    };

    if (search && search.length >= 3) {
      const regex = new RegExp(search, 'i');

      filter.$and.push({
        $or: [
          { state: regex },
          { location: regex },
          { address: regex },
          { suburb: regex },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$postCode' },
                regex,
              },
            },
          },
        ],
      });
    }

    const [data, total] = await Promise.all([
      this.testLocationModel
        .find(filter)
        .select({
          _id: 1,
          state: 1,
          location: 1,
          address: 1,
          suburb: 1,
          postCode: 1,
        })
        .skip(skip)
        .limit(safeLimit)
        .sort({ state: 1, location: 1 })
        .lean(),

      this.testLocationModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}
