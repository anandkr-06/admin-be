import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestLocationsController } from './controllers/testlocations.controller';
import {
  TestLocation,
  TestLocationSchema,
} from './schemas/testlocation.schema';
import { TestLocationsService } from './services/testlocations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestLocation.name, schema: TestLocationSchema },
    ]),
  ],
  controllers: [TestLocationsController],
  providers: [TestLocationsService],
})
export class TestLocationsModule {}
