import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryReviewDto {
  @IsOptional()
  @IsString()
  status?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}