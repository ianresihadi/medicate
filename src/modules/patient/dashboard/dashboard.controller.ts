import { RoleEnum } from "@common/enums/role.enum";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { Controller, Get, UseGuards, Request } from "@nestjs/common";

@ApiTags("Patient|Dashboard")
@ApiBearerAuth("JwtAuth")
@Roles(RoleEnum.PATIENT)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboardData(@Request() request: any) {
    return this.dashboardService.getDashboardData(request.user);
  }
}
