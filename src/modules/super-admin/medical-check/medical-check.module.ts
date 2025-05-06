import { Module } from "@nestjs/common";
import { MedicalCheckService } from "./medical-check.service";
import { MedicalCheckController } from "./medical-check.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalCheck } from "@entities/medical-check.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MedicalCheck])],
  controllers: [MedicalCheckController],
  providers: [MedicalCheckService],
})
export class MedicalCheckModule {}
