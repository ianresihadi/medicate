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
import { EMCUAttachmentType } from "@common/enums/general.enum";
import { MedicalCheck } from "./medical-check.entity";

@Entity({
  name: "medical_check_attachment",
})
export class MedicalCheckAttachment {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ name: "medical_check_id", nullable: false, type: "bigint" })
  medicalCheckId!: number;

  @Column({
    nullable: false,
    type: "enum",
    enum: EMCUAttachmentType,
  })
  type!: string;

  @Column({
    name: "content_type",
    nullable: false,
    type: "varchar",
    length: "50",
  })
  contentType!: string;

  @Column({
    nullable: false,
    type: "varchar",
    length: "100",
  })
  path!: string;

  @Column({
    nullable: false,
    type: "int",
  })
  size!: number;

  @Column({
    nullable: false,
    type: "varchar",
    length: "100",
  })
  filename!: number;

  @Column({
    name: "original_filename",
    nullable: false,
    type: "varchar",
    length: "255",
  })
  originalFilename!: number;

  @CreateDateColumn({ name: "created_at", nullable: false, type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, type: "timestamp" })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, type: "timestamp" })
  deletedAt?: Date;

  @ManyToOne(() => MedicalCheck)
  @JoinColumn({ name: "medical_check_id" })
  medicalCheck: MedicalCheck;
}
