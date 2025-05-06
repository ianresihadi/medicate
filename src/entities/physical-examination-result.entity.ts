import {
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Generated,
} from "typeorm";
import { MedicalCheck } from "./medical-check.entity";

@Entity({
  name: "physical_examination_results",
})
export class PhysicalExaminationResult {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "medical_check_id", nullable: false, type: "bigint" })
  medicalCheckId!: number;

  @Column({
    name: "blood_pressure",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  bloodPressure!: string;

  @Column({
    name: "body_temperature",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  bodyTemperature!: string;

  @Column({ nullable: false, type: "varchar", length: "15" })
  respiratory!: string;

  @Column({ nullable: false, type: "varchar", length: "15" })
  height!: string;

  @Column({ nullable: false, type: "varchar", length: "15" })
  pulse!: string;

  @Column({
    name: "waist_circumference",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  waistCircumference!: string;

  @Column({
    name: "body_mass_index",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  bodyMassIndex!: string;

  @Column({
    name: "left_vision_with_glasses",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  leftVisionWithGlasses!: string;

  @Column({
    name: "left_vision_without_glasses",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  leftVisionWithoutGlasses!: string;

  @Column({
    name: "right_vision_with_glasses",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  rightVisionWithGlasses!: string;

  @Column({
    name: "right_vision_without_glasses",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  rightVisionWithoutGlasses!: string;

  @Column({
    name: "color_recognition",
    nullable: false,
    type: "varchar",
    length: "15",
  })
  colorRecognition!: string;

  @Column({ name: "medical_history", nullable: false, type: "text" })
  medicalHistory!: string;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToOne(
    () => MedicalCheck,
    (medicalCheck) => medicalCheck.physicalExaminationResult
  )
  @JoinColumn({ name: "medical_check_id" })
  medicalCheck!: MedicalCheck;
}
