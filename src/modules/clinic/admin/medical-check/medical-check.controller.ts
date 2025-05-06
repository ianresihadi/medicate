import {
  Res,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  StreamableFile,
} from "@nestjs/common";
import type { Response } from "express";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { MedicalCheckService } from "./medical-check.service";
import {
  ChangeStatusMCURequest,
  RegisterMedicalCheckDto,
  ValidateOrderRequest,
} from "./dto/register-medical-check.dto";

@ApiTags("Admin Clinic|Medical Check")
@ApiBearerAuth("JwtAuth")
@Roles(RoleEnum.ADMIN_CLINIC)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("clinic/medical-check")
export class MedicalCheckController {
  constructor(private readonly medicalCheckService: MedicalCheckService) {}

  @Get()
  getListMedicalCheck(@Request() request: any) {
    return this.medicalCheckService.getListMedicalCheck(request.user);
  }

  @Get("replace-order-date-null")
  replaceOrderDateNull() {
    return this.medicalCheckService.replaceOrderDateNull();
  }

  @Get("replace-receipt-date-null")
  replaceReceiptDateNull() {
    return this.medicalCheckService.replaceReceiptDateNull();
  }

  @Get(":id")
  getDetailMedicalCheck(
    @Request() request: any,
    @Param("id", new ParseUUIDPipe()) medicalCheckUuid: string
  ) {
    return this.medicalCheckService.getDetailMedicalCheck(
      request.user,
      medicalCheckUuid
    );
  }

  @Get(":id/result-download")
  async downloadResultMedicalCheck(
    @Request() request: any,
    @Res({ passthrough: true }) res: Response,
    @Param("id", new ParseUUIDPipe()) medicalCheckUuid: string
  ) {
    const { fileName, file } =
      await this.medicalCheckService.downloadResultMedicalCheck(
        request.user,
        medicalCheckUuid
      );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });
    return new StreamableFile(file);
  }

  @Post("register")
  registerMedicalCheck(
    @Request() request: any,
    @Body() registerMedicalCheckDto: RegisterMedicalCheckDto
  ) {
    return this.medicalCheckService.registerMedicalCheck(
      request.user,
      registerMedicalCheckDto
    );
  }

  @Post("register-with-payment")
  registerMedicalCheckWithPayment(
    @Request() request: any,
    @Body() registerMedicalCheckDto: RegisterMedicalCheckDto
  ) {
    return this.medicalCheckService.registerMedicalCheckWithPayment(
      request.user,
      registerMedicalCheckDto
    );
  }

  @Roles(RoleEnum.ADMIN_CLINIC, RoleEnum.CLINIC_VALIDATOR)
  @Post("validateOrder")
  validateOrder(
    @Request() request: any,
    @Body() validateOrderRequest: ValidateOrderRequest
  ) {
    const clinicId = request.user.clinic.id;
    return this.medicalCheckService.validateOrder(
      validateOrderRequest,
      clinicId
    );
  }

  @Post(":status")
  changeStatusMCU(
    @Request() request: any,
    @Body() changeStatusMCURequest: ChangeStatusMCURequest,
    @Param("status") status: string
  ) {
    const clinicId = request.user.clinic.id;
    const userId = request.user.id;

    return this.medicalCheckService.changeStatusMcu(
      changeStatusMCURequest,
      clinicId,
      userId,
      status
    );
  }
}
