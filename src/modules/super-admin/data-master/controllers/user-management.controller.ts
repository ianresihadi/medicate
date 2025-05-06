import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsermanagementService } from "../services/user-management.service";
import { CreateAccountDto } from "../dto/user-management.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("user-management")
export class UsermanagementController {
  constructor(private readonly service: UsermanagementService) {}

  @Get("clinic/:id")
  getClinics(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string,
    @Query("role") role: string,
    @Param("id", new ParseUUIDPipe()) clinicUuid: string
  ) {
    return this.service.getByClinic(page, limit, search, clinicUuid, role);
  }

  @Get("consulate/:id")
  getConsulate(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string,
    @Param("id", new ParseUUIDPipe()) consulateId: string
  ) {
    return this.service.getByConsulate(page, limit, search, consulateId);
  }

  @Post("clinic/:id")
  createByClinic(
    @Body() body: CreateAccountDto,
    @Param("id", new ParseUUIDPipe()) clinicUuid: string
  ) {
    return this.service.createByClinic(body, clinicUuid);
  }

  @Post("consulate/:id")
  createByConsulate(
    @Body() body: CreateAccountDto,
    @Param("id", new ParseUUIDPipe()) consulateId: string
  ) {
    return this.service.createByConsulate(body, consulateId);
  }

  @Put(":id")
  updae(
    @Body() body: CreateAccountDto,
    @Param("id", new ParseUUIDPipe()) userId: string
  ) {
    return this.service.update(body, userId);
  }

  @Get(":id")
  getDetail(@Param("id", new ParseUUIDPipe()) userId: string) {
    return this.service.getDetail(userId);
  }

  @Delete(":id")
  delete(@Param("id", new ParseUUIDPipe()) userId: string) {
    return this.service.delete(userId);
  }
}
