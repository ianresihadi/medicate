import {
  IsIn,
  IsEmail,
  IsString,
  MaxLength,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { GenderEnum } from "@common/enums/gender.enum";

export default class ChangeProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn(Object.values(GenderEnum).map((gender) => gender.toLowerCase()))
  gender: GenderEnum;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identity_card_number: string;

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
}
