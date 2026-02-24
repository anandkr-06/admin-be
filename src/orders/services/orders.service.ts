// giftvouchers/giftvouchers.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { OrderQueryDto } from '../dto/order-query.dto';
import { Order } from '../schema/orders.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
  ) {}

async getOrders(query: OrderQueryDto) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;

  const match: any = {};
  if (query.status) match.status = query.status;
  if (query.paymentStatus) match.paymentStatus = query.paymentStatus;

  const pipeline: any[] = [
    { $match: match },

    /* ================= LEARNER ================= */
    {
      $lookup: {
        from: 'learners',
        localField: 'learnerId',
        foreignField: '_id',
        as: 'learner',
      },
    },
    { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'users',
        localField: 'learner.userId',
        foreignField: '_id',
        as: 'learnerUser',
      },
    },
    { $unwind: { path: '$learnerUser', preserveNullAndEmptyArrays: true } },

    /* ================= INSTRUCTOR ================= */
    {
      $lookup: {
        from: 'instructorprofiles',
        localField: 'instructorId',
        foreignField: '_id',
        as: 'instructorProfile',
      },
    },
    {
      $unwind: {
        path: '$instructorProfile',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'users',
        localField: 'instructorProfile.userId',
        foreignField: '_id',
        as: 'instructorUser',
      },
    },
    {
      $unwind: {
        path: '$instructorUser',
        preserveNullAndEmptyArrays: true,
      },
    },

    /* ================= FINAL SHAPE ================= */
    {
      $project: {
        totalAmount: 1,
        payableAmount: 1,
        paymentStatus: 1,
        status: 1,
        bookingMode: 1,
        vehicleType: 1,
        bookedSlots: 1,
        createdAt: 1,

        learner: {
          _id: '$learner._id',
          firstName: '$learner.firstName',
          lastName: '$learner.lastName',
          email: '$learner.email',
        },

        instructor: {
          _id: '$instructorUser._id',
          firstName: '$instructorUser.firstName',
          lastName: '$instructorUser.lastName',
          email: '$instructorUser.email',
          rating: '$instructorProfile.rating.avg',
          isVerified: '$instructorProfile.isVerified',
        },
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const countPipeline = pipeline.filter(
    (s) => !('$skip' in s) && !('$limit' in s) && !('$sort' in s),
  );

  const [data, totalRes] = await Promise.all([
    this.orderModel.aggregate(pipeline),
    this.orderModel.aggregate([...countPipeline, { $count: 'total' }]),
  ]);

  const total = totalRes[0]?.total || 0;

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