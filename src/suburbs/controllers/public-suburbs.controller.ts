import { Controller, Get, Query } from '@nestjs/common';
import { SearchPaginationDto } from '../dto/pagination.dto';
import { SuburbService } from '../services/suburbs.service';

@Controller('api/suburbs/v1')
export class PublicSuburbController {
  constructor(private readonly suburbService: SuburbService) {}

  @Get('get_available_suburbs')
  getAvailableSuburbs(@Query() query: SearchPaginationDto) {
    return this.suburbService.getAvailableSuburbs(query);
  }
}
