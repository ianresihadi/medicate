import { Module } from "@nestjs/common";
import { PDFConfig } from "@config/pdf.config";
import { PDFModule } from "@t00nday/nestjs-pdf";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "@entities/patient.entity";
import { OrderDetail } from "@entities/order-detail.entity";
import { MedicalCheck } from "@entities/medical-check.entity";
import { MedicalCheckService } from "./medical-check.service";
import { LaboratoryResult } from "@entities/laboratory-result.entity";
import { MedicalCheckController } from "./medical-check.controller";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { MedicalCheckComponent } from "@entities/medical-check-component.entity";
import { PackageMedicalCheckDetail } from "@entities/package-medical-check-detail.entity";
import { PhysicalExaminationResult } from "@entities/physical-examination-result.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      OrderDetail,
      MedicalCheck,
      LaboratoryResult,
      PackageMedicalCheck,
      MedicalCheckComponent,
      PackageMedicalCheckDetail,
      PhysicalExaminationResult,
    ]),
    PDFModule.registerAsync({
      useClass: PDFConfig,
    }),
  ],
  controllers: [MedicalCheckController],
  providers: [MedicalCheckService],
  exports: [MedicalCheckService]
})
export class MedicalCheckModule {}
