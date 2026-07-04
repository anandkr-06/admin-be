// feedbacks/feedbacks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuburbSchema } from '../suburbs/schemas/suburb.schema';
import { PublicSuburbController } from './controllers/public-suburbs.controller';
import { SuburbController } from './controllers/suburbs.controller';
import { SuburbService } from './services/suburbs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Suburb', schema: SuburbSchema }]),
  ],
  controllers: [SuburbController, PublicSuburbController],
  providers: [SuburbService],
})
export class SuburbsModule {}
