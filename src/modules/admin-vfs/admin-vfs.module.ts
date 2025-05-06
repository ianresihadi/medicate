import { Module } from "@nestjs/common";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MedicalCheckModule } from "./medical-check/medical-check.module";
import { AccountModule } from './account/account.module';
import { MasterDataModule } from "./master-data/master-data.module";

@Module({
  imports: [AccountModule, DashboardModule, MedicalCheckModule, MasterDataModule],
})
export class AdminVfsModule {}
