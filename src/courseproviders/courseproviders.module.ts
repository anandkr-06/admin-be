// courseproviders/courseproviders.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseProvidersController } from '../courseproviders/controllers/courseproviders.controller';
import { CourseProvidersService } from '../courseproviders/services/courseproviders.service';
import {
  CourseProvider,
  CourseProviderSchema,
} from '../courseproviders/schema/courseproviders.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseProvider.name, schema: CourseProviderSchema },
    ]),
  ],
  controllers: [CourseProvidersController],
  providers: [CourseProvidersService],
})
export class CourseProvidersModule {}