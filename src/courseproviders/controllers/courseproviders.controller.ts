import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CourseProvidersService } from '../services/courseproviders.service';
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateProviderStatusDto } from '../dto/update-status.dto';
import { CoursesService } from 'src/course/services/course.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Types } from 'mongoose';

@Controller('admin/course-providers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseProvidersController {
  constructor(
    private readonly courseProvidersService: CourseProvidersService,
    private readonly coursesService: CoursesService,
  ) {}

  private validateObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
  }

  @Get()
  getProviders(@Query() dto: AdminQueryDto) {
    return this.courseProvidersService.getProviders(dto);
  }

  // ✅ Single clean endpoint
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProviderStatusDto,
  ) {
    this.validateObjectId(id);
    return this.courseProvidersService.updateStatus(id, dto.isActive);
  }

  // ✅ Profile
  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    this.validateObjectId(id);
    return this.courseProvidersService.getProfile(id);
  }

  // ✅ Courses
  @Get(':id/courses')
  getCourses(
    @Param('id') id: string,
    @Query() query: AdminQueryDto,
  ) {
    this.validateObjectId(id);

    return this.coursesService.getCourses({
      ...query,
      providerId: id,
    });
  }
}