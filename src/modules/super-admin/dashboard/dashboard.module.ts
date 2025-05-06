import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clinic } from "@entities/clinic.entity";
import { ClinicTokenHistory } from "@entities/clinic-token-history.entity";
import { Patient } from "@entities/patient.entity";
import { Order } from "@entities/order.entity";
import { MedicalCheckResults } from "@entities/medical-check-results.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Clinic,
      ClinicTokenHistory,
      Order,
      MedicalCheckResults,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
