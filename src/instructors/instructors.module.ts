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
  
  
  @Module({
    imports: [
      MongooseModule.forFeature([
        { name: User.name, schema: InstructorSchema },
        {name: Order.name, schema: OrderSchema},
        {name: PrivateLearner.name, schema: PrivateLearnerSchema}, 
        {name: PrivateOrder.name, schema:PrivateOrderSchema},
        {name:InstructorProfile.name, schema:InstructorProfileSchema}

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

 