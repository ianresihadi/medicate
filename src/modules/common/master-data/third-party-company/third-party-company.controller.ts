import {
  Put,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Controller,
  ParseUUIDPipe,
} from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";
import { ThirdPartyCompanyService } from "./third-party-company.service";
import { CreateThirdPartyCompanyDto } from "./dto/create-third-party-company.dto";
import { UpdateThirdPartyCompanyDto } from "./dto/update-third-party-company.dto";

@ApiBearerAuth("JwtAuth")
@ApiTags("Master Data|Third Party")
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("master-data/third-party-company")
export class ThirdPartyCompanyController {
  constructor(
    private readonly thirdPartyCompanyService: ThirdPartyCompanyService
  ) {}

  @Get()
  getThirdPartyCompanies() {
    return this.thirdPartyCompanyService.getThirdPartyCompanies();
  }

  @Get(":id")
  getThirdPartyCompany(
    @Param("id", new ParseUUIDPipe()) thirdPartyCompanyUuid: string
  ) {
    return this.thirdPartyCompanyService.getThirdPartyCompany(
      thirdPartyCompanyUuid
    );
  }

  @Post()
  createThirdPartyCompany(
    @Body() createThirdPartyCompanyDto: CreateThirdPartyCompanyDto
  ) {
    return this.thirdPartyCompanyService.createThirdPartyCompany(
      createThirdPartyCompanyDto
    );
  }

  @Put(":id")
  updateThirdPartyCompany(
    @Param("id", new ParseUUIDPipe()) thirdPartyCompanyUuid: string,
    @Body() updateThirdPartyCompanyDto: UpdateThirdPartyCompanyDto
  ) {
    return this.thirdPartyCompanyService.updateThirdPartyCompany(
      thirdPartyCompanyUuid,
      updateThirdPartyCompanyDto
    );
  }
}
