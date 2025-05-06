import { QuotaHistoryService } from "./quota-history.service";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { GetQuotaClinicDto } from "./dto/get-quota-clinic.dto";
import { GetDetailQuotaClinicDto } from "./dto/get-detail-quota-clinic.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("super-admin/quota-history")
export class QuotaHistoryController {
  constructor(private readonly quotaHistoryService: QuotaHistoryService) {}

  @Get()
  getQuotaClinic(@Query() getQuotaClinicDto: GetQuotaClinicDto) {
    return this.quotaHistoryService.getQuotaClinic(getQuotaClinicDto);
  }

  @Get(":clinicId")
  getDetailQuotaClinic(
    @Param("clinicId") clinicId: string,
    @Query() getDetailQuotaClinicDto: GetDetailQuotaClinicDto
  ) {
    return this.quotaHistoryService.getDetailQuotaClinic(
      clinicId,
      getDetailQuotaClinicDto
    );
  }
}
