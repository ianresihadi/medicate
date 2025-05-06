import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Patient } from "./patient.entity";
import { MedicalCheck } from "./medical-check.entity";
import { HandoverCertificate } from "./handover-certificate.entity";

@Entity({
  name: "ecertificate",
})
export class Ecertificate {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "medical_check_id", nullable: false, type: "bigint" })
  medicalCheckId!: number;

  @Column({ name: "patient_id", nullable: false, type: "bigint" })
  patientId!: number;

  @Column({ name: "file_key", nullable: false, type: "varchar", length: "255" })
  fileKey!: string;

  @Column({
    name: "file_key_v2",
    nullable: true,
    type: "varchar",
    length: "255",
  })
  fileKeyV2!: string;

  @Column({
    name: "trx_number",
    nullable: false,
    type: "varchar",
    length: "255",
  })
  trxNumber!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @Column({
    name: 'is_printed',
    type: 'boolean',
  })
  isPrinted!: boolean

  @ManyToOne(() => MedicalCheck)
  @JoinColumn({ name: "medical_check_id" })
  medicalCheck: MedicalCheck;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: "patient_id" })
  patient: Patient;

  @OneToOne(() => HandoverCertificate, (handoverCertificate) => handoverCertificate.certificate)
  handoverCertificate!: HandoverCertificate;
}
