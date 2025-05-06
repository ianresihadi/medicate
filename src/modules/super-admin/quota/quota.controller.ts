import { QuotaService } from "./quota.service";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UpdateQuotaClinicDto } from "./dto/update-quota-clinic.dto";
import { GetQuotaClinicDto } from "./dto/get-quota-clinic.dto";
import { AddQuotaClinicDto } from "./dto/add-quota-clinic.dto";
import { AddQuotaClinicV2Dto } from "./dto/add-quota-clinic.v2.dto";
import { VoidQuotaClinicV2Dto } from "./dto/void-quota-clinic.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("super-admin/quota")
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  @Get()
  getQuotaClinic(@Query() getQuotaClinicDto: GetQuotaClinicDto) {
    return this.quotaService.getQuotaClinic(getQuotaClinicDto);
  }

  @Post()
  addQuotaClinic(
    @Request() request: any,
    @Body() addQuotaClinicDto: AddQuotaClinicDto
  ) {
    return this.quotaService.addQuotaClinic(request.user, addQuotaClinicDto);
  }

  @Post("void")
  voidQuotaClinicV2(
    @Request() request: any,
    @Body() voidQuotaClinicV2Dto: VoidQuotaClinicV2Dto
  ) {
    return this.quotaService.voidQuotaClinicV2(
      request.user,
      voidQuotaClinicV2Dto
    );
  }

  @Patch(":clinicId")
  updateQuotaClinic(
    @Request() request: any,
    @Param("clinicId") clinicId: string,
    @Body() updateQuotaClinicDto: UpdateQuotaClinicDto
  ) {
    return this.quotaService.updateQuotaClinic(
      request.user,
      clinicId,
      updateQuotaClinicDto
    );
  }

  @Post("v2/add")
  addQuotaClinicV2(
    @Request() request: any,
    @Body() addQuotaClinicV2Dto: AddQuotaClinicV2Dto
  ) {
    return this.quotaService.addQuotaClinicV2(
      request.user,
      addQuotaClinicV2Dto
    );
  }
}
