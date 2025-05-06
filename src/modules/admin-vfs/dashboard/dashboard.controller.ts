import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { RoleEnum } from "@common/enums/role.enum";
import { Roles } from "@common/decorators/role.decorator";
import { GetDashboardDto } from "./dto/get-dashboard.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.ADMIN_VFS,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS,
)
@Controller("admin-vfs/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@Query() getDashboardDto: GetDashboardDto) {
    return this.dashboardService.getDashboard(getDashboardDto);
  }
}
