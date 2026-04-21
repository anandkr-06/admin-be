import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Query, Req, UseGuards } from "@nestjs/common";
import { InstructorsService } from "../services/instructors.service";
import { AdminInstructorsService } from "../services/admin-instructors.service";
import { AuthGuard } from "@nestjs/passport";
import { Patch, Param } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Types } from "mongoose";
import { UpdateVehiclesDto } from "../dto/update-vehicles.dto";
import { AdminQueryDto } from "src/common/dto/admin-query.dto";

@Controller("instructors")
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService,
              private readonly adminInstructorsService: AdminInstructorsService
              
  ) {}


  @Roles("ADMIN")
  @Patch(":id/activate")
  activate(@Param("id") id: string) {
    return this.instructorsService.setActive(id, true);
  }

  @Roles("ADMIN")
  @Patch(":id/deactivate")
  deactivate(@Param("id") id: string) {
    return this.instructorsService.setActive(id, false);
  }

@Get()
  findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("search") search = "",
    @Query("status") status?: string,
    @Query("role") role?: string,
  ) {
    return this.instructorsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      role,
    });
  }


// 1️⃣ Profile
@Get(":id/profile")
getProfile(@Param("id") id: string) {
  return this.instructorsService.getProfile(id);
}

// 2️⃣ Orders
@Get(":id/orders")
getOrders(
  @Param("id") id: string,
  @Query("page") page = "1",
  @Query("limit") limit = "10",
  @Query("status") status?: string,
  @Query("search") search?: string
) {
  return this.instructorsService.getOrders({
    instructorId: id,
    page: +page,
    limit: +limit,
    status,
    search,
  });
}

@Get(":id/private-orders")
getPrivaterOrders(
  @Param("id") id: string,
  @Query("page") page = "1",
  @Query("limit") limit = "10",
  @Query("status") status?: string,
  @Query("search") search?: string
) {
  return this.instructorsService.getPrivateOrders({
    instructorId: id,
    page: +page,
    limit: +limit,
    status,
    search,
  });
}

// 3️⃣ Private Learners
@Get(":id/private-learners")
getPrivateLearners(
  @Param("id") id: string,
  @Query("page") page = "1",
  @Query("limit") limit = "10",
  @Query("search") search?: string,
  @Query("status") status?: string
) {
  return this.instructorsService.getPrivateLearners({
    instructorId: id,
    page: +page,
    limit: +limit,
    search,
    status,
  });
}

// 4️⃣ Activate / Deactivate
@Patch(":id/status")
updateStatus(
  @Param("id") id: string,
  @Body("isActive") isActive: boolean
) {
  return this.instructorsService.updateStatus(id, isActive);
}

// 5️⃣ Soft delete
@Delete(":id")
softDelete(@Param("id") id: string) {
  return this.instructorsService.softDelete(id);
}

@Get(':id/stats')
  async getInstructorStats(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid instructor id');
    }

    return this.adminInstructorsService.getInstructorStats(
      new Types.ObjectId(id),
    );
  }

  // @Roles("ADMIN")
@Patch(":id/vehicles")
updateVehicles(
  @Param("id") id: string,
  @Body() dto: UpdateVehiclesDto,
) {
  if (!dto.vehicles.length) {
    throw new BadRequestException('At least one vehicle is required');
  }
  if (dto.vehicles.length > 2) {
    throw new BadRequestException('Only auto and manual allowed');
  }

  return this.instructorsService.updateVehicles(id, dto);
}

@Get(':id/wallet')
getInstructorWallet(
  @Param('id') id: string,
  @Query() query: AdminQueryDto,
) {
  return this.instructorsService.getWalletTransactions(
    'userId',
    id,
    query,
  );
}

@Get('admin/no-show-requests')
async getAllNoShowRequests(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('status') status?: string,
  @Query('requestedBy') requestedBy?: string,
  @Query('search') search?: string,
  @Query('sortBy') sortBy: string = 'createdAt',
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.instructorsService.getAllNoShowRequests({
    page: Number(page),
    limit: Number(limit),
    status,
    requestedBy,
    search,
    sortBy,
    sortOrder,
    startDate,
    endDate,
  });
}


 /* ===============================
     ✅ APPROVE
  =============================== */
  @Patch('no-show-requests/:id/approve')
  
  async approveNoShow(
    @Param('id') noShowRequestId: string,
    // @CurrentUser() user: JwtPayload,
    @Body() body: { decision: 'PAY_INSTRUCTOR' | 'REFUND_LEARNER';
      remarks: string}
    //@Body('decision')
    // decision: 'PAY_INSTRUCTOR' | 'REFUND_LEARNER',
  ) {
    if (!body.decision) {
      throw new BadRequestException('Decision is required');
    }

    if (
      body.decision !== 'PAY_INSTRUCTOR' &&
      body.decision !== 'REFUND_LEARNER'
    ) {
      throw new BadRequestException('Invalid decision');
    }

    return this.instructorsService.approveNoShowSlot(
      noShowRequestId,
      // user.sub,
      "69e132dcf5d95497780e164c",
      body.decision,
      body.remarks,
    );
  }

  /* ===============================
     ❌ REJECT
  =============================== */
  @Patch('no-show-requests/:id/reject')
  async rejectNoShow(
    @Param('id') noShowRequestId: string,
    // @CurrentUser() user: JwtPayload,
    @Body('remark') remark: string,
  ) {
    if (!remark) {
      throw new BadRequestException('Remark is required');
    }

    return this.instructorsService.rejectNoShowSlot(
      noShowRequestId,
      // user.sub,
      '69e132dcf5d95497780e164c',
      remark,
    );
  }

}
