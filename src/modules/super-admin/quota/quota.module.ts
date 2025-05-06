import { Module } from "@nestjs/common";
import { QuotaService } from "./quota.service";
import { QuotaController } from "./quota.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clinic } from "@entities/clinic.entity";
import { ClinicTokenHistory } from "@entities/clinic-token-history.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Clinic, ClinicTokenHistory])],
  controllers: [QuotaController],
  providers: [QuotaService],
  exports: [QuotaService],
})
export class QuotaModule {}
