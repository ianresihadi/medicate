import { MedicalCheckService } from "./medical-check.service";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { GetMcuOrderTrackingDto } from "./dto/get-mcu-order-tracking.dto";
import { Response } from "express";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("super-admin/medical-check")
export class MedicalCheckController {
  constructor(private readonly medicalCheckService: MedicalCheckService) {}

  @Get()
  getMcuOrderTracking(@Query() getMcuOrderTrackingDto: GetMcuOrderTrackingDto) {
    return this.medicalCheckService.getMcuOrderTracking(
      getMcuOrderTrackingDto,
      true
    );
  }

  @Get("export")
  async exportMcuOrderTracking(
    @Query() getMcuOrderTrackingDto: GetMcuOrderTrackingDto,
    @Res() res: Response
  ) {
    const buffer = await this.medicalCheckService.exportSchedule(
      getMcuOrderTrackingDto
    );
    return res
      .set("Content-Disposition", `attachment; filename=Medical-Check.xlsx`)
      .send(buffer);
  }
}
