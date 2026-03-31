import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


export enum FeedbackOwnerType {
  LEARNER = 'learner',
  INSTRUCTOR = 'instructor',
}

export enum FeedbackType {
  SUPPORT = 'SUPPORT',
    SUGGESTIONS = 'SUGGESTIONS',
    QUESTIONS = 'QUESTIONS',
    NOSHOW = 'NOSHOW',
  }

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ enum: FeedbackType, required: true })
  feedbackType!: FeedbackType;

  @Prop({ required: true })
  description!: string;

  @Prop()
  fileUrl?: string;

  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ enum: FeedbackOwnerType, required: true })
  ownerType!: FeedbackOwnerType;
  
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
