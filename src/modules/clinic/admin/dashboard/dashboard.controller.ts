import { RoleEnum } from "@common/enums/role.enum";
import { DashboardService } from "./dashboard.service";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { Roles } from "@common/decorators/role.decorator";
import { Controller, Get, Query, Request, Res, UseGuards } from "@nestjs/common";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";
import { GetDashboardMedicalDataDto } from "./dto/get-dashboard-medical-check-data.dto";
import { Response } from "express";

@Roles(RoleEnum.ADMIN_CLINIC)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("clinic/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("admin")
  getDashboardData(
    @Request() request: any,
    @Query() getDashboardDataDto: GetDashboardDataDto
  ) {
    return this.dashboardService.getDashboardData(
      request.user,
      getDashboardDataDto
    );
  }

  @Get("admin/medical-check")
  getDashboardMedicalCheckData(
    @Request() request: any,
    @Query() getDashboardMedicalDataDto: GetDashboardMedicalDataDto
  ) {
    return this.dashboardService.getDashboardMedicalCheckData(
      request.user,
      getDashboardMedicalDataDto
    );
  }

  @Get("admin/medical-check/export")
  async exportMcuOrderTracking(
    @Request() request: any,
    @Query() getDashboardMedicalDataDto: GetDashboardMedicalDataDto,
    @Res() res: Response
  ) {
    const buffer = await this.dashboardService.exportSchedule(
      request.user,
      getDashboardMedicalDataDto
    );
    return res
      .set("Content-Disposition", `attachment; filename=Medical-Check.xlsx`)
      .send(buffer);
  }
}
