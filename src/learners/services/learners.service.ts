// learners/learners.service.ts
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Learner, LearnerDocument } from "../schema/learner.schema";
import { AdminQueryDto } from "src/common/dto/admin-query.dto";
import { Order, OrderDocument } from "src/instructors/schemas/orders.schema";
import { WalletTransaction, WalletTransactionDocument, WalletTxnStatus } from "src/instructors/schemas/wallet-transactions.schema";

import { Feedback } from "src/feedbacks/schema/feedbacks.schema";
import { InstructorReview } from "src/instructors/schemas/instructor-reviews.schema";

import { RefundRequestQueryDto } from "../dto/refund.dto";
import Stripe from 'stripe';


@Injectable()
export class LearnersService {
  private stripe: Stripe;
  constructor(
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(WalletTransaction.name)
    private walletModel: Model<WalletTransactionDocument>,
    @InjectModel(InstructorReview.name)
    private reviewModel: Model<InstructorReview>,
    @InjectModel(Feedback.name)
    private feedbackModel: Model<Feedback>,
    // @InjectModel(Slot.name)
    // private slotModel: Model<SlotDocument>,
  ) {
    this.stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
      apiVersion: '2025-12-15.clover',
    });
  }

  
// learners.service.ts
async findAll(queryParams: any) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
    } = queryParams;
  
    const query: any = {
      //isDeleted: false,
    };
  
    // 🔍 SEARCH
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }
    console.log("FINAL QUERY:", JSON.stringify(query, null, 2));
    // ✅ STATUS FILTER
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
  
    const skip = (page - 1) * limit;
  
    const [data, total] = await Promise.all([
      this.learnerModel
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ created: -1 }),
  
      this.learnerModel.countDocuments(query),
    ]);
  
    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  
  
  async softDelete(learnerId: string) {
    const learner = await this.learnerModel.findByIdAndUpdate(
      learnerId,
      { isDeleted: true },
      { new: true },
    );
  
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }
  
    return { success: true };
  }

  async updateStatus(id: string, isActive: boolean) {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundException('Invalid learner id');
  }

  const updated = await this.learnerModel.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: { isActive } },
    { new: true },
  );

  if (!updated) {
    throw new NotFoundException('Learner not found');
  }

  return {
    message: `Learner ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { isActive },
  };
}
  
  
  async getProfile(learnerId: string) {
  const learner = await this.learnerModel.findById(learnerId).select('-password').lean();

  if (!learner) {
    throw new NotFoundException('Learner not found');
  }

  return learner;
}

async getOrders(learnerId: string, dto: AdminQueryDto) {
  const page = Math.max(Number(dto.page) || 1, 1);
  const limit = Math.max(Number(dto.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: any = {
    learnerId: new Types.ObjectId(learnerId),
  };

  if (dto.status) filter.status = dto.status;

  // ✅ Date range
  if (dto.startDate || dto.endDate) {
    filter.createdAt = {};
    if (dto.startDate) filter.createdAt.$gte = new Date(dto.startDate);
    if (dto.endDate) filter.createdAt.$lte = new Date(dto.endDate);
  }

  const [data, total] = await Promise.all([
    this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    this.orderModel.countDocuments(filter),
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

async getStats(learnerId: string) {
  const learnerObjectId = new Types.ObjectId(learnerId);

  const [completedOrders, slotStats] = await Promise.all([
    this.orderModel.countDocuments({
      learnerId: learnerObjectId,
      status: 'COMPLETED',
    }),

    // this.slotModel.aggregate([
    //   { $match: { learnerId: learnerObjectId } },
    //   {
    //     $group: {
    //       _id: '$status',
    //       count: { $sum: 1 },
    //     },
    //   },
    // ]),
    this.orderModel.countDocuments({
      learnerId: learnerObjectId,
      status: 'COMPLETED',
    })
  ]);

  return {
    completedOrders,
    slotStats,
  };
}

async getWalletTransactions(learnerId: string, dto: AdminQueryDto) {
  const page = Math.max(Number(dto.page) || 1, 1);
  const limit = Math.max(Number(dto.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: any = {
    learnerId: new Types.ObjectId(learnerId),
  };

  if (dto.type) filter.type = dto.type;

  if (dto.startDate || dto.endDate) {
    filter.createdAt = {};
    if (dto.startDate) filter.createdAt.$gte = new Date(dto.startDate);
    if (dto.endDate) filter.createdAt.$lte = new Date(dto.endDate);
  }

  const [data, total] = await Promise.all([
    this.walletModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    this.walletModel.countDocuments(filter),
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

async getReviews(learnerId: string, dto: AdminQueryDto) {
  const filter: any = {
    learnerId: new Types.ObjectId(learnerId),
  };

  if (dto.status) filter.status = dto.status;

  return this.paginate(this.reviewModel, filter, dto);
}

async getFeedbacks(learnerId: string, dto: AdminQueryDto) {
  const filter: any = {
    // userId: new Types.ObjectId(learnerId),
    userId: (learnerId),
  };

  if (dto.type) filter.type = dto.type;

  return this.paginate(this.feedbackModel, filter, dto);
}

async paginate(model: any, filter: any, dto: AdminQueryDto) {
  const page = Math.max(Number(dto.page) || 1, 1);
  const limit = Math.max(Number(dto.limit) || 10, 1);
  const skip = (page - 1) * limit;

  if (dto.startDate || dto.endDate) {
    filter.createdAt = {};
    if (dto.startDate) filter.createdAt.$gte = new Date(dto.startDate);
    if (dto.endDate) filter.createdAt.$lte = new Date(dto.endDate);
  }

  const [data, total] = await Promise.all([
    model.find(filter).skip(skip).limit(limit).lean(),
    model.countDocuments(filter),
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
/**
 * Admin Approval process
 * @param requestId 
 * @returns 
 */
// async approveRefund(requestId: string) {
//   const txn = await this.walletModel.findById(requestId);

//   if (!txn || txn.status !== 'PENDING') {
//     throw new BadRequestException('Invalid request');
//   }

//   try {

//     // ✅ Get credited transactions
//     const matchTransactionData = await this.creditedAccounts(
//       txn.learnerId,
//       txn.stripePaymentIntentId
//     );

//     const transactions = matchTransactionData.data;
//     if (!transactions.length) {
//       throw new BadRequestException('No credited transactions found');
//     }

//     const finalRefundAmount = transactions[0].amount - transactions[0].order.platformCharge - transactions[0].order.discount;
//     console.log("finalRefundAmount",finalRefundAmount)
//     // 1️⃣ Stripe call
//     const refund = await this.stripe.refunds.create({
//       payment_intent: txn.stripePaymentIntentId,
//       amount: Math.round(finalRefundAmount * 100),
//     });

//     // 2️⃣ Update original txn
//     await this.walletModel.updateOne(
//       {
//         learnerId: txn.learnerId,
//         stripePaymentIntentId: txn.stripePaymentIntentId,
//         type: 'CREDIT',
//       },
//       {
//         $inc: { refundedAmount: txn.amount },
//       },
//     );

//     // 3️⃣ Mark refund txn
//     txn.status = WalletTxnStatus.COMPLETED;
//     txn.description = 'Refund approved and processed';
//     // txn.referenceEntityId = refund.id; // ✅ FIXED
//     (txn as any).stripeRefundId = refund.id; // optional
//     await txn.save();

//     return {
//       message: 'Refund approved',
//       refundId: refund.id,
//     };

//   } catch (error) {
//     console.error('Refund Error:', error);

//     txn.status = WalletTxnStatus.FAILED;
//     await txn.save();

//     throw new BadRequestException('Refund failed');
//   }
// }
async approveRefund(requestId: string) {
  const txn = await this.walletModel.findById(requestId);

  if (!txn || txn.status !== 'PENDING') {
    throw new BadRequestException('Invalid request');
  }

  try {
    // ✅ Get all credited transactions for this learner/payment intent
    const matchTransactionData = await this.creditedAccounts(
      txn.learnerId,
      txn.stripePaymentIntentId
    );

    let transactions = matchTransactionData.data;
    if (!transactions.length) {
      throw new BadRequestException('No credited transactions found');
    }

    // ✅ Sort transactions FIFO (oldest first)
    transactions = transactions.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let refundRemaining = txn.amount; // total refund requested
    let totalRefundAmount = 0;

    // ✅ Walk through credits FIFO until refund is satisfied
    for (const creditTxn of transactions) {
      if (refundRemaining <= 0) break;

      const available = creditTxn.amount - creditTxn.order.platformCharge - creditTxn.order.discount;

      const refundPortion = Math.min(available, refundRemaining);
      refundRemaining -= refundPortion;
      totalRefundAmount += refundPortion;

      // Update each credit transaction’s refunded amount
      await this.walletModel.updateOne(
        { _id: creditTxn._id },
        { $inc: { refundedAmount: refundPortion } }
      );
    }

    if (totalRefundAmount <= 0) {
      throw new BadRequestException('Calculated refund amount invalid');
    }

    // ✅ Stripe refund call
    const refund = await this.stripe.refunds.create({
      payment_intent: txn.stripePaymentIntentId,
      amount: Math.round(totalRefundAmount * 100), // in cents
    });

    // ✅ Update original refund request txn
    txn.status = WalletTxnStatus.COMPLETED;
    txn.description = `Refund of ${totalRefundAmount} approved (FIFO applied)`;
    txn.stripeRefundId = refund.id;
    txn.refundAmount = totalRefundAmount;
    await txn.save();

    return {
      message: 'Refund approved',
      refundId: refund.id,
      refundedAmount: totalRefundAmount,
    };

  } catch (error) {
    console.error('Refund Error:', error);

    txn.status = WalletTxnStatus.FAILED;
    await txn.save();

    throw new BadRequestException('Refund failed');
  }
}


async rejectRefund(requestId: string) {
  if (!Types.ObjectId.isValid(requestId)) {
    throw new BadRequestException('Invalid requestId');
  }

  const txn = await this.walletModel.findById(requestId);

  if (!txn) {
    throw new NotFoundException('Refund request not found');
  }

  if (txn.status !== 'PENDING') {
    throw new BadRequestException('Refund already processed');
  }

  // 1️⃣ Get learner
  const learner = await this.learnerModel.findById(txn.learnerId);

  if (!learner) {
    throw new NotFoundException('Learner not found');
  }

  // 2️⃣ Calculate new balance (amount was already deducted during request)
  const newBalance = learner.walletBalance + txn.amount;

  // 3️⃣ Update learner wallet (credit back)
  await this.learnerModel.updateOne(
    { _id: txn.learnerId },
    { $inc: { walletBalance: txn.amount } },
  );

  // 4️⃣ Create reversal transaction (ledger entry)
  await this.walletModel.create({
    learnerId: txn.learnerId,
    userId: txn.learnerId,
    role: 'learner',
    type: 'CREDIT',
    amount: txn.amount,
    balanceAfter: newBalance, // ✅ REQUIRED
    description: 'Refund request rejected - amount returned',
    source: 'REFUND_REVERSAL',
    status: 'COMPLETED',
    referenceEntityId: txn._id, // ✅ link to original request
  });

  // 5️⃣ Update original refund request
  txn.status = WalletTxnStatus.REJECTED;
  txn.description = 'Refund request rejected by admin';
  await txn.save();

  return {
    success: true,
    message: 'Refund rejected and amount returned to wallet',
    balanceAfter: newBalance,
  };
}

async getRefundRequests(dto: RefundRequestQueryDto) {
  const page = Math.max(Number(dto.page) || 1, 1);
  const limit = Math.max(Number(dto.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const match: any = {
    source: 'STRIPE_REFUND',
  };

  // ✅ Status filter
  if (dto.status) {
    match.status = dto.status;
  }

  // ✅ Date filter
  if (dto.fromDate || dto.toDate) {
    match.createdAt = {};
    if (dto.fromDate) {
      match.createdAt.$gte = new Date(dto.fromDate);
    }
    if (dto.toDate) {
      match.createdAt.$lte = new Date(dto.toDate);
    }
  }

  const pipeline: any[] = [
    { $match: match },

    // ✅ Join learner info
    {
      $lookup: {
        from: 'learners',
        localField: 'learnerId',
        foreignField: '_id',
        as: 'learner',
      },
    },
    { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },

    // ✅ Search filter
    ...(dto.search
      ? [
          {
            $match: {
              $or: [
                {
                  'learner.firstName': {
                    $regex: dto.search,
                    $options: 'i',
                  },
                },
                {
                  'learner.email': {
                    $regex: dto.search,
                    $options: 'i',
                  },
                },
                {
                  stripePaymentIntentId: {
                    $regex: dto.search,
                    $options: 'i',
                  },
                },
              ],
            },
          },
        ]
      : []),

    // ✅ Sort latest first
    { $sort: { createdAt: -1 } },

    // ✅ Pagination + count
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },

          {
            $project: {
              _id: 1,
              amount: 1,
              status: 1,
              stripePaymentIntentId: 1,
              createdAt: 1,
              referenceEntityId: 1,
              learner: {
                _id: '$learner._id',
                firstName: '$learner.firstName',
                lastName: '$learner.lastName',
                email: '$learner.email',
                mobileNumber: '$learner.mobileNumber',
              },
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const result = await this.walletModel.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.total[0]?.count || 0;

  return {
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data,
  };
}




async creditedAccounts(learnerId: any, stripePaymentIntentId: any) {
  if (!learnerId) {
    throw new BadRequestException('Invalid learnerId!');
  }

  if (!stripePaymentIntentId) {
    throw new BadRequestException('stripePaymentIntentId is required');
  }

  const learnerObjectId = new Types.ObjectId(learnerId);

  const transactions = await this.walletModel.aggregate([
    {
      $match: {
        learnerId: learnerObjectId,
        type: 'CREDIT',
        status: 'COMPLETED',
        source: { $in: ['GIFT_VOUCHER', 'ORDER', 'STRIPE'] },
        stripePaymentIntentId,
      },
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'referenceEntityId',
        foreignField: '_id',
        as: 'orderDetails',
      },
    },
    {
      $unwind: {
        path: '$orderDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        _id: 1, // ✅ keep it
        source: 1,
        amount: 1,
        refundedAmount: 1, // ✅ important
        balanceAfter: 1,
        status: 1,
        stripePaymentIntentId: 1,
        createdAt: 1,
        isRefund: 1,

        order: {
          _id: '$orderDetails._id',
          orderId: '$orderDetails.orderId',
          totalAmount: '$orderDetails.totalAmount',
          pricePerHour: '$orderDetails.pricePerHour',
          status: '$orderDetails.status',
          purchaseAmount: '$orderDetails.purchaseAmount',
          discount: '$orderDetails.discount',
          platformCharge: '$orderDetails.platformCharge',
        },
      },
    },
  ]);

  return {
    data: transactions,
  };
}
}
