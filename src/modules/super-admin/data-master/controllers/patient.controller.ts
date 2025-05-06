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
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PatientService } from "../services/patient.service";
import { UpdatePatientDto } from "../dto/update-patient.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("masterdata/patient")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  getPatient(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string
  ) {
    return this.patientService.getPatient(page, limit, search);
  }

  @Get("/:patientId")
  getDetailPatient(@Param("patientId") patientId: string) {
    return this.patientService.getDetailPatient(patientId);
  }

  @Put("/:patientId")
  updatePatient(
    @Param("patientId") patientId: string,
    @Body() updatePatientDto: UpdatePatientDto
  ) {
    return this.patientService.updatePatient(patientId, updatePatientDto);
  }

  @Delete("/:patientId")
  deletePatient(@Param("patientId") patientId: string) {
    return this.patientService.deletePatient(patientId);
  }
}
