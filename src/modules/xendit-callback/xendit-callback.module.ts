import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { XenditCallbackController } from "./controllers/xendit-callback.controller";
import { XenditCallbackService } from "./services/xendit-callback.service";
import { PaymentOrder } from "@entities/payment-order.entity";
import { OrderReceipt } from "@entities/order-receipt.entity";
import { Order } from "@entities/order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrder, OrderReceipt, Order])],
  controllers: [XenditCallbackController],
  providers: [XenditCallbackService],
})
export class XenditCallbackModule {}
