import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentBankService } from "./payment-bank.service";
import { PaymentBankController } from "./payment-bank.controller";
import { PaymentBank } from "@entities/payment-bank.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentBank
    ])
  ],
  controllers: [PaymentBankController],
  providers: [PaymentBankService],
})
export class PaymentBankModule {}
