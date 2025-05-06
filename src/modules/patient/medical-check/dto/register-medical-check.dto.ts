import { IsUUID, IsString, IsOptional, IsNotEmpty } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import * as moment from "moment-timezone";

export class RegisterMedicalCheckDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  clinic_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  package_medical_check_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  travel_destination: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD");
  })
  date: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  identity_card?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  passport?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => String)
  additional_document?: string;
}
