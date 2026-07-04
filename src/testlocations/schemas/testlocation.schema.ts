import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'addresslocations', timestamps: true })
export class TestLocation {
  @Prop()
  state?: string;

  @Prop()
  location?: string;

  @Prop()
  address?: string;

  @Prop()
  suburb?: string;

  @Prop({ type: Object })
  postCode?: string | number;

  @Prop({ default: true })
  isActive?: boolean;
}

export type TestLocationDocument = TestLocation &
  Document & { _id: Types.ObjectId };
export const TestLocationSchema = SchemaFactory.createForClass(TestLocation);
