import { Module } from "@nestjs/common";
import { PDFConfig } from "@config/pdf.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PDFModule } from "@t00nday/nestjs-pdf";
import { MedicalCheck } from "@entities/medical-check.entity";
import { MedicalCheckService } from "./medical-check.service";
import { MedicalCheckController } from "./medical-check.controller";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { Order } from "@entities/order.entity";
import { Attachments } from "@entities/attachment.entity";
import { OrderReceipt } from "@entities/order-receipt.entity";
import { Clinic } from "@entities/clinic.entity";
import { ClinicTokenHistory } from "@entities/clinic-token-history.entity";
import { PaymentMethods } from "@entities/payment-methods.entity";
import { CertificateTypes } from "@entities/certificate-type.entity";
import { PaymentBank } from "@entities/payment-bank.entity";
import { PaymentOrder } from "@entities/payment-order.entity";
import { XenditConfigModule } from "@config/xendit/config.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalCheck,
      AccountClinicDetail,
      Order,
      Attachments,
      OrderReceipt,
      Clinic,
      ClinicTokenHistory,
      PaymentMethods,
      CertificateTypes,
      PaymentBank,
      PaymentOrder,
    ]),
    PDFModule.registerAsync({
      useClass: PDFConfig,
    }),
    XenditConfigModule
  ],
  controllers: [MedicalCheckController],
  providers: [MedicalCheckService],
})
export class MedicalCheckModule {}
