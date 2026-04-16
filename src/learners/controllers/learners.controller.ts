// learners/learners.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
// import { LearnersService } from ".services/learners.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";
import { Roles } from "src/auth/roles.decorator";
import { LearnersService } from "../services/learners.service";
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { RefundRequestQueryDto } from "../dto/refund.dto";

@Controller("learners")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearnersController {
  constructor(private readonly service: LearnersService) { }

  // learners/learners.controller.ts
  // learners.controller.ts
  @Get()
  @UseGuards(JwtAuthGuard)
  getAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search?: string,
    @Query("status") status?: "active" | "inactive",
  ) {
    return this.service.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });
  }



  @UseGuards(JwtAuthGuard)
  @Roles("ADMIN")
  @Delete(":id")
  softDelete(@Param("id") id: string) {
    return this.service.softDelete(id);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body("isActive") isActive: boolean,
  ) {
    return this.service.updateStatus(id, isActive);

  }

  // ✅ 1. Profile
  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.service.getProfile(id);
  }

  // ✅ 2. Orders
  @Get(':id/orders')
  getOrders(
    @Param('id') id: string,
    @Query() query: AdminQueryDto,
  ) {
    return this.service.getOrders(id, query);
  }

  // ✅ 3. Stats
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }

  // ✅ 4. Wallet Transactions
  @Get(':id/wallet')
  getWallet(
    @Param('id') id: string,
    @Query() query: AdminQueryDto,
  ) {
    return this.service.getWalletTransactions(id, query);
  }

  // ✅ 5. Reviews
  @Get(':id/reviews')
  getReviews(
    @Param('id') id: string,
    @Query() query: AdminQueryDto,
  ) {
    return this.service.getReviews(id, query);
  }

  // ✅ 6. Feedbacks
  @Get(':id/feedbacks')
  getFeedbacks(
    @Param('id') id: string,
    @Query() query: AdminQueryDto,
  ) {
    return this.service.getFeedbacks(id, query);
  }

  // ✅ 7. Refund Approve
  @Post('/refund/:id/approve')
  getRefundApprove(
    @Param('id') id: string,
  ) {
    return this.service.approveRefund(id);
  }
  // ✅ 8. Refund Reject
  @Post('/refund/:id/reject')
  getRefundReject(
    @Param('id') id: string,
  ) {
    return this.service.rejectRefund(id);
  }

  @Get('refund-requests')
  async getRefundRequests(@Query() dto: RefundRequestQueryDto) {
    return this.service.getRefundRequests(dto);
  }

}
