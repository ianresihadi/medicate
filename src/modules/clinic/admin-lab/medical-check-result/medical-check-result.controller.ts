import {
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  HttpStatus,
  Query,
  ForbiddenException,
} from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";
import { MedicalCheckResultService } from "./medical-check-result.service";
import { InputMedicalCheckResultDto } from "./dto/input-medical-check-result.dto";
import { UploadMedicalCheckResultDto } from "./dto/upload-medical-check-result.dto";
import { AuthService } from "@modules/common/auth/auth.service";
import { TDetailRegistrationToken } from "./type/detail-registration-token.type";
import { ResponseInterface } from "@common/interfaces/response.interface";

@Controller("clinic/medical-check-result")
export class MedicalCheckResultController {
  constructor(
    private readonly medicalCheckResultService: MedicalCheckResultService,
    private readonly authService: AuthService
  ) {}

  @Roles(RoleEnum.ADMIN_CLINIC_LAB, RoleEnum.ADMIN_CLINIC)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getMedicalCheckResult(@Request() request: any) {
    return this.medicalCheckResultService.getMedicalCheckResult(request.user);
  }

  @Roles(RoleEnum.ADMIN_CLINIC_LAB, RoleEnum.ADMIN_CLINIC)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("realesed")
  getRealesedMedicalCheckResult(
    @Request() request: any,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string
  ) {
    return this.medicalCheckResultService.getRealesedMedicalCheckResult(
      request.user.clinic.id,
      page,
      limit,
      search
    );
  }

  @Roles(
    RoleEnum.ADMIN_CLINIC_LAB,
    RoleEnum.ADMIN_CLINIC,
    RoleEnum.SUPER_ADMIN,
    RoleEnum.THIRD_PARTY,
    RoleEnum.SUPER_ADMIN_EXECUTIVE,
    RoleEnum.SUPER_ADMIN_OPS,
    RoleEnum.SUPER_ADMIN_INVESTOR,
    RoleEnum.ADMIN_VFS
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("detail-realesed/:medicalCheckId")
  getDetailRealesedMedicalCheckResult(
    @Param("medicalCheckId", new ParseUUIDPipe()) medichakcheckUuid: string
  ) {
    return this.medicalCheckResultService.getDetailRealesedMedicalCheckResult(
      medichakcheckUuid
    );
  }

  @Get("printed/:medicalCheckId")
  printedDetailRealesedMedicalCheckResult(
    @Param("medicalCheckId", new ParseUUIDPipe()) medichakcheckUuid: string
  ) {
    return this.medicalCheckResultService.printedDetailRealesedMedicalCheckResult(
      medichakcheckUuid
    );
  }

  @Get("detail-registration")
  async getDetailRegistration(@Query("token") token: string) {
    const payload = (await this.authService.verifyJwtToken(
      token
    )) as any as TDetailRegistrationToken;

    const today = new Date();
    const expiryDate = new Date(payload.expiryDate);

    if (today > expiryDate) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: "Tautan sudah kedaluwarsa",
        error: "Forbidden",
      } as ResponseInterface);
    }

    return this.medicalCheckResultService.getDetailRealesedMedicalCheckResult(
      payload.medicalCheckUUid
    );
  }

  @Roles(RoleEnum.ADMIN_CLINIC_LAB, RoleEnum.ADMIN_CLINIC)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":medicalCheckId")
  getDetailMedicalCheckResult(
    @Request() request: any,
    @Param("medicalCheckId", new ParseUUIDPipe()) medicalCheckUuid: string
  ) {
    return this.medicalCheckResultService.getDetailMedicalCheckResult(
      request.user,
      medicalCheckUuid
    );
  }

  @Roles(RoleEnum.ADMIN_CLINIC_LAB, RoleEnum.ADMIN_CLINIC)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  inputMedicalCheckResult(
    @Request() request: any,
    @Body() inputMedicalCheckResultDto: InputMedicalCheckResultDto
  ) {
    return this.medicalCheckResultService.inputMedicalCheckResult(
      request.user,
      inputMedicalCheckResultDto
    );
  }

  @Roles(RoleEnum.ADMIN_CLINIC_LAB, RoleEnum.ADMIN_CLINIC)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("upload/:medical_check_id")
  uploadMedicalCheckResult(
    @Param("medical_check_id") medical_check_id: string,
    @Body() uploadMedicalCheckResultDto: UploadMedicalCheckResultDto
  ) {
    return this.medicalCheckResultService.uploadMedicalCheckResult(
      uploadMedicalCheckResultDto,
      medical_check_id
    );
  }
}
