// common/dto/admin-query.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class AdminQueryDto {
  @IsOptional()
  page = 1;

  @IsOptional()
  limit = 20;

  @IsOptional()
  sortBy = 'createdAt';

  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  search?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  // ✅ ADD THIS
  @IsOptional()
  @IsString()
  providerId?: string;

  // Course Provider specific
  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;
  
}