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
import { GetListDto } from "./dto/get-list.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.ADMIN_VFS,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS,
)
@Controller("admin-vfs/account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  getList(@Query() getListDto: GetListDto) {
    return this.accountService.getList(getListDto);
  }

  @Get(":accountId")
  findOne(@Param("accountId") accountId: string) {
    return this.accountService.getDetail(accountId);
  }

  @Patch(":accountId")
  update(
    @Param("accountId") accountId: string,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    return this.accountService.update(accountId, updateAccountDto);
  }

  @Delete(":accountId/:adminVfsId")
  remove(
    @Param("accountId") accountId: string,
    @Param("adminVfsId") adminVfsId: string
  ) {
    return this.accountService.remove(accountId, adminVfsId);
  }
}
