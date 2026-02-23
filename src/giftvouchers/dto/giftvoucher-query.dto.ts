import { AdminQueryDto } from 'src/common/dto/admin-query.dto';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GiftVoucherQueryDto extends AdminQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumberString()
  minAmount?: string;

  @IsOptional()
  @IsNumberString()
  maxAmount?: string;

  @IsOptional()
  @IsString()
  expiresFrom?: string;

  @IsOptional()
  @IsString()
  expiresTo?: string;
}