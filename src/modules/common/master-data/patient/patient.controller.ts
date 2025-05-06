import {
  Get,
  Param,
  Query,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  Post,
  Body,
  Request,
} from "@nestjs/common";
import { PatientService } from "./patient.service";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";
import CreatePatientDtoV2, {
  ConnectPatientClinic,
} from "@modules/clinic/admin/registration/dto/registrationv2.dto";

@Roles(
  RoleEnum.ADMIN_CLINIC,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("master-data/patient")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  getPatients(
    @Query("search") search: string,
    @Request() request: any,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    const clinicId = request.user.clinic.id;
    return this.patientService.getPatients(search, clinicId, page, limit);
  }

  @Post()
  create(
    @Body() createPatientDto: CreatePatientDtoV2,
    @Request() request: any
  ) {
    const clinicId = request.user.clinic.id;
    return this.patientService.createPatient(createPatientDto, clinicId);
  }

  @Get("check")
  checkPatient(@Query("nik") nik: string) {
    return this.patientService.checkPatient(nik);
  }

  @Get(":id")
  getDetailPatient(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Request() request: any
  ) {
    const clinicId = request.user.clinic.id;
    return this.patientService.getDetailPatient(id, clinicId);
  }

  @Post("connect")
  connectPatient(
    @Body() connectPatientClinic: ConnectPatientClinic,
    @Request() request: any
  ) {
    const clinicId = request.user.clinic.id;
    return this.patientService.connectPatient(connectPatientClinic, clinicId);
  }
}
