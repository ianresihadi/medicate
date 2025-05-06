import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PatientService } from "./patient.service";
import { Patient } from "@entities/patient.entity";
import { PatientController } from "./patient.controller";
import { PatientClinic } from "@entities/patient-clinic.entity";
import { Clinic } from "@entities/clinic.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Patient, PatientClinic, Clinic])],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
