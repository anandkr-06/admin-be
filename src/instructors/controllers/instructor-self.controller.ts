import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InstructorsService } from '../services/instructors.service';
import {
  UpdateInstructorAdditionalInformationDto,
  UpdateInstructorDocumentsDto,
  UpdateInstructorPrivateVehicleDto,
  UpdateInstructorProfileDto,
  UpdateInstructorServiceAreasDto,
  UpdateInstructorTestLocationsDto,
  UpdateInstructorVehicleDto,
} from '../dto/update-instructor-self.dto';

@Controller('instructor')
@UseGuards(JwtAuthGuard)
export class InstructorSelfController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Patch('documents')
  updateDocuments(@Req() req: any, @Body() dto: UpdateInstructorDocumentsDto) {
    return this.instructorsService.updateInstructorDocuments(
      req.user.userId,
      dto,
    );
  }

  @Patch('service-areas')
  updateServiceAreas(
    @Req() req: any,
    @Body() dto: UpdateInstructorServiceAreasDto,
  ) {
    return this.instructorsService.updateInstructorServiceAreas(
      req.user.userId,
      dto,
    );
  }

  @Patch('test-locations')
  updateTestLocations(
    @Req() req: any,
    @Body() dto: UpdateInstructorTestLocationsDto,
  ) {
    return this.instructorsService.updateInstructorTestLocations(
      req.user.userId,
      dto,
    );
  }

  @Patch('vehicle/private')
  updatePrivateVehicle(
    @Req() req: any,
    @Body() dto: UpdateInstructorPrivateVehicleDto,
  ) {
    return this.instructorsService.updateInstructorPrivateVehicle(
      req.user.userId,
      dto,
    );
  }

  @Patch('vehicle/auto')
  updateAutoVehicle(@Req() req: any, @Body() dto: UpdateInstructorVehicleDto) {
    return this.instructorsService.updateInstructorVehicle(
      req.user.userId,
      'auto',
      dto,
    );
  }

  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateInstructorProfileDto) {
    return this.instructorsService.updateInstructorProfile(
      req.user.userId,
      dto,
    );
  }

  @Patch('additional-information')
  updateAdditionalInformation(
    @Req() req: any,
    @Body() dto: UpdateInstructorAdditionalInformationDto,
  ) {
    return this.instructorsService.updateInstructorAdditionalInformation(
      req.user.userId,
      dto,
    );
  }
}
