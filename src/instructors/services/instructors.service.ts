import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  User,
  InstructorDocument,
} from "../schemas/instructor.schema";
import { PrivateLearner, PrivateLearnerDocument } from "../schemas/private-learner.schema";
import { Order, OrderDocument } from "../schemas/orders.schema";
import { PrivateOrder, PrivateOrderDocument } from "../schemas/private-order.schema";
import { InstructorDocuments, InstructorProfile, InstructorProfileDocument } from "../schemas/instructro-profiles.schema";
import { json } from "stream/consumers";
import { AdminQueryDto } from "src/common/dto/admin-query.dto";
import { WalletTransaction, WalletTransactionDocument } from "../schemas/wallet-transactions.schema";
import { NoShowRequest, NoShowRequestDocument, NoShowStatus, NoShowDecision } from "../schemas/no-show-request.schema";
import { InstructorsController } from "../controllers/instructors.controller";
import { InstructorTransaction } from "../schemas/instructor-transactions.schema";

import { calculateSlotDurationInHours, getDiscountSummary, normalizeTime } from "src/common/utils/admin-query.util";
import { Learner, LearnerDocument } from "src/learners/schema/learner.schema";


@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel(User.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,

    @InjectModel(PrivateLearner.name)
    private privateLearnerModel: Model<PrivateLearnerDocument>,

    @InjectModel(PrivateOrder.name)
    private privateOrderModel: Model<PrivateOrderDocument>,

    @InjectModel(InstructorProfile.name)
    private instructorProfileModel: Model<InstructorProfileDocument>,
    @InjectModel(WalletTransaction.name)
        private walletModel: Model<WalletTransactionDocument>,

    @InjectModel(NoShowRequest.name)
      private noShowRequestModel: Model<NoShowRequestDocument>,
    @InjectModel(InstructorTransaction.name)
    private instructorTransactionModel: Model<InstructorTransaction>,

    @InjectModel(Learner.name)
        private learnerModel: Model<LearnerDocument>,
  ) {}

  async setActive(id: string, isActive: boolean) {
    return this.instructorModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
  }

  
  async findAll({
    page,
    limit,
    search,
    status,
    role,
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    role?: string;
  }) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (safePage - 1) * safeLimit;
  
    const query: any = {};
  
    // 🔍 Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
  
    // 🟢 Status filter
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
  
    // 🧑‍🏫 Role filter
    if (role) query.role = role;
  
    const [data, total] = await Promise.all([
      this.instructorModel
        .find(query)
        .skip(skip)
        .limit(safeLimit)
        .sort({ createdAt: -1 })
        .lean(),
  
      this.instructorModel.countDocuments(query),
    ]);
  
    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
  

  async updateStatus(id: string, isActive: boolean) {
    return this.instructorModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
  }
  
  // 1️⃣ Profile
  // async getProfile(id: string) {
  //   const instructor = await this.instructorModel.findOne({
  //     _id: new Types.ObjectId(id),
  //     //isDeleted: false,
  //   });

  //   if (!instructor) throw new NotFoundException("Instructor not found");

  //   return {
  //     id: instructor._id,
  //     name: instructor.firstName,
  //     email: instructor.email,
  //     mobile: instructor.mobile,
  //     isActive: instructor.isActive,
  //     createdAt: instructor.createdAt,
  //   };
  // }
  async getProfile(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundException('Invalid instructor id');
  }

  const result = await this.instructorModel.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(id),
      },
    },

    // 🔗 Join instructorprofiles
    {
      $lookup: {
        from: 'instructorprofiles', // collection name
        localField: '_id',
        foreignField: 'userId',
        as: 'profile',
      },
    },

    {
      $unwind: {
        path: '$profile',
        preserveNullAndEmptyArrays: true, // important
      },
    },

    // ✅ Shape response
    {
      $project: {
        id: '$_id',
        name: { $concat: ['$firstName', ' ', '$lastName'] },
        email: 1,
        mobile: 1,
        isActive: 1,
        createdAt: 1,

        // 👇 Profile fields (adjust as per schema)
        bio: '$profile.bio',
        vehicles: '$profile.vehicles',
        availability: '$profile.availability',
        suburbs: '$profile.suburbs',
        documents: '$profile.documents',
        rating: '$profile.rating',
         isVerified: '$profile.isVerified',
         serviceAreas: '$profile.serviceAreas',
         testLocations: '$profile.testLocations',
      },
    },
  ]);

  if (!result.length) {
    throw new NotFoundException('Instructor not found');
  }

  return result[0];
}

  // 2️⃣ Orders
  async getOrders({
    instructorId,
    page,
    limit,
    status,
    search,
  }: {
    instructorId: string;
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {

   
  const instructor = await this.instructorProfileModel
  .findOne({ userId: new Types.ObjectId(instructorId) }).select('_id')
  .lean<{ _id: Types.ObjectId }>();



    if (!instructor) throw new NotFoundException("Instructor not found");
    
    const query: any = {
      instructorId: new Types.ObjectId(instructor._id),
     // isDeleted: false,
    };

    if (status) query.status = status;

    // if (search) {
    //   query.$or = [
    //     { _id: new RegExp(search, "i") },
    //     { "learner.name": new RegExp(search, "i") },
    //   ];
    // }
    if (search) {
      const orConditions: any[] = [];
    
      // ✅ If search is a valid ObjectId → match directly
      if (Types.ObjectId.isValid(search)) {
        orConditions.push({ _id: new Types.ObjectId(search) });
      }
    
      // ✅ Always allow name search
      orConditions.push({
        "learner.name": { $regex: search, $options: "i" },
      });
    
      query.$or = orConditions;
    }

    const [data, total] = await Promise.all([
      this.orderModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("learnerId", "firstName lastName email")
        .lean(),

      this.orderModel.countDocuments(query),
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

  async getPrivateOrders({
    instructorId,
    page,
    limit,
    status,
    search,
  }: {
    instructorId: string;
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const query: any = {
      instructorId: new Types.ObjectId(instructorId),
    };
  
    if (status) query.status = status;
  
    if (search) {
      query.$or = [
        { orderId: new RegExp(search, "i") },
      ];
    }
  
    const [data, total] = await Promise.all([
      this.privateOrderModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
          path: "privateLearnerId",
          select: "firstName lastName email mobileNumber",
        })
        .lean(),
    
      this.privateOrderModel.countDocuments(query),
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
  

  // 3️⃣ Private Learners
  async getPrivateLearners({
    instructorId,
    page,
    limit,
    search,
    status,
  }: {
    instructorId: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) {
    const query: any = {
      instructorId: (instructorId),
      //isDeleted: false,
    };

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { mobileNumber: new RegExp(search, "i") },
      ];
    }

    const [data, total] = await Promise.all([
      this.privateLearnerModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),

      this.privateLearnerModel.countDocuments(query),
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

  // 4️⃣ Activate / Deactivate
  // async updateStatus(id: string, isActive: boolean) {
  //   const instructor = await this.instructorModel.findByIdAndUpdate(
  //     id,
  //     { isActive },
  //     { new: true }
  //   );

  //   if (!instructor) throw new NotFoundException("Instructor not found");

  //   return { success: true, isActive: instructor.isActive };
  // }

  // 5️⃣ Soft delete
  async softDelete(id: string) {
    const instructor = await this.instructorModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!instructor) throw new NotFoundException("Instructor not found");

    return { success: true };
  }


  async updateVehicles(
    instructorId: string,
    dto: { vehicles: { type: 'auto' | 'manual'; image: string }[] },
  ) {
    // ✅ Remove duplicate types (important)
    const uniqueVehiclesMap = new Map();
  
    for (const vehicle of dto.vehicles) {
      uniqueVehiclesMap.set(vehicle.type, vehicle); // overwrite duplicates
    }
  
    const vehicles = Array.from(uniqueVehiclesMap.values());
  
    const updated = await this.instructorModel.findByIdAndUpdate(
      instructorId,
      { $set: { vehicles } },
      { new: true },
    );
  
    if (!updated) {
      throw new NotFoundException('Instructor not found');
    }
  
    return {
      message: 'Vehicles updated successfully',
      data: updated,
    };
  }


  async getWalletTransactions(
  field: 'learnerId' | 'userId',
  userId: string,
  dto: AdminQueryDto,
) {
  const page = Math.max(Number(dto.page) || 1, 1);
  const limit = Math.max(Number(dto.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: any = {
    [field]: new Types.ObjectId(userId),
  };

  if (dto.type) filter.type = dto.type;

  // ✅ Date range
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

// async getAllNoShowRequests({
//   page,
//   limit,
//   status,
//   requestedBy,
//   search,
//   sortBy,
//   sortOrder,
//   startDate,
//   endDate,
// }: {
//   page: number;
//   limit: number;
//   status?: string;
//   requestedBy?: string;
//   search?: string;
//   sortBy?: string;
//   sortOrder?: 'asc' | 'desc';
//   startDate?: string;
//   endDate?: string;
// }) {
//   const query: any = {};

//   /* ===============================
//      🎯 FILTERS
//   =============================== */
//   if (status) query.status = status;
//   if (requestedBy) query.requestedBy = requestedBy;

//   /* ===============================
//      📅 DATE RANGE
//   =============================== */
//   if (startDate || endDate) {
//     query.createdAt = {};
//     if (startDate) query.createdAt.$gte = new Date(startDate);
//     if (endDate) query.createdAt.$lte = new Date(endDate);
//   }

//   /* ===============================
//      🔍 SEARCH
//   =============================== */
//   let matchStage: any = {};

//   if (search) {
//     const regex = new RegExp(search, 'i');

//     matchStage = {
//       $or: [
//         { 'learner.firstName': regex },
//         { 'learner.lastName': regex },
//         { 'learner.email': regex },
//         { 'instructor.firstName': regex },
//         { 'instructor.lastName': regex },
//         { 'instructor.email': regex },
//       ],
//     };
//   }

//   /* ===============================
//      ⚙️ SAFE SORT (FIXED ✅)
//   =============================== */

//   const allowedSortFields = [
//     'createdAt',
//     'status',
//     'requestedBy',
//     'learner.firstName',
//     'instructor.firstName',
//   ] as const;
  
//   type SortField = (typeof allowedSortFields)[number];
  
//   const safeSortBy: SortField = allowedSortFields.includes(sortBy as SortField)
//     ? (sortBy as SortField)
//     : 'createdAt';
  
//   const safeSortOrder: 1 | -1 = sortOrder === 'asc' ? 1 : -1;
  
//   const sort: Record<string, 1 | -1> = {
//     [safeSortBy]: safeSortOrder,
//   };

//   /* ===============================
//      🚀 PIPELINE
//   =============================== */

//   const pipeline: any[] = [
//     {
//       $lookup: {
//         from: 'orders',
//         localField: 'bookingId',
//         foreignField: '_id',
//         as: 'order',
//       },
//     },
//     {
//       $unwind: {
//         path: '$order',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
  
//     // ✅ SLOT EXTRACTION (CRITICAL)
//     {
//       $addFields: {
//         slot: {
//           $arrayElemAt: [
//             {
//               $filter: {
//                 input: '$order.bookedSlots',
//                 as: 'slot',
//                 cond: {
//                   $eq: [
//                     { $toString: '$$slot._id' },
//                     { $toString: '$slotId' },
//                   ],
//                 },
//               },
//             },
//             0,
//           ],
//         },
//       },
//     },
  
//     {
//       $lookup: {
//         from: 'learners',
//         localField: 'order.learnerId',
//         foreignField: '_id',
//         as: 'learner',
//       },
//     },
//     {
//       $unwind: {
//         path: '$learner',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
  
//     {
//       $lookup: {
//         from: 'instructorprofiles',
//         localField: 'order.instructorId',
//         foreignField: '_id',
//         as: 'instructorProfile',
//       },
//     },
//     {
//       $unwind: {
//         path: '$instructorProfile',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
  
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'instructorProfile.userId',
//         foreignField: '_id',
//         as: 'instructor',
//       },
//     },
//     {
//       $unwind: {
//         path: '$instructor',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
  
//     ...(search ? [{ $match: matchStage }] : []),
  
//     { $match: query },
  
//     { $sort: sort },
  
//     // ✅ FINAL PROJECTION
//     {
//       $project: {
//         _id: 1,
//         status: 1,
//         requestedBy: 1,
//         createdAt: 1,
  
//         slotDate: '$slot.date',
//         startTime: '$slot.startTime',
  
//         reasonType: '$slot.actionMeta.reasonType',
//         comment: '$slot.actionMeta.comment',
  
//         learnerName: {
//           $concat: ['$learner.firstName', ' ', '$learner.lastName'],
//         },
  
//         instructorName: {
//           $concat: ['$instructor.firstName', ' ', '$instructor.lastName'],
//         },
//       },
//     },
  
//     {
//       $facet: {
//         data: [
//           { $skip: (page - 1) * limit },
//           { $limit: limit },
//         ],
//         total: [{ $count: 'count' }],
//       },
//     },
//   ];

//   const result = await this.noShowRequestModel.aggregate(pipeline);

//   const data = result[0]?.data || [];
//   const total = result[0]?.total[0]?.count || 0;

//   return {
//     data,
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }
async getAllNoShowRequests({
  page,
  limit,
  status,
  requestedBy,
  search,
  sortBy,
  sortOrder,
  startDate,
  endDate,
}: {
  page: number;
  limit: number;
  status?: string;
  requestedBy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}) {
  const query: any = {};

  /* ===============================
     🎯 FILTERS
  =============================== */
  if (status) query.status = status;
  if (requestedBy) query.requestedBy = requestedBy;

  /* ===============================
     📅 DATE RANGE
  =============================== */
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  /* ===============================
     🔍 SEARCH
  =============================== */
  let matchStage: any = {};

  if (search) {
    const regex = new RegExp(search, 'i');

    matchStage = {
      $or: [
        { 'learner.firstName': regex },
        { 'learner.lastName': regex },
        { 'learner.name': regex }, // ✅ fallback
        { 'learner.email': regex },
        { 'instructor.firstName': regex },
        { 'instructor.lastName': regex },
        { 'instructor.email': regex },
      ],
    };
  }

  /* ===============================
     ⚙️ SAFE SORT
  =============================== */

  const allowedSortFields = [
    'createdAt',
    'status',
    'requestedBy',
    'learner.firstName',
    'instructor.firstName',
  ] as const;

  type SortField = (typeof allowedSortFields)[number];

  const safeSortBy: SortField = allowedSortFields.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : 'createdAt';

  const safeSortOrder: 1 | -1 = sortOrder === 'asc' ? 1 : -1;

  const sort: Record<string, 1 | -1> = {
    [safeSortBy]: safeSortOrder,
  };

  /* ===============================
     🚀 PIPELINE
  =============================== */

  const pipeline: any[] = [
    /* ===============================
       ORDER JOIN
    =============================== */
    {
      $lookup: {
        from: 'orders',
        localField: 'bookingId',
        foreignField: '_id',
        as: 'order',
      },
    },
    {
      $unwind: {
        path: '$order',
        preserveNullAndEmptyArrays: true,
      },
    },

    /* ===============================
       SLOT EXTRACTION
    =============================== */
    {
      $addFields: {
        slot: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$order.bookedSlots',
                as: 'slot',
                cond: {
                  $eq: [
                    { $toString: '$$slot._id' },
                    { $toString: '$slotId' },
                  ],
                },
              },
            },
            0,
          ],
        },
      },
    },

    /* ===============================
       ✅ FIXED LEARNER LOOKUP (KEY FIX)
    =============================== */
    {
      $lookup: {
        from: 'learners',
        let: { learnerId: '$order.learnerId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id',
                  {
                    $cond: [
                      { $eq: [{ $type: '$$learnerId' }, 'string'] },
                      { $toObjectId: '$$learnerId' },
                      '$$learnerId',
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: 'learner',
      },
    },
    {
      $unwind: {
        path: '$learner',
        preserveNullAndEmptyArrays: true,
      },
    },

    /* ===============================
       INSTRUCTOR LOOKUP
    =============================== */
    {
      $lookup: {
        from: 'instructorprofiles',
        localField: 'order.instructorId',
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
        as: 'instructor',
      },
    },
    {
      $unwind: {
        path: '$instructor',
        preserveNullAndEmptyArrays: true,
      },
    },

    ...(search ? [{ $match: matchStage }] : []),

    { $match: query },

    { $sort: sort },

    /* ===============================
       FINAL PROJECTION
    =============================== */
    {
      $project: {
        _id: 1,
        status: 1,
        requestedBy: 1,
        createdAt: 1,

        slotDate: '$slot.date',
        startTime: '$slot.startTime',
        endTime: '$slot.endTime',

        reasonType: '$slot.actionMeta.reasonType',
        attachment: '$slot.actionMeta.attachment',
        comment: '$slot.actionMeta.comment',
  

        /* ✅ SAFE LEARNER NAME */
        learnerName: {
          $cond: [
            { $and: ['$learner.firstName', '$learner.lastName'] },
            { $concat: ['$learner.firstName', ' ', '$learner.lastName'] },
            { $ifNull: ['$learner.name', 'N/A'] },
          ],
        },

        instructorName: {
          $concat: ['$instructor.firstName', ' ', '$instructor.lastName'],
        },
      },
    },

    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const result = await this.noShowRequestModel.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.total[0]?.count || 0;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


async approveNoShowSlot(
  noShowRequestId: string,
  adminId: string,
  decision: 'PAY_INSTRUCTOR' | 'REFUND_LEARNER',
) {
  const request = await this.noShowRequestModel.findById(noShowRequestId);

  if (!request) {
    throw new BadRequestException('Request not found');
  }

  if (request.status !== 'PENDING') {
    throw new BadRequestException('Request already processed');
  }

  const order = await this.orderModel.findById(
    new Types.ObjectId(request.bookingId),
  );

  if (!order) {
    throw new BadRequestException('Order not found');
  }

  const slot = order.bookedSlots.id(
    new Types.ObjectId(request.slotId),
  );

  if (!slot) {
    throw new BadRequestException('Slot not found');
  }

  // 🔥 IMPORTANT FIX
  if (slot.status !== 'NOSHOW_REQUESTED') {
    throw new BadRequestException(
      `Invalid slot status: ${slot.status}`,
    );
  }

  const hours = calculateSlotDurationInHours(
    normalizeTime(slot.startTime),
    normalizeTime(slot.endTime),
  );

  /* ===============================
     🎯 DECISION
  =============================== */

  if (decision === 'PAY_INSTRUCTOR') {
    await this.handleInstructorPayout(order, slot, hours);
    slot.status = 'NOSHOW';
    request.decision = NoShowDecision.PAY_INSTRUCTOR;
  } else {
    await this.handleLearnerRefund(order, slot, hours);
    slot.status = 'CANCELLED';
    request.decision = NoShowDecision.REFUND_LEARNER
  }

  /* ===============================
     ✅ UPDATE REQUEST
  =============================== */

  request.status = NoShowStatus.APPROVED
  request.adminId = new Types.ObjectId(adminId);
  

  await request.save();
  await order.save();

  return {
    success: true,
    message: 'No-show request approved',
  };
}


async rejectNoShowSlot(
  noShowRequestId: string,
  adminId: string,
  remark: string,
) {
  const request = await this.noShowRequestModel.findById(noShowRequestId);

  if (!request) {
    throw new BadRequestException('NoShow request not found');
  }

  request.status = NoShowStatus.REJECTED;
  request.adminId = new Types.ObjectId(adminId);
  request.adminRemark = remark;

  await request.save();

  return { success: true };
}



async handleInstructorPayout(order, slot, hours) {
  let grossAmount = 0;
  let pricePerHour = 0;

  if (slot.type === 'LESSON') {
    grossAmount = hours * order.pricePerHour;
    pricePerHour = order.pricePerHour;
  }

  if (slot.type === 'TEST') {
    grossAmount = order.testPrice;
    pricePerHour = order.testPrice;
  }

  const platformCommission = grossAmount * 0.17;
  

  /* ===============================
     💳 Get discount commision
  =============================== */
  type OrderDoc = {
    stripeAmount: number;
    discount: number;        // discount amount (NOT %)
    platformCharge: number;
  };
  
  type Transaction = {
    amount: number;
    discountPercent: number;
  };
  
  const instructorOrderDataDicount: OrderDoc[] =
    await this.orderModel.find(
      { instructorId: order.instructorId, paymentStatus: 'PAID' },
      {
        stripeAmount: 1,
        discount: 1,
        platformCharge: 1,
      }
    ).lean();
  
  const transactions: Transaction[] = instructorOrderDataDicount.map((item) => {
    const amount =
      item.stripeAmount + item.discount - item.platformCharge;
  
    return {
      amount,
      discountPercent: amount
        ? (item.discount / amount) * 100
        : 0,
    };
  });
  
  const percentageDiscount = getDiscountSummary(transactions);
  console.log("percentageDiscount",percentageDiscount.effectiveDiscount);
const discountCommission = Number(
  (grossAmount * (percentageDiscount.effectiveDiscount / 100)).toFixed(2)
);
const instructorEarning = grossAmount - platformCommission - discountCommission;

  /* ===============================
     💳 CREATE INSTRUCTOR TXN
  =============================== */
  const txn = await this.instructorTransactionModel.create({
    orderId: order._id,
    slotId: slot._id,
    learnerId: order.learnerId,
    instructorId: order.instructorId,
    type: slot.type,
    hours,
    pricePerHour,
    grossAmount,
    platformCommission,
    discountCommission,
    instructorEarning,
    payoutStatus: 'PAID', // ✅ since we directly credit wallet
    payoutDate: new Date(),
  });

  /* ===============================
     💰 GET INSTRUCTOR USER
  =============================== */
  const instructorProfile = await this.instructorProfileModel.findById(
    order.instructorId,
  );

  if (!instructorProfile) {
    throw new BadRequestException('Instructor profile not found');
  }

  const instructor = await this.instructorModel.findByIdAndUpdate(
    instructorProfile.userId,
    { $inc: { walletBalance: instructorEarning } },
    { new: true },
  );

  if (!instructor) {
    throw new BadRequestException('Instructor not found');
  }

  /* ===============================
     🧾 WALLET LEDGER ENTRY
  =============================== */
  // 1️⃣ Update wallet
await this.instructorModel.findByIdAndUpdate(
  instructorProfile.userId,
  { $inc: { walletBalance: instructorEarning } },
);

// 2️⃣ Create ledger entry
await this.walletModel.create({
  userId: instructor._id,
  role: 'instructor',
  type: 'CREDIT',
  amount: instructorEarning,
  balanceAfter: instructor.walletBalance,
  source: 'NOSHOW',
  referenceEntityId: txn._id
});
  /* ===============================
     ⏱️ UPDATE ORDER HOURS
  =============================== */
  order.usedHours += hours;
  order.remainingHours -= hours;

  if (order.remainingHours <= 0) {
    order.scheduleStatus = 'FULLY_SCHEDULED';
  }

  await order.save();

  return {
    success: true,
    instructorEarning,
  };
}


async handleLearnerRefund(order, slot, hours) {
  // 💰 Calculate refund amount
  let refundAmount = 0;

  if (slot.type === 'LESSON') {
    refundAmount = hours * order.pricePerHour;
  }

  if (slot.type === 'TEST') {
    refundAmount = order.testPrice;
  }

  /* ===============================
     💰 GET WALLET
  =============================== */
  const wallet = await this.learnerModel.findById({
    _id:order.learnerId,
  });

  if (!wallet) {
    throw new BadRequestException('Wallet not found');
  }

  const newBalance = wallet.walletBalance + refundAmount;

  /* ===============================
     💳 CREATE TRANSACTION
  =============================== */
  await this.walletModel.create({
    learnerId: order.learnerId,
    
    amount: refundAmount,
    type: 'CREDIT',
    source: 'REFUND',
    description: 'NOSHOW_REFUND' +  "orderId:" + order._id + "slotId:" + slot._id,

    // ✅ REQUIRED
    balanceAfter: newBalance,
  });

  /* ===============================
     💰 UPDATE WALLET
  =============================== */
  wallet.walletBalance = newBalance;
  await wallet.save();

  /* ===============================
     ⏱️ RESTORE HOURS
  =============================== */
  order.usedHours -= hours;
  order.remainingHours += hours;

  if (order.remainingHours > 0) {
    order.scheduleStatus = 'PARTIALLY_SCHEDULED';
  }

  await order.save();

  return {
    success: true,
    refundedAmount: refundAmount,
  };
}

}
