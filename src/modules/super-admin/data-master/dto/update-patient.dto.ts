import { GenderEnum } from "@common/enums/gender.enum";
import { encrypt } from "@common/helper/aes";
import {
  hashString,
  splitFullName,
} from "@common/helper/string-convertion.helper";
import { Patient } from "@entities/patient.entity";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  identityCardNumber?: string;

  @IsOptional()
  @IsNumber()
  provinceId?: number;

  @IsOptional()
  @IsNumber()
  regencyId?: number;

  @IsOptional()
  @IsString()
  job?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  birthDate?: Date;

  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  intoPatient(): Patient {
    const patient = new Patient();
    patient.firstName = splitFullName(this.fullName).firstname;
    patient.lastName = splitFullName(this.fullName).lastname;
    patient.email = this.email;
    patient.identityCardNumber = encrypt(this.identityCardNumber);
    patient.identityCardNumberDisplay = hashString(this.identityCardNumber);
    patient.provinceId = this.provinceId;
    patient.regencyId = this.regencyId;
    patient.job = this.job;
    patient.birthDate = this.birthDate;
    patient.gender = GenderEnum[this.gender.toUpperCase()];
    patient.phoneNumber = encrypt(this.phoneNumber);
    patient.phoneNumberDisplay = hashString(this.phoneNumber);
    patient.address = this.address;
    return patient;
  }
}
