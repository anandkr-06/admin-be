// giftvouchers/giftvouchers.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { GiftVoucher } from '../schema/giftvouchers.schema'
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { buildAdminQuery } from 'src/common/utils/admin-query.util';
import { GiftVoucherQueryDto } from '../dto/giftvoucher-query.dto';

@Injectable()
export class GiftVouchersService {
  constructor(
    @InjectModel(GiftVoucher.name)
    private giftVoucherModel: Model<GiftVoucher>,
  ) {}

  // async getGiftVouchers(
  //   dto: AdminQueryDto & {
  //     status?: string;
  //     minAmount?: string;
  //     maxAmount?: string;
  //     expiresFrom?: string;
  //     expiresTo?: string;
  //   },
  // ) {
  //   // ✅ SAFE pagination
  //   const page = Math.max(Number(dto.page) || 1, 1);
  //   const limit = Math.max(Number(dto.limit) || 10, 1);
  //   const skip = (page - 1) * limit;

  //   // 🔎 Base search (recipient + sender)
  //   const filter: Record<string, any> = buildAdminQuery(dto, [
  //     'recipient.firstName',
  //     'recipient.lastName',
  //     'recipient.email',
  //     'sender.firstName',
  //     'sender.lastName',
  //     'sender.email',
  //   ]);

  //   // 🎯 Status filter
  //   if (dto.status) {
  //     filter.status = dto.status;
  //   }

  //   // 💰 Amount range
  //   if (dto.minAmount || dto.maxAmount) {
  //     filter.amount = {};
  //     if (dto.minAmount) filter.amount.$gte = Number(dto.minAmount);
  //     if (dto.maxAmount) filter.amount.$lte = Number(dto.maxAmount);
  //   }

  //   // ⏳ Expiry date range
  //   if (dto.expiresFrom || dto.expiresTo) {
  //     filter.expiresAt = {};
  //     if (dto.expiresFrom) {
  //       filter.expiresAt.$gte = new Date(dto.expiresFrom);
  //     }
  //     if (dto.expiresTo) {
  //       filter.expiresAt.$lte = new Date(dto.expiresTo);
  //     }
  //   }

  //   // 🔃 Sorting
  //   const allowedSortFields = [
  //     'createdAt',
  //     'updatedAt',
  //     'expiresAt',
  //     'amount',
  //     'balance',
  //     'status',
  //   ];

  //   const sortBy = allowedSortFields.includes(dto.sortBy)
  //     ? dto.sortBy
  //     : 'createdAt';

  //   const sortOrder: 1 | -1 = dto.sortOrder === 'asc' ? 1 : -1;

  //   const pipeline: PipelineStage[] = [
  //     { $match: filter },

  //     {
  //       $project: {
  //         amount: 1,
  //         balance: 1,
  //         status: 1,
  //         message: 1,
  //         recipient: 1,
  //         sender: 1,
  //         expiresAt: 1,
  //         createdAt: 1,
  //         updatedAt: 1,
  //       },
  //     },

  //     { $sort: { [sortBy]: sortOrder } as Record<string, 1 | -1> },
  //     { $skip: skip },
  //     { $limit: limit },
  //   ];
  //   console.log('DTO:', dto);
  //   console.log('FILTER:', filter);
  //   const [data, totalResult] = await Promise.all([
  //     this.giftVoucherModel.aggregate(pipeline),
  //     this.giftVoucherModel.aggregate([
  //       { $match: filter },
  //       { $count: 'total' },
  //     ] as PipelineStage[]),
  //   ]);

  //   const total = totalResult[0]?.total ?? 0;

  //   return {
  //     data,
  //     meta: {
  //       page,
  //       limit,
  //       total,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //   };
  // }

  async getGiftVouchers(query: GiftVoucherQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      startDate,
      endDate,
      expiresFrom,
      expiresTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
  
    const filter: any = {};
  
    /* 🔍 Search */
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { 'recipient.firstName': regex },
        { 'recipient.lastName': regex },
        { 'recipient.email': regex },
        { 'sender.firstName': regex },
        { 'sender.lastName': regex },
        { 'sender.email': regex },
      ];
    }
  
    /* 📌 Status */
    if (status) {
      filter.status = status;
    }
  
    /* 📅 Created date range */
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
  
    /* ⏳ Expiry date range */
    if (expiresFrom || expiresTo) {
      filter.expiresAt = {};
      if (expiresFrom) {
        filter.expiresAt.$gte = new Date(expiresFrom);
      }
      if (expiresTo) {
        const end = new Date(expiresTo);
        end.setHours(23, 59, 59, 999);
        filter.expiresAt.$lte = end;
      }
    }
  
    const skip = (Number(page) - 1) * Number(limit);
  
    const sort: any = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };
  
    const [data, total] = await Promise.all([
      this.giftVoucherModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
  
      this.giftVoucherModel.countDocuments(filter),
    ]);
  
    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}