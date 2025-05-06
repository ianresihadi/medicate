import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class GetDashboardDataDto {  
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  page = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  limit = 10;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  isBackdate?: string;

  @IsOptional()
  @IsUUID()
  medicalPackageId?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;
}
