import {
  IsIn,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { GenderEnum } from "@common/enums/gender.enum";
import * as moment from "moment-timezone";
import { Transform } from "class-transformer";

export default class SignupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(Object.values(GenderEnum).map((gender) => gender.toLowerCase()))
  gender: GenderEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  identity_card_number: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    return moment(value).tz("Asia/Jakarta").format("YYYY-MM-DD");
  })
  birth_date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  domicile_city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  job: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(14)
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
