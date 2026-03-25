import {
  Controller,
  Get,
  Query,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { AdminReviewService } from '../services/admin-review.service';
import { QueryReviewDto } from '../dto/query-review.dto';
import { UpdateReviewStatusDto } from '../dto/update-review-status.dto';

@Controller('admin/reviews')
export class AdminReviewController {
  constructor(private readonly reviewService: AdminReviewService) {}

  // ✅ LIST REVIEWS (WITH PAGINATION + FILTER)
  @Get()
  async getReviews(@Query() query: QueryReviewDto) {
    return this.reviewService.getReviews(query);
  }

  // ✅ UPDATE STATUS
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateStatus(id, dto);
  }
}