import { Module } from "@nestjs/common";
import { Order } from "@entities/order.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalCheck } from "@entities/medical-check.entity";
import { MedicalCheckService } from "./medical-check.service";
import { MedicalCheckController } from "./medical-check.controller";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { AccountThirdPartyCompanyDetail } from "@entities/account-third-party-company-detail.entity";
import { Ecertificate } from "@entities/ecertificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      MedicalCheck,
      ThirdPartyCompany,
      AccountThirdPartyCompanyDetail,
      Ecertificate
    ]),
  ],
  controllers: [MedicalCheckController],
  providers: [MedicalCheckService],
})
export class MedicalCheckModule {}
