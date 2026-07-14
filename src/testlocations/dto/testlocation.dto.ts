import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateTestLocationDto {
  @IsString()
  state!: string;

  @IsString()
  location!: string;

  @IsString()
  address!: string;

  @IsString()
  suburb!: string;

  @ValidateIf((_, value) => value !== undefined)
  postCode!: string | number;

  @IsOptional()
  isActive?: boolean | string;
}

export class UpdateTestLocationDto {
  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  suburb?: string;

  @IsOptional()
  postCode?: string | number;

  @IsOptional()
  isActive?: boolean | string;
}
