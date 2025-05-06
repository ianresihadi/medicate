import { Module } from "@nestjs/common";
import { Order } from "@entities/order.entity";
import { OrderService } from "./order.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "@entities/patient.entity";
import { OrderController } from "./order.controller";
import { OrderDetail } from "@entities/order-detail.entity";
import { MedicalCheck } from "@entities/medical-check.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, Patient, MedicalCheck]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
