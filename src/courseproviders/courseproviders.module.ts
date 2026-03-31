// courseproviders/courseproviders.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseProvidersController } from '../courseproviders/controllers/courseproviders.controller';
import { CourseProvidersService } from '../courseproviders/services/courseproviders.service';
import {
  CourseProvider,
  CourseProviderSchema,
} from '../courseproviders/schema/courseproviders.schema';
import { CoursesService } from 'src/course/services/course.service';
import { Course, CourseSchema } from 'src/course/schema/course.schema';
import { Lead, LeadSchema } from 'src/leads/schema/leads.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseProvider.name, schema: CourseProviderSchema },
      { name: Course.name, schema: CourseSchema }, // ✅ ADD THIS
      { name: Lead.name, schema: LeadSchema }
    ]),
  ],
  controllers: [CourseProvidersController],
  providers: [CourseProvidersService,CoursesService],
})
export class CourseProvidersModule {}