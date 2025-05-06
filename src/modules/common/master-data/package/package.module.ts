import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PackageService } from "./package.service";
import { Module } from "@nestjs/common";
import { PackageController } from "./package.controller";
import { Clinic } from "@entities/clinic.entity";
import { ClinicPackage } from "@entities/clinic-package.entity";
import { MedicalPackageCertificate } from "@entities/medical-package-certificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PackageMedicalCheck,
      Clinic,
      ClinicPackage,
      MedicalPackageCertificate,
    ]),
  ],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}
