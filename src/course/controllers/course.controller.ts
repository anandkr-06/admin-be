import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";

import { CoursesService } from "../services/course.service"
import { AdminQueryDto } from "src/common/dto/admin-query.dto";

@Controller("courses")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

@Get()
@UseGuards(JwtAuthGuard)
getCourses(@Query() query: AdminQueryDto) {
  return this.coursesService.getCourses(query);
}
}
