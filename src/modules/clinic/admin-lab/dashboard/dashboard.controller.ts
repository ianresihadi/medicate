import { RoleEnum } from "@common/enums/role.enum";
import { DashboardService } from "./dashboard.service";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { Controller, Get, Request, UseGuards } from "@nestjs/common";

@ApiTags("Admin Clinic Lab|Dashboard")
@Roles(RoleEnum.ADMIN_CLINIC_LAB)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("JwtAuth")
@Controller("clinic/dashboard/")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get("admin-lab")
  getDashboardData(@Request() request: any) {
    return this.dashboardService.getDashboardData(request.user);
  }
}
