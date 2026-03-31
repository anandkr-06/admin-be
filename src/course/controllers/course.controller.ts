import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";

import { CoursesService } from "../services/course.service"
import { AdminQueryDto } from "src/common/dto/admin-query.dto";
import { UpdateCourseStatusDto } from "../dto/update-course-status.dto";

@Controller("courses")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly service: CoursesService) { }

@Get()
@UseGuards(JwtAuthGuard)
getCourses(@Query() query: AdminQueryDto) {
  return this.service.getCourses(query);
}



@Patch(':id/status')
updateCourseStatus(
  @Param('id') id: string,
  @Body() dto: UpdateCourseStatusDto,
) {
  return this.service.updateCourseStatus(id, dto.status);
}

 // ✅ 1. Course Details
  @Get(':id')
  getCourseDetails(@Param('id') id: string) {
    return this.service.getCourseDetails(id);
  }

  // ✅ 2. Course Leads
  @Get(':id/leads')
  getLeads(
    @Param('id') id: string,
    @Query() query: AdminQueryDto,
  ) {
    return this.service.getLeads(id, query);
  }

}
