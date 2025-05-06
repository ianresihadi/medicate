import {
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Controller,
  ParseUUIDPipe,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { PayOrderDto } from "./dto/pay-order.dto";
import { RoleEnum } from "@common/enums/role.enum";
import { RolesGuard } from "@common/guards/roles.guard";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@common/decorators/role.decorator";

@ApiTags("Patient|Order")
@ApiBearerAuth("JwtAuth")
@UseGuards(JwtAuthGuard)
@Roles(RoleEnum.PATIENT, RoleEnum.ADMIN_CLINIC)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  getOrder(@Request() request: any) {
    return this.orderService.getOrder(request.user);
  }

  @Get(":id")
  getOrderDetail(
    @Request() request: any,
    @Param("id", new ParseUUIDPipe()) orderUuid: string
  ) {
    return this.orderService.getOrderDetail(request.user, orderUuid);
  }

  @Post("payment")
  payOrder(@Body() payOrderDto: PayOrderDto) {
    return this.orderService.payOrder(payOrderDto);
  }
}
