import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { PaymentMethodsService } from "../services/payment-methods.service";
import { Roles } from "@common/decorators/role.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS,
  RoleEnum.ADMIN_CLINIC
)
@Controller("master-data/payment-method")
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  getAll() {
    return this.paymentMethodsService.getList();
  }
}
