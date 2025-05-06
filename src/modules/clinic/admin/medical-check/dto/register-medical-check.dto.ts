import { IsUUID, IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { Transform } from "class-transformer";
import * as moment from "moment-timezone";

export class RegisterMedicalCheckDto {
  @IsNotEmpty()
  @IsUUID()
  patient_id: string;

  @IsNotEmpty()
  @IsUUID()
  package_medical_check_id: string;

  @IsNotEmpty()
  @IsString()
  travel_destination: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD");
  })
  date: string;

  @IsOptional()
  @Transform(({ value }) => {
    return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD");
  })
  order_date: string;

  @IsNotEmpty()
  @IsUUID()
  payment_method_id: string;

  @IsNotEmpty()
  @IsUUID()
  certificate_type_id: string;

  @IsOptional()
  @IsUUID()
  attachmentIdentityCard?: string;

  @IsOptional()
  @IsUUID()
  attachmentPassport?: string;

  @IsOptional()
  @IsUUID()
  attachmentAdditionalDocument?: string;

  @IsNotEmpty()
  @IsUUID()
  attachmentPhotoApplicant: string;

  @IsOptional()
  @IsBoolean()
  isBackDate: boolean
}

export class ChangeStatusMCURequest {
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class ValidateOrderRequest {
  @IsNotEmpty()
  @IsString()
  orderCode: string;
}
