import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { EOrderStatus } from "@common/enums/general.enum";

export class GetMcuOrderTrackingDto {
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
  clinicId?: string;

  @IsOptional()
  @IsIn([0,1])
  @IsNumber()
  @Transform(({ value }) => Number(value))
  isMcuOrderReconciliation?: number = 0;

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
  @IsString()
  isBackdate?: string;

  @IsOptional()
  @IsUUID()
  certificateTypeId?: string;

  @IsOptional()
  // @IsUUID()
  @IsString()
  @Transform(({ value }) => value.trim())
  paymentMethodId?: string;
}
