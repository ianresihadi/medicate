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
import { Roles } from "@common/decorators/role.decorator";
import { MedicalCheckService } from "./medical-check.service";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { RegisterMedicalCheckDto } from "./dto/register-medical-check.dto";

@ApiBearerAuth("JwtAuth")
@ApiTags("Patient|Medical Check")
@Roles(RoleEnum.PATIENT)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("medical-check")
export class MedicalCheckController {
  constructor(private readonly medicalCheckService: MedicalCheckService) {}

  @ApiBody({
    schema: {
      type: "object",
      properties: {
        clinic_id: {
          type: "string",
          nullable: false,
        },
        package_medical_check_id: {
          type: "string",
          nullable: false,
        },
        travel_destination: {
          type: "string",
          nullable: false,
        },
        date: {
          type: "string",
          nullable: false,
          description: "Format YYYY-MM-DD",
        },
        identity_card: {
          type: "string",
          nullable: false,
        },
        passport: {
          type: "string",
          nullable: false,
        },
        additional_document: {
          type: "string",
          nullable: true,
        },
      },
    },
  })
  @Post("register")
  registeMedicalCheck(
    @Request() request: any,
    @Body() registerMedicalCheckDto: RegisterMedicalCheckDto
  ) {
    return this.medicalCheckService.registerMedicalCheck(
      request.user,
      registerMedicalCheckDto
    );
  }

  @Get()
  getMedicalCheck(@Request() request: any) {
    return this.medicalCheckService.getMedicalCheck(request.user);
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
    const { fileName, file } = await this.medicalCheckService.downloadResult(
      request.user,
      medicalCheckUuid
    );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });
    return new StreamableFile(file);
  }
}
