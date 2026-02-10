import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type InstructorDocument = User & Document;

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


}



export const InstructorSchema = SchemaFactory.createForClass(User);

//Need to add more api endpoints:
// GET /admin/instructors/:id/profile
// GET /admin/instructors/:id/orders?page=1&status=completed
// GET /admin/instructors/:id/private-learners?search=anand
// PATCH /admin/instructors/:id/status
// DELETE /admin/instructors/:id