import { Module } from "@nestjs/common";
import { Order } from "@entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalCheck } from "@entities/medical-check.entity";
import { LaboratoryResult } from "@entities/laboratory-result.entity";
import { MedicalCheckResultService } from "./medical-check-result.service";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { MedicalCheckResultController } from "./medical-check-result.controller";
import { PhysicalExaminationResult } from "@entities/physical-examination-result.entity";
import { MedicalCheckModule } from "@modules/patient/medical-check/medical-check.module";
import { MedicalCheckResults } from "@entities/medical-check-results.entity";
import { Attachments } from "@entities/attachment.entity";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { AuthModule } from "@modules/common/auth/auth.module";
import { Ecertificate } from "@entities/ecertificate.entity";
import { HandoverCertificate } from "@entities/handover-certificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      MedicalCheck,
      LaboratoryResult,
      AccountClinicDetail,
      PhysicalExaminationResult,
      MedicalCheckResults,
      Attachments,
      Ecertificate,
      HandoverCertificate,
    ]),
    MiddlewareS3Module,
    MedicalCheckModule,
    AuthModule
  ],
  controllers: [MedicalCheckResultController],
  providers: [MedicalCheckResultService],
  exports: [MedicalCheckResultService],
})
export class MedicalCheckResultModule {}
