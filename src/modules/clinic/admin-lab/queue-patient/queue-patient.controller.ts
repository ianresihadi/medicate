import { Param, Post } from "@nestjs/common/decorators";
import { RoleEnum } from "@common/enums/role.enum";
import { ParseUUIDPipe } from "@nestjs/common/pipes";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";
import { QueuePatientService } from "./queue-patient.service";
import { Controller, UseGuards, Get, Query, Request } from "@nestjs/common";
import { EOrderStatus } from "@common/enums/general.enum";
import { GetDashboardDataDto } from "./dto/get-dashboard-data.dto";
import { GetQueueWaitingDto } from "./dto/get-queue-waiting.dto";

@Roles(RoleEnum.ADMIN_CLINIC_LAB, RoleEnum.ADMIN_CLINIC)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("clinic/queue-patient")
export class QueuePatientController {
  constructor(private readonly queuePatientService: QueuePatientService) {}

  @Get()
  getQueuePatient(
    @Request() request: any,
    @Query() getQueueWaitingDto: GetQueueWaitingDto
  ) {
    return this.queuePatientService.getQueuePatient(
      request.user,
      getQueueWaitingDto,
      EOrderStatus.paid
    );
  }

  @Get("total")
  getTotalQueuePatient(@Request() request: any) {
    return this.queuePatientService.getTotalQueuePatient(
      request.user,
      EOrderStatus.paid
    );
  }

  @Get("waiting-mcu")
  getQueueWaiting(
    @Request() request: any,
    @Query() getQueueWaitingDto: GetQueueWaitingDto
  ) {
    return this.queuePatientService.getQueuePatient(
      request.user,
      getQueueWaitingDto,
      EOrderStatus.waiting_mcu_result
    );
  }

  @Get("general")
  getGeneralDashboardData(
    @Request() request: any,
    @Query() getDashboardDataDto: GetDashboardDataDto
  ) {
    return this.queuePatientService.getDashboardDataDto(
      request.user,
      getDashboardDataDto
    );
  }

  @Post("validateMcu/:medicalCheckId")
  validateMcu(
    @Request() request: any,
    @Param("medicalCheckId", new ParseUUIDPipe()) medicalCheckId: string
  ) {
    return this.queuePatientService.validateMcu(request.user, medicalCheckId);
  }

  @Get(":medicalCheckId")
  getQueuePatientDetail(
    @Request() request: any,
    @Param("medicalCheckId", new ParseUUIDPipe()) medicalCheckId: string
  ) {
    return this.queuePatientService.getQueuePatientDetail(
      request.user,
      medicalCheckId
    );
  }
}
