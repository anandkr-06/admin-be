import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AdminuserDocument = Adminuser & Document;

@Schema({ timestamps: true })
export class Adminuser {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  name: string;
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  role: string; // ADMIN, MANAGER, LEARNER
  @Prop()
refreshToken?: string; // HASHED

}

export const AdminuserSchema = SchemaFactory.createForClass(Adminuser);
