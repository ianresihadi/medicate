import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { ClinicService } from "@modules/common/master-data/clinic/clinic.service";
import {
  CreateClinicDto,
  UpdateClinicDto,
} from "@modules/common/master-data/clinic/dto/create-clinic.dto";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("masterdata/clinic")
export class DmClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Get()
  getClinics(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string
  ) {
    return this.clinicService.getClinics(page, limit, search);
  }

  @Get("all")
  getAllClinic() {
    return this.clinicService.getAllClinic();
  }

  @Get(":id")
  getDetailClinic(@Param("id", new ParseUUIDPipe()) clinicUuid: string) {
    return this.clinicService.getClinic(clinicUuid);
  }

  @Post()
  createClinic(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicService.createClinic(createClinicDto);
  }

  @Put(":clinicId")
  updateClinic(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Body() updateClinicDto: UpdateClinicDto
  ) {
    return this.clinicService.updateClinic(clinicId, updateClinicDto);
  }

  @Delete(":id")
  deleteClinic(@Param("id", new ParseUUIDPipe()) clinicUuid: string) {
    return this.clinicService.deleteClinic(clinicUuid);
  }

  @Get("unselected/:packageId")
  getUnselectedClinics(
    @Param("packageId", new ParseUUIDPipe()) packageId: string
  ) {
    return this.clinicService.getUnselectedClinics(packageId);
  }
}
