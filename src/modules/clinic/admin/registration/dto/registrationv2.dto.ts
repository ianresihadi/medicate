import { GenderEnum } from "@common/enums/gender.enum";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import * as moment from "moment-timezone";

export default class CreatePatientDtoV2 {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsNotEmpty()
  @IsIn(Object.values(GenderEnum).map((gender) => gender.toLowerCase()))
  gender: GenderEnum;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  @MinLength(16)
  identity_card_number: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD");
  })
  birth_date: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  provinceId: number;

  @IsNotEmpty()
  @IsNumber()
  regencyId: number;

  @IsOptional()
  @IsString()
  job: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(14)
  phone_number: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  agentName?: string

  @IsOptional()
  @IsString()
  agentAddress?: string

  @IsOptional()
  @MaxLength(14)
  @IsString()
  agentPhoneNumber?: string

  @IsOptional()
  @IsEmail()
  @IsString()
  agentEmail?: string
}

export class ConnectPatientClinic {
  @IsString()
  @IsNotEmpty()
  patientId: string;
}
