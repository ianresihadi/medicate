import {
  Put,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  Delete,
} from "@nestjs/common";
import { ClinicPackageService } from "./clinic-package.service";
import { RoleEnum } from "@common/enums/role.enum";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { UpdateClinicPackageDto } from "./dto/update-clinic-package.dto";

@ApiBearerAuth("JwtAuth")
@ApiTags("Master Data|Clinic Packages")
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("master-data/clinic-package")
export class ClinicPackageController {
  constructor(private readonly clinicPackageService: ClinicPackageService) {}

  @Get()
  getClinicPackages() {
    return this.clinicPackageService.getClinicPackages();
  }

  @Post("")
  createMedicalPackageCertificate(
    @Body()
    createClinicPackageDto: UpdateClinicPackageDto
  ) {
    return this.clinicPackageService.createClinicPackage(
      createClinicPackageDto
    );
  }

  @Get(":id")
  getClinicPackageDetail(@Param("id") clinicPackageId: number) {
    return this.clinicPackageService.getClinicPackageDetail(clinicPackageId);
  }

  @Put(":id")
  updateClinic(
    @Param("id") clinicPackageId: number,
    @Body() updateClinicPackageDto: UpdateClinicPackageDto
  ) {
    return this.clinicPackageService.updateClinicPackage(
      clinicPackageId,
      updateClinicPackageDto
    );
  }

  @Delete(":id")
  deleteClinic(@Param("id") clinicPackageId: number) {
    return this.clinicPackageService.deleteClinicPackage(clinicPackageId);
  }
}
