// feedbacks/feedbacks.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { FeedbacksService } from '../services/feedbacks.service'
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';

@Controller('admin/feedbacks')
export class FeedbacksController {
  constructor(private readonly service: FeedbacksService) {}

  @Get()
  getFeedbacks(@Query() dto: AdminQueryDto) {
    return this.service.getFeedbacks(dto);
  }
}