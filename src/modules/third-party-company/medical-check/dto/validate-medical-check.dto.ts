import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class ValidateMedicalCheckDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

export class ValidateCertificateDto {
  @IsNotEmpty()
  @IsString()
  certificateNumber: string;
}
