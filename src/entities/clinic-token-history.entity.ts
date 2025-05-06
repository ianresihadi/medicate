import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ETokenType } from "@common/enums/general.enum";
import { Clinic } from "./clinic.entity";
import { Account } from "./account.entity";

@Entity({
  name: "clinic_token_history",
})
export class ClinicTokenHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "clinic_id", nullable: false, type: "integer" })
  clinicId!: number;
 
  @Column({ name: "created_by", nullable: false, type: "integer" })
  createdById!: number;

  @Column({ nullable: false, type: "enum", enum: ETokenType })
  type!: string;

  @Column({ nullable: false, type: "decimal", precision: 18, scale: 2 })
  amount!: number;

  @Column({
    name: "balance_before",
    nullable: false,
    type: "decimal",
    precision: 18,
    scale: 2,
  })
  balanceBefore!: number;

  @Column({
    name: "balance_after",
    nullable: false,
    type: "decimal",
    precision: 18,
    scale: 2,
  })
  balanceAfter!: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: "clinic_id" })
  clinic!: Clinic;
 
  @ManyToOne(() => Account)
  @JoinColumn({ name: "created_by" })
  cratedBy!: Account;
}
