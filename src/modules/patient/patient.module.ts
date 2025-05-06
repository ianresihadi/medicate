import { Module } from "@nestjs/common";
import { OrderModule } from "./order/order.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { MedicalCheckModule } from "./medical-check/medical-check.module";

@Module({
  imports: [MedicalCheckModule, OrderModule, DashboardModule],
})
export class PatientModule {}
