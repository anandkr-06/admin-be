import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSuburbDto {
  @IsString()
  postcode!: string;

  @IsString()
  name!: string;
  @IsOptional()
  locality!: string;
  @IsString()
  state!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  long!: number;

  @IsOptional()
  isActive?: boolean | string;

  @IsOptional()
  geometry?: {
    type: string;
    coordinates: number[][][];
  };
}
