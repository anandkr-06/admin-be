import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  InstructorProfile,
  InstructorProfileDocument,
} from '../schemas/instructro-profiles.schema';
import {
  Order,
  OrderDocument,
} from '../schemas/orders.schema';
import {
  PrivateOrder,
  PrivateOrderDocument,
} from '../schemas/private-order.schema';

@Injectable()
export class AdminInstructorsService {
  constructor(
    @InjectModel(InstructorProfile.name)
    private readonly instructorProfileModel: Model<InstructorProfileDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(PrivateOrder.name)
    private readonly privateOrderModel: Model<PrivateOrderDocument>,
  ) {}

  async getInstructorStats(instructorId: Types.ObjectId) {
    const instructor = await this.instructorProfileModel.findOne(
      {userId: new Types.ObjectId(instructorId)}
    ).select('_id');
console.log("Instructor Profile Found:", JSON.stringify(instructor, null, 2));
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const [
      totalOrders,
      privateOrders,
      completedOrders,
      pendingOrders,
      earningsAgg,
      privateLearnersAgg,
    ] = await Promise.all([
      this.orderModel.countDocuments({ instructorId: instructor._id }),

      this.privateOrderModel.countDocuments({ instructorId }),

      this.orderModel.countDocuments({
        instructorId: instructor._id,
        status: 'COMPLETED',
      }),

      this.orderModel.countDocuments({
        instructorId: instructor._id,
        status: { $ne: 'COMPLETED' },
      }),

      this.orderModel.aggregate([
        {
          $match: {
            instructorId: instructor._id,
            status: 'COMPLETED',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' },
          },
        },
      ]),

      this.privateOrderModel.aggregate([
        { $match: { instructorId } },
        {
          $group: {
            _id: '$privateLearnerId',
          },
        },
        { $count: 'count' },
      ]),
    ]);

    return {
      instructorId,
      stats: {
        totalOrders,
        privateOrders,
        completedOrders,
        pendingOrders,
        totalEarnings: earningsAgg[0]?.total || 0,
        totalPrivateLearners:
          privateLearnersAgg[0]?.count || 0,
      },
    };
  }
}
