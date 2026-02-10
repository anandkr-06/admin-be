// learners/learners.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Learner, LearnerDocument } from "../schema/learner.schema";


@Injectable()
export class LearnersService {
  constructor(
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>
  ) {}

  // learners/learners.service.ts
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
    return this.learnerModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
  }
  
  
  
  
}
