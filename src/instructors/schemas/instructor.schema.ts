import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type InstructorDocument = User & Document;

@Schema({ _id: false }) // subdocument (important)
class Vehicle {
  @Prop({
    required: true,
    enum: ['auto', 'manual'],
  })
  type: 'auto' | 'manual';

  @Prop({ required: true })
  image: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  mobile: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isDelete: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt: Date;

  // ✅ NEW FIELD (IMPORTANT)
  @Prop({
    type: [Vehicle],
    default: [],
  })
  vehicles: Vehicle[];
}

export const InstructorSchema = SchemaFactory.createForClass(User);