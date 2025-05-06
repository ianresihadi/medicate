import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Clinic } from "./clinic.entity";
import { Account } from "./account.entity";

@Entity({ name: "account_clinic_details" })
export class AccountClinicDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "account_id", nullable: false, type: "bigint" })
  accountId!: number;

  @Column({ name: "clinic_id", nullable: false, type: "bigint" })
  clinicId!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @ManyToOne(() => Account, (account) => account.accountClinic)
  @JoinColumn({ name: "account_id" })
  account: Account;

  @ManyToOne(() => Clinic, (clinic) => clinic.accountDetail)
  @JoinColumn({ name: "clinic_id" })
  clinic: Clinic;
}
