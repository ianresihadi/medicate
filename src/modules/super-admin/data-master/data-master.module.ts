import { Module } from "@nestjs/common";
import { DmClinicController } from "./controllers/dm-clinic.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clinic } from "@entities/clinic.entity";
import { PackageMedicalCheck } from "@entities/package-medical-check.entity";
import { ClinicService } from "@modules/common/master-data/clinic/clinic.service";
import { PackageService } from "@modules/common/master-data/package/package.service";
import { DmConsulateController } from "./controllers/dm-consulate.controller";
import { DmConsulateService } from "./services/dm-consulate.service";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { UsermanagementController } from "./controllers/user-management.controller";
import { PatientController } from "./controllers/patient.controller";
import { PatientService } from "./services/patient.service";
import { UsermanagementService } from "./services/user-management.service";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { Account } from "@entities/account.entity";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";
import { Patient } from "@entities/patient.entity";
import { Attachments } from "@entities/attachment.entity";
import { MiddlewareS3Module } from "@modules/middleware/s3/middleware.s3.module";
import { ClinicPackage } from "@entities/clinic-package.entity";
import { PaymentMethodsController } from "./controllers/payment-methods.controller";
import { PaymentMethodsService } from "./services/payment-methods.service";
import { PaymentMethods } from "@entities/payment-methods.entity";
import { Agent } from "@entities/agent.entity";
import { AgentController } from "./controllers/agent.controller";
import { AgentService } from "./services/agent.service";
import { MedicalPackageCertificateController } from "./controllers/medical-package-certificate.controller";
import { MedicalPackageCertificateService } from "./services/medical-package-certificate.service";
import { MedicalPackageCertificate } from "@entities/medical-package-certificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clinic,
      PackageMedicalCheck,
      ThirdPartyCompany,
      AccountClinicDetail,
      Account,
      AccountThirdPartyCompanyDetail,
      Patient,
      Attachments,
      ClinicPackage,
      PaymentMethods,
      Agent,
      MedicalPackageCertificate,
    ]),
    MiddlewareS3Module,
  ],
  controllers: [
    DmClinicController,
    DmConsulateController,
    UsermanagementController,
    PatientController,
    PaymentMethodsController,
    AgentController,
    MedicalPackageCertificateController,
  ],
  providers: [
    ClinicService,
    PackageService,
    DmConsulateService,
    UsermanagementService,
    PatientService,
    PaymentMethodsService,
    AgentService,
    MedicalPackageCertificateService,
  ],
})
export class DataMasterModule {}
