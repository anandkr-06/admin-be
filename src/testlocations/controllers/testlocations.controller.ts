import { Controller, Get, Query } from '@nestjs/common';
import { SearchPaginationDto } from 'src/suburbs/dto/pagination.dto';
import { TestLocationsService } from '../services/testlocations.service';

@Controller('api/testlocation/v1')
export class TestLocationsController {
  constructor(private readonly testLocationsService: TestLocationsService) {}

  @Get('get_test_locations')
  getTestLocations(@Query() query: SearchPaginationDto) {
    return this.testLocationsService.getTestLocations(query);
  }
}
