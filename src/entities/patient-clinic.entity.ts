import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Clinic } from "./clinic.entity";
import { Patient } from "./patient.entity";

@Entity({
  name: "patient_clinic",
})
export class PatientClinic {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ name: "clinic_id", nullable: false, type: "bigint" })
  clinicId!: number;

  @Column({ name: "patient_id", nullable: false, type: "bigint" })
  patientId!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: "clinic_id" })
  clinic: Clinic;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: "patient_id" })
  patient: Patient;
}
