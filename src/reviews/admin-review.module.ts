  import { Module } from "@nestjs/common";
  
  
  import { MongooseModule } from "@nestjs/mongoose";
  
import { JwtModule } from "@nestjs/jwt";
import { InstructorReview, InstructorReviewSchema } from "../reviews/schemas/instructor-review";
import { AdminReviewController } from "./controllers/admin-review.controller";
// import { InstructorsService } from "./services/instructors.service";
// import { PrivateLearner, PrivateLearnerSchema } from "./schemas/private-learner.schema";
// import { PrivateOrder, PrivateOrderSchema } from "./schemas/private-order.schema";
// import { Order, OrderSchema } from "./schemas/orders.schema";
// import { InstructorProfile, InstructorProfileSchema } from "./schemas/instructro-profiles.schema";
import { AdminReviewService } from "./services/admin-review.service";
  
  
  @Module({
    imports: [
      MongooseModule.forFeature([
        { name: InstructorReview.name, schema: InstructorReviewSchema },
        // {name: Order.name, schema: OrderSchema},
        // {name: PrivateLearner.name, schema: PrivateLearnerSchema}, 
        // {name: PrivateOrder.name, schema:PrivateOrderSchema},
        // {name:InstructorProfile.name, schema:InstructorProfileSchema}

      ]),
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "1h" },
      }),
    ],
    controllers: [AdminReviewController],
    providers: [AdminReviewService],
  })
  export class InstructorsReviewModule {}

 