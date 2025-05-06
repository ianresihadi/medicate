import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { PackageMedicalCheck } from "./package-medical-check.entity";
import { Clinic } from "./clinic.entity";

@Entity({
  name: "clinic_packages",
})
@Unique(["clinic", "package"])
export class ClinicPackage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: "clinic_id",
    nullable: true,
    type: "integer",
  })
  clinicId!: number;

  @Column({
    name: "package_medical_check_id",
    nullable: true,
    type: "integer",
  })
  packageMedicalCheckId!: number;

  @ManyToOne(() => Clinic, (clinic) => clinic.clinicPackages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "clinic_id" })
  clinic: Clinic;

  @ManyToOne(
    () => PackageMedicalCheck,
    (packageEntity) => packageEntity.clinicPackages,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "package_medical_check_id" })
  package: PackageMedicalCheck;
}
