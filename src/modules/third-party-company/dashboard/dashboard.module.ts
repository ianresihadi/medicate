import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { MedicalCheck } from "@entities/medical-check.entity";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";
import { Order } from "@entities/order.entity";
import { MedicalCheckResults } from "@entities/medical-check-results.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, MedicalCheckResults]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
