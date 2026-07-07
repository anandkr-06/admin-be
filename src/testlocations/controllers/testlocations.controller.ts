import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SearchPaginationDto } from 'src/suburbs/dto/pagination.dto';
import {
  CreateTestLocationDto,
  UpdateTestLocationDto,
} from '../dto/testlocation.dto';
import { TestLocationsService } from '../services/testlocations.service';

@Controller('api/testlocation/v1')
export class TestLocationsController {
  constructor(private readonly testLocationsService: TestLocationsService) {}

  @Get('get_test_locations')
  getTestLocations(@Query() query: SearchPaginationDto) {
    return this.testLocationsService.getTestLocations(query);
  }

  @Post('add_test_location')
  addTestLocation(@Body() dto: CreateTestLocationDto) {
    return this.testLocationsService.createTestLocation(dto);
  }

  @Patch('update_test_location/:id')
  updateTestLocation(
    @Param('id') id: string,
    @Body() dto: UpdateTestLocationDto,
  ) {
    return this.testLocationsService.updateTestLocation(id, dto);
  }
}
