import { Module } from "@nestjs/common";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MedicalCheckModule } from "./medical-check/medical-check.module";

@Module({
  imports: [MedicalCheckModule, DashboardModule],
})
export class ThirdPartyCompanyModule {}
