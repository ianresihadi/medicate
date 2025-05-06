import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("/super-admin/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("general")
  async getGeneralDashboardData(
    @Query() getDashboardDataDto: GetDashboardDataDto
  ) {
    return this.dashboardService.getGeneralDashboardData(getDashboardDataDto);
  }

  @Get("mcu-result")
  async getMcuResult(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getMcuResult(getDashboardDataDto);
  }

  @Get("order")
  async getOrderData(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getOrderData(getDashboardDataDto);
  }

  @Get("recap-order")
  async getRecapOrder(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getRecapOrder(getDashboardDataDto);
  }

  @Get("pending-order")
  async getPendingOrder(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getPendingOrder(getDashboardDataDto);
  }

  @Get("mcu-done")
  async getMcuDoneData(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getMcuDone(getDashboardDataDto);
  }

  @Get("remain-balance")
  async getRemainBalance(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getRemainBalance(getDashboardDataDto);
  }

  @Get("recap-balance")
  async getRecapBalance(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getRecapBalance(getDashboardDataDto);
  }

  @Get("total-topup")
  async getTotalTopup(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getTotalTopup(getDashboardDataDto);
  }

  @Get("total-redeem")
  async getTotalRedeem(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getTotalRedeem(getDashboardDataDto);
  }

  @Get("total-revenue")
  async getTotalRevenue(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getTotalRevenue(getDashboardDataDto);
  }

  @Get("recap-certificate-progress")
  async getRecapCertificateProgress(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.getRecapCertificateProgress(getDashboardDataDto);
  }

  @Get("visualize-certificate-progress")
  async visualizeCertificateProgress(@Query() getDashboardDataDto: GetDashboardDataDto) {
    return this.dashboardService.visualizeCertificateProgress(getDashboardDataDto);
  }
}
