import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QueuePatientService } from "./queue-patient.service";
import { MedicalCheck } from "@entities/medical-check.entity";
import { QueuePatientController } from "./queue-patient.controller";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { Order } from "@entities/order.entity";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalCheck, AccountClinicDetail, Order]),
    MiddlewareS3Module,
  ],
  controllers: [QueuePatientController],
  providers: [QueuePatientService],
})
export class QueuePatientModule {}
