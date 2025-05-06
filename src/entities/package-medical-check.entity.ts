import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PackageMedicalCheckDetail } from "./package-medical-check-detail.entity";
import { EStatusData } from "@common/enums/general.enum";
import { ClinicPackage } from "./clinic-package.entity";
import { Clinic } from "./clinic.entity";
import { MedicalPackageCertificate } from "./medical-package-certificate.entity";
import { CertificateTypes } from "./certificate-type.entity";

@Entity({
  name: "package_medical_check",
})
export class PackageMedicalCheck {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ nullable: false, type: "varchar", length: "100" })
  name!: string;

  @Column({ nullable: false, type: "text" })
  description!: string;

  @Column({ nullable: true, type: "varchar", length: "100" })
  price?: string;

  @Column({ nullable: false, type: "enum", enum: EStatusData })
  status!: string;

  @Column({ name: "clinic_id", nullable: false, type: "bigint" })
  clinicId!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @OneToMany(
    () => PackageMedicalCheckDetail,
    (packageMedicalCheckDetail) => packageMedicalCheckDetail.packageMedicalCheck
  )
  packageMedicalCheckDetail!: PackageMedicalCheckDetail[];

  @OneToMany(() => ClinicPackage, (clinicPackage) => clinicPackage.package)
  clinicPackages: ClinicPackage[];

  @OneToOne(() => Clinic)
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;

  @OneToMany(
    () => MedicalPackageCertificate,
    (medicalPackageCertificate) => medicalPackageCertificate.package
  )
  medicalPackageCertificate: MedicalPackageCertificate[];
}
