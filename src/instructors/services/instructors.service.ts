import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  User,
  InstructorDocument,
} from "../schemas/instructor.schema";
import { PrivateLearner, PrivateLearnerDocument } from "../schemas/private-learner.schema";
import { Order, OrderDocument } from "../schemas/orders.schema";
import { PrivateOrder, PrivateOrderDocument } from "../schemas/private-order.schema";
import { InstructorProfile, InstructorProfileDocument } from "../schemas/instructro-profiles.schema";
import { json } from "stream/consumers";


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
    private instructorProfileModel: Model<InstructorProfileDocument>
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
  async getProfile(id: string) {
    const instructor = await this.instructorModel.findOne({
      _id: new Types.ObjectId(id),
      //isDeleted: false,
    });

    if (!instructor) throw new NotFoundException("Instructor not found");

    return {
      id: instructor._id,
      name: instructor.firstName,
      email: instructor.email,
      mobile: instructor.mobile,
      isActive: instructor.isActive,
      createdAt: instructor.createdAt,
    };
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

    if (search) {
      query.$or = [
        { orderId: new RegExp(search, "i") },
        { "learner.name": new RegExp(search, "i") },
      ];
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
}
