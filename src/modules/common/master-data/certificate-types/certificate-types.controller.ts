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
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RoleEnum } from "@common/enums/role.enum";
import { Roles } from "@common/decorators/role.decorator";
import { CertificateTypesService } from "./certificate-types.service";
import { CreateCertificateDto } from "./dto/certificate-types.dto";

@ApiBearerAuth("JwtAuth")
@ApiTags("Master Data | Certificate")
@Roles(
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("master-data/certificate")
export class CertificateTypesController {
  constructor(private readonly certificateTypes: CertificateTypesService) {}

  @Roles(
    RoleEnum.PATIENT,
    RoleEnum.ADMIN_CLINIC,
    RoleEnum.SUPER_ADMIN_EXECUTIVE,
    RoleEnum.SUPER_ADMIN_INVESTOR,
    RoleEnum.SUPER_ADMIN_OPS
  )
  @Get()
  get() {
    return this.certificateTypes.get();
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
    return this.certificateTypes.getList(search, page, limit);
  }

  @Get("all")
  getAll() {
    return this.certificateTypes.getAll();
  }

  @Get("unselected/:packageId")
  getUnselectedCertificates(
    @Param("packageId", new ParseUUIDPipe()) packageId: string
  ) {
    return this.certificateTypes.getUnselectedCertificates(packageId);
  }

  @Get(":id")
  getDetail(@Param("id", new ParseUUIDPipe()) uuid: string) {
    return this.certificateTypes.getDetail(uuid);
  }

  @Post()
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificateTypes.create(createCertificateDto);
  }

  @Put(":id")
  update(
    @Param("id", new ParseUUIDPipe()) uuid: string,
    @Body() updateDto: CreateCertificateDto
  ) {
    return this.certificateTypes.update(uuid, updateDto);
  }

  @Delete(":id")
  deleteClinic(@Param("id", new ParseUUIDPipe()) uuid: string) {
    return this.certificateTypes.delete(uuid);
  }
}
