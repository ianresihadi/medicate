import {
  Put,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  Delete,
} from "@nestjs/common";
import { ClinicService } from "../clinic/clinic.service";
import { RoleEnum } from "@common/enums/role.enum";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { CreatePackageDto } from "../package/dto/package.dto";
import { PackageService } from "../package/package.service";

@ApiBearerAuth("JwtAuth")
@ApiTags("Master Data|Clinic")
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("master-data/clinic")
export class ClinicController {
  constructor(
    private readonly clinicService: ClinicService,
    private readonly packageService: PackageService
  ) {}

  @Post()
  createClinic(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicService.createClinic(createClinicDto);
  }

  @Put(":id")
  updateClinic(
    @Param("id", new ParseUUIDPipe()) clinicUuid: string,
    @Body() updateClinicDto: CreateClinicDto
  ) {
    return this.clinicService.updateClinic(clinicUuid, updateClinicDto);
  }

  @Delete(":id")
  deleteClinic(@Param("id", new ParseUUIDPipe()) clinicUuid: string) {
    return this.clinicService.deleteClinic(clinicUuid);
  }

  @Get(":id")
  getClinic(@Param("id", new ParseUUIDPipe()) clinicUuid: string) {
    return this.clinicService.getClinic(clinicUuid);
  }
}
