import { Module } from "@nestjs/common";
import { LabRoomModule } from "./lab-room/lab-room.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { RegistrationModule } from "./registration/registration.module";
import { MedicalCheckModule } from "./medical-check/medical-check.module";
import { HandoverCertificateModule } from "./handover-certificate/handover-certificate.module";

@Module({
  imports: [
    LabRoomModule,
    DashboardModule,
    RegistrationModule,
    MedicalCheckModule,
    HandoverCertificateModule,
  ],
})
export class AdminModule {}
