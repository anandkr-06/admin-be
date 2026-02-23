// courseproviders/courseproviders.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CourseProvidersService } from '../services/courseproviders.service';
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';

@Controller('admin/course-providers')
export class CourseProvidersController {
  constructor(private readonly service: CourseProvidersService) {}

  @Get()
  getProviders(@Query() dto: AdminQueryDto) {
    return this.service.getProviders(dto);
  }
}