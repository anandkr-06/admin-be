  import { Module } from "@nestjs/common";
  
  
  import { MongooseModule } from "@nestjs/mongoose";
  
  import { JwtModule } from "@nestjs/jwt";
import { User, InstructorSchema } from "./schemas/instructor.schema";
import { InstructorsController } from "./controllers/instructors.controller";
import { InstructorsService } from "./services/instructors.service";
import { PrivateLearner, PrivateLearnerSchema } from "./schemas/private-learner.schema";
import { PrivateOrder, PrivateOrderSchema } from "./schemas/private-order.schema";
import { Order, OrderSchema } from "./schemas/orders.schema";
import { InstructorProfile, InstructorProfileSchema } from "./schemas/instructro-profiles.schema";
import { AdminInstructorsService } from "./services/admin-instructors.service";
import { WalletTransaction, WalletTransactionSchema } from "./schemas/wallet-transactions.schema";
import { NoShowRequest, NoShowRequestSchema } from "./schemas/no-show-request.schema";
import { Learner, LearnerSchema } from "src/learners/schema/learner.schema";
import { InstructorTransaction, InstructorTransactionSchema } from "./schemas/instructor-transactions.schema";

  
  @Module({
    imports: [
      MongooseModule.forFeature([
        { name: User.name, schema: InstructorSchema },
        {name: Order.name, schema: OrderSchema},
        {name: PrivateLearner.name, schema: PrivateLearnerSchema}, 
        {name: PrivateOrder.name, schema:PrivateOrderSchema},
        {name:InstructorProfile.name, schema:InstructorProfileSchema},
        { name: WalletTransaction.name, schema: WalletTransactionSchema
               },
               {name:NoShowRequest.name,schema:NoShowRequestSchema},
               {name:Learner.name,schema:LearnerSchema},
               {name:InstructorTransaction.name, schema:InstructorTransactionSchema}


      ]),
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "1h" },
      }),
    ],
    controllers: [InstructorsController],
    providers: [InstructorsService, AdminInstructorsService],
  })
  export class InstructorsModule {}

 