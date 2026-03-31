// learners/learners.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
// import { Learner, LearnerSchema } from "../schema/learner.schema";
// import { LearnersService } from "./learners.service";
// import { LearnersController } from "./learners.controller";
import { Learner, LearnerSchema } from "./schema/learner.schema";
import { LearnersService } from "./services/learners.service";
import { LearnersController } from "./controllers/learners.controller";
import { Order, OrderSchema } from "src/instructors/schemas/orders.schema";
import { WalletTransaction, WalletTransactionSchema } from "src/instructors/schemas/wallet-transactions.schema";
import { InstructorReview, InstructorReviewSchema } from "src/instructors/schemas/instructor-reviews.schema";
import { Feedback, FeedbackSchema } from "src/feedbacks/schema/feedbacks.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Learner.name, schema: LearnerSchema },
      { name: Order.name, schema: OrderSchema }, // ✅ ADD THIS
      { name: WalletTransaction.name, schema: WalletTransactionSchema
       },
      { name: InstructorReview.name, schema: InstructorReviewSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  providers: [LearnersService],
  controllers: [LearnersController],
})
export class LearnersModule {}
