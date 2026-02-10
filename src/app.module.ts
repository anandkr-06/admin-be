import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { InstructorsModule } from './instructors/instructors.module';
import { LearnersModule } from './learners/learners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env", }), // ✅ Loads .env globally
    MongooseModule.forRoot(process.env.DATABASE_URL!, {
      autoCreate: true,
    }),
    AuthModule,
    InstructorsModule,
    LearnersModule,
  ],
})
export class AppModule {}