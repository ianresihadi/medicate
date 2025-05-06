import { Module } from "@nestjs/common";
import { MedicalCheckService } from "./medical-check.service";
import { MedicalCheckController } from "./medical-check.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "@entities/patient.entity";
import { MedicalCheck } from "@entities/medical-check.entity";
import { Ecertificate } from "@entities/ecertificate.entity";

@Module({
  controllers: [MedicalCheckController],
  providers: [MedicalCheckService],
  imports: [TypeOrmModule.forFeature([Patient, MedicalCheck, Ecertificate])],
})
export class MedicalCheckModule {}
