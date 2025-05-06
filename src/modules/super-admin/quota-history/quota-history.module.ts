import { Module } from "@nestjs/common";
import { QuotaHistoryService } from "./quota-history.service";
import { QuotaHistoryController } from "./quota-history.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clinic } from "@entities/clinic.entity";
import { ClinicTokenHistory } from "@entities/clinic-token-history.entity";
import { QuotaModule } from "../quota/quota.module";

@Module({
  imports: [TypeOrmModule.forFeature([Clinic, ClinicTokenHistory]), QuotaModule],
  controllers: [QuotaHistoryController],
  providers: [QuotaHistoryService],
})
export class QuotaHistoryModule {}
