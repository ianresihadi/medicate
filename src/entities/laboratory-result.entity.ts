import {
  Column,
  Entity,
  OneToOne,
  Generated,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MedicalCheck } from "./medical-check.entity";

@Entity({
  name: "laboratory_results",
})
export class LaboratoryResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "medical_check_id", nullable: false, type: "bigint" })
  medicalCheckId!: number;

  @Column({ nullable: false, type: "varchar", length: "50" })
  wbc!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  rbc!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  hgb!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  hct!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  mcv!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  mch!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  mchc!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  plt!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  colour!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  clarity!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  ph!: string;

  @Column({
    name: "sp_gravity",
    nullable: false,
    type: "varchar",
    length: "50",
  })
  spGravity!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  glucose!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  bilirubin!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  urobilinogen!: string;

  @Column({ nullable: false, type: "varchar", length: "50" })
  blood!: string;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToOne(() => MedicalCheck, (medicalCheck) => medicalCheck.laboratoryResult)
  @JoinColumn({ name: "medical_check_id" })
  medicalCheck!: MedicalCheck;
}
