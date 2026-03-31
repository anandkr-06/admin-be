import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Course, CourseSchema } from "./schema/course.schema";

import { CoursesService } from "./services/course.service";
import { CoursesController } from "./controllers/course.controller";
import { Lead, LeadSchema } from "src/leads/schema/leads.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Lead.name, schema: LeadSchema
       },
    ]),
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
