import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EMCUStatusResult } from "@common/enums/general.enum";
import { MedicalCheck } from "./medical-check.entity";
import { Attachments } from "./attachment.entity";

@Entity({
  name: "medical_check_results",
})
export class MedicalCheckResults {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ nullable: false, type: "varchar", length: "36" })
  @Generated("uuid")
  uuid!: string;

  @Column({ name: "medical_check_id", nullable: false, type: "bigint" })
  medicalCheckId!: number;

  @Column({
    name: "lab_attachment",
    nullable: true,
    type: "bigint",
  })
  labAttachment!: number;

  @Column({
    name: "external_mcu_code",
    nullable: false,
    type: "varchar",
    length: "100",
  })
  externalMcuCode!: string;

  @Column({
    name: "date_of_issue",
    nullable: false,
    type: "date",
  })
  dateOfIssue!: Date;

  @Column({
    name: "status_mcu",
    nullable: false,
    type: "enum",
    enum: EMCUStatusResult,
  })
  statusMcu!: string;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @ManyToOne(() => MedicalCheck)
  @JoinColumn({ name: "medical_check_id" })
  medicalCheck: MedicalCheck;

  @OneToOne(() => Attachments)
  @JoinColumn({ name: "lab_attachment" })
  attachment?: Attachments;
}
