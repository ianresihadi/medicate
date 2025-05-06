import { Module } from "@nestjs/common";
import { Order } from "@entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabRoom } from "@entities/lab-room.entity";
import { RegistrationService } from "./registration.service";
import { MedicalCheck } from "@entities/medical-check.entity";
import { RegistrationController } from "./registration.controller";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { OrderReceipt } from "@entities/order-receipt.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      LabRoom,
      MedicalCheck,
      AccountClinicDetail,
      OrderReceipt,
    ]),
    MiddlewareS3Module,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}
