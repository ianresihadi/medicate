import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MedicalPackageCertificate } from "./medical-package-certificate.entity";

@Entity({
  name: "certificate_types",
})
export class CertificateTypes {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ nullable: false, type: "varchar", length: "100" })
  name!: string;

  @Column({ nullable: true, type: "varchar", length: "100" })
  price?: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @OneToMany(
    () => MedicalPackageCertificate,
    (medicalPackageCertificate) => medicalPackageCertificate.certificateType
  )
  medicalPackageCertificate: MedicalPackageCertificate[];
}
