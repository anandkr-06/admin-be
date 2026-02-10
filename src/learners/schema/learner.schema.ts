// learners/schema/learner.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LearnerDocument = Learner & Document;

@Schema({ timestamps: true })
export class Learner {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  mobileNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean; // ✅ SOFT DELETE FLAG
}

export const LearnerSchema = SchemaFactory.createForClass(Learner);
LearnerSchema.index({ firstName: 1 });
LearnerSchema.index({ email: 1 });
LearnerSchema.index({ mobile: 1 });
LearnerSchema.index({ isActive: 1 });
LearnerSchema.index({ isDeleted: 1 });