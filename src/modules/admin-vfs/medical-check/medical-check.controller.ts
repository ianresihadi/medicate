import { Controller, Get, Post, Body, UseGuards, Query } from "@nestjs/common";
import { MedicalCheckService } from "./medical-check.service";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { RoleEnum } from "@common/enums/role.enum";
import { Roles } from "@common/decorators/role.decorator";
import { SetVfsStatusDto } from "./dto/set-vfs-status.dto";
import { ValidateCertificateDto } from "./dto/validate-certificate.dto";
import { GetListCertificationDto } from "./dto/get-list-certification.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.ADMIN_VFS,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("admin-vfs")
export class MedicalCheckController {
  constructor(private readonly medicalCheckService: MedicalCheckService) {}

  @Get("list-certification")
  getListCertification(
    @Query() getListCertificationDto: GetListCertificationDto
  ) {
    return this.medicalCheckService.getListOfCertification(
      getListCertificationDto
    );
  }

  @Post("/validate-certificate")
  validateCertificate(@Body() validateCertificateDto: ValidateCertificateDto) {
    return this.medicalCheckService.validateCertificate(validateCertificateDto);
  }

  @Post("/set-status")
  setVfsStatus(@Body() setVfsStatusDto: SetVfsStatusDto) {
    return this.medicalCheckService.setVfsStatus(setVfsStatusDto);
  }
}
