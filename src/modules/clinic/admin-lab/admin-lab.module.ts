import { Module } from "@nestjs/common";
import { DashboardModule } from "./dashboard/dashboard.module";
import { QueuePatientModule } from "./queue-patient/queue-patient.module";
import { MedicalCheckResultModule } from "./medical-check-result/medical-check-result.module";

@Module({
  imports: [MedicalCheckResultModule, QueuePatientModule, DashboardModule],
})
export class AdminLabModule {}
