import { PartialType } from '@nestjs/mapped-types';
import { CreateSuburbDto } from './create-suburb.dto';

export class UpdateSuburbDto extends PartialType(
  CreateSuburbDto,
) {}