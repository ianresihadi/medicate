import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClinicService } from "../clinic/clinic.service";
import { Clinic } from "@entities/clinic.entity";
import { ClinicController } from "./clinic.controller";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { PackageService } from "../package/package.service";
import { Account } from "@entities/account.entity";
import { Attachments } from "@entities/attachment.entity";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { ClinicPackage } from "@entities/clinic-package.entity";
import { MedicalPackageCertificate } from "@entities/medical-package-certificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clinic,
      PackageMedicalCheck,
      Account,
      Attachments,
      ClinicPackage,
      MedicalPackageCertificate,
    ]),
    MiddlewareS3Module,
  ],
  controllers: [ClinicController],
  providers: [ClinicService, PackageService],
})
export class ClinicModule {}
