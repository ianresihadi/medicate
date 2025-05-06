import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "@entities/patient.entity";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { MedicalCheck } from "@entities/medical-check.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Patient, MedicalCheck])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
