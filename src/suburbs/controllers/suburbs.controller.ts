import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuburbService } from '../services/suburbs.service';
import { CreateSuburbDto } from '../dto/create-suburb.dto';
import { UpdateSuburbDto } from '../dto/update-suburb.dto';
import { SearchPaginationDto } from '../dto/pagination.dto'; 
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/suburbs')
export class SuburbController {
  constructor(private readonly suburbService: SuburbService) {}

  @Get()
  getAll(@Query() query: SearchPaginationDto) {
    return this.suburbService.getAllSuburbs(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.suburbService.getSuburbById(id);
  }
// @UseGuards(JwtAuthGuard)
// @Roles("ADMIN")
  @Post()
  create(@Body() payload: CreateSuburbDto) {
    return this.suburbService.createSuburb(payload);
  }
@UseGuards(JwtAuthGuard)
  @Roles("ADMIN")
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateSuburbDto,
  ) {
    return this.suburbService.updateSuburb(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.suburbService.deleteSuburb(id);
  }

  @Get('boundaries-ui')
  getBoundaries(@Query('names') names: string) {
    return this.suburbService.getAllSuburbsCoordinates(names);
  }
}