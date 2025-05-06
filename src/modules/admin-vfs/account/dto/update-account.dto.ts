import { PartialType } from "@nestjs/swagger";
import { CreateAccountDto } from "./create-account.dto";
import { Account } from "@entities/account.entity";
import { RoleEnum } from "@common/enums/role.enum";

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  intoUpdateAccount(): Account {
    const acc = new Account();
    acc.username = this.username;
    acc.email = this.email;
    acc.password = this.password;
    acc.role = RoleEnum.ADMIN_VFS;
    return acc;
  }
}
