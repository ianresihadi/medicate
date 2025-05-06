import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PackageMedicalCheck } from "./package-medical-check.entity";
import { CertificateTypes } from "./certificate-type.entity";

@Entity({
  name: "medical_package_certificates",
})
export class MedicalPackageCertificate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: "certificate_id",
    nullable: false,
    type: "bigint",
  })
  certificateId!: number;

  @Column({
    name: "medical_package_id",
    nullable: false,
    type: "bigint",
  })
  medicalPackageId!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @ManyToOne(
    () => PackageMedicalCheck,
    (packageMedicalCheck) => packageMedicalCheck.medicalPackageCertificate,
    {
      onDelete: "RESTRICT",
    }
  )
  @JoinColumn({ name: "medical_package_id" })
  package: PackageMedicalCheck;

  @OneToOne(() => CertificateTypes)
  @JoinColumn({ name: "certificate_id" })
  certificateType!: CertificateTypes;
}
