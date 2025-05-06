import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThirdPartyCompanyService } from "./third-party-company.service";
import { ThirdPartyCompany } from "@entities/third-party-company.entity";
import { ThirdPartyCompanyController } from "./third-party-company.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ThirdPartyCompany])],
  controllers: [ThirdPartyCompanyController],
  providers: [ThirdPartyCompanyService],
})
export class ThirdPartyCompanyModule {}
