import { IsNotEmpty, IsString } from "class-validator";

export class ValidateCertificateDto {
  @IsNotEmpty()
  @IsString()
  certificateId: string;
}
