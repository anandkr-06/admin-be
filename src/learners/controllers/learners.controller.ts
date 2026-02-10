// learners/learners.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
// import { LearnersService } from ".services/learners.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";
import { Roles } from "src/auth/roles.decorator";
import { LearnersService } from "../services/learners.service";

@Controller("learners")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearnersController {
  constructor(private readonly learnersService: LearnersService) { }

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
  return this.learnersService.findAll({
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
  return this.learnersService.softDelete(id);
}

// @Patch(":id/status")
// updateStatus(
//   @Param("id") id: string,
//   @Body("isActive") isActive: boolean,
// ) {
//   return this.learnersService.findByIdAndUpdate(
//     id,
//     { isActive },
//     { new: true },
//   );
// }


}
