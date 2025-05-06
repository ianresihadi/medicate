import {
  Column,
  Entity,
  OneToOne,
  Generated,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { Account } from "./account.entity";
import { GenderEnum } from "@common/enums/gender.enum";
import { Provinces } from "./Provinces.entity";
import { Regencies } from "./Regencies.entity";
import { PatientClinic } from "./patient-clinic.entity";

@Entity({
  name: "patients",
})
export class Patient {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({
    name: "patient_code",
    nullable: false,
    type: "varchar",
    length: "100",
  })
  patientCode!: string;

  @Column({
    name: "certificate_number",
    nullable: false,
    type: "varchar",
    length: "100",
  })
  certificateNumber!: string;

  @Column({
    name: "first_name",
    nullable: false,
    type: "varchar",
    length: "80",
  })
  firstName!: string;

  @Column({ name: "last_name", nullable: false, type: "varchar", length: "80" })
  lastName!: string;

  @Column({ nullable: true, type: "varchar", length: "255" })
  email!: string;

  @Column({
    name: "phone_number",
    nullable: true,
    type: "varchar",
    length: "255",
  })
  phoneNumber!: string;

  @Column({
    name: "phone_number_display",
    nullable: true,
    type: "varchar",
    length: "20",
  })
  phoneNumberDisplay!: string;

  @Column({ nullable: false, type: "enum", enum: GenderEnum })
  gender!: string;

  @Column({
    name: "identity_card_number",
    nullable: false,
    type: "char",
    length: "255",
  })
  identityCardNumber!: string;

  @Column({
    name: "identity_card_number_display",
    nullable: false,
    type: "char",
    length: "20",
  })
  identityCardNumberDisplay!: string;

  @Column({ name: "birth_date", nullable: false, type: "date" })
  birthDate!: Date;

  @Column({ nullable: false, type: "text" })
  address!: string;

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

  @Column({ nullable: false, type: "varchar", length: "20" })
  job!: string;

  @Column({
    name: "agent_name",
    nullable: true,
    type: "varchar",
    length: "255",
  })
  agentName!: string;

  @Column({
    name: "agent_address",
    nullable: true,
    type: "varchar",
    length: "255",
  })
  agentAddress!: string;

  @Column({
    name: "agent_phone_number",
    nullable: true,
    type: "varchar",
    length: "255",
  })
  agentPhoneNumber!: string;

  @Column({
    nullable: true,
    type: "varchar",
    length: "20",
    name: "agent_phone_number_display",
  })
  agentPhoneNumberDisplay!: string;

  @Column({
    name: "agent_email",
    nullable: true,
    type: "varchar",
    length: "255",
  })
  agentEmail!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @OneToOne(() => Provinces)
  @JoinColumn({ name: "province_id" })
  province!: Provinces;

  @OneToOne(() => Regencies)
  @JoinColumn({ name: "regency_id" })
  regency!: Regencies;

  @OneToMany(() => PatientClinic, (patientClinic) => patientClinic.patient)
  @JoinColumn({ name: "patient_id" })
  patientClinic?: PatientClinic;
}
