import {
  Column,
  Entity,
  ManyToOne,
  Generated,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PackageMedicalCheck } from "./package-medical-check.entity";
import { MedicalCheckComponent } from "./medical-check-component.entity";

@Entity({
  name: "package_medical_check_details",
})
export class PackageMedicalCheckDetail {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({
    name: "medical_check_component_id",
    nullable: false,
    type: "bigint",
  })
  medicalCheckComponentId!: number;

  @Column({ name: "package_medical_check_id", nullable: false, type: "bigint" })
  packageMedicalCheckId!: number;

  @Column({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @Column({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @ManyToOne(() => MedicalCheckComponent)
  @JoinColumn({ name: "medical_check_component_id" })
  medicalCheckComponent!: MedicalCheckComponent;

  @ManyToOne(() => PackageMedicalCheck)
  @JoinColumn({ name: "package_medical_check_id" })
  packageMedicalCheck!: PackageMedicalCheck;
}
