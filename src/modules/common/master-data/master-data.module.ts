import { Module } from "@nestjs/common";
import { ClinicPackageModule } from "./clinic-package/clinic-package.module";
import { PatientModule } from "./patient/patient.module";
import { UploadFileModule } from "./upload-file/upload-file.module";
import { ThirdPartyCompanyModule } from "./third-party-company/third-party-company.module";
import { PackageModule } from "./package/package.module";
import { CertificateTypesModule } from "./certificate-types/certificate-types.module";
import { PaymentBankModule } from "./payment-bank/payment-bank.module";
import { ClinicModule } from "@modules/clinic/clinic.module";

@Module({
  imports: [
    ClinicModule,
    PatientModule,
    UploadFileModule,
    ThirdPartyCompanyModule,
    PackageModule,
    CertificateTypesModule,
    PaymentBankModule,
    ClinicPackageModule
  ],
})
export class MasterDataModule {}
