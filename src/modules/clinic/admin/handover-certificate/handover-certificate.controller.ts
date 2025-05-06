import {
  Body,
  UseGuards,
  Controller,
  Post,
} from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";
import { HandoverCertificateService } from "./handover-certificate.service";
import { HandoverCertificateDto } from "./dto/handover-certificate.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

@Roles(
  RoleEnum.ADMIN_CLINIC,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@ApiBearerAuth("JwtAuth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("clinic/handover-certificate")
export class HandoverCertificateController {
  constructor(private readonly handoverCertificateService: HandoverCertificateService) {}

  @Post('create')
  handoverCertificate(@Body() handoverCertificateDto: HandoverCertificateDto) {
    return this.handoverCertificateService.handoverCertificate(handoverCertificateDto);
  }
}
