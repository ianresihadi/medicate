import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UtilsRegionService } from "../services/region.service";
import { RoleEnum } from "@common/enums/role.enum";
import { Roles } from "@common/decorators/role.decorator";

@ApiBearerAuth("JwtAuth")
@ApiTags("Utils|Region")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("region")
export class UtilsRegionController {
  constructor(private readonly regionService: UtilsRegionService) {}

  @Roles(
    RoleEnum.ADMIN_CLINIC,
    RoleEnum.SUPER_ADMIN_EXECUTIVE,
    RoleEnum.SUPER_ADMIN_INVESTOR,
    RoleEnum.SUPER_ADMIN_OPS
  )
  @Get("province")
  getProvince() {
    return this.regionService.getProvince();
  }

  @Roles(
    RoleEnum.ADMIN_CLINIC,
    RoleEnum.SUPER_ADMIN_EXECUTIVE,
    RoleEnum.SUPER_ADMIN_INVESTOR,
    RoleEnum.SUPER_ADMIN_OPS
  )
  @Get(":provinceId/regency")
  getRegency(@Param("provinceId", new ParseIntPipe()) provinceId: number) {
    return this.regionService.getRegency(provinceId);
  }
}
