import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class InstructorDocumentDto {
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  attachment?: string | null;
}

export class UpdateInstructorDocumentsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorDocumentDto)
  vehicleInspectionCertificate?: InstructorDocumentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorDocumentDto)
  industryAuthorityCard?: InstructorDocumentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorDocumentDto)
  certificateOfCurrency?: InstructorDocumentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorDocumentDto)
  vehicleRegistration?: InstructorDocumentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorDocumentDto)
  driverLicence?: InstructorDocumentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorDocumentDto)
  blueCard?: InstructorDocumentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorDocumentDto)
  certificateIvMotorVehicleTraining?: InstructorDocumentDto;
}

class ServiceAreaDto {
  @IsString()
  suburb!: string;

  @IsOptional()
  @IsString()
  postcode?: string;

  @IsOptional()
  @IsNumber()
  radiusKm?: number;

  @IsOptional()
  @IsString()
  suburbId?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  long?: number;

  @IsOptional()
  @IsString()
  state?: string;
}

export class UpdateInstructorServiceAreasDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAreaDto)
  serviceAreas!: ServiceAreaDto[];
}

class TestLocationDto {
  @IsString()
  suburb!: string;

  @IsOptional()
  @IsString()
  postCode?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateInstructorTestLocationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestLocationDto)
  testLocations!: TestLocationDto[];
}

export class UpdateInstructorPrivateVehicleDto {
  @IsOptional()
  @IsNumber()
  autoPricePerHour?: number;

  @IsOptional()
  @IsNumber()
  autoTestPricePerHour?: number;

  @IsOptional()
  @IsNumber()
  manualPricePerHour?: number;

  @IsOptional()
  @IsNumber()
  manualTestPricePerHour?: number;
}

export class UpdateInstructorVehicleDto {
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  licenceCategory?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  transmissionType?: string;

  @IsOptional()
  @IsNumber()
  ancapSafetyRating?: number;

  @IsOptional()
  @IsBoolean()
  hasDualControls?: boolean;

  @IsOptional()
  @IsNumber()
  pricePerHour?: number;

  @IsOptional()
  @IsNumber()
  testPricePerHour?: number;
}

export class UpdateInstructorProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  postCode?: string;

  @IsOptional()
  @IsString()
  transmissionType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proficientLanguages?: string[];
}

export class UpdateInstructorAdditionalInformationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesKnown?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  proficientLanguages?: string[];

  @IsOptional()
  @IsNumber()
  instructorExperienceYears?: number;

  @IsOptional()
  @IsBoolean()
  isMemberOfDrivingAssociation?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  drivingAssociations?: string[];
}

export class UpdateInstructorPasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword?: string;
}
