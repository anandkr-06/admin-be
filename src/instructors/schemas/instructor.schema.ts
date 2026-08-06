import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InstructorDocument = User & Document;

@Schema({ _id: false }) // subdocument (important)
class Vehicle {
  @Prop({
    required: true,
    enum: ['auto', 'manual'],
  })
  type!: 'auto' | 'manual';

  @Prop({ required: true })
  image!: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop()
  name!: string;

  @Prop({ unique: true })
  email!: string;

  @Prop()
  password?: string;

  @Prop()
  mobile!: string;

  @Prop()
  mobileNumber?: string;

  @Prop()
  dob?: string;

  @Prop()
  postCode?: string;

  @Prop()
  transmissionType?: string;

  @Prop()
  description?: string;

  @Prop()
  gender?: string;

  @Prop()
  profileImage?: string;

  @Prop({ type: [String], default: [] })
  proficientLanguages?: string[];

  @Prop({ type: [String], default: [] })
  languagesKnown?: string[];

  @Prop({ default: null })
  instructorExperienceYears?: number;

  @Prop({ default: false })
  isMemberOfDrivingAssociation?: boolean;

  @Prop({ type: [String], default: [] })
  drivingAssociations?: string[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isPaid!: boolean;

  @Prop({ default: true })
  isPublish!: boolean;

  @Prop({ default: true })
  isDelete!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop()
  createdAt!: Date;

  @Prop({ default: '' })
  public stripeAccountId!: string;

  // ✅ NEW FIELD (IMPORTANT)
  @Prop({
    type: [Vehicle],
    default: [],
  })
  vehicles!: Vehicle[];
  @Prop({ default: 0 })
  walletBalance!: number;
}

export const InstructorSchema = SchemaFactory.createForClass(User);
