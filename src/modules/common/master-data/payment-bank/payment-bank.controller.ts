import {
  Get,
  Param,
  Query,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  Post,
  Body,
  Request,
} from "@nestjs/common";
import { PaymentBankService } from "./payment-bank.service";
import { RoleEnum } from "@common/enums/role.enum";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/role.decorator";

@Roles(
  RoleEnum.ADMIN_CLINIC,
  RoleEnum.SUPER_ADMIN,
  RoleEnum.SUPER_ADMIN_EXECUTIVE,
  RoleEnum.SUPER_ADMIN_INVESTOR,
  RoleEnum.SUPER_ADMIN_OPS
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("master-data/payment-bank")
export class PaymentBankController {
  constructor(private readonly paymentBankService: PaymentBankService) {}

  @Get()
  getPaymentBanks() {
    return this.paymentBankService.getPaymentBanks();
  }
}
