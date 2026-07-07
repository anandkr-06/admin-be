import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SearchPaginationDto } from 'src/suburbs/dto/pagination.dto';
import {
  CreateTestLocationDto,
  UpdateTestLocationDto,
} from '../dto/testlocation.dto';
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

  async createTestLocation(dto: CreateTestLocationDto) {
    const created = await this.testLocationModel.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });

    return {
      message: 'Test location created successfully',
      data: {
        _id: created._id,
        state: created.state,
        location: created.location,
        address: created.address,
        suburb: created.suburb,
        postCode: created.postCode,
        isActive: created.isActive,
      },
    };
  }

  async updateTestLocation(id: string, dto: UpdateTestLocationDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid test location id');
    }

    const update: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        update[key] = value;
      }
    }

    if (!Object.keys(update).length) {
      throw new BadRequestException(
        'At least one test location field is required',
      );
    }

    const updated = await this.testLocationModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: update },
        { new: true },
      )
      .select({
        _id: 1,
        state: 1,
        location: 1,
        address: 1,
        suburb: 1,
        postCode: 1,
        isActive: 1,
      })
      .lean();

    if (!updated) {
      throw new NotFoundException('Test location not found');
    }

    return {
      message: 'Test location updated successfully',
      data: updated,
    };
  }
}
