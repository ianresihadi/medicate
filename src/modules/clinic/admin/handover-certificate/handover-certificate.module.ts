import { Module } from "@nestjs/common";
import { Order } from "@entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabRoom } from "@entities/lab-room.entity";
import { HandoverCertificateService } from "./handover-certificate.service";
import { MedicalCheck } from "@entities/medical-check.entity";
import { HandoverCertificateController } from "./handover-certificate.controller";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { OrderReceipt } from "@entities/order-receipt.entity";
import { Attachments } from "@entities/attachment.entity";
import { Ecertificate } from "@entities/ecertificate.entity";
import { HandoverCertificate } from "@entities/handover-certificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attachments,
      Ecertificate,
      HandoverCertificate,
    ]),
  ],
  controllers: [HandoverCertificateController],
  providers: [HandoverCertificateService],
})
export class HandoverCertificateModule {}
