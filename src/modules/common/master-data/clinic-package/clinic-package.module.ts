import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClinicPackageService } from "./clinic-package.service";
import { Clinic } from "@entities/clinic.entity";
import { ClinicPackage } from "@entities/clinic-package.entity";
import { ClinicPackageController } from "../clinic-package/clinic-package.controller";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clinic,
      PackageMedicalCheck,
      ClinicPackage
    ]),
    MiddlewareS3Module,
  ],
  controllers: [
    ClinicPackageController
  ],
  providers: [
    ClinicPackageService
  ],
})
export class ClinicPackageModule {}
