import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { GetAccountDto } from "./dto/get-account.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("super-admin/account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  getAccount(@Query() getAccountDto: GetAccountDto) {
    return this.accountService.getAccount(getAccountDto);
  }

  @Get(":accountId")
  getDetailAccount(@Param("accountId") accountId: string) {
    return this.accountService.getDetailAccount(accountId);
  }

  @Patch(":accountId")
  update(
    @Param("accountId") accountId: string,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    return this.accountService.update(accountId, updateAccountDto);
  }

  @Delete(":accountId")
  remove(@Param("accountId") accountId: string) {
    return this.accountService.remove(accountId);
  }
}
