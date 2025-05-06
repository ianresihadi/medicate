import { RoleEnum } from "@common/enums/role.enum";
import { Account } from "@entities/account.entity";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from "class-validator";

export class CreateAccountDto implements Partial<Account> {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role: RoleEnum;

  intoAccount(): Account {
    const acc = new Account();
    acc.username = this.username;
    acc.email = this.email;
    acc.password = this.password;
    acc.role = RoleEnum[this.role];
    return acc;
  }
}
