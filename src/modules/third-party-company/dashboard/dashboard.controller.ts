import { RoleEnum } from "@common/enums/role.enum";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";

@ApiTags("Third Party Company|Dashboard")
@ApiBearerAuth("JwtAuth")
@Roles(RoleEnum.THIRD_PARTY)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("third-party-company/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboardData(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getDashboardData(getDashboardDataDto);
  }
}
