import {
  Get,
  Put,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { MedicalCheckService } from "./medical-check.service";
import {
  ValidateCertificateDto,
  ValidateMedicalCheckDto,
} from "./dto/validate-medical-check.dto";
import { GetHistoryMedicalCheckDto } from "./dto/get-history-medical-check.dto";

@ApiTags("Third Party Company|Medical Check")
@ApiBearerAuth("JwtAuth")
@Roles(RoleEnum.THIRD_PARTY)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("third-party-company/medical-check")
export class MedicalCheckController {
  constructor(private readonly medicalCheckService: MedicalCheckService) {}

  @Get()
  getResultMedicalCheck(@Query("order_code") orderCode: string) {
    return this.medicalCheckService.getResultMedicalCheck(orderCode);
  }

  @Get("queue")
  getQueueMedicalCheck() {
    return this.medicalCheckService.getQueueMedicalCheck();
  }

  @Get("history")
  getHistoryMedicalCheck(
    @Query() getHistoryMedicalCheckDto: GetHistoryMedicalCheckDto
  ) {
    return this.medicalCheckService.getHistoryMedicalCheck(
      getHistoryMedicalCheckDto
    );
  }

  @Post("valid-certificate")
  getValidCertificate(@Body() body: ValidateCertificateDto) {
    return this.medicalCheckService.getValidCertificate(body);
  }

  @Put(":id/validate")
  validateMedicalCheck(
    @Request() request: any,
    @Param("id", new ParseUUIDPipe()) medicalCheckUuid: string,
    @Body() validateMedicalCheckDto: ValidateMedicalCheckDto
  ) {
    return this.medicalCheckService.validateMedicalCheck(
      request.user,
      medicalCheckUuid,
      validateMedicalCheckDto
    );
  }
}
