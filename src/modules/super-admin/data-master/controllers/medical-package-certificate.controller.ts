import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MedicalPackageCertificateService } from "../services/medical-package-certificate.service";
import {
  CreateMedicalPackageCertificateDto,
  UpdateMedicalPackageCertificateDto,
} from "../dto/medical-package-certificate.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("master-data/medical-package-certificate")
export class MedicalPackageCertificateController {
  constructor(
    private readonly medicalPackageCertificateService: MedicalPackageCertificateService
  ) {}

  @Get()
  getMedicalPackageCertificate(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search?: string
  ) {
    return this.medicalPackageCertificateService.getMedicalPackageCertificate(
      page,
      limit,
      search
    );
  }

  @Get("/:medicalPackageCertificateId")
  getDetailMedicalPackageCertificate(
    @Param("medicalPackageCertificateId") medicalPackageCertificateId: string
  ) {
    return this.medicalPackageCertificateService.getDetailMedicalPackageCertificate(
      parseInt(medicalPackageCertificateId)
    );
  }

  @Post("")
  createMedicalPackageCertificate(
    @Body()
    createMedicalPackageCertificateDto: CreateMedicalPackageCertificateDto
  ) {
    return this.medicalPackageCertificateService.createMedicalPackageCertificate(
      createMedicalPackageCertificateDto
    );
  }

  @Put("/:medicalPackageCertificateId")
  updateMedicalPackageCertificate(
    @Param("medicalPackageCertificateId") medicalPackageCertificateId: string,
    @Body()
    updateMedicalPackageCertificateDto: UpdateMedicalPackageCertificateDto
  ) {
    return this.medicalPackageCertificateService.updateMedicalPackageCertificate(
      parseInt(medicalPackageCertificateId),
      updateMedicalPackageCertificateDto
    );
  }

  @Delete("/:medicalPackageCertificateId")
  deleteMedicalPackageCertificate(
    @Param("medicalPackageCertificateId") medicalPackageCertificateId: string
  ) {
    return this.medicalPackageCertificateService.deleteMedicalPackageCertificate(
      parseInt(medicalPackageCertificateId)
    );
  }
}
