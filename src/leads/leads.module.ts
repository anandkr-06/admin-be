// leads/leads.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadsController } from '../leads/controllers/leads.controller';
import { LeadsService } from '../leads/services/leads.service';
import { Lead, LeadSchema } from '../leads/schema/leads.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}