import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateConsulateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
