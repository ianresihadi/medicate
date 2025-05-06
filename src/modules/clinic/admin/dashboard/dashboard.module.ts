import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { MedicalCheck } from "@entities/medical-check.entity";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";
import { PatientClinic } from "@entities/patient-clinic.entity";
import { Order } from "@entities/order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MedicalCheck, AccountClinicDetail, PatientClinic, Order])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
