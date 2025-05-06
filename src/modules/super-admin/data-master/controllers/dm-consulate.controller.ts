import { Roles } from "@common/decorators/role.decorator";
import { RoleEnum } from "@common/enums/role.enum";
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
import { DmConsulateService } from "../services/dm-consulate.service";
import { CreateConsulateDto } from "../dto/dm-consulate.dto";

@ApiBearerAuth("JwtAuth")
@ApiTags("Master Data|Consulate")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@Controller("masterdata/consulate")
export class DmConsulateController {
  constructor(private readonly service: DmConsulateService) {}

  @ApiQuery({
    name: "search",
    required: false,
  })
  @Get()
  getClinics(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("search") search: string
  ) {
    return this.service.getAll(page, limit, search);
  }

  @Get(":id")
  getDetail(@Param("id", new ParseUUIDPipe()) uuid: string) {
    return this.service.getDetail(uuid);
  }

  @Post()
  create(@Body() createConsulateDto: CreateConsulateDto) {
    return this.service.create(createConsulateDto);
  }

  @Put(":id")
  update(
    @Param("id", new ParseUUIDPipe()) uuid: string,
    @Body() updateDto: CreateConsulateDto
  ) {
    return this.service.update(uuid, updateDto);
  }

  @Delete(":id")
  deleteClinic(@Param("id", new ParseUUIDPipe()) uuid: string) {
    return this.service.delete(uuid);
  }
}
