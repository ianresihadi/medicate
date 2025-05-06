import {
  Get,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { RoleEnum } from "@common/enums/role.enum";
import { AddToQueueDto } from "./dto/add-to-queue.dto";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";
import { RegistrationService } from "./registration.service";
import CreatePatientDto from "./dto/registration.dto";

@Roles(
  RoleEnum.ADMIN_CLINIC,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("clinic/registration")
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post("patient/registration")
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.registrationService.createPatient(createPatientDto);
  }

  @Get()
  getListRegistration(
    @Request() request: any,
    @Query("search") search: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10
  ) {
    return this.registrationService.getListRegistration(
      request.user,
      page,
      limit,
      search
    );
  }

  @Get("validation")
  checkRegistration(@Query("order_code") orderCode: string) {
    return this.registrationService.checkRegistration(orderCode);
  }

  @Get("validation-time")
  validateTime() {
    return this.registrationService.validateTime();
  }

  @Roles(
    RoleEnum.SUPER_ADMIN,
    RoleEnum.ADMIN_CLINIC,
    RoleEnum.CLINIC_VALIDATOR,
    RoleEnum.SUPER_ADMIN_EXECUTIVE,
    RoleEnum.SUPER_ADMIN_INVESTOR,
    RoleEnum.SUPER_ADMIN_OPS
  )
  @Get(":orderId")
  getDetailRegistration(
    @Param("orderId", new ParseUUIDPipe()) orderId: string
  ) {
    return this.registrationService.getDetailRegistration(orderId);
  }

  @Put("validation/:orderId/add-to-queue")
  addToQueue(
    @Param("orderId", new ParseUUIDPipe()) orderUuid: string,
    @Body() addToQueueDto: AddToQueueDto
  ) {
    return this.registrationService.addToQueue(orderUuid, addToQueueDto);
  }
}
