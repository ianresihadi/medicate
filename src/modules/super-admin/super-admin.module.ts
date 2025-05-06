import { Module } from "@nestjs/common";
import { DataMasterModule } from "./data-master/data-master.module";
import { CertificateModule } from "./certificate/certificate.module";
import { MedicalCheckModule } from "./medical-check/medical-check.module";
import { QuotaModule } from "./quota/quota.module";
import { QuotaHistoryModule } from "./quota-history/quota-history.module";
import { DashboardModule } from './dashboard/dashboard.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [
    DataMasterModule,
    CertificateModule,
    MedicalCheckModule,
    QuotaModule,
    QuotaHistoryModule,
    DashboardModule,
    AccountModule,
  ],
})
export class SuperAdminModule {}
