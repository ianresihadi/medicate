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
import { LabRoom } from "./lab-room.entity";
import { AccountClinicDetail } from "./account-clinic-detail.entity";
import { Provinces } from "./Provinces.entity";
import { Regencies } from "./Regencies.entity";
import { Attachments } from "./attachment.entity";
import { ClinicPackage } from "./clinic-package.entity";

@Entity({
  name: "clinics",
})
export class Clinic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ nullable: false, type: "varchar", length: "80" })
  name!: string;

  @Column({ nullable: false, type: "text" })
  address!: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: "255",
    name: "phone_number",
  })
  phoneNumber!: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: "20",
    name: "phone_number_display",
  })
  phoneNumberDisplay!: string;

  @Column({ nullable: true, type: "varchar", length: "100", name: "pic_name" })
  picName!: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: "100",
    name: "examining_doctor",
  })
  examiningDoctor!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "20",
    name: "clinic_code",
  })
  clinicCode!: string;

  @Column({
    nullable: false,
    type: "decimal",
    precision: 18,
    scale: 2,
  })
  token!: number;

  @Column({
    name: "province_id",
    nullable: false,
    type: "integer",
  })
  provinceId!: number;

  @Column({
    name: "regency_id",
    nullable: false,
    type: "integer",
  })
  regencyId!: number;

  @Column({ name: "pic_signature", nullable: false, type: "bigint" })
  picSignature?: number;
  @Column({
    name: "examining_doctor_signature",
    nullable: false,
    type: "bigint",
  })
  examiningDoctorSignature?: number;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt: Date | null;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @OneToMany(() => LabRoom, (labRooms) => labRooms.clinic)
  labRooms!: LabRoom[];

  @OneToMany(
    () => AccountClinicDetail,
    (accountClinicDetail) => accountClinicDetail.clinic
  )
  accountDetail: AccountClinicDetail[];

  @OneToOne(() => Provinces)
  @JoinColumn({ name: "province_id" })
  province?: Provinces;

  @OneToOne(() => Regencies)
  @JoinColumn({ name: "regency_id" })
  regency?: Regencies;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "pic_signature" })
  picSignatureFile?: Attachments;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "examining_doctor_signature" })
  examiningDoctorSignatureFile?: Attachments;

  @OneToMany(() => ClinicPackage, (clinicPackage) => clinicPackage.clinic, {
    cascade: true,
    eager: true,
  })
  clinicPackages: ClinicPackage[];
}
