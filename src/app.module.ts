import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { InstructorsModule } from './instructors/instructors.module';
import { LearnersModule } from './learners/learners.module';
import { CoursesModule } from './course/course.module';
import { CourseProvidersModule } from './courseproviders/courseproviders.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env", }), // ✅ Loads .env globally
    MongooseModule.forRoot(process.env.DATABASE_URL!, {
      autoCreate: true,
    }),
    AuthModule,
    InstructorsModule,
    LearnersModule,
    CoursesModule,
    CourseProvidersModule,
    LeadsModule,
  ],
})
export class AppModule {}