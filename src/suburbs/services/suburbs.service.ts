import { BadRequestException, Injectable } from '@nestjs/common';
import { SearchPaginationDto } from '../dto/pagination.dto'; // Adjust the path as needed
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuburbDocument } from '../schemas/suburb.schema';
//import { Public } from '@common/decorators/public.decorator';
import { geoToUIRegions } from '../../common/utils/suburb';
import { UpdateSuburbDto } from '../dto/update-suburb.dto';
import { CreateSuburbDto } from '../dto/create-suburb.dto';

@Injectable()
export class SuburbService {
  constructor(
    @InjectModel('Suburb')
    private readonly suburbModel: Model<SuburbDocument>,
  ) {}

  private normalizeBoolean(value: unknown, fieldName: string) {
    if (typeof value === 'boolean') return value;

    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }

    throw new BadRequestException(`${fieldName} must be true or false`);
  }

  async getAllSuburbsCoordinates(suburb: string) {
    const suburbNames = suburb.split(',').map((n) => n.trim().toUpperCase());

    const suburbs = await this.suburbModel.find(
      {
        // state: state.toUpperCase(),
        name: { $in: suburbNames },
      },
      { geometry: 1, _id: 0 },
    );

    const response: any[] = [];

    for (const suburb of suburbs) {
      response.push(...geoToUIRegions(suburb.geometry));
    }

    return response;
  }
  async getAllSuburbs(
    { search = '', page = 1, limit = 10 }: SearchPaginationDto = {
      search: '',
      page: 1,
      limit: 10,
    },
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    // if (search && search.length >= 3) {
    //   const regex = new RegExp(`^${search}`, 'i');
    //   filter.$or = [
    //     { locality: regex },
    //     { postcode: regex },
    //   ];
    // }

    if (search && search.length >= 3) {
      const regex = new RegExp(`^${search}`, 'i');

      filter.$or = [
        { locality: regex },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$postcode' },
              regex,
            },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.suburbModel
        .find(filter)
        .select({
          _id: 1, // ✅ remove _id
          locality: 1,
          postcode: 1,
          state: 1,
          long: 1,
          lat: 1,
        })
        .skip(skip)
        .limit(limit)
        .sort({ locality: 1 })
        .lean(),

      this.suburbModel.countDocuments(filter),
    ]);

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

  async getAvailableSuburbs(
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
      const regex = new RegExp(`^${search}`, 'i');

      filter.$and.push({
        $or: [
          { locality: regex },
          { name: regex },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: '$postcode' },
                regex,
              },
            },
          },
        ],
      });
    }

    const [data, total] = await Promise.all([
      this.suburbModel
        .find(filter)
        .select({
          _id: 1,
          locality: 1,
          postcode: 1,
          state: 1,
          long: 1,
          lat: 1,
        })
        .skip(skip)
        .limit(safeLimit)
        .sort({ locality: 1 })
        .lean(),

      this.suburbModel.countDocuments(filter),
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

  async getSuburbById(id: string) {
    return this.suburbModel.findById(id).lean();
  }

  async createSuburb(payload: CreateSuburbDto) {
    const data: any = {
      locality: payload.name.toUpperCase(),
      name: payload.name.toUpperCase(),
      state: payload.state,
      postcode: payload.postcode,
      long: payload.long,
      lat: payload.lat,
      text: `${payload.name}, ${payload.state}`,
      isActive: true,
    };

    if (
      payload.geometry?.coordinates &&
      payload.geometry.coordinates.length > 0
    ) {
      data.geometry = payload.geometry;
    }

    return this.suburbModel.create(data);
  }

  async updateSuburb(id: string, payload: UpdateSuburbDto) {
    const update: any = { ...payload };

    if (payload.isActive !== undefined) {
      update.isActive = this.normalizeBoolean(payload.isActive, 'isActive');
    }

    return this.suburbModel.findByIdAndUpdate(
      id,
      {
        ...update,
        ...(payload.name && {
          name: payload.name.toUpperCase(),
          locality: payload.name.toUpperCase(),
          long: payload.long,
          lat: payload.lat,
        }),
        ...(payload.name &&
          payload.state && {
            text: `${payload.name.toUpperCase()}, ${payload.state}`,
          }),
      },
      {
        new: true,
      },
    );
  }

  async deleteSuburb(id: string) {
    await this.suburbModel.findByIdAndDelete(id);

    return {
      success: true,
      message: 'Suburb deleted successfully',
    };
  }

  //GET /suburbs/v1/nearby?lat=-12.37&lng=130.86
  /**
   * Mongodb optiomization
   */

  /*
using MongoDB $geoNear.

Add a uniqueness constraint on:
{
  locality: 1,
  postcode: 1,
  state: 1
}

to avoid duplicate suburb records.

SuburbSchema.index(
  {
    locality: 1,
    postcode: 1,
    state: 1,
  },
  {
    unique: true,
  },
);
*/
}
