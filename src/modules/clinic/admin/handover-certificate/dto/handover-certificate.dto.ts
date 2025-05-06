import {
  IsUUID,
  IsNotEmpty,
} from "class-validator";

export class HandoverCertificateDto {
  @IsNotEmpty()
  @IsUUID()
  attachmentPhoto: string;

  @IsNotEmpty()
  @IsUUID()
  ecertificate: string;
}
