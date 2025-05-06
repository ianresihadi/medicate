import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { CreateAdminVpsDto } from './dto/create-admin-vps.dto';
import { UpdateAdminVpsDto } from './dto/update-admin-vps.dto';
import { RolesGuard } from '@common/guards/roles.guard';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { Roles } from '@common/decorators/role.decorator';
import { RoleEnum } from '@common/enums/role.enum';
import { GetListDto } from './dto/get-list.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.ADMIN_VFS,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS,
)
@Controller('admin-vfs/master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Post()
  create(@Body() createAdminVpsDto: CreateAdminVpsDto) {
    return this.masterDataService.create(createAdminVpsDto);
  }

  @Get()
  getList(@Query() getListDto: GetListDto) {
    return this.masterDataService.getList(getListDto);
  }

  @Get(':adminVfsId')
  getDetail(@Param('adminVfsId') adminVfsId: string) {
    return this.masterDataService.getDetail(adminVfsId);
  }

  @Patch(':adminVfsId')
  update(@Param('adminVfsId') adminVfsId: string, @Body() updateAdminVpsDto: UpdateAdminVpsDto) {
    return this.masterDataService.update(adminVfsId, updateAdminVpsDto);
  }

  @Delete(':adminVfsId')
  remove(@Param('adminVfsId') adminVfsId: string) {
    return this.masterDataService.remove(adminVfsId);
  }
}
