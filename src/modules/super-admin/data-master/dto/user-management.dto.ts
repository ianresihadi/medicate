import { EStatusData } from "@common/enums/general.enum";
import { RoleEnum } from "@common/enums/role.enum";
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsIn(Object.values(RoleEnum).map((obj) => obj.toLowerCase()))
  role: RoleEnum;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

export class UpdateAccountDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsNotEmpty()
  @IsIn(Object.values(RoleEnum).map((obj) => obj.toLowerCase()))
  role: RoleEnum;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
