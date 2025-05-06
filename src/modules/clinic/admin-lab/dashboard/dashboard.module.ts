import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { MedicalCheck } from "@entities/medical-check.entity";
import { AccountClinicDetail } from "@entities/account-clinic-detail.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MedicalCheck, AccountClinicDetail])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
