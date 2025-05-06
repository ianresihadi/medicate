import { Provinces } from "@entities/Provinces.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UtilsRegionController } from "./controllers/region.controller";
import { UtilsRegionService } from "./services/region.service";
import { Regencies } from "@entities/Regencies.entity";
import { Countries } from "@entities/Countries.entity";
import { UtilsCountriesController } from "./controllers/countries.controller";
import { UtilsCountriesService } from "./services/countries.service";

@Module({
  imports: [TypeOrmModule.forFeature([Provinces, Regencies, Countries])],
  controllers: [UtilsRegionController, UtilsCountriesController],
  providers: [UtilsRegionService, UtilsCountriesService],
})
export class UtilsModule {}
