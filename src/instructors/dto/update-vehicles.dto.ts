import {
    IsArray,
    ValidateNested,
    IsEnum,
    IsString,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class VehicleDto {
    @IsEnum(['auto', 'manual'])
    type: 'auto' | 'manual';
  
    @IsString()
    image: string;
  }
  
  export class UpdateVehiclesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VehicleDto)
    vehicles: VehicleDto[];
  }