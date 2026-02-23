// leads/leads.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LeadsService } from '../services/leads.service';
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';

@Controller('admin/leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  @Get()
  getLeads(@Query() dto: AdminQueryDto) {
    return this.service.getLeads(dto);
  }
}