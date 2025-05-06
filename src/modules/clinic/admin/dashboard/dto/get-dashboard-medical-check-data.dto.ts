import { EOrderStatus } from "@common/enums/general.enum";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class GetDashboardMedicalDataDto {
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
  search?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  // @IsEnum(EOrderStatus)
  // @Transform(({ value }) => String(value).trim())
  @IsString()
  @Transform(({ value }) => value.trim())
  status?: string;

  @IsOptional()
  @IsUUID()
  medicalPackageId?: string;

  @IsOptional()
  @IsUUID()
  certificateTypeId?: string;

  @IsOptional()
  @IsString()
  isBackdate?: string;

  @IsOptional()
  // @IsUUID()
  @IsString()
  @Transform(({ value }) => value.trim())
  paymentMethodId?: string;
}
