import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
  IsNotEmptyObject,
  IsOptional,
  IsNumber,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class Account {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(80)
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  phone_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirm_password: string;
}

class ClinicAccounts {
  @ApiProperty()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Account)
  admin: Account;

  @ApiProperty()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Account)
  admin_lab: Account;
}

export class CreateClinicDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  provinceId: number;

  @IsNotEmpty()
  @IsNumber()
  regencyId: number;

  @MinLength(9)
  @MaxLength(13)
  @IsString()
  phoneNumber: string;

  // @IsNotEmpty()
  @IsOptional()
  @IsString()
  picName: string;

  // @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  picSignature: string;

  // @IsNotEmpty()
  @IsOptional()
  @IsString()
  examiningDoctor: string;

  @IsOptional()
  @IsString()
  clinicCode: string;

  // @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  examiningDoctorSignature: string;
}

export class UpdateClinicDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  provinceId: number;

  @IsNotEmpty()
  @IsNumber()
  regencyId: number;

  @MinLength(9)
  @MaxLength(13)
  @IsString()
  phoneNumber: string;

  // @IsNotEmpty()
  @IsOptional()
  @IsString()
  picName: string;

  @IsOptional()
  @IsUUID()
  picSignature: string;

  @IsNotEmpty()
  @IsString()
  examiningDoctor: string;

  @IsOptional()
  @IsString()
  clinicCode: string;

  @IsOptional()
  @IsUUID()
  examiningDoctorSignature: string;
}
