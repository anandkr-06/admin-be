// feedbacks/feedbacks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbacksController } from '../feedbacks/controllers/feedbacks.controller'
import { FeedbacksService } from '../feedbacks/services/feedbacks.service'
import { Feedback, FeedbackSchema } from '../feedbacks/schema/feedbacks.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  controllers: [FeedbacksController],
  providers: [FeedbacksService],
})
export class FeedbacksModule {}