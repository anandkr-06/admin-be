// learners/learners.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
// import { Learner, LearnerSchema } from "../schema/learner.schema";
// import { LearnersService } from "./learners.service";
// import { LearnersController } from "./learners.controller";
import { Learner, LearnerSchema } from "./schema/learner.schema";
import { LearnersService } from "./services/learners.service";
import { LearnersController } from "./controllers/learners.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Learner.name, schema: LearnerSchema },
    ]),
  ],
  providers: [LearnersService],
  controllers: [LearnersController],
})
export class LearnersModule {}
