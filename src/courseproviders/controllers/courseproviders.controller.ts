// courseproviders/courseproviders.controller.ts
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CourseProvidersService } from '../services/courseproviders.service';
import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateProviderStatusDto } from '../dto/update-status.dto';

@Controller('admin/course-providers')
export class CourseProvidersController {
  constructor(private readonly service: CourseProvidersService) { }

  @Get()
  getProviders(@Query() dto: AdminQueryDto) {
    return this.service.getProviders(dto);
  }

  // ✅ OPTION 1: Single endpoint (recommended)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProviderStatusDto,
  ) {
    return this.service.updateStatus(id, dto.isActive);
  }

  // ✅ OPTION 2: Separate endpoints (optional)
  @Roles('ADMIN')
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.service.updateStatus(id, true);
  }

  @Roles('ADMIN')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.service.updateStatus(id, false);
  }
}