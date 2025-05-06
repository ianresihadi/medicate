import {
  Get,
  Put,
  Body,
  Post,
  Param,
  Query,
  Delete,
  Request,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  ValidationPipe,
} from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { LabRoomService } from "./lab-room.service";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";
import { CreateLabRoomDto } from "./dto/create-lab-room.dto";
import { UpdateLabRoomDto } from "./dto/update-lab-room.dto";
import { LabRoomFilterDto } from "./dto/lab-room-filter.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";

@ApiTags("Admin Clinic|Lab Room")
@ApiBearerAuth("JwtAuth")
@Roles(RoleEnum.ADMIN_CLINIC)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("clinic/lab-room")
export class LabRoomController {
  constructor(private readonly labRoomService: LabRoomService) {}

  @ApiQuery({
    name: "is_deleted",
    type: "boolean",
    required: false,
  })
  @Get()
  getLabRooms(
    @Request() request: any,
    @Query(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    )
    filter: LabRoomFilterDto
  ) {
    return this.labRoomService.getLabRooms(request.user, filter);
  }

  @Get(":id")
  getLabRoom(
    @Request() request: any,
    @Param("id", new ParseUUIDPipe()) labRoomUuid: string
  ) {
    return this.labRoomService.getLabRoom(request.user, labRoomUuid);
  }

  @Post()
  createLabRoom(
    @Request() request: any,
    @Body() createLabRoomDto: CreateLabRoomDto
  ) {
    return this.labRoomService.createLabRoom(request.user, createLabRoomDto);
  }

  @Put(":id")
  updateLabRoom(
    @Request() request: any,
    @Param("id", new ParseUUIDPipe()) labRoomUuid: string,
    @Body() updateLabRoomDto: UpdateLabRoomDto
  ) {
    return this.labRoomService.updateLabRoom(
      request.user,
      labRoomUuid,
      updateLabRoomDto
    );
  }

  @Put(":id/restore")
  restoreLabRoom(
    @Request() request: any,
    @Param("id", new ParseUUIDPipe()) labRoomUuid: string
  ) {
    return this.labRoomService.restoreLabRoom(request.user, labRoomUuid);
  }

  @Delete(":id")
  deleteLabRoom(
    @Request() request: any,
    @Param("id", new ParseUUIDPipe()) labRoomUuid: string
  ) {
    return this.labRoomService.deleteLabRoom(request.user, labRoomUuid);
  }
}
