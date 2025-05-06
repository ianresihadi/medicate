import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
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
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PackageService } from "./package.service";
import { RoleEnum } from "@common/enums/role.enum";
import { Roles } from "@common/decorators/role.decorator";
import { AddPackageClinicDto, CreatePackageDto } from "./dto/package.dto";

@ApiBearerAuth("JwtAuth")
@ApiTags("Master Data|Clinic")
@Roles(
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("master-data/package")
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Roles(
    RoleEnum.PATIENT,
    RoleEnum.ADMIN_CLINIC,
    RoleEnum.SUPER_ADMIN_EXECUTIVE,
    RoleEnum.SUPER_ADMIN_INVESTOR,
    RoleEnum.SUPER_ADMIN_OPS
  )
  @Get()
  get(@Query("clinicId") clinicUuid: string, @Req() { user }) {
    return this.packageService.get(user, clinicUuid);
  }

  @ApiQuery({
    name: "search",
    required: false,
  })
  @Get("list")
  getList(
    @Query("search") search: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    return this.packageService.getList(search, page, limit);
  }

  @Get("certificate/:id")
  getCertificate(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string,
    @Param("id", new ParseUUIDPipe()) packageId: string
  ) {
    return this.packageService.getListCertificate(
      page,
      limit,
      search,
      packageId
    );
  }

  @Get("clinic/:id")
  getListClinic(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string,
    @Param("id", new ParseUUIDPipe()) packageId: string
  ) {
    return this.packageService.getListClinics(page, limit, search, packageId);
  }

  @Get(":id")
  getDetail(@Param("id", new ParseUUIDPipe()) uuid: string) {
    return this.packageService.getDetail(uuid);
  }

  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packageService.create(createPackageDto);
  }

  @Post(":clinicId")
  addClinicPackage(
    @Param("clinicId", new ParseUUIDPipe()) uuid: string,
    @Body() { packageIds }: AddPackageClinicDto
  ) {
    return this.packageService.addClinicPackage(uuid, packageIds);
  }

  @Put(":id")
  update(
    @Param("id", new ParseUUIDPipe()) uuid: string,
    @Body() updateDto: CreatePackageDto
  ) {
    return this.packageService.update(uuid, updateDto);
  }

  @Delete(":id")
  deleteClinic(@Param("id", new ParseUUIDPipe()) uuid: string) {
    return this.packageService.delete(uuid);
  }

  @Delete(":id/:clinicId")
  removeClinicPackage(
    @Param("id", new ParseUUIDPipe()) uuid: string,
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string
  ) {
    return this.packageService.removeClinicPackage(clinicId, uuid);
  }
}
