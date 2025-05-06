import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUrl } from "class-validator";

export class SendMCUCertificateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toName: string;

  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  certificateUri: string;
}